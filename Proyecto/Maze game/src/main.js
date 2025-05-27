/**
 * @fileoverview Archivo principal del juego de laberinto 3D
 * @module main
 */

import * as THREE from 'three';
import { MazeRenderer } from './components/MazeRenderer.js';
import { PlayerController } from './components/PlayerController.js';
import { EnemyAI } from './ai/EnemyAI.js';
import { VisionDetector } from './vision/VisionDetector.js';
import { GameState } from './utils/GameState.js';
import { MazeLoader } from './utils/MazeLoader.js';
import { Minimap } from './components/Minimap.js';

/**
 * Clase principal del juego
 */
class MazeGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    this.mazeData = null;
    this.mazeRenderer = null;
    this.playerController = null;
    this.enemyAI = null;
    this.visionDetector = null;
    this.gameState = null;
    this.minimap = null;

    this.renderTarget = null;
    this.isRunning = false;
  }

  /**
   * Inicializa el juego
   */
  async init() {
    try {
      // Configurar Three.js
      this.setupThreeJS();

      // Cargar el laberinto
      await this.loadMaze();

      // Inicializar componentes
      this.setupComponents();

      // Configurar eventos
      this.setupEvents();

      // Ocultar pantalla de carga
      document.getElementById('loading').style.display = 'none';

      // Iniciar el juego
      this.start();

    } catch (error) {
      console.error('Error al inicializar el juego:', error);
      document.getElementById('loading').textContent = 'Error al cargar el juego';
    }
  }

  /**
   * Configura Three.js
   */
  setupThreeJS() {
    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000033);
    this.scene.fog = new THREE.Fog(0x000033, 0, 50);

    // Crear cámara
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 2, 5); // Posición inicial de la cámara

    // Crear renderer
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('No se encontró el elemento canvas');
      return;
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Crear render target para visión por computadora
    this.renderTarget = new THREE.WebGLRenderTarget(512, 512);

    // Agregar luces
    this.setupLights();

    // Agregar event listener para redimensionamiento
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * Configura las luces de la escena
   */
  setupLights() {
    // Luz ambiental más brillante
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    this.scene.add(ambientLight);

    // Luz direccional (sol) más brillante
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Luz puntual para el jugador más brillante
    this.playerLight = new THREE.PointLight(0xffff00, 1.5, 10);
    this.playerLight.castShadow = true;
    this.scene.add(this.playerLight);
  }

  /**
   * Carga los datos del laberinto
   */
  async loadMaze() {
    const loader = new MazeLoader();
    this.mazeData = await loader.load('/data/maze.json');

    if (!this.mazeData) {
      // Si no hay laberinto guardado, generar uno nuevo
      console.log('Generando laberinto nuevo...');
      // Aquí se podría llamar al generador de Python vía API
      // Por ahora usaremos datos de ejemplo
      this.mazeData = this.generateDefaultMaze();
    }
  }

  /**
   * Genera un laberinto por defecto
   */
  generateDefaultMaze() {
    const size = 15;
    const maze = [];

    // Crear un laberinto simple para pruebas
    for (let i = 0; i < size; i++) {
      maze[i] = [];
      for (let j = 0; j < size; j++) {
        // Bordes son paredes
        if (i === 0 || i === size - 1 || j === 0 || j === size - 1) {
          maze[i][j] = 1;
        } else {
          // Interior aleatorio con más pasillos
          maze[i][j] = Math.random() > 0.7 ? 1 : 0;
        }
      }
    }

    // Asegurar entrada y salida
    maze[1][1] = 0; // Entrada
    maze[size - 2][size - 2] = 0; // Salida

    // Asegurar que hay camino a las posiciones de las llaves
    const keyPositions = [
      { x: 3, y: 3 },
      { x: size - 3, y: 3 },
      { x: Math.floor(size / 2), y: Math.floor(size / 2) }
    ];

    // Limpiar caminos alrededor de las llaves
    keyPositions.forEach(pos => {
      maze[pos.y][pos.x] = 0; // Posición de la llave
      // Limpiar alrededor de la llave
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const newY = pos.y + dy;
          const newX = pos.x + dx;
          if (newY > 0 && newY < size - 1 && newX > 0 && newX < size - 1) {
            maze[newY][newX] = 0;
          }
        }
      }
    });

    // Asegurar camino desde la entrada a cada llave y a la salida
    const createPath = (start, end) => {
      let x = start.x;
      let y = start.y;
      while (x !== end.x || y !== end.y) {
        maze[y][x] = 0;
        if (x < end.x) x++;
        else if (x > end.x) x--;
        if (y < end.y) y++;
        else if (y > end.y) y--;
      }
      maze[end.y][end.x] = 0;
    };

    // Crear caminos desde la entrada a cada llave
    const start = { x: 1, y: 1 };
    const end = { x: size - 2, y: size - 2 };
    keyPositions.forEach(key => {
      createPath(start, key);
      createPath(key, end);
    });

    return {
      size,
      maze,
      start: { x: 1, y: 1 },
      end: { x: size - 2, y: size - 2 },
      keys: keyPositions
    };
  }

  /**
   * Configura los componentes del juego
   */
  setupComponents() {
    // Estado del juego
    this.gameState = new GameState();
    this.gameState.setTotalKeys(this.mazeData.keys ? this.mazeData.keys.length : 0);

    // Renderizador del laberinto
    this.mazeRenderer = new MazeRenderer(this.scene, this.mazeData);
    this.mazeRenderer.create();

    // Controlador del jugador
    this.playerController = new PlayerController(
      this.camera,
      this.scene,
      this.mazeData
    );
    this.playerController.setPosition(
      this.mazeData.start.x * 2,  // Multiplicar por el tamaño de celda (2)
      this.mazeData.start.y * 2   // Multiplicar por el tamaño de celda (2)
    );

    // IA del enemigo
    this.enemyAI = new EnemyAI(this.scene, this.mazeData);
    this.enemyAI.setTarget(this.playerController.getPosition());

    // Detector de visión
    this.visionDetector = new VisionDetector(
      this.renderer,
      this.renderTarget
    );

    // Minimapa
    const minimapCanvas = document.getElementById('minimap');
    this.minimap = new Minimap(minimapCanvas, this.mazeData);
  }

  /**
   * Configura los eventos del juego
   */
  setupEvents() {
    // Redimensionar ventana
    window.addEventListener('resize', () => this.onWindowResize());

    // Eventos del teclado
    window.addEventListener('keydown', (e) => this.onKeyDown(e));

    // Reiniciar juego
    window.restartGame = () => this.restart();
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Maneja las teclas presionadas
   */
  onKeyDown(event) {
    if (event.key === 'Escape') {
      this.togglePause();
    }
  }

  /**
   * Alterna pausa del juego
   */
  togglePause() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.clock.start();
    } else {
      this.clock.stop();
    }
  }

  /**
   * Inicia el juego
   */
  start() {
    this.isRunning = true;
    this.gameState.startGame();
    this.animate();
  }

  /**
   * Bucle principal de animación
   */
  animate() {
    if (!this.isRunning) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Actualizar componentes
    this.update(deltaTime, elapsedTime);

    // Renderizar escena
    this.render();

    // Continuar animación
    requestAnimationFrame(() => this.animate());
  }

  /**
   * Actualiza la lógica del juego
   */
  update(deltaTime, elapsedTime) {
    // Actualizar controlador del jugador
    this.playerController.update(deltaTime);

    // Actualizar posición de la luz del jugador
    const playerPos = this.playerController.getPosition();
    this.playerLight.position.copy(playerPos);
    this.playerLight.position.y += 2;

    // Actualizar IA del enemigo
    this.enemyAI.setTarget(playerPos);
    this.enemyAI.update(deltaTime);

    // Verificar colisiones con llaves
    this.checkKeyCollisions();

    // Verificar si el enemigo atrapó al jugador
    this.checkEnemyCollision();

    // Actualizar minimapa
    this.minimap.update(
      playerPos,
      this.enemyAI.getPosition(),
      this.gameState.getCollectedKeys()
    );

    // Actualizar UI
    this.updateUI(elapsedTime);

    // Detección de visión (cada 10 frames)
    if (Math.floor(elapsedTime * 60) % 10 === 0) {
      this.performVisionDetection();
    }
  }

  /**
   * Verifica colisiones con las llaves
   */
  checkKeyCollisions() {
    const playerPos = this.playerController.getPosition();
    const keys = this.mazeRenderer.getKeys();

    keys.forEach((key, index) => {
      if (!key.userData.collected) {
        const distance = playerPos.distanceTo(key.position);
        if (distance < 1) {
          // Recolectar llave
          key.userData.collected = true;
          key.visible = false;
          this.gameState.collectKey();

          // Verificar victoria
          if (this.gameState.hasAllKeys()) {
            this.victory();
          }
        }
      }
    });
  }

  /**
   * Verifica colisión con el enemigo
   */
  checkEnemyCollision() {
    const playerPos = this.playerController.getPosition();
    const enemyPos = this.enemyAI.getPosition();

    const distance = playerPos.distanceTo(enemyPos);
    if (distance < 1) {
      this.gameOver();
    }
  }

  /**
   * Realiza detección de visión
   */
  performVisionDetection() {
    // Renderizar a render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // Analizar frame con visión por computadora
    this.visionDetector.detectObjects(this.renderTarget);
  }

  /**
   * Actualiza la interfaz de usuario
   */
  updateUI(elapsedTime) {
    // Actualizar llaves
    document.getElementById('keysCollected').textContent =
      this.gameState.getCollectedKeys();
    document.getElementById('totalKeys').textContent =
      this.mazeData.keys.length;

    // Actualizar tiempo
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    document.getElementById('gameTime').textContent =
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Actualizar FPS
    const fps = Math.round(1 / this.clock.getDelta());
    document.getElementById('fps').textContent = fps;
  }

  /**
   * Renderiza la escena
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Maneja el game over
   */
  gameOver() {
    this.isRunning = false;
    this.gameState.endGame(false);
    document.getElementById('gameOver').style.display = 'block';
  }

  /**
   * Maneja la victoria
   */
  victory() {
    this.isRunning = false;
    this.gameState.endGame(true);

    const time = document.getElementById('gameTime').textContent;
    document.getElementById('finalTime').textContent = time;
    document.getElementById('victory').style.display = 'block';
  }

  /**
   * Reinicia el juego
   */
  restart() {
    // Ocultar pantallas de fin de juego
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';

    // Reiniciar estado
    this.gameState.reset();

    // Reiniciar posiciones
    this.playerController.setPosition(
      this.mazeData.start.x * 2,  // Multiplicar por el tamaño de celda (2)
      this.mazeData.start.y * 2   // Multiplicar por el tamaño de celda (2)
    );
    this.enemyAI.reset();

    // Reiniciar llaves
    this.mazeRenderer.resetKeys();

    // Reiniciar reloj
    this.clock.start();

    // Continuar juego
    this.isRunning = true;
  }
}

// Iniciar el juego cuando se cargue la página
window.addEventListener('DOMContentLoaded', () => {
  const game = new MazeGame();
  game.init();
}); 