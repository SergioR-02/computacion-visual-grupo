# 🧪 Taller - Reconocimiento de Acciones Simples con Detección de Postura

## 🔍 Objetivo del taller

Implementar el reconocimiento de acciones simples (como sentarse, levantar brazos o caminar frente a cámara) usando MediaPipe Pose para detectar la postura corporal. El objetivo es utilizar puntos clave del cuerpo (landmarks) para interpretar la acción y responder visual o sonoramente.

## 🛠️ Instalación

### Paso 1: Instalar dependencias

```bash
cd python
pip install -r requirements.txt
```

O ejecutar el archivo batch:

```bash
./install.bat
```

### Dependencias necesarias:

- `mediapipe>=0.10.0` - Para detección de postura corporal
- `opencv-python>=4.8.0` - Para captura de video y visualización
- `numpy>=1.24.0` - Para cálculos matemáticos
- `pygame>=2.5.0` - Para efectos de sonido

## 🚀 Ejecución

### Opción 1: Ejemplo Simple (Recomendado para comenzar)

```bash
python simple_example.py
```

Este ejemplo incluye detección básica de:

- 🙌 Brazos arriba
- 🪑 Persona sentada
- 🧍 De pie

### Opción 2: Demo Interactivo

```bash
python interactive_demo.py
```

Demo guiado paso a paso que te enseña cada acción:

- Instrucciones claras en pantalla
- Retroalimentación visual
- Progreso de detección en tiempo real

### Opción 3: Sistema Completo

```bash
python main.py
```

Sistema completo con detección avanzada de:

- 🙌 Brazos arriba
- 🪑 Sentado
- 🚶 Caminando
- 🤸 Agachado
- � Brazos extendidos
- �🧍 De pie

## 🎯 Acciones Detectables

### 1. 🙌 Brazos Arriba

- **Descripción**: Levantar ambos brazos por encima de la cabeza
- **Condición**: Ambas muñecas por encima de la nariz
- **Lógica**: `left_wrist_y < nose_y AND right_wrist_y < nose_y`

### 2. 🪑 Sentado

- **Descripción**: Persona sentada en una silla
- **Condición**: Caderas cerca del nivel de las rodillas
- **Lógica**: `abs(hip_y - knee_y) < threshold`

### 3. 🚶 Caminando

- **Descripción**: Movimiento de caminar frente a la cámara
- **Condición**: Variación en posición de los pies
- **Lógica**: Análisis de historial de movimiento de pies

### 4. 🤸 Agachado

- **Descripción**: Posición en cuclillas
- **Condición**: Torso comprimido, rodillas dobladas
- **Lógica**: `torso_height < threshold AND knees_bent`

### 5. 🤲 Brazos Extendidos

- **Descripción**: Brazos extendidos horizontalmente
- **Condición**: Muñecas al nivel de hombros, separadas horizontalmente
- **Lógica**: `vertical_diff < threshold AND horizontal_diff > threshold`

### 6. 🧍 De pie

- **Descripción**: Postura neutral sin acciones específicas
- **Condición**: Estado por defecto cuando no se detectan otras acciones

## 🧠 Ejemplos de Reglas Condicionales

```python
# Detección de brazos arriba
if left_wrist_y < nose_y and right_wrist_y < nose_y:
    print("¡Ambos brazos arriba!")

# Detección de persona sentada
elif abs(left_hip_y - left_knee_y) < threshold:
    print("Persona sentada")

# Detección de brazos extendidos
elif (abs(left_wrist_y - left_shoulder_y) < vertical_threshold and
      abs(left_wrist_x - left_shoulder_x) > horizontal_threshold):
    print("Brazos extendidos")

# Detección de agachado
elif torso_height < normal_torso_threshold:
    print("Persona agachada")
```

## 📊 Características del Sistema

### 🎥 Detección en Tiempo Real

- ✅ Captura de webcam a 30 FPS
- ✅ Procesamiento de 33 landmarks corporales
- ✅ Visualización de conexiones del esqueleto
- ✅ Indicadores visuales por acción

### 🎯 Sistema de Confianza

- ✅ Cálculo de confianza por acción (0.0 - 1.0)
- ✅ Filtrado por visibilidad de landmarks
- ✅ Detección robusta con umbrales ajustables
- ✅ Historial para acciones de movimiento

### 🎨 Interfaz Visual

- ✅ Colores diferentes por tipo de landmark
- ✅ Información en tiempo real en pantalla
- ✅ Efecto espejo para facilidad de uso
- ✅ Barra de progreso para confirmación

### 🔊 Efectos de Sonido

- ✅ Tonos únicos por cada acción
- ✅ Activación/desactivación con tecla 's'
- ✅ Generación procedural de audio

## 🎮 Controles

### Sistema Principal (main.py)

- **'q'**: Salir del programa
- **'s'**: Activar/desactivar sonidos
- **'r'**: Reiniciar historial de movimiento

### Demo Interactivo (interactive_demo.py)

- **'q'**: Salir del programa
- **'r'**: Reiniciar demo completo
- **'n'**: Saltar a siguiente acción

## 🔧 Personalización

### Ajustar Sensibilidad

En `main.py`, puedes modificar los umbrales:

```python
# Umbrales para detección de sentado
sitting_threshold = height * 0.15  # Ajustar para mayor/menor sensibilidad

# Umbral para detección de caminata
movement_threshold = width * 0.02  # Reducir para mayor sensibilidad

# Confianza mínima para MediaPipe
min_detection_confidence=0.5  # Aumentar para mayor precisión
min_tracking_confidence=0.5   # Aumentar para tracking más estable
```

### Agregar Nuevas Acciones

1. Crear función de detección en la clase `PoseActionDetector`
2. Agregar llamada en `detect_action()`
3. Agregar color y sonido en los mapeos correspondientes

### Ejemplo de Nueva Acción:

```python
def detect_jumping(self, landmarks, width: int, height: int) -> bool:
    """Detectar si la persona está saltando"""
    if not landmarks:
        return False

    # Obtener posiciones de pies
    left_foot_x, left_foot_y = self.get_landmark_position(
        landmarks, self.mp_pose.PoseLandmark.LEFT_FOOT_INDEX, width, height)
    right_foot_x, right_foot_y = self.get_landmark_position(
        landmarks, self.mp_pose.PoseLandmark.RIGHT_FOOT_INDEX, width, height)

    # Lógica: pies por encima del nivel normal (simplificado)
    normal_ground_level = height * 0.9  # 90% de la altura

    return left_foot_y < normal_ground_level and right_foot_y < normal_ground_level
```

## 🔊 Sistema de Sonido

El sistema incluye generación procedural de tonos únicos para cada acción:

- **🙌 Brazos Arriba**: 800 Hz (tono agudo)
- **🪑 Sentado**: 400 Hz (tono medio)
- **🤸 Agachado**: 300 Hz (tono grave)
- **🤲 Brazos Extendidos**: 600 Hz (tono medio-agudo)
- **🚶 Caminando**: 500 Hz (tono medio)

## 🐛 Solución de Problemas

### ❌ Error de Cámara

```
Error: No se pudo abrir la cámara
```

**Soluciones**:

- Verificar que no haya otras aplicaciones usando la webcam
- Cambiar el índice de cámara: `cv2.VideoCapture(1)` en lugar de `(0)`
- Reiniciar la aplicación

### ❌ MediaPipe no detecta postura

**Causas posibles**:

- Iluminación insuficiente
- Persona muy lejos de la cámara
- Postura parcialmente fuera del encuadre

**Soluciones**:

- Mejorar iluminación del ambiente
- Acercarse a la cámara (distancia recomendada: 1-2 metros)
- Reducir `min_detection_confidence` a 0.3
- Asegurar que todo el cuerpo esté visible

### ❌ Detección incorrecta o inestable

**Soluciones**:

- Ajustar umbrales en las funciones de detección
- Mejorar condiciones de iluminación
- Usar fondo uniforme y contrastante
- Calibrar para tu altura/proporciones específicas
- Aumentar `min_tracking_confidence` para mayor estabilidad

### ❌ Error de instalación de dependencias

```
ERROR: Could not build wheels for mediapipe
```

**Soluciones**:

- Actualizar pip: `python -m pip install --upgrade pip`
- Instalar Visual Studio Build Tools (Windows)
- Usar Python 3.8-3.11 (versiones compatibles)

## 📈 Métricas y Rendimiento

- **FPS típico**: 15-30 (dependiendo del hardware)
- **Latencia**: < 100ms para detección
- **Precisión**: ~85-95% en condiciones óptimas
- **Landmarks procesados**: 33 puntos corporales
- **Memoria RAM**: ~200-500MB durante ejecución

## 🎓 Conceptos Técnicos

### Landmarks de MediaPipe Pose

El sistema utiliza 33 puntos clave del cuerpo:

- **0**: Nariz
- **11, 12**: Hombros (izquierdo, derecho)
- **13, 14**: Codos (izquierdo, derecho)
- **15, 16**: Muñecas (izquierda, derecha)
- **23, 24**: Caderas (izquierda, derecha)
- **25, 26**: Rodillas (izquierda, derecha)
- **31, 32**: Pies (izquierdo, derecho)

### Algoritmos de Detección

1. **Detección basada en posición relativa**: Comparar coordenadas Y de landmarks
2. **Detección basada en distancia**: Calcular distancias euclidianas
3. **Detección temporal**: Análisis de historial de movimientos
4. **Detección de ángulos**: Calcular ángulos entre segmentos corporales

## 🔬 Extensiones Sugeridas

### Nivel Básico

1. **Contador de repeticiones** - Contar flexiones, sentadillas
2. **Detector de posturas de yoga** - Asanas básicas
3. **Sistema de puntuación** - Gamificación de ejercicios

### Nivel Intermedio

4. **Análisis de simetría corporal** - Corrección postural
5. **Detección de ejercicios específicos** - Rutinas de gimnasio
6. **Integración con base de datos** - Guardar progreso

### Nivel Avanzado

7. **Reconocimiento de gestos de manos** (MediaPipe Hands)
8. **Detección de expresiones faciales** (MediaPipe Face)
9. **Control de dispositivos IoT** - Domótica por gestos
10. **Análisis biomecánico** - Métricas deportivas avanzadas

## 🏆 Desafíos Propuestos

### 🥉 Bronce

- Implementar detección de "manos en la cintura"
- Agregar contador de tiempo por acción
- Crear sistema de puntuación simple

### 🥈 Plata

- Detectar secuencias de movimientos (ej: saludo completo)
- Implementar filtros de suavizado para detección más estable
- Agregar calibración automática por usuario

### 🥇 Oro

- Crear sistema de entrenamiento personal interactivo
- Implementar análisis de calidad de movimiento
- Desarrollar API REST para integración con otras aplicaciones

## 📚 Referencias y Recursos

### Documentación Oficial

- [MediaPipe Pose](https://google.github.io/mediapipe/solutions/pose.html)
- [OpenCV Python](https://opencv-python-tutroals.readthedocs.io/)
- [Pygame Documentation](https://www.pygame.org/docs/)

### Tutoriales Adicionales

- [MediaPipe Python Examples](https://github.com/google/mediapipe/tree/master/mediapipe/python)
- [Computer Vision with Python](https://opencv-python-tutroals.readthedocs.io/en/latest/)

### Datasets y Modelos

- [COCO Pose Dataset](https://cocodataset.org/#keypoints-2020)
- [Human3.6M Dataset](http://vision.imar.ro/human3.6m/)

---

**¡Felicitaciones!** 🎉 Has completado el taller de reconocimiento de acciones simples con detección de postura. Este proyecto te introduce a los conceptos fundamentales de visión por computadora y análisis de movimiento humano.
