# 🌐 Cliente WebSocket - Three.js + React

Este es el cliente web del Taller 58 que se conecta al servidor WebSocket para visualizar datos en tiempo real usando Three.js.

## 🚀 Inicio Rápido

### Opción 1: Instalación estándar
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

### Opción 2: Si tienes problemas de compatibilidad

**En Windows:**
```bash
install-clean.bat
```

**En Linux/macOS:**
```bash
chmod +x install-clean.sh
./install-clean.sh
```

Esto eliminará node_modules y package-lock.json para hacer una instalación limpia con las versiones compatibles.

## 🔧 Tecnologías

- **React 19** - Framework de UI
- **Three.js** - Motor de gráficos 3D
- **React Three Fiber** - Integración React + Three.js
- **React Three Drei** - Helpers y utilidades
- **Vite** - Build tool y dev server

## 📡 Conexión WebSocket

El cliente se conecta automáticamente a `ws://localhost:8765` al iniciar.

### Características:
- ✅ Conexión automática al servidor
- ✅ Reconexión automática si se pierde la conexión
- ✅ Visualización 3D en tiempo real
- ✅ Panel de información con datos del servidor
- ✅ Controles de cámara interactivos

## 🎯 Componentes Principales

### `WebSocketVisualization.jsx`
Componente principal que maneja:
- Conexión WebSocket
- Estado de la aplicación
- Renderizado de la escena 3D

### `AnimatedCube`
Cubo 3D que se actualiza con datos del servidor:
- Posición
- Rotación
- Escala
- Color

### `SensorDisplay`
Muestra datos de sensores simulados en texto 3D.

## 🎮 Controles

- **Mouse**: Rotar cámara
- **Scroll**: Zoom in/out
- **Botón Reconectar**: Reconectar manualmente

---

💡 **Asegúrate de que el servidor Python esté ejecutándose antes de abrir el cliente web.**
