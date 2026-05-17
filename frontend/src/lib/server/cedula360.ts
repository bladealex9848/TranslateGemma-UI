/**
 * Proxy server-to-server hacia la API REAL de Cédula 360 (alianza
 * "Continuar con Cédula 360").
 *
 * Pitfalls evitados:
 *  - Base URL :3081 (backend REAL). :9091 es un stub obsoleto que
 *    responde 200 sin autenticar y rompería todo silenciosamente.
 *    Default y override por env CEDULA360_API_BASE.
 *  - Rate-limit de Cédula 360: 10 req/min por IP (Express trust proxy=1).
 *    Translate llama desde el server, así que TODOS los aliados
 *    compartirían un bucket → 429. Por eso reenviamos SIEMPRE la IP
 *    real del usuario final vía X-Forwarded-For / X-Real-IP.
 *    Bypass opcional con CEDULA360_INTERNAL_TOKEN (header
 *    x-internal-cron-token).
 */

export const CEDULA360_API_BASE = (
  process.env.CEDULA360_API_BASE || 'http://localhost:3081'
).replace(/\/$/, '');

const CEDULA360_INTERNAL_TOKEN = (process.env.CEDULA360_INTERNAL_TOKEN || '').trim();

/** IP real del usuario final. Translate está detrás de Caddy, así que el
 *  request entrante ya trae x-forwarded-for; usamos su primer valor. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  if (xff) {
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || '';
}

function c360Headers(req: Request): Record<string, string> {
  const ip = clientIp(req);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (ip) {
    headers['X-Forwarded-For'] = ip;
    headers['X-Real-IP'] = ip;
  }
  if (CEDULA360_INTERNAL_TOKEN) {
    // Cédula 360 salta rate-limit Y recaptcha con este header.
    headers['x-internal-cron-token'] = CEDULA360_INTERNAL_TOKEN;
  }
  return headers;
}

export async function c360Post(
  path: string,
  payload: Record<string, unknown>,
  req: Request
): Promise<{ status: number; data: Record<string, unknown> }> {
  const url = `${CEDULA360_API_BASE}${path}`;
  let status = 502;
  let data: Record<string, unknown> = {};
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 20000);
    const r = await fetch(url, {
      method: 'POST',
      headers: c360Headers(req),
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(t);
    status = r.status;
    try {
      data = await r.json();
    } catch {
      const txt = await r.text().catch(() => '');
      data = { error: (txt || 'respuesta no-JSON de Cédula 360').slice(0, 300) };
    }
  } catch (e) {
    status = 502;
    data = { error: `No se pudo contactar Cédula 360: ${(e as Error).message}` };
  }
  return { status, data };
}

/**
 * Verificación reCAPTCHA v3 (claves de Cédula 360).
 * - threshold 0.3
 * - FAIL-OPEN: si falta token, falta secret, o falla la red → permitir
 *   (no bloquear el login si el JS de reCAPTCHA no cargó).
 */
export async function verifyRecaptcha(token: string | undefined, ip: string): Promise<boolean> {
  const secret = (process.env.RECAPTCHA_SECRET_KEY || '').trim();
  const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.3') || 0.3;
  if (!secret || !token) return true; // fail-open
  try {
    const params = new URLSearchParams({ secret, response: token });
    if (ip) params.set('remoteip', ip);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(t);
    if (!r.ok) return true; // fail-open
    const d = await r.json();
    if (d.success !== true) return true; // fail-open ante config inválida
    const score = typeof d.score === 'number' ? d.score : 1;
    return score >= minScore;
  } catch {
    return true; // fail-open ante error de red
  }
}
