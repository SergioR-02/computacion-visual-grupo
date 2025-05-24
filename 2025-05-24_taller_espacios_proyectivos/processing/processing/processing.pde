// Taller 57 - Espacios Proyectivos y Matrices de Proyección
// Demostración mejorada de proyección perspectiva vs ortográfica

// Variables de control
boolean usarPerspectiva = true;
float rotacionX = -0.25; // Ajustado para vista centrada del plano
float rotacionY = 0.5;
float zoom = 1.0;
float distanciaCamara = 800; // Aumentada para mejor perspectiva

// Parámetros de la escena
int numCubos = 8;
float espaciado = 150; // Ajustado para mejor distribución
float tamañoCubo = 60;

// Variables para arrastrar con el mouse
float mouseXInicial, mouseYInicial;
boolean arrastrando = false;

void setup() {
  size(1000, 700, P3D);
  colorMode(HSB, 360, 100, 100);
  textAlign(LEFT, TOP);
}

void draw() {
  background(220, 15, 8);
  lights();
  
  // Configurar la cámara
  configurarCamara();
  
  // Aplicar transformaciones de visualización
  translate(width/2, height/2, 0);
  scale(zoom);
  rotateX(rotacionX);
  rotateY(rotacionY);
  
  // Dibujar la escena
  dibujarEscena();
  
  // Dibujar interfaz de usuario
  dibujarUI();
}

void configurarCamara() {
  if (usarPerspectiva) {
    // Proyección en perspectiva mejorada
    float fov = PI/2.8; // Campo de visión ajustado
    float aspectRatio = float(width)/float(height);
    float nearPlane = 50;
    float farPlane = 3000;
    perspective(fov, aspectRatio, nearPlane, farPlane);
  } else {
    // Proyección ortográfica
    float orthoSize = 400 * zoom;
    ortho(-orthoSize, orthoSize, 
         -orthoSize * height/width, orthoSize * height/width, 
         -2000, 2000);
  }
  
  // Posición de la cámara centrada mejor con el plano
  camera(0, -150, distanciaCamara, // Cámara ajustada más cerca del plano
         0, 0, 0,                  // centro de la escena
         0, 1, 0);                 // vector up
}

void dibujarEscena() {
  // Dibujar plano de referencia (grid) - EN EL ORIGEN
  pushMatrix();
  translate(0, 0, 0); // Plano en el origen
  dibujarGrid();
  popMatrix();
  
  // Dibujar cubos en diferentes posiciones Z
  for (int i = 0; i < numCubos; i++) {
    pushMatrix();
    
    // Posicionar cubos a lo largo del eje Z
    float posZ = (i - numCubos/2.0) * espaciado;
    translate(0, 0, posZ); // Cubos sobre el plano en Y=0
    
    // Color basado en la profundidad
    float hue = map(i, 0, numCubos-1, 240, 0);
    fill(hue, 80, 90);
    stroke(hue, 100, 60);
    strokeWeight(1);
    
    // Dibujar cubo
    float tamaño = tamañoCubo + sin(i * 0.5) * 10;
    translate(0, -tamaño/2, 0); // Posicionar cubos sobre el plano
    box(tamaño);
    
    // Etiqueta de profundidad
    fill(0, 0, 100);
    textAlign(CENTER);
    textSize(12);
    pushMatrix();
    rotateX(-rotacionX);
    rotateY(-rotacionY);
    text("Z: " + int(posZ), 0, -tamaño/2 - 20, 0);
    popMatrix();
    
    popMatrix();
  }
  
  // Dibujar objetos adicionales para mejor referencia
  dibujarObjetosReferencia();
  
  // Dibujar ejes de coordenadas
  dibujarEjes();
}

void dibujarObjetosReferencia() {
  // Esferas en las esquinas del plano para mejor referencia
  int radioEsfera = 25;
  float alturaSobre = 0; // Altura sobre el origen (plano en Y=0)
  
  pushMatrix();
  translate(-350, alturaSobre - radioEsfera, -350);
  fill(120, 70, 80);
  noStroke();
  sphere(radioEsfera);
  popMatrix();
  
  pushMatrix();
  translate(350, alturaSobre - radioEsfera, -350);
  fill(60, 70, 80);
  noStroke();
  sphere(radioEsfera);
  popMatrix();
  
  pushMatrix();
  translate(-350, alturaSobre - radioEsfera, 350);
  fill(300, 70, 80);
  noStroke();
  sphere(radioEsfera);
  popMatrix();
  
  pushMatrix();
  translate(350, alturaSobre - radioEsfera, 350);
  fill(180, 70, 80);
  noStroke();
  sphere(radioEsfera);
  popMatrix();
}

void dibujarGrid() {
  // Grid más grande y mejor centrado
  int gridSize = 600; // Tamaño del grid
  int gridStep = 60;  // Espaciado entre líneas
  
  // Dibujar un plano sólido semi-transparente primero
  pushMatrix();
  fill(220, 20, 15, 80); // Plano semi-transparente
  noStroke();
  beginShape(QUADS);
  vertex(-gridSize, 0, -gridSize);
  vertex(gridSize, 0, -gridSize);
  vertex(gridSize, 0, gridSize);
  vertex(-gridSize, 0, gridSize);
  endShape();
  popMatrix();
  
  // Líneas del grid
  strokeWeight(1);
  
  // Líneas en X
  for (int i = -gridSize; i <= gridSize; i += gridStep) {
    if (i == 0) {
      stroke(0, 0, 70); // Línea central más brillante
      strokeWeight(2);
    } else {
      float alpha = map(abs(i), 0, gridSize, 50, 20);
      stroke(0, 0, alpha);
      strokeWeight(1);
    }
    line(i, 0, -gridSize, i, 0, gridSize);
  }
  
  // Líneas en Z
  for (int i = -gridSize; i <= gridSize; i += gridStep) {
    if (i == 0) {
      stroke(0, 0, 70); // Línea central más brillante
      strokeWeight(2);
    } else {
      float alpha = map(abs(i), 0, gridSize, 50, 20);
      stroke(0, 0, alpha);
      strokeWeight(1);
    }
    line(-gridSize, 0, i, gridSize, 0, i);
  }
  
  // Borde del plano
  stroke(0, 0, 60);
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(-gridSize, 0, -gridSize);
  vertex(gridSize, 0, -gridSize);
  vertex(gridSize, 0, gridSize);
  vertex(-gridSize, 0, gridSize);
  vertex(-gridSize, 0, -gridSize);
  endShape();
}

void dibujarEjes() {
  strokeWeight(4);
  
  // Origen en el plano (Y=0)
  pushMatrix();
  
  // Punto de origen
  fill(0, 0, 100);
  noStroke();
  sphere(10);
  
  // Eje X - Rojo
  stroke(0, 100, 100);
  line(0, 0, 0, 200, 0, 0);
  pushMatrix();
  translate(200, 0, 0);
  fill(0, 100, 100);
  textAlign(CENTER);
  textSize(16);
  pushMatrix();
  rotateX(-rotacionX);
  rotateY(-rotacionY);
  text("X", 0, -20, 0);
  popMatrix();
  popMatrix();
  
  // Eje Y - Verde (hacia arriba desde el plano)
  stroke(120, 100, 100);
  line(0, 0, 0, 0, -200, 0);
  pushMatrix();
  translate(0, -200, 0);
  fill(120, 100, 100);
  textAlign(CENTER);
  pushMatrix();
  rotateX(-rotacionX);
  rotateY(-rotacionY);
  text("Y", 0, -20, 0);
  popMatrix();
  popMatrix();
  
  // Eje Z - Azul
  stroke(240, 100, 100);
  line(0, 0, 0, 0, 0, 200);
  pushMatrix();
  translate(0, 0, 200);
  fill(240, 100, 100);
  textAlign(CENTER);
  pushMatrix();
  rotateX(-rotacionX);
  rotateY(-rotacionY);
  text("Z", 0, -20, 0);
  popMatrix();
  popMatrix();
  
  popMatrix();
  strokeWeight(1);
}

void dibujarUI() {
  // Guardar estado de la matriz
  pushMatrix();
  
  // Resetear transformaciones para dibujar UI
  camera();
  hint(DISABLE_DEPTH_TEST);
  
  // Panel de información principal
  fill(0, 0, 0, 180);
  noStroke();
  rect(15, 15, 320, 240);
  
  fill(0, 0, 100);
  textAlign(LEFT, TOP);
  textSize(14);
  int yPos = 25;
  int lineHeight = 22;
  
  text("TALLER 57 - PROYECCIONES 3D", 25, yPos);
  yPos += lineHeight * 1.8;
  
  fill(usarPerspectiva ? color(120, 100, 100) : color(0, 100, 100));
  text("Modo: " + (usarPerspectiva ? "PERSPECTIVA" : "ORTOGRÁFICA"), 25, yPos);
  yPos += lineHeight * 1.5;
  
  fill(0, 0, 100);
  text("Controles:", 25, yPos);
  yPos += lineHeight;
  text("  [P] - Cambiar proyección", 25, yPos);
  yPos += lineHeight;
  text("  [Mouse] - Rotar vista", 25, yPos);
  yPos += lineHeight;
  text("  [Rueda] - Zoom", 25, yPos);
  yPos += lineHeight;
  text("  [↑↓] - Distancia cámara", 25, yPos);
  yPos += lineHeight;
  text("  [R] - Resetear vista", 25, yPos);
  yPos += lineHeight;
  text("  [SPACE] - Animación auto", 25, yPos);
  
  // Panel de información técnica
  fill(0, 0, 0, 180);
  rect(width - 340, 15, 325, 200);
  
  fill(0, 0, 100);
  yPos = 25;
  text("INFORMACIÓN TÉCNICA", width - 320, yPos);
  yPos += lineHeight * 1.5;
  
  if (usarPerspectiva) {
    text("Tipo: Proyección Perspectiva", width - 320, yPos);
    yPos += lineHeight;
    text("FOV: 64° (Campo de visión)", width - 320, yPos);
    yPos += lineHeight;
    text("Near Plane: 50", width - 320, yPos);
    yPos += lineHeight;
    text("Far Plane: 3000", width - 320, yPos);
    yPos += lineHeight;
    text("Distancia cámara: " + int(distanciaCamara), width - 320, yPos);
    yPos += lineHeight * 1.2;
    fill(120, 60, 90);
    text("• Objetos lejanos se ven pequeños", width - 320, yPos);
    yPos += lineHeight;
    text("• Sensación de profundidad realista", width - 320, yPos);
  } else {
    text("Tipo: Proyección Ortográfica", width - 320, yPos);
    yPos += lineHeight;
    text("Tamaño ortho: " + int(400 * zoom), width - 320, yPos);
    yPos += lineHeight;
    text("Near Plane: -2000", width - 320, yPos);
    yPos += lineHeight;
    text("Far Plane: 2000", width - 320, yPos);
    yPos += lineHeight;
    text("Zoom actual: " + nf(zoom, 1, 2), width - 320, yPos);
    yPos += lineHeight * 1.2;
    fill(240, 60, 90);
    text("• Tamaño constante sin importar Z", width - 320, yPos);
    yPos += lineHeight;
    text("• Útil para diseño técnico", width - 320, yPos);
  }
  
  // Indicador del plano
  fill(0, 0, 0, 180);
  rect(width/2 - 100, height - 50, 200, 35);
  fill(220, 60, 90);
  textAlign(CENTER, CENTER);
  text("Plano XZ en Y=0", width/2, height - 32);
  
  hint(ENABLE_DEPTH_TEST);
  popMatrix();
}

// Variables para animación automática
boolean animacionAuto = false;
float tiempoAnimacion = 0;

// Control del mouse
void mousePressed() {
  mouseXInicial = mouseX;
  mouseYInicial = mouseY;
  arrastrando = true;
}

void mouseDragged() {
  if (arrastrando) {
    float deltaX = mouseX - mouseXInicial;
    float deltaY = mouseY - mouseYInicial;
    
    rotacionY += deltaX * 0.008;
    rotacionX += deltaY * 0.008;
    
    // Limitar rotación X para evitar volteretas
    rotacionX = constrain(rotacionX, -PI/2, PI/2);
    
    mouseXInicial = mouseX;
    mouseYInicial = mouseY;
  }
}

void mouseReleased() {
  arrastrando = false;
}

void mouseWheel(MouseEvent event) {
  float delta = event.getCount();
  zoom *= (delta > 0) ? 0.9 : 1.1;
  zoom = constrain(zoom, 0.2, 3.0);
}

// Control del teclado
void keyPressed() {
  switch(key) {
    case 'p':
    case 'P':
      usarPerspectiva = !usarPerspectiva;
      break;
    case 'r':
    case 'R':
      // Resetear vista
      rotacionX = -0.25;
      rotacionY = 0.5;
      zoom = 1.0;
      distanciaCamara = 800;
      animacionAuto = false;
      break;
    case ' ':
      animacionAuto = !animacionAuto;
      break;
    case CODED:
      if (keyCode == UP) {
        distanciaCamara -= 50;
        distanciaCamara = max(200, distanciaCamara);
      } else if (keyCode == DOWN) {
        distanciaCamara += 50;
        distanciaCamara = min(1500, distanciaCamara);
      }
      break;
  }
}

// Actualización para animación
void keyReleased() {
  if (animacionAuto) {
    tiempoAnimacion += 0.02;
    rotacionY = sin(tiempoAnimacion) * 0.5;
    rotacionX = cos(tiempoAnimacion * 0.7) * 0.3 - 0.2;
  }
}
