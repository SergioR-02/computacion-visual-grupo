"""
Generación de imágenes sintéticas de un patrón de ajedrez para calibración de cámaras
Este script genera imágenes del patrón desde diferentes ángulos y distancias
"""

import numpy as np
import cv2
import os
import os.path
import sys
import random
import math

def generar_imagenes_calibracion_una_camara(patron_path, num_imagenes=15, directorio_salida="../imagenes/calibracion_una_camara"):
    """
    Genera imágenes sintéticas de un patrón de ajedrez desde diferentes ángulos.
    
    Args:
        patron_path: Ruta a la imagen del patrón de ajedrez
        num_imagenes: Número de imágenes a generar
        directorio_salida: Directorio donde se guardarán las imágenes
    """
    # Crear el directorio de salida si no existe
    os.makedirs(directorio_salida, exist_ok=True)
      # Verificar que la ruta sea absoluta
    if not os.path.isabs(patron_path):
        # Obtener la ruta absoluta del directorio actual
        directorio_actual = os.path.dirname(os.path.abspath(__file__))
        patron_path = os.path.join(directorio_actual, patron_path)
    
    # Cargar la imagen del patrón
    patron = cv2.imread(patron_path)
    if patron is None:
        raise ValueError(f"No se pudo cargar la imagen del patrón: {patron_path}")
    
    altura, anchura = patron.shape[:2]
    
    # Definir los puntos de las esquinas del patrón en coordenadas homogéneas
    esquinas_patron = np.float32([
        [0, 0],
        [anchura - 1, 0],
        [anchura - 1, altura - 1],
        [0, altura - 1]
    ])
    
    # Generar las imágenes con diferentes transformaciones de perspectiva
    for i in range(num_imagenes):
        # Generar transformación aleatoria para simular diferentes vistas
        # Añadir perturbaciones aleatorias a las esquinas
        perturbacion_max = 0.2  # Factor de perturbación máxima como porcentaje del tamaño
        
        # Calcular la perturbación para cada esquina
        delta_x = anchura * perturbacion_max
        delta_y = altura * perturbacion_max
        
        # Diferentes tipos de transformaciones para tener variedad
        if i % 5 == 0:  # Rotación cerca del centro 
            angulo = random.uniform(-30, 30)  # Grados
            escala = random.uniform(0.8, 1.2)
            centro = (anchura // 2, altura // 2)
            M = cv2.getRotationMatrix2D(centro, angulo, escala)
            imagen_transformada = cv2.warpAffine(patron, M, (anchura, altura))
            
        elif i % 5 == 1:  # Perspectiva moderada
            esquinas_destino = np.float32([
                [random.uniform(0, delta_x), random.uniform(0, delta_y)],
                [anchura - 1 - random.uniform(0, delta_x), random.uniform(0, delta_y)],
                [anchura - 1 - random.uniform(0, delta_x), altura - 1 - random.uniform(0, delta_y)],
                [random.uniform(0, delta_x), altura - 1 - random.uniform(0, delta_y)]
            ])
            M = cv2.getPerspectiveTransform(esquinas_patron, esquinas_destino)
            imagen_transformada = cv2.warpPerspective(patron, M, (anchura, altura))
            
        elif i % 5 == 2:  # Vista desde arriba con ligera inclinación
            # Perspectiva simulando vista desde arriba
            esquinas_destino = np.float32([
                [anchura * 0.1, altura * 0.1],
                [anchura * 0.9, altura * 0.1],
                [anchura * 0.95, altura * 0.95],
                [anchura * 0.05, altura * 0.95]
            ])
            M = cv2.getPerspectiveTransform(esquinas_patron, esquinas_destino)
            imagen_transformada = cv2.warpPerspective(patron, M, (anchura, altura))
            
        elif i % 5 == 3:  # Vista lateral
            # Perspectiva simulando vista desde un lado
            esquinas_destino = np.float32([
                [anchura * 0.2, altura * 0.3],
                [anchura * 0.8, altura * 0.2],
                [anchura * 0.85, altura * 0.9],
                [anchura * 0.15, altura * 0.95]
            ])
            M = cv2.getPerspectiveTransform(esquinas_patron, esquinas_destino)
            imagen_transformada = cv2.warpPerspective(patron, M, (anchura, altura))
            
        else:  # Vista desde abajo
            # Perspectiva simulando vista desde abajo
            esquinas_destino = np.float32([
                [anchura * 0.05, altura * 0.25],
                [anchura * 0.95, altura * 0.25],
                [anchura * 0.8, altura * 0.05],
                [anchura * 0.2, altura * 0.05]
            ])
            M = cv2.getPerspectiveTransform(esquinas_patron, esquinas_destino)
            imagen_transformada = cv2.warpPerspective(patron, M, (anchura, altura))
        
        # Añadir un poco de ruido gaussiano para simular imágenes reales
        ruido = np.zeros(imagen_transformada.shape, np.uint8)
        cv2.randn(ruido, 0, 10)  # Media 0, desviación estándar 10
        imagen_transformada = cv2.add(imagen_transformada, ruido)
        
        # Guardar la imagen transformada
        ruta_salida = os.path.join(directorio_salida, f"calibracion_{i+1:02d}.jpg")
        cv2.imwrite(ruta_salida, imagen_transformada)
        print(f"Imagen guardada: {ruta_salida}")
    
    print(f"Se generaron {num_imagenes} imágenes para calibración de una cámara en {directorio_salida}")

if __name__ == "__main__":
    # Obtener la ruta absoluta del directorio actual
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    
    # Ruta al patrón de ajedrez generado anteriormente
    patron_path = os.path.join(directorio_actual, "..", "imagenes", "patron_ajedrez.jpg")
    
    # Verificar que existe el patrón
    if not os.path.exists(patron_path):
        print(f"No se encontró el patrón en {patron_path}")
        print("Por favor, ejecute primero 'generar_patron.py'")
        sys.exit(1)
    
    # Generar imágenes para calibración de una cámara
    directorio_salida = os.path.join(directorio_actual, "..", "imagenes", "calibracion_una_camara")
    generar_imagenes_calibracion_una_camara(patron_path, num_imagenes=15, directorio_salida=directorio_salida)
