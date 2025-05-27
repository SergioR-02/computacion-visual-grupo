# Maze Game 3D

Un juego de laberinto 3D con generación procedural, enemigos con IA y detección por visión por computadora.

## 🎮 Características

- **Laberinto 3D**: Generación procedural de laberintos usando algoritmos de backtracking
- **Gráficos 3D**: Renderizado con Three.js y efectos visuales avanzados
- **IA Enemiga**: Sistema de pathfinding A* para persecución inteligente
- **Visión por Computadora**: Detección de objetos usando TensorFlow.js
- **Minimapa**: Vista superior en tiempo real del laberinto
- **Sistema de Llaves**: Colecciona todas las llaves para ganar
- **Iluminación Dinámica**: Sombras y efectos de luz en tiempo real

## 🛠️ Tecnologías Utilizadas

- **Frontend**:
  - Three.js para gráficos 3D
  - TensorFlow.js para visión por computadora
  - Vite como bundler y servidor de desarrollo

- **Backend**:
  - Python para generación de laberintos
  - OpenCV para procesamiento de imágenes
  - NumPy para operaciones matemáticas

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- Python 3.8 o superior
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd maze-game
   ```

2. **Instalar dependencias de Node.js**:
   ```bash
   npm install
   ```

3. **Instalar dependencias de Python**:
   ```bash
   pip install -r python/requirements.txt
   ```

## 🎯 Uso

1. **Generar un nuevo laberinto**:
   ```bash
   npm run generate-maze
   ```

2. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir el juego**:
   Navega a `http://localhost:5173` en tu navegador

## 🎮 Controles

- **W/A/S/D**: Movimiento del jugador
- **Mouse**: Control de la cámara
- **ESC**: Pausar/Reanudar juego
- **R**: Reiniciar nivel

## 🏗️ Estructura del Proyecto

```
maze-game/
├── src/
│   ├── components/         # Componentes del juego
│   │   ├── MazeRenderer.js # Renderizado del laberinto
│   │   ├── PlayerController.js # Control del jugador
│   │   └── Minimap.js     # Minimapa
│   ├── ai/
│   │   └── EnemyAI.js     # IA del enemigo
│   ├── vision/
│   │   └── VisionDetector.js # Detección por visión
│   ├── utils/
│   │   ├── GameState.js   # Estado del juego
│   │   └── MazeLoader.js  # Cargador de laberintos
│   └── main.js            # Punto de entrada
├── python/
│   ├── maze_generator.py  # Generador de laberintos
│   └── image_processor.py # Procesador de imágenes
├── public/
│   └── data/             # Datos del laberinto
└── package.json          # Dependencias y scripts
```

## 🔧 Componentes Principales

### MazeGame (main.js)
- Clase principal que coordina todos los componentes
- Maneja el ciclo de juego y la lógica principal
- Gestiona estados y eventos del juego

### MazeRenderer
- Renderiza el laberinto en 3D
- Maneja materiales y texturas
- Gestiona la iluminación y sombras

### PlayerController
- Control del jugador en primera persona
- Detección de colisiones
- Manejo de entrada de usuario

### EnemyAI
- Implementa pathfinding A*
- Persigue al jugador
- Ajusta dificultad dinámicamente

### VisionDetector
- Integración con TensorFlow.js
- Detección de objetos en tiempo real
- Procesamiento de frames del juego

## 🎨 Características Visuales

- **Materiales PBR**: Materiales físicamente correctos
- **Iluminación Dinámica**: Luces que siguen al jugador
- **Sombras en Tiempo Real**: Sombras suaves y realistas
- **Efectos de Partículas**: Sistema de partículas para efectos visuales
- **Texturas Procedurales**: Generación de texturas en tiempo real

## 🤖 Sistema de IA

El enemigo utiliza varios sistemas para crear una experiencia desafiante:
- **Pathfinding A***: Para navegación inteligente
- **Detección de Jugador**: Usando raycast y visión por computadora
- **Predicción de Movimiento**: Anticipación de movimientos del jugador
- **Ajuste de Dificultad**: Adaptación basada en el rendimiento del jugador

## 🎯 Objetivos del Juego

1. Explorar el laberinto
2. Recolectar todas las llaves
3. Evitar ser atrapado por el enemigo
4. Encontrar la salida
5. Completar el nivel en el menor tiempo posible

## 🔄 Ciclo de Desarrollo

1. Generación del laberinto (Python)
2. Procesamiento de datos (Node.js)
3. Renderizado 3D (Three.js)
4. Lógica del juego (JavaScript)
5. IA y detección (TensorFlow.js)

## 🐛 Depuración

Para activar el modo de depuración:
1. Abrir la consola del navegador
2. Ejecutar `window.DEBUG = true`
3. Recargar la página

## 📈 Rendimiento

Optimizaciones implementadas:
- Occlusion culling
- Level of Detail (LOD)
- Texture compression
- Geometry instancing
- Frame rate limiting

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit los cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- Nombre del Autor - [GitHub](link-github)

## 🙏 Agradecimientos

- Three.js por el motor 3D
- TensorFlow.js por las capacidades de ML
- La comunidad de desarrollo por su apoyo
