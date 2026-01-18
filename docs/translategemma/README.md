# TranslateGemma

TranslateGemma es una colección de modelos de traducción abiertos desarrollados por **Google DeepMind**, construidos sobre la arquitectura Gemma 3. Representa un avance significativo en traducción automática abierta, permitiendo comunicación en **55 idiomas**.

## Características Principales

### 🌍 Soporte Multilingüe
- Traducción de alta calidad entre 55 idiomas
- Incluye idiomas de alta y baja disponibilidad de recursos

### 🖼️ Capacidades Multimodales
- Retiene las capacidades multimodales de Gemma 3
- Traduce texto incrustado en imágenes sin necesidad de OCR separado

### ⚡ Eficiencia
- El modelo 12B supera al baseline Gemma 3 27B
- El modelo 4B rivaliza con el rendimiento del baseline 12B
- Optimizado para diversos escenarios de despliegue

## Modelos Disponibles

| Modelo | Parámetros | Tamaño | Caso de Uso |
|--------|------------|--------|-------------|
| `translategemma:4b` | 4B | 3.3GB | Móviles y dispositivos edge |
| `translategemma:12b` | 12B | 8.1GB | Laptops y equipos consumer |
| `translategemma:27b` | 27B | 17GB | Cloud y servidores (H100/TPU) |

Todos los modelos tienen una ventana de contexto de **128K tokens**.

## Instalación con Ollama

```bash
# Instalar el modelo por defecto (4B)
ollama pull translategemma

# Instalar modelo específico
ollama pull translategemma:12b
ollama pull translategemma:27b
```

## Uso Rápido

### CLI
```bash
ollama run translategemma
```

### API REST
```bash
curl http://localhost:11434/api/chat \
  -d '{
    "model": "translategemma",
    "messages": [{
      "role": "user",
      "content": "You are a professional English (en) to Spanish (es) translator..."
    }]
  }'
```

### Python
```python
from ollama import chat

response = chat(
    model='translategemma',
    messages=[{'role': 'user', 'content': 'Your translation prompt here'}]
)
print(response.message.content)
```

## Documentación Adicional

- [Modelos Disponibles](./MODELS.md)
- [Guía de Prompts](./PROMPT_GUIDE.md)
- [Idiomas Soportados](./LANGUAGES.md)

## Referencias

- [Ollama - TranslateGemma](https://ollama.com/library/translategemma)
- [Technical Report (arXiv:2601.09012)](https://arxiv.org/abs/2601.09012)
- [Google Blog - TranslateGemma](https://blog.google/technology/developers/translategemma-google-ai-translation/)
