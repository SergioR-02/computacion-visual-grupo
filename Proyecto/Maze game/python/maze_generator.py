#!/usr/bin/env python3
"""
Generador de laberintos usando el algoritmo DFS (Depth-First Search) con backtracking.
Genera laberintos perfectos en una matriz cuadrada y los exporta a JSON.
"""

import json
import random
from typing import List, Tuple, Dict
import os
import sys

class MazeGenerator:
    """
    Clase para generar laberintos usando DFS con backtracking.
    
    Attributes:
        size (int): Tamaño del laberinto (size x size)
        maze (List[List[int]]): Matriz del laberinto (0 = pasillo, 1 = pared)
    """
    
    def __init__(self, size: int = 25):
        """
        Inicializa el generador de laberintos.
        
        Args:
            size (int): Tamaño del laberinto (debe ser impar)
        """
        # Asegurarse de que el tamaño sea impar para el algoritmo
        self.size = size if size % 2 == 1 else size + 1
        self.maze = [[1 for _ in range(self.size)] for _ in range(self.size)]
        
    def generate(self) -> List[List[int]]:
        """
        Genera un laberinto perfecto usando DFS con backtracking.
        
        Returns:
            List[List[int]]: Matriz del laberinto generado
        """
        # Empezar desde la esquina superior izquierda
        start_x, start_y = 1, 1
        self.maze[start_y][start_x] = 0
        
        # Stack para el backtracking
        stack = [(start_x, start_y)]
        
        while stack:
            current_x, current_y = stack[-1]
            
            # Obtener vecinos no visitados
            neighbors = self._get_unvisited_neighbors(current_x, current_y)
            
            if neighbors:
                # Elegir un vecino aleatorio
                next_x, next_y = random.choice(neighbors)
                
                # Remover la pared entre las celdas
                wall_x = (current_x + next_x) // 2
                wall_y = (current_y + next_y) // 2
                self.maze[wall_y][wall_x] = 0
                self.maze[next_y][next_x] = 0
                
                # Agregar el nuevo nodo al stack
                stack.append((next_x, next_y))
            else:
                # Backtrack si no hay vecinos no visitados
                stack.pop()
        
        # Establecer entrada y salida
        self.maze[1][0] = 0  # Entrada (izquierda arriba)
        self.maze[self.size - 2][self.size - 1] = 0  # Salida (derecha abajo)
        
        return self.maze
    
    def _get_unvisited_neighbors(self, x: int, y: int) -> List[Tuple[int, int]]:
        """
        Obtiene los vecinos no visitados de una celda.
        
        Args:
            x (int): Coordenada x de la celda
            y (int): Coordenada y de la celda
            
        Returns:
            List[Tuple[int, int]]: Lista de coordenadas de vecinos no visitados
        """
        neighbors = []
        directions = [(0, -2), (2, 0), (0, 2), (-2, 0)]  # N, E, S, W
        
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            
            # Verificar límites y si la celda no ha sido visitada
            if (1 <= nx < self.size - 1 and 
                1 <= ny < self.size - 1 and 
                self.maze[ny][nx] == 1):
                neighbors.append((nx, ny))
        
        return neighbors
    
    def add_keys(self, num_keys: int = 3) -> List[Dict[str, int]]:
        """
        Añade llaves al laberinto en posiciones aleatorias.
        
        Args:
            num_keys (int): Número de llaves a colocar
            
        Returns:
            List[Dict[str, int]]: Lista de posiciones de las llaves
        """
        keys = []
        empty_cells = []
        
        # Encontrar todas las celdas vacías
        for y in range(self.size):
            for x in range(self.size):
                if self.maze[y][x] == 0 and (x, y) not in [(1, 1), (self.size - 2, self.size - 2)]:
                    empty_cells.append((x, y))
        
        # Seleccionar posiciones aleatorias para las llaves
        if len(empty_cells) >= num_keys:
            key_positions = random.sample(empty_cells, num_keys)
            for x, y in key_positions:
                keys.append({"x": x, "y": y})
                # Marcar las llaves con valor 2 en la matriz
                self.maze[y][x] = 2
        
        return keys
    
    def to_json(self, filename: str = None) -> str:
        """
        Exporta el laberinto a formato JSON.
        
        Args:
            filename (str): Nombre del archivo (opcional)
            
        Returns:
            str: String JSON del laberinto
        """
        data = {
            "size": self.size,
            "maze": self.maze,
            "start": {"x": 1, "y": 1},
            "end": {"x": self.size - 2, "y": self.size - 2},
            "keys": []
        }
        
        # Encontrar las posiciones de las llaves
        for y in range(self.size):
            for x in range(self.size):
                if self.maze[y][x] == 2:
                    data["keys"].append({"x": x, "y": y})
        
        json_str = json.dumps(data, indent=2)
        
        if filename:
            # Asegurarse de que el directorio existe
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            with open(filename, 'w') as f:
                f.write(json_str)
            print(f"Laberinto guardado en: {filename}")
        
        return json_str

def main():
    """Función principal para generar laberintos desde línea de comandos."""
    size = 25  # Tamaño por defecto
    
    if len(sys.argv) > 1:
        try:
            size = int(sys.argv[1])
        except ValueError:
            print(f"Error: El tamaño debe ser un número entero. Usando tamaño por defecto: {size}")
    
    # Generar el laberinto
    generator = MazeGenerator(size)
    maze = generator.generate()
    
    # Añadir llaves
    keys = generator.add_keys(3)
    
    # Guardar el laberinto
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'data')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'maze.json')
    
    generator.to_json(output_file)
    
    # Imprimir el laberinto en consola (opcional)
    print("\nLaberinto generado:")
    for row in maze:
        print(' '.join(['█' if cell == 1 else '·' if cell == 0 else '★' for cell in row]))
    
    print(f"\nTamaño: {size}x{size}")
    print(f"Llaves: {len(keys)}")
    print(f"Archivo guardado: {output_file}")

if __name__ == "__main__":
    main() 