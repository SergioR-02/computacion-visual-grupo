# 🎯 Integración YOLO - Detección de Objetos de Basura

## 🚀 Nueva Funcionalidad Implementada

Se ha integrado exitosamente **YOLO (You Only Look Once)** para detección de objetos de basura en tiempo real, complementando el sistema de clasificación existente.

## 🔧 Arquitectura del Sistema

### **Backend (Flask + YOLO)**
```
Backend/
├── api_server.py                 # ✅ API principal con YOLO integrado
├── photo_classifier.py          # ✅ Clasificador tradicional  
├── yolotest/runs/detect/
│   └── garbage_detection_precise/weights/
│       └── best.pt              # 🎯 Modelo YOLO entrenado
└── requirements.txt             # ✅ Dependencias actualizadas
```

### **Frontend (React + Three.js)**
```
ThreejsFrontend/src/components/
├── CameraModule.jsx             # ✅ Cámara con toggle YOLO/Clasificación
├── ImageAnalysisModule.jsx      # ✅ Análisis de imágenes con YOLO
└── Dashboard.jsx                # ✅ Visualización de resultados
```

## 🎮 Funcionalidades Disponibles

### **1. Clasificación Tradicional** 📊
- **Modelo:** `garbage_classifier_final.h5`
- **Clases:** 10+ categorías (plastic, glass, metal, etc.)
- **Salida:** Una clase principal con confianza
- **Uso:** Análisis general de materiales

### **2. Detección YOLO** 🎯
- **Modelo:** `best.pt` (YOLOv8/11)
- **Clases:** 6 categorías específicas
  - `BIODEGRADABLE` 🌱
  - `CARDBOARD` 📦
  - `GLASS` 🍾
  - `METAL` 🔩
  - `PAPER` 📄
  - `PLASTIC` 🍼
- **Salida:** Múltiples objetos con bounding boxes
- **Uso:** Detección precisa de objetos múltiples

## 🌐 Endpoints API

### **Clasificación (Existente)**
```http
POST /classify
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

### **Detección YOLO (Nuevo)** 🆕
```http
POST /detect
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

### **Estado del Sistema**
```http
GET /detect/status
```

## 🔄 WebSocket Events

### **Tiempo Real Clasificación**
```javascript
socket.emit('start_detection', { use_detection: false });
```

### **Tiempo Real Detección YOLO** 🆕
```javascript
socket.emit('start_detection', { use_detection: true });
```

## 📱 Interfaz de Usuario

### **Toggle de Modo**
- **Clasificación** 👁️: Análisis tradicional
- **Detección YOLO** 🎯: Detección de objetos múltiples

### **Indicadores de Estado**
- 🟢 **YOLO Disponible**: Sistema operativo
- 🔴 **YOLO No Disponible**: Revisar servidor
- 🟣 **Tiempo Real**: Conexión WebSocket activa

### **Visualización**
- **Clasificación**: Box central con etiqueta
- **Detección**: Bounding boxes múltiples con colores

## 🎨 Respuesta de Detección YOLO

```json
{
  "success": true,
  "result": {
    "detections": [
      {
        "class": "PLASTIC",
        "category": "plastic",
        "category_name": "Plástico",
        "confidence": 0.89,
        "confidence_percentage": 89.0,
        "bbox": {
          "x1": 0.1, "y1": 0.2,
          "x2": 0.8, "y2": 0.9,
          "width": 0.7, "height": 0.7
        },
        "color": "#FF0000"
      }
    ],
    "detection_count": 1,
    "inference_time_ms": 45.2,
    "model_type": "YOLO"
  }
}
```

## 🚀 Cómo Usar

### **1. Ejecutar Backend**
```bash
cd Backend
python api_server.py
```

### **2. Ejecutar Frontend**
```bash
cd ThreejsFrontend
npm run dev
```

### **3. Usar la Aplicación**

#### **Análisis de Imagen**
1. Ve al Dashboard
2. Selecciona "Análisis de Imagen"
3. Elige modo: **Clasificación** o **Detección YOLO**
4. Sube una imagen
5. Presiona **Detectar Objetos** o **Analizar Imagen**

#### **Tiempo Real**
1. Ve al Dashboard
2. Selecciona "Cámara"
3. **Activa la cámara**
4. Elige modo: **Clasificación** o **Detección YOLO**
5. Toggle **Tiempo Real**
6. Presiona **Iniciar Detección YOLO** o **Clasificación Continua**

## 🔍 Diferencias Clave

| Característica | Clasificación | Detección YOLO |
|----------------|---------------|----------------|
| **Objetos** | 1 objeto principal | Múltiples objetos |
| **Precisión** | Categoría general | Localización exacta |
| **Velocidad** | ~50ms | ~45ms |
| **Visualización** | Box central | Bounding boxes |
| **Consejos** | ✅ ChatGPT + básicos | ❌ Solo básicos |
| **Uso** | Análisis general | Conteo y ubicación |

## 🛠️ Configuración Técnica

### **Dependencias Nuevas**
```txt
ultralytics>=8.0.0
torch>=2.0.0
torchvision>=0.15.0
```

### **Estructura de Datos Frontend**
```javascript
// Clasificación
{
  object: "Plástico",
  category: "plastic",
  confidence: 0.89,
  detection_type: "classification",
  advice: { consejos: "...", impacto: "..." }
}

// Detección YOLO
{
  object: "Plástico",
  category: "plastic", 
  confidence: 0.89,
  detection_type: "yolo",
  bbox: { x1: 0.1, y1: 0.2, width: 0.7, height: 0.7 },
  color: "#FF0000"
}
```

## 🎯 Casos de Uso Recomendados

### **Usar Clasificación Cuando:**
- Quieres análisis general de material
- Necesitas consejos de reciclaje detallados
- Tienes un objeto principal en la imagen
- Requieres integración con ChatGPT

### **Usar Detección YOLO Cuando:**
- Hay múltiples objetos en la imagen
- Necesitas conteo exacto de objetos
- Quieres localización precisa
- Trabajas con inventarios o conteos

## 🚨 Troubleshooting

### **YOLO No Disponible**
```bash
# Verificar modelo
ls Backend/yolotest/runs/detect/garbage_detection_precise/weights/best.pt

# Instalar dependencias
pip install ultralytics torch torchvision

# Revisar logs
python api_server.py  # Ver mensajes de inicialización
```

### **Error de Conexión**
```bash
# Verificar puerto
curl http://localhost:5000/health

# Estado YOLO
curl http://localhost:5000/detect/status
```

## 📊 Monitoreo del Sistema

El servidor muestra información detallada al iniciar:

```
🌐 Iniciando servidor API...
📡 Disponible en: http://localhost:5000
🔗 Endpoints HTTP:
   GET  /health - Verificar estado
   POST /classify - Clasificar imagen
   POST /detect - Detectar objetos con YOLO ✅
   GET  /detect/status - Estado del detector YOLO ✅
🎯 Modelos disponibles:
   📊 Clasificación: garbage_classifier_final.h5 ✅
   🎯 Detección YOLO: best.pt ✅
```

## 🎉 ¡Disfruta la Nueva Funcionalidad!

La integración YOLO está completamente funcional y lista para uso en producción. El frontend se adapta automáticamente según la disponibilidad del modelo YOLO. 