# 📋 Guía de Ejecución - IA Visual Colaborativa

## 🚀 Problema Resuelto: Usar Imágenes Reales

### ❌ Problema Original:
La página mostraba una imagen de placeholder de Google/Unsplash en lugar de las imágenes reales del proyecto.

### ✅ Solución Implementada:

1. **Actualizado el script JavaScript** para usar rutas reales:
   ```javascript
   // Antes: imagen de placeholder
   img.src = "https://images.unsplash.com/photo-..."
   
   // Ahora: imagen real del proyecto
   img.src = "../results/images/detection_20250620_231141.jpg"
   ```

2. **Configurado servidor local** para servir archivos correctamente:
   ```bash
   python -m http.server 8000
   ```

## 🔧 Cómo Ejecutar Correctamente:

### **Paso 1: Servidor Web Local (ACTUALIZADO)**
```powershell
# Navegar al directorio DEL PROYECTO (no al web/)
cd "2025-06-20_taller_ia_visual_web_colaborativa"

# Iniciar servidor desde aquí (IMPORTANTE)
python -m http.server 8001
```

### **Paso 2: Abrir en Navegador**
```
http://localhost:8001/web/index.html    # Página principal
http://localhost:8001/web/simple.html   # Página simple
http://localhost:8001/test-rutas.html   # Página de prueba
```

### **Paso 3: Verificar Rutas (CORREGIDAS)**
- ✅ Imágenes en: `./results/images/` (desde directorio proyecto)
- ✅ JSON en: `./results/json/` (desde directorio proyecto)  
- ✅ Servidor sirviendo desde: directorio del proyecto
- ✅ Web accesible en: `/web/`

## 📁 Estructura de Archivos Corregida:

```
2025-06-20_taller_ia_visual_web_colaborativa/
├── python/
│   ├── detector.py              # Generador de detecciones
│   └── data/                    # Imágenes de entrada
├── results/
│   ├── images/
│   │   ├── detection_20250620_230254.jpg  ← ESTAS son las reales
│   │   ├── detection_20250620_231141.jpg
│   │   └── detection_20250620_234304.jpg
│   └── json/
│       ├── detection_20250620_230254.json
│       ├── detection_20250620_231141.json
│       └── detection_20250620_234304.json
└── web/
    ├── index.html               # ← SERVIDOR AQUÍ
    ├── simple.html
    ├── script.js                # ← ACTUALIZADO
    └── styles.css
```

## 🔄 Flujo Correcto:

1. **Generar detecciones** (si no las tienes):
   ```bash
   cd python
   python detector.py --source "data/imagen.jpg"
   ```

2. **Iniciar servidor web**:
   ```bash
   cd web
   python -m http.server 8000
   ```

3. **Abrir navegador**:
   ```
   http://localhost:8000
   ```

4. **Seleccionar imagen real** del dropdown y cargar

## ⚠️ Importante:

- **NO abrir directamente** `index.html` en el navegador (file://)
- **SÍ usar servidor local** `http://localhost:8000`
- Las imágenes se cargan desde rutas relativas que necesitan servidor web

## 🎯 Resultado:
- ✅ Muestra imágenes reales con detecciones YOLO
- ✅ Carga datos JSON reales del proyecto
- ✅ Etiquetas flotantes sobre detecciones reales
- ✅ Estadísticas basadas en datos reales

¡Ahora la página web muestra las imágenes reales del proyecto en lugar de placeholders!
