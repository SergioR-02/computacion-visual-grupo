/**
 * @fileoverview Controlador del jugador y la cámara
 * @module PlayerController
 */

import * as THREE from 'three';

export class PlayerController {
  constructor(camera, scene, mazeData) {
    this.camera = camera;
    this.scene = scene;
    this.mazeData = mazeData;

    // Configuración del jugador
    this.moveSpeed = 2.5;
    this.rotateSpeed = 0.002;
    this.height = 1.7;

    // Estado del jugador
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Controles
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;

    // Configurar eventos
    this.setupControls();
  }

  setupControls() {
    // Bloquear el puntero del mouse
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });

    // Eventos de teclado
    const onKeyDown = (event) => {
      if (event.repeat) return;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Eventos del mouse
    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement === canvas) {
        this.rotation.y -= event.movementX * this.rotateSpeed;
        this.rotation.x -= event.movementY * this.rotateSpeed;

        // Limitar rotación vertical
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
      }
    });

    // Manejar cambios en el pointer lock
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== canvas) {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
      }
    });
  }

  setPosition(x, z) {
    this.position.set(x, this.height, z);
    this.updateCamera();
  }

  getPosition() {
    return this.position;
  }

  update(deltaTime) {
    // Calcular dirección de movimiento
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    // Aplicar rotación a la dirección
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationY(this.rotation.y);
    this.direction.applyMatrix4(rotationMatrix);

    // Calcular velocidad
    this.velocity.x = this.direction.x * this.moveSpeed * deltaTime;
    this.velocity.z = this.direction.z * this.moveSpeed * deltaTime;

    // Verificar colisiones antes de mover
    const newPosition = this.position.clone();
    newPosition.x += this.velocity.x;
    newPosition.z += this.velocity.z;

    // Actualizar posición si no hay colisión
    if (!this.checkCollision(newPosition)) {
      this.position.copy(newPosition);
    }

    // Actualizar cámara
    this.updateCamera();
  }

  checkCollision(newPosition) {
    // Convertir posición a coordenadas de grilla
    const gridX = Math.floor(newPosition.x / 2);
    const gridZ = Math.floor(newPosition.z / 2);

    // Verificar límites del laberinto
    if (gridX < 0 || gridX >= this.mazeData.size ||
      gridZ < 0 || gridZ >= this.mazeData.size) {
      return true;
    }

    // Verificar si hay pared (con margen de colisión)
    const margin = 0.3; // Margen de colisión
    const cellX = newPosition.x / 2;
    const cellZ = newPosition.z / 2;

    // Verificar las celdas adyacentes
    const checkCells = [
      [Math.floor(cellX), Math.floor(cellZ)],
      [Math.floor(cellX + margin), Math.floor(cellZ)],
      [Math.floor(cellX - margin), Math.floor(cellZ)],
      [Math.floor(cellX), Math.floor(cellZ + margin)],
      [Math.floor(cellX), Math.floor(cellZ - margin)]
    ];

    return checkCells.some(([x, z]) => {
      if (x < 0 || x >= this.mazeData.size || z < 0 || z >= this.mazeData.size) {
        return true;
      }
      return this.mazeData.maze[z][x] === 1;
    });
  }

  updateCamera() {
    // Actualizar posición de la cámara
    this.camera.position.copy(this.position);

    // Actualizar rotación de la cámara
    this.camera.rotation.copy(this.rotation);
  }
} 