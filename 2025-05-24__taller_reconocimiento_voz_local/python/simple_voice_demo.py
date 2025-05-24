#!/usr/bin/env python3
"""
Demo Simple de Reconocimiento de Voz
Ejemplo básico de captura y reconocimiento de voz sin interfaz visual compleja.
"""

import speech_recognition as sr
import pyttsx3
import time

class SimpleVoiceDemo:
    def __init__(self):
        """Inicializa el demo simple de voz."""
        # Configuración de reconocimiento de voz
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Configuración de síntesis de voz
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)
        
        # Estado simple
        self.is_running = True
        self.commands_count = 0
        
        # Comandos básicos
        self.basic_commands = {
            'hola': '¡Hola! ¿Cómo estás?',
            'hello': 'Hello! How are you?',
            'adiós': '¡Hasta luego!',
            'goodbye': 'Goodbye!',
            'nombre': 'Me llamo Asistente de Voz',
            'name': 'My name is Voice Assistant',
            'hora': f'La hora actual es {time.strftime("%H:%M")}',
            'time': f'Current time is {time.strftime("%H:%M")}',
            'ayuda': 'Puedes decir: hola, adiós, nombre, hora, salir',
            'help': 'You can say: hello, goodbye, name, time, exit',
            'salir': 'exit_command',
            'exit': 'exit_command'
        }
        
        # Calibrar micrófono
        self._calibrate_microphone()
    
    def _calibrate_microphone(self):
        """Calibra el micrófono para el ruido ambiente."""
        print("🔧 Calibrando micrófono...")
        print("   Mantén silencio por un momento...")
        
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=2)
        
        print("✅ Calibración completada")
    
    def speak(self, text: str):
        """Convierte texto a voz."""
        print(f"🔊 Diciendo: {text}")
        self.tts_engine.say(text)
        self.tts_engine.runAndWait()
    
    def listen_once(self) -> str:
        """Escucha un comando único."""
        try:
            print("\n🎤 Escuchando... (habla ahora)")
            
            with self.microphone as source:
                # Escuchar audio
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=5)
            
            print("⚙️ Procesando...")
            
            # Intentar reconocimiento offline primero
            try:
                command = self.recognizer.recognize_sphinx(audio, language='es-ES').lower()
                print(f"📝 Comando reconocido (Sphinx): '{command}'")
                return command
            except sr.UnknownValueError:
                # Fallback a Google Speech Recognition
                try:
                    command = self.recognizer.recognize_google(audio, language='es-ES').lower()
                    print(f"📝 Comando reconocido (Google): '{command}'")
                    return command
                except sr.UnknownValueError:
                    print("❌ No se pudo entender el comando")
                    return ""
                except sr.RequestError:
                    print("❌ Error de conexión con Google Speech Recognition")
                    return ""
                    
        except sr.WaitTimeoutError:
            print("⏰ Tiempo de espera agotado")
            return ""
        except Exception as e:
            print(f"❌ Error: {e}")
            return ""
    
    def process_command(self, command: str):
        """Procesa un comando y responde."""
        if not command.strip():
            return True
        
        # Buscar comando en el diccionario
        for key, response in self.basic_commands.items():
            if key in command:
                if response == 'exit_command':
                    self.speak("¡Hasta luego!")
                    return False
                else:
                    self.speak(response)
                    self.commands_count += 1
                    return True
        
        # Si no se encuentra el comando
        self.speak(f"No conozco el comando '{command}'. Di 'ayuda' para ver comandos disponibles.")
        return True
    
    def show_stats(self):
        """Muestra estadísticas de la sesión."""
        print(f"\n📊 Estadísticas de la sesión:")
        print(f"   Comandos procesados: {self.commands_count}")
        print(f"   Duración aproximada: {time.strftime('%M:%S', time.gmtime(time.time()))}")
    
    def run(self):
        """Ejecuta el demo."""
        print("=== Demo Simple de Reconocimiento de Voz ===")
        print("Este demo muestra reconocimiento de voz básico sin interfaz visual.")
        print("\n💡 Comandos disponibles:")
        for cmd in ['hola', 'adiós', 'nombre', 'hora', 'ayuda', 'salir']:
            print(f"   - {cmd}")
        
        self.speak("Demo de reconocimiento de voz iniciado. Di 'ayuda' para conocer los comandos.")
        
        while self.is_running:
            try:
                # Escuchar comando
                command = self.listen_once()
                
                # Procesar comando
                if command:
                    if not self.process_command(command):
                        break
                
                # Pequeña pausa entre comandos
                time.sleep(0.5)
                
            except KeyboardInterrupt:
                print("\n\n⏹️ Demo interrumpido por el usuario")
                break
        
        self.show_stats()
        print("👋 ¡Gracias por probar el demo!")

def main():
    """Función principal."""
    try:
        demo = SimpleVoiceDemo()
        demo.run()
    except Exception as e:
        print(f"❌ Error al ejecutar el demo: {e}")
        print("💡 Asegúrate de haber ejecutado 'python setup.py' primero")

if __name__ == "__main__":
    main() 