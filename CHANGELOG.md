# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added
- **Alianza "Continuar con Cédula 360"** + capa admin (2026-05-16)
  - Route Handlers Next.js `app/api/auth/cedula360`, `/challenge`, `/verify`
    que validan server-to-server contra la API REAL de Cédula 360
    (`:3081`, override `CEDULA360_API_BASE`; nunca el stub `:9091`).
  - Reenvío de IP real del usuario (`X-Forwarded-For`/`X-Real-IP`) para
    no compartir el bucket de rate-limit (10/min) de Cédula 360.
  - Token de sesión emitido vía PocketBase **impersonate** (superusuario);
    upsert de `users` con rol normal `viewer`, sin escalar roles, sin
    guardar la contraseña de Cédula 360.
  - reCAPTCHA v3 (claves Cédula 360, umbral 0.3, fail-open).
  - Botón "Continuar con Cédula 360" + 2FA inline en `AuthModal`.
  - Panel `/admin` mínimo con RBAC (viewer vs admin), Mi perfil y
    listado de usuarios. Campo `role` añadido a la colección `users`.
  - Dominio primario migrado a `translate.cedula360.tech`
    (`translate.alexanderoviedofadul.dev` → 301). Footer/landing con
    badge "en alianza con Cédula 360" y contacto `info@cedula360.tech`.
  - Doc: `docs/ALIANZA-CEDULA360-2026-05-16.md`.
- Documentación inicial de TranslateGemma
  - README.md con descripción y uso básico
  - MODELS.md con detalles de los modelos 4B, 12B, 27B
  - PROMPT_GUIDE.md con formato y ejemplos de prompts
  - LANGUAGES.md con lista de 55 idiomas soportados
- Prompts especializados
  - UI_UX_DESIGNER_PROMPT.md para diseñadores
  - ARCHITECTURE_PROMPT.md para arquitectos
- Archivos de configuración del proyecto
  - README.md principal
  - CHANGELOG.md
  - LICENSE (MIT)
  - .gitignore
  - .env y .env.example
  - requirements.txt
- Arquitectura e Integraciones
  - Documentación de integración con PocketBase
  - Decisión arquitectónica: FastAPI vs Integración Directa
  - Análisis de rendimiento de servidor Ollama
- Planificación de Implementación
  - Roadmap detallado con 6 fases
  - Stack tecnológico: Next.js 16 + React 19 + PocketBase

### Frontend Implementation
- Next.js 16 project with TypeScript, Tailwind CSS 4, and Turbopack
- UI Components: TranslationPanel, LanguageSelector, ModelSelector, Header
- Services: Ollama API with streaming, PocketBase SDK for auth/history
- Zustand state management with persistence
- 55 languages support from TranslateGemma docs
- Image translation (multimodal) component
- PWA manifest for installable web app
- Dark mode with system preference detection

### Deployment Infrastructure
- Dockerfile for Next.js standalone production build
- docker-compose.yml with Frontend + Ollama + PocketBase services
- Environment configuration for development and production

### Fixes
- **API**: Resolved sorting issue in history API (changed from `-created` to `-id`).
- **UI**: Fixed hydration error in `TranslationHistory` (nested buttons).
- **Mobile**: Improved responsiveness for Auth Modal and Header.
- **Theme**: Fixed Theme Toggle logic for system preference.

## [0.1.0] - 2026-01-18

### Added
- Estructura inicial del proyecto
- Investigación y documentación de TranslateGemma
- Configuración base para integración con Ollama
