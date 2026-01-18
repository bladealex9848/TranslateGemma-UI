# TranslateGemma UI

Interfaz de usuario moderna para los modelos de traducción **TranslateGemma** de Google, ejecutados localmente con **Ollama**.

## ✨ Características

- 🌍 **55 idiomas** soportados
- 🖼️ **Traducción multimodal** (texto e imágenes)
- 🔒 **Privacidad total** - ejecución 100% local
- ⚡ **3 modelos** disponibles (4B, 12B, 27B)
- 📱 **Diseño responsive** para desktop, tablet y móvil

## 🚀 Inicio Rápido

### Prerrequisitos

1. **Ollama** instalado y ejecutándose
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Modelo TranslateGemma** descargado
   ```bash
   ollama pull translategemma:12b
   ```

### Configuración

1. Clonar el repositorio
   ```bash
   git clone https://github.com/your-username/TranslateGemma-UI.git
   cd TranslateGemma-UI
   ```

2. Copiar archivo de entorno
   ```bash
   cp .env.example .env
   ```

3. Configurar variables (editar `.env`)
   ```env
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=translategemma:12b
   ```

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [TranslateGemma](./docs/translategemma/README.md) | Documentación del modelo |
| [Modelos](./docs/translategemma/MODELS.md) | Comparativa 4B/12B/27B |
| [Guía de Prompts](./docs/translategemma/PROMPT_GUIDE.md) | Formato y ejemplos |
| [Idiomas](./docs/translategemma/LANGUAGES.md) | 55 idiomas soportados |

### Prompts Especializados

| Prompt | Para |
|--------|------|
| [UI/UX Designer](./docs/prompts/UI_UX_DESIGNER_PROMPT.md) | Diseño de interfaz |
| [Arquitecto](./docs/prompts/ARCHITECTURE_PROMPT.md) | Arquitectura del sistema |

## 🛠️ Stack Tecnológico

- **Backend de IA**: Ollama + TranslateGemma
- **Frontend**: (Por definir)
- **API**: REST API de Ollama

## 📋 Modelos Disponibles

| Modelo | Tamaño | RAM | Caso de Uso |
|--------|--------|-----|-------------|
| `translategemma:4b` | 3.3GB | 6GB+ | Mobile/Edge |
| `translategemma:12b` | 8.1GB | 12GB+ | Laptop |
| `translategemma:27b` | 17GB | 32GB+ | Cloud/Server |

## 🔧 Variables de Entorno

Ver [.env.example](.env.example) para todas las opciones.

| Variable | Descripción | Default |
|----------|-------------|---------|
| `OLLAMA_HOST` | URL del servidor Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modelo por defecto | `translategemma:12b` |

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🔗 Referencias

- [Ollama](https://ollama.com/)
- [TranslateGemma en Ollama](https://ollama.com/library/translategemma)
- [Technical Report (arXiv)](https://arxiv.org/abs/2601.09012)
