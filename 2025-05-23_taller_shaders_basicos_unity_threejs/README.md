# 🎨 Taller - Shaders Personalizados y Toon Shading en React Three Fiber

📅 **Fecha:** 2025-05-23 – Fecha de realización

🎯 **Objetivo del Taller:**
Aprender a implementar shaders personalizados (GLSL) dentro de una escena 3D en React Three Fiber utilizando `@react-three/drei`. Se desarrolló una animación de colores mediante un `shaderMaterial` reactivo al tiempo (`uTime`) y se aplicó un efecto de toon shading a través de cuantización de luz.

---

## 🧠 Conceptos Aprendidos

Lista de conceptos clave aplicados en el taller:

* Creación de materiales con `shaderMaterial` desde `@react-three/drei`
* Animación por tiempo usando el uniforme `uTime` con `useFrame()`
* Paso de normales del vertex al fragment shader
* Toon shading usando `dot()` y `floor()` para cuantizar iluminación
* Uso de `extend()` para registrar el shader personalizado como componente JSX
* Reacción visual al movimiento de cámara mediante iluminación dependiente del ángulo de visión

---

## 🔧 Herramientas y Entornos

* React + Vite
* React Three Fiber
* @react-three/drei
* GLSL (Vertex y Fragment Shaders)
* VSCode + navegador local

---

## 📁 Estructura del Proyecto

```
2025-05-23_taller_shaders_r3f/
├── src/
│ ├── App.jsx # Componente principal de la escena con el shader
│ ├── main.jsx # Entrada React
│ └── shaders/
│ ├── vertex.glsl # Vertex Shader
│ └── fragment.glsl# Fragment Shader con toon shading
├── public/
│ └── screenshot.png # Imagen del resultado
├── README.md
```


---

## 🧪 Implementación

Este taller mostró cómo controlar manualmente los materiales y colores de un objeto 3D usando shaders, y cómo simular sombreado estilizado (toon shading) con cuantización de luz.

---

### 🔹 Etapas realizadas

#### 🎨 1. ShaderMaterial personalizado
Se definió un nuevo material GLSL usando `shaderMaterial` y se extendió como componente JSX.

#### 🌀 2. Animación con `uTime`
El uniforme `uTime` se actualiza cada frame para generar una animación en el shader.

#### 💡 3. Toon shading con `floor()`
En el fragment shader, se cuantizó el nivel de iluminación en 3 niveles para simular un efecto de caricatura.

---

### 🔹 Código relevante

📌 **1. Vertex shader que pasa normales al fragment shader**

```glsl
varying vec3 vNormal;

void main() {
  vNormal = normalMatrix * normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

Transforma y transmite la normal del vértice al fragment shader para iluminación.

**📌 2. Fragment shader con toon shading animado**

```
uniform float uTime;
varying vec3 vNormal;

void main() {
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float light = dot(normalize(vNormal), lightDir);
  float levels = 3.0;
  float quantized = floor(light * levels) / levels;

  vec3 baseColor = vec3(
    0.5 + 0.5 * sin(uTime + gl_FragCoord.x * 0.1),
    0.5 + 0.5 * cos(uTime + gl_FragCoord.y * 0.1),
    1.0
  );

  gl_FragColor = vec4(baseColor * quantized, 1.0);
}
```

Calcula iluminación, la cuantiza a 3 niveles y la mezcla con colores animados.

**📌 3. Actualización de uTime en React**
```
useFrame(({ clock }) => {
  ref.current.uTime = clock.getElapsedTime()
})
```

Actualiza el tiempo cada frame para animar los colores desde el shader.

**📌 4. Aplicación del shader en un mesh**
```
<mesh>
  <boxGeometry />
  <colorShiftMaterial ref={ref} />
</mesh>
```

Usa el shader como material personalizado dentro del cubo 3D.


**📊 Resultados Visuales**


Aquí se muestra el resultado del shader animado con toon shading aplicado:

![Resultado tree](resultados/shaders.gif)


🧠 Prompts Usados


"Crea un shaderMaterial animado con GLSL que use uTime"

"Simula toon shading con floor y dot en fragment shader"

"Pasa normales al fragment shader desde vertex shader"

"Haz que un cubo cambie de color dinámicamente con shaders"

💬 Reflexión Final


Este taller me permitió comprender cómo los shaders otorgan control total sobre la apariencia visual de una escena 3D. Usar shaderMaterial en React Three Fiber junto a GLSL fue una experiencia potente, especialmente al ver cómo pequeñas líneas de código pueden generar animaciones complejas o efectos estilizados como el toon shading. Entendí también la importancia de las normales y la iluminación en tiempo real para crear materiales que responden a la cámara o la luz.