#!/bin/bash
# Arranque del frontend Next.js de TranslateGemma.
#
# Carga los secretos server-side de la alianza Cédula 360 desde
# /root/.translate_secrets (chmod 600, JAMÁS en git). El servicio
# systemd sólo carga EnvironmentFile=.env (sin secretos), así que
# los inyectamos aquí en runtime.
#
# El frontend usa proxies same-origin (/ollama, /pbproxy), por lo que
# NO se requieren NEXT_PUBLIC_OLLAMA_HOST / NEXT_PUBLIC_POCKETBASE_URL
# en el navegador. Lo único NEXT_PUBLIC_* relevante es la site key de
# reCAPTCHA, que se inlinea en build (ver webhook-translate-deploy.sh).
set -a
SECRETS_FILE="/root/.translate_secrets"
if [ -f "$SECRETS_FILE" ]; then
    # shellcheck disable=SC1090
    . "$SECRETS_FILE"
fi
set +a

cd /root/TranslateGemma-UI/frontend || exit 1
export NODE_ENV=production
export PORT=3003
exec npm run start
