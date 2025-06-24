# 🎯 Taller de Realidad Aumentada Web con Marcadores usando AR.js

📅 **Fecha:** 2025-06-22 – Fecha de realización

🎯 **Objetivo del Taller:**
Implementar una experiencia de realidad aumentada basada en marcadores directamente desde el navegador, usando AR.js y Three.js.

## 🧠 Conceptos Aprendidos

Lista de conceptos clave aplicados en el taller:

* **Detección de marcadores**: Uso de AR.js para identificar marcadores predefinidos o personalizados.
* **Renderizado 3D**: Superposición de contenido digital en la posición del marcador.
* **Seguimiento en tiempo real**: Ajuste continuo del contenido 3D según la posición y orientación del marcador.
* **Personalización**: Uso de modelos 3D y marcadores personalizados.

## 🔧 Herramientas y Entornos

* AR.js
* A-Frame
* Three.js
* Navegador web moderno

## 📁 Estructura del Proyecto

```
2025-06-22_taller_arjs_realidad_aumentada_marcadores_web/
├── index.html
├── multiple-markers.html
├── models/
│   ├── shiba/scene.gltf
│   ├── duck/duck.gltf
├── markers/
│   ├── custom-marker.patt
│   ├── kanji.patt
├── resultados/
│   ├── hiro-marker-demo.gif
│   ├── 3d-model-demo.gif
├── README.md
```

## 🧪 Implementación

La implementación de este taller se centra en el uso de AR.js para crear una experiencia de realidad aumentada basada en marcadores. Se desarrollaron archivos HTML que permiten realizar las siguientes tareas:

- **Detección de marcadores**: Uso de marcadores predefinidos (HIRO, KANJI) y personalizados.
- **Renderizado de modelos 3D**: Superposición de modelos 3D en la posición del marcador.
- **Personalización**: Uso de modelos y marcadores personalizados.

### 🔹 Etapas realizadas

1. **Preparación de marcadores**: Generación e impresión de marcadores.
2. **Configuración de modelos 3D**: Integración de modelos en formato glTF/GLB.
3. **Implementación en HTML**: Uso de A-Frame para renderizar contenido 3D.
4. **Pruebas y ajustes**: Validación de detección y renderizado.

### 🔹 Código relevante

📌 **1. Detección de marcadores**

```javascript
this.el.addEventListener('markerFound', () => {
  console.log('Marcador detectado!');
});

this.el.addEventListener('markerLost', () => {
  console.log('Marcador perdido!');
});
```

📌 **2. Renderizado de modelos 3D**

```html
<a-marker type="pattern" url="markers/kanji.patt">
  <a-entity gltf-model="models/duck/duck.gltf"></a-entity>
</a-marker>
```

## 📊 Resultados y Análisis


### 📌 Renderizado de Modelos 3D y Detección de Marcadores

![Modelo 3D proyectado](./resultados/Modelo%20y%20deteccion.gif)

## 💬 Reflexión Final

Este taller me permitió comprender cómo implementar una experiencia de realidad aumentada basada en marcadores usando AR.js. Aprendí que:

1. **AR.js** es una herramienta poderosa para crear experiencias AR directamente en el navegador.
2. **Personalización** de modelos y marcadores permite adaptar la experiencia a diferentes aplicaciones.

La realidad aumentada basada en marcadores tiene aplicaciones en educación, arte y publicidad, ofreciendo una forma interactiva y accesible de integrar contenido digital en el mundo físico.
