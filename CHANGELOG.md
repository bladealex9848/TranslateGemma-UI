# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added
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
