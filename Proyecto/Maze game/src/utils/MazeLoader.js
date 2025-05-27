/**
 * @fileoverview Cargador de datos del laberinto
 * @module MazeLoader
 */

export class MazeLoader {
  constructor() {
    this.cache = new Map();
  }

  async load(path) {
    // Verificar caché
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validar estructura de datos
      if (!this.validateMazeData(data)) {
        throw new Error('Invalid maze data structure');
      }

      // Guardar en caché
      this.cache.set(path, data);

      return data;
    } catch (error) {
      console.error('Error loading maze:', error);
      return null;
    }
  }

  validateMazeData(data) {
    // Verificar propiedades requeridas
    if (!data.size || !data.maze || !data.start || !data.end) {
      return false;
    }

    // Verificar tamaño
    if (data.size <= 0 || !Number.isInteger(data.size)) {
      return false;
    }

    // Verificar matriz del laberinto
    if (!Array.isArray(data.maze) || data.maze.length !== data.size) {
      return false;
    }

    for (const row of data.maze) {
      if (!Array.isArray(row) || row.length !== data.size) {
        return false;
      }

      for (const cell of row) {
        if (cell !== 0 && cell !== 1 && cell !== 2) {
          return false;
        }
      }
    }

    // Verificar puntos de inicio y fin
    if (!this.isValidPosition(data.start, data.size) ||
      !this.isValidPosition(data.end, data.size)) {
      return false;
    }

    // Verificar llaves si existen
    if (data.keys) {
      if (!Array.isArray(data.keys)) {
        return false;
      }

      for (const key of data.keys) {
        if (!this.isValidPosition(key, data.size)) {
          return false;
        }
      }
    }

    return true;
  }

  isValidPosition(pos, size) {
    return pos &&
      typeof pos.x === 'number' &&
      typeof pos.y === 'number' &&
      pos.x >= 0 && pos.x < size &&
      pos.y >= 0 && pos.y < size;
  }

  clearCache() {
    this.cache.clear();
  }
} 