/**
 * @fileoverview Minimapa del laberinto
 * @module Minimap
 */

export class Minimap {
  /**
   * Constructor del minimapa
   * @param {HTMLCanvasElement} canvas - Canvas del minimapa
   * @param {Object} mazeData - Datos del laberinto
   */
  constructor(canvas, mazeData) {
    this.canvas = canvas;
    this.mazeData = mazeData;
    this.ctx = canvas.getContext('2d');

    // Configurar tamaño del canvas
    this.canvas.width = 200;
    this.canvas.height = 200;

    // Calcular tamaño de celda
    this.cellSize = Math.min(
      (this.canvas.width - 20) / this.mazeData.size,
      (this.canvas.height - 20) / this.mazeData.size
    );

    // Colores
    this.colors = {
      background: '#000000',
      wall: '#404040',
      player: '#00ff00',
      enemy: '#ff0000',
      key: '#ffff00',
      keyCollected: '#808080'
    };
  }

  /**
   * Actualiza el minimapa
   * @param {THREE.Vector3} playerPos - Posición del jugador
   * @param {THREE.Vector3} enemyPos - Posición del enemigo
   * @param {Array} collectedKeys - Índices de las llaves recolectadas
   */
  update(playerPos, enemyPos, collectedKeys = []) {
    // Limpiar canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar laberinto
    this.drawMaze();

    // Dibujar llaves
    this.drawKeys(collectedKeys);

    // Dibujar jugador
    this.drawPlayer(playerPos);

    // Dibujar enemigo
    this.drawEnemy(enemyPos);
  }

  /**
   * Dibuja el laberinto
   */
  drawMaze() {
    const offsetX = (this.canvas.width - this.mazeData.size * this.cellSize) / 2;
    const offsetY = (this.canvas.height - this.mazeData.size * this.cellSize) / 2;

    this.ctx.fillStyle = this.colors.wall;

    for (let y = 0; y < this.mazeData.size; y++) {
      for (let x = 0; x < this.mazeData.size; x++) {
        if (this.mazeData.maze[y][x] === 1) {
          this.ctx.fillRect(
            offsetX + x * this.cellSize,
            offsetY + y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }
  }

  /**
   * Dibuja las llaves
   * @param {Array} collectedKeys - Índices de las llaves recolectadas
   */
  drawKeys(collectedKeys) {
    if (!this.mazeData.keys) return;

    const offsetX = (this.canvas.width - this.mazeData.size * this.cellSize) / 2;
    const offsetY = (this.canvas.height - this.mazeData.size * this.cellSize) / 2;

    this.mazeData.keys.forEach((key, index) => {
      this.ctx.fillStyle = Array.isArray(collectedKeys) && collectedKeys.includes(index)
        ? this.colors.keyCollected
        : this.colors.key;

      const centerX = offsetX + key.x * this.cellSize + this.cellSize / 2;
      const centerY = offsetY + key.y * this.cellSize + this.cellSize / 2;
      const radius = this.cellSize / 3;

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * Dibuja al jugador
   * @param {THREE.Vector3} position - Posición del jugador
   */
  drawPlayer(position) {
    if (!position) return;

    const offsetX = (this.canvas.width - this.mazeData.size * this.cellSize) / 2;
    const offsetY = (this.canvas.height - this.mazeData.size * this.cellSize) / 2;

    const gridX = position.x / 2; // Convertir de unidades 3D a grid
    const gridZ = position.z / 2;

    this.ctx.fillStyle = this.colors.player;

    const centerX = offsetX + gridX * this.cellSize;
    const centerY = offsetY + gridZ * this.cellSize;
    const radius = this.cellSize / 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Dibuja al enemigo
   * @param {THREE.Vector3} position - Posición del enemigo
   */
  drawEnemy(position) {
    if (!position) return;

    const offsetX = (this.canvas.width - this.mazeData.size * this.cellSize) / 2;
    const offsetY = (this.canvas.height - this.mazeData.size * this.cellSize) / 2;

    const gridX = position.x / 2; // Convertir de unidades 3D a grid
    const gridZ = position.z / 2;

    this.ctx.fillStyle = this.colors.enemy;

    const centerX = offsetX + gridX * this.cellSize;
    const centerY = offsetY + gridZ * this.cellSize;
    const radius = this.cellSize / 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
} 