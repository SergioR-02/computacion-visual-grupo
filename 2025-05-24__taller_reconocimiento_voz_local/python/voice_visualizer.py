#!/usr/bin/env python3
"""
Voice Visualizer - Taller de Reconocimiento de Voz Local
Captura comandos de voz y los convierte en acciones visuales.
"""

import speech_recognition as sr
import pyttsx3
import pygame
import threading
import time
import random
import math
import sys
import numpy as np
import pyaudio
from typing import Dict, List, Tuple, Optional

class VoiceVisualizer:
    def __init__(self, width: int = 800, height: int = 600):
        """Inicializa el visualizador de voz."""
        # Configuración de pygame
        pygame.init()
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Voice Visualizer - Reconocimiento de Voz Local")
        self.clock = pygame.time.Clock()
        
        # Colores disponibles
        self.colors = {
            'rojo': (255, 0, 0),
            'red': (255, 0, 0),
            'azul': (0, 0, 255),
            'blue': (0, 0, 255),
            'verde': (0, 255, 0),
            'green': (0, 255, 0),
            'amarillo': (255, 255, 0),
            'yellow': (255, 255, 0),
            'morado': (128, 0, 128),
            'purple': (128, 0, 128),
            'naranja': (255, 165, 0),
            'orange': (255, 165, 0),
            'blanco': (255, 255, 255),
            'white': (255, 255, 255),
            'negro': (0, 0, 0),
            'black': (0, 0, 0)
        }
        
        # Estado actual del visualizador
        self.current_color = (255, 255, 255)  # Blanco por defecto
        self.background_color = (0, 0, 0)     # Negro por defecto
        self.shape = 'circle'  # 'circle', 'square', 'triangle'
        self.size = 50
        self.position = [width // 2, height // 2]
        self.is_rotating = False
        self.rotation_angle = 0
        self.is_moving = False
        self.velocity = [0, 0]
        self.is_listening = False
        self.status_message = "Presiona ESPACIO para comenzar a escuchar"
        
        # Debug y logs de reconocimiento
        self.last_recognized_text = ""
        self.recognition_method = ""
        self.debug_messages = []
        self.sphinx_available = False
        
        # Configuración de reconocimiento de voz
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Configuración de síntesis de voz con thread safety
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)  # Velocidad de habla
        self.tts_lock = threading.Lock()  # Lock para evitar conflictos de TTS
        self.tts_busy = False
        
        # Comandos disponibles
        self.commands = self._load_commands()
        
        # Thread para reconocimiento de voz
        self.voice_thread = None
        self.running = True
        
        # Configuración para visualización de audio
        self.audio_format = pyaudio.paInt16
        self.audio_channels = 1
        self.audio_rate = 44100
        self.audio_chunk = 1024
        self.audio_levels = [0.0] * 50  # Array para almacenar niveles de audio
        self.max_audio_level = 0.1  # Inicializar con valor mínimo
        self.audio_thread = None
        self.audio_stream = None
        self.pyaudio_instance = None
        
        # Verificar disponibilidad de Sphinx
        self._check_sphinx_availability()
        
        # Calibrar micrófono
        self._calibrate_microphone()
        
        # Iniciar captura de audio para visualización
        self._init_audio_visualization()
        
    def _check_sphinx_availability(self):
        """Verifica si PocketSphinx está disponible y configurado."""
        try:
            import pocketsphinx
            self.sphinx_available = True
            self.add_debug_message("✅ PocketSphinx disponible")
        except ImportError:
            self.sphinx_available = False
            self.add_debug_message("⚠️ PocketSphinx no instalado - usando solo Google Speech")
    
    def add_debug_message(self, message: str):
        """Agrega un mensaje de debug que se muestra en pantalla."""
        self.debug_messages.append(f"{time.strftime('%H:%M:%S')} - {message}")
        # Mantener solo los últimos 5 mensajes
        if len(self.debug_messages) > 5:
            self.debug_messages.pop(0)
        print(message)  # También imprimir en consola
        
    def _load_commands(self) -> Dict[str, str]:
        """Carga el diccionario de comandos disponibles."""
        return {
            # Colores
            'rojo': 'color', 'red': 'color',
            'azul': 'color', 'blue': 'color',
            'verde': 'color', 'green': 'color',
            'amarillo': 'color', 'yellow': 'color',
            'morado': 'color', 'purple': 'color',
            'naranja': 'color', 'orange': 'color',
            'blanco': 'color', 'white': 'color',
            'negro': 'color', 'black': 'color',
            
            # Formas
            'círculo': 'shape', 'circle': 'shape', 'circulo': 'shape',
            'cuadrado': 'shape', 'square': 'shape',
            'triángulo': 'shape', 'triangle': 'shape', 'triangulo': 'shape',
            
            # Acciones
            'girar': 'rotate', 'rotar': 'rotate', 'spin': 'rotate',
            'mover': 'move', 'move': 'move',
            'detener': 'stop', 'parar': 'stop', 'stop': 'stop',
            'iniciar': 'start', 'empezar': 'start', 'start': 'start',
            'grande': 'size_big', 'big': 'size_big',
            'pequeño': 'size_small', 'small': 'size_small', 'pequeno': 'size_small',
            'normal': 'size_normal',
            'centro': 'center', 'centrar': 'center',
            'limpiar': 'clear', 'clear': 'clear',
            'ayuda': 'help', 'help': 'help'
        }
    
    def _calibrate_microphone(self):
        """Calibra el micrófono para el ruido ambiente."""
        self.add_debug_message("🔧 Calibrando micrófono...")
        try:
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            self.add_debug_message("✅ Calibración completada")
        except Exception as e:
            self.add_debug_message(f"❌ Error en calibración: {e}")
    
    def _init_audio_visualization(self):
        """Inicializa la captura de audio para visualización en tiempo real."""
        try:
            self.pyaudio_instance = pyaudio.PyAudio()
            self.audio_stream = self.pyaudio_instance.open(
                format=self.audio_format,
                channels=self.audio_channels,
                rate=self.audio_rate,
                input=True,
                frames_per_buffer=self.audio_chunk,
                input_device_index=None  # Usar dispositivo por defecto
            )
            
            # Iniciar thread para captura de audio
            self.audio_thread = threading.Thread(target=self._capture_audio_levels, daemon=True)
            self.audio_thread.start()
            
            self.add_debug_message("✅ Visualización de audio inicializada")
        except Exception as e:
            self.add_debug_message(f"⚠️ Error inicializando audio: {e}")
            self.audio_stream = None
    
    def _capture_audio_levels(self):
        """Captura niveles de audio en tiempo real para visualización."""
        while self.running and self.audio_stream:
            try:
                if self.is_listening:
                    # Leer datos de audio
                    data = self.audio_stream.read(self.audio_chunk, exception_on_overflow=False)
                    
                    # Validar que tenemos datos
                    if data and len(data) > 0:
                        # Convertir a numpy array
                        audio_data = np.frombuffer(data, dtype=np.int16)
                        
                        # Validar que no está vacío y no tiene valores inválidos
                        if len(audio_data) > 0:
                            # Filtrar valores extremos
                            audio_data = np.clip(audio_data, -32768, 32767)
                            
                            # Calcular RMS (Root Mean Square) para obtener el nivel de volumen
                            mean_square = np.mean(audio_data.astype(np.float64)**2)
                            
                            # Validar que mean_square es válido
                            if not np.isnan(mean_square) and mean_square >= 0:
                                rms = np.sqrt(mean_square)
                                
                                # Normalizar el valor (ajustar según sea necesario)
                                normalized_level = min(rms / 2000.0, 1.0)  # Reducir divisor para más sensibilidad
                                
                                # Validar que el resultado es un número válido
                                if not np.isnan(normalized_level) and not np.isinf(normalized_level):
                                    # Actualizar max level para auto-scaling
                                    if normalized_level > self.max_audio_level:
                                        self.max_audio_level = normalized_level
                                    
                                    # Agregar al array de niveles (efecto de onda deslizante)
                                    self.audio_levels.append(float(normalized_level))
                                else:
                                    self.audio_levels.append(0.0)
                            else:
                                self.audio_levels.append(0.0)
                        else:
                            self.audio_levels.append(0.0)
                    else:
                        self.audio_levels.append(0.0)
                else:
                    # Si no está escuchando, agregar silencio
                    self.audio_levels.append(0.0)
                
                # Mantener solo los últimos 50 valores
                if len(self.audio_levels) > 50:
                    self.audio_levels.pop(0)
                
                # Pequeña pausa para no saturar el CPU
                time.sleep(0.02)  # ~50 FPS para la visualización de audio
                
            except Exception as e:
                # Si hay error, agregar nivel silencioso
                self.audio_levels.append(0.0)
                if len(self.audio_levels) > 50:
                    self.audio_levels.pop(0)
                time.sleep(0.05)
    
    def speak(self, text: str):
        """Convierte texto a voz con thread safety."""
        def _speak():
            # Verificar si ya hay una síntesis en progreso
            if self.tts_busy:
                return
                
            with self.tts_lock:
                try:
                    self.tts_busy = True
                    # Detener cualquier síntesis anterior
                    self.tts_engine.stop()
                    
                    # Configurar el texto y ejecutar
                    self.tts_engine.say(text)
                    self.tts_engine.runAndWait()
                    
                except Exception as e:
                    self.add_debug_message(f"❌ Error TTS: {e}")
                finally:
                    self.tts_busy = False
        
        # Ejecutar en thread separado para no bloquear
        if not self.tts_busy:  # Solo crear nuevo thread si no hay uno ejecutándose
            threading.Thread(target=_speak, daemon=True).start()
    
    def listen_for_commands(self):
        """Escucha comandos de voz continuamente."""
        while self.running:
            if not self.is_listening:
                time.sleep(0.1)
                continue
                
            try:
                with self.microphone as source:
                    self.add_debug_message("🎤 Escuchando...")
                    self.status_message = "🎤 Escuchando... Habla ahora"
                    
                    # Escuchar con timeout
                    audio = self.recognizer.listen(source, timeout=2, phrase_time_limit=4)
                
                self.add_debug_message("⚙️ Procesando audio...")
                self.status_message = "⚙️ Procesando comando..."
                
                command_recognized = False
                
                # Intentar con PocketSphinx solo si está disponible
                if self.sphinx_available:
                    try:
                        command = self.recognizer.recognize_sphinx(audio, language='es-ES').lower()
                        self.last_recognized_text = command
                        self.recognition_method = "Sphinx (Offline)"
                        self.add_debug_message(f"🧠 Sphinx: '{command}'")
                        self.process_command(command)
                        command_recognized = True
                    except sr.UnknownValueError:
                        self.add_debug_message("⚠️ Sphinx no entendió el audio")
                    except Exception as e:
                        self.add_debug_message(f"❌ Error Sphinx: {str(e)[:50]}...")
                        # Si hay error con Sphinx, marcar como no disponible
                        if "language data directory" in str(e) or "missing PocketSphinx" in str(e):
                            self.sphinx_available = False
                            self.add_debug_message("❌ Deshabilitando Sphinx - datos faltantes")
                
                # Si Sphinx falló o no está disponible, intentar con Google
                if not command_recognized:
                    try:
                        command = self.recognizer.recognize_google(audio, language='es-ES').lower()
                        self.last_recognized_text = command
                        self.recognition_method = "Google (Online)"
                        self.add_debug_message(f"🌐 Google: '{command}'")
                        self.process_command(command)
                        command_recognized = True
                    except sr.UnknownValueError:
                        self.add_debug_message("❌ Google no entendió el audio")
                        self.last_recognized_text = "(no reconocido)"
                        self.recognition_method = "Ninguno"
                    except sr.RequestError as e:
                        self.add_debug_message(f"❌ Error conexión Google: {e}")
                        self.last_recognized_text = "(error conexión)"
                        self.recognition_method = "Error"
                
                if not command_recognized:
                    self.status_message = "❌ No se entendió el comando"
                        
            except sr.WaitTimeoutError:
                # Timeout normal, continuar escuchando
                pass
            except Exception as e:
                self.add_debug_message(f"❌ Error general: {str(e)[:50]}...")
                self.status_message = f"❌ Error: {str(e)[:30]}..."
    
    def process_command(self, command: str):
        """Procesa un comando de voz y ejecuta la acción correspondiente."""
        self.add_debug_message(f"🔍 Analizando: '{command}'")
        words = command.split()
        command_found = False
        
        for word in words:
            if word in self.commands:
                command_type = self.commands[word]
                command_found = True
                self.add_debug_message(f"✅ Comando encontrado: '{word}' -> {command_type}")
                
                if command_type == 'color':
                    self.change_color(word)
                elif command_type == 'shape':
                    self.change_shape(word)
                elif command_type == 'rotate':
                    self.start_rotation()
                elif command_type == 'move':
                    self.start_movement()
                elif command_type == 'stop':
                    self.stop_all()
                elif command_type == 'start':
                    self.start_all()
                elif command_type == 'size_big':
                    self.change_size('big')
                elif command_type == 'size_small':
                    self.change_size('small')
                elif command_type == 'size_normal':
                    self.change_size('normal')
                elif command_type == 'center':
                    self.center_shape()
                elif command_type == 'clear':
                    self.clear_screen()
                elif command_type == 'help':
                    self.show_help()
                
                break
        
        if not command_found:
            self.add_debug_message(f"❓ Comando no reconocido en: '{command}'")
            self.status_message = f"❓ Comando no reconocido: {command}"
            self.speak("Comando no reconocido")
    
    def change_color(self, color_name: str):
        """Cambia el color de la forma."""
        if color_name in self.colors:
            self.current_color = self.colors[color_name]
            self.status_message = f"🎨 Color cambiado a {color_name}"
            self.add_debug_message(f"🎨 Color -> {color_name}")
            self.speak(f"Color cambiado a {color_name}")
    
    def change_shape(self, shape_name: str):
        """Cambia la forma actual."""
        shape_map = {
            'círculo': 'circle', 'circle': 'circle', 'circulo': 'circle',
            'cuadrado': 'square', 'square': 'square',
            'triángulo': 'triangle', 'triangle': 'triangle', 'triangulo': 'triangle'
        }
        
        if shape_name in shape_map:
            self.shape = shape_map[shape_name]
            self.status_message = f"🔶 Forma cambiada a {shape_name}"
            self.add_debug_message(f"🔶 Forma -> {shape_name}")
            self.speak(f"Forma cambiada a {shape_name}")
    
    def start_rotation(self):
        """Inicia la rotación de la forma."""
        self.is_rotating = True
        self.status_message = "🔄 Rotación iniciada"
        self.add_debug_message("🔄 Rotación ON")
        self.speak("Iniciando rotación")
    
    def start_movement(self):
        """Inicia el movimiento aleatorio."""
        self.is_moving = True
        self.velocity = [random.randint(-3, 3), random.randint(-3, 3)]
        self.status_message = "🏃 Movimiento iniciado"
        self.add_debug_message("🏃 Movimiento ON")
        self.speak("Iniciando movimiento")
    
    def stop_all(self):
        """Detiene todas las animaciones."""
        self.is_rotating = False
        self.is_moving = False
        self.velocity = [0, 0]
        self.status_message = "⏹️ Todo detenido"
        self.add_debug_message("⏹️ Todo DETENIDO")
        self.speak("Todo detenido")
    
    def start_all(self):
        """Inicia todas las animaciones."""
        self.start_rotation()
        self.start_movement()
        self.status_message = "▶️ Todo iniciado"
        self.add_debug_message("▶️ Todo INICIADO")
        self.speak("Todo iniciado")
    
    def change_size(self, size_type: str):
        """Cambia el tamaño de la forma."""
        if size_type == 'big':
            self.size = 80
            self.speak("Tamaño grande")
        elif size_type == 'small':
            self.size = 30
            self.speak("Tamaño pequeño")
        else:  # normal
            self.size = 50
            self.speak("Tamaño normal")
        
        self.status_message = f"📏 Tamaño: {size_type}"
        self.add_debug_message(f"📏 Tamaño -> {size_type}")
    
    def center_shape(self):
        """Centra la forma en la pantalla."""
        self.position = [self.width // 2, self.height // 2]
        self.status_message = "🎯 Forma centrada"
        self.add_debug_message("🎯 Centrado")
        self.speak("Forma centrada")
    
    def clear_screen(self):
        """Limpia la pantalla."""
        self.background_color = (0, 0, 0)
        self.status_message = "🧹 Pantalla limpiada"
        self.add_debug_message("🧹 Pantalla limpia")
        self.speak("Pantalla limpiada")
    
    def show_help(self):
        """Muestra ayuda con los comandos disponibles."""
        self.status_message = "💡 Comandos: colores, formas, girar, mover, stop, start"
        self.add_debug_message("💡 Ayuda mostrada")
        self.speak("Comandos disponibles: colores como rojo, azul, verde. Formas como círculo, cuadrado, triángulo. Acciones como girar, mover, detener, iniciar")
    
    def update(self):
        """Actualiza el estado del visualizador."""
        # Actualizar rotación
        if self.is_rotating:
            self.rotation_angle += 5
            if self.rotation_angle >= 360:
                self.rotation_angle = 0
        
        # Actualizar movimiento
        if self.is_moving:
            self.position[0] += self.velocity[0]
            self.position[1] += self.velocity[1]
            
            # Rebotar en los bordes
            if self.position[0] <= self.size or self.position[0] >= self.width - self.size:
                self.velocity[0] *= -1
            if self.position[1] <= self.size or self.position[1] >= self.height - self.size:
                self.velocity[1] *= -1
            
            # Mantener dentro de los límites
            self.position[0] = max(self.size, min(self.width - self.size, self.position[0]))
            self.position[1] = max(self.size, min(self.height - self.size, self.position[1]))
    
    def draw_shape(self):
        """Dibuja la forma actual en la pantalla."""
        x, y = int(self.position[0]), int(self.position[1])
        
        if self.shape == 'circle':
            pygame.draw.circle(self.screen, self.current_color, (x, y), self.size)
        elif self.shape == 'square':
            if self.is_rotating:
                # Dibujar cuadrado rotado
                points = []
                for i in range(4):
                    angle = math.radians(self.rotation_angle + i * 90)
                    px = x + self.size * math.cos(angle)
                    py = y + self.size * math.sin(angle)
                    points.append((px, py))
                pygame.draw.polygon(self.screen, self.current_color, points)
            else:
                rect = pygame.Rect(x - self.size, y - self.size, self.size * 2, self.size * 2)
                pygame.draw.rect(self.screen, self.current_color, rect)
        elif self.shape == 'triangle':
            if self.is_rotating:
                # Dibujar triángulo rotado
                points = []
                for i in range(3):
                    angle = math.radians(self.rotation_angle + i * 120)
                    px = x + self.size * math.cos(angle)
                    py = y + self.size * math.sin(angle)
                    points.append((px, py))
                pygame.draw.polygon(self.screen, self.current_color, points)
            else:
                points = [
                    (x, y - self.size),
                    (x - self.size, y + self.size),
                    (x + self.size, y + self.size)
                ]
                pygame.draw.polygon(self.screen, self.current_color, points)
    
    def draw_audio_wave(self):
        """Dibuja la visualización de onda de audio en la parte inferior."""
        # Configuración de la barra de audio
        wave_height = 80
        wave_y_start = self.height - wave_height
        
        # Asegurar que tenemos suficientes niveles de audio
        if len(self.audio_levels) == 0:
            self.audio_levels = [0.0] * 50
        
        bar_width = max(1, self.width // len(self.audio_levels))
        
        # Dibujar fondo de la barra de audio
        wave_bg_rect = pygame.Rect(0, wave_y_start, self.width, wave_height)
        pygame.draw.rect(self.screen, (20, 20, 30), wave_bg_rect)
        
        # Dibujar línea separadora
        pygame.draw.line(self.screen, (100, 100, 100), 
                        (0, wave_y_start), (self.width, wave_y_start), 2)
        
        # Dibujar las barras de audio
        for i, level in enumerate(self.audio_levels):
            x = i * bar_width
            
            # Validar que level es un número válido
            if not isinstance(level, (int, float)) or np.isnan(level) or np.isinf(level):
                level = 0.0
            
            # Asegurar que level está en rango válido
            level = max(0.0, min(1.0, level))
            
            # Calcular altura de la barra basada en el nivel de audio
            bar_height = int(level * (wave_height - 20))  # Dejar margen
            bar_y = wave_y_start + (wave_height - bar_height) // 2
            
            # Determinar color basado en el nivel
            if level > 0.7:
                color = (255, 100, 100)  # Rojo para niveles altos
            elif level > 0.4:
                color = (255, 255, 100)  # Amarillo para niveles medios
            elif level > 0.1:
                color = (100, 255, 100)  # Verde para niveles bajos
            else:
                color = (50, 50, 80)     # Gris oscuro para silencio
            
            # Dibujar barra
            if bar_height > 2:  # Solo dibujar si hay altura suficiente
                bar_rect = pygame.Rect(x + 1, bar_y, bar_width - 2, bar_height)
                pygame.draw.rect(self.screen, color, bar_rect)
                
                # Agregar efecto de brillo en la parte superior
                if bar_height > 4:
                    highlight_color = tuple(min(255, c + 50) for c in color)
                    highlight_rect = pygame.Rect(x + 1, bar_y, bar_width - 2, 3)
                    pygame.draw.rect(self.screen, highlight_color, highlight_rect)
        
        # Dibujar etiqueta de estado de audio
        font = pygame.font.Font(None, 20)
        if self.is_listening:
            audio_status = "🔊 CAPTURANDO AUDIO"
            status_color = (100, 255, 100)
        else:
            audio_status = "🔇 AUDIO PAUSADO"
            status_color = (150, 150, 150)
        
        status_surface = font.render(audio_status, True, status_color)
        self.screen.blit(status_surface, (10, wave_y_start + 5))
        
        # Mostrar nivel máximo actual
        max_level_text = f"Max: {self.max_audio_level:.2f}"
        max_surface = font.render(max_level_text, True, (200, 200, 200))
        self.screen.blit(max_surface, (self.width - 100, wave_y_start + 5))
    
    def draw_debug_panel(self):
        """Dibuja el panel de debug con información de reconocimiento."""
        # Panel de debug en la esquina superior derecha
        panel_width = 300
        panel_height = 180
        panel_x = self.width - panel_width - 10
        panel_y = 10
        
        # Fondo del panel
        panel_rect = pygame.Rect(panel_x, panel_y, panel_width, panel_height)
        pygame.draw.rect(self.screen, (40, 40, 50), panel_rect)
        pygame.draw.rect(self.screen, (100, 100, 120), panel_rect, 2)
        
        # Fuentes
        title_font = pygame.font.Font(None, 20)
        debug_font = pygame.font.Font(None, 16)
        
        # Título del panel
        title_surface = title_font.render("🔍 DEBUG - RECONOCIMIENTO", True, (255, 255, 100))
        self.screen.blit(title_surface, (panel_x + 5, panel_y + 5))
        
        # Último texto reconocido
        y_offset = 30
        if self.last_recognized_text:
            text_lines = [
                f"Último: '{self.last_recognized_text}'",
                f"Método: {self.recognition_method}"
            ]
            for line in text_lines:
                if len(line) > 35:  # Truncar líneas largas
                    line = line[:32] + "..."
                surface = debug_font.render(line, True, (200, 255, 200))
                self.screen.blit(surface, (panel_x + 5, panel_y + y_offset))
                y_offset += 18
        
        # Estado de motores
        y_offset += 10
        sphinx_status = "✅ Sphinx" if self.sphinx_available else "❌ Sphinx"
        status_surface = debug_font.render(sphinx_status, True, (150, 150, 255))
        self.screen.blit(status_surface, (panel_x + 5, panel_y + y_offset))
        
        google_surface = debug_font.render("✅ Google (Online)", True, (150, 150, 255))
        self.screen.blit(google_surface, (panel_x + 120, panel_y + y_offset))
        
        # Mensajes de debug recientes
        y_offset += 25
        debug_title = debug_font.render("Mensajes recientes:", True, (255, 255, 255))
        self.screen.blit(debug_title, (panel_x + 5, panel_y + y_offset))
        y_offset += 18
        
        for message in self.debug_messages[-3:]:  # Mostrar solo los últimos 3
            if len(message) > 40:
                message = message[:37] + "..."
            surface = debug_font.render(message, True, (180, 180, 180))
            self.screen.blit(surface, (panel_x + 5, panel_y + y_offset))
            y_offset += 16
    
    def draw_ui(self):
        """Dibuja la interfaz de usuario."""
        font = pygame.font.Font(None, 24)
        small_font = pygame.font.Font(None, 18)
        
        # Estado de escucha
        listen_text = "🎤 ESCUCHANDO" if self.is_listening else "⏸️ PAUSADO (ESPACIO para escuchar)"
        listen_color = (0, 255, 0) if self.is_listening else (255, 255, 0)
        text_surface = font.render(listen_text, True, listen_color)
        self.screen.blit(text_surface, (10, 10))
        
        # Mensaje de estado
        status_surface = font.render(self.status_message, True, (255, 255, 255))
        self.screen.blit(status_surface, (10, 40))
        
        # Información actual
        info_lines = [
            f"Color: {[k for k, v in self.colors.items() if v == self.current_color][0] if self.current_color in self.colors.values() else 'Personalizado'}",
            f"Forma: {self.shape}",
            f"Tamaño: {self.size}",
            f"Posición: ({int(self.position[0])}, {int(self.position[1])})",
            f"Rotando: {'Sí' if self.is_rotating else 'No'}",
            f"Moviendo: {'Sí' if self.is_moving else 'No'}"
        ]
        
        for i, line in enumerate(info_lines):
            text_surface = small_font.render(line, True, (200, 200, 200))
            self.screen.blit(text_surface, (10, 80 + i * 20))
        
        # Controles (ajustar posición para hacer espacio a la barra de audio)
        controls = [
            "CONTROLES:",
            "ESPACIO - Activar/Desactivar escucha",
            "ESC - Salir",
            "",
            "COMANDOS DE VOZ:",
            "Colores: rojo, azul, verde, amarillo, etc.",
            "Formas: círculo, cuadrado, triángulo",
            "Acciones: girar, mover, detener, iniciar",
            "Tamaños: grande, pequeño, normal",
            "Otros: centro, limpiar, ayuda"
        ]
        
        # Calcular posición y límite para no sobreponer con la barra de audio
        max_y = self.height - 100  # Dejar espacio para la barra de audio
        start_y = 220
        
        for i, line in enumerate(controls):
            y_pos = start_y + i * 18
            if y_pos < max_y:  # Solo dibujar si no se sobrepone con la barra de audio
                color = (255, 255, 0) if i == 0 or i == 4 else (180, 180, 180)
                text_surface = small_font.render(line, True, color)
                self.screen.blit(text_surface, (10, y_pos))
    
    def cleanup_audio(self):
        """Limpia recursos de audio."""
        try:
            if self.audio_stream:
                self.audio_stream.stop_stream()
                self.audio_stream.close()
            if self.pyaudio_instance:
                self.pyaudio_instance.terminate()
        except Exception as e:
            self.add_debug_message(f"Error limpiando audio: {e}")
    
    def run(self):
        """Ejecuta el bucle principal del visualizador."""
        # Iniciar thread de reconocimiento de voz
        self.voice_thread = threading.Thread(target=self.listen_for_commands, daemon=True)
        self.voice_thread.start()
        
        # Saludo inicial
        self.speak("Visualizador de voz iniciado. Presiona espacio para comenzar a escuchar comandos.")
        
        running = True
        while running:
            # Manejar eventos
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        running = False
                    elif event.key == pygame.K_SPACE:
                        self.is_listening = not self.is_listening
                        if self.is_listening:
                            self.speak("Escucha activada")
                            self.status_message = "🎤 Listo para escuchar comandos"
                            self.add_debug_message("🎤 Escucha ACTIVADA")
                        else:
                            self.speak("Escucha desactivada")
                            self.status_message = "⏸️ Escucha pausada"
                            self.add_debug_message("⏸️ Escucha PAUSADA")
            
            # Actualizar estado
            self.update()
            
            # Dibujar
            self.screen.fill(self.background_color)
            self.draw_shape()
            self.draw_ui()
            self.draw_audio_wave()  # Visualización de audio
            self.draw_debug_panel()  # Panel de debug
            
            pygame.display.flip()
            self.clock.tick(60)
        
        # Limpiar
        self.running = False
        self.cleanup_audio()
        pygame.quit()
        sys.exit()

def main():
    """Función principal."""
    print("=== Voice Visualizer - Taller de Reconocimiento de Voz Local ===")
    print("Inicializando...")
    
    try:
        visualizer = VoiceVisualizer()
        visualizer.run()
    except KeyboardInterrupt:
        print("\nSaliendo...")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 