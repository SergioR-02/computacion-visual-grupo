"""
Generación de pares de imágenes sintéticas de un patrón de ajedrez para calibración estéreo
Este script genera pares de imágenes que simulan vistas desde dos cámaras separadas
"""

import numpy as np
import cv2
import os
import os.path
import sys
import random
import math

def generar_imagenes_calibracion_estereo(patron_path, num_pares=15, 
                                        directorio_izquierda="../imagenes/calibracion_estereo/izquierda",
                                        directorio_derecha="../imagenes/calibracion_estereo/derecha"):
    """
    Genera pares de imágenes sintéticas para calibración estéreo.
    
    Args:
        patron_path: Ruta a la imagen del patrón de ajedrez
        num_pares: Número de pares de imágenes a generar
        directorio_izquierda: Directorio para imágenes de la cámara izquierda
        directorio_derecha: Directorio para imágenes de la cámara derecha
    """
    # Crear los directorios de salida si no existen
    os.makedirs(directorio_izquierda, exist_ok=True)
    os.makedirs(directorio_derecha, exist_ok=True)
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
    
    # Separación estéreo (desplazamiento horizontal) como % de la anchura
    separacion_estereo_base = 0.05  # 5% de la anchura
    
    # Generar los pares de imágenes con diferentes perspectivas
    for i in range(num_pares):
        # Variar la separación estéreo ligeramente para cada par
        separacion_estereo = separacion_estereo_base * random.uniform(0.8, 1.2)
        desplazamiento_pixels = int(anchura * separacion_estereo)
        
        # Parámetros de transformación aleatorios para esta vista
        angulo_base = random.uniform(-25, 25)  # Grados
        escala_base = random.uniform(0.7, 1.3)
        
        # Simular diferentes posiciones del patrón en el espacio
        # Inclinación en X e Y
        inclinacion_x = random.uniform(-20, 20)
        inclinacion_y = random.uniform(-20, 20)
        
        # Desplazamiento Z (profundidad)
        prof_factor = random.uniform(0.8, 1.2)
        
        # Generar transformación para la vista izquierda
        # Simulamos una transformación 3D proyectada en 2D
        # Más compleja para simular mejor los efectos de perspectiva
        esc_x = escala_base * prof_factor
        esc_y = escala_base * prof_factor
        
        # Perspectiva para la vista izquierda
        esquinas_izquierda = np.float32([
            [anchura * 0.1 + inclinacion_x, altura * 0.1 + inclinacion_y],
            [anchura * 0.9 - inclinacion_x, altura * 0.1 + inclinacion_y],
            [anchura * 0.9 - inclinacion_x, altura * 0.9 - inclinacion_y],
            [anchura * 0.1 + inclinacion_x, altura * 0.9 - inclinacion_y]
        ])
        
        M_izquierda = cv2.getPerspectiveTransform(esquinas_patron, esquinas_izquierda)
        imagen_izquierda = cv2.warpPerspective(patron, M_izquierda, (anchura, altura))
        
        # Ajustar perspectiva para la vista derecha (simular desplazamiento horizontal)
        # Para un par estéreo, la vista derecha está desplazada horizontalmente
        esquinas_derecha = np.float32([
            [anchura * 0.1 + inclinacion_x - desplazamiento_pixels, altura * 0.1 + inclinacion_y],
            [anchura * 0.9 - inclinacion_x - desplazamiento_pixels, altura * 0.1 + inclinacion_y],
            [anchura * 0.9 - inclinacion_x - desplazamiento_pixels, altura * 0.9 - inclinacion_y],
            [anchura * 0.1 + inclinacion_x - desplazamiento_pixels, altura * 0.9 - inclinacion_y]
        ])
        
        M_derecha = cv2.getPerspectiveTransform(esquinas_patron, esquinas_derecha)
        imagen_derecha = cv2.warpPerspective(patron, M_derecha, (anchura, altura))
        
        # Añadir un poco de ruido gaussiano diferente a cada imagen
        ruido_izquierda = np.zeros(imagen_izquierda.shape, np.uint8)
        ruido_derecha = np.zeros(imagen_derecha.shape, np.uint8)
        cv2.randn(ruido_izquierda, 0, 5)
        cv2.randn(ruido_derecha, 0, 5)
        
        imagen_izquierda = cv2.add(imagen_izquierda, ruido_izquierda)
        imagen_derecha = cv2.add(imagen_derecha, ruido_derecha)
        
        # Guardar las imágenes
        ruta_izquierda = os.path.join(directorio_izquierda, f"left_{i+1:02d}.jpg")
        ruta_derecha = os.path.join(directorio_derecha, f"right_{i+1:02d}.jpg")
        
        cv2.imwrite(ruta_izquierda, imagen_izquierda)
        cv2.imwrite(ruta_derecha, imagen_derecha)
        
        print(f"Par estéreo guardado: {ruta_izquierda} y {ruta_derecha}")
    
    print(f"Se generaron {num_pares} pares de imágenes para calibración estéreo")
    print(f"Imágenes izquierdas en: {directorio_izquierda}")
    print(f"Imágenes derechas en: {directorio_derecha}")

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
    
    # Generar pares de imágenes para calibración estéreo
    directorio_izquierda = os.path.join(directorio_actual, "..", "imagenes", "calibracion_estereo", "izquierda")
    directorio_derecha = os.path.join(directorio_actual, "..", "imagenes", "calibracion_estereo", "derecha")
    
    generar_imagenes_calibracion_estereo(
        patron_path, 
        num_pares=15, 
        directorio_izquierda=directorio_izquierda, 
        directorio_derecha=directorio_derecha
    )
