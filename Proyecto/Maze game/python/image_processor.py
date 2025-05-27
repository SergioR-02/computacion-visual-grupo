#!/usr/bin/env python3
"""
Procesador de imágenes de laberintos usando OpenCV.
Convierte imágenes binarizadas de laberintos a matrices numéricas.
"""

import cv2
import numpy as np
import json
import os
from typing import List, Tuple, Optional

class MazeImageProcessor:
    """
    Clase para procesar imágenes de laberintos y convertirlas a matrices.
    
    Attributes:
        threshold (int): Umbral para binarización
        cell_size (int): Tamaño estimado de cada celda del laberinto
    """
    
    def __init__(self, threshold: int = 128):
        """
        Inicializa el procesador de imágenes.
        
        Args:
            threshold (int): Umbral para binarización (0-255)
        """
        self.threshold = threshold
        self.cell_size = None
        
    def load_image(self, image_path: str) -> np.ndarray:
        """
        Carga una imagen y la convierte a escala de grises.
        
        Args:
            image_path (str): Ruta de la imagen
            
        Returns:
            np.ndarray: Imagen en escala de grises
            
        Raises:
            FileNotFoundError: Si la imagen no existe
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"No se encontró la imagen: {image_path}")
        
        # Cargar imagen
        image = cv2.imread(image_path)
        
        if image is None:
            raise ValueError(f"No se pudo cargar la imagen: {image_path}")
        
        # Convertir a escala de grises si es necesario
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
            
        return gray
    
    def binarize_image(self, gray_image: np.ndarray) -> np.ndarray:
        """
        Binariza una imagen en escala de grises.
        
        Args:
            gray_image (np.ndarray): Imagen en escala de grises
            
        Returns:
            np.ndarray: Imagen binaria (0 y 255)
        """
        # Aplicar umbral binario inverso (paredes negras = 0, pasillos blancos = 255)
        _, binary = cv2.threshold(gray_image, self.threshold, 255, cv2.THRESH_BINARY)
        
        return binary
    
    def detect_grid_size(self, binary_image: np.ndarray) -> Tuple[int, int]:
        """
        Detecta el tamaño de la cuadrícula del laberinto.
        
        Args:
            binary_image (np.ndarray): Imagen binaria
            
        Returns:
            Tuple[int, int]: (filas, columnas) de la cuadrícula
        """
        height, width = binary_image.shape
        
        # Detectar líneas horizontales usando proyección
        horizontal_projection = np.sum(binary_image == 0, axis=1)
        horizontal_lines = np.where(horizontal_projection > width * 0.5)[0]
        
        # Detectar líneas verticales usando proyección
        vertical_projection = np.sum(binary_image == 0, axis=0)
        vertical_lines = np.where(vertical_projection > height * 0.5)[0]
        
        # Calcular el número de celdas
        rows = len(horizontal_lines) - 1 if len(horizontal_lines) > 1 else 1
        cols = len(vertical_lines) - 1 if len(vertical_lines) > 1 else 1
        
        # Estimar el tamaño de celda
        if rows > 0 and cols > 0:
            self.cell_size = min(height // rows, width // cols)
        
        return rows, cols
    
    def image_to_matrix(self, binary_image: np.ndarray, grid_size: Optional[Tuple[int, int]] = None) -> List[List[int]]:
        """
        Convierte una imagen binaria a una matriz de laberinto.
        
        Args:
            binary_image (np.ndarray): Imagen binaria
            grid_size (Optional[Tuple[int, int]]): Tamaño de la cuadrícula (filas, columnas)
            
        Returns:
            List[List[int]]: Matriz del laberinto (0 = pasillo, 1 = pared)
        """
        height, width = binary_image.shape
        
        if grid_size is None:
            rows, cols = self.detect_grid_size(binary_image)
        else:
            rows, cols = grid_size
        
        if rows == 0 or cols == 0:
            raise ValueError("No se pudo detectar el tamaño de la cuadrícula")
        
        # Calcular el tamaño de cada celda
        cell_height = height // rows
        cell_width = width // cols
        
        # Crear la matriz
        maze_matrix = []
        
        for i in range(rows):
            row = []
            for j in range(cols):
                # Extraer la región de la celda
                y1 = i * cell_height
                y2 = (i + 1) * cell_height
                x1 = j * cell_width
                x2 = (j + 1) * cell_width
                
                cell = binary_image[y1:y2, x1:x2]
                
                # Determinar si la celda es pared o pasillo
                # Si más del 50% de los píxeles son negros, es una pared
                black_pixels = np.sum(cell == 0)
                total_pixels = cell.size
                
                if black_pixels > total_pixels * 0.5:
                    row.append(1)  # Pared
                else:
                    row.append(0)  # Pasillo
            
            maze_matrix.append(row)
        
        return maze_matrix
    
    def clean_matrix(self, matrix: List[List[int]]) -> List[List[int]]:
        """
        Limpia y valida la matriz del laberinto.
        
        Args:
            matrix (List[List[int]]): Matriz original
            
        Returns:
            List[List[int]]: Matriz limpia
        """
        rows = len(matrix)
        cols = len(matrix[0]) if rows > 0 else 0
        
        # Asegurar que los bordes sean paredes
        for i in range(rows):
            matrix[i][0] = 1
            matrix[i][cols - 1] = 1
        
        for j in range(cols):
            matrix[0][j] = 1
            matrix[rows - 1][j] = 1
        
        return matrix
    
    def save_matrix(self, matrix: List[List[int]], output_path: str):
        """
        Guarda la matriz en formato JSON.
        
        Args:
            matrix (List[List[int]]): Matriz del laberinto
            output_path (str): Ruta del archivo de salida
        """
        data = {
            "size": len(matrix),
            "maze": matrix,
            "start": {"x": 1, "y": 1},
            "end": {"x": len(matrix[0]) - 2, "y": len(matrix) - 2}
        }
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Matriz guardada en: {output_path}")
    
    def visualize_matrix(self, matrix: List[List[int]], output_path: Optional[str] = None):
        """
        Visualiza la matriz como imagen.
        
        Args:
            matrix (List[List[int]]): Matriz del laberinto
            output_path (Optional[str]): Ruta para guardar la imagen
        """
        rows = len(matrix)
        cols = len(matrix[0]) if rows > 0 else 0
        
        # Crear imagen
        cell_size = 20
        img_height = rows * cell_size
        img_width = cols * cell_size
        
        image = np.ones((img_height, img_width), dtype=np.uint8) * 255
        
        # Dibujar el laberinto
        for i in range(rows):
            for j in range(cols):
                if matrix[i][j] == 1:  # Pared
                    y1 = i * cell_size
                    y2 = (i + 1) * cell_size
                    x1 = j * cell_size
                    x2 = (j + 1) * cell_size
                    image[y1:y2, x1:x2] = 0
        
        # Mostrar o guardar
        if output_path:
            cv2.imwrite(output_path, image)
            print(f"Visualización guardada en: {output_path}")
        else:
            cv2.imshow("Maze Matrix", image)
            cv2.waitKey(0)
            cv2.destroyAllWindows()

def main():
    """Función principal para procesar imágenes desde línea de comandos."""
    import sys
    
    if len(sys.argv) < 2:
        print("Uso: python image_processor.py <ruta_imagen> [tamaño_cuadrícula]")
        sys.exit(1)
    
    image_path = sys.argv[1]
    grid_size = None
    
    if len(sys.argv) > 2:
        try:
            size = int(sys.argv[2])
            grid_size = (size, size)
        except ValueError:
            print("El tamaño de cuadrícula debe ser un número entero")
    
    # Procesar imagen
    processor = MazeImageProcessor()
    
    try:
        # Cargar y procesar imagen
        gray = processor.load_image(image_path)
        binary = processor.binarize_image(gray)
        
        # Convertir a matriz
        matrix = processor.image_to_matrix(binary, grid_size)
        matrix = processor.clean_matrix(matrix)
        
        # Guardar resultados
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'data')
        output_file = os.path.join(output_dir, 'maze_from_image.json')
        processor.save_matrix(matrix, output_file)
        
        # Visualizar (opcional)
        viz_file = os.path.join(output_dir, 'maze_visualization.png')
        processor.visualize_matrix(matrix, viz_file)
        
        print(f"\nTamaño de la matriz: {len(matrix)}x{len(matrix[0])}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 