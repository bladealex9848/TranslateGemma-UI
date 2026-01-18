# Guía de Prompts para TranslateGemma

TranslateGemma requiere un formato de prompt específico para obtener traducciones de alta calidad.

## Formato del Prompt

```
You are a professional {SOURCE_LANG} ({SOURCE_CODE}) to {TARGET_LANG} ({TARGET_CODE}) translator. Your goal is to accurately convey the meaning and nuances of the original {SOURCE_LANG} text while adhering to {TARGET_LANG} grammar, vocabulary, and cultural sensitivities. Produce only the {TARGET_LANG} translation, without any additional explanations or commentary. Please translate the following {SOURCE_LANG} text into {TARGET_LANG}:


{TEXT}
```

> **Importante**: Hay dos líneas en blanco antes del texto a traducir.

### Parámetros

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `{SOURCE_LANG}` | Nombre del idioma origen | `English` |
| `{SOURCE_CODE}` | Código ISO del idioma origen | `en` |
| `{TARGET_LANG}` | Nombre del idioma destino | `Spanish` |
| `{TARGET_CODE}` | Código ISO del idioma destino | `es` |
| `{TEXT}` | Texto a traducir | `Hello, how are you?` |

---

## Ejemplos de Uso

### Inglés a Español

```
You are a professional English (en) to Spanish (es) translator. Your goal is to accurately convey the meaning and nuances of the original English text while adhering to Spanish grammar, vocabulary, and cultural sensitivities. Produce only the Spanish translation, without any additional explanations or commentary. Please translate the following English text into Spanish:


Hello, how are you?
```

**Resultado esperado**: `Hola, ¿cómo estás?`

---

### Alemán a Inglés

```
You are a professional German (de) to English (en) translator. Your goal is to accurately convey the meaning and nuances of the original German text while adhering to English grammar, vocabulary, and cultural sensitivities. Produce only the English translation, without any additional explanations or commentary. Please translate the following German text into English:


Guten Morgen, wie geht es Ihnen?
```

**Resultado esperado**: `Good morning, how are you?`

---

### Japonés a Francés

```
You are a professional Japanese (ja) to French (fr) translator. Your goal is to accurately convey the meaning and nuances of the original Japanese text while adhering to French grammar, vocabulary, and cultural sensitivities. Produce only the French translation, without any additional explanations or commentary. Please translate the following Japanese text into French:


こんにちは、世界！
```

**Resultado esperado**: `Bonjour, le monde !`

---

### Chino (Simplificado) a Inglés

```
You are a professional Chinese (zh-Hans) to English (en) translator. Your goal is to accurately convey the meaning and nuances of the original Chinese text while adhering to English grammar, vocabulary, and cultural sensitivities. Produce only the English translation, without any additional explanations or commentary. Please translate the following Chinese text into English:


你好世界
```

**Resultado esperado**: `Hello, world`

---

## Códigos de Idioma

Los códigos de idioma siguen el estándar **ISO 639-1 Alpha-2** o variantes regionalizadas:

| Formato | Ejemplo | Descripción |
|---------|---------|-------------|
| ISO 639-1 | `en` | Inglés general |
| Regionalizado | `en-US` | Inglés estadounidense |
| Regionalizado | `zh-Hans` | Chino simplificado |
| Regionalizado | `zh-Hant` | Chino tradicional |

Consulta [LANGUAGES.md](./LANGUAGES.md) para la lista completa.

---

## Implementación en Código

### Python con Ollama

```python
from ollama import chat

def translate(text: str, source_lang: str, source_code: str, 
              target_lang: str, target_code: str, model: str = "translategemma") -> str:
    """
    Traduce texto usando TranslateGemma.
    
    Args:
        text: Texto a traducir
        source_lang: Nombre del idioma origen (ej: "English")
        source_code: Código ISO del origen (ej: "en")
        target_lang: Nombre del idioma destino (ej: "Spanish")
        target_code: Código ISO del destino (ej: "es")
        model: Modelo de Ollama a usar
    
    Returns:
        Texto traducido
    """
    prompt = f"""You are a professional {source_lang} ({source_code}) to {target_lang} ({target_code}) translator. Your goal is to accurately convey the meaning and nuances of the original {source_lang} text while adhering to {target_lang} grammar, vocabulary, and cultural sensitivities. Produce only the {target_lang} translation, without any additional explanations or commentary. Please translate the following {source_lang} text into {target_lang}:


{text}"""
    
    response = chat(
        model=model,
        messages=[{'role': 'user', 'content': prompt}]
    )
    
    return response.message.content

# Ejemplo de uso
result = translate(
    text="Hello, how are you?",
    source_lang="English",
    source_code="en",
    target_lang="Spanish",
    target_code="es"
)
print(result)
```

### JavaScript con Ollama

```javascript
import ollama from 'ollama';

async function translate(text, sourceLang, sourceCode, targetLang, targetCode, model = 'translategemma') {
  const prompt = `You are a professional ${sourceLang} (${sourceCode}) to ${targetLang} (${targetCode}) translator. Your goal is to accurately convey the meaning and nuances of the original ${sourceLang} text while adhering to ${targetLang} grammar, vocabulary, and cultural sensitivities. Produce only the ${targetLang} translation, without any additional explanations or commentary. Please translate the following ${sourceLang} text into ${targetLang}:


${text}`;

  const response = await ollama.chat({
    model: model,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.message.content;
}

// Ejemplo de uso
const result = await translate(
  'Hello, how are you?',
  'English', 'en',
  'Spanish', 'es'
);
console.log(result);
```

---

## Mejores Prácticas

1. **Usa el formato exacto**: El modelo fue entrenado con este prompt específico
2. **Incluye las dos líneas en blanco**: Antes del texto a traducir
3. **Usa códigos ISO correctos**: Consulta la lista de idiomas soportados
4. **Textos largos**: El modelo soporta hasta 128K tokens de contexto
5. **Contexto cultural**: El prompt ya incluye instrucciones de sensibilidad cultural
