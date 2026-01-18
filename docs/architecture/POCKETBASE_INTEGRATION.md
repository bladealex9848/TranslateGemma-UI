# Integración con PocketBase: Arquitectura y Diseño

Este documento detalla la estrategia para integrar **PocketBase** como backend de persistencia para `TranslateGemma-UI`, permitiendo a los usuarios registrarse y guardar su historial de traducciones.

---

## 1. ¿Por qué PocketBase?

PocketBase es una solución backend "todo en uno" en un solo archivo ejecutable (Go + SQLite). Es ideal para `TranslateGemma-UI` porque:
*   **Portabilidad**: Se alinea con la filosofía "local-first" del proyecto. El usuario puede correr el backend localmente con un solo comando.
*   **Simplicidad**: Incluye Auth, Base de Datos y API Real-time sin configuración compleja.
*   **SDK Ligero**: Cliente JS nativo fácil de integrar con React.

---

## 2. Arquitectura de Integración

El flujo de datos híbrido mantiene la privacidad de la inferencia mientras centraliza el almacenamiento (opcionalmente).

```mermaid
graph TD
    A[Frontend React] -->|Auth & History| B[PocketBase Backend]
    A -->|Inferencia| C[Ollama Local]
    B -->|Persistencia| D[SQLite (pb_data)]
    C -->|Gemma Weights| E[Modelos Locales]
```

### Componentes
1.  **Frontend**: Gestiona la lógica. Usa el SDK `pocketbase` para auth y CRUD.
2.  **Ollama**: Realiza la traducción (CPU/GPU). No guarda estado.
3.  **PocketBase**: Guarda usuarios y registros de traducción.

---

## 3. Diseño de Base de Datos (Schema)

Se requieren dos colecciones principales.

### A. Users (System Collection)
Colección por defecto de PocketBase.
*   `id`: UID
*   `email`: Email del usuario
*   `password`: Hashed
*   `name`: Nombre de visualización
*   `avatar`: Foto de perfil (opcional)

### B. Translations (Custom Collection)
Almacena el historial de traducciones.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `user` | Relation | Sí | Relación con colección `users` (Cascade Delete) |
| `source_lang` | Text | Sí | Código ISO (ej. 'en') |
| `target_lang` | Text | Sí | Código ISO (ej. 'es') |
| `original_text` | Text | Sí | Texto de entrada |
| `translated_text` | Text | Sí | Resultado de Gemma |
| `model_used` | Text | No | Ej. 'translategemma:12b' |
| `is_favorite` | Bool | No | Marcador para favoritos |
| `tags` | JSON | No | Etiquetas opcionales |

---

## 4. Estrategia de Implementación

### Paso 1: Configuración del Servidor
Descargar el ejecutable de PocketBase (o usar Docker) y ejecutarlo junto a la app.
```bash
./pocketbase serve
```

### Paso 2: Cliente SDK (Frontend)
Instalar el cliente oficial.
```bash
npm install pocketbase
```

**Ejemplo de Inicialización (`src/lib/pocketbase.js`):**
```javascript
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

// Escuchar cambios de auth
pb.authStore.onChange((token, model) => {
    console.log('Auth changed', model);
});
```

### Paso 3: Flujo de Guardado
Cuando una traducción se completa en Ollama:
1.  Verificar si hay usuario logueado (`pb.authStore.isValid`).
2.  Si es válido, crear registro en `translations`.

```javascript
/* Ejemplo conceptual */
async function saveTranslation(original, translated, source, target) {
  if (!pb.authStore.isValid) return;

  const record = await pb.collection('translations').create({
    user: pb.authStore.model.id,
    original_text: original,
    translated_text: translated,
    source_lang: source,
    target_lang: target,
    model_used: 'translategemma:12b'
  });
}
```

---

## 5. Reglas de API (Seguridad)

Configurar reglas de acceso en el Dashboard de PocketBase para privacidad de datos:

*   **Translations Collection**:
    *   **List/View**: `user = @request.auth.id` (Solo ver mis traducciones)
    *   **Create**: `@request.auth.id != ""` (Solo usuarios registrados)
    *   **Update/Delete**: `user = @request.auth.id` (Solo editar mis traducciones)

---

## 6. Recursos

*   [Documentación Oficial](https://pocketbase.io/docs/)
*   [JavaScript SDK](https://github.com/pocketbase/js-sdk)
*   [Descargar PocketBase](https://pocketbase.io/docs/)
