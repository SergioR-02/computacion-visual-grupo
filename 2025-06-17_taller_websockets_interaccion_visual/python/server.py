import asyncio
import websockets
import json
import random
import time
from datetime import datetime

# Lista de colores disponibles
COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080"]

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
                "heartRate": random.randint(60, 120),  # Simular ritmo cardíaco
                "temperature": random.uniform(36.0, 38.0)  # Simular temperatura
            }
            
            # Enviar datos como JSON
            await websocket.send(json.dumps(data))
            print(f"Datos enviados: x={data['x']:.2f}, y={data['y']:.2f}, color={data['color']}")
            
            # Esperar 0.5 segundos antes del siguiente envío
            await asyncio.sleep(0.5)
            
    except websockets.exceptions.ConnectionClosed:
        print(f"Conexión cerrada: {websocket.remote_address}")
    except Exception as e:
        print(f"Error en la conexión: {e}")

async def main():
    """Función principal del servidor"""
    print("🚀 Iniciando servidor WebSocket...")
    print("📡 Escuchando en ws://localhost:8765")
    print("💡 Presiona Ctrl+C para detener el servidor")
    
    # Crear y ejecutar el servidor
    async with websockets.serve(handler, "localhost", 8765):
        try:
            await asyncio.Future()  # Ejecutar indefinidamente
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido por el usuario")

if __name__ == "__main__":
    asyncio.run(main()) 