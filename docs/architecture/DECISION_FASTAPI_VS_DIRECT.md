# Decisión de Arquitectura: FastAPI vs. Integración Directa

Este documento analiza si es conveniente implementar una capa intermedia (Middleware) con **FastAPI** para gestionar los prompts de TranslateGemma, o si es preferible consumir el modelo directamente desde el Frontend (React).

---

## 1. El Problema

TranslateGemma requiere una estructura de prompt muy específica para funcionar correctamente (ver `docs/translategemma/PROMPT_GUIDE.md`). El usuario plantea la duda de si encapsular esta lógica en un backend mejora la arquitectura.

**Prompt Requerido:**
```text
You are a professional {SOURCE_LANG} ({SOURCE_CODE}) ... [Instrucciones] ... 

{TEXT}
```

---

## 2. Opción A: FastAPI Middleware (Backend Python)

Arquitectura: `Frontend React` -> `FastAPI` -> `Ollama`

### ✅ Ventajas
1.  **Encapsulamiento**: La lógica del prompt (que es verbosa) vive fuera del cliente.
2.  **Abstracción**: El frontend solo envía `{ text, from, to }` y no sabe nada de "TranslateGemma" o prompts.
3.  **Seguridad**: Permite implementar Rate Limiting, API Keys o logging centralizado antes de llamar a Ollama.
4.  **Evolución**: Si mañana cambiamos Ollama por una API de pago (ej. OpenAI), el frontend no se entera.

### ❌ Desventajas
1.  **Complejidad Operativa**: Requiere levantar y mantener un proceso Python adicional.
2.  **Latencia**: Agrega un salto de red adicional.
3.  **Requisitos**: Obliga al usuario a tener Python instalado + Virtualenv + Dependencias.

---

## 3. Opción B: Integración Directa (Frontend React + SDK)

Arquitectura: `Frontend React` -> `Ollama` (Directamente)

### ✅ Ventajas
1.  **Simplicidad Extrema**: "Local-First". Solo necesitas el binario de Ollama y el navegador.
2.  **Menos Latencia**: Conexión directa localhost.
3.  **Portabilidad**: Fácil de empaquetar en una app de escritorio (Electron/Tauri) sin incluir un runtime de Python.

### ❌ Desventajas
1.  **Lógica en Cliente**: El frontend debe conocer la plantilla del prompt.
2.  **Acoplamiento**: El cliente está atado a la API de Ollama.

---

## 4. Análisis del Prompt

Revisando `PROMPT_GUIDE.md`, la complejidad del prompt se reduce a una **interpolación de cadenas**.

En JavaScript:
```javascript
const prompt = `You are a professional ${sourceLang}...`;
```

Esta lógica es trivial y no justifica por sí sola la introducción de un servidor backend completo.

---

## 5. Conclusión y Recomendación

**Para la versión actual (V1) de TranslateGemma-UI, se recomienda la Opción B (Directa).**

### Justificación:
1.  **KISS (Keep It Simple, Stupid)**: El objetivo es una UI local. Agregar Python complica la instalación para el usuario final.
2.  **PocketBase ya existe**: Ya tenemos un backend (PocketBase) para la persistencia. Agregar FastAPI sería tener *dos* backends.
3.  **Costo-Beneficio**: El "costo" de tener la plantilla del prompt en JS es casi nulo. El costo de mantener FastAPI es alto.

### ¿Cuándo usar FastAPI?
Si el proyecto escala a necesidades "Enterprise":
*   Necesidad de ocultar el prompt (propiedad intelectual).
*   Orquestación compleja (ej. llamar a 3 modelos y votar el mejor resultado).
*   Monetización (cobrar por traducción).

### Veredicto
**Usar Prompts Directamente en Frontend** (encapsulados en un módulo de servicio `src/services/llm.js`).
