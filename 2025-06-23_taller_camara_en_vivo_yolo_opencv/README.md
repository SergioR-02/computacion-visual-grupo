# 🎯 Taller de Cámara en Vivo: Captura y Procesamiento de Video en Tiempo Real con YOLO

📅 **Fecha:** 2025-06-23 – Fecha de realización

🎯 **Objetivo del Taller:**
Conectar la cámara web del PC y procesar el video en tiempo real usando Python, OpenCV y YOLO para aplicar filtros visuales y realizar detección de objetos en vivo. Este taller combina técnicas de visión artificial clásica con modelos de detección basados en aprendizaje profundo.

## 🧠 Conceptos Aprendidos

Lista de conceptos clave aplicados en el taller:

* **Captura de video en tiempo real**: Uso de OpenCV para acceder y procesar frames de la webcam.
* **Filtros de imagen clásicos**: Aplicación de operaciones de procesamiento como escala de grises, binarización y detección de bordes.
* **Detección de objetos con YOLO**: Implementación de un modelo de detección de objetos en tiempo real.
* **Visualización múltiple**: Presentación simultánea de varias ventanas con diferentes procesamientos.
* **Interacción por teclado**: Control de la aplicación mediante eventos de teclado.

## 🔧 Herramientas y Entornos

* Python 3.x
* OpenCV (opencv-python)
* NumPy
* Ultralytics (YOLOv8)

## 📁 Estructura del Proyecto

```
taller_camara_en_vivo_yolo_opencv/
├── python/
│   └── camara_yolo_opencv.py
├── resultados/
└── requirements.txt
```

## 🧪 Implementación

La implementación se centra en la captura y procesamiento de video en tiempo real desde la webcam, combinando filtros clásicos de visión por computador con detección de objetos mediante YOLO.

### 🔹 Etapas realizadas

1. **Captura de video**: Configuración de la webcam como fuente de video mediante OpenCV.
2. **Procesamiento básico**: Aplicación de filtros clásicos como escala de grises, binarización y detección de bordes.
3. **Detección con YOLO**: Integración del modelo YOLOv8 para identificar objetos en tiempo real.
4. **Visualización**: Creación de múltiples ventanas para mostrar los diferentes procesamientos.
5. **Interacción**: Implementación de controles por teclado para cambiar filtros, pausar/reanudar, y guardar capturas.

### 🔹 Código relevante

📌 **1. Configuración de la Captura y YOLO**

```python
def __init__(self, modelo_path='../../../yolov8n.pt'):
    # Inicializar captura de video
    self.cap = cv2.VideoCapture(0)
    if not self.cap.isOpened():
        raise Exception("No se pudo abrir la cámara")
    
    # Cargar modelo YOLO
    self.modelo = YOLO(modelo_path)
    
    # Estado de filtros
    self.filtro_actual = 0
    self.filtros = ["Original", "Escala de grises", "Binarización", "Detección de bordes"]
```

📌 **2. Aplicación de Filtros**

```python
def aplicar_filtro(self, frame, tipo_filtro):
    """Aplica diferentes filtros al frame según el tipo seleccionado"""
    if tipo_filtro == 0:  # Original
        return frame
    elif tipo_filtro == 1:  # Escala de grises
        return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    elif tipo_filtro == 2:  # Binarización
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        return binary
    elif tipo_filtro == 3:  # Detección de bordes
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        return edges
```

📌 **3. Detección de Objetos con YOLO**

```python
def detectar_objetos(self, frame):
    """Detecta objetos en el frame usando YOLO y dibuja los resultados"""
    resultados = self.modelo.predict(frame, conf=0.5)
    frame_anotado = frame.copy()
    
    # Dibujar cajas y etiquetas
    for r in resultados:
        boxes = r.boxes
        for box in boxes:
            # Coordenadas de la caja
            x1, y1, x2, y2 = box.xyxy[0]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            
            # Confianza y clase
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            nombre_clase = self.modelo.names[cls]
            
            # Dibujar caja
            cv2.rectangle(frame_anotado, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Mostrar etiqueta con clase y confianza
            etiqueta = f'{nombre_clase}: {conf:.2f}'
            cv2.putText(frame_anotado, etiqueta, (x1, y1-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    return frame_anotado
```

📌 **4. Bucle Principal y Control de Interacción**

```python
def ejecutar(self):
    """Ejecuta el bucle principal de captura y procesamiento"""
    self.grabando = False
    
    # Configurar ventanas
    cv2.namedWindow("Original con YOLO", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Filtro Aplicado", cv2.WINDOW_NORMAL)
    
    print("\n--- Controles ---")
    print("ESC: Salir")
    print("ESPACIO: Pausar/Reanudar")
    print("F: Cambiar filtro")
    print("S: Guardar captura")
    print("R: Grabar video de 5 segundos")
    
    while True:
        if not self.pausado:
            ret, frame = self.cap.read()
            if not ret:
                print("Error al leer el frame")
                break
            
            # Detectar objetos con YOLO
            frame_yolo = self.detectar_objetos(frame)
            
            # Aplicar filtro seleccionado
            frame_filtrado = self.aplicar_filtro(frame, self.filtro_actual)
            
            # Mostrar frames
            cv2.imshow("Original con YOLO", frame_yolo)
            cv2.imshow("Filtro Aplicado", frame_filtrado_display)
        
        # Capturar tecla
        key = cv2.waitKey(1) & 0xFF
        
        # Procesar teclas
        if key == 27:  # ESC
            break
        elif key == 32:  # ESPACIO
            self.pausado = not self.pausado
```

## 📊 Resultados y Análisis

### 📌 Detección de Objetos en Vivo con YOLO y Filtros Aplicados al Video
![Detección de Objetos](./resultados/Dteccion%20y%20filtros.gif)

## 🧩 Prompts Usados

"Implementa un sistema de captura de video desde webcam con OpenCV y Python"

"Integra YOLOv8 para detección de objetos en tiempo real en Python"

"Aplica filtros de procesamiento de imagen como escala de grises y detección de bordes a un video"

"Optimiza la visualización múltiple de procesamiento de video en OpenCV"

## 💬 Reflexión Final

Este taller me permitió explorar la combinación de técnicas clásicas de visión por computador con modelos modernos de detección basados en aprendizaje profundo. YOLO demostró ser muy eficiente para detección en tiempo real, aunque su rendimiento varía según las condiciones de iluminación y el hardware disponible.

La detección fue particularmente precisa con objetos comunes como personas, sillas, mesas y dispositivos electrónicos, mientras que mostró algunas dificultades con objetos pequeños o parcialmente ocultos. Para optimizar el rendimiento, se podría reducir la resolución de los frames procesados o utilizar modelos más ligeros como YOLOv8n.

Un desafío importante fue mantener una tasa de cuadros fluida mientras se ejecutaban múltiples procesamientos en paralelo. La solución implicó balancear la complejidad de los filtros aplicados con la frecuencia de actualización deseada.
