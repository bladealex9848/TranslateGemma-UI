# Webhook y Deployment - TranslateGemma-UI

## Overview

TranslateGemma-UI utiliza **GitHub Webhooks** para despliegues automáticos. Cada push a la rama `main` activa un pipeline de deploy automático que actualiza la aplicación sin intervención manual.

## Arquitectura de Despliegue

```
┌─────────────┐      Push       ┌─────────────────────────────────┐
│   GitHub    │ ───────────────> │ webhook.translate.[domain].dev │
│ Repository  │                  │         (Caddy Proxy)          │
└─────────────┘                  └───────────────┬─────────────────┘
                                                  │
                                                  ▼
                                    ┌─────────────────────────────────┐
                                    │   Webhook Server (Node.js)      │
                                    │   Puerto: 3004                   │
                                    │   /root/scripts/webhook-server.js│
                                    └───────────────┬─────────────────┘
                                                    │
                                                    ▼
                                    ┌─────────────────────────────────┐
                                    │   Deploy Script                 │
                                    │   /root/scripts/...-deploy.sh    │
                                    └───────────────┬─────────────────┘
                                                    │
                                                    ▼
                    ┌───────────────────────────────────────────────────┐
                    │          Pipeline de Deploy                       │
                    │  1. git pull origin main                         │
                    │  2. cd frontend && npm install --production      │
                    │  3. npm run build                                │
                    │  4. systemctl restart translate-frontend         │
                    └───────────────────────────┬───────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────────────────────┐
                                    │   Frontend Service              │
                                    │   Puerto: 3003                   │
                                    │   Next.js 16.1.3                 │
                                    └─────────────────────────────────┘
```

## Configuración del Webhook Server

### Archivo: `/etc/systemd/system/translate-webhook.service`

```ini
[Unit]
Description=TranslateGemma Webhook Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/scripts
Environment=NODE_ENV=production
Environment=WEBHOOK_SECRET=<tu_secret_aqui>
ExecStart=/usr/bin/node webhook-server.js
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal
SyslogIdentifier=translate-webhook

[Install]
WantedBy=multi-user.target
```

### Código: `/root/scripts/webhook-server.js`

```javascript
const http = require('http');
const { exec } = require('child_process');

const PORT = 3004;
const SECRET = process.env.WEBHOOK_SECRET || 'CHANGE_THIS_SECRET';

const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method not allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const signature = req.headers['x-hub-signature-256'];
        const event = req.headers['x-github-event'];

        console.log(`Received ${event} event`);

        if (event === 'push' || event === 'release') {
            exec('/root/scripts/webhook-translate-deploy.sh', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Deploy failed');
                    return;
                }
                console.log(`Stdout: ${stdout}`);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Deploy successful');
            });
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Event ignored');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});
```

## Script de Deploy

### Archivo: `/root/scripts/webhook-translate-deploy.sh`

```bash
#!/bin/bash

# Webhook para auto-deploy TranslateGemma-UI
# GitHub webhook endpoint

LOG_FILE="/var/log/translate-deploy.log"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Ir al directorio del proyecto
cd /root/TranslateGemma-UI || exit 1

# Hacer git pull
log "INFO: Pulling latest changes..."
git pull origin main

# Instalar dependencias si package-lock.json cambió
log "INFO: Installing dependencies..."
cd frontend
npm install --production

# Reconstruir frontend
log "INFO: Building frontend..."
npm run build

# Reiniciar servicio
log "INFO: Restarting service..."
systemctl restart translate-frontend

# Verificar que el servicio esté funcionando
sleep 5
if systemctl is-active --quiet translate-frontend; then
    log "SUCCESS: Deploy completed successfully"
    echo "Status: 200 OK"
else
    log "ERROR: Service failed to start"
    echo "Status: 500 Internal Server Error"
fi
```

## Configuración del Frontend Service

### Archivo: `/etc/systemd/system/translate-frontend.service`

```ini
[Unit]
Description=TranslateGemma Frontend - Next.js
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/TranslateGemma-UI/frontend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=translate-frontend

[Install]
WantedBy=multi-user.target
```

## Configuración de Caddy

### Archivo: `/etc/caddy/Caddyfile`

```caddyfile
# Frontend principal
translate.alexanderoviedofadul.dev {
    reverse_proxy 127.0.0.1:3003
}

# Webhook endpoint
webhook.translate.alexanderoviedofadul.dev {
    reverse_proxy 127.0.0.1:3004
}
```

## GitHub Webhook Configuration

### Configurar en GitHub Repository Settings:

1. **URL del Webhook**: `https://webhook.translate.alexanderoviedofadul.dev/`
2. **Content Type**: `application/json`
3. **Secret**: Configurar el mismo secret que en `WEBHOOK_SECRET`
4. **Eventos a escuchar**:
   - `push` (activa en cada push a main)
   - `release` (activa en nuevos releases)

### Configurar credenciales Git (para pull):

```bash
# Configurar token de GitHub como credencial
git remote set-url origin https://<TOKEN>@github.com/<usuario>/<repositorio>.git
```

## Comandos de Gestión

### Ver estado de servicios:

```bash
# Ver estado del webhook server
systemctl status translate-webhook.service

# Ver estado del frontend
systemctl status translate-frontend.service

# Ver logs del webhook
journalctl -u translate-webhook.service -f

# Ver logs del frontend
journalctl -u translate-frontend.service -f

# Ver logs de deploy
cat /var/log/translate-deploy.log
```

### Reiniciar servicios:

```bash
# Reiniciar webhook server
systemctl restart translate-webhook.service

# Reiniciar frontend
systemctl restart translate-frontend.service
```

### Ver puertos en uso:

```bash
netstat -tlnp | grep -E ':(3003|3004)'
```

## Estructura del Proyecto

```
/root/TranslateGemma-UI/
├── frontend/              # Código Next.js
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── package.json      # Dependencias
│   └── ...
├── docs/                 # Documentación
├── scripts/              # Scripts del proyecto
├── .env                  # Variables de entorno
└── README.md
```

## Solución de Problemas

### El webhook no recibe eventos:

1. **Verificar que el servicio esté corriendo**:
   ```bash
   systemctl status translate-webhook.service
   ```

2. **Verificar que el puerto esté escuchando**:
   ```bash
   netstat -tlnp | grep :3004
   ```

3. **Verificar la configuración de Caddy**:
   ```bash
   grep -A 2 "webhook.translate" /etc/caddy/Caddyfile
   ```

4. **Probar el webhook localmente**:
   ```bash
   curl -X POST http://localhost:3004/ \
     -H "Content-Type: application/json" \
     -H "X-GitHub-Event: push" \
     -d '{"ref":"refs/heads/main"}'
   ```

### El deploy falla:

1. **Verificar el log de deploy**:
   ```bash
   cat /var/log/translate-deploy.log
   ```

2. **Verificar que git funcione**:
   ```bash
   cd /root/TranslateGemma-UI
   git pull origin main
   ```

3. **Verificar que npm instale correctamente**:
   ```bash
   cd /root/TranslateGemma-UI/frontend
   npm install --production
   ```

4. **Verificar que el build sea exitoso**:
   ```bash
   cd /root/TranslateGemma-UI/frontend
   npm run build
   ```

### El frontend no inicia:

1. **Verificar que el puerto 3003 esté libre**:
   ```bash
   netstat -tlnp | grep :3003
   ```

2. **Verificar logs del frontend**:
   ```bash
   journalctl -u translate-frontend.service -n 50
   ```

3. **Iniciar manualmente para ver errores**:
   ```bash
   cd /root/TranslateGemma-UI/frontend
   npm run start
   ```

## Seguridad

### Recomendaciones:

1. **Cambiar el WEBHOOK_SECRET** por uno seguro y único
2. **Usar tokens de GitHub con permisos limitados** (solo repo)
3. **Rotar el token periódicamente**
4. **Monitorear los logs de deploy regularmente**
5. **Configurar firewall para limitar acceso al puerto 3004**

### Logs de auditoría:

```bash
# Ver todos los eventos de deploy
cat /var/log/translate-deploy.log

# Ver intentos de webhook
journalctl -u translate-webhook.service --since "today"
```

## Variables de Entorno

### Archivo: `/root/TranslateGemma-UI/.env`

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Application
NEXT_PUBLIC_APP_URL=https://translate.alexanderoviedofadul.dev

# PocketBase
NEXT_PUBLIC_POCKETBASE_URL=https://pocketbase.alexanderoviedofadul.dev

# Timeouts
OLLAMA_TIMEOUT=60000
```

## Resumen de Puertos

| Servicio | Puerto | URL Pública |
|----------|--------|-------------|
| Frontend (Next.js) | 3003 | translate.alexanderoviedofadul.dev |
| Webhook Server | 3004 | webhook.translate.alexanderoviedofadul.dev |
| Ollama | 11434 | ollama.alexanderoviedofadul.dev |
| PocketBase | 8090 | pocketbase.alexanderoviedofadul.dev |

## Checklist de Deploy

Antes de activar el webhook:

- [ ] Configurar WEBHOOK_SECRET en systemd
- [ ] Configurar el mismo secret en GitHub
- [ ] Verificar que el servicio webhook esté corriendo
- [ ] Verificar que el servicio frontend esté corriendo
- [ ] Configurar credenciales de Git
- [ ] Probar el webhook con un commit manual
- [ ] Verificar que el build sea exitoso
- [ ] Configurar Caddy para exponer los servicios
- [ ] Verificar que la URL pública sea accesible

## Contacto y Soporte

Para más información o problemas de deployment, consultar:
- Documentación del proyecto: `/root/TranslateGemma-UI/docs/`
- Systemd logs: `journalctl -u translate-*`
- Deploy logs: `/var/log/translate-deploy.log`
