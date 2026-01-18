# Idiomas Soportados por TranslateGemma

TranslateGemma soporta traducción entre **55 idiomas**, incluyendo idiomas de alta disponibilidad de recursos y también idiomas menos comunes.

## Lista de Idiomas

Los idiomas están organizados por región geográfica. Los códigos siguen el estándar ISO 639-1.

### Europa Occidental

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Inglés | `en` | English |
| Español | `es` | Español |
| Francés | `fr` | Français |
| Alemán | `de` | Deutsch |
| Italiano | `it` | Italiano |
| Portugués | `pt` | Português |
| Holandés | `nl` | Nederlands |
| Catalán | `ca` | Català |
| Gallego | `gl` | Galego |
| Vasco | `eu` | Euskara |

### Europa del Norte

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Sueco | `sv` | Svenska |
| Noruego | `no` | Norsk |
| Danés | `da` | Dansk |
| Finlandés | `fi` | Suomi |
| Islandés | `is` | Íslenska |

### Europa del Este

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Ruso | `ru` | Русский |
| Polaco | `pl` | Polski |
| Ucraniano | `uk` | Українська |
| Checo | `cs` | Čeština |
| Eslovaco | `sk` | Slovenčina |
| Húngaro | `hu` | Magyar |
| Rumano | `ro` | Română |
| Búlgaro | `bg` | Български |
| Croata | `hr` | Hrvatski |
| Serbio | `sr` | Српски |
| Esloveno | `sl` | Slovenščina |
| Lituano | `lt` | Lietuvių |
| Letón | `lv` | Latviešu |
| Estonio | `et` | Eesti |

### Asia Oriental

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Chino (Simplificado) | `zh-Hans` | 简体中文 |
| Chino (Tradicional) | `zh-Hant` | 繁體中文 |
| Japonés | `ja` | 日本語 |
| Coreano | `ko` | 한국어 |

### Asia Meridional

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Hindi | `hi` | हिन्दी |
| Bengalí | `bn` | বাংলা |
| Tamil | `ta` | தமிழ் |
| Telugu | `te` | తెలుగు |
| Maratí | `mr` | मराठी |
| Gujarati | `gu` | ગુજરાતી |
| Canarés | `kn` | ಕನ್ನಡ |
| Malayalam | `ml` | മലയാളം |
| Urdu | `ur` | اردو |

### Sudeste Asiático

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Vietnamita | `vi` | Tiếng Việt |
| Tailandés | `th` | ไทย |
| Indonesio | `id` | Bahasa Indonesia |
| Malayo | `ms` | Bahasa Melayu |
| Tagalo | `tl` | Tagalog |

### Medio Oriente

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Árabe | `ar` | العربية |
| Hebreo | `he` | עברית |
| Persa | `fa` | فارسی |
| Turco | `tr` | Türkçe |

### África

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Suajili | `sw` | Kiswahili |
| Amárico | `am` | አማርኛ |

### Otros

| Idioma | Código | Nombre Nativo |
|--------|--------|---------------|
| Griego | `el` | Ελληνικά |
| Georgiano | `ka` | ქართული |
| Armenio | `hy` | Հայերdelays |

---

## Códigos Regionalizados

Para algunas variantes regionales, usa códigos extendidos:

| Variante | Código |
|----------|--------|
| Inglés (EE.UU.) | `en-US` |
| Inglés (Reino Unido) | `en-GB` |
| Español (España) | `es-ES` |
| Español (México) | `es-MX` |
| Portugués (Brasil) | `pt-BR` |
| Portugués (Portugal) | `pt-PT` |
| Chino Simplificado | `zh-Hans` |
| Chino Tradicional | `zh-Hant` |

---

## Ejemplo de Uso

```python
# Traducción Español a Inglés
translate(
    text="Buenos días, ¿cómo puedo ayudarte?",
    source_lang="Spanish",
    source_code="es",
    target_lang="English", 
    target_code="en"
)

# Traducción Hindi a Francés
translate(
    text="नमस्ते, आप कैसे हैं?",
    source_lang="Hindi",
    source_code="hi",
    target_lang="French",
    target_code="fr"
)
```

---

## Notas Importantes

1. **Códigos ISO**: Usa siempre códigos ISO 639-1 o variantes regionalizadas
2. **Bidireccionalidad**: Todos los idiomas soportan traducción en ambas direcciones
3. **Calidad variable**: Los idiomas de alta disponibilidad (en, es, fr, de, zh, ja) tienen mayor calidad
4. **Evaluación**: Modelos evaluados en el benchmark WMT24++ con los 55 idiomas

---

## Referencia

Para detalles completos sobre el soporte de idiomas, consulta el [Technical Report (arXiv:2601.09012)](https://arxiv.org/abs/2601.09012).
