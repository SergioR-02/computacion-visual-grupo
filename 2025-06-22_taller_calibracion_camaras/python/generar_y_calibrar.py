"""
Script principal para generar todas las imágenes de calibración necesarias
"""

import os
import subprocess
import sys

def verificar_patron_ajedrez():
    """Verifica si el patrón de ajedrez existe, si no, lo genera"""
    # Obtener la ruta absoluta del directorio actual
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    directorio_imagenes = os.path.join(directorio_actual, "..", "imagenes")
    ruta_patron = os.path.join(directorio_imagenes, "patron_ajedrez.jpg")
    
    if not os.path.exists(ruta_patron):
        print("Generando patrón de ajedrez...")
        try:
            ruta_script_patron = os.path.join(directorio_actual, "generar_patron.py")
            subprocess.run([sys.executable, ruta_script_patron], check=True)
        except subprocess.CalledProcessError:
            print("Error al generar el patrón de ajedrez")
            return False
    
    return True

def generar_todas_imagenes():
    """Genera todas las imágenes necesarias para la calibración de cámaras"""
    # Verificar que exista el patrón
    if not verificar_patron_ajedrez():
        return
    
    # Obtener la ruta absoluta del directorio actual
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    
    # Generar imágenes para calibración de una cámara
    print("\n=== Generando imágenes para calibración de una cámara ===")
    try:
        ruta_script_una_camara = os.path.join(directorio_actual, "generar_imagenes_una_camara.py")
        subprocess.run([sys.executable, ruta_script_una_camara], check=True)
    except subprocess.CalledProcessError:
        print("Error al generar imágenes para calibración de una cámara")
    
    # Generar imágenes para calibración estéreo
    print("\n=== Generando imágenes para calibración estéreo ===")
    try:
        ruta_script_estereo = os.path.join(directorio_actual, "generar_imagenes_estereo.py")
        subprocess.run([sys.executable, ruta_script_estereo], check=True)
    except subprocess.CalledProcessError:
        print("Error al generar imágenes para calibración estéreo")
    
    print("\n=== Generación de imágenes completada ===")
    print("Las imágenes han sido generadas en las siguientes carpetas:")
    print("- ../imagenes/calibracion_una_camara/")
    print("- ../imagenes/calibracion_estereo/izquierda/")
    print("- ../imagenes/calibracion_estereo/derecha/")

def ejecutar_calibraciones():
    """Ejecuta los scripts de calibración de cámaras"""
    # Obtener la ruta absoluta del directorio actual
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    
    # Ejecutar calibración de una cámara
    print("\n=== Ejecutando calibración de una cámara ===")
    try:
        ruta_script_una_camara = os.path.join(directorio_actual, "una_camara", "calibracion_una_camara.py")
        subprocess.run([sys.executable, ruta_script_una_camara], check=True)
    except subprocess.CalledProcessError:
        print("Error al ejecutar la calibración de una cámara")
    
    # Ejecutar calibración estéreo
    print("\n=== Ejecutando calibración estéreo ===")
    try:
        ruta_script_estereo = os.path.join(directorio_actual, "dos_camaras", "calibracion_estereo.py") 
        subprocess.run([sys.executable, ruta_script_estereo], check=True)
    except subprocess.CalledProcessError:
        print("Error al ejecutar la calibración estéreo")
    
    print("\n=== Calibraciones completadas ===")
    print("Los resultados han sido guardados en las siguientes carpetas:")
    print("- ../resultados_una_camara/")
    print("- ../resultados_dos_camaras/")

if __name__ == "__main__":
    print("=== Generación de imágenes para calibración de cámaras ===")
    
    # Obtener la ruta absoluta del directorio actual
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    directorio_base = os.path.join(directorio_actual, "..")
    
    # Crear los directorios necesarios si no existen
    os.makedirs(os.path.join(directorio_base, "imagenes"), exist_ok=True)
    os.makedirs(os.path.join(directorio_base, "imagenes", "calibracion_una_camara"), exist_ok=True)
    os.makedirs(os.path.join(directorio_base, "imagenes", "calibracion_estereo", "izquierda"), exist_ok=True)
    os.makedirs(os.path.join(directorio_base, "imagenes", "calibracion_estereo", "derecha"), exist_ok=True)
    
    # Crear directorios para resultados
    os.makedirs(os.path.join(directorio_base, "resultados_una_camara"), exist_ok=True)
    os.makedirs(os.path.join(directorio_base, "resultados_dos_camaras"), exist_ok=True)
    
    # Menú de opciones
    while True:
        print("\nSeleccione una opción:")
        print("1. Generar todas las imágenes de calibración")
        print("2. Ejecutar calibraciones (requiere imágenes generadas)")
        print("3. Generar imágenes y ejecutar calibraciones")
        print("4. Salir")
        
        opcion = input("Opción: ")
        
        if opcion == "1":
            generar_todas_imagenes()
        elif opcion == "2":
            ejecutar_calibraciones()
        elif opcion == "3":
            generar_todas_imagenes()
            ejecutar_calibraciones()
        elif opcion == "4":
            break
        else:
            print("Opción no válida. Intente de nuevo.")
