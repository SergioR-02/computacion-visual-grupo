# 🧪 Taller - WebSockets e Interacción Visual en Tiempo Real

## 📅 Fecha
`2025-06-17` – Fecha de entrega del taller

---

## 🎯 Objetivo del Taller

Comprender cómo usar **WebSockets** para habilitar comunicación en **tiempo real** entre un cliente (interfaz visual) y un servidor. El objetivo es crear una visualización gráfica que reaccione dinámicamente a datos transmitidos por WebSocket, estableciendo un canal de comunicación bidireccional que permita la sincronización instantánea entre el backend y la representación visual 3D.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Comunicación en tiempo real con WebSockets
- [x] Arquitectura cliente-servidor asíncrona
- [x] Transmisión de datos JSON estructurados
- [x] Visualización 3D reactiva con Three.js
- [x] Gestión de estados en React con hooks
- [x] Reconexión automática y manejo de errores
- [x] Simulación de sensores y datos en tiempo real
- [x] Sincronización entre servidor Python y cliente JavaScript

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- Python (`websockets==12.0`, `asyncio` para servidor WebSocket)
- Three.js / React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- React 18 con Vite para desarrollo del cliente
- JSON para serialización de datos
- CSS3 para interfaz y efectos visuales


---

## 📁 Estructura del Proyecto

```
2025-06-17_taller_websockets_interaccion_visual/
├── python/                   # Servidor WebSocket
│   ├── server.py            # Servidor principal con async/await
│   ├── run_server.py        # Script de ejecución
│   ├── requirements.txt     # Dependencias Python
│   └── start.bat           # Batch script para Windows
├── threejs/                 # Cliente visual React Three Fiber
│   ├── src/
│   │   ├── components/     # Componentes de visualización
│   │   │   ├── WebSocketVisualization.jsx
│   │   │   └── ParticleSystem.jsx
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Punto de entrada
│   ├── package.json        # Dependencias Node.js
│   └── README.md
├── Evidencia/              # GIFs y capturas de funcionamiento
│   └── Evidencia.gif       # Demostración del sistema completo
└── README.md
```


---

## 🧪 Implementación

Explica el proceso:

### 🔹 Etapas realizadas
1. **Servidor WebSocket Python**: Implementación de servidor asíncrono que genera y transmite datos simulados.
2. **Protocolo de comunicación**: Definición de estructura JSON para transmitir posición, color, sensores y timestamps.
3. **Cliente React Three Fiber**: Desarrollo de visualización 3D reactiva que consume datos del WebSocket.
4. **Manejo de conexiones**: Implementación de reconexión automática y gestión de estados de conexión.
5. **Visualización en tiempo real**: Sincronización de objetos 3D con datos recibidos del servidor.
6. **Sistema de partículas**: Efectos visuales adicionales para enriquecer la experiencia.

### 🔹 Código relevante

Servidor WebSocket Python con datos simulados:

```python
import asyncio
import websockets
import json
import random
from datetime import datetime

COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]

async def handler(websocket, path):
    """Maneja las conexiones WebSocket y envía datos en tiempo real"""
    print(f"Nueva conexión establecida: {websocket.remote_address}")
    
    try:
        while True:
            # Generar datos aleatorios
            data = {
                "x": random.uniform(-5, 5),
                "y": random.uniform(-5, 5),
                "z": random.uniform(-2, 2),
                "color": random.choice(COLORS),
                "scale": random.uniform(0.5, 2.0),
                "rotation": {
                    "x": random.uniform(0, 2 * 3.14159),
                    "y": random.uniform(0, 2 * 3.14159),
                    "z": random.uniform(0, 2 * 3.14159)
                },
                "timestamp": datetime.now().isoformat(),
                "heartRate": random.randint(60, 120),
                "temperature": random.uniform(36.0, 38.0)
            }
            
            await websocket.send(json.dumps(data))
            await asyncio.sleep(0.5)
            
    except websockets.exceptions.ConnectionClosed:
        print(f"Conexión cerrada: {websocket.remote_address}")
```

Cliente React Three Fiber con WebSocket:

```jsx
export default function WebSocketVisualization() {
  const [websocketData, setWebsocketData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [isConnected, setIsConnected] = useState(false)
  const websocketRef = useRef(null)

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8765')
      websocketRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('Connected')
        setIsConnected(true)
      }

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          setWebsocketData(data)
        } catch (error) {
          console.error('Error parseando datos JSON:', error)
        }
      }

      ws.onclose = () => {
        setConnectionStatus('Disconnected')
        setIsConnected(false)
        
        // Reconexión automática
        setTimeout(() => {
          if (websocketRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket()
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Error creando WebSocket:', error)
    }
  }

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    connectWebSocket()
    return () => websocketRef.current?.close()
  }, [])
}
```

Componente 3D que reacciona a datos WebSocket:

```jsx
function AnimatedCube({ data, isConnected }) {
  const meshRef = useRef()

  useEffect(() => {
    if (meshRef.current && data) {
      // Actualizar posición en tiempo real
      if (data.object?.position) {
        meshRef.current.position.set(
          data.object.position.x,
          data.object.position.y,
          data.object.position.z
        )
      }

      // Actualizar color dinámicamente
      if (data.object?.color && meshRef.current.material) {
        meshRef.current.material.color.setRGB(
          data.object.color.r,
          data.object.color.g,
          data.object.color.b
        )
      }
    }
  }, [data])

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={isConnected ? '#00ff88' : '#ff4444'} 
        wireframe={!isConnected} 
      />
    </mesh>
  )
}
```

---

## 📊 Resultados Visuales


El GIF demuestra el funcionamiento completo del sistema de comunicación WebSocket:
- Servidor Python generando datos aleatorios cada 0.5 segundos
- Cliente React Three Fiber recibiendo y visualizando datos en tiempo real
- Objetos 3D cambiando posición, color y escala dinámicamente
- Panel de información mostrando estado de conexión y datos de sensores
- Reconexión automática en caso de pérdida de conexión
- Visualización de datos simulados (ritmo cardíaco, temperatura, movimiento)

![Evidencia](./Evidencia/Evidencia.gif)

### 🔹 Características implementadas:

- **Comunicación bidireccional**: WebSocket persistente entre Python y JavaScript
- **Datos en tiempo real**: Transmisión cada 500ms con información estructurada
- **Visualización reactiva**: Objetos 3D que responden instantáneamente a cambios
- **Gestión de conexiones**: Reconexión automática y manejo de errores
- **Simulación de sensores**: Datos de ritmo cardíaco, temperatura y movimiento
- **Interface informativa**: Panel con estado de conexión y métricas en tiempo real
- **Efectos visuales**: Sistema de partículas y animaciones suaves

---

## 🧩 Prompts Usados

Enumera los prompts utilizados:

```text

"Agregar sistema de reconexión automática al WebSocket, manejo de errores de conexión, y panel de información que muestre estado de conexión y datos de sensores recibidos"

"Crear componente AnimatedCube que reaccione a datos WebSocket actualizando posición, color y escala de mesh 3D, con animación suave y efectos visuales"

"Implementar sistema de partículas adicional y efectos visuales para enriquecer la visualización, con interfaz moderna y responsive"
```



---

## 💬 Reflexión Final

Este taller me permitió comprender profundamente el funcionamiento de **WebSockets** y su aplicación en sistemas de visualización en tiempo real. La experiencia de sincronizar un servidor Python asíncrono con una interfaz visual 3D fue especialmente enriquecedora, ya que combina programación backend, frontend y gráficos 3D de manera integrada.

La parte más compleja fue el **manejo correcto de las conexiones asíncronas** y la gestión de estados en React para mantener la sincronización entre los datos recibidos y la representación visual. Implementar la reconexión automática y el manejo de errores fue crucial para crear un sistema robusto y confiable.

Para futuros proyectos, aplicaría estos conocimientos en **aplicaciones IoT más complejas**, sistemas de monitoreo en tiempo real, dashboards colaborativos, y aplicaciones de control remoto. También sería interesante explorar WebRTC para comunicación peer-to-peer y integrar múltiples clientes simultáneos con sincronización de estado compartido.
