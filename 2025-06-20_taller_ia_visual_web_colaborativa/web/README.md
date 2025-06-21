# 🧪 IA Visual Colaborativa - Visualizador Web

Una aplicación web simple pero elegante para visualizar los resultados de detección de objetos YOLO.

## 🚀 Características

- **Carga de Imágenes**: Visualiza imágenes con detecciones YOLO
- **Datos JSON**: Lee y muestra datos de detección en formato JSON
- **Tabla Interactiva**: Detalles completos de cada detección
- **Etiquetas Flotantes**: Overlays visuales sobre las detecciones
- **Estadísticas**: Métricas en tiempo real de las detecciones
- **Diseño Responsivo**: Funciona en desktop y móvil
- **Interfaz Moderna**: CSS moderno con animaciones suaves

## 📁 Estructura de Archivos

```
web/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
└── README.md          # Este archivo
```

## 🎯 Funcionalidades Implementadas

### ✅ Opción A: HTML + JS Simple

1. **Carga de Imagen**: 
   - Muestra imagen `deteccion.png` (o imágenes del directorio results)
   - Visualización responsive con placeholder elegante

2. **Lectura de JSON**:
   - Lee archivos JSON con datos de detección
   - Muestra datos como tabla estructurada
   - Etiquetas flotantes sobre la imagen

3. **Estilización CSS**:
   - Diseño moderno y amigable
   - Tema consistente con variables CSS
   - Animaciones suaves
   - Responsive design

## 🛠️ Cómo Usar

1. **Abrir la Aplicación**:
   ```bash
   # Navegar al directorio web
   cd web
   
   # Abrir con un servidor local (opcional)
   python -m http.server 8000
   # O simplemente abrir index.html en el navegador
   ```

2. **Seleccionar Imagen**:
   - Usa el dropdown para seleccionar una imagen
   - Haz clic en "Cargar Detección"

3. **Visualizar Resultados**:
   - Ve la imagen con bounding boxes
   - Revisa la tabla de detecciones
   - Consulta las estadísticas
   - Toggle para mostrar/ocultar etiquetas

## 📊 Datos Soportados

La aplicación espera archivos JSON con esta estructura:

```json
{
  "timestamp": "2025-06-20T23:02:54.430942",
  "image_size": {
    "width": 1200,
    "height": 535
  },
  "detections_count": 5,
  "detections": [
    {
      "class": "person",
      "confidence": 0.876,
      "bbox": {
        "x1": 131,
        "y1": 152,
        "x2": 250,
        "y2": 447,
        "width": 118,
        "height": 295,
        "center_x": 191,
        "center_y": 300
      }
    }
  ]
}
```

## 🎨 Características de Diseño

- **Colores**: Paleta azul moderna con variables CSS
- **Tipografía**: Inter font para mejor legibilidad
- **Iconos**: Font Awesome para iconografía consistente
- **Animaciones**: Transiciones suaves y efectos hover
- **Cards**: Diseño de tarjetas con sombras sutiles
- **Responsive**: Grid CSS para adaptación automática

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #3b82f6;    /* Azul principal */
    --success-color: #10b981;    /* Verde éxito */
    --warning-color: #f59e0b;    /* Amarillo advertencia */
    --danger-color: #ef4444;     /* Rojo error */
}
```

### Añadir Nuevas Funciones
1. Agrega elementos HTML en `index.html`
2. Estiliza en `styles.css`
3. Implementa lógica en `script.js`

## 📱 Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Móviles (iOS/Android)

## 🚀 Próximas Mejoras

- [ ] Drag & drop para cargar imágenes
- [ ] Filtros por clase de objeto
- [ ] Exportación de resultados
- [ ] Comparación de múltiples detecciones
- [ ] Integración con API real
- [ ] Zoom y pan en la imagen
- [ ] Modo oscuro

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del Taller de Computación Visual - Universidad 2025

---

**¡Disfruta explorando las detecciones de IA! 🔍✨**
