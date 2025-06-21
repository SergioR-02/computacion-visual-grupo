"""
Script de diagnóstico para WebSocket
"""

import asyncio
import websockets
import json
import time

async def test_connection():
    """Prueba la conexión WebSocket"""
    uri = "ws://localhost:8765"
    
    print("🔍 Iniciando diagnóstico de WebSocket...")
    print("=" * 50)
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Conexión establecida")
            
            # Esperar mensaje de bienvenida
            try:
                welcome = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"📨 Mensaje de bienvenida: {welcome}")
            except asyncio.TimeoutError:
                print("⚠️  No se recibió mensaje de bienvenida")
            
            # Enviar ping
            ping_msg = json.dumps({"type": "ping", "timestamp": time.time()})
            await websocket.send(ping_msg)
            print(f"📤 Ping enviado: {ping_msg}")
            
            # Esperar datos por 10 segundos
            print("\n📡 Esperando datos del monitor...")
            start_time = time.time()
            message_count = 0
            
            while time.time() - start_time < 10:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    data = json.loads(message)
                    message_count += 1
                    
                    # Mostrar resumen de datos
                    if data.get('type') != 'connection':
                        print(f"\n✅ Mensaje #{message_count}:")
                        print(f"   Timestamp: {data.get('timestamp', 'N/A')}")
                        print(f"   Personas: {data.get('people_count', 'N/A')}")
                        print(f"   Objetos: {data.get('objects_count', 'N/A')}")
                        print(f"   Movimiento: {data.get('movement_intensity', 'N/A')}")
                        print(f"   Manos: {data.get('hands_count', 'N/A')}")
                        print(f"   Gestos: {data.get('hand_gestures', [])}")
                        
                except asyncio.TimeoutError:
                    print(".", end="", flush=True)
                except json.JSONDecodeError as e:
                    print(f"\n❌ Error decodificando JSON: {e}")
                except Exception as e:
                    print(f"\n❌ Error recibiendo mensaje: {e}")
            
            print(f"\n\n📊 Resumen: {message_count} mensajes recibidos en 10 segundos")
            
            if message_count == 0:
                print("⚠️  NO SE RECIBIERON DATOS - Posibles causas:")
                print("   1. El método websocket_sender no está enviando datos")
                print("   2. La cola de datos está vacía")
                print("   3. No hay clientes en connected_clients")
                print("   4. Error en compress_data_for_websocket")
            
    except ConnectionRefusedError:
        print("❌ Conexión rechazada - Asegúrate de que main.py esté ejecutándose")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

async def test_raw_server():
    """Prueba directa del servidor WebSocket"""
    print("\n\n🔧 Prueba directa del servidor...")
    print("=" * 50)
    
    try:
        # Crear un servidor de eco simple
        async def echo(websocket, path):
            print(f"Cliente conectado: {websocket.remote_address}")
            await websocket.send(json.dumps({"type": "test", "message": "Servidor funcionando"}))
            async for message in websocket:
                print(f"Mensaje recibido: {message}")
                await websocket.send(f"Echo: {message}")
        
        # Iniciar servidor de prueba
        server = await websockets.serve(echo, "localhost", 8766)
        print("✅ Servidor de prueba iniciado en ws://localhost:8766")
        print("   (Este es solo para verificar que WebSockets funciona)")
        
        # Probar conexión
        async with websockets.connect("ws://localhost:8766") as ws:
            await ws.send("test")
            response = await ws.recv()
            print(f"✅ Respuesta del servidor de prueba: {response}")
        
        server.close()
        await server.wait_closed()
        
    except Exception as e:
        print(f"❌ Error en servidor de prueba: {e}")

if __name__ == "__main__":
    print("🧪 Diagnóstico de WebSocket - Monitor Visual 3D")
    asyncio.run(test_connection())
    asyncio.run(test_raw_server()) 