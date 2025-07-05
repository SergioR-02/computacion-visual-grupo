# 🧪 Taller - Reconocimiento de Acciones Simples con Detección de Postura

## 📅 Fecha

`2025-06-25` – Taller de Reconocimiento de Acciones Simples con Detección de Postura

---

## 🎯 Objetivo del Taller

Implementar el reconocimiento de acciones simples (como sentarse, levantar brazos o caminar frente a cámara) usando MediaPipe Pose para detectar la postura corporal. El objetivo es utilizar puntos clave del cuerpo (landmarks) para interpretar la acción y responder visual o sonoramente.

---

## 🧠 Conceptos Aprendidos

Lista de conceptos aplicados en este taller:

- [x] **Detección de Postura con MediaPipe Pose** - Extracción de 33 landmarks corporales en 3D.
- [x] **Análisis Geométrico de Landmarks** - Cálculo de ángulos y distancias entre puntos clave para interpretar posturas.
- [x] **Clasificación de Acciones Basada en Reglas** - Implementación de lógica para identificar acciones como "sentado" o "brazos arriba".
- [x] **Procesamiento de Video en Tiempo Real** - Uso de OpenCV para capturar, procesar y mostrar el video de la cámara.
- [x] **Manejo de Estados y Umbrales** - Definición de umbrales para activar la detección de acciones y evitar falsos positivos.
- [x] **Retroalimentación Visual** - Dibujo del esqueleto y muestra de texto en pantalla para informar la acción detectada.
- [x] **Programación Orientada a Objetos** - Estructuración del código en clases para una mejor organización y escalabilidad.

---

## 🔧 Herramientas y Entornos

**Python** (Entorno principal):

- `mediapipe==0.10.9` - Detección de postura y landmarks corporales.
- `opencv-python==4.8.1.78` - Captura de cámara, procesamiento de imágenes y visualización.
- `numpy==1.24.3` - Operaciones numéricas para el análisis de landmarks.

**Sistemas de Reconocimiento**:

- **MediaPipe Pose** - Modelo de ML para la detección de 33 puntos clave del cuerpo humano en tiempo real.

📌 Instalación automática disponible con `pip install -r requirements.txt` desde el directorio `python/`.

---

## 📁 Estructura del Proyecto

```
2025-06-14_taller_reconocimiento_postura_mediapipe/
├── python/                         # Entorno principal de desarrollo
│   ├── main.py                     # 🎮 Aplicación principal que ejecuta la detección
│   ├── interactive_demo.py         # (Opcional) Script para demostraciones interactivas
│   └── requirements.txt            # 📦 Lista de dependencias
├── results/                        # 📸 Evidencias visuales del funcionamiento
│   └── reconocimiento_postura_result.gif # 🎬 GIF demostrativo
└── README.md                       # 📚 Documentación completa
```

📎 Estructura limpia que separa el código fuente, los resultados y la documentación.

---

## 🧪 Implementación

### 🔹 Flujo de Reconocimiento de Acciones

El sistema opera siguiendo un flujo de trabajo claro para identificar acciones a partir del video:

1.  **Captura de Video**: Se utiliza OpenCV para capturar el feed de la cámara web cuadro por cuadro.
2.  **Detección de Postura**: Cada cuadro se procesa con MediaPipe Pose para detectar los 33 landmarks corporales.
3.  **Análisis de Landmarks**: Si se detecta una postura, se extraen las coordenadas de los puntos clave necesarios.
4.  **Clasificación de Acción**: Se aplica una lógica basada en reglas y umbrales para determinar si se está realizando una acción conocida.
5.  **Visualización**: El cuadro original se anota con el esqueleto de la postura y el nombre de la acción detectada, y se muestra en pantalla.

### 🔹 Acciones Implementadas

| Acción                    | Lógica de Detección                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Brazos Arriba**         | Se verifica si las coordenadas Y de las muñecas (`15`, `16`) están por encima de las de los hombros (`11`, `12`).         |
| **Sentado**               | Se calcula el ángulo de las rodillas y las caderas. Si ambos ángulos son inferiores a 110 grados, se considera "sentado". |
| **Caminando en el sitio** | Se monitorea la variación vertical de los tobillos (`27`, `28`) para detectar un movimiento alternado y rítmico.          |
| **Inclinación Lateral**   | Se mide la pendiente de la línea formada por los hombros. Si supera un umbral, se detecta una inclinación.                |

### 🔹 Código Relevante

**Cálculo de ángulo entre tres puntos**:

```python
def calcular_angulo(a, b, c):
    """Calcula el ángulo entre tres puntos (en grados)."""
    a = np.array(a)  # Primer punto
    b = np.array(b)  # Punto medio (vértice)
    c = np.array(c)  # Tercer punto

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle
```

**Lógica principal de detección**:

```python
def detectar_accion(landmarks):
    """Clasifica una acción basada en la configuración de landmarks."""
    # Extraer landmarks relevantes
    hombro_izq = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
    codo_izq = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
    muñeca_izq = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

    # Calcular ángulo del codo izquierdo como ejemplo
    angulo = calcular_angulo(hombro_izq, codo_izq, muñeca_izq)

    # Lógica de clasificación (ejemplo simple)
    if angulo > 160:
        return "Brazo Izquierdo Extendido"
    elif angulo < 40:
        return "Brazo Izquierdo Flexionado"

    # ... Lógica para otras acciones como "Sentado" ...

    return "Neutral"
```

---

## 📊 Resultados Visuales

### 📌 GIF Demostrativo del Funcionamiento

![Reconocimiento de Postura con MediaPipe](./results/reconocimiento_postura_result.gif)

**El GIF demuestra:**

- 👤 **Detección en tiempo real** de los 33 landmarks corporales.
- 🦴 **Visualización del esqueleto** superpuesto en la imagen de la cámara.
- 💪 **Reconocimiento de "Brazos Arriba"** cuando el usuario levanta ambos brazos.
- 🧘 **Detección de "Sentado"** cuando el usuario se sienta en una silla.
- 🚶 **Identificación de "Caminando"** al simular caminar en el sitio.
- 💬 **Etiqueta de texto** en la esquina superior izquierda que muestra la acción detectada dinámicamente.

### 🎬 **Características del Sistema:**

- **Alta velocidad**: El sistema procesa el video fluidamente gracias a la eficiencia de MediaPipe.
- **Robustez**: La detección funciona desde diferentes ángulos y distancias moderadas.
- **Bajo consumo de recursos**: No requiere hardware especializado, funciona en CPUs modernas.
- **Extensible**: La arquitectura basada en reglas facilita la adición de nuevas acciones personalizadas.

---

## 🧩 Prompts Usados

### ✅ **Prompts de Desarrollo Utilizados**

#### 1. **Prompt Inicial de Arquitectura**

```text
"Crea un script en Python que use OpenCV para capturar video de la webcam y MediaPipe Pose para detectar y dibujar los landmarks de la postura en tiempo real. La estructura debe estar en una clase para mantener el código organizado."
```

**Resultado**: Clase base con el bucle principal de OpenCV y la inicialización de MediaPipe Pose.

#### 2. **Prompt para Lógica de Detección**

```text
"Escribe una función que tome los 33 landmarks de MediaPipe Pose como entrada y determine si la persona está 'sentada'. Para ello, calcula el ángulo de las articulaciones de la cadera y la rodilla. Si ambos ángulos son menores a 110 grados, debe devolver 'Sentado'."
```

**Resultado**: Una función de `calcular_angulo` y la lógica específica para detectar la acción de sentarse.

#### 3. **Prompt para Detección de Brazos Arriba**

```text
"Implementa una función que detecte si el usuario tiene los 'brazos arriba'. La condición es que las coordenadas 'y' de ambas muñecas sean menores que las coordenadas 'y' de los hombros correspondientes."
```

**Resultado**: Lógica simple y eficiente para comparar las posiciones verticales de muñecas y hombros.

#### 4. **Prompt para Visualización de Resultados**

```text
"Modifica el script para que, además de dibujar el esqueleto, muestre el nombre de la acción detectada en la esquina superior izquierda de la ventana de video. El texto debe ser claro y visible."
```

**Resultado**: Uso de la función `cv2.putText` para superponer el estado actual en el fotograma de video.

#### 5. **Prompt para Estructura de Proyecto y README**

```text
"Genera una estructura de proyecto recomendada para una aplicación de reconocimiento de postura con Python. Incluye un archivo README.md documentando el objetivo, las herramientas, la implementación y los resultados, con ejemplos de código y un GIF demostrativo."
```

**Resultado**: Este mismo archivo `README.md` que estás leyendo y la organización de carpetas sugerida.

---

## 💬 Reflexión Final

**¿Qué te pareció traducir movimientos corporales en datos analizables?**

Es fascinante ver cómo un movimiento humano, algo que percibimos de forma tan natural, puede descomponerse en un conjunto de coordenadas y ángulos. La capacidad de MediaPipe para abstraer la complejidad del cuerpo humano en 33 puntos clave es increíblemente poderosa. Al principio, definir las "reglas" para una acción como "sentarse" se siente como tratar de enseñarle a una máquina a entender un concepto muy humano, lo cual es un desafío muy interesante.

**¿Qué parte fue más compleja o interesante?**

La parte más compleja fue definir umbrales que funcionaran de manera robusta. Un umbral de ángulo que funciona para una persona puede no ser ideal para otra, o puede variar según el ángulo de la cámara. Esto requiere ajuste fino y pruebas. Lo más interesante fue, sin duda, el momento "eureka" en que la lógica funciona y la etiqueta en la pantalla refleja correctamente el movimiento que estás realizando. Es una conexión muy directa entre tu acción física y la respuesta del programa.

**¿Qué mejorarías o qué aplicarías en futuros proyectos?**

Para mejorar, en lugar de reglas fijas, se podría entrenar un modelo de aprendizaje automático (como una red neuronal recurrente o LSTM) que aprenda a reconocer acciones a partir de secuencias de landmarks. Esto permitiría detectar acciones más complejas y dinámicas (como saludar, aplaudir o diferentes tipos de ejercicios). Esta misma tecnología se puede aplicar a proyectos de fisioterapia virtual, control de videojuegos mediante el cuerpo (exergaming), análisis de rendimiento deportivo o sistemas de seguridad para detectar caídas en personas mayores. La base creada en este taller es un excelente punto de partida para todas esas aplicaciones.

---


