# Informe Comparativo - Fase 5: NeRF vs. Gaussian Splatting vs. Visual SLAM

**Estudiante:** Daniel  
**Asignatura:** Computación Visual  
**Fecha:** Julio 2025  

---

## 📊 Comparativa Técnica entre las Tres Tecnologías

### **Requisitos de Hardware**

| Tecnología | CPU | GPU | RAM | Almacenamiento |
|------------|-----|-----|-----|----------------|
| **NeRF (Tiny)** | Moderado | **GPU requerida** (TensorFlow) | 8GB+ | ~500MB (modelo pequeño) |
| **Gaussian Splatting** | Alto | **GPU opcional** (PyTorch) | 4GB+ | ~100MB (splats ligeros) |
| **Visual SLAM** | **Alto** | CPU suficiente (OpenCV) | 2GB+ | <50MB (código ligero) |

**Análisis:**
- **NeRF** requiere GPU obligatoriamente para entrenamiento eficiente de redes neuronales
- **Gaussian Splatting** puede funcionar en CPU pero se beneficia enormemente de GPU
- **Visual SLAM** es el más liviano, funcionando bien solo con CPU

### **Tiempo de Ejecución**

| Fase | Entrenamiento | Renderizado/Procesamiento | Tiempo Total |
|------|---------------|---------------------------|--------------|
| **NeRF** | ~15-30 min (500 iter) | ~0.5s por imagen | **~30 minutos** |
| **Gaussian Splatting** | ~2.8s (generación directa) | ~0.03s por frame (33 FPS) | **~3 segundos** |
| **Visual SLAM** | No requiere entrenamiento | ~0.2s por frame | **~10 segundos** |

**Análisis:**
- **Gaussian Splatting** es el más rápido con renderizado en tiempo real
- **NeRF** requiere entrenamiento extenso pero genera resultados fotorrealistas
- **Visual SLAM** es inmediato pero con mayor complejidad algorítmica

### **Calidad del Resultado**

| Aspecto | NeRF | Gaussian Splatting | Visual SLAM |
|---------|------|-------------------|-------------|
| **Fotorrealismo** | ★★★★★ Excelente | ★★★★☆ Muy bueno | ★★☆☆☆ Funcional |
| **Precisión 3D** | ★★★★☆ Muy buena | ★★★☆☆ Buena | ★★☆☆☆ Problemática |
| **Velocidad** | ★★☆☆☆ Lenta | ★★★★★ Excelente | ★★★★☆ Buena |
| **Robustez** | ★★★★☆ Estable | ★★★★☆ Estable | ★★☆☆☆ Inestable |

**Resultados Obtenidos:**
- **NeRF:** PSNR >25dB, reconstrucción fotorrealista del dataset Lego
- **Gaussian Splatting:** 20 splats, 33 FPS, calidad visual alta para tiempo real
- **Visual SLAM:** Error promedio ~89m (fallido), problemas críticos de tracking

### **Tipo de Entrada Requerida**

| Tecnología | Entrada Principal | Datos Adicionales | Preparación |
|------------|-------------------|-------------------|-------------|
| **NeRF** | Múltiples imágenes 2D | Poses de cámara calibradas | **Alta complejidad** |
| **Gaussian Splatting** | Datos sintéticos/reales | Parámetros de splat | **Baja complejidad** |
| **Visual SLAM** | Secuencia de video | Calibración de cámara | **Media complejidad** |

---

## 🧠 Reflexión y Análisis de Aplicaciones

### **¿Cuál técnica es más útil en escenarios móviles?**

**Respuesta:** **Gaussian Splatting** es la más adecuada para aplicaciones móviles por:

- **Renderizado en tiempo real** (33 FPS obtenidos)
- **Menor consumo computacional** durante la visualización
- **Archivos ligeros** (~100MB vs varios GB de NeRF)
- **No requiere entrenamiento** en dispositivo

**Visual SLAM** sería la segunda opción para **navegación activa**, pero nuestra implementación mostró problemas críticos de estabilidad que requieren solución.

### **¿Cuál sería ideal para videojuegos?**

**Para videojuegos:** **Gaussian Splatting + NeRF híbrido**

- **Gaussian Splatting** para elementos dinámicos y efectos en tiempo real
- **NeRF** para backgrounds estáticos de alta calidad (pre-renderizados)
- **Visual SLAM** para mapeo de entornos reales en AR/VR games

**Justificación:**
- Los videojuegos requieren >60 FPS consistentes
- Gaussian Splatting demostró 33 FPS en nuestra implementación básica
- NeRF puede pre-calcular entornos con calidad cinematográfica

### **¿Cuál para visualización médica?**

**Para medicina:** **NeRF** es superior por:

- **Máxima precisión** en reconstrucción 3D
- **Calidad fotorrealista** crítica para diagnósticos
- **Interpolación suave** entre vistas (importante para anatomía)
- **Tiempo de procesamiento** no crítico vs. precisión

**Casos específicos:**
- **Radiología:** NeRF para reconstrucción volumétrica
- **Cirugía AR:** Gaussian Splatting para overlay en tiempo real
- **Navegación quirúrgica:** Visual SLAM para tracking de instrumentos

---

## 🚨 Retos Técnicos Encontrados

### **NeRF (Fase 2)**
✅ **Éxitos:**
- Implementación exitosa con TensorFlow
- Convergencia del modelo (PSNR >25dB)
- Renderizado de nuevas vistas funcional

⚠️ **Desafíos:**
- Tiempo de entrenamiento extenso (30+ minutos)
- Dependencia crítica de GPU
- Sensibilidad a la calidad de poses de cámara

### **Gaussian Splatting (Fase 3)**
✅ **Éxitos:**
- Renderizado en tiempo real logrado
- Implementación ligera y eficiente
- Buenos resultados visuales para escenas simples

⚠️ **Desafíos:**
- Complejidad para escenas reales complejas
- Requiere comprensión profunda de parámetros de splat
- Limitado a objetos relativamente simples

### **Visual SLAM (Fase 4)**
❌ **Fallas Críticas:**
- Error de posición promedio de ~89 metros (inaceptable)
- Pérdida catastrófica de tracking en frame 15-20
- Sistema completamente inestable

🔧 **Problemas Identificados:**
- Inicialización deficiente del sistema
- Falta de bundle adjustment global
- Ausencia de detección de loop closure
- Validación insuficiente de correspondencias

---

## 📈 Conclusiones y Recomendaciones

### **Ranking por Categoría de Aplicación:**

1. **Aplicaciones Móviles:** Gaussian Splatting > Visual SLAM > NeRF
2. **Videojuegos:** Gaussian Splatting > NeRF > Visual SLAM  
3. **Visualización Médica:** NeRF > Gaussian Splatting > Visual SLAM
4. **Investigación Académica:** NeRF > Visual SLAM > Gaussian Splatting

### **Lecciones Aprendidas:**

1. **No existe una técnica universal** - cada una tiene su nicho óptimo
2. **La implementación robusta es crítica** - especialmente en Visual SLAM
3. **El balance calidad/velocidad** determina la aplicabilidad práctica
4. **Los datos de entrada** son tan importantes como el algoritmo

### **Próximos Pasos Recomendados:**

- **NeRF:** Explorar versiones más rápidas (Instant-NGP, TensoRF)
- **Gaussian Splatting:** Implementar para escenas reales complejas
- **Visual SLAM:** Corregir problemas fundamentales de inicialización y tracking

---

