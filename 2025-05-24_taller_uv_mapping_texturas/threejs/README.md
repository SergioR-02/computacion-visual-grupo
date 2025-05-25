# Taller UV Mapping y Texturas - Three.js

## 📋 Descripción
Este taller demuestra conceptos fundamentales de UV mapping y aplicación de texturas PBR (Physically Based Rendering) en Three.js usando React Three Fiber.

## 🎯 Objetivos Completados

### ✅ Escenario Principal
- [x] Cargar modelo .OBJ usando `useLoader` con `OBJLoader`
- [x] Aplicar texturas 2D usando `TextureLoader` y `MeshStandardMaterial`
- [x] Visualizar cómo las texturas se ajustan a la geometría del modelo
- [x] Cambiar mapeo UV desde código con controles interactivos
- [x] Probar diferentes modelos y geometrías predefinidas

### ✅ Características Implementadas
- [x] **Texturas Procedurales**: Tablero de ajedrez, ladrillos, madera, UV test
- [x] **Texturas Reales PBR**: Diffuse, Normal, Roughness, Metalness
- [x] **UV Transforms**: repeat, offset, rotation, wrapS, wrapT
- [x] **Cuadrícula de Prueba**: Para evidenciar distorsiones
- [x] **Comparación PBR**: Visualización paso a paso del renderizado físico
- [x] **UV Visualizer**: Muestra el espacio UV con coordenadas

## 🚀 Cómo Usar

### 1. Instalar y Ejecutar
```bash
cd threejs
npm install
npm run dev
```

### 2. Controles Disponibles

#### **Material & UV (Panel Principal)**
- **useRealTextures**: Activa/desactiva texturas reales vs procedurales
- **textureSet**: Cambia entre set1 y set2 de texturas
- **textureType**: Selecciona textura procedural (checker, brick, wood, uv-test)
- **repeatU/V**: Controla repetición de textura en ejes U y V
- **offsetU/V**: Desplaza la textura en el espacio UV
- **rotation**: Rota la textura
- **wrapS/T**: Modo de envolvimiento (Repeat, Clamp, Mirror)
- **wireframe**: Activa modo wireframe
- **roughness/metalness**: Propiedades PBR
- **normalIntensity**: Intensidad del normal map

## 📁 Estructura de Texturas

### Ubicación
```
public/
  textures/
    color.jpg      # Textura diffuse set1
    color1.jpg     # Textura diffuse set2
    normal.jpg     # Normal map set1
    normal1.jpg    # Normal map set2
    roughness.jpg  # Roughness map set1
    roughness1.jpg # Roughness map set2
    metalness.jpg  # Metalness map (compartido)
```

### Formatos Soportados
- **Diffuse/Albedo**: .jpg, .png (colores base)
- **Normal Maps**: .jpg, .png (detalles de superficie)
- **Roughness**: .jpg (escala de grises)
- **Metalness**: .jpg (escala de grises)

## 🎨 Sitios Recomendados para Texturas

### Gratuitas
1. **[Poly Haven](https://polyhaven.com/textures)** - Texturas CC0 de alta calidad
2. **[Freepbr.com](https://freepbr.com/)** - Materiales PBR gratuitos
3. **[3D Textures](https://3dtextures.me/)** - Colección amplia CC0
4. **[Ambientcg.com](https://ambientcg.com/)** - Texturas y HDRIs gratuitos

## 🔧 Funcionalidades Técnicas

### UV Mapping Avanzado
- **Repeat Wrapping**: Repite la textura infinitamente
- **Clamp to Edge**: Extiende el borde de la textura
- **Mirrored Repeat**: Repite la textura con espejo
- **UV Transforms**: Manipulación matemática de coordenadas

### PBR (Physically Based Rendering)
- **Albedo/Diffuse**: Color base del material
- **Normal Map**: Detalles de superficie sin geometría adicional
- **Roughness Map**: Control de microsuperficie (mate vs brilloso)
- **Metalness Map**: Define qué partes son metálicas

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
