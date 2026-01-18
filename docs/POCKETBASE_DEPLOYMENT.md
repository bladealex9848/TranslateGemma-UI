# Guía de Despliegue de PocketBase

Esta guía documenta cómo configurar PocketBase para TranslateGemma-UI.

## Requisitos

- PocketBase v0.24+ ([Descargar](https://pocketbase.io/docs))
- Puerto 8090 disponible

## Instalación Local

### macOS/Linux

```bash
# Descargar PocketBase (macOS ARM64)
curl -fsSL https://github.com/pocketbase/pocketbase/releases/download/v0.24.4/pocketbase_0.24.4_darwin_arm64.zip -o pocketbase.zip
unzip pocketbase.zip
chmod +x pocketbase

# Iniciar servidor
./pocketbase serve --http=127.0.0.1:8090
```

### Docker

```bash
docker run -d \
  --name pocketbase \
  -p 8090:8090 \
  -v pocketbase_data:/pb_data \
  ghcr.io/muchobien/pocketbase:latest \
  serve --http=0.0.0.0:8090
```

## Configuración Inicial

### 1. Crear Superusuario

```bash
./pocketbase superuser upsert admin@yourdomain.com YourSecurePassword123!
```

### 2. Obtener Token de Autenticación

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@yourdomain.com","password":"YourSecurePassword123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

### 3. Crear Colección `translations`

```bash
curl -s -X POST "http://127.0.0.1:8090/api/collections" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "translations",
    "type": "base",
    "fields": [
      {"name": "source_lang", "type": "text", "required": true},
      {"name": "target_lang", "type": "text", "required": true},
      {"name": "original_text", "type": "text", "required": true},
      {"name": "translated_text", "type": "text", "required": true},
      {"name": "model_used", "type": "text"},
      {"name": "is_favorite", "type": "bool"},
      {"name": "user_id", "type": "text", "required": true}
    ],
    "listRule": "user_id = @request.auth.id",
    "viewRule": "user_id = @request.auth.id",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "user_id = @request.auth.id",
    "deleteRule": "user_id = @request.auth.id"
  }'
```

## Esquema de Colecciones

### `users` (Sistema - Auth)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| id | text (auto) | ID único del usuario |
| email | email | Email del usuario |
| name | text | Nombre del usuario |
| avatar | file | Foto de perfil |
| verified | bool | Email verificado |

### `translations`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| id | text (auto) | ID único de la traducción |
| user_id | text | ID del usuario propietario |
| source_lang | text | Idioma de origen |
| target_lang | text | Idioma de destino |
| original_text | text | Texto original |
| translated_text | text | Texto traducido |
| model_used | text | Modelo de Ollama usado |
| is_favorite | bool | Marcado como favorito |

## Variables de Entorno del Frontend

```env
# .env.local
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

## Producción

### Docker Compose

El archivo `docker-compose.yml` en la raíz del proyecto incluye PocketBase:

```yaml
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - pocketbase_data:/pb_data
    restart: unless-stopped
    command: serve --http=0.0.0.0:8090
```

### Persistencia de Datos

Los datos de PocketBase se almacenan en:
- **Local**: `./pb_data/` (carpeta donde se ejecuta)
- **Docker**: Volumen `pocketbase_data`

### Backups

```bash
# Backup de la base de datos SQLite
cp pb_data/data.db pb_data/data.db.backup

# O usar la función de backup integrada
./pocketbase backup create
```

## Verificación

```bash
# Verificar que el servicio esté healthy
curl -s http://127.0.0.1:8090/api/health

# Listar colecciones (requiere auth)
curl -s http://127.0.0.1:8090/api/collections -H "Authorization: $TOKEN"
```

## Troubleshooting

### Error: "Failed to create collection"

- Verificar que el token sea válido y no haya expirado
- Revisar que los nombres de campos no colisionen con campos del sistema

### Error: "Connection refused"

- Verificar que PocketBase esté corriendo: `pgrep pocketbase`
- Verificar el puerto: `lsof -i :8090`

### Error de CORS

Configurar `Settings > Application` en el dashboard de PocketBase o usar:

```bash
./pocketbase serve --http=0.0.0.0:8090 --origins="http://localhost:3000,https://yourdomain.com"
```
