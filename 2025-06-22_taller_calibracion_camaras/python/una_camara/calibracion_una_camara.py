"""
Calibración de una cámara utilizando un patrón de tablero de ajedrez
"""

import numpy as np
import cv2
import glob
import os
import matplotlib.pyplot as plt

def calibrar_una_camara(directorio_imagenes, patron_filas, patron_columnas, tamano_cuadro=1.0, mostrar_proceso=True, guardar_resultados=True):
    """
    Realiza la calibración de una cámara usando un conjunto de imágenes de un patrón de tablero de ajedrez.
    
    Args:
        directorio_imagenes: Ruta a las imágenes del patrón
        patron_filas: Número de esquinas internas en filas del patrón
        patron_columnas: Número de esquinas internas en columnas del patrón
        tamano_cuadro: Tamaño de cada cuadro del patrón (en unidades arbitrarias, por defecto 1.0)
        mostrar_proceso: Si es True, muestra imágenes del proceso
        guardar_resultados: Si es True, guarda imágenes y parámetros de calibración
    
    Returns:
        ret: Valor RMS del error de reproyección
        mtx: Matriz de la cámara
        dist: Coeficientes de distorsión
        rvecs: Vectores de rotación
        tvecs: Vectores de traslación
    """
    # Preparar puntos del objeto (0,0,0), (1,0,0), (2,0,0) ....,(8,5,0)
    objp = np.zeros((patron_filas * patron_columnas, 3), np.float32)
    objp[:,:2] = np.mgrid[0:patron_columnas, 0:patron_filas].T.reshape(-1, 2) * tamano_cuadro
    
    # Arrays para almacenar puntos del objeto y puntos de la imagen de todas las imágenes
    objpoints = [] # puntos 3D en el espacio real (sistema de coordenadas del objeto)
    imgpoints = [] # puntos 2D en el plano de la imagen    # Lista de todas las imágenes de calibración
    imagenes = glob.glob(os.path.join(directorio_imagenes, '*.jpg'))
    
    # Verificar si hay imágenes disponibles
    if len(imagenes) == 0:
        print(f"No se encontraron imágenes JPG en {directorio_imagenes}")
        print("Asegúrese de que las imágenes de calibración existan antes de ejecutar este script.")
        return None, None, None, None, None
    
    # Contador para nombrar las imágenes resultantes
    contador_imagen = 0
    
    # Crear directorio para resultados si no existe
    if guardar_resultados:
        directorio_resultados = '../../resultados_una_camara'
        os.makedirs(directorio_resultados, exist_ok=True)
    
    # Variable para almacenar dimensiones de imagen para calibración
    img_shape = None
    valid_images_found = False
      # Procesar cada imagen para detectar esquinas
    for imagen_path in imagenes:
        img = cv2.imread(imagen_path)
        if img is None:
            print(f"No se pudo leer la imagen: {imagen_path}")
            continue
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        if img_shape is None:
            img_shape = gray.shape[::-1]  # Guardar dimensiones para calibración
        
        # Buscar esquinas del patrón
        ret, corners = cv2.findChessboardCorners(gray, (patron_columnas, patron_filas), None)
        
        # Si se encuentran las esquinas, se añaden a los arrays
        if ret:
            valid_images_found = True
            objpoints.append(objp)
            
            # Refinar las esquinas encontradas
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
            corners2 = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
            imgpoints.append(corners2)
            
            # Dibujar y mostrar las esquinas
            if mostrar_proceso or guardar_resultados:
                cv2.drawChessboardCorners(img, (patron_columnas, patron_filas), corners2, ret)
                
                if mostrar_proceso:
                    cv2.imshow('Esquinas detectadas', img)
                    cv2.waitKey(500)
                
                if guardar_resultados:
                    cv2.imwrite(os.path.join(directorio_resultados, f'patron_variacion_{contador_imagen}_esquinas.jpg'), img)
                
                contador_imagen += 1
    
    if mostrar_proceso:
        cv2.destroyAllWindows()    # Verificar si se encontraron suficientes puntos para calibración
    if len(objpoints) == 0 or not valid_images_found:
        print("No se detectaron esquinas del patrón en ninguna imagen.")
        return None, None, None, None, None
    
    if img_shape is None:
        print("Error: No se pudo obtener el tamaño de la imagen.")
        return None, None, None, None, None    # Calibrar la cámara
    if len(objpoints) > 0 and valid_images_found and img_shape is not None:
        ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
            objpoints, imgpoints, img_shape, None, None
        )
    else:
        print("Error: No hay suficientes datos para calibrar la cámara.")
        return None, None, None, None, None
    
    # Calcular el error de reproyección
    mean_error = 0
    for i in range(len(objpoints)):
        imgpoints2, _ = cv2.projectPoints(objpoints[i], rvecs[i], tvecs[i], mtx, dist)
        error = cv2.norm(imgpoints[i], imgpoints2, cv2.NORM_L2) / len(imgpoints2)
        mean_error += error
    
    print(f"Error total de reproyección: {mean_error/len(objpoints)}")
    
    # Guardar los parámetros de calibración
    if guardar_resultados:
        np.savez(os.path.join(directorio_resultados, 'parametros_calibracion.npz'),
                 camera_matrix=mtx,
                 dist_coeffs=dist,
                 rvecs=rvecs,
                 tvecs=tvecs)
        
        # Visualizar y guardar un ejemplo de corrección de distorsión
        for i, imagen_path in enumerate(imagenes[:1]):  # Usar solo la primera imagen como ejemplo
            img = cv2.imread(imagen_path)
            h, w = img.shape[:2]
            
            # Obtener nuevos parámetros de cámara
            newcameramtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w,h), 1, (w,h))
            
            # Corrección de distorsión
            dst = cv2.undistort(img, mtx, dist, None, newcameramtx)
            
            # Recortar la región de interés
            x, y, w, h = roi
            dst = dst[y:y+h, x:x+w]
            
            # Guardar resultado
            cv2.imwrite(os.path.join(directorio_resultados, 'patron_calibracion_reproyeccion.jpg'), dst)
            
            # Mostrar resultados de reproyección para verificación visual
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
            ax1.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            ax1.set_title('Imagen Original')
            ax1.axis('off')
            
            ax2.imshow(cv2.cvtColor(dst, cv2.COLOR_BGR2RGB))
            ax2.set_title('Imagen Corregida')
            ax2.axis('off')
            
            plt.tight_layout()
            plt.savefig(os.path.join(directorio_resultados, 'comparacion_distorsion.jpg'))
            
            if mostrar_proceso:
                plt.show()
    
    return ret, mtx, dist, rvecs, tvecs

if __name__ == "__main__":
    # Parámetros de calibración
    # Obtener la ruta absoluta del directorio actual
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    directorio_imagenes = os.path.join(directorio_actual, "..", "imagenes", "calibracion_una_camara")
    
    # Verificar que exista el directorio
    if not os.path.exists(directorio_imagenes):
        os.makedirs(directorio_imagenes, exist_ok=True)
        print(f"Creado el directorio {directorio_imagenes}")
        print("Por favor, coloque imágenes de calibración en este directorio antes de ejecutar la calibración.")
        exit(1)
    
    patron_filas = 6      # Número de esquinas internas en filas
    patron_columnas = 9   # Número de esquinas internas en columnas
    tamano_cuadro = 1.0   # Tamaño de cuadro en unidades arbitrarias (ej. cm)
    
    # Ejecutar calibración
    ret, mtx, dist, rvecs, tvecs = calibrar_una_camara(
        directorio_imagenes, 
        patron_filas, 
        patron_columnas, 
        tamano_cuadro,
        mostrar_proceso=True,
        guardar_resultados=True
    )
    
    # Verificar si la calibración fue exitosa
    if mtx is None:
        print("No se pudo completar la calibración. Por favor, verifique las imágenes de calibración.")
        exit(1)
    
    # Mostrar resultados
    print("Calibración de cámara completada")
    print(f"Error de reproyección: {ret}")
    print("\nMatriz de cámara:")
    print(mtx)
    print("\nCoeficientes de distorsión:")
    print(dist)
    
    print("\nLos resultados han sido guardados en la carpeta 'resultados_una_camara'")
