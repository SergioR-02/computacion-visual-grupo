/**
 * @fileoverview Renderizador del laberinto en 3D
 * @module MazeRenderer
 */

import * as THREE from 'three';

/**
 * Clase para renderizar el laberinto en 3D
 */
export class MazeRenderer {
  /**
   * Constructor del renderizador
   * @param {THREE.Scene} scene - Escena de Three.js
   * @param {Object} mazeData - Datos del laberinto
   */
  constructor(scene, mazeData) {
    this.scene = scene;
    this.mazeData = mazeData;
    this.cellSize = 2; // Tamaño de cada celda
    this.wallHeight = 3; // Altura de las paredes

    this.walls = [];
    this.floor = null;
    this.keys = [];

    // Materiales
    this.materials = this.createMaterials();
  }

  /**
   * Crea los materiales para el laberinto
   */
  createMaterials() {
    return {
      wall: new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.7,
        metalness: 0.2,
        side: THREE.DoubleSide
      }),
      floor: new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.FrontSide
      }),
      key: new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0xffd700,
        emissiveIntensity: 0.2
      })
    };
  }

  /**
   * Crea el laberinto completo
   */
  create() {
    this.createFloor();
    this.createWalls();
    this.createKeys();
    this.createStartEnd();
  }

  /**
   * Crea el suelo del laberinto
   */
  createFloor() {
    const size = this.mazeData.size * this.cellSize;
    const geometry = new THREE.PlaneGeometry(size, size, size, size);
    const floor = new THREE.Mesh(geometry, this.materials.floor);

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.position.x = size / 2 - this.cellSize / 2;
    floor.position.z = size / 2 - this.cellSize / 2;
    floor.receiveShadow = true;

    // Agregar algo de detalle al suelo
    const textureSize = 512;
    const data = new Uint8Array(textureSize * textureSize * 4);
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 32;
      data[i] = 64 + noise;     // R
      data[i + 1] = 64 + noise; // G
      data[i + 2] = 64 + noise; // B
      data[i + 3] = 255;        // A
    }
    const noiseTexture = new THREE.DataTexture(data, textureSize, textureSize);
    noiseTexture.needsUpdate = true;
    this.materials.floor.map = noiseTexture;

    this.floor = floor;
    this.scene.add(floor);
  }

  /**
   * Crea las paredes del laberinto
   */
  createWalls() {
    const maze = this.mazeData.maze;
    const size = this.mazeData.size;

    // Grupo para todas las paredes
    const wallGroup = new THREE.Group();

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (maze[row][col] === 1) {
          // Crear pared
          const wall = this.createWall(col, row);
          this.walls.push(wall);
          wallGroup.add(wall);
        }
      }
    }

    this.scene.add(wallGroup);
  }

  /**
   * Crea una pared individual
   * @param {number} x - Posición X en la grilla
   * @param {number} z - Posición Z en la grilla
   * @returns {THREE.Mesh} Mesh de la pared
   */
  createWall(x, z) {
    const geometry = new THREE.BoxGeometry(this.cellSize, this.wallHeight, this.cellSize);
    const wall = new THREE.Mesh(geometry, this.materials.wall);

    wall.position.x = x * this.cellSize;
    wall.position.y = this.wallHeight / 2;
    wall.position.z = z * this.cellSize;
    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall;
  }

  /**
   * Crea las llaves del laberinto
   */
  createKeys() {
    const keys = this.mazeData.keys;
    if (!Array.isArray(keys)) {
      console.warn('No hay llaves definidas en el laberinto');
      return;
    }

    keys.forEach((keyPos, index) => {
      if (!keyPos || typeof keyPos.x !== 'number' || typeof keyPos.y !== 'number') {
        console.warn(`Llave ${index} mal formada:`, keyPos);
        return;
      }

      const key = this.createKey(keyPos.x, keyPos.y);
      if (key) {
        key.userData = {
          index,
          collected: false,
          originalPosition: key.position.clone(),
          floatOffset: Math.random() * Math.PI * 2,
          animate: (time) => {
            if (!key.userData.collected) {
              key.position.y = this.wallHeight / 2 + Math.sin(time + key.userData.floatOffset) * 0.2;
              key.rotation.y = time;
            }
          }
        };
        this.keys.push(key);
      }
    });
  }

  /**
   * Crea una llave individual
   * @param {number} x - Posición X
   * @param {number} z - Posición Z
   * @returns {THREE.Mesh} Mesh de la llave
   */
  createKey(x, z) {
    if (typeof x !== 'number' || typeof z !== 'number') {
      console.warn('Coordenadas de llave inválidas:', { x, z });
      return null;
    }

    const geometry = new THREE.TorusGeometry(0.3, 0.1, 16, 32);
    const key = new THREE.Mesh(geometry, this.materials.key);

    key.position.x = x * this.cellSize;
    key.position.y = this.wallHeight / 2;
    key.position.z = z * this.cellSize;
    key.castShadow = true;
    key.receiveShadow = true;

    // Agregar animación de flotación
    key.userData = {
      update: (time) => {
        if (key.userData.floatOffset !== undefined) {
          key.position.y = this.wallHeight / 2 + Math.sin(time + key.userData.floatOffset) * 0.2;
          key.rotation.y = time;
        }
      }
    };

    this.scene.add(key);
    return key;
  }

  /**
   * Crea marcadores de inicio y fin
   */
  createStartEnd() {
    // Marcador de inicio
    const startGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1);
    const start = new THREE.Mesh(startGeometry, this.materials.start);
    start.position.x = this.mazeData.start.x * this.cellSize;
    start.position.y = 0.05;
    start.position.z = this.mazeData.start.y * this.cellSize;
    this.scene.add(start);

    // Marcador de fin
    const endGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1);
    const end = new THREE.Mesh(endGeometry, this.materials.end);
    end.position.x = this.mazeData.end.x * this.cellSize;
    end.position.y = 0.05;
    end.position.z = this.mazeData.end.y * this.cellSize;
    this.scene.add(end);
  }

  /**
   * Actualiza las animaciones
   * @param {number} time - Tiempo transcurrido
   */
  update(time) {
    // Animar llaves
    this.keys.forEach(key => {
      if (!key.userData.collected && key.userData.animate) {
        key.userData.animate(time);
      }
    });
  }

  /**
   * Obtiene las llaves del laberinto
   * @returns {Array} Array de llaves
   */
  getKeys() {
    return this.keys;
  }

  /**
   * Reinicia las llaves
   */
  resetKeys() {
    this.keys.forEach(key => {
      key.visible = true;
      key.userData.collected = false;
      key.position.copy(key.userData.originalPosition);
    });
  }

  /**
   * Verifica si una posición es una pared
   * @param {number} x - Posición X en la grilla
   * @param {number} z - Posición Z en la grilla
   * @returns {boolean} True si es pared
   */
  isWall(x, z) {
    const gridX = Math.round(x / this.cellSize);
    const gridZ = Math.round(z / this.cellSize);

    if (gridX < 0 || gridX >= this.mazeData.size ||
      gridZ < 0 || gridZ >= this.mazeData.size) {
      return true;
    }

    return this.mazeData.maze[gridZ][gridX] === 1;
  }

  /**
   * Convierte coordenadas del mundo a grilla
   * @param {number} worldX - Coordenada X del mundo
   * @param {number} worldZ - Coordenada Z del mundo
   * @returns {Object} Coordenadas de grilla
   */
  worldToGrid(worldX, worldZ) {
    return {
      x: Math.floor(worldX / this.cellSize),
      z: Math.floor(worldZ / this.cellSize)
    };
  }

  /**
   * Convierte coordenadas de grilla a mundo
   * @param {number} gridX - Coordenada X de grilla
   * @param {number} gridZ - Coordenada Z de grilla
   * @returns {Object} Coordenadas del mundo
   */
  gridToWorld(gridX, gridZ) {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      z: gridZ * this.cellSize + this.cellSize / 2
    };
  }
} 