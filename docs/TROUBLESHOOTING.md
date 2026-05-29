# Solución de Problemas (Troubleshooting)

Este documento registra los problemas comunes encontrados durante el desarrollo y despliegue de TranslateGemma-UI y sus soluciones.

## 1. API Errors

### Error 400 en `GET /api/collections/translations/records`
**Síntoma**: La solicitud devuelve `400 Bad Request` y el mensaje "Something went wrong while processing your request".
**Causa**: PocketBase v0.23+ puede restringir el ordenamiento por campos de sistema como `created` si no están explícitamente permitidos o indexados de cierta manera en consultas complejas, o simplemente el SDK enviaba un parámetro inválido para la versión.
**Solución**: Cambiar el ordenamiento en `frontend/src/services/pocketbase.ts` de `sort: '-created'` a `sort: '-id'`. Los IDs de PocketBase (ULID/KSUID) son ordenables cronológicamente.

```typescript
// Antes
sort: '-created',

// Ahora
sort: '-id',
```

## 2. Errores de Interfaz (UI)

### Hydration Failed: `<button>` cannot be a descendant of `<button>`
**Síntoma**: Error rojo en consola de desarrollo y problemas de renderizado en `TranslationHistory`.
**Causa**: El componente `TranslationHistory` tenía un elemento interactivo principal como `<button>` y dentro botones de acción (Favorito/Eliminar). HTML5 prohíbe botones anidados.
**Solución**: Reemplazar el contenedor exterior por un `div` con propiedades de accesibilidad:

```tsx
<div 
    role="button" 
    tabIndex={0} 
    onKeyDown={...}
    onClick={...}
>
    {/* Contenido */}
    <button>Acción interna</button>
</div>
```

### Modal de Autenticación fuera de pantalla en Móvil
**Síntoma**: El modal aparece pegado al borde superior o recortado en iPhone/Android.
**Causa**: Uso de `min-h-full` en un contenedor flex que no tenía altura explícita del padre en móviles.
**Solución**: Usar `min-h-screen` en el contenedor del modal (`AuthModal.tsx`) para asegurar el centrado vertical respecto al viewport.

## 3. Producción (systemd + Next.js)

### `ChunkLoadError` / CSS y JS servidos como `text/plain` (500)
**Síntoma**: En el navegador, los chunks de `/_next/static/chunks/*.css|*.js`
devuelven `500`, se sirven con MIME `text/plain` y aparece
`Uncaught ChunkLoadError: Failed to load chunk ...`. La app queda con estilos
rotos o pantalla en blanco.

**Causa**: Desincronización entre el `next-server` en memoria y el directorio
`.next` en disco. Ocurre cuando se ejecuta `npm run build` (regenera `.next`)
**sin reiniciar** `translate-frontend`. El server sigue sirviendo un HTML que
referencia chunks de un build anterior que ya fue sobrescrito/borrado en disco
→ Next responde 500 y los entrega como `text/plain`.

**Solución**:
```bash
cd /root/TranslateGemma-UI/frontend
rm -rf .next
set -a; . /root/.translate_secrets; set +a   # inlinar NEXT_PUBLIC_* (reCAPTCHA)
NODE_ENV=production npm run build
systemctl restart translate-frontend
```
Luego, en el navegador, **hard refresh** (Ctrl+Shift+R) para descartar el HTML cacheado.

**Diagnóstico rápido** (comparar lo que el server referencia vs. lo que hay en disco):
```bash
cd /root/TranslateGemma-UI/frontend
for f in $(curl -s http://127.0.0.1:3003/ | grep -oE '_next/static/chunks/[a-zA-Z0-9]+\.(js|css)' | sort -u); do
  d=".next/${f#_next/}"; [ -f "$d" ] && echo "OK $d" || echo "MISS $d"
done
```

**Prevención**: nunca correr `npm run build` manual sin `systemctl restart
translate-frontend` después. El script de deploy del webhook ya encadena
build + restart y además ejecuta `rm -rf .next` previo (build limpio).
Detalle completo: [`INCIDENTE-CHUNKLOADERROR-2026-05-28.md`](INCIDENTE-CHUNKLOADERROR-2026-05-28.md).

## 4. Despliegue Docker

### Error: "connection refused" a Ollama
**Causa**: El contenedor `frontend` intenta conectar a `localhost:11434`, pero `localhost` dentro del contenedor es el propio contenedor, no el host.
**Solución**: Usar el nombre del servicio docker: `http://ollama:11434`.
**Configuración**:
```env
# .env.production
NEXT_PUBLIC_OLLAMA_HOST=http://ollama:11434
```
