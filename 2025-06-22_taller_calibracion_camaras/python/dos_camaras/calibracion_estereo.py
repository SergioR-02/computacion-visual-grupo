"""
Calibración de un par de cámaras estéreo utilizando un patrón de tablero de ajedrez
"""

import numpy as np
import cv2
import glob
import os
import matplotlib.pyplot as plt

def calibrar_camaras_estereo(directorio_izquierda, directorio_derecha, patron_filas, patron_columnas, 
                            tamano_cuadro=1.0, mostrar_proceso=True, guardar_resultados=True):
    """
    Realiza la calibración estéreo de dos cámaras utilizando imágenes del mismo patrón visto desde ambas cámaras.
    
    Args:
        directorio_izquierda: Ruta a las imágenes del patrón de la cámara izquierda
        directorio_derecha: Ruta a las imágenes del patrón de la cámara derecha
        patron_filas: Número de esquinas internas en filas del patrón
        patron_columnas: Número de esquinas internas en columnas del patrón
        tamano_cuadro: Tamaño de cada cuadro del patrón (en unidades arbitrarias, por defecto 1.0)
        mostrar_proceso: Si es True, muestra imágenes del proceso
        guardar_resultados: Si es True, guarda imágenes y parámetros de calibración
    
    Returns:
        retStereo: Error de calibración estéreo
        cameraMatrix1, cameraMatrix2: Matrices de cámaras
        distCoeffs1, distCoeffs2: Coeficientes de distorsión
        R, T: Matriz de rotación y vector de traslación entre cámaras
        E, F: Matrices esencial y fundamental
    """
    # Preparar puntos del objeto (0,0,0), (1,0,0), (2,0,0) ....,(8,5,0)
    objp = np.zeros((patron_filas * patron_columnas, 3), np.float32)
    objp[:,:2] = np.mgrid[0:patron_columnas, 0:patron_filas].T.reshape(-1, 2) * tamano_cuadro
      # Arrays para almacenar puntos del objeto y puntos de la imagen de todas las imágenes
    objpoints = []
    imgpoints_left = []
    imgpoints_right = []
    
    # Lista de todas las imágenes de calibración
    imagenes_izquierda = sorted(glob.glob(os.path.join(directorio_izquierda, '*.jpg')))
    imagenes_derecha = sorted(glob.glob(os.path.join(directorio_derecha, '*.jpg')))
    
    # Verificar si hay imágenes disponibles
    if len(imagenes_izquierda) == 0:
        print(f"No se encontraron imágenes JPG en {directorio_izquierda}")
        return None, None, None, None, None, None, None, None, None
        
    if len(imagenes_derecha) == 0:
        print(f"No se encontraron imágenes JPG en {directorio_derecha}")
        return None, None, None, None, None, None, None, None, None
    
    if len(imagenes_izquierda) != len(imagenes_derecha):
        print("El número de imágenes izquierda y derecha debe ser igual")
        print(f"Imágenes izquierda: {len(imagenes_izquierda)}, Imágenes derecha: {len(imagenes_derecha)}")
        return None, None, None, None, None, None, None, None, None
    
    # Crear directorio para resultados si no existe
    if guardar_resultados:
        directorio_resultados = '../../resultados_dos_camaras'
        os.makedirs(directorio_resultados, exist_ok=True)
    
    # Criterios para refinamiento de esquinas
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
      # Procesar cada par de imágenes
    valid_images_found = False
    image_shape = None
    
    for i, (img_left_path, img_right_path) in enumerate(zip(imagenes_izquierda, imagenes_derecha)):
        img_left = cv2.imread(img_left_path)
        img_right = cv2.imread(img_right_path)
        
        if img_left is None or img_right is None:
            print(f"No se pudieron leer las imágenes: {img_left_path} o {img_right_path}")
            continue
        
        gray_left = cv2.cvtColor(img_left, cv2.COLOR_BGR2GRAY)
        gray_right = cv2.cvtColor(img_right, cv2.COLOR_BGR2GRAY)
        
        # Guardar las dimensiones de la imagen para calibración
        if image_shape is None:
            image_shape = gray_left.shape[::-1]
        
        # Buscar esquinas del patrón en ambas imágenes
        ret_left, corners_left = cv2.findChessboardCorners(gray_left, (patron_columnas, patron_filas), None)
        ret_right, corners_right = cv2.findChessboardCorners(gray_right, (patron_columnas, patron_filas), None)
          # Si se encuentran las esquinas en ambas imágenes, se añaden a los arrays
        if ret_left and ret_right:
            valid_images_found = True
            objpoints.append(objp)
            
            # Refinar las esquinas encontradas
            corners_left2 = cv2.cornerSubPix(gray_left, corners_left, (11, 11), (-1, -1), criteria)
            corners_right2 = cv2.cornerSubPix(gray_right, corners_right, (11, 11), (-1, -1), criteria)
            
            imgpoints_left.append(corners_left2)
            imgpoints_right.append(corners_right2)
            
            # Dibujar y mostrar las esquinas
            if mostrar_proceso or guardar_resultados:
                img_left_corners = img_left.copy()
                img_right_corners = img_right.copy()
                
                cv2.drawChessboardCorners(img_left_corners, (patron_columnas, patron_filas), corners_left2, ret_left)
                cv2.drawChessboardCorners(img_right_corners, (patron_columnas, patron_filas), corners_right2, ret_right)
                
                if mostrar_proceso:
                    # Mostrar imágenes lado a lado
                    combined_img = np.hstack((img_left_corners, img_right_corners))
                    cv2.imshow('Esquinas detectadas (Izquierda - Derecha)', combined_img)
                    cv2.waitKey(500)
                
                if guardar_resultados and i < 3:  # Guardar solo las primeras 3 variaciones
                    cv2.imwrite(os.path.join(directorio_resultados, f'patron_variacion_{i}_izquierda.jpg'), img_left_corners)
                    cv2.imwrite(os.path.join(directorio_resultados, f'patron_variacion_{i}_derecha.jpg'), img_right_corners)
                      # Crear y guardar imagen combinada
                    combined_img = np.hstack((img_left_corners, img_right_corners))
                    cv2.imwrite(os.path.join(directorio_resultados, f'patron_variacion_{i}_combinado.jpg'), combined_img)
    
    if mostrar_proceso:
        cv2.destroyAllWindows()    # Verificar si se encontraron suficientes puntos para calibración
    if len(objpoints) == 0 or not valid_images_found:
        print("No se detectaron esquinas del patrón en ningún par de imágenes.")
        return None, None, None, None, None, None, None, None, None
    
    # Asegurarse de que tenemos las dimensiones de la imagen
    if image_shape is None:
        print("Error: No se pudieron procesar las imágenes correctamente.")
        return None, None, None, None, None, None, None, None, None    # Calibrar cada cámara individualmente
    if len(objpoints) > 0 and valid_images_found and image_shape is not None:
        ret_left, mtx_left, dist_left, rvecs_left, tvecs_left = cv2.calibrateCamera(
            objpoints, imgpoints_left, image_shape, None, None
        )
        
        ret_right, mtx_right, dist_right, rvecs_right, tvecs_right = cv2.calibrateCamera(
            objpoints, imgpoints_right, image_shape, None, None
        )
        
        # Calibración estéreo
        flags = 0
        flags |= cv2.CALIB_FIX_INTRINSIC
        
        retStereo, cameraMatrix1, distCoeffs1, cameraMatrix2, distCoeffs2, R, T, E, F = cv2.stereoCalibrate(
            objpoints, imgpoints_left, imgpoints_right,
            mtx_left, dist_left,
            mtx_right, dist_right,
            image_shape,
            criteria=criteria,
            flags=flags
        )
    else:
        print("Error: No hay suficientes datos para calibrar las cámaras estéreo.")
        return None, None, None, None, None, None, None, None, None
      # Rectificación estéreo
    R1, R2, P1, P2, Q, roi_left, roi_right = cv2.stereoRectify(
        cameraMatrix1, distCoeffs1,
        cameraMatrix2, distCoeffs2,
        image_shape, R, T,
        flags=cv2.CALIB_ZERO_DISPARITY,
        alpha=0.9
    )
    
    # Calcular mapas de rectificación
    map1_left, map2_left = cv2.initUndistortRectifyMap(
        cameraMatrix1, distCoeffs1, R1, P1,
        image_shape, cv2.CV_16SC2
    )
    
    map1_right, map2_right = cv2.initUndistortRectifyMap(
        cameraMatrix2, distCoeffs2, R2, P2,
        image_shape, cv2.CV_16SC2
    )
    
    # Guardar los parámetros de calibración
    if guardar_resultados:
        np.savez(os.path.join(directorio_resultados, 'parametros_calibracion_estereo.npz'),
                 cameraMatrix1=cameraMatrix1,
                 distCoeffs1=distCoeffs1,
                 cameraMatrix2=cameraMatrix2,
                 distCoeffs2=distCoeffs2,
                 R=R, T=T, E=E, F=F,
                 R1=R1, R2=R2,
                 P1=P1, P2=P2,
                 Q=Q)
        
        # Visualizar y guardar un ejemplo de rectificación
        for i, (img_left_path, img_right_path) in enumerate(zip(imagenes_izquierda[:1], imagenes_derecha[:1])):
            img_left = cv2.imread(img_left_path)
            img_right = cv2.imread(img_right_path)
            
            # Rectificar imágenes
            rectified_left = cv2.remap(img_left, map1_left, map2_left, cv2.INTER_LINEAR)
            rectified_right = cv2.remap(img_right, map1_right, map2_right, cv2.INTER_LINEAR)
            
            # Recortar a las regiones de interés
            left_roi_x, left_roi_y, left_roi_w, left_roi_h = roi_left
            right_roi_x, right_roi_y, right_roi_w, right_roi_h = roi_right
            
            # Añadir líneas horizontales para verificar la rectificación
            rectified_left_lines = rectified_left.copy()
            rectified_right_lines = rectified_right.copy()
            
            for j in range(0, rectified_left.shape[0], 50):
                cv2.line(rectified_left_lines, (0, j), (rectified_left.shape[1], j), (0, 255, 0), 1)
                cv2.line(rectified_right_lines, (0, j), (rectified_right.shape[1], j), (0, 255, 0), 1)
            
            # Guardar imágenes rectificadas
            cv2.imwrite(os.path.join(directorio_resultados, 'rectificada_izquierda.jpg'), rectified_left)
            cv2.imwrite(os.path.join(directorio_resultados, 'rectificada_derecha.jpg'), rectified_right)
            
            # Guardar imágenes con líneas
            cv2.imwrite(os.path.join(directorio_resultados, 'rectificada_lineas_izquierda.jpg'), rectified_left_lines)
            cv2.imwrite(os.path.join(directorio_resultados, 'rectificada_lineas_derecha.jpg'), rectified_right_lines)
            
            # Crear y guardar imagen combinada
            combined_original = np.hstack((img_left, img_right))
            combined_rectified = np.hstack((rectified_left, rectified_right))
            combined_rectified_lines = np.hstack((rectified_left_lines, rectified_right_lines))
            
            cv2.imwrite(os.path.join(directorio_resultados, 'original_combinado.jpg'), combined_original)
            cv2.imwrite(os.path.join(directorio_resultados, 'rectificado_combinado.jpg'), combined_rectified)
            cv2.imwrite(os.path.join(directorio_resultados, 'rectificado_lineas_combinado.jpg'), combined_rectified_lines)
            
            # Mostrar resultados de rectificación para verificación visual
            if mostrar_proceso:
                fig, axes = plt.subplots(2, 2, figsize=(15, 10))
                
                axes[0, 0].imshow(cv2.cvtColor(img_left, cv2.COLOR_BGR2RGB))
                axes[0, 0].set_title('Imagen Original Izquierda')
                axes[0, 0].axis('off')
                
                axes[0, 1].imshow(cv2.cvtColor(img_right, cv2.COLOR_BGR2RGB))
                axes[0, 1].set_title('Imagen Original Derecha')
                axes[0, 1].axis('off')
                
                axes[1, 0].imshow(cv2.cvtColor(rectified_left_lines, cv2.COLOR_BGR2RGB))
                axes[1, 0].set_title('Imagen Rectificada Izquierda')
                axes[1, 0].axis('off')
                
                axes[1, 1].imshow(cv2.cvtColor(rectified_right_lines, cv2.COLOR_BGR2RGB))
                axes[1, 1].set_title('Imagen Rectificada Derecha')
                axes[1, 1].axis('off')
                
                plt.tight_layout()
                plt.savefig(os.path.join(directorio_resultados, 'comparacion_rectificacion.jpg'))
                plt.show()
    
    return retStereo, cameraMatrix1, distCoeffs1, cameraMatrix2, distCoeffs2, R, T, E, F

if __name__ == "__main__":
    # Parámetros de calibración
    # Obtener la ruta absoluta del directorio actual
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    directorio_izquierda = os.path.join(directorio_actual, "..", "imagenes", "calibracion_estereo", "izquierda")
    directorio_derecha = os.path.join(directorio_actual, "..", "imagenes", "calibracion_estereo", "derecha")
    
    # Verificar que existan los directorios
    for directorio in [directorio_izquierda, directorio_derecha]:
        if not os.path.exists(directorio):
            os.makedirs(directorio, exist_ok=True)
            print(f"Creado el directorio {directorio}")
    
    # Verificar que haya imágenes
    if len(glob.glob(os.path.join(directorio_izquierda, '*.jpg'))) == 0 or len(glob.glob(os.path.join(directorio_derecha, '*.jpg'))) == 0:
        print("No se encontraron imágenes suficientes para la calibración estéreo.")
        print(f"Por favor, coloque imágenes en {directorio_izquierda} y {directorio_derecha}")
        exit(1)
    
    patron_filas = 6      # Número de esquinas internas en filas
    patron_columnas = 9   # Número de esquinas internas en columnas
    tamano_cuadro = 1.0   # Tamaño de cuadro en unidades arbitrarias (ej. cm)
    
    # Ejecutar calibración estéreo
    retStereo, cameraMatrix1, distCoeffs1, cameraMatrix2, distCoeffs2, R, T, E, F = calibrar_camaras_estereo(
        directorio_izquierda, 
        directorio_derecha, 
        patron_filas, 
        patron_columnas, 
        tamano_cuadro,
        mostrar_proceso=True,
        guardar_resultados=True
    )
    
    # Verificar si la calibración fue exitosa
    if cameraMatrix1 is None:
        print("No se pudo completar la calibración estéreo. Por favor, verifique las imágenes.")
        exit(1)
    
    # Mostrar resultados
    print("Calibración estéreo completada")
    print(f"Error de calibración estéreo: {retStereo}")
    
    print("\nMatriz de cámara izquierda:")
    print(cameraMatrix1)
    print("\nCoeficientes de distorsión izquierda:")
    print(distCoeffs1)
    
    print("\nMatriz de cámara derecha:")
    print(cameraMatrix2)
    print("\nCoeficientes de distorsión derecha:")
    print(distCoeffs2)
    
    print("\nMatriz de rotación entre cámaras:")
    print(R)
    print("\nVector de traslación entre cámaras:")
    print(T)
    
    print("\nLos resultados han sido guardados en la carpeta 'resultados_dos_camaras'")
