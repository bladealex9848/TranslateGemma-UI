# Incidente: `ChunkLoadError` / CSS 500 en producción (2026-05-28)

**Dominio afectado**: `https://translate.cedula360.tech/`
**Severidad**: Alta (la app no cargaba en el navegador — pantalla rota)
**Estado**: Resuelto
**Servicio**: `translate-frontend.service` (Next.js 16.1.3, puerto 3003)

## Síntomas (consola del navegador)

```
Refused to apply style from '.../_next/static/chunks/30fe254653a4ceaf.css'
because its MIME type ('text/plain') is not a supported stylesheet MIME type...

GET .../_next/static/chunks/1a77ad6ad9130bdb.js net::ERR_ABORTED 500 (Internal Server Error)

Refused to execute script from '.../_next/static/chunks/1a77ad6ad9130bdb.js'
because its MIME type ('text/plain') is not executable...

Uncaught ChunkLoadError: Failed to load chunk /_next/static/chunks/1a77ad6ad9130bdb.js from module 64893
```

(Las advertencias de `woff2 preloaded but not used` son **benignas** y no forman parte del incidente.)

## Causa raíz

**Desincronización entre el `next-server` en memoria y el directorio `.next` en disco.**

1. El proceso `translate-frontend` arrancó el **17/05 a las 01:37** con un build A.
2. A las **02:28** se regeneró `.next` (build B) — un `npm run build` ejecutado **manualmente, fuera del flujo del webhook, sin reiniciar el servicio**.
3. El `next-server` siguió en memoria con el manifiesto del build A, sirviendo un HTML que referencia chunks (`1a77ad6ad9130bdb.js`, `30fe254653a4ceaf.css`) que el build B ya **sobrescribió/borró** en disco.
4. Al pedir esos chunks inexistentes, Next responde **500** y, al no resolverlos como assets estáticos, los entrega con MIME `text/plain` → de ahí el `ChunkLoadError` y los "Refused to apply style/execute script".

Algunos chunks JS coincidían por hash entre builds (mismo contenido), por eso el fallo era **parcial**: parte cargaba (200) y parte fallaba (500), confundiendo el diagnóstico.

### Verificación del diagnóstico

```bash
# El server referenciaba chunks que NO existían en disco:
cat .next/BUILD_ID                       # 1Liz1qhDl5z8UsODrzhst (build en disco)
ls .next/static/chunks/30fe254653a4ceaf.css   # No such file (el CSS en disco era 9f71ea629b0333a7.css)
curl -s -o /dev/null -w "%{http_code}\n" \
  http://127.0.0.1:3003/_next/static/chunks/1a77ad6ad9130bdb.js   # -> 500
```

## Solución aplicada

```bash
cd /root/TranslateGemma-UI/frontend
rm -rf .next                       # descartar build potencialmente incompleto
set -a; . /root/.translate_secrets; set +a   # inlinar NEXT_PUBLIC_* (reCAPTCHA)
NODE_ENV=production npm run build   # build limpio
systemctl restart translate-frontend   # el server carga el build de disco
```

### Verificación post-fix

Los 8 chunks referenciados por el HTML existen en disco y responden **200** con MIME correcto, tanto en local (`:3003`) como en producción vía Caddy:

```
200 application/javascript; charset=UTF-8  .../chunks/*.js
200 text/css; charset=UTF-8                .../chunks/9f71ea629b0333a7.css
home -> 200
```

> **Lado cliente**: tras el fix conviene un **hard refresh** (Ctrl+Shift+R) para descartar el HTML viejo cacheado en el navegador.

## Prevención

El script de deploy del webhook (`/root/scripts/webhook-translate-deploy.sh`, en el VPS,
no versionado en este repo) **ya** encadenaba `npm run build` + `systemctl restart`, por lo
que el flujo automático era correcto. El incidente nació de un `npm run build` **manual**
sin restart.

Refuerzo aplicado: el script de deploy ahora ejecuta `rm -rf .next` **antes** del build,
para que cada despliegue parta de un estado limpio y nunca queden chunks huérfanos:

```bash
# Limpiar build previo: evita chunks huérfanos y la desincronización
# server-en-memoria vs disco que provoca ChunkLoadError / CSS 500.
log "INFO: Cleaning previous build (.next)..."
rm -rf .next
```

### Regla operativa

- **Nunca** correr `npm run build` manual sin reiniciar el servicio después.
- Para desplegar, usar el webhook (build + restart encadenados) o, si se compila a mano,
  ejecutar inmediatamente `systemctl restart translate-frontend`.
- Es un patrón recurrente en este servicio (ver commit `9f71...`, "Resolve static assets
  loading and CSS 500 errors").
