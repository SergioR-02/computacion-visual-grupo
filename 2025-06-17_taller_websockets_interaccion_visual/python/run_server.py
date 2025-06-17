#!/usr/bin/env python3
"""
Taller 58 - WebSockets e Interacción Visual en Tiempo Real
Servidor WebSocket que envía datos aleatorios para visualización 3D
"""

import asyncio
import websockets
import json
import random
import math

async def send_random_data(websocket):
    """Envía datos aleatorios continuamente a los clientes conectados"""
    counter = 0
    
    while True:
        try:
            # Crear datos variados para visualización
            time_factor = counter * 0.1
            
            data = {
                "type": "update",
                "object": {
                    "position": {
                        "x": math.sin(time_factor) * 3 + random.uniform(-1, 1),
                        "y": math.cos(time_factor) * 2 + random.uniform(-0.5, 0.5),
                        "z": random.uniform(-1, 1)
                    },
                    "rotation": {
                        "x": time_factor * 0.5,
                        "y": time_factor * 0.3,
                        "z": time_factor * 0.7
                    },
                    "scale": 1 + math.sin(time_factor * 2) * 0.3,
                    "color": {
                        "r": (math.sin(time_factor) + 1) * 0.5,
                        "g": (math.sin(time_factor + 2) + 1) * 0.5,
                        "b": (math.sin(time_factor + 4) + 1) * 0.5
                    }
                },
                "sensors": {
                    "heartRate": 70 + math.sin(time_factor * 10) * 20,
                    "temperature": 36.5 + random.uniform(-0.5, 0.5),
                    "motion": random.uniform(0, 100)
                },
                "timestamp": counter
            }
            
            await websocket.send(json.dumps(data))
            counter += 1
            await asyncio.sleep(0.5)  # 2 FPS
            
        except websockets.exceptions.ConnectionClosed:
            break
        except Exception as e:
            print(f"Error enviando datos: {e}")
            break

async def handle_client(websocket, path):
    """Maneja cada cliente que se conecta"""
    client_ip = websocket.remote_address[0]
    print(f"🔗 Cliente conectado desde {client_ip}")
    
    try:
        await send_random_data(websocket)
    finally:
        print(f"🔌 Cliente {client_ip} desconectado")

def main():
    """Función principal"""
    print("🌐 Taller 58 - Servidor WebSocket")
    print("=" * 40)
    print("📡 Servidor iniciando en ws://localhost:8765")
    print("💻 Abre el cliente web para ver la visualización")
    print("🛑 Presiona Ctrl+C para detener")
    print("=" * 40)
    
    # Iniciar servidor
    start_server = websockets.serve(handle_client, "localhost", 8765)
    
    try:
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")

if __name__ == "__main__":
    main() 