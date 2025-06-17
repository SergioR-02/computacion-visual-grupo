# 🧪 Taller - Obras Interactivas: Pintando con Voz y Gestos

## 📅 Fecha

`2025-06-15` – Taller de Pintura Interactiva con Voz y Gestos

---

## 🎯 Objetivo del Taller

Crear una obra artística digital que pueda ser controlada mediante comandos de voz o movimientos de las manos. Este taller integra técnicas de interacción natural con una visualización creativa, permitiendo al usuario dibujar sin mouse ni teclado, usando su cuerpo y su voz como herramientas expresivas.

---

## 🧠 Conceptos Aprendidos

Lista de conceptos aplicados en este taller:

- [x] **Detección de gestos con MediaPipe** - Reconocimiento de manos y clasificación de gestos
- [x] **Reconocimiento de voz en tiempo real** - Comandos de voz para control de la aplicación
- [x] **Síntesis de voz (TTS)** - Retroalimentación auditiva al usuario
- [x] **Procesamiento de imágenes con OpenCV** - Captura de cámara y manipulación de canvas
- [x] **Programación multi-threading** - Hilos separados para audio, video y reconocimiento
- [x] **Interfaces visuales interactivas** - HUD informativo y visualización en tiempo real
- [x] **Sistemas de coordenadas normalizadas** - Mapeo de gestos a posiciones en canvas
- [x] **Manejo de estados y modos** - Control de diferentes tipos de pinceles y acciones
- [x] **Persistencia de datos** - Guardado automático de obras generadas
- [x] **Arquitectura orientada a objetos** - Diseño modular y escalable

---

## 🔧 Herramientas y Entornos

**Python** (Entorno principal):

- `mediapipe==0.10.8` - Detección y seguimiento de manos en tiempo real
- `opencv-python==4.8.1.78` - Procesamiento de video y manipulación de imágenes
- `SpeechRecognition==3.10.0` - Reconocimiento de voz multiplataforma
- `pyaudio==0.2.11` - Interfaz de audio para captura de micrófono
- `pyttsx3==2.90` - Síntesis de voz para retroalimentación
- `numpy==1.24.3` - Operaciones numéricas y manejo de arrays
- `pygame==2.5.2` - Soporte adicional para audio (opcional)
- `playsound==1.3.0` - Reproducción de sonidos

**Sistemas de Reconocimiento**:

- **Google Speech Recognition** - Reconocimiento de voz en español
- **MediaPipe Hands** - Detección de landmarks de manos con 21 puntos

📌 Instalación automática disponible con `pip install -r requirements.txt`

---

## 📁 Estructura del Proyecto

```
2025-06-15_taller_pintura_interactiva_voz_gestos/
├── python/                         # Entorno principal de desarrollo
│   ├── main.py                     # 🎮 Aplicación principal (17KB, 427 líneas)
│   ├── requirements.txt            # 📦 Lista de dependencias
├── obras/                          # 🎨 Imágenes generadas por el usuario
│   ├── obra_interactiva_20250615_115622.png
│   └── obra_interactiva_20250615_110608.png
├── results/                        # 📸 Evidencias visuales del funcionamiento
│   └── interactive_voice_result.gif # 🎬 GIF demostrativo (249MB)
└── README.md                       # 📚 Documentación completa
```

📎 Estructura modular con separación clara entre código, obras generadas y evidencias visuales.

---

## 🧪 Implementación

### 🔹 Flujo Voz + Gestos → Acción Visual

El sistema funciona mediante la integración de tres componentes principales:

1. **Captura y Análisis de Gestos**:

   - MediaPipe detecta 21 landmarks por mano en tiempo real
   - Clasificación automática de gestos: dedo índice, palma abierta, puño cerrado
   - Mapeo de coordenadas normalizadas (0-1) a píxeles del canvas

2. **Reconocimiento de Comandos de Voz**:

   - Escucha continua en hilo separado para no bloquear la interfaz
   - Reconocimiento en español usando Google Speech API
   - Procesamiento de comandos para colores, acciones y modos

3. **Renderizado Visual Interactivo**:
   - Canvas independiente para la obra artística
   - Interfaz HUD con información de estado en tiempo real
   - Múltiples tipos de pinceles y modos de dibujo

### 🔹 Gestos Implementados

| Gesto                     | Acción            | Descripción                                       |
| ------------------------- | ----------------- | ------------------------------------------------- |
| **Dedo índice extendido** | Dibujar           | Controla la posición del pincel principal         |
| **Palma abierta**         | Cambiar pincel    | Cicla entre tipos: circular → cuadrado → estrella |
| **Puño cerrado**          | Borrador temporal | Borra en la posición actual                       |

### 🔹 Comandos de Voz Disponibles

**Colores**: `rojo`, `verde`, `azul`, `amarillo`, `morado`, `cian`, `blanco`, `negro`

**Acciones**:

- `limpiar` / `borrar todo` - Reinicia el canvas
- `guardar` - Exporta la obra actual como PNG
- `pincel` - Activa modo dibujo
- `borrador` - Activa modo borrador

**Control**:

- `activar` / `desactivar` - Control de detección de gestos

### 🔹 Código Relevante

**Núcleo de detección de gestos**:

```python
def detectar_gestos(self, landmarks, hand_landmarks):
    """Detectar diferentes tipos de gestos basados en posición de dedos"""
    puntos = np.array([[lm.x, lm.y] for lm in hand_landmarks.landmark])

    # Análisis de extensión de dedos
    indice_extendido = puntos[8][1] < puntos[6][1]  # Tip vs PIP
    medio_extendido = puntos[12][1] < puntos[10][1]
    anular_extendido = puntos[16][1] < puntos[14][1]
    meñique_extendido = puntos[20][1] < puntos[18][1]

    # Clasificación de gestos
    if indice_extendido and not medio_extendido and not anular_extendido:
        return "dedo_indice", puntos[8]
    elif all([indice_extendido, medio_extendido, anular_extendido, meñique_extendido]):
        return "palma_abierta", puntos[9]  # Centro de palma
    elif not any([indice_extendido, medio_extendido, anular_extendido, meñique_extendido]):
        return "puño_cerrado", puntos[9]
```

**Sistema de dibujo adaptativo**:

```python
def dibujar_en_canvas(self, x, y, gesto):
    """Dibujar según gesto detectado con diferentes tipos de pincel"""
    px, py = int(x * self.canvas_width), int(y * self.canvas_height)

    if gesto == "dedo_indice" and self.posicion_anterior:
        if self.tipo_pincel == "circular":
            cv2.line(self.canvas, self.posicion_anterior, (px, py),
                    self.color_actual, self.grosor_pincel)
        elif self.tipo_pincel == "estrella":
            # Dibujo de forma estrella personalizada
            puntos_estrella = self._generar_estrella(px, py, self.grosor_pincel)
            cv2.fillPoly(self.canvas, [puntos_estrella], self.color_actual)
```

**Integración de reconocimiento de voz**:

```python
def escuchar_comandos_voz(self):
    """Hilo dedicado para reconocimiento continuo de voz"""
    while self.escuchando_voz:
        try:
            with self.microphone as source:
                audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=3)
                comando = self.recognizer.recognize_google(audio, language="es-ES")
                self.procesar_comando_voz(comando)
        except (sr.UnknownValueError, sr.WaitTimeoutError):
            pass  # Continuar escuchando
```

---

## 📊 Resultados Visuales

### 📌 GIF Demostrativo del Funcionamiento

![Pintura Interactiva con Voz y Gestos](./results/interactive_voice_result.gif)

**El GIF demuestra:**

- 🎥 **Captura en tiempo real** de gestos de mano con landmarks visibles
- ✋ **Detección de gestos** - dedo índice para dibujar, palma para cambiar pincel
- 🎤 **Comandos de voz** - cambios de color y acciones mediante voz
- 🎨 **Dibujo simultáneo** en canvas independiente con diferentes tipos de pincel
- 📊 **Interfaz HUD** mostrando estado actual, color, tipo de pincel y último comando
- 🔊 **Retroalimentación TTS** confirmando acciones ejecutadas

### 📸 **Obras Generadas**

Las obras se guardan automáticamente en la carpeta `obras/` con timestamp:

- `obra_interactiva_20250615_115622.png` - Obra compleja con múltiples colores
- `obra_interactiva_20250615_110608.png` - Obra minimalista con gestos básicos

### 🎬 **Características del Sistema:**

- **Detección multi-gesto**: Reconoce simultáneamente posición y tipo de gesto
- **Canvas independiente**: Separación entre vista de cámara y obra artística
- **Pinceles adaptativos**: Circular, cuadrado y estrella con cambio por gesto
- **Retroalimentación completa**: Visual (HUD) + auditiva (TTS)
- **Controles híbridos**: Teclado + voz + gestos para máxima flexibilidad

---

## 🧩 Prompts Usados

### ✅ **Prompts de Desarrollo Utilizados**

#### 1. **Prompt Inicial de Arquitectura**

```text
"Necesito crear una aplicación de pintura interactiva que combine MediaPipe para detección de gestos de mano con speech_recognition para comandos de voz. La aplicación debe permitir dibujar en un canvas usando el dedo índice como pincel, cambiar colores por voz, y tener diferentes tipos de pinceles controlados por gestos. Usa OpenCV para la interfaz visual."
```

**Resultado**: Estructura base de la clase `PinturaInteractiva` con integración completa de todos los componentes.

#### 2. **Prompt para Detección de Gestos**

```text
"Implementa un sistema de clasificación de gestos usando los 21 landmarks de MediaPipe Hands. Necesito detectar: dedo índice extendido (para dibujar), palma abierta (cambiar pincel), y puño cerrado (borrador). La detección debe ser robusta y basada en la posición relativa de los puntos clave."
```

**Resultado**: Función `detectar_gestos()` con lógica de clasificación basada en análisis geométrico de landmarks.

#### 3. **Prompt para Comandos de Voz**

```text
"Crea un sistema de reconocimiento de voz en español que procese comandos para cambiar colores (rojo, verde, azul, etc.), acciones (limpiar, guardar, pincel, borrador) y control (activar, desactivar). Debe funcionar en un hilo separado para no bloquear la interfaz visual."
```

**Resultado**: Sistema completo de reconocimiento con threading y procesamiento de comandos en español.

#### 4. **Prompt para Tipos de Pincel**

```text
"Implementa diferentes tipos de pinceles que se puedan cambiar por gestos: circular (líneas normales), cuadrado (rectángulos), y estrella (forma personalizada). El cambio debe ocurrir cuando se detecte palma abierta y debe haber retroalimentación TTS."
```

**Resultado**: Sistema de pinceles adaptativos con formas geométricas personalizadas.

#### 5. **Prompt para Interfaz HUD**

```text
"Diseña una interfaz HUD que muestre en tiempo real: color actual, tipo de pincel, modo (dibujo/borrador), estado de detección, último comando de voz, y controles disponibles. Debe ser informativa pero no intrusiva."
```

**Resultado**: Interfaz completa con panel de información, muestra de color y instrucciones.

#### 6. **Prompt para Optimización de Rendimiento**

```text
"Optimiza el sistema para que funcione fluidamente con múltiples hilos: uno para video, uno para audio, y el principal para la interfaz. Asegúrate de que no haya bloqueos y que la detección sea responsiva."
```

**Resultado**: Arquitectura multi-threading optimizada con manejo robusto de recursos.

📎 **Estrategia de Prompting**: Desarrollo incremental, especificidad técnica, integración modular y optimización continua.

---

## 💬 Reflexión Final

**¿Cómo te sentiste pintando con tu cuerpo y tu voz?**

La experiencia de pintar usando gestos y voz fue sorprendentemente intuitiva y liberadora. Al principio, la coordinación entre el movimiento de las manos y los comandos de voz requería concentración, pero rápidamente se volvió natural. La sensación de controlar el arte sin dispositivos tradicionales creó una conexión más directa y expresiva con la obra. El feedback inmediato del sistema (visual y auditivo) hizo que la interacción se sintiera fluida y responsiva.

**¿Qué parte fue más compleja o interesante?**

La parte más compleja fue sincronizar correctamente los múltiples hilos de ejecución sin crear bloqueos o conflictos de recursos. La detección de gestos requirió un análisis cuidadoso de la geometría de los landmarks para crear clasificadores robustos que funcionaran con diferentes posiciones de mano. Lo más interesante fue descubrir cómo pequeños cambios en los umbrales de detección podían mejorar dramáticamente la precisión del reconocimiento de gestos, y cómo la retroalimentación TTS creaba una experiencia más inmersiva.

**¿Qué mejorarías o qué aplicarías en futuros proyectos?**

Para futuros proyectos implementaría un sistema de calibración personalizada para adaptar la detección a diferentes usuarios y condiciones de iluminación. También agregaría soporte para gestos con dos manos simultáneamente, permitiendo acciones más complejas como zoom, rotación o selección de áreas. La arquitectura modular desarrollada es perfectamente aplicable para proyectos de realidad aumentada, interfaces de accesibilidad, control de presentaciones, o instalaciones artísticas interactivas. El patrón de integración multimodal (voz + gestos + visual) será especialmente valioso para crear experiencias de usuario más naturales e inclusivas.

---
