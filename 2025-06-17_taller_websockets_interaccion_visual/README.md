# 🌐 Taller 58 - WebSockets e Interacción Visual en Tiempo Real

## 🎯 Objetivo del Taller

Comprender cómo usar **WebSockets** para habilitar comunicación en **tiempo real** entre un cliente (interfaz visual) y un servidor. El objetivo es crear una visualización gráfica que reaccione dinámicamente a datos transmitidos por WebSocket.

---

## 📘 ¿Qué son los WebSockets?

Los **WebSockets** son un protocolo de comunicación que permite establecer una conexión bidireccional y persistente entre el cliente y el servidor. A diferencia de HTTP tradicional:

- **HTTP**: Solicitud → Respuesta (comunicación unidireccional)
- **WebSocket**: Conexión persistente bidireccional en tiempo real

### Ventajas de WebSockets:
- ✅ Comunicación en tiempo real
- ✅ Menor latencia que HTTP polling
- ✅ Bidireccional (cliente y servidor pueden enviar datos)
- ✅ Eficiente para actualizaciones frecuentes

### Casos de uso:
- 📊 Visualización de datos de sensores en tiempo real
- 🎮 Juegos multijugador
- 💬 Chat en tiempo real
- 📈 Dashboards con datos en vivo
- 🎛️ Control remoto de dispositivos

---

## 🏗️ Estructura del Proyecto

```
2025-06-17_taller_websockets_interaccion_visual/
├── python/                     # Servidor WebSocket
│   ├── server.py              # Servidor principal (completo)
│   ├── run_server.py          # Servidor simplificado
│   └── requirements.txt       # Dependencias Python
├── threejs/                   # Cliente web con Three.js
│   ├── src/
│   │   ├── components/
│   │   │   └── WebSocketVisualization.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
└── README.md                  # Esta documentación
```

---

## 🚀 Instalación y Ejecución

### 1. 📦 Instalar dependencias del servidor Python

```bash
cd python
pip install -r requirements.txt
```

### 2. 🐍 Ejecutar el servidor WebSocket

```bash
cd python
python run_server.py
```

El servidor estará disponible en `ws://localhost:8765`

### 3. 🌐 Instalar dependencias del cliente web

```bash
cd threejs
npm install
```

### 4. 🎯 Ejecutar el cliente web

```bash
cd threejs
npm run dev
```

El cliente estará disponible en `http://localhost:5173`

### 🛠️ Solución de Problemas

Si experimentas errores de compatibilidad con React, ejecuta:

**Windows:**
```bash
cd threejs
install-clean.bat
```

**Linux/macOS:**
```bash
cd threejs
chmod +x install-clean.sh
./install-clean.sh
```

Esto realizará una instalación limpia con versiones compatibles de React 18.

---

## 🔧 Características Implementadas

### 🐍 Servidor Python

- **WebSocket Server**: Escucha en `localhost:8765`
- **Datos simulados**: Posición, rotación, color, escala
- **Sensores simulados**: Ritmo cardíaco, temperatura, movimiento
- **Envío continuo**: Datos cada 0.5 segundos
- **Manejo de conexiones**: Múltiples clientes simultáneos

### 🌐 Cliente Three.js + React

- **Visualización 3D**: Cubo animado que responde a datos del servidor
- **React Three Fiber**: Integración de Three.js con React
- **Conexión automática**: Se conecta automáticamente al servidor
- **Reconexión**: Intenta reconectar si se pierde la conexión
- **UI en tiempo real**: Muestra estado de conexión y datos de sensores
- **Controles de cámara**: OrbitControls para navegación 3D

---

## 📊 Datos Transmitidos

El servidor envía datos en formato JSON con la siguiente estructura:

```json
{
  "type": "update",
  "object": {
    "position": { "x": 2.5, "y": 1.2, "z": -0.8 },
    "rotation": { "x": 0.5, "y": 0.3, "z": 0.7 },
    "scale": 1.3,
    "color": { "r": 0.8, "g": 0.4, "b": 0.2 }
  },
  "sensors": {
    "heartRate": 85,
    "temperature": 36.8,
    "motion": 42
  },
  "timestamp": 1234
}
```

---

## 🎮 Interacciones Disponibles

### En el Cliente Web:
- 🖱️ **Clic y arrastrar**: Rotar la cámara alrededor de la escena
- 🎯 **Scroll**: Hacer zoom in/out
- 🔄 **Botón Reconectar**: Reconectar manualmente al servidor
- 📊 **Panel de información**: Ver datos en tiempo real

### Efectos Visuales:
- 📦 **Cubo animado**: Cambia posición, color y escala según datos del servidor
- 🎨 **Color dinámico**: Verde cuando conectado, rojo cuando desconectado
- 📈 **Datos de sensores**: Mostrados como texto 3D en la escena
- ⚡ **Grid y ejes**: Referencias visuales para orientación

---

## 🧪 Actividades Realizadas

### ✅ 1. Servidor WebSocket en Python
- Implementado con `websockets` y `asyncio`
- Envía datos simulados cada 0.5 segundos
- Maneja múltiples conexiones simultáneas
- Datos incluyen posición, rotación, color y sensores

### ✅ 2. Cliente Web con Three.js + React
- Escena 3D interactiva con React Three Fiber
- Conexión WebSocket automática con reconexión
- Visualización en tiempo real de datos del servidor
- UI moderna con información de estado

### ✅ 3. Comunicación Bidireccional
- Cliente se conecta automáticamente al servidor
- Servidor detecta conexiones y desconexiones
- Manejo de errores y reconexión automática

---

## 📸 Capturas del Sistema

### 🖥️ Servidor Python en Funcionamiento
```
🌐 Taller 58 - Servidor WebSocket
========================================
📡 Servidor iniciando en ws://localhost:8765
💻 Abre el cliente web para ver la visualización
🛑 Presiona Ctrl+C para detener
========================================
🔗 Cliente conectado desde 127.0.0.1
```

### 🎯 Cliente Web - Características Visuales
- **Cubo 3D animado** que cambia posición y color en tiempo real
- **Panel de información** con estado de conexión y datos actuales
- **Controles de cámara** para explorar la escena 3D
- **Grid de referencia** y ejes de coordenadas
- **Estadísticas de rendimiento** (FPS, memoria)

---

## 🔧 Código Relevante

### 📡 Configuración del WebSocket (Cliente)

```javascript
const connectWebSocket = () => {
  const ws = new WebSocket('ws://localhost:8765')
  
  ws.onopen = () => {
    setConnectionStatus('Connected')
    setIsConnected(true)
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    setWebsocketData(data)
  }
  
  ws.onclose = () => {
    setConnectionStatus('Disconnected')
    // Reconexión automática
    setTimeout(connectWebSocket, 3000)
  }
}
```

### 🎯 Actualización de Objeto 3D

```javascript
useEffect(() => {
  if (meshRef.current && data) {
    // Actualizar posición
    meshRef.current.position.set(
      data.object.position.x,
      data.object.position.y,
      data.object.position.z
    )
    
    // Actualizar color
    meshRef.current.material.color.setRGB(
      data.object.color.r,
      data.object.color.g,
      data.object.color.b
    )
  }
}, [data])
```

---

## 🌟 Extensiones Posibles

### 🎮 Funcionalidades Adicionales:
- **Control bidireccional**: Enviar comandos desde el cliente al servidor
- **Múltiples objetos**: Visualizar varios elementos simultáneamente
- **Grabación de datos**: Guardar y reproducir sesiones
- **Audio reactivo**: Sincronizar visualización con sonido

### 🚀 Despliegue:
- **Servidor**: Heroku, Railway, o DigitalOcean
- **Cliente**: Vercel, Netlify, o GitHub Pages
- **WebSocket seguro**: WSS para HTTPS

---

## ✅ Criterios de Evaluación Cumplidos

- ✅ **Comunicación WebSocket funcionando**: Servidor y cliente conectados
- ✅ **Visualización en tiempo real**: Cubo que responde a datos del servidor
- ✅ **Código organizado**: Estructura clara y comentada
- ✅ **Evidencia funcionando**: Sistema completamente operativo
- ✅ **Carpeta organizada**: Separación clara entre servidor y cliente
- ✅ **README explicativo**: Documentación completa del proyecto

---

## 🛠️ Tecnologías Utilizadas

### Backend:
- **Python 3.8+**
- **websockets 12.0**: Servidor WebSocket asíncrono
- **asyncio**: Programación asíncrona
- **json**: Serialización de datos

### Frontend:
- **React 19**: Framework de UI
- **Three.js**: Motor 3D
- **React Three Fiber**: Integración React-Three.js
- **React Three Drei**: Componentes helper para R3F
- **Vite**: Build tool y dev server

---

## 📚 Recursos de Aprendizaje

- [WebSocket API - MDN](https://developer.mozilla.org/es/docs/Web/API/WebSocket)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [websockets - Python](https://websockets.readthedocs.io/)
- [Three.js Documentation](https://threejs.org/docs/)

---

**🎯 Este taller demuestra cómo crear aplicaciones interactivas en tiempo real combinando WebSockets con visualización 3D, una base fundamental para muchas aplicaciones modernas como IoT dashboards, juegos multijugador y sistemas de monitoreo en vivo.**
