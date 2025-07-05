"""
Visualización de resultados de calibración y preparación de imágenes para el README
"""

import numpy as np
import cv2
import matplotlib.pyplot as plt
import os

def visualizar_resultados_una_camara(directorio_resultados='../../resultados_una_camara'):
    """
    Visualiza y prepara imágenes de resultados de calibración de una cámara para el README.
    
    Args:
        directorio_resultados: Directorio donde están los resultados de calibración
    """
    print("Visualizando resultados de calibración de una cámara...")
    
    # Verificar que existan los archivos de resultados
    if not os.path.exists(os.path.join(directorio_resultados, 'parametros_calibracion.npz')):
        print(f"No se encontraron resultados en {directorio_resultados}")
        return
    
    # Cargar parámetros de calibración
    data = np.load(os.path.join(directorio_resultados, 'parametros_calibracion.npz'))
    mtx = data['camera_matrix']
    dist = data['dist_coeffs']
    
    print("\nMatriz de cámara:")
    print(mtx)
    print("\nCoeficientes de distorsión:")
    print(dist)
    
    # Buscar imágenes de resultados
    patron_esquinas = None
    patron_reproyeccion = None
    comparacion_distorsion = None
    
    for archivo in os.listdir(directorio_resultados):
        if archivo.endswith('_esquinas.jpg'):
            patron_esquinas = cv2.imread(os.path.join(directorio_resultados, archivo))
        elif archivo.endswith('_reproyeccion.jpg'):
            patron_reproyeccion = cv2.imread(os.path.join(directorio_resultados, archivo))
        elif archivo == 'comparacion_distorsion.jpg':
            comparacion_distorsion = cv2.imread(os.path.join(directorio_resultados, archivo))
    
    # Mostrar imágenes si existen
    if patron_esquinas is not None or patron_reproyeccion is not None:
        plt.figure(figsize=(12, 6))
        
        if patron_esquinas is not None:
            plt.subplot(1, 2, 1)
            plt.imshow(cv2.cvtColor(patron_esquinas, cv2.COLOR_BGR2RGB))
            plt.title("Detección de Esquinas")
            plt.axis('off')
        
        if patron_reproyeccion is not None:
            plt.subplot(1, 2, 2)
            plt.imshow(cv2.cvtColor(patron_reproyeccion, cv2.COLOR_BGR2RGB))
            plt.title("Corrección de Distorsión")
            plt.axis('off')
        
        plt.tight_layout()
        plt.savefig(os.path.join(directorio_resultados, 'resultados_una_camara_para_readme.jpg'))
        plt.show()
    
    # Mostrar comparación de distorsión si existe
    if comparacion_distorsion is not None:
        plt.figure(figsize=(10, 5))
        plt.imshow(cv2.cvtColor(comparacion_distorsion, cv2.COLOR_BGR2RGB))
        plt.title("Comparación: Original vs Corregida")
        plt.axis('off')
        plt.tight_layout()
        plt.show()
    
    print(f"Imágenes para el README guardadas en {directorio_resultados}")

def visualizar_resultados_estereo(directorio_resultados='../../resultados_dos_camaras'):
    """
    Visualiza y prepara imágenes de resultados de calibración estéreo para el README.
    
    Args:
        directorio_resultados: Directorio donde están los resultados de calibración estéreo
    """
    print("Visualizando resultados de calibración estéreo...")
    
    # Verificar que existan los archivos de resultados
    if not os.path.exists(os.path.join(directorio_resultados, 'parametros_calibracion_estereo.npz')):
        print(f"No se encontraron resultados en {directorio_resultados}")
        return
    
    # Cargar parámetros de calibración
    data = np.load(os.path.join(directorio_resultados, 'parametros_calibracion_estereo.npz'))
    R = data['R']  # Matriz de rotación
    T = data['T']  # Vector de traslación
    
    print("\nMatriz de rotación entre cámaras:")
    print(R)
    print("\nVector de traslación entre cámaras:")
    print(T)
    
    # Buscar imágenes de resultados
    imagenes_para_mostrar = {
        'original_combinado.jpg': "Imágenes Originales",
        'rectificado_combinado.jpg': "Imágenes Rectificadas",
        'rectificado_lineas_combinado.jpg': "Rectificación con Líneas Epipolares",
        'comparacion_rectificacion.jpg': "Comparación de Rectificación"
    }
    
    # Crear composición para README
    plt.figure(figsize=(15, 10))
    
    num_found = 0
    for i, (archivo, titulo) in enumerate(imagenes_para_mostrar.items()):
        ruta_archivo = os.path.join(directorio_resultados, archivo)
        if os.path.exists(ruta_archivo):
            img = cv2.imread(ruta_archivo)
            if img is not None:
                plt.subplot(2, 2, num_found + 1)
                plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                plt.title(titulo)
                plt.axis('off')
                num_found += 1
    
    if num_found > 0:
        plt.tight_layout()
        plt.savefig(os.path.join(directorio_resultados, 'resultados_estereo_para_readme.jpg'))
        plt.show()
        print(f"Imágenes para el README guardadas en {directorio_resultados}")
    else:
        print("No se encontraron imágenes de resultados de calibración estéreo")

def crear_poster_calibracion():
    """
    Crea un póster con los resultados clave de calibración para incluir en el README
    """
    # Directorios de resultados
    dir_una_camara = '../../resultados_una_camara'
    dir_dos_camaras = '../../resultados_dos_camaras'
    
    # Verificar que existan los resultados
    if not os.path.exists(dir_una_camara) or not os.path.exists(dir_dos_camaras):
        print("No se encontraron todos los resultados necesarios")
        return
    
    # Buscar imágenes clave
    imagenes_una_camara = []
    for archivo in ['patron_variacion_0_esquinas.jpg', 'patron_calibracion_reproyeccion.jpg']:
        ruta = os.path.join(dir_una_camara, archivo)
        if os.path.exists(ruta):
            imagenes_una_camara.append((cv2.imread(ruta), archivo.split('.')[0]))
    
    imagenes_estereo = []
    for archivo in ['rectificado_lineas_combinado.jpg', 'rectificada_izquierda.jpg', 'rectificada_derecha.jpg']:
        ruta = os.path.join(dir_dos_camaras, archivo)
        if os.path.exists(ruta):
            imagenes_estereo.append((cv2.imread(ruta), archivo.split('.')[0]))
    
    # Crear póster
    plt.figure(figsize=(18, 10))
    
    # Título
    plt.suptitle('Calibración de Cámaras: Una y Dos Cámaras', fontsize=16)
    
    # Una cámara
    for i, (img, titulo) in enumerate(imagenes_una_camara):
        plt.subplot(2, 3, i + 1)
        plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        plt.title(f"Una Cámara: {titulo}")
        plt.axis('off')
    
    # Calibración estéreo
    for i, (img, titulo) in enumerate(imagenes_estereo):
        plt.subplot(2, 3, i + 4)
        plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        plt.title(f"Estéreo: {titulo}")
        plt.axis('off')
    
    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.savefig('../../poster_calibracion_camaras.jpg')
    plt.show()
    
    print("Póster de calibración creado: ../../poster_calibracion_camaras.jpg")

if __name__ == "__main__":
    # Visualizar resultados de calibración de una cámara
    visualizar_resultados_una_camara()
    
    # Visualizar resultados de calibración estéreo
    visualizar_resultados_estereo()
    
    # Crear póster para README
    crear_poster_calibracion()
    
    print("\nPara incluir estas imágenes en el README:")
    print("1. Añade la ruta a las imágenes generadas en las secciones correspondientes del README.")
    print("2. Por ejemplo: ![Calibración de Una Cámara](./resultados_una_camara/resultados_una_camara_para_readme.jpg)")
    print("3. Asegúrate de actualizar las matrices y parámetros en el README con los valores reales obtenidos.")
