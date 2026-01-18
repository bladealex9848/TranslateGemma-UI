# Plan de Implementación: TranslateGemma-UI

Este documento es el **tracker** oficial para el desarrollo de TranslateGemma-UI. Cada fase tiene tareas detalladas que se marcarán como completadas a medida que avance el proyecto.

**Última Actualización**: 18 de Enero, 2026

---

## Stack Tecnológico Definitivo (2026)

| Componente | Tecnología | Versión | Justificación |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js | 16.x | SSR/SSG, Turbopack, App Router estable |
| **UI Library** | React | 19.x | Server Components, mejor rendimiento |
| **Build Tool** | Turbopack (integrado en Next.js 16) | - | Bundler nativo, más rápido que Vite |
| **Styling** | Tailwind CSS | 4.x | Utility-first, simplicidad |
| **State Management** | Zustand | 5.x | Ligero, simple, compatible con SSR |
| **Backend/Auth/DB** | PocketBase | 0.24+ | SQLite embebido, Auth incluido, single binary |
| **LLM Runtime** | Ollama | Latest | Inferencia local, API REST |
| **Language** | TypeScript | 5.7+ | Tipado estricto, menos bugs |

---

## Fases de Implementación

### Fase 0: Preparación del Entorno
- [x] Verificar versiones de Node.js (>=20.x) y Python (>=3.11)
- [x] Inicializar proyecto Next.js 16 con TypeScript
- [x] Configurar ESLint + Prettier
- [x] Configurar estructura de carpetas según `docs/prompts/ARCHITECTURE_PROMPT.md`
- [ ] Descargar y configurar PocketBase localmente
- [ ] Crear colecciones base en PocketBase (users, translations)

---

### Fase 1: Scaffold UI (Sin Lógica)
Basado en mockups de `docs/stitch_translategemma_ui/`.

- [x] Implementar layout principal (Header, Main Content, Footer)
- [x] Componente: `TranslationInput` (área de texto origen)
- [x] Componente: `TranslationOutput` (área de texto destino)
- [x] Componente: `LanguageSelector` (dropdown con 55 idiomas)
- [x] Componente: `SwapLanguagesButton`
- [x] Componente: `ModelSelector` (4B/12B/27B toggle)
- [ ] Componente: `TranslationHistory` (sidebar colapsable)
- [ ] Componente: `SettingsModal`
- [x] Componente: `OllamaStatusIndicator`
- [x] Implementar responsive para tablet y móvil
- [x] Implementar dark mode toggle

---

### Fase 2: Integración con Ollama
- [x] Crear servicio `src/services/ollama.ts` para comunicación con API
- [x] Implementar función `translate()` con prompt oficial
- [x] Implementar streaming de respuesta (SSE)
- [x] Manejo de errores (conexión, timeout, modelo no encontrado)
- [x] Indicador de carga (spinner/skeleton)
- [x] Listar modelos disponibles desde `/api/tags`
- [x] Verificar estado de conexión a Ollama

---

### Fase 3: Integración con PocketBase
- [x] Configurar SDK de PocketBase en frontend
- [x] Implementar flujo de registro de usuario
- [x] Implementar flujo de login (email/password)
- [x] Implementar logout y manejo de sesión
- [x] Crear reglas de API para colección `translations`
- [x] Guardar traducciones en historial (usuario logueado)
- [x] Cargar historial del usuario al iniciar
- [ ] Implementar búsqueda en historial
- [x] Implementar favoritos en traducciones
- [ ] Sincronizar estado local con PocketBase

---

### Fase 4: Funcionalidades Avanzadas
- [ ] Traducción de imágenes (multimodal) - upload + base64
- [ ] Copiar traducción al portapapeles
- [ ] Exportar historial como JSON/CSV
- [ ] Detección automática de idioma (heurística o LLM)
- [ ] Contador de tokens/caracteres de entrada
- [ ] Atajos de teclado (Ctrl+Enter para traducir)
- [ ] PWA: Manifest + Service Worker básico

---

### Fase 5: Testing y QA
- [ ] Tests unitarios para servicios (Vitest)
- [ ] Tests E2E para flujos críticos (Playwright)
- [ ] Validación de accesibilidad (axe-core)
- [ ] Pruebas de rendimiento (Lighthouse)
- [ ] Revisión de seguridad (headers, CORS, sanitización)

---

### Fase 6: Deployment
- [ ] Crear Dockerfile para frontend (Next.js standalone)
- [ ] Crear `docker-compose.yml` (Frontend + PocketBase + Ollama)
- [ ] Configurar variables de entorno de producción
- [ ] Documentar proceso de despliegue en README.md
- [ ] Desplegar en VPS (`translate.alexanderoviedofadul.dev`)
- [ ] Configurar HTTPS (Nginx + Certbot o Caddy)
- [ ] Verificar funcionamiento en producción

---

## Notas Arquitectónicas

1. **Sin Backend Intermedio**: El frontend habla directamente con Ollama (SSE) y PocketBase (SDK). Esta decisión está documentada en `docs/architecture/DECISION_FASTAPI_VS_DIRECT.md`.

2. **PocketBase como Auth + DB**: Reemplaza la necesidad de un backend Python/Node para persistencia. Corre como proceso separado o contenedor.

3. **Ollama CORS**: Asegurarse de que `OLLAMA_ORIGINS` permita el dominio del frontend.

---

## Recursos Relacionados

- [Mockups UI](file:///Volumes/NVMe1TB/GitHub/TranslateGemma-UI/docs/stitch_translategemma_ui/)
- [Arquitectura PocketBase](file:///Volumes/NVMe1TB/GitHub/TranslateGemma-UI/docs/architecture/POCKETBASE_INTEGRATION.md)
- [Guía de Prompts](file:///Volumes/NVMe1TB/GitHub/TranslateGemma-UI/docs/translategemma/PROMPT_GUIDE.md)
- [Benchmark de Servidor](file:///Volumes/NVMe1TB/GitHub/TranslateGemma-UI/docs/benchmarks/OLLAMA_SERVER_ANALYSIS.md)
