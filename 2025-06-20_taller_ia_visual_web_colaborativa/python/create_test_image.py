# Script para generar una imagen de ejemplo para pruebas
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image():
    """Crea una imagen de prueba con objetos simulados para el detector"""
    
    # Crear imagen base
    width, height = 640, 480
    image = np.ones((height, width, 3), dtype=np.uint8) * 200  # Fondo gris claro
    
    # Convertir a PIL para dibujo más fácil
    pil_image = Image.fromarray(image)
    draw = ImageDraw.Draw(pil_image)
    
    # Colores
    person_color = (100, 150, 200)
    car_color = (50, 100, 150)
    bike_color = (150, 100, 50)
    
    # Dibujar "personas" (rectángulos verticales)
    draw.rectangle([120, 80, 220, 350], fill=person_color, outline=(0, 0, 0), width=2)
    draw.rectangle([380, 90, 460, 320], fill=person_color, outline=(0, 0, 0), width=2)
    
    # Dibujar "carro" (rectángulo horizontal)
    draw.rectangle([50, 250, 300, 380], fill=car_color, outline=(0, 0, 0), width=2)
    
    # Dibujar "bicicleta" (rectángulo medio)
    draw.rectangle([480, 200, 580, 350], fill=bike_color, outline=(0, 0, 0), width=2)
    
    # Agregar texto
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    draw.text((130, 100), "PERSON", fill=(255, 255, 255), font=font)
    draw.text((390, 110), "PERSON", fill=(255, 255, 255), font=font)
    draw.text((120, 270), "CAR", fill=(255, 255, 255), font=font)
    draw.text((500, 220), "BIKE", fill=(255, 255, 255), font=font)
    
    # Agregar círculo como "semáforo"
    draw.ellipse([300, 50, 330, 120], fill=(255, 200, 0), outline=(0, 0, 0), width=2)
    draw.text((295, 80), "LIGHT", fill=(0, 0, 0), font=font)
    
    # Convertir de vuelta a array de NumPy y guardar
    final_image = np.array(pil_image)
    
    return final_image

if __name__ == "__main__":
    print("🖼️ Generando imagen de prueba...")
    test_image = create_test_image()
    
    # Guardar imagen
    output_path = "test_image.jpg"
    cv2.imwrite(output_path, test_image)
    
    print(f"✅ Imagen de prueba guardada como: {output_path}")
    print("🔍 Ahora puedes ejecutar:")
    print(f"python detector.py --source {output_path}")
