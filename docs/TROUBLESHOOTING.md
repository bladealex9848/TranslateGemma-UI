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

## 3. Despliegue Docker

### Error: "connection refused" a Ollama
**Causa**: El contenedor `frontend` intenta conectar a `localhost:11434`, pero `localhost` dentro del contenedor es el propio contenedor, no el host.
**Solución**: Usar el nombre del servicio docker: `http://ollama:11434`.
**Configuración**:
```env
# .env.production
NEXT_PUBLIC_OLLAMA_HOST=http://ollama:11434
```
