"""
Generación de un patrón de tablero de ajedrez para calibración de cámaras
"""

import numpy as np
import cv2
import matplotlib.pyplot as plt
import os
import os.path

def generar_patron_ajedrez(filas, columnas, tamano_cuadro=50, guardar=True, nombre_archivo='patron_ajedrez.jpg'):
    """
    Genera un patrón de tablero de ajedrez para calibración de cámaras.
    
    Args:
        filas: Número de filas en el tablero
        columnas: Número de columnas en el tablero
        tamano_cuadro: Tamaño de cada cuadro en píxeles
        guardar: Si es True, guarda el patrón como imagen
        nombre_archivo: Nombre del archivo de salida
    
    Returns:
        patron: Imagen del patrón de tablero de ajedrez
    """
    # Calcular dimensiones de la imagen
    ancho = columnas * tamano_cuadro
    alto = filas * tamano_cuadro
    
    # Crear imagen base blanca
    patron = np.ones((alto, ancho), dtype=np.uint8) * 255
    
    # Dibujar cuadros negros en posiciones pares/impares
    for i in range(filas):
        for j in range(columnas):
            if (i + j) % 2 == 0:
                y_inicio = i * tamano_cuadro
                x_inicio = j * tamano_cuadro
                patron[y_inicio:y_inicio+tamano_cuadro, x_inicio:x_inicio+tamano_cuadro] = 0
    
    # Añadir borde blanco para impresión
    borde = 50
    patron_con_borde = np.ones((alto + 2*borde, ancho + 2*borde), dtype=np.uint8) * 255
    patron_con_borde[borde:alto+borde, borde:ancho+borde] = patron
      # Guardar patrón
    if guardar:
        # Obtener la ruta absoluta del directorio actual
        directorio_actual = os.path.dirname(os.path.abspath(__file__))
        directorio_imagenes = os.path.join(directorio_actual, "..", "imagenes")
        os.makedirs(directorio_imagenes, exist_ok=True)
        ruta_completa = os.path.join(directorio_imagenes, nombre_archivo)
        cv2.imwrite(ruta_completa, patron_con_borde)
        print(f"Patrón guardado como {ruta_completa}")
    
    return patron_con_borde

def visualizar_patron(patron):
    """
    Visualiza el patrón generado.
    
    Args:
        patron: Imagen del patrón de tablero de ajedrez
    """
    plt.figure(figsize=(10, 10))
    plt.imshow(patron, cmap='gray')
    plt.title('Patrón de tablero de ajedrez para calibración')
    plt.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    # Generar patrón con 7x10 cuadros (para obtener 6x9 esquinas internas)
    filas = 7
    columnas = 10
    tamano_cuadro = 80  # En píxeles
    
    # Generar y mostrar patrón
    patron = generar_patron_ajedrez(filas, columnas, tamano_cuadro, guardar=True)
    visualizar_patron(patron)
    
    print(f"Patrón generado con {filas} filas y {columnas} columnas")
    print(f"Este patrón tiene {filas-1}x{columnas-1} esquinas internas para calibración")
