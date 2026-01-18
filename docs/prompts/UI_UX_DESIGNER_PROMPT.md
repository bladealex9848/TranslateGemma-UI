# Prompt para Diseñador UI/UX: Interfaz de Traducción con TranslateGemma

Este documento contiene un prompt completo y detallado para entregar a un experto diseñador UI/UX que creará la interfaz de usuario para una aplicación de traducción usando los modelos TranslateGemma.

---

## Prompt Completo

```
# Brief de Diseño: Interfaz de Traducción TranslateGemma

## Contexto del Proyecto

Necesito diseñar una interfaz de usuario moderna y profesional para una aplicación de traducción que utiliza los modelos de IA TranslateGemma de Google. La aplicación se conecta a un servidor Ollama local para procesar las traducciones.

### Características del Backend
- Modelos de traducción: TranslateGemma (4B, 12B, 27B parámetros)
- Soporte para 55 idiomas
- Capacidad multimodal (texto e imagen)
- Contexto de hasta 128K tokens
- Ejecución local (privacidad total)

---

## Objetivos de Diseño

### 1. Experiencia de Usuario (UX)
- **Simplicidad**: Interfaz intuitiva que cualquier usuario pueda usar sin capacitación
- **Velocidad**: Diseño que minimice el número de clics para completar una traducción
- **Feedback visual**: Indicadores claros del estado de la traducción (procesando, completado, error)
- **Accesibilidad**: Cumplimiento WCAG 2.1 nivel AA

### 2. Funcionalidades Core
- **Traducción de texto**: Panel dividido origen/destino con intercambio rápido
- **Selección de idiomas**: Selector con los 55 idiomas soportados, favoritos y recientes
- **Traducción de imágenes**: Área de drag & drop para subir imágenes con texto
- **Historial**: Acceso rápido a traducciones anteriores
- **Copiar/Exportar**: Botones para copiar y descargar traducciones

### 3. Funcionalidades Avanzadas
- **Selección de modelo**: Opción para elegir entre 4B, 12B y 27B
- **Traducción por lotes**: Subir múltiples documentos
- **Modo offline**: Indicador de conexión con el servidor Ollama
- **Temas**: Modo claro/oscuro

---

## Requisitos de Diseño Visual

### Estética
- **Estilo**: Moderno, limpio, profesional
- **Inspiración**: Google Translate, DeepL, pero con identidad propia
- **Colores**: Paleta que transmita confianza y tecnología (azules, blancos, acentos sutiles)
- **Tipografía**: Sans-serif legible, soporte multilingüe (Noto Sans, Inter)

### Componentes UI Requeridos
1. **Barra de navegación**
   - Logo
   - Selector de modelo
   - Indicador de conexión Ollama
   - Configuración

2. **Panel de traducción principal**
   - Área de texto origen (izquierda)
   - Selector de idioma origen con detección automática
   - Botón de intercambio de idiomas
   - Área de texto destino (derecha)
   - Selector de idioma destino
   - Indicador de progreso durante traducción

3. **Barra de acciones**
   - Botón traducir
   - Copiar traducción
   - Descargar como archivo
   - Limpiar campos

4. **Panel de imagen** (para traducción multimodal)
   - Zona de drop para imágenes
   - Preview de imagen
   - Texto extraído y traducido

5. **Panel lateral/historial**
   - Lista de traducciones recientes
   - Búsqueda en historial
   - Favoritos

---

## Diseños Requeridos

### Screens Desktop (1440px+)
1. Vista principal de traducción
2. Modal de selección de idiomas
3. Vista de historial expandido
4. Configuración/preferencias
5. Estado de error (servidor desconectado)

### Screens Tablet (768px - 1439px)
1. Vista principal adaptada (paneles apilados o lado a lado)
2. Navegación adaptada

### Screens Mobile (< 768px)
1. Vista principal con pestañas (origen/destino)
2. Selector de idiomas fullscreen
3. Menú hamburguesa

---

## Estados y Microinteracciones

### Estados de la traducción
- Idle (esperando entrada)
- Typing (usuario escribiendo)
- Translating (procesando, mostrar animación)
- Complete (traducción finalizada)
- Error (mostrar mensaje descriptivo)

### Animaciones
- Transición suave al intercambiar idiomas
- Skeleton loading durante traducción
- Fade-in del texto traducido
- Animación sutil al copiar (toast notification)

---

## Consideraciones Técnicas

### Responsividad
- Diseño mobile-first
- Breakpoints: 320px, 768px, 1024px, 1440px

### Performance percibido
- Mostrar caracteres a medida que llegan (streaming)
- Skeleton loaders mientras carga

### Accesibilidad
- Contraste mínimo 4.5:1
- Focus states visibles
- Labels en todos los inputs
- Lectores de pantalla compatibles

---

## Entregables Esperados

1. **Wireframes** de baja fidelidad para flujos principales
2. **Mockups** de alta fidelidad para todas las pantallas
3. **Prototipo interactivo** (Figma/Adobe XD)
4. **Guía de estilos** (colores, tipografía, componentes)
5. **Especificaciones** para desarrollo (espaciados, tamaños, etc.)

---

## Referencias y Recursos

### Competidores a analizar
- Google Translate (simplicidad)
- DeepL (calidad percibida)
- Microsoft Translator (integración)
- Reverso (contexto)

### Recursos disponibles
- Lista de 55 idiomas soportados
- Documentación de API Ollama
- Logos y assets de marca (si aplica)

---

## Timeline

- Wireframes: 3 días
- Primera iteración mockups: 5 días
- Revisiones: 2 días
- Prototipo y entregables finales: 3 días

---

## Preguntas para definir antes de diseñar

1. ¿Habrá autenticación de usuarios o es uso anónimo?
2. ¿Qué tan prominente debe ser la selección de modelo?
3. ¿Se almacena el historial local o en servidor?
4. ¿Hay restricciones de marca/colores corporativos?
5. ¿Prioridad: desktop o mobile?
```

---

## Notas para el Diseñador

### Puntos Clave a Comunicar

1. **Privacidad como valor**: La ejecución local es un diferenciador. Considerar mostrar esto visualmente.

2. **55 idiomas**: El selector de idiomas es crítico. Considerar búsqueda, categorías por región, y favoritos.

3. **Multimodal**: La capacidad de traducir texto en imágenes es única. Destacar en el diseño.

4. **Selección de modelo**: Usuarios técnicos querrán elegir el modelo. Usuarios normales no deberían verse abrumados.

5. **Estado de conexión**: Al ser local, el servidor Ollama puede no estar corriendo. Manejar este caso elegantemente.
