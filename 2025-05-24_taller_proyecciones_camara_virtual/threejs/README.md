# 🎯 Taller: Proyecciones de Cámara Virtual

Este taller interactivo te permite entender cómo se genera una escena tridimensional desde el punto de vista de una cámara, explorando los efectos de proyección en perspectiva y ortográfica.

## 🌟 Características Implementadas

### ✅ Escena 3D Completa

- **Objetos distribuidos**: Múltiples cajas y esferas a diferentes distancias
- **Iluminación realista**: Luz ambiental, direccional y puntual
- **Plano de referencia**: Para mejor percepción espacial

### 📷 Sistema de Cámaras Alternables

- **Cámara Perspectiva**: Simula visión humana con efecto de perspectiva
- **Cámara Ortográfica**: Proyección sin distorsión de perspectiva
- **Cambio en tiempo real**: Botón para alternar entre tipos de cámara

### 🎮 Controles Interactivos

- **OrbitControls**: Rotación, zoom y paneo con mouse
- **Límites configurados**: Distancia mínima y máxima de zoom
- **Navegación fluida**: Explora la escena desde cualquier ángulo

### 📊 Información en Tiempo Real

- **Tipo de cámara activa**
- **Parámetros de perspectiva**: FOV, Aspect, Near, Far
- **Parámetros ortográficos**: Left, Right, Top, Bottom, Near, Far
- **Proyección 3D→2D**: Coordenadas de pantalla en tiempo real

### 🎯 Bonus: Visualización de Proyección

- **Esfera objetivo roja**: Objeto que se proyecta continuamente
- **Indicador visual**: Círculo amarillo mostrando la posición 2D
- **Coordenadas en pantalla**: Valores X, Y actualizados en tiempo real
- **Implementación con `Vector3.project(camera)`**

## 🚀 Cómo usar

1. **Iniciar el proyecto**:

   ```bash
   bun run dev
   ```

2. **Explorar la escena**:

   - Usa el mouse para rotar, hacer zoom y navegar
   - Observa cómo cambian los objetos con diferentes ángulos

3. **Alternar cámaras**:

   - Haz clic en el botón superior derecho
   - Compara el efecto visual entre perspectiva y ortográfica
   - Observa cómo cambian los parámetros mostrados

4. **Estudiar la proyección**:
   - Observa la esfera roja en la escena
   - Ve el círculo amarillo que indica su posición en pantalla
   - Analiza las coordenadas 3D→2D en tiempo real

## 🔧 Tecnologías Utilizadas

- **React** 19.1.0 - Framework de interfaz
- **Three.js** 0.176.0 - Motor de gráficos 3D
- **React Three Fiber** 9.1.2 - React renderer para Three.js
- **React Three Drei** 10.0.8 - Utilidades y componentes
- **TypeScript** - Tipado estático
- **Vite** - Build tool moderno

## 📚 Conceptos Educativos

### Proyección Perspectiva

- **FOV (Field of View)**: Ángulo de visión de la cámara
- **Aspect Ratio**: Relación ancho/alto de la pantalla
- **Near/Far Planes**: Límites de renderizado
- **Efecto de perspectiva**: Objetos lejanos se ven más pequeños

### Proyección Ortográfica

- **Frustum rectangular**: Volumen de visualización sin perspectiva
- **Left/Right/Top/Bottom**: Límites del volumen de visualización
- **Sin distorsión**: Objetos mantienen su tamaño independiente de la distancia
- **Uso en CAD/Arquitectura**: Medidas precisas sin deformación

### Transformación 3D→2D

- **Matrices de proyección**: Cómo se calculan las transformaciones
- **Coordenadas normalizadas**: Espacio de -1 a 1
- **Coordenadas de pantalla**: Píxeles finales en la pantalla
- **Vector3.project()**: Función de Three.js para proyección directa

## 🎨 Elementos Visuales

### Objetos en la Escena

- **Fila cercana** (Z: -2): 3 cajas azules/violetas/verdes
- **Fila media** (Z: -5): 3 esferas amarillas/rosas/verdes
- **Fila lejana** (Z: -8): 3 cajas grandes multicolores
- **Esfera objetivo** (Z: -3): Esfera roja para proyección
- **Plano de referencia**: Grid translúcido para orientación

### Interfaz de Usuario

- **Panel izquierdo**: Información de cámara y proyección
- **Botón superior derecho**: Cambio de tipo de cámara
- **Instrucciones**: Guía de uso con mouse
- **Título inferior**: Identificación del taller
- **Indicador de proyección**: Círculo amarillo dinámico

## 🎯 Objetivos de Aprendizaje

Al completar este taller, comprenderás:

1. **Diferencias visuales** entre proyección perspectiva y ortográfica
2. **Parámetros de cámara** y su impacto en la renderización
3. **Proceso de proyección** desde coordenadas 3D hasta píxeles 2D
4. **Aplicaciones prácticas** de cada tipo de proyección
5. **Matrices de transformación** (conceptualmente)

## 🔍 Experimentación Sugerida

1. **Compara perspectivas**: Alterna entre cámaras en la misma posición
2. **Explora distancias**: Acércate y aléjate con zoom
3. **Observa la proyección**: Ve cómo se mueve el indicador amarillo
4. **Analiza parámetros**: Estudia cómo cambian los valores de la cámara
5. **Rotación orbital**: Observa el efecto desde diferentes ángulos

---

¡Explora y experimenta para entender profundamente las proyecciones de cámara en gráficos 3D! 🚀

