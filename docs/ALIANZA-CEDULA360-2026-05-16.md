# Alianza "Continuar con Cédula 360" + capa admin — 2026-05-16

Transformación estilo Investep/parla360: TranslateGemma-UI pasa a ser una
plataforma en el subdominio `translate.cedula360.tech` con login en alianza
"Continuar con Cédula 360", manteniendo **PocketBase** como backend de
usuarios/sesiones (igual que parla360, NO se migró a MariaDB).

DNS + Caddy + redirección 301 los hizo el orquestador. Aquí sólo la capa
de aplicación.

---

## 1. Cómo autentica Translate

- **Stack**: Next.js 16 + React 19 + TS (`translate-frontend.service`, :3003).
  No tiene backend FastAPI; el backend es **PocketBase**
  (`translate-pocketbase.service`, `127.0.0.1:8094`, datos en
  `/root/translategemma-pocketbase/pb_data`).
- Login normal: SDK JS de PocketBase desde el frontend
  (`pb.collection('users').authWithPassword`) en `src/services/pocketbase.ts`
  + `src/components/AuthModal.tsx`. El token vive en `pb.authStore`.
- La alianza se implementó como **Route Handlers de Next.js** (no había
  superficie server previa), que sí pueden hablar server-to-server con
  Cédula 360 y con PocketBase usando el superusuario.

## 2. Endpoints (Route Handlers, Node runtime, sin sesión previa)

| Ruta | Función |
|------|---------|
| `POST /api/auth/cedula360` | email+password → `{token,user,record}` o `{ok:true,mfa_required:true,session_id,methods,email}`; credenciales malas → 401 con la razón real de Cédula 360 (429 se propaga tal cual). |
| `POST /api/auth/cedula360/challenge` | `{session_id,method}` → dispara OTP (email/sms/whatsapp/push). totp/backup_code no requieren challenge. |
| `POST /api/auth/cedula360/verify` | `{session_id,method,code}` → `{ok:true,token,user,record}`. |

Métodos 2FA: `totp|email_otp|sms_otp|whatsapp_otp|push|backup_code`.

Archivos:
- `frontend/src/lib/server/cedula360.ts` — proxy `:3081`, IP forwarding,
  reCAPTCHA verify.
- `frontend/src/lib/server/pb-admin.ts` — superuser auth + `users` upsert
  + impersonate.
- `frontend/src/app/api/auth/cedula360/{route,challenge/route,verify/route}.ts`
- `frontend/src/components/AuthModal.tsx` — botón + 2FA inline.
- `frontend/src/app/admin/page.tsx` — panel RBAC mínimo.
- `frontend/src/app/page.tsx`, `layout.tsx` — badge alianza + dominio.

### Pitfalls evitados
- **Base URL `:3081`** (backend REAL). `:9091` es un stub que responde
  `200 {"status":"ignored"}` sin autenticar y rompería todo en silencio.
- **Rate-limit Cédula 360**: 10 req/min por IP (Express trust proxy=1).
  Translate llama desde el server → todos compartirían un bucket.
  Se reenvía SIEMPRE la IP real del usuario final
  (`X-Forwarded-For`/`X-Real-IP`, primer valor del XFF entrante).
  Bypass opcional: `CEDULA360_INTERNAL_TOKEN` → header
  `x-internal-cron-token`.
- **Impersonate**: el token de sesión se emite con
  `POST {PB}/api/collections/users/impersonate/{id}` autenticado como
  superusuario (`_superusers/auth-with-password`). El usuario aliado se
  crea/enlaza con rol `viewer`, password aleatorio inutilizable,
  `verified:true`. Nunca se escala el rol de un usuario existente ni se
  guarda la contraseña de Cédula 360.

## 3. reCAPTCHA v3 (claves de Cédula 360)

- Site key (pública, sí va en build): `6Ldufr4sAAAAAEX6uLIrV3Uk4auM7zksyUvdeA-k`
- Secret: en `/root/.translate_secrets` / `frontend/.env.local`, **NO** en git.
- Umbral **0.3**, **fail-open** ante token/secret/red ausentes (no bloquea
  el login si el JS de reCAPTCHA no cargó).
- **Follow-up operador**: añadir `translate.cedula360.tech` a los dominios
  de esa key en la consola de Google reCAPTCHA.

## 4. Infra server-side (NO versionada)

- `/root/.translate_secrets` (chmod 600): `PB_SUPERUSER_EMAIL/PASSWORD`,
  `CEDULA360_API_BASE`, `RECAPTCHA_*`. Referencia de claves.
- `frontend/.env.local` (gitignored): Next.js lo lee en runtime para los
  Route Handlers (`POCKETBASE_URL`, `PB_SUPERUSER_*`, `CEDULA360_API_BASE`,
  `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`,
  `RECAPTCHA_MIN_SCORE`).
- Superusuario PocketBase `admin@translate.local`: su password se fijó
  server-side (`pocketbase superuser upsert`) para uso del proxy. Solo
  server-side; nunca llega al navegador.
- Colección `users`: se añadió campo `role` (text, opcional). Promover a
  un admin: cambiar `role=admin` desde la PocketBase Admin UI.
- `.env.example` (versionado) documenta las variables con valores vacíos.

## 5. Dominio

- Primario: `https://translate.cedula360.tech` (Caddy → :3003,
  `/api/pb*`→:8094, `/webhook*`→:3004).
- `translate.alexanderoviedofadul.dev` → **301** → nuevo dominio.
- Refs hardcodeadas actualizadas: `README.md`, `layout.tsx` (metadataBase),
  `.env`/`.env.example`/`frontend/.env.local`.

## 6. Despliegue / durabilidad

- Auto-deploy por webhook (`translate-webhook.service`, :3004) hace
  `git reset --hard`. **Todo el código de la alianza está commiteado** en
  la rama `main` del repo `bladealex9848/TranslateGemma-UI`.
- Config server-side (secretos, `.env.local`) NO está en git → sobrevive
  porque vive fuera del árbol reseteado / es gitignored.
- Build: `cd frontend && npm run build`; `systemctl restart
  translate-frontend`. PocketBase no se reinició salvo el schema change
  (campo `role`, aplicado vía API en caliente, sin downtime).

## 7. Validación (2026-05-16)

| Check | Resultado |
|-------|-----------|
| `tsc --noEmit` | OK (exit 0) |
| `npm run build` | OK, 3 rutas dinámicas + `/admin` |
| Servicios | `translate-frontend` + `translate-pocketbase` active; PB `/api/health` 200 |
| `POST /api/auth/cedula360` bogus + `X-Forwarded-For: 203.0.113.9` | **HTTP 401** `{"error":"Cédula 360: Credenciales inválidas (HTTP 401)"}` → confirma :3081 real (no stub :9091 que da 200) |
| Vía dominio (`--resolve ...:443:127.0.0.1`) | mismo 401 |
| challenge sesión falsa | 410 `Cédula 360: Sesión MFA expirada` |
| verify sesión falsa | 401 limpio |
| `https://translate.cedula360.tech/` | 200 |
| `translate.alexanderoviedofadul.dev/` | 301 → translate.cedula360.tech |
| Bundle build | contiene "Continuar con Cédula 360" |
| Endpoint sin sesión Translate | funciona (es un login) |

Sin credenciales reales de Cédula 360: solo se validó el cableado.
