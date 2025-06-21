# 🧪 Taller - IA Visual Colaborativa: Comparte tus Resultados en Web

## 📅 Fecha
`2025-06-20` – Taller de IA Visual y Visualización Web Colaborativa

---

## 🎯 Objetivo del Taller

Desarrollar una solución integral donde los **resultados de un modelo visual de IA (detecciones YOLO)** puedan ser procesados, exportados y compartidos a través de una **página web interactiva**. El objetivo es permitir que otros usuarios vean y comprendan visualmente qué objetos fueron detectados, sus métricas de confianza y cómo se comportó el sistema de detección.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Detección de objetos con YOLOv8
- [x] Procesamiento de imágenes con OpenCV
- [x] Exportación de datos estructurados (JSON/CSV)
- [x] Desarrollo web con HTML5, CSS3 y JavaScript vanilla
- [x] Visualización interactiva de datos de IA
- [x] Sistemas de archivos y rutas relativas en web
- [x] Integración Python-Web para pipelines de IA
- [x] Diseño responsive y UX para datos científicos

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- **Python 3.8+** con `ultralytics`, `opencv-python`, `matplotlib`
- **YOLOv8** para detección de objetos en tiempo real
- **HTML5/CSS3** con diseño moderno y responsive
- **JavaScript ES6+** para interactividad y manipulación DOM
- **HTTP Server** para servir archivos locales
- **Git** para control de versiones

---

## 📁 Estructura del Proyecto

```
2025-06-20_taller_ia_visual_web_colaborativa/
├── python/                          # Backend de procesamiento IA
│   ├── detector.py                 # Script principal de detección YOLO
│   ├── data/                       # Imágenes de entrada
│   └── requirements.txt            # Dependencias Python
├── web/                            # Frontend web interactivo
│   ├── index.html                  # Página principal completa
│   ├── simple.html                 # Versión simplificada
│   ├── styles.css                  # Estilos modernos y responsive
│   ├── script.js                   # Lógica de visualización
│   └── INSTRUCCIONES_EJECUCION.md  # Guía de uso
├── results/                        # Resultados del procesamiento
│   ├── images/                     # Imágenes con detecciones anotadas
│   │   ├── detection_20250620_230254.jpg
│   │   ├── detection_20250620_231141.jpg
│   │   └── detection_20250620_234304.jpg
│   ├── json/                       # Datos estructurados de detecciones
│   │   ├── detection_20250620_230254.json
│   │   ├── detection_20250620_231141.json
│   │   └── detection_20250620_234304.json
│   └── csv/                        # Estadísticas exportables
├── test-rutas.html                 # Página de verificación de rutas
└── README.md
```

---

## 🧪 Implementación

### 🔹 Etapas realizadas

1. **Configuración del detector YOLO**: Implementación de clase `VisualAIDetector` con YOLOv8 para detección robusta
2. **Procesamiento y exportación**: Sistema automático de guardado de imágenes anotadas y datos JSON/CSV
3. **Desarrollo de interfaz web**: Creación de visualizador interactivo con carga dinámica de resultados
4. **Sistema de rutas y servidor**: Configuración correcta de paths relativos y servidor HTTP local
5. **Optimización de UX**: Implementación de feedback visual, animaciones y diseño responsive
6. **Documentación y testing**: Creación de páginas de prueba y guías de ejecución

### 🔹 Código relevante

#### Detección y Exportación (Python):
```python
class VisualAIDetector:
    def detect_objects(self, image_path: str, confidence: float = 0.5):
        """Detecta objetos usando YOLOv8 y exporta resultados"""
        results = self.model(image_path, conf=confidence)
        
        # Procesar detecciones
        detections = []
        for r in results:
            for box in r.boxes:
                detection = {
                    "class": self.model.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": {
                        "x1": int(box.xyxy[0][0]),
                        "y1": int(box.xyxy[0][1]),
                        "x2": int(box.xyxy[0][2]),
                        "y2": int(box.xyxy[0][3]),
                        "center_x": int((box.xyxy[0][0] + box.xyxy[0][2]) / 2),
                        "center_y": int((box.xyxy[0][1] + box.xyxy[0][3]) / 2)
                    }
                }
                detections.append(detection)
        
        # Exportar a JSON y guardar imagen anotada
        self.save_results(image_data, detections, timestamp)
```

#### Visualización Web (JavaScript):
```javascript
class DetectionViewer {
    async loadDetection() {
        const selectedImage = this.imageSelect.value;
        this.showLoading(true);
        
        try {
            // Cargar datos JSON y imagen
            const jsonData = await this.loadJsonData(jsonFilename);
            await this.loadImage(selectedImage);
            
            // Procesar y visualizar
            this.displayDetectionData(jsonData);
            this.updateStats(jsonData);
            this.createDetectionOverlay(jsonData);
            
        } catch (error) {
            this.showError('Error al cargar la detección: ' + error.message);
        }
    }
    
    createDetectionOverlay(data) {
        // Crear etiquetas flotantes sobre detecciones
        data.detections.forEach((detection, index) => {
            const label = document.createElement('div');
            label.className = 'detection-label fade-in';
            label.textContent = `${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`;
            this.labelOverlay.appendChild(label);
        });
    }
}
```

---

## 📊 Resultados Visuales

### 📌 Qué se detectó y cómo fue procesado:

**Objetos detectados en las imágenes de prueba:**
- **Personas** (confidence: 82.1% - 87.6%)
- **Vehículos** (cars, bicycles - confidence: 67.2% - 94.3%)
- **Señales de tráfico** (traffic lights - confidence: 78.9%)
- **Elementos urbanos** detectados en escenas de calle

**Procesamiento realizado:**
1. **Detección automática** con YOLOv8 modelo nano (yolov8n.pt)
2. **Filtrado por confianza** (threshold: 0.5)
3. **Cálculo de métricas**: bounding boxes, centros, áreas
4. **Anotación visual** con colores y etiquetas
5. **Exportación estructurada** en JSON y CSV

### 📌 **GIFs animados requeridos**:

![Interfaz Web IA Visual](./Resultado/Funcionamiento.gif)

> ✅ **Interfaz Web mostrando resultados:**

**Características demostradas:**
- **Carga dinámica** de imágenes de detección del dropdown
- **Visualización de métricas** en tiempo real (total detecciones, alta confianza, clases únicas)
- **Tabla interactiva** con detalles de cada detección
- **Etiquetas flotantes** sobre objetos detectados
- **Visor JSON** expandible/contraible
- **Diseño responsive** y animaciones suaves

> ✅ **Procesamiento del modelo en Python:**

**Flujo demostrado:**
- **Ejecución del detector** con argumentos de línea de comandos
- **Carga del modelo YOLOv8** y procesamiento de imagen
- **Generación automática** de archivos de salida (JPG, JSON, CSV)
- **Logging detallado** del proceso de detección
- **Exportación de resultados** estructurados para web

---

## 💬 Prompts y Metodología Utilizada

### 🔹 Descripción general de los prompts usados:

**Prompts principales aplicados durante el desarrollo:**

1. **"Crear visualizador web para resultados YOLO"**

2. **"Corregir rutas 404 en servidor local"**

3. **"Implementar etiquetas flotantes sobre detecciones"**

---

## 🔗 Instrucciones de Ejecución

### **Paso 1: Generar detecciones (Python)**
```bash
cd python
pip install ultralytics opencv-python matplotlib
python detector.py --source "data/imagen.jpg" --confidence 0.5
```

### **Paso 2: Iniciar servidor web**
```bash
cd ..  # Volver al directorio del proyecto
python -m http.server 8001
```

### **Paso 3: Abrir visualizador**
```
http://localhost:8001/web/index.html
```

---

## 💬 Reflexión Final

Este taller me ayudó a entender mejor cómo integrar modelos de IA con interfaces web interactivas. Lo más retador fue sincronizar correctamente las rutas entre el backend en Python y el frontend, sobre todo al servir archivos desde diferentes carpetas.

**¿Qué aprendí al visualizar mis resultados?**
Aprendí que mostrar los datos de forma clara es clave para entender y validar modelos. Dibujar bounding boxes y mostrar métricas de confianza con colores hace que todo sea más comprensible. Además, agregar animaciones o estados de carga mejora mucho la experiencia al interactuar con datos complejos.

**¿Cómo mejora esto la colaboración?**
Permitir que otros vean los resultados directamente en el navegador, sin tener que usar Python, abre la puerta a más colaboración. Usar JSON estructurado facilita la integración con otros sistemas, y mostrar estadísticas automáticas ayuda a evaluar rápidamente el rendimiento del modelo.

En el futuro, me gustaría crear dashboards en tiempo real con WebSockets, incluir anotaciones colaborativas y generar reportes técnicos en PDF. También sería útil comparar visualmente diferentes modelos dentro de la misma plataforma.

---

