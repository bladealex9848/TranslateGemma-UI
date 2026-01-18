# Modelos TranslateGemma

TranslateGemma ofrece tres variantes de modelo optimizadas para diferentes casos de uso y requisitos de hardware.

## Comparativa de Modelos

| Característica | 4B | 12B | 27B |
|---------------|-----|-----|-----|
| Parámetros | 4 Billion | 12 Billion | 27 Billion |
| Tamaño en disco | 3.3 GB | 8.1 GB | 17 GB |
| Contexto | 128K tokens | 128K tokens | 128K tokens |
| Entrada | Texto, Imagen | Texto, Imagen | Texto, Imagen |
| RAM requerida | ~6 GB | ~12 GB | ~24 GB |

---

## TranslateGemma 4B

### Descripción
Modelo optimizado para **dispositivos móviles y edge**. Ofrece rendimiento potente para traducción on-device.

### Requisitos
- RAM: 6+ GB
- Almacenamiento: 4 GB libres
- GPU: Opcional (mejora rendimiento)

### Instalación
```bash
ollama pull translategemma:4b
# o simplemente:
ollama pull translategemma
```

### Caso de uso ideal
- Aplicaciones móviles de traducción
- Dispositivos IoT con capacidad de cómputo
- Traducción offline en laptops básicas

---

## TranslateGemma 12B

### Descripción
Diseñado para ejecutar eficientemente en **laptops consumer**. Proporciona calidad de traducción de nivel investigación.

### Requisitos
- RAM: 12+ GB
- Almacenamiento: 10 GB libres
- GPU: NVIDIA con 8+ GB VRAM (recomendado)

### Instalación
```bash
ollama pull translategemma:12b
```

### Caso de uso ideal
- Herramientas de traducción profesional
- Desarrollo y testing local
- Traducción de documentos medianos

---

## TranslateGemma 27B

### Descripción
Construido para **máxima fidelidad**. Típicamente desplegado en cloud, capaz de ejecutar en una sola GPU H100 o TPU.

### Requisitos
- RAM: 32+ GB
- Almacenamiento: 20 GB libres
- GPU: NVIDIA H100 / A100 con 24+ GB VRAM

### Instalación
```bash
ollama pull translategemma:27b
```

### Caso de uso ideal
- Traducción de alta precisión
- Producción en cloud
- Documentos técnicos y legales

---

## Benchmarks de Rendimiento

Según el [Technical Report](https://arxiv.org/abs/2601.09012):

- **12B TranslateGemma** supera al baseline **Gemma 3 27B**
- **4B TranslateGemma** rivaliza con el baseline **12B**
- Ganancias consistentes y sustanciales sobre modelos base en todos los tamaños

### Evaluación WMT24++
Los modelos fueron evaluados en el benchmark WMT24++ con 55 pares de idiomas, mostrando mejoras significativas respecto a los modelos base Gemma 3.

---

## Comandos Útiles de Ollama

```bash
# Ver modelos instalados
ollama list

# Información del modelo
ollama show translategemma:12b

# Ejecutar modelo específico
ollama run translategemma:12b

# Eliminar modelo
ollama rm translategemma:4b
```

---

## Configuración de GPU

### NVIDIA
```bash
# Verificar que CUDA está disponible
nvidia-smi

# Ollama detecta GPU automáticamente
ollama run translategemma:12b
```

### Apple Silicon (M1/M2/M3)
```bash
# Metal está habilitado por defecto
ollama run translategemma:12b
```

### CPU Only
```bash
# Forzar ejecución en CPU
OLLAMA_HOST=0.0.0.0 ollama serve
```
