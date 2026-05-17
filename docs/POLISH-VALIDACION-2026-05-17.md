# Polish + Validación exhaustiva — 2026-05-17

Pulido y validación integral de TranslateGemma en
`https://translate.cedula360.tech/` (rama `main`, deploy vía
`translate-webhook` con `git pull`). Aditivo: no rompe el traductor.

## 1. Estructura de rutas (final)

| Ruta | Qué es | Acceso |
|------|--------|--------|
| `/` | **Landing pública** del proyecto. Hero + features + "cómo funciona" + CTAs. | Público |
| `/traducir` | **Herramienta** de traducción (antes vivía en `/`). | Público (historial requiere login) |
| `/admin` | **Panel** admin. Sin sesión → modal login (normal + Cédula 360 + 2FA). RBAC viewer/admin. | Login |
| `/api/auth/cedula360` `/challenge` `/verify` | Alianza Cédula 360 (server-to-server contra `:3081` real). | — |
| `/ollama/[...path]` | Proxy same-origin → Ollama (`OLLAMA_HOST`). Whitelist `api/tags\|chat\|version`. | — |
| `/pbproxy/[...path]` | Proxy same-origin → PocketBase (`127.0.0.1:8094`). | — |

Componentes compartidos: `components/layout/MarketingHeader.tsx`
(landing, theme-aware, responsive, CTAs + UserMenu),
`components/layout/SiteFooter.tsx` (alianza + contacto
`info@cedula360.tech` + `cedula360.tech`). El traductor mantiene su
`Header.tsx` (ahora responsive, con enlace a `/`).

## 2. Por qué los proxies same-origin (sin tocar Caddy/DNS)

- **Ollama**: el navegador no puede hablar directo (`http://` desde
  página `https://` = mixed-content; host privado). Caddy no expone
  Ollama en el dominio. Solución: `/ollama/*` (mismo origen → Caddy
  enruta a Next.js 3003) → reenvío server-side a `OLLAMA_HOST`.
- **PocketBase**: el SDK corre en el navegador; `127.0.0.1:8094` no es
  alcanzable y la regla Caddy `/api/pb*` **no reescribe el prefijo**
  (PB recibiría `/api/pb/api/...` → 404). Solución: SDK con baseURL
  `/pbproxy` → handler Next.js → PB.
- **Secretos**: el `.service` sólo cargaba `EnvironmentFile=.env` (sin
  `PB_SUPERUSER_*`/`CEDULA360_*`/`RECAPTCHA_SECRET_KEY`). Se verificó
  con `/proc/<pid>/environ` que el proceso **no tenía** los secretos →
  la alianza Cédula 360 estaba **rota en producción**. Fix: `start.sh`
  hace `set -a; . /root/.translate_secrets; set +a` antes de arrancar
  (sobrevive `git pull`); el deploy script inlina
  `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` en build.

## 3. Checklist de validación (PASS/FAIL)

### Build / servicios

| Ítem | Resultado |
|------|-----------|
| `tsc --noEmit` | **PASS** (exit 0, sin errores) |
| `npm run build` (Next 16 Turbopack) | **PASS** (exit 0; 9 rutas, incl. `/ollama`, `/pbproxy`) |
| `translate-frontend.service` activo | **PASS** (active, Ready 60s) |
| `translate-pocketbase.service` activo | **PASS** (active 2+ semanas) |
| Secretos en el proceso (`/proc/<pid>/environ`) | **PASS** (`PB_SUPERUSER_*`, `CEDULA360_API_BASE`, `RECAPTCHA_SECRET_KEY`, `POCKETBASE_URL` presentes tras el fix) |

### API / Route handlers (curl, vía Caddy `--resolve :443:127.0.0.1`)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| 1 | `GET /` | 200 público | **PASS** 200 |
| 2 | `GET /traducir` | 200 | **PASS** 200 |
| 3 | `GET /admin` | 200 (gating cliente) | **PASS** 200 |
| 4 | `GET /pbproxy/api/health` | 200 "API is healthy" | **PASS** 200 |
| 5 | `GET /ollama/api/tags` | 200 + modelos (~12 KB) | **PASS** 200 |
| 6 | `POST /ollama/api/pull` | 403 ruta no permitida | **PASS** 403 |
| 7 | `POST /pbproxy/.../auth-with-password` creds malas | 400 | **PASS** 400 "Failed to authenticate" |
| 8 | `POST /api/auth/cedula360` bogus + `X-Forwarded-For: 203.0.113.9` | **401 con razón REAL de Cédula 360** | **PASS** `401 {"error":"Cédula 360: Credenciales inválidas (HTTP 401)"}` → prueba que pega al `:3081` real, NO al stub `:9091` |
| 9 | `POST /api/auth/cedula360` campos vacíos | 400 | **PASS** 400 |
| 10 | `POST /api/auth/cedula360/challenge` sesión falsa | 4xx limpio | **PASS** 410 "Sesión MFA expirada" |
| 11 | `POST /api/auth/cedula360/verify` sesión MFA falsa | 401 limpio | **PASS** 401 "Sesión MFA expirada" |
| 12 | `POST /api/auth/cedula360/verify` método inválido | 400 | **PASS** 400 "método no soportado" |

> Verificación del stub: `:9091` responde `200 {"status":"ignored"}`
> (peligroso); `:3081` responde `401 {"error":"Credenciales inválidas"}`.
> Los handlers usan `CEDULA360_API_BASE=http://localhost:3081` → correcto.

### Headless (Playwright chromium-1223, `MAP translate.cedula360.tech 127.0.0.1`)

| Vista / viewport | 0 errores consola | Sin overflow | Resultado |
|------------------|-------------------|--------------|-----------|
| Landing `/` — 1400px | sí | sí | **PASS** |
| Tool `/traducir` — 1400px | sí | sí | **PASS** |
| Admin `/admin` — 1400px | sí | sí | **PASS** |
| Landing `/` — 390px | sí | sí | **PASS** |
| Tool `/traducir` — 390px | sí | sí (tras fix header) | **PASS** |
| Admin `/admin` — 390px | sí | sí | **PASS** |
| Login modal + "Continuar con Cédula 360" + paso credenciales + error inline con razón real `:3081` | — | — | **PASS** (verificado tras fix `UserMenu`) |

> Notas:
> - `waitUntil:'networkidle'` no estabiliza porque el `Header` sondea
>   Ollama cada 30 s y, bajo la carga del VPS, esas peticiones cuelgan;
>   se validó con `domcontentloaded`. No es bug de la app.
> - Se detectó y **corrigió** un bug real: `UserMenu` quedaba atascado
>   en un placeholder `animate-pulse` con hidratación lenta (carga VPS
>   ~120-140), ocultando el CTA "Iniciar Sesión". Fix: el estado
>   deslogueado se renderiza siempre (SSR-safe); sólo el logueado
>   espera `mounted`. Re-validado: el botón aparece, abre el modal,
>   muestra "Continuar con Cédula 360" → paso credenciales → error
>   inline con la razón real de Cédula 360 (`:3081`).
> - Algunas corridas headless via Caddy/`--resolve` fallan con
>   `ERR_CONNECTION_REFUSED` transitorio por la saturación del VPS
>   (handshake TLS hambriento); las mismas vistas pasan directo a
>   `:3003`. Artefacto de entorno, no de la app.

### Traducción end-to-end (LLM)

| Ítem | Resultado |
|------|-----------|
| Proxy `/ollama/api/tags` sirve el catálogo | **PASS** (200, modelos) |
| Generación real (`translategemma:latest`, `gemma3:1b`) | **FAIL por infraestructura** — ver §4 |
| Degradación elegante de la UI ante LLM caído | **PASS** (proxy responde 502/timeout; `translateStream` tiene `onError`/`onComplete`; el estado `isTranslating` se libera; el header marca "Desconectado") |

## 4. Conocido / no resuelto (limitación de infraestructura, fuera del frontend)

**La generación LLM no responde en tiempo razonable.** Diagnóstico:

- Ollama vivo: `GET /api/tags` → 200 en ~4 s.
- `GET /api/ps` → **ningún modelo cargado**.
- `POST /api/chat` (`translategemma:latest` y `gemma3:1b`) → timeout
  (>90–180 s, terminado), incluso directo al backend Ollama (sin proxy).
- Causa raíz: **load average ~140** en el VPS y Ollama con
  `CPUQuota=600%` (`CPUQuotaPerSecUSec=6s`) por la política de
  hardening cloud-first post-incidente (ver `/root/CLAUDE.md`,
  `INCIDENTE-OLLAMA-CPU-2026-05-06.md`). Con esa saturación cualquier
  generación queda hambrienta de CPU.

Esto **no es un defecto del frontend**: el proxy es correcto (sirve
`/api/tags`), la UI degrada con elegancia y el flujo funciona en cuanto
el backend responde. **Follow-up del operador**: revisar la carga del
VPS / política de CPU de Ollama, o apuntar `OLLAMA_HOST` del servicio
a un endpoint cloud-first con capacidad para `translategemma`.

## 5. Follow-ups del operador

1. **Carga del VPS / Ollama** (§4): la traducción no rinde hasta
   resolver la saturación de CPU o reapuntar `OLLAMA_HOST`.
2. **`/root/.translate_secrets`**: mantener `chmod 600`, fuera de git.
   Si se rota `RECAPTCHA_SITE_KEY`/secret, el próximo deploy lo recoge
   (start.sh + deploy script ya lo cargan).
3. **PocketBase list rule de `users`**: el listado para admin usa el
   token del usuario; el CRUD completo sigue delegado a PocketBase
   Admin UI (por diseño). Endurecer reglas de colección si se requiere.
4. Reglas operativas Caddyfile **no tocadas** (instrucción explícita).
