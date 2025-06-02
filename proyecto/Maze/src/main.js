import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let prevTime = performance.now();

const wallSize = 5;
const wallHeight = 5;
let mazeData = [];
let coinMeshes = [];
let coinsCollected = 0;
const totalCoins = 3;
let coinCounterElement;
let exitCell = null; // To store the coordinates of the exit cell

// Minimap variables
let minimapCanvas, minimapCtx;
const minimapSize = 150; // pixels
let minimapCellWidth, minimapCellHeight;
const minimapWallColor = '#333333';
const minimapPathColor = '#CCCCCC';
const minimapPlayerColor = '#FF0000';
const minimapPlayerSize = 3; // pixels
const minimapDirectionLineLength = 5; // pixels

init();

async function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 0, 150);

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.y = wallHeight / 2; // Position camera at a reasonable height

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 0).normalize();
  scene.add(directionalLight);

  // PointerLockControls setup
  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  instructions.addEventListener('click', function () {
    controls.lock();
  });

  controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
  });

  controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
  });

  // Minimap setup
  minimapCanvas = document.getElementById('minimapCanvas');
  minimapCtx = minimapCanvas.getContext('2d');
  minimapCanvas.width = minimapSize;
  minimapCanvas.height = minimapSize;

  // Coin counter UI
  coinCounterElement = document.getElementById('coinCounter');
  updateCoinCounter();

  // Load maze data
  try {
    const response = await fetch('../public/maze.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    mazeData = await response.json();
    if (mazeData.length === 0 || mazeData[0].length === 0) {
      throw new Error("Maze data is empty or invalid.");
    }
    identifyExitCell(); // Call this before createMazeMesh to know the exit
    createMazeMesh();
    setPlayerStartPosition();

    // Initialize minimap parameters based on mazeData
    minimapCellWidth = minimapSize / mazeData[0].length;
    minimapCellHeight = minimapSize / mazeData.length;
    drawMinimapBase(); // Draw the static part of the minimap
  } catch (error) {
    console.error("Failed to load or process maze data:", error);
    // Display error to user
    const errorDiv = document.createElement('div');
    errorDiv.textContent = 'Failed to load maze. Check console for details.';
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.color = 'red';
    errorDiv.style.backgroundColor = 'white';
    errorDiv.style.padding = '10px';
    document.body.appendChild(errorDiv);
    return; // Stop execution if maze fails to load
  }

  // Event listeners for keyboard controls
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  animate();
}

function identifyExitCell() {
  // Find the exit cell(s) created by python script (a path cell on the border)
  // For simplicity, we assume the Python script creates a clear exit.
  // An exit is a path cell (0) at the border that is not the start cell.
  const rows = mazeData.length;
  const cols = mazeData[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mazeData[r][c] === 0 && (r === 0 || r === rows - 1 || c === 0 || c === cols - 1)) {
        // Heuristic: if player start is (1,1), a common maze exit might be at other end
        // The python script now makes exit at maze[height-2][width-1] or maze[height-1][width-2]
        // which translates to r=rows-2, c=cols-1 OR r=rows-1, c=cols-2 on the outermost part.
        // Let's check for cells that are path and are at the very edge.
        if ((r === rows - 1 && mazeData[r - 1] && mazeData[r - 1][c] === 0) || // Exit at bottom edge
          (r === 0 && mazeData[r + 1] && mazeData[r + 1][c] === 0) || // Exit at top edge
          (c === cols - 1 && mazeData[r][c - 1] === 0) || // Exit at right edge
          (c === 0 && mazeData[r][c + 1] === 0)) { // Exit at left edge
          // Further check: is it one of the specific cells the python script creates?
          if ((r === rows - 2 && c === cols - 1 && mazeData[r][c - 1] === 0) ||
            (r === rows - 1 && c === cols - 2 && mazeData[r - 1] && mazeData[r - 1][c] === 0)) {
            exitCell = { r, c };
            console.log(`Exit cell identified at [${r}, ${c}]`);
            return;
          }
          // Fallback to a more general border path cell if specific not found
          if (exitCell === null) { // Take the first one found as a potential generic exit
            exitCell = { r, c };
            console.log(`Potential generic exit cell identified at [${r}, ${c}]`);
          }
        }
      }
    }
  }
  if (exitCell) {
    console.log(`Using identified exit cell at [${exitCell.r}, ${exitCell.c}]`);
  } else {
    console.warn("Could not reliably identify an exit cell from mazeData borders.");
    // As a last resort, use the one defined by python script directly if coordinates are known
    // This assumes maze dimensions are at least 3x3 for width-2/height-2 to be valid.
    if (rows > 2 && cols > 2) {
      // Check if python script's default exit points are paths
      if (mazeData[rows - 2][cols - 1] === 0) exitCell = { r: rows - 2, c: cols - 1 };
      else if (mazeData[rows - 1][cols - 2] === 0) exitCell = { r: rows - 1, c: cols - 2 };
      if (exitCell) console.log("Fallback: Using Python script's hardcoded exit location.", exitCell);
    }
  }
}

function createMazeMesh() {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Grey walls
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 }); // Light green floor
  const coinMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xccaa00 }); // Gold
  const wallGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallSize);
  const floorGeometry = new THREE.PlaneGeometry(wallSize, wallSize);
  const coinGeometry = new THREE.CylinderGeometry(wallSize * 0.2, wallSize * 0.2, wallHeight * 0.1, 16);

  coinMeshes = []; // Clear previous coin meshes if any

  for (let r = 0; r < mazeData.length; r++) {
    for (let c = 0; c < mazeData[r].length; c++) {
      const x = (c - mazeData[r].length / 2) * wallSize;
      const z = (r - mazeData.length / 2) * wallSize;

      if (mazeData[r][c] === 1) { // Wall
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, wallHeight / 2, z);
        scene.add(wall);
      } else if (mazeData[r][c] === 0 || mazeData[r][c] === 2) { // Path or Coin spot
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(x, 0, z);
        floor.rotation.x = -Math.PI / 2; // Rotate plane to be horizontal
        scene.add(floor);

        if (mazeData[r][c] === 2) { // Coin
          const coin = new THREE.Mesh(coinGeometry, coinMaterial);
          coin.position.set(x, wallHeight * 0.15, z); // Slightly above floor
          coin.rotation.x = Math.PI / 2; // Lay it flat if it's a cylinder
          coin.userData = { r, c, collected: false }; // Store grid coords and status
          scene.add(coin);
          coinMeshes.push(coin);
        }
      }
    }
  }
}

function setPlayerStartPosition() {
  for (let r = 0; r < mazeData.length; r++) {
    for (let c = 0; c < mazeData[r].length; c++) {
      if (mazeData[r][c] === 0) { // Found a path cell
        const startX = (c - mazeData[r].length / 2) * wallSize;
        const startZ = (r - mazeData.length / 2) * wallSize;
        controls.getObject().position.set(startX, wallHeight / 2, startZ);
        camera.position.set(startX, wallHeight / 2, startZ); // Ensure camera is also set
        console.log(`Player start position set to: x=${startX}, y=${wallHeight / 2}, z=${startZ}`);
        return; // Exit after finding the first path cell
      }
    }
  }
  console.warn("No path cell found to set player start position. Player will start at (0, height/2, 0).");
  // Default if no path found (should not happen with a valid maze)
  controls.getObject().position.set(0, wallHeight / 2, 0);
  camera.position.set(0, wallHeight / 2, 0);
}

function drawMinimapBase() {
  if (!minimapCtx || !mazeData || mazeData.length === 0) return;

  minimapCtx.clearRect(0, 0, minimapSize, minimapSize);

  for (let r = 0; r < mazeData.length; r++) {
    for (let c = 0; c < mazeData[r].length; c++) {
      const x = c * minimapCellWidth;
      const y = r * minimapCellHeight;

      if (mazeData[r][c] === 1) { // Wall
        minimapCtx.fillStyle = minimapWallColor;
      } else { // Path
        minimapCtx.fillStyle = minimapPathColor;
      }
      minimapCtx.fillRect(x, y, minimapCellWidth, minimapCellHeight);
    }
  }
}

function drawPlayerOnMinimap() {
  if (!minimapCtx || !mazeData || mazeData.length === 0 || !controls) return;

  const playerPosition = controls.getObject().position;
  const mazeRows = mazeData.length;
  const mazeCols = mazeData[0].length;

  // Convert player's world coordinates to minimap coordinates
  const playerMapX = (playerPosition.x / wallSize + mazeCols / 2) * minimapCellWidth;
  const playerMapY = (playerPosition.z / wallSize + mazeRows / 2) * minimapCellHeight;

  // Draw player dot
  minimapCtx.fillStyle = minimapPlayerColor;
  minimapCtx.beginPath();
  minimapCtx.arc(playerMapX, playerMapY, minimapPlayerSize, 0, 2 * Math.PI);
  minimapCtx.fill();

  // Draw player direction line
  // Get camera's forward direction (in XZ plane)
  const lookDirection = new THREE.Vector3();
  camera.getWorldDirection(lookDirection);

  const angle = Math.atan2(lookDirection.x, lookDirection.z); // Angle in XZ plane

  minimapCtx.strokeStyle = minimapPlayerColor;
  minimapCtx.lineWidth = 2;
  minimapCtx.beginPath();
  minimapCtx.moveTo(playerMapX, playerMapY);
  minimapCtx.lineTo(
    playerMapX + minimapDirectionLineLength * Math.sin(angle),
    playerMapY + minimapDirectionLineLength * Math.cos(angle)
  );
  minimapCtx.stroke();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
  }
}

function updateCoinCounter() {
  if (coinCounterElement) {
    coinCounterElement.textContent = `Coins: ${coinsCollected} / ${totalCoins}`;
  }
}

function checkWinCondition() {
  if (!exitCell) return false;

  const playerPosition = controls.getObject().position;
  const playerGridR = Math.round((playerPosition.z / wallSize) + (mazeData.length / 2));
  const playerGridC = Math.round((playerPosition.x / wallSize) + (mazeData[0].length / 2));

  if (playerGridR === exitCell.r && playerGridC === exitCell.c) {
    if (coinsCollected >= totalCoins) {
      // Display Win Message
      const instructions = document.getElementById('instructions');
      const blocker = document.getElementById('blocker');
      instructions.innerHTML = "<p style='font-size:36px'>YOU WIN!</p><p>Press ESC to release mouse.</p>";
      blocker.style.display = 'block';
      instructions.style.display = '';
      controls.unlock();
      return true; // Game won
    } else {
      // Display message: Need more coins
      // This could be a temporary message on screen or part of the HUD
      console.log(`At exit, but only ${coinsCollected}/${totalCoins} coins collected.`);
      // Optionally, show a message on the #instructions div briefly
      const instructions = document.getElementById('instructions');
      const blocker = document.getElementById('blocker');
      instructions.innerHTML = `<p style='font-size:24px'>You need ${totalCoins - coinsCollected} more coin(s) to exit!</p><p>(Click to continue)</p>`;
      blocker.style.display = 'block';
      instructions.style.display = '';
      // Temporarily unlock to show message, then relock or let user click
      // This might be disruptive, a HUD message is better for this.
      // For now, we just log it and don't halt the game here.
    }
  }
  return false; // Game not won yet
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  let gameWon = false;

  if (controls.isLocked === true) {
    const playerObject = controls.getObject();
    // const previousPosition = playerObject.position.clone(); // Replaced by component-wise checks

    const moveSpeed = 20.0 * delta; // User has set this value
    let dxIntent = 0; // Intended displacement for moveRight (camera's local X)
    let dzIntent = 0; // Intended displacement for moveForward (camera's local Z)

    // Current W/S mapping based on your file:
    // W (moveForward = true) makes dzIntent positive -> controls.moveForward(+) moves FORWARD
    // S (moveBackward = true) makes dzIntent negative -> controls.moveForward(-) moves BACKWARD
    if (moveForward) dzIntent += moveSpeed;
    if (moveBackward) dzIntent -= moveSpeed;
    if (moveLeft) dxIntent -= moveSpeed;    // A (moveLeft = true) makes dxIntent negative -> controls.moveRight(-) moves LEFT
    if (moveRight) dxIntent += moveSpeed;   // D (moveRight = true) makes dxIntent positive -> controls.moveRight(+) moves RIGHT

    // --- Try X-axis movement (camera local X: Left/Right) ---
    if (dxIntent !== 0) {
      const posBeforeXMove = playerObject.position.clone();
      controls.moveRight(dxIntent); // Modifies playerObject.position

      const tempProposedPos = playerObject.position.clone(); // Position after X-axis movement
      tempProposedPos.y = wallHeight / 2; // Ensure collision check is at ground level

      if (checkCollision(tempProposedPos)) {
        playerObject.position.copy(posBeforeXMove); // Revert only the X-axis movement
      }
    }

    // --- Try Z-axis movement (camera local Z: Forward/Backward) ---
    // This movement is from the position after the X-axis attempt (successful or reverted)
    if (dzIntent !== 0) {
      const posBeforeZMove = playerObject.position.clone();
      controls.moveForward(dzIntent); // Modifies playerObject.position

      const tempProposedPos = playerObject.position.clone(); // Position after Z-axis movement
      tempProposedPos.y = wallHeight / 2; // Ensure collision check is at ground level

      if (checkCollision(tempProposedPos)) {
        playerObject.position.copy(posBeforeZMove); // Revert only the Z-axis movement
      }
    }

    // Always ensure the player is on the ground after all movement attempts
    playerObject.position.y = wallHeight / 2;

    // Check for coin collection
    const playerRadius = 0.5; // Same as in checkCollision
    coinMeshes.forEach((coin /*, index -- Removed: Unused */) => {
      if (!coin.userData.collected) {
        const distanceToCoin = playerObject.position.distanceTo(coin.position);
        if (distanceToCoin < (wallSize * 0.2 + playerRadius)) { // coinRadius + playerRadius
          coin.userData.collected = true;
          scene.remove(coin);
          coinsCollected++;
          updateCoinCounter();
          console.log("Coin collected! Total:", coinsCollected);
        }
      }
    });
    // Filter out collected coins properly after iteration
    coinMeshes = coinMeshes.filter(coin => !coin.userData.collected);

    if (checkWinCondition()) {
      gameWon = true;
    }
  }

  renderer.render(scene, camera);

  // Update minimap
  if (minimapCtx && mazeData && mazeData.length > 0 && !gameWon) {
    drawMinimapBase();
    drawPlayerOnMinimap();
  }
}

function checkCollision(position) {
  const halfSize = wallSize / 2;
  const playerRadius = 0.5; // Approximate player size for collision

  const gridX = Math.round((position.x / wallSize) + (mazeData[0].length / 2));
  const gridZ = Math.round((position.z / wallSize) + (mazeData.length / 2));

  // Check immediate cell and neighbors for potential collisions
  for (let rOffset = -1; rOffset <= 1; rOffset++) {
    for (let cOffset = -1; cOffset <= 1; cOffset++) {
      const checkR = gridZ + rOffset;
      const checkC = gridX + cOffset;

      if (
        checkR >= 0 && checkR < mazeData.length &&
        checkC >= 0 && checkC < mazeData[0].length &&
        mazeData[checkR][checkC] === 1 // Is a wall
      ) {
        const wallCenterX = (checkC - mazeData[0].length / 2) * wallSize;
        const wallCenterZ = (checkR - mazeData.length / 2) * wallSize;

        // AABB collision detection
        if (
          position.x + playerRadius > wallCenterX - halfSize &&
          position.x - playerRadius < wallCenterX + halfSize &&
          position.z + playerRadius > wallCenterZ - halfSize &&
          position.z - playerRadius < wallCenterZ + halfSize
        ) {
          // console.log(`Collision detected with wall at [${checkR}, ${checkC}]`);
          return true; // Collision
        }
      }
    }
  }
  return false; // No collision
} 