/**
 * Cliente server-side mínimo para PocketBase con superusuario.
 *
 * SOLO se usa desde Route Handlers (server). Nunca se envía la
 * X-API-Key / token de superusuario al navegador.
 *
 * Patrón "impersonate": tras validar al usuario contra Cédula 360
 * (server-to-server), creamos/enlazamos un registro `users` de Translate
 * y emitimos un token de sesión vía
 * `POST /api/collections/users/impersonate/{id}` (autenticado como
 * superusuario). El frontend guarda ese token igual que el login normal
 * (`pb.authStore.save(token, record)`).
 *
 * Credenciales del superusuario: SOLO en /root/.translate_secrets
 * (EnvironmentFile del servicio systemd). Jamás en git.
 */

const PB_URL = (
  process.env.POCKETBASE_URL ||
  process.env.NEXT_PUBLIC_POCKETBASE_URL ||
  'http://127.0.0.1:8094'
).replace(/\/$/, '');

const SU_EMAIL = process.env.PB_SUPERUSER_EMAIL || '';
const SU_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || '';

let cachedToken: string | null = null;

export interface PbUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  verified?: boolean;
  [k: string]: unknown;
}

async function superuserToken(forceRefresh = false): Promise<string> {
  if (cachedToken && !forceRefresh) return cachedToken;
  if (!SU_EMAIL || !SU_PASSWORD) {
    throw new Error('PocketBase superuser no configurado (PB_SUPERUSER_EMAIL/PASSWORD)');
  }
  const r = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: SU_EMAIL, password: SU_PASSWORD }),
    cache: 'no-store',
  });
  if (!r.ok) {
    throw new Error(`PocketBase superuser auth falló (HTTP ${r.status})`);
  }
  const data = await r.json();
  cachedToken = data?.token || null;
  if (!cachedToken) throw new Error('PocketBase no devolvió token de superusuario');
  return cachedToken;
}

async function firstUserByEmail(email: string, token: string): Promise<PbUser | null> {
  const filter = encodeURIComponent(`email="${email.replace(/"/g, '')}"`);
  const r = await fetch(
    `${PB_URL}/api/collections/users/records?perPage=1&filter=${filter}`,
    { headers: { Authorization: token }, cache: 'no-store' }
  );
  if (!r.ok) return null;
  const data = await r.json();
  const item = data?.items?.[0];
  return item ? (item as PbUser) : null;
}

function randomPassword(): string {
  // El usuario aliado jamás usa esta contraseña (entra por Cédula 360).
  const buf = new Uint8Array(24);
  crypto.getRandomValues(buf);
  const b64 = Buffer.from(buf).toString('base64url');
  return `${b64}aA1!`;
}

/**
 * Crea o enlaza un usuario de Translate a partir de la identidad
 * validada por Cédula 360, y emite un token de sesión vía impersonate.
 *
 * - Si el usuario ya existe: se reutiliza. NUNCA se escala su rol.
 * - Si no existe: se crea con rol normal ('viewer'), password aleatorio
 *   inutilizable, verified=true (validado server-to-server).
 * - Nunca se persiste la contraseña de Cédula 360.
 */
export async function upsertAndIssueToken(
  cu: { email?: string; name?: string; nombre?: string },
  fallbackEmail: string
): Promise<{ token: string; record: PbUser }> {
  const email = (cu.email || fallbackEmail || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new Error('Cédula 360 no devolvió un email válido');
  }
  const name = (cu.name || cu.nombre || email.split('@')[0] || '').trim().slice(0, 120);

  let token = await superuserToken();
  let user = await firstUserByEmail(email, token);

  if (!user) {
    const rnd = randomPassword();
    const createRes = await fetch(`${PB_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: rnd,
        passwordConfirm: rnd,
        name: name || email.split('@')[0],
        role: 'viewer',
        emailVisibility: false,
        verified: true,
      }),
      cache: 'no-store',
    });
    if (createRes.ok) {
      user = (await createRes.json()) as PbUser;
    } else {
      // Carrera: si se creó entre el lookup y el create, recuperarlo.
      user = await firstUserByEmail(email, token);
      if (!user) {
        const detail = (await createRes.text()).slice(0, 300);
        throw new Error(`No se pudo crear el usuario aliado: ${detail}`);
      }
    }
  }

  const sessionToken = await impersonate(user.id, token);
  return { token: sessionToken, record: user };
}

async function impersonate(userId: string, token: string): Promise<string> {
  let r = await fetch(`${PB_URL}/api/collections/users/impersonate/${userId}`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration: 604800 }), // 7 días
    cache: 'no-store',
  });
  if (r.status === 401 || r.status === 403) {
    // Token de superusuario expirado: reautenticar una vez.
    const fresh = await superuserToken(true);
    r = await fetch(`${PB_URL}/api/collections/users/impersonate/${userId}`, {
      method: 'POST',
      headers: { Authorization: fresh, 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: 604800 }),
      cache: 'no-store',
    });
  }
  if (!r.ok) {
    throw new Error(`Impersonate falló (HTTP ${r.status})`);
  }
  const data = await r.json();
  const t = data?.token || '';
  if (!t) throw new Error('Impersonate no devolvió token');
  return t;
}
