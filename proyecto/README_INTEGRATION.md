# Integración Frontend-Backend: Clasificación de Imágenes

Esta integración permite que el frontend ThreejsFrontend envíe imágenes al backend de Python para clasificación usando inteligencia artificial.

## 🚀 Configuración Rápida

### 1. Backend (Servidor Python)

**Ir al directorio Backend:**
```bash
cd Backend
```

**Instalar dependencias automáticamente:**
```bash
python setup_api.py
```

**O manualmente:**
```bash
pip install -r requirements.txt
```

**Ejecutar servidor API:**
```bash
python api_server.py
```

El servidor estará disponible en `http://localhost:5000`

### 2. Frontend (React)

**Ir al directorio ThreejsFrontend:**
```bash
cd ThreejsFrontend
```

**Instalar dependencias:**
```bash
npm install
```

**Ejecutar servidor de desarrollo:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📋 Cómo Usar

1. **Iniciar ambos servidores** (backend en puerto 5000, frontend en puerto 5173)
2. **Abrir el frontend** en tu navegador
3. **Navegar** al módulo de análisis de imágenes
4. **Subir una imagen** arrastrando y soltando, o seleccionando archivo
5. **Hacer clic en "Analizar"** para enviar la imagen al backend
6. **Ver resultados** de la clasificación en tiempo real

## 🔧 Endpoints de la API

### `GET /health`
Verificar que el servidor está funcionando.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "API de clasificación de basura funcionando correctamente"
}
```

### `POST /classify`
Clasificar una imagen enviada.

**Parámetros:**
- `image`: Imagen en formato base64 (JSON) o archivo multipart

**Respuesta exitosa:**
```json
{
  "success": true,
  "result": {
    "category": "plastic",
    "category_name": "Plástico",
    "confidence": 0.85,
    "confidence_percentage": 85.0,
    "original_class": "bottle",
    "inference_time_ms": 45.2,
    "top_predictions": [
      {
        "class": "bottle",
        "confidence": 0.85,
        "confidence_percentage": 85.0
      }
    ]
  }
}
```

### `GET /categories`
Obtener lista de categorías disponibles.

**Respuesta:**
```json
{
  "success": true,
  "categories": {
    "battery": "Batería",
    "biological": "Orgánico",
    "cardboard": "Cartón",
    "clothes": "Ropa",
    "glass": "Vidrio",
    "metal": "Metal",
    "paper": "Papel",
    "plastic": "Plástico",
    "shoes": "Zapatos",
    "trash": "Basura General"
  }
}
```

## 🧠 Categorías de Clasificación

El sistema puede identificar los siguientes tipos de basura:

- **🔋 Batería**: Baterías y pilas
- **🌱 Orgánico**: Restos de comida y material biodegradable
- **📦 Cartón**: Cajas y empaques de cartón
- **👕 Ropa**: Textiles y prendas de vestir
- **🍾 Vidrio**: Botellas y objetos de vidrio
- **🔧 Metal**: Latas y objetos metálicos
- **📄 Papel**: Documentos y papel
- **🥤 Plástico**: Botellas y envases plásticos
- **👟 Zapatos**: Calzado en general
- **🗑️ Basura General**: Otros tipos de desechos

## 🛠️ Solución de Problemas

### Error de Conexión
**Problema:** `Error de conexión. Asegúrate de que el servidor backend esté funcionando en http://localhost:5000`

**Solución:**
1. Verificar que el servidor backend esté ejecutándose
2. Probar accediendo a `http://localhost:5000/health` en el navegador
3. Verificar que no haya conflictos de puerto

### Error de Dependencias
**Problema:** Errores al instalar dependencias de Python

**Solución:**
1. Usar Python 3.8 o superior
2. Actualizar pip: `python -m pip install --upgrade pip`
3. Ejecutar: `python setup_api.py`

### Error de Análisis
**Problema:** "Error al analizar la imagen"

**Solución:**
1. Verificar que la imagen esté en formato válido (JPG, PNG, etc.)
2. Verificar que el archivo no esté corrupto
3. Verificar logs del servidor backend

## 📁 Estructura de Archivos

```
Backend/
├── api_server.py          # Servidor Flask principal
├── photo_classifier.py    # Clasificador de imágenes
├── setup_api.py          # Script de configuración
├── requirements.txt      # Dependencias Python
├── class_labels.json     # Etiquetas de clasificación
└── *.h5                  # Modelos de IA entrenados

ThreejsFrontend/
├── src/
│   ├── components/
│   │   └── ImageAnalysisModule.jsx  # Componente modificado
│   └── ...
├── package.json          # Dependencias Node.js
└── ...
```

## 🎯 Características

- ✅ **Clasificación en tiempo real** usando redes neuronales
- ✅ **Interfaz intuitiva** con drag & drop
- ✅ **Múltiples formatos** de imagen soportados
- ✅ **Resultados detallados** con porcentajes de confianza
- ✅ **Manejo de errores** robusto
- ✅ **API RESTful** bien documentada

## 🔄 Flujo de Trabajo

1. **Usuario** sube imagen en el frontend
2. **Frontend** convierte imagen a base64
3. **Frontend** envía petición POST a `/classify`
4. **Backend** recibe y procesa la imagen
5. **Backend** usa modelo de IA para clasificar
6. **Backend** retorna resultado en JSON
7. **Frontend** muestra resultado al usuario

## 📊 Rendimiento

- **Tiempo de inferencia**: ~50-200ms por imagen
- **Precisión**: Variable según el objeto (60-95%)
- **Formatos soportados**: JPG, PNG, BMP, WEBP
- **Tamaño máximo**: Sin límite específico (recomendado < 5MB)

## 🚀 Siguientes Pasos

- [ ] Implementar caché de resultados
- [ ] Agregar más categorías de clasificación
- [ ] Mejorar modelo de IA con entrenamiento específico
- [ ] Agregar análisis de múltiples objetos en una imagen
- [ ] Implementar almacenamiento de historial 