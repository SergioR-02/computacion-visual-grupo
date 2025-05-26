# Taller - Interfaces Multimodales: Uniendo Voz y Gestos

## 📅 Fecha

`2025-05-26` – Taller Interfaces Multimodales: Uniendo Voz y Gestos

---

## 🎯 Objetivo del Taller

Fusionar gestos (detectados con MediaPipe) y comandos de voz para realizar acciones compuestas dentro de una interfaz visual. Este taller introduce los fundamentos de los sistemas de interacción multimodal, combinando dos formas de entrada humana para enriquecer la experiencia de control.

---

## 🧠 Conceptos Aprendidos

### 🤖 Detección de Gestos con MediaPipe

- **MediaPipe Hands**: Framework de Google para detección de manos en tiempo real
- **Clasificación de gestos**: Algoritmos para reconocer patrones específicos de la mano
- **Características principales**:
  - ✅ Detección de 21 puntos de referencia (landmarks) por mano
  - ✅ Clasificación automática de gestos comunes (puño, mano abierta, OK, etc.)
  - ✅ Seguimiento en tiempo real con alta precisión
  - ✅ Normalización respecto a la muñeca para invarianza de posición

### 🎤 Reconocimiento de Voz

- **SpeechRecognition**: Biblioteca para convertir voz a texto
- **Comandos de voz**: Sistema de palabras clave para activar acciones
- **Características principales**:
  - ✅ Reconocimiento continuo en segundo plano
  - ✅ Filtrado de ruido ambiente automático
  - ✅ Síntesis de voz (TTS) para feedback auditivo
  - ✅ Optimización para diferentes tipos de micrófono

### 🔄 Interacción Multimodal

- **Fusión de modalidades**: Combinación inteligente de gestos y voz
- **Acciones compuestas**: Comandos que requieren ambas entradas simultáneamente
- **Pipeline de procesamiento**: Gesto → Voz → Validación → Acción
- **Feedback multimodal**: Respuesta visual, auditiva y textual

### 🎮 Sistema de Objetos Interactivos

- **Objeto dinámico**: Entidad visual que responde a comandos multimodales
- **Propiedades modificables**: Color, posición, movimiento, rotación
- **Estados persistentes**: Memoria de configuraciones entre comandos
- **Animaciones fluidas**: Transiciones suaves entre estados

---

## 🔧 Herramientas y Entornos

- **Python 3.8+** - Lenguaje de programación principal
- **MediaPipe v0.10** - Detección de gestos y landmarks de manos
- **OpenCV v4.8** - Procesamiento de video y visualización
- **SpeechRecognition v3.10** - Reconocimiento de voz
- **PyAudio v0.2.11** - Captura de audio del micrófono
- **Pygame v2.5** - Interfaz gráfica y renderizado 2D
- **NumPy v1.24** - Cálculos matemáticos y procesamiento de arrays
- **pyttsx3 v2.90** - Síntesis de voz (Text-to-Speech)

📌 Implementación completa en Python con arquitectura modular

---

## 📁 Estructura del Proyecto

```
2025-05-26_taller_interfaces_multimodales_voz_gestos/
├── python/                           # Implementación Python
│   ├── main.py                      # Aplicación principal (705 líneas)
│   ├── gesture_trainer.py           # Entrenador de gestos personalizados
│   └── requirements.txt             # Dependencias del proyecto
├── resultados/                       # Evidencias visuales
│   └── voice_interface.gif          # Demostración del sistema (275MB)
└── README.md                        # Esta documentación
```

---

## 🧪 Implementación

### 🔹 Arquitectura del Sistema

El sistema está compuesto por cuatro clases principales:

1. **`GestureDetector`**: Maneja la detección y clasificación de gestos
2. **`VoiceRecognizer`**: Procesa comandos de voz en tiempo real
3. **`InteractiveObject`**: Objeto visual que responde a comandos
4. **`MultimodalInterface`**: Coordinador principal del sistema

### 🔹 Gestos Reconocidos

| Gesto   | Descripción               | Uso Principal                     |
| ------- | ------------------------- | --------------------------------- |
| `open`  | Mano abierta (5 dedos)    | Cambiar colores, activar comandos |
| `fist`  | Puño cerrado (0 dedos)    | Activar rotación                  |
| `peace` | Dos dedos (V de victoria) | Activar movimiento                |
| `point` | Un dedo (señalar)         | Navegación                        |
| `ok`    | Círculo pulgar-índice     | Mostrar estadísticas              |

### 🔹 Comandos de Voz

| Comando                             | Función                       | Requiere Gesto       |
| ----------------------------------- | ----------------------------- | -------------------- |
| `cambiar`                           | Cambiar color                 | Mano abierta         |
| `mover`                             | Activar/desactivar movimiento | Dos dedos (opcional) |
| `rotar`                             | Activar/desactivar rotación   | Puño (opcional)      |
| `mostrar`                           | Ver estadísticas              | Gesto OK (opcional)  |
| `azul`, `rojo`, `verde`, `amarillo` | Cambiar a color específico    | Mano abierta         |
| `parar`                             | Detener todas las acciones    | Ninguno              |
| `reset`                             | Reiniciar objeto              | Ninguno              |
| `salir`                             | Cerrar aplicación             | Ninguno              |

### 🔹 Código Relevante

**Detección y clasificación de gestos:**

```python
def classify_gesture(self, hand_landmarks) -> str:
    """Clasifica el gesto basado en las posiciones de los landmarks"""
    if not hand_landmarks:
        return "none"

    landmarks = hand_landmarks.landmark

    # Obtener posiciones de los dedos
    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    ring_tip = landmarks[16]
    pinky_tip = landmarks[20]

    # Contar dedos extendidos
    fingers_up = []

    # Lógica de clasificación basada en landmarks
    # ... (código completo en main.py líneas 51-100)

    total_fingers = sum(fingers_up)

    if total_fingers == 0:
        return "fist"
    elif total_fingers == 5:
        return "open"
    elif total_fingers == 2 and fingers_up[1] and fingers_up[2]:
        return "peace"
    # ... más clasificaciones
```

**Procesamiento multimodal:**

```python
def process_multimodal_action(self, gesture: str, command: str):
    """Procesa acciones que requieren combinación de gesto y voz"""
    action_performed = False

    # Acciones que requieren combinaciones específicas
    if command == "cambiar" and gesture == "open":
        self.change_object_color()
        message = "🎨 Color cambiado con mano abierta"
        action_performed = True

    elif command == "mover" and gesture == "peace":
        self.toggle_object_movement()
        message = "🏃 Movimiento activado con dos dedos"
        action_performed = True

    elif command == "rotar" and gesture == "fist":
        self.toggle_object_rotation()
        message = "🌀 Rotación activada con puño"
        action_performed = True

    # ... más combinaciones (código completo líneas 478-553)
```

**Reconocimiento de voz continuo:**

```python
def listen_continuously(self):
    """Inicia el reconocimiento de voz en segundo plano"""
    def listen_worker():
        while self.is_listening:
            try:
                with self.microphone as source:
                    # Escuchar con timeout
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=3)

                # Reconocer en segundo plano
                command = self.recognizer.recognize_google(audio, language='es-ES').lower()

                # Filtrar comandos válidos
                for valid_command in VOICE_COMMANDS:
                    if valid_command in command:
                        self.command_queue.put(valid_command)
                        break

            except Exception:
                continue  # Continuar escuchando

    # Ejecutar en hilo separado
    self.is_listening = True
    threading.Thread(target=listen_worker, daemon=True).start()
```

### 🔹 Características Avanzadas

**Entrenador de Gestos Personalizados (`gesture_trainer.py`):**

- Sistema para entrenar nuevos gestos
- Extracción de características basada en landmarks
- Almacenamiento persistente en JSON
- Reconocimiento por similitud euclidiana

**Optimizaciones de Hardware:**

- Detección automática de micrófono EMEET SmartCam Nova 4K
- Ajuste dinámico de umbral de ruido
- Configuración específica para diferentes dispositivos de audio

**Feedback Multimodal:**

- Respuesta visual en tiempo real
- Síntesis de voz para confirmación de acciones
- Mensajes de estado temporales
- Estadísticas de uso en vivo

---

## 📊 Resultados Visuales

### 📌 Demostración del Sistema Multimodal:

![Demostración de interfaces multimodales](./resultados/voice_interface.gif)

El sistema muestra claramente:

### 🎯 Detección de Gestos en Tiempo Real:

- ✅ **Landmarks precisos**: 21 puntos de referencia por mano detectados
- ✅ **Clasificación automática**: Reconocimiento instantáneo de gestos
- ✅ **Feedback visual**: Etiquetas y conexiones dibujadas en tiempo real
- ✅ **Robustez**: Funciona con diferentes iluminaciones y fondos

### 🎤 Reconocimiento de Voz Continuo:

- ✅ **Escucha permanente**: Sistema siempre activo en segundo plano
- ✅ **Filtrado inteligente**: Solo reconoce comandos válidos
- ✅ **Respuesta auditiva**: Confirmación por síntesis de voz
- ✅ **Tolerancia a ruido**: Ajuste automático de sensibilidad

### 🔄 Interacciones Multimodales:

- ✅ **Combinaciones específicas**: Gesto + voz = acción única
- ✅ **Comandos independientes**: Voz sola también funciona
- ✅ **Estados persistentes**: El objeto mantiene sus propiedades
- ✅ **Animaciones fluidas**: Transiciones suaves entre estados

### 🎮 Objeto Interactivo Dinámico:

- ✅ **Cambios de color**: 8 colores diferentes disponibles
- ✅ **Movimiento físico**: Velocidad y dirección variables
- ✅ **Rotación continua**: Animación de giro suave
- ✅ **Rebotes**: Colisión con bordes de pantalla

---

## 🎮 Controles Implementados

### 👋 Controles por Gestos

- **Mano abierta**: Activar cambios de color y comandos generales
- **Puño cerrado**: Activar rotación del objeto
- **Dos dedos (V)**: Activar movimiento del objeto
- **Gesto OK**: Mostrar estadísticas del sistema
- **Un dedo**: Navegación y señalización

### 🎤 Controles por Voz

- **"cambiar"**: Cambiar color (requiere mano abierta)
- **"mover"**: Activar/desactivar movimiento
- **"rotar"**: Activar/desactivar rotación
- **"mostrar"**: Ver estadísticas
- **Colores**: "azul", "rojo", "verde", "amarillo"
- **"parar"**: Detener todas las acciones
- **"reset"**: Reiniciar objeto
- **"salir"**: Cerrar aplicación

### ⌨️ Controles de Teclado

- **ESC**: Salir de la aplicación
- **R**: Reiniciar objeto a estado inicial

---

## 🔍 Algoritmos de Procesamiento

### Detección de Gestos

1. **Captura de frame**: OpenCV obtiene imagen de la cámara
2. **Conversión RGB**: MediaPipe requiere formato RGB
3. **Detección de manos**: Localización de hasta 2 manos
4. **Extracción de landmarks**: 21 puntos 3D por mano
5. **Clasificación**: Algoritmo basado en posiciones relativas
6. **Filtrado**: Validación de gestos consistentes

### Reconocimiento de Voz

1. **Captura continua**: PyAudio graba audio del micrófono
2. **Detección de actividad**: Umbral dinámico de energía
3. **Segmentación**: Extracción de frases completas
4. **Reconocimiento**: Google Speech API convierte a texto
5. **Filtrado**: Solo comandos válidos pasan al sistema
6. **Cola de comandos**: Buffer thread-safe para procesamiento

### Fusión Multimodal

1. **Sincronización temporal**: Ventana de tiempo para combinar entradas
2. **Validación de combinaciones**: Reglas específicas gesto+voz
3. **Priorización**: Comandos multimodales tienen precedencia
4. **Fallback**: Comandos de voz funcionan independientemente
5. **Feedback**: Confirmación visual y auditiva de acciones

---

## 💡 Prompts Utilizados

Para la implementación de este proyecto, utilicé los siguientes prompts principales:

1. **"Crear un sistema que combine detección de gestos con MediaPipe y reconocimiento de voz para controlar objetos en pantalla"**

   - Generó la arquitectura base del sistema multimodal

2. **"Implementar clasificación de gestos basada en landmarks de MediaPipe con gestos como mano abierta, puño, dos dedos y OK"**

   - Desarrolló el algoritmo de clasificación de gestos

3. **"Añadir reconocimiento de voz continuo que funcione en segundo plano y responda a comandos específicos en español"**

   - Creó el sistema de voz con threading y cola de comandos

4. **"Crear un objeto interactivo que cambie color, se mueva y rote basado en combinaciones específicas de gestos y comandos de voz"**

   - Implementó la lógica de interacción multimodal

5. **"Agregar un entrenador de gestos personalizados que permita al usuario crear y guardar nuevos gestos"**
   - Generó el módulo `gesture_trainer.py` con ML básico

---

## 🚀 Instrucciones de Uso

### Instalación

```bash
# Clonar el repositorio
cd 2025-05-26_taller_interfaces_multimodales_voz_gestos/python

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación principal
python main.py

# Ejecutar entrenador de gestos (opcional)
python gesture_trainer.py
```

### Configuración de Hardware

1. **Cámara**: Cualquier webcam USB o integrada
2. **Micrófono**: Preferiblemente EMEET SmartCam Nova 4K (optimizado)
3. **Audio**: Altavoces o auriculares para feedback de voz

### Uso del Sistema

1. **Inicio**: El sistema detecta automáticamente cámara y micrófono
2. **Calibración**: Ajuste automático de ruido ambiente (2 segundos)
3. **Interacción**: Combinar gestos y comandos de voz según la tabla
4. **Monitoreo**: Observar estadísticas en tiempo real
5. **Salida**: Comando "salir" o tecla ESC

---

## 💬 Reflexión Final

Este taller me permitió comprender profundamente cómo los **sistemas multimodales** pueden crear experiencias de usuario más ricas e intuitivas. La combinación de **detección de gestos** y **reconocimiento de voz** no es simplemente sumar dos tecnologías, sino crear una nueva forma de interacción que aprovecha las fortalezas de cada modalidad.

Lo más revelador fue entender que la **fusión multimodal** requiere:

- **Sincronización temporal**: Las entradas deben coordinarse en tiempo real
- **Validación contextual**: No todas las combinaciones tienen sentido
- **Feedback inmediato**: El usuario necesita confirmación de sus acciones
- **Tolerancia a errores**: Los sistemas deben ser robustos ante falsos positivos

La implementación práctica me ayudó a apreciar los desafíos técnicos:

- **Procesamiento en tiempo real** con múltiples hilos
- **Calibración automática** para diferentes entornos
- **Gestión de recursos** (cámara, micrófono, GPU)
- **Experiencia de usuario** fluida y natural

Para futuros proyectos, estos conceptos son fundamentales para:

- **Interfaces de realidad aumentada** donde gestos y voz son naturales
- **Sistemas de accesibilidad** para usuarios con diferentes capacidades
- **Aplicaciones industriales** donde las manos están ocupadas
- **Gaming y entretenimiento** con controles más inmersivos
- **Robótica social** que entiende comunicación humana natural

El sistema desarrollado demuestra que las **interfaces multimodales** no son el futuro, sino el presente de la interacción humano-computadora.
