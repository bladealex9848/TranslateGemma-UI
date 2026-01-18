# Guía de Despliegue en Producción

Esta guía explica cómo desplegar TranslateGemma-UI en un servidor VPS.

## Requisitos del Servidor

- **OS**: Ubuntu 22.04+ o Debian 12+
- **RAM**: Mínimo 8GB (16GB recomendado para modelos grandes)
- **Storage**: 20GB+ libres
- **Puertos**: 80, 443, 3000, 8090, 11434

## Despliegue Rápido

```bash
# Conectar a tu VPS
ssh root@tu-servidor.com

# Descargar y ejecutar script de despliegue
curl -fsSL https://raw.githubusercontent.com/bladealex9848/TranslateGemma-UI/main/scripts/deploy.sh | bash
```

## Despliegue Manual

### 1. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

### 2. Clonar Repositorio

```bash
git clone https://github.com/bladealex9848/TranslateGemma-UI.git /opt/translategemma-ui
cd /opt/translategemma-ui
```

### 3. Configurar Variables de Entorno

```bash
cat > frontend/.env.local << EOF
NEXT_PUBLIC_OLLAMA_HOST=http://ollama:11434
NEXT_PUBLIC_POCKETBASE_URL=http://pocketbase:8090
EOF
```

### 4. Iniciar Servicios

```bash
docker compose up -d
```

### 5. Descargar Modelo

```bash
docker compose exec ollama ollama pull translategemma:latest
```

## Configurar HTTPS con Caddy

### Instalar Caddy

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy
```

### Configurar Caddyfile

```bash
cat > /etc/caddy/Caddyfile << EOF
translate.tudominio.com {
    reverse_proxy localhost:3000
}

pb.translate.tudominio.com {
    reverse_proxy localhost:8090
}
EOF

systemctl reload caddy
```

## Configurar PocketBase

### 1. Crear Superusuario

```bash
docker compose exec pocketbase ./pocketbase superuser upsert admin@tudominio.com TuPasswordSeguro123!
```

### 2. Crear Colección translations

```bash
# Obtener token
TOKEN=$(curl -s -X POST http://localhost:8090/api/collections/_superusers/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@tudominio.com","password":"TuPasswordSeguro123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Crear colección
curl -s -X POST "http://localhost:8090/api/collections" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"translations","type":"base","fields":[{"name":"source_lang","type":"text","required":true},{"name":"target_lang","type":"text","required":true},{"name":"original_text","type":"text","required":true},{"name":"translated_text","type":"text","required":true},{"name":"model_used","type":"text"},{"name":"is_favorite","type":"bool"},{"name":"user_id","type":"text","required":true}],"listRule":"","viewRule":"","createRule":"","updateRule":"","deleteRule":""}'
```

## Verificar Despliegue

```bash
# Estado de los contenedores
docker compose ps

# Logs
docker compose logs -f

# Health checks
curl http://localhost:3000        # Frontend
curl http://localhost:8090/api/health  # PocketBase
curl http://localhost:11434/api/tags   # Ollama
```

## Mantenimiento

### Actualizar

```bash
cd /opt/translategemma-ui
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### Backup

```bash
# Backup de PocketBase
docker compose exec pocketbase ./pocketbase backup create

# Backup manual de datos
docker cp translategemma-ui-pocketbase-1:/pb_data ./backup_$(date +%Y%m%d)
```

### Reiniciar Servicios

```bash
docker compose restart
```

## Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │   Caddy   │  (HTTPS + Reverse Proxy)
                    │  :80/:443 │
                    └─────┬─────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
  ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
  │  Frontend │    │ PocketBase│    │  Ollama   │
  │   :3000   │    │   :8090   │    │  :11434   │
  │  Next.js  │    │  Auth+DB  │    │   LLM     │
  └───────────┘    └───────────┘    └───────────┘
```

## Troubleshooting

### Error: "Connection refused" en Ollama

```bash
# Verificar que Ollama esté corriendo
docker compose logs ollama

# Reiniciar solo Ollama
docker compose restart ollama
```

### Error: "Model not found"

```bash
# Descargar modelo manualmente
docker compose exec ollama ollama pull translategemma:latest
```

### Frontend no conecta a servicios

Verificar que las URLs en `.env.local` usen los nombres de servicio Docker, no localhost:

```env
NEXT_PUBLIC_OLLAMA_HOST=http://ollama:11434  # ✓ Correcto
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:11434  # ✗ Incorrecto en Docker
```
