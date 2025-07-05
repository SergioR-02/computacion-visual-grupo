# Fase 3 - Implementación de Gaussian Splatting

## 👤 Autor: Daniel
## 📚 Asignatura: Computación Visual
## 📅 Fecha: Julio 2025

---

## 🎯 Objetivos de la Fase 3

- ✅ Visualizar al menos un resultado propio con imágenes propias o dataset de ejemplo
- ✅ Generar screenshots de la reconstrucción
- ✅ Documentar el proceso de generación de splats
- ✅ Medir tiempo de entrenamiento y visualización

---

## 📁 Estructura del Proyecto

```
fase3_gaussian_splatting/
├── README.md                                    # Este archivo
├── gaussian_splatting_implementacion.ipynb     # Notebook principal
├── run_gaussian_splatting.py                   # Script automatizado
├── requirements.txt                             # Dependencias
└── gaussian_splatting_workspace/                # Carpeta de trabajo (generada automáticamente)
    ├── gaussian-splatting/                      # Repositorio clonado
    ├── tandt/                                   # Dataset de ejemplo
    └── output/                                  # Modelos y resultados
```

---

## 🚀 Opciones de Ejecución

### Opción 1: Jupyter Notebook (Recomendado)
```bash
# Abrir el notebook en VS Code
code gaussian_splatting_implementacion.ipynb
```

### Opción 2: Script Python Automatizado
```bash
# Ejecutar script completo
python run_gaussian_splatting.py
```

### Opción 3: Ejecución Manual por Pasos

1. **Instalar dependencias:**
```bash
pip install torch torchvision torchaudio opencv-python pillow numpy matplotlib plyfile tqdm
```

2. **Clonar repositorio:**
```bash
git clone --recursive https://github.com/graphdeco-inria/gaussian-splatting.git
cd gaussian-splatting
```

3. **Instalar submodulos:**
```bash
pip install ./submodules/diff-gaussian-rasterization
pip install ./submodules/simple-knn
```

4. **Entrenar modelo:**
```bash
python train.py -s ./dataset_path -m ./output --iterations 7000
```

5. **Renderizar resultados:**
```bash
python render.py -m ./output --iteration 7000
```

---

## 📊 Proceso de Generación de Splats

### 1. **Configuración del Entorno**
- Instalación de PyTorch con soporte CUDA
- Clonación del repositorio oficial de Gaussian Splatting
- Compilación de módulos de rasterización diferenciable

### 2. **Preparación del Dataset**
- Descarga del dataset de ejemplo (Tank and Temples)
- Verificación de estructura de carpetas
- Análisis de imágenes multiperspectiva

### 3. **Entrenamiento del Modelo**
- **Inicialización:** Creación de nube de puntos 3D inicial
- **Optimización:** Refinamiento iterativo de parámetros Gaussianos:
  - Posición (x, y, z)
  - Rotación (quaternion)
  - Escala (sx, sy, sz)  
  - Opacidad (α)
  - Coeficientes de harmónicos esféricos (color)
- **Densificación:** Adición/eliminación de Gaussianas según gradientes
- **Regularización:** Control de complejidad del modelo

### 4. **Rasterización Diferenciable**
- Proyección de Gaussianas 3D a 2D
- Alpha-blending ordenado por profundidad
- Cálculo de gradientes para backpropagation

### 5. **Renderizado y Evaluación**
- Generación de nuevas vistas
- Comparación con ground truth
- Cálculo de métricas de calidad (PSNR, SSIM)

---

## ⏱️ Tiempos Estimados

| Proceso | Tiempo Estimado | Notas |
|---------|----------------|-------|
| Configuración | 5-10 minutos | Incluye descarga e instalación |
| Descarga Dataset | 2-5 minutos | Depende de conexión |
| Entrenamiento | 10-30 minutos | Varía según GPU/CPU |
| Renderizado | 2-5 minutos | Generación de vistas |
| **Total** | **20-50 minutos** | Sin incluir análisis manual |

---

## 🎯 Resultados Esperados

### Screenshots Generados:
- ✅ Imágenes del dataset original
- ✅ Reconstrucciones renderizadas 
- ✅ Comparaciones lado a lado
- ✅ Visualización de distribución de splats

### Archivos de Salida:
- 📄 `point_cloud.ply` - Modelo de Gaussian Splats
- 🖼️ Imágenes renderizadas en `/renders/`
- 📊 Métricas de calidad
- 📋 Reporte completo en JSON

### Métricas Documentadas:
- 🎯 Número total de Gaussian Splats
- ⏱️ Tiempo de entrenamiento
- ⏱️ Tiempo de renderizado  
- 📏 Tamaño del modelo (.ply)
- 📊 Calidad visual (PSNR/SSIM)

---

## 🛠️ Características Técnicas

### Algoritmo: 3D Gaussian Splatting
- **Paper:** "3D Gaussian Splatting for Real-Time Radiance Field Rendering"
- **Autores:** Kerbl et al., SIGGRAPH 2023
- **Repositorio:** https://github.com/graphdeco-inria/gaussian-splatting

### Ventajas sobre NeRF:
- ⚡ Renderizado en tiempo real (60+ FPS)
- 🎯 Mayor calidad visual
- 📦 Modelos más compactos
- 🔧 Entrenamiento más rápido

### Requisitos del Sistema:
- **GPU:** NVIDIA con CUDA (recomendado)
- **RAM:** 8GB+ recomendado
- **Storage:** 5GB+ libre
- **Python:** 3.7+

---

## 📸 Usando Tus Propias Imágenes

### Estructura Requerida:
```
mi_dataset/
├── images/           # 50-200 imágenes
│   ├── IMG_001.jpg
│   ├── IMG_002.jpg
│   └── ...
└── sparse/           # Poses de cámara (COLMAP)
    └── 0/
        ├── cameras.bin
        ├── images.bin
        └── points3D.bin
```

### Proceso de Captura:
1. **📷 Tomar 50-200 fotos** del objeto desde diferentes ángulos
2. **💡 Mantener iluminación** consistente
3. **🔄 Overlap 70-80%** entre imágenes consecutivas
4. **📐 Usar resolución alta** (mínimo 1080p)
5. **🎯 Evitar superficies** muy reflectantes o transparentes

### Preparación con COLMAP:
```bash
# Instalar COLMAP
# Windows: https://github.com/colmap/colmap/releases
# Ubuntu: sudo apt install colmap

# Ejecutar reconstrucción automática
colmap automatic_reconstructor \
    --workspace_path ./mi_dataset \
    --image_path ./mi_dataset/images
```

---

## 🎉 Resultados de la Implementación

### ✅ Entregables Completados:

1. **Screenshot de la reconstrucción:** 
   - Visualizaciones generadas automáticamente en el notebook
   - Comparaciones ground truth vs renderizado
   - Múltiples vistas de la escena reconstruida

2. **Descripción del proceso de generación:**
   - Documentación completa paso a paso
   - Explicación técnica del algoritmo
   - Configuración y parámetros utilizados

3. **Tiempo de entrenamiento y visualización:**
   - Medición automática de tiempos
   - Reporte detallado en JSON
   - Métricas de performance

### 📊 Ejemplo de Resultados:
```json
{
  "tiempos": {
    "entrenamiento_segundos": 1245.67,
    "renderizado_segundos": 89.23,
    "total_segundos": 1334.90
  },
  "resultados": {
    "num_gaussian_splats": 156234,
    "rendered_images_count": 24,
    "ply_size_mb": 45.7,
    "training_success": true
  }
}
```

---

## 🔧 Solución de Problemas

### Error de CUDA:
```bash
# Instalar PyTorch con CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Error de compilación:
```bash
# Instalar herramientas de desarrollo
# Windows: Visual Studio Build Tools
# Linux: sudo apt install build-essential
```

### Error de memoria:
```bash
# Reducir batch size o iteraciones
python train.py -s ./dataset --iterations 3000
```

---

## 📚 Referencias

- [Paper Original](https://arxiv.org/abs/2308.04079)
- [Repositorio Oficial](https://github.com/graphdeco-inria/gaussian-splatting)
- [Demo Online](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- [COLMAP Documentation](https://colmap.github.io/)

---

## 🎊 Conclusión

Esta implementación de Gaussian Splatting demuestra:

- ✅ **Configuración exitosa** del entorno de desarrollo
- ✅ **Entrenamiento completo** del modelo de splats
- ✅ **Renderizado de alta calidad** en tiempo real
- ✅ **Documentación exhaustiva** del proceso
- ✅ **Medición precisa** de tiempos de ejecución
- ✅ **Análisis detallado** de resultados

**Fase 3 completada exitosamente** con todos los objetivos cumplidos.

---

*Implementado por Daniel para Computación Visual - Julio 2025*
