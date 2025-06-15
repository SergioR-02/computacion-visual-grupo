#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🧪 Taller - Obras Interactivas: Pintando con Voz y Gestos
Autor: Taller de Computación Visual
Descripción: Aplicación que permite pintar usando gestos de mano y comandos de voz
"""

import cv2
import mediapipe as mp
import numpy as np
import speech_recognition as sr
import threading
import time
import os
from datetime import datetime
import pyttsx3

class PinturaInteractiva:
    def __init__(self):
        """Inicializar la aplicación de pintura interactiva"""
        
        # Configuración de MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Configuración de la cámara
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # Canvas para dibujar
        self.canvas = None
        self.canvas_width = 1280
        self.canvas_height = 720
        
        # Estado del pincel
        self.color_actual = (0, 255, 0)  # Verde por defecto
        self.grosor_pincel = 5
        self.modo_dibujo = True
        self.posicion_anterior = None
        self.tipo_pincel = "circular"
        
        # Colores disponibles
        self.colores = {
            "rojo": (0, 0, 255),
            "verde": (0, 255, 0),
            "azul": (255, 0, 0),
            "amarillo": (0, 255, 255),
            "morado": (255, 0, 255),
            "cian": (255, 255, 0),
            "blanco": (255, 255, 255),
            "negro": (0, 0, 0)
        }
        
        # Configuración de reconocimiento de voz
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.escuchando_voz = False
        self.ultimo_comando = ""
        self.tiempo_ultimo_comando = 0
        
        # TTS para retroalimentación
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)
        
        # Estados de gestos
        self.detector_gestos_activo = True
        self.gesto_anterior = None
        
        # Inicializar canvas
        self.reiniciar_canvas()
        
        print("🎨 ¡Taller de Pintura Interactiva iniciado!")
        print("📝 Comandos de voz disponibles:")
        print("   - Colores: rojo, verde, azul, amarillo, morado, cian, blanco, negro")
        print("   - Acciones: limpiar, guardar, pincel, borrador")
        print("   - Control: activar, desactivar")
        print("✋ Gestos disponibles:")
        print("   - Dedo índice: Dibujar")
        print("   - Palma abierta: Cambiar tipo de pincel")
        print("   - Puño cerrado: Borrador")
        
    def reiniciar_canvas(self):
        """Reiniciar el canvas de dibujo"""
        self.canvas = np.ones((self.canvas_height, self.canvas_width, 3), dtype=np.uint8) * 255
        
    def hablar(self, texto):
        """Función para que la aplicación hable"""
        def speak_async():
            try:
                self.tts_engine.say(texto)
                self.tts_engine.runAndWait()
            except:
                pass
        
        thread = threading.Thread(target=speak_async)
        thread.daemon = True
        thread.start()
    
    def procesar_comando_voz(self, comando):
        """Procesar comandos de voz reconocidos"""
        comando = comando.lower().strip()
        self.ultimo_comando = comando
        self.tiempo_ultimo_comando = time.time()
        
        print(f"🎤 Comando reconocido: {comando}")
        
        # Cambiar colores
        if comando in self.colores:
            self.color_actual = self.colores[comando]
            self.hablar(f"Color cambiado a {comando}")
            return
            
        # Acciones especiales
        if "limpiar" in comando or "borrar todo" in comando:
            self.reiniciar_canvas()
            self.hablar("Canvas limpiado")
            return
            
        if "guardar" in comando:
            self.guardar_obra()
            return
            
        if "pincel" in comando:
            self.modo_dibujo = True
            self.hablar("Modo pincel activado")
            return
            
        if "borrador" in comando:
            self.modo_dibujo = False
            self.hablar("Modo borrador activado")
            return
            
        if "activar" in comando:
            self.detector_gestos_activo = True
            self.hablar("Detección de gestos activada")
            return
            
        if "desactivar" in comando:
            self.detector_gestos_activo = False
            self.hablar("Detección de gestos desactivada")
            return
    
    def escuchar_comandos_voz(self):
        """Función para escuchar comandos de voz en un hilo separado"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
            
        while self.escuchando_voz:
            try:
                with self.microphone as source:
                    # Escuchar por un tiempo corto para no bloquear
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=3)
                    
                try:
                    # Reconocer el comando en español
                    comando = self.recognizer.recognize_google(audio, language="es-ES")
                    self.procesar_comando_voz(comando)
                except sr.UnknownValueError:
                    pass  # No se pudo entender el audio
                except sr.RequestError:
                    print("❌ Error en el servicio de reconocimiento de voz")
                    
            except sr.WaitTimeoutError:
                pass  # Timeout normal, continuar
            except Exception as e:
                print(f"❌ Error en reconocimiento de voz: {e}")
                time.sleep(0.1)
    
    def detectar_gestos(self, landmarks, hand_landmarks):
        """Detectar diferentes tipos de gestos"""
        # Obtener coordenadas de puntos clave
        puntos = []
        for lm in hand_landmarks.landmark:
            puntos.append([lm.x, lm.y])
        
        # Convertir a numpy array
        puntos = np.array(puntos)
        
        # Detectar gesto de dedo índice extendido (para dibujar)
        indice_tip = puntos[8]
        indice_pip = puntos[6]
        medio_tip = puntos[12]
        anular_tip = puntos[16]
        meñique_tip = puntos[20]
        
        # Calcular si los dedos están extendidos
        indice_extendido = indice_tip[1] < indice_pip[1]
        medio_extendido = medio_tip[1] < puntos[10][1]
        anular_extendido = anular_tip[1] < puntos[14][1]
        meñique_extendido = meñique_tip[1] < puntos[18][1]
        
        # Detectar diferentes gestos
        if indice_extendido and not medio_extendido and not anular_extendido and not meñique_extendido:
            return "dedo_indice", indice_tip
        elif indice_extendido and medio_extendido and anular_extendido and meñique_extendido:
            return "palma_abierta", puntos[9]  # Centro de la palma
        elif not indice_extendido and not medio_extendido and not anular_extendido and not meñique_extendido:
            return "puño_cerrado", puntos[9]
        else:
            return "otro", indice_tip
    
    def dibujar_en_canvas(self, x, y, gesto):
        """Dibujar en el canvas según la posición y el gesto"""
        if not self.detector_gestos_activo:
            return
            
        # Convertir coordenadas normalizadas a píxeles
        px = int(x * self.canvas_width)
        py = int(y * self.canvas_height)
        
        if gesto == "dedo_indice":
            if self.posicion_anterior is not None:
                if self.modo_dibujo:
                    # Dibujar línea
                    if self.tipo_pincel == "circular":
                        cv2.line(self.canvas, self.posicion_anterior, (px, py), self.color_actual, self.grosor_pincel)
                    elif self.tipo_pincel == "cuadrado":
                        cv2.rectangle(self.canvas, 
                                    (px-self.grosor_pincel, py-self.grosor_pincel),
                                    (px+self.grosor_pincel, py+self.grosor_pincel),
                                    self.color_actual, -1)
                    elif self.tipo_pincel == "estrella":
                        # Dibujar una estrella simple
                        puntos_estrella = np.array([
                            [px, py-self.grosor_pincel*2],
                            [px+self.grosor_pincel, py],
                            [px+self.grosor_pincel*2, py],
                            [px+self.grosor_pincel//2, py+self.grosor_pincel],
                            [px+self.grosor_pincel*2, py+self.grosor_pincel*2],
                            [px, py+self.grosor_pincel],
                            [px-self.grosor_pincel*2, py+self.grosor_pincel*2],
                            [px-self.grosor_pincel//2, py+self.grosor_pincel],
                            [px-self.grosor_pincel*2, py],
                            [px-self.grosor_pincel, py]
                        ])
                        cv2.fillPoly(self.canvas, [puntos_estrella], self.color_actual)
                else:
                    # Modo borrador
                    cv2.circle(self.canvas, (px, py), self.grosor_pincel*2, (255, 255, 255), -1)
            
            self.posicion_anterior = (px, py)
            
        elif gesto == "palma_abierta":
            # Cambiar tipo de pincel
            if self.gesto_anterior != "palma_abierta":
                tipos = ["circular", "cuadrado", "estrella"]
                indice_actual = tipos.index(self.tipo_pincel) if self.tipo_pincel in tipos else 0
                self.tipo_pincel = tipos[(indice_actual + 1) % len(tipos)]
                self.hablar(f"Pincel cambiado a {self.tipo_pincel}")
            self.posicion_anterior = None
            
        elif gesto == "puño_cerrado":
            # Modo borrador temporal
            if self.posicion_anterior is not None:
                cv2.circle(self.canvas, (px, py), self.grosor_pincel*3, (255, 255, 255), -1)
            self.posicion_anterior = (px, py)
        else:
            self.posicion_anterior = None
        
        self.gesto_anterior = gesto
    
    def guardar_obra(self):
        """Guardar la obra actual"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        directorio_obras = "../obras"
        if not os.path.exists(directorio_obras):
            os.makedirs(directorio_obras)
            
        nombre_archivo = f"{directorio_obras}/obra_interactiva_{timestamp}.png"
        cv2.imwrite(nombre_archivo, self.canvas)
        print(f"💾 Obra guardada como: {nombre_archivo}")
        self.hablar("Obra guardada exitosamente")
    
    def dibujar_interfaz(self, frame):
        """Dibujar la interfaz de usuario en el frame"""
        altura, ancho = frame.shape[:2]
        
        # Panel de información
        cv2.rectangle(frame, (10, 10), (500, 150), (0, 0, 0), -1)
        cv2.rectangle(frame, (10, 10), (500, 150), (255, 255, 255), 2)
        
        # Información del estado actual
        y_pos = 35
        cv2.putText(frame, f"Color: {list(self.colores.keys())[list(self.colores.values()).index(self.color_actual)] if self.color_actual in self.colores.values() else 'Personalizado'}", 
                   (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        y_pos += 25
        cv2.putText(frame, f"Pincel: {self.tipo_pincel} (Grosor: {self.grosor_pincel})", 
                   (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        y_pos += 25
        cv2.putText(frame, f"Modo: {'Dibujo' if self.modo_dibujo else 'Borrador'}", 
                   (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        y_pos += 25
        cv2.putText(frame, f"Deteccion: {'ON' if self.detector_gestos_activo else 'OFF'}", 
                   (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Mostrar último comando de voz
        if self.ultimo_comando and (time.time() - self.tiempo_ultimo_comando) < 3:
            cv2.rectangle(frame, (10, altura-60), (400, altura-10), (0, 100, 0), -1)
            cv2.putText(frame, f"Comando: {self.ultimo_comando}", 
                       (20, altura-30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Muestra de color actual
        cv2.rectangle(frame, (ancho-100, 10), (ancho-10, 60), self.color_actual, -1)
        cv2.rectangle(frame, (ancho-100, 10), (ancho-10, 60), (255, 255, 255), 2)
        
        # Instrucciones
        instrucciones = [
            "CONTROLES:",
            "ESC: Salir",
            "S: Guardar obra",
            "C: Limpiar canvas",
            "ESPACIO: Activar/Desactivar voz"
        ]
        
        for i, instruccion in enumerate(instrucciones):
            cv2.putText(frame, instruccion, (ancho-300, 100 + i*25), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    def ejecutar(self):
        """Función principal para ejecutar la aplicación"""
        print("🚀 Iniciando aplicación...")
        
        # Iniciar el hilo de reconocimiento de voz
        self.escuchando_voz = True
        hilo_voz = threading.Thread(target=self.escuchar_comandos_voz)
        hilo_voz.daemon = True
        hilo_voz.start()
        
        self.hablar("¡Aplicación de pintura interactiva iniciada!")
        
        try:
            while True:
                success, frame = self.cap.read()
                if not success:
                    print("❌ Error al capturar frame de la cámara")
                    break
                
                # Voltear horizontalmente para efecto espejo
                frame = cv2.flip(frame, 1)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Procesar gestos de mano
                results = self.hands.process(frame_rgb)
                
                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        # Dibujar landmarks de la mano
                        self.mp_drawing.draw_landmarks(
                            frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                        
                        # Detectar gestos y dibujar
                        gesto, posicion = self.detectar_gestos(frame, hand_landmarks)
                        self.dibujar_en_canvas(posicion[0], posicion[1], gesto)
                        
                        # Mostrar el gesto detectado
                        cv2.putText(frame, f"Gesto: {gesto}", (10, frame.shape[0]-20), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                # Dibujar interfaz
                self.dibujar_interfaz(frame)
                
                # Mostrar frames
                cv2.imshow('🎨 Pintura Interactiva - Camara', frame)
                cv2.imshow('🖼️ Pintura Interactiva - Canvas', self.canvas)
                
                # Procesar teclas
                key = cv2.waitKey(1) & 0xFF
                if key == 27:  # ESC para salir
                    break
                elif key == ord('s'):  # Guardar obra
                    self.guardar_obra()
                elif key == ord('c'):  # Limpiar canvas
                    self.reiniciar_canvas()
                    self.hablar("Canvas limpiado")
                elif key == ord(' '):  # Activar/desactivar reconocimiento de voz
                    self.detector_gestos_activo = not self.detector_gestos_activo
                    estado = "activado" if self.detector_gestos_activo else "desactivado"
                    self.hablar(f"Reconocimiento de gestos {estado}")
                elif key == ord('1'):  # Cambiar grosor del pincel
                    self.grosor_pincel = max(1, self.grosor_pincel - 1)
                elif key == ord('2'):
                    self.grosor_pincel = min(20, self.grosor_pincel + 1)
                    
        except KeyboardInterrupt:
            print("\n🛑 Aplicación interrumpida por el usuario")
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Limpiar recursos"""
        print("🧹 Limpiando recursos...")
        self.escuchando_voz = False
        self.cap.release()
        cv2.destroyAllWindows()
        print("✅ Aplicación finalizada correctamente")

def main():
    """Función principal"""
    print("=" * 60)
    print("🧪 TALLER - OBRAS INTERACTIVAS")
    print("🎨 Pintando con Voz y Gestos")
    print("=" * 60)
    
    try:
        app = PinturaInteractiva()
        app.ejecutar()
    except Exception as e:
        print(f"❌ Error al inicializar la aplicación: {e}")
        print("💡 Asegúrate de tener una cámara conectada y micrófono disponible")
        print("💡 Instala las dependencias con: pip install -r requirements.txt")

if __name__ == "__main__":
    main()
