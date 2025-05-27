/**
 * @fileoverview IA del enemigo que persigue al jugador
 * @module EnemyAI
 */

import * as THREE from 'three';

export class EnemyAI {
  constructor(scene, mazeData) {
    this.scene = scene;
    this.mazeData = mazeData;

    // Configuración del enemigo
    this.moveSpeed = 3;
    this.height = 2;
    this.detectionRadius = 10;

    // Estado del enemigo
    this.position = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.path = [];
    this.currentPathIndex = 0;

    // Crear modelo del enemigo
    this.createEnemyModel();
  }

  createEnemyModel() {
    // Grupo para el modelo del enemigo
    this.model = new THREE.Group();

    // Cuerpo
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0x330000,
      emissiveIntensity: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    this.model.add(body);

    // Ojos
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.3, 0.4);
    this.model.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.3, 0.4);
    this.model.add(rightEye);

    // Pupilas
    const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.2, 0.3, 0.5);
    this.model.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.2, 0.3, 0.5);
    this.model.add(rightPupil);

    // Agregar a la escena
    this.scene.add(this.model);
  }

  setTarget(targetPosition) {
    this.target.copy(targetPosition);

    // Recalcular ruta si el jugador está dentro del radio de detección
    const distance = this.position.distanceTo(this.target);
    if (distance <= this.detectionRadius) {
      this.calculatePath();
    }
  }

  getPosition() {
    return this.position;
  }

  calculatePath() {
    // Convertir posiciones a coordenadas de grilla
    const start = this.worldToGrid(this.position.x, this.position.z);
    const end = this.worldToGrid(this.target.x, this.target.z);

    // Implementar A* pathfinding
    this.path = this.aStar(start, end);
    this.currentPathIndex = 0;
  }

  aStar(start, end) {
    const openSet = [start];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    // Inicializar scores
    gScore.set(this.gridToString(start), 0);
    fScore.set(this.gridToString(start), this.heuristic(start, end));

    while (openSet.length > 0) {
      // Encontrar nodo con menor fScore
      let current = openSet.reduce((a, b) =>
        fScore.get(this.gridToString(a)) < fScore.get(this.gridToString(b)) ? a : b
      );

      // Llegamos al objetivo
      if (this.gridToString(current) === this.gridToString(end)) {
        return this.reconstructPath(cameFrom, current);
      }

      // Remover actual del openSet y agregar a closedSet
      openSet.splice(openSet.indexOf(current), 1);
      closedSet.add(this.gridToString(current));

      // Revisar vecinos
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (closedSet.has(this.gridToString(neighbor))) continue;

        const tentativeGScore = gScore.get(this.gridToString(current)) + 1;

        if (!openSet.some(n => this.gridToString(n) === this.gridToString(neighbor))) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= gScore.get(this.gridToString(neighbor))) {
          continue;
        }

        cameFrom.set(this.gridToString(neighbor), current);
        gScore.set(this.gridToString(neighbor), tentativeGScore);
        fScore.set(this.gridToString(neighbor),
          tentativeGScore + this.heuristic(neighbor, end));
      }
    }

    return []; // No se encontró ruta
  }

  getNeighbors(node) {
    const neighbors = [];
    const directions = [
      { x: 0, z: -1 }, // Norte
      { x: 1, z: 0 },  // Este
      { x: 0, z: 1 },  // Sur
      { x: -1, z: 0 }  // Oeste
    ];

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newZ = node.z + dir.z;

      if (newX >= 0 && newX < this.mazeData.size &&
        newZ >= 0 && newZ < this.mazeData.size &&
        this.mazeData.maze[newZ][newX] === 0) {
        neighbors.push({ x: newX, z: newZ });
      }
    }

    return neighbors;
  }

  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
  }

  gridToString(grid) {
    return `${grid.x},${grid.z}`;
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentStr = this.gridToString(current);

    while (cameFrom.has(currentStr)) {
      current = cameFrom.get(currentStr);
      path.unshift(current);
      currentStr = this.gridToString(current);
    }

    return path;
  }

  worldToGrid(x, z) {
    return {
      x: Math.floor(x / 2),
      z: Math.floor(z / 2)
    };
  }

  gridToWorld(grid) {
    return {
      x: grid.x * 2 + 1,
      z: grid.z * 2 + 1
    };
  }

  update(deltaTime) {
    if (this.path.length === 0) return;

    // Obtener siguiente punto en el camino
    const nextPoint = this.path[this.currentPathIndex];
    const worldPos = this.gridToWorld(nextPoint);

    // Calcular dirección al siguiente punto
    const direction = new THREE.Vector3(
      worldPos.x - this.position.x,
      0,
      worldPos.z - this.position.z
    ).normalize();

    // Mover hacia el punto
    this.position.x += direction.x * this.moveSpeed * deltaTime;
    this.position.z += direction.z * this.moveSpeed * deltaTime;

    // Actualizar modelo
    this.model.position.copy(this.position);
    this.model.position.y = this.height;

    // Rotar modelo hacia la dirección de movimiento
    if (direction.length() > 0) {
      this.model.rotation.y = Math.atan2(direction.x, direction.z);
    }

    // Verificar si llegamos al punto actual
    const distance = this.position.distanceTo(new THREE.Vector3(worldPos.x, this.height, worldPos.z));
    if (distance < 0.5) {
      this.currentPathIndex++;
      if (this.currentPathIndex >= this.path.length) {
        this.path = [];
      }
    }
  }

  reset() {
    // Reiniciar posición y estado
    this.position.set(0, this.height, 0);
    this.path = [];
    this.currentPathIndex = 0;
    this.model.position.copy(this.position);
  }
} 