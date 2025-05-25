# 🧵 Taller - UV Mapping: Texturas que Encajan

📅 **Fecha:** 2025-05-24 – Fecha de realización

🎯 **Objetivo del Taller:**
Explorar el mapeo UV como técnica fundamental para aplicar correctamente texturas 2D sobre modelos 3D sin distorsión. El objetivo es entender cómo se proyectan las texturas sobre las superficies 3D y cómo se pueden ajustar las coordenadas UV para mejorar el resultado visual mediante diferentes tipos de wrapping, repetición y transformaciones.

---

## 🧠 Conceptos Aprendidos

### 📐 UV Mapping - Coordenadas de Textura

- **Definición**: Sistema de coordenadas 2D (U, V) que mapea puntos de una textura 2D sobre la superficie de un modelo 3D
- **Características principales**:
  - ✅ U representa la coordenada horizontal (0.0 a 1.0)
  - ✅ V representa la coordenada vertical (0.0 a 1.0)
  - ✅ Cada vértice del modelo tiene coordenadas UV asociadas
  - ✅ Permite proyectar imágenes 2D sobre geometrías complejas

### 🔄 Tipos de Wrapping (Envolvimiento)

- **RepeatWrapping**: La textura se repite cuando las coordenadas UV exceden el rango [0,1]
- **ClampToEdgeWrapping**: Extiende los píxeles del borde de la textura
- **MirroredRepeatWrapping**: Crea un patrón espejado al repetir la textura

### 🎨 Transformaciones UV

- **Repeat**: Controla cuántas veces se repite la textura (repeatU, repeatV)
- **Offset**: Desplaza la posición de la textura (offsetU, offsetV)
- **Rotation**: Rota la textura alrededor de su centro
- **Center**: Define el punto de rotación de la textura

### 🔍 Detección de Problemas UV

- **Distorsión**: Estiramiento no deseado de la textura
- **Seams**: Costuras visibles donde se unen diferentes partes del UV map
- **Resolución**: Áreas con diferente densidad de píxeles por unidad de superficie
- **Orientación**: Texturas que aparecen invertidas o rotadas incorrectamente

---

## 🔧 Herramientas y Entornos

- **React 19** - Framework de interfaz de usuario
- **Three.js v0.176** - Motor de renderizado 3D WebGL
- **React Three Fiber v9** - Integración declarativa de Three.js con React
- **React Three Drei v10** - Helpers y componentes útiles para R3F
- **Leva v0.10** - Controles de interfaz en tiempo real
- **Vite v6** - Build tool ultrarrápido para desarrollo
- **OBJ Loader** - Para cargar modelos 3D externos


---

## 📁 Estructura del Proyecto

```
2025-05-24_taller_uv_mapping_texturas/
├── threejs/                           # Implementación Three.js
│   ├── src/                          # Código fuente
│   │   ├── components/               # Componentes React
│   │   │   ├── UVMappingScene.jsx   # Escena principal UV Mapping
│   │   │   ├── ModelViewer.jsx      # Visor de modelos con controles UV
│   │   │   ├── TextureDemo.jsx      # Demostración de tipos de wrapping
│   │   │   ├── RealTextureDemo.jsx  # Texturas reales aplicadas
│   │   │   └── AdvancedUVMapping.jsx # Técnicas avanzadas UV
│   ├── public/                       # Archivos públicos
├── resultados/                       # Evidencias visuales
└── README.md                        # Esta documentación
```

---

## 🧪 Implementación

### 🔹 Etapas realizadas

1. **Setup del entorno 3D**: Configuración de React Three Fiber con TypeScript y Leva
2. **Carga de modelos**: Implementación de OBJ Loader para modelos externos
3. **Generación de texturas procedurales**:
   - Textura de tablero de ajedrez para visualizar distorsión
   - Textura de ladrillos con patrón direccional
   - Textura de madera con vetas naturales
   - Textura UV de prueba con gradientes de color
4. **Sistema de controles UV en tiempo real**:
   - Ajuste de repeat (U, V) para controlar repetición
   - Modificación de offset para desplazar texturas
   - Rotación de texturas con punto de anclaje
   - Configuración de wrapping modes
5. **Comparación de primitivas geométricas**: Cubo, esfera y cilindro con las mismas texturas
6. **Interface interactiva**: Controles Leva para experimentación en tiempo real

### 🔹 Código relevante

**Generación de texturas procedurales para testing UV:**

```jsx
// Creación de textura de tablero de ajedrez
const createCheckerTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#000000'
      ctx.fillRect(x * 32, y * 32, 32, 32)
    }
  }
  
  return new TextureLoader().load(canvas.toDataURL())
}
```

**Configuración dinámica de parámetros UV:**

```jsx
// Controles interactivos para UV mapping
const { repeatU, repeatV, offsetU, offsetV, rotation, wrapS, wrapT } = useControls('UV Controls', {
  repeatU: { value: 1, min: 0.1, max: 10, step: 0.1 },
  repeatV: { value: 1, min: 0.1, max: 10, step: 0.1 },
  offsetU: { value: 0, min: -2, max: 2, step: 0.1 },
  offsetV: { value: 0, min: -2, max: 2, step: 0.1 },
  rotation: { value: 0, min: 0, max: Math.PI * 2, step: 0.1 },
  wrapS: { value: 'RepeatWrapping', options: ['RepeatWrapping', 'ClampToEdgeWrapping', 'MirroredRepeatWrapping'] },
  wrapT: { value: 'RepeatWrapping', options: ['RepeatWrapping', 'ClampToEdgeWrapping', 'MirroredRepeatWrapping'] }
})

// Aplicación de transformaciones UV
texture.repeat.set(repeatU, repeatV)
texture.offset.set(offsetU, offsetV)
texture.rotation = rotation
texture.center.set(0.5, 0.5)
texture.wrapS = wrapModes[wrapS]
texture.wrapT = wrapModes[wrapT]
```

**Carga y aplicación de texturas en modelo externo:**

```jsx
// Carga de modelo OBJ con aplicación de material personalizado
const obj = useLoader(OBJLoader, '/base.obj')

const material = useMemo(() => {
  return new MeshStandardMaterial({
    map: currentTexture,
    roughness: roughness,
    metalness: metalness,
    wireframe: wireframe
  })
}, [currentTexture, roughness, metalness, wireframe])

return (
  <group ref={meshRef} position={position}>
    <primitive object={obj.clone()}>
      <primitive object={material} attach="material" />
    </primitive>
  </group>
)
```

---

## 📊 Resultados Visuales

### 📌 Demostración del UV Mapping:

![Demostración de UV Mapping](./resultados/uv_mapping_demo.gif)

El GIF muestra claramente:

### 🎯 Texturas Procedurales:

- ✅ **Textura de tablero**: Revela distorsiones y problemas de UV mapping
- ✅ **Textura de ladrillos**: Muestra direccionalidad y patrones repetitivos
- ✅ **Textura de madera**: Demuestra aplicación de texturas orgánicas
- ✅ **Textura UV de prueba**: Gradientes que facilitan identificar problemas

### 🔄 Transformaciones UV en Tiempo Real:

- ✅ **Repeat scaling**: Modificación de la frecuencia de repetición
- ✅ **Offset adjustment**: Desplazamiento de la textura sobre la superficie
- ✅ **Rotation control**: Rotación de la textura alrededor de su centro
- ✅ **Wrapping modes**: Comparación entre RepeatWrapping, ClampToEdge y MirroredRepeat

### 📐 Comparación entre Geometrías:

- ✅ **Cubo**: UV mapping planar, ideal para texturas arquitectónicas
- ✅ **Esfera**: UV mapping esférico, muestra polos y distorsión ecuatorial
- ✅ **Cilindro**: UV mapping cilíndrico, perfecto para objetos de revolución

### 🔍 Detección de Problemas:

- ✅ **Distorsión visible**: En los polos de la esfera con textura de tablero
- ✅ **Seams identification**: Costuras en el cilindro donde se cierra la textura
- ✅ **Resolution variance**: Diferencias de densidad entre diferentes áreas

---

## 🎮 Controles Implementados

### 🖱️ Controles de Navegación

- **Clic + Arrastrar**: Rotar la cámara alrededor de la escena
- **Rueda del ratón**: Acercar/alejar (zoom)
- **Clic derecho + Arrastrar**: Desplazar la vista (pan)

### 🎛️ Controles UV (Panel Leva)

- **Repeat U/V**: Ajusta la repetición horizontal y vertical
- **Offset U/V**: Desplaza la textura en ambos ejes
- **Rotation**: Rota la textura alrededor de su centro
- **Wrap S/T**: Selecciona el modo de envolvimiento
- **Texture Type**: Cambia entre diferentes texturas de prueba
- **Material Properties**: Roughness, metalness y wireframe

### 🔘 Controles de Escena

- **Model Type**: Alterna entre modelo OBJ y primitivas geométricas
- **Show Texture Demo**: Activa/desactiva demostración de wrapping
- **Show Grid**: Muestra cuadrícula de referencia
- **Auto Rotate**: Rotación automática del modelo

---

## 💡 Prompts Utilizados

Para la implementación de este proyecto, utilicé los siguientes prompts principales:

1. **"Crear una aplicación Three.js que demuestre UV mapping con diferentes tipos de texturas y controles interactivos"**
   - Generó la estructura base con React Three Fiber y Leva

2. **"Implementar generación de texturas procedurales para testing UV: tablero de ajedrez, ladrillos, madera y gradientes"**
   - Desarrolló las funciones de creación de texturas usando Canvas 2D

3. **"Agregar controles para repeat, offset, rotation y wrapping modes con actualización en tiempo real"**
   - Creó el sistema de controles Leva con parámetros UV

4. **"Cargar modelo OBJ externo y comparar con primitivas geométricas para mostrar diferencias en UV mapping"**
   - Implementó OBJ Loader y sistema de comparación

5. **"Añadir demostración de diferentes wrapping modes con ejemplos visuales claros"**
   - Desarrolló el componente TextureDemo con casos específicos

---

## 💬 Reflexión Final

Este taller me permitió comprender profundamente cómo funcionan las **coordenadas UV** y su impacto crucial en la apariencia final de los modelos 3D. La diferencia entre los diferentes **wrapping modes** no es solo conceptual, sino que tiene implicaciones prácticas importantes:

Lo más revelador fue observar cómo las **distorsiones UV** afectan diferentes geometrías. Mientras que un cubo tiene UV mapping natural sin distorsión, una esfera siempre tendrá problemas en los polos, y un cilindro puede mostrar seams donde se cierra la textura.

La implementación práctica me ayudó a entender que el UV mapping es fundamental para:

### 🔑 Aspectos Clave Aprendidos:

- **Optimización de texturas**: Un buen UV layout reduce el uso de memoria y mejora la calidad visual
- **Detección de problemas**: Las texturas de prueba (como el tablero de ajedrez) revelan inmediatamente problemas de UV
- **Configuración de wrapping**: Cada tipo tiene su uso específico según el contexto del modelo
- **Transformaciones en tiempo real**: Los ajustes UV pueden corregir problemas sin modificar el modelo

### 🚀 Aplicaciones Futuras:

Para futuros proyectos, estos conceptos son fundamentales para:

- **Desarrollo de juegos**: Optimización de UV layouts para mejor rendimiento
- **Arquitectura virtual**: Aplicación precisa de texturas en modelos arquitectónicos
- **Arte digital**: Creación de efectos visuales mediante manipulación UV
- **Realidad aumentada**: Mapeo preciso de texturas sobre objetos del mundo real
