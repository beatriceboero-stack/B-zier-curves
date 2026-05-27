// =====================================================
// Rational Cubic Bezier Curve — p5.js
// Stile e layout coordinati
// Slider e testi posizionati sotto al grafico
// =====================================================

let points = [];
let selectedPoint = null;

// pesi/ratios
let ratios = [1, 1, 1, 1];

// sliders
let sliders = [];

let scaleFactor = 1;
const GRAPHIC_HEIGHT = 250; // Altezza dedicata all'area di disegno della curva

// =====================================================
// SETUP
// =====================================================

function setup() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  // Altezza impostata a 390 per contenere comodamente i blocchi di controllo sotto al grafico
  createCanvas(canvasWidth, 390);

  // curva cubic standard allineata all'area utile del grafico
  points = [
    createVector(70, GRAPHIC_HEIGHT - 30),
    createVector(80, 40),
    createVector(380, 40),
    createVector(420, GRAPHIC_HEIGHT - 30)
  ];

  // Configurazione degli sliders (Posizionati orizzontalmente sotto al grafico)
  for (let i = 0; i < 4; i++) {
    const s = createSlider(0.1, 5, 1, 0.01);

    // Distribuzione orizzontale distanziata sotto il grafico
    s.position(10 + i * 220, GRAPHIC_HEIGHT + 15);
    s.style("width", "140px");
    s.style("-webkit-appearance", "none");
    s.style("appearance", "none");
    s.style("height", "2px"); 
    s.style("background", "#e2e2e2"); 
    s.style("outline", "none");
    s.style("accent-color", "#777777"); 

    sliders.push(s);
  }

  textFont("Inter", "sans-serif");
}

// ============================================
// TEXT SAFE (Funzione di stile coordinato)
// ============================================

function drawTextSafe(str, x, y, size, isInstruction = false) {
  push();
  noStroke();
  if (isInstruction) {
    fill(153); // Grigio #999999 per indicazioni secondarie
  } else {
    fill(119); // Grigio #777777 per dati e stringhe principali
  }
  textStyle(NORMAL); 
  textAlign(LEFT);   
  textSize(size);
  text(str, x, y);
  pop();
}

// =====================================================
// DRAW
// =====================================================

function draw() {
  background(255);

  const labelSize = max(12, 13 * scaleFactor);
  
  // Calcolo delle posizioni verticali del testo sotto agli slider
  const mainTextY = GRAPHIC_HEIGHT + 55;
  const hintTextY = GRAPHIC_HEIGHT + 77;

  // aggiorna ratios dallo slider
  for (let i = 0; i < 4; i++) {
    ratios[i] = sliders[i].value();
  }

  // =========================================
  // skeleton
  // =========================================
  drawSkeleton();

  // =========================================
  // curva razionale
  // =========================================
  drawRationalBezier();

  // =========================================
  // control points
  // =========================================
  drawPoints();

  // =========================================
  // labels sliders (SPOSTATI SOTTO AD OGNI SLIDER)
  // =========================================
  for (let i = 0; i < 4; i++) {
    drawTextSafe(
      `ratio-${i + 1}: ${ratios[i].toFixed(2)}`,
      10 + i * 220,
      mainTextY,
      labelSize,
      false
    );
  }

  let hintString = "Trascina i punti di controllo o modifica i pesi (ratio) per deformare la curva di Bézier razionale";
  drawTextSafe(hintString, 10, hintTextY, labelSize - 1, true);
}

// =====================================================
// DRAW SKELETON
// =====================================================

function drawSkeleton() {
  stroke(226); // Grigio chiaro #e2e2e2 coerente
  strokeWeight(1);
  noFill();

  beginShape();
  for (let p of points) {
    vertex(p.x, p.y);
  }
  endShape();
}

// =====================================================
// DRAW CURVE
// =====================================================

function drawRationalBezier() {
  stroke(0);
  strokeWeight(1.5);
  noFill();

  beginShape();
  for (let t = 0; t <= 1.001; t += 0.01) {
    const p = getRationalPoint(t);
    vertex(p.x, p.y);
  }
  endShape();
}

// =====================================================
// RATIONAL CUBIC BEZIER
// =====================================================

function getRationalPoint(t) {
  const mt = 1 - t;

  // Bernstein basis cubic
  const b0 = mt * mt * mt;
  const b1 = 3 * mt * mt * t;
  const b2 = 3 * mt * t * t;
  const b3 = t * t * t;

  // weighted basis
  const wb0 = b0 * ratios[0];
  const wb1 = b1 * ratios[1];
  const wb2 = b2 * ratios[2];
  const wb3 = b3 * ratios[3];

  // denominator
  const denom = wb0 + wb1 + wb2 + wb3;

  // rational coordinates
  const x = (wb0 * points[0].x + wb1 * points[1].x + wb2 * points[2].x + wb3 * points[3].x) / denom;
  const y = (wb0 * points[0].y + wb1 * points[1].y + wb2 * points[2].y + wb3 * points[3].y) / denom;

  return createVector(x, y);
}

// =====================================================
// DRAW CONTROL POINTS
// =====================================================

function drawPoints() {
  stroke(0);
  strokeWeight(1.5);
  fill(255);

  for (let p of points) {
    circle(p.x, p.y, 12);
  }
}

// =====================================================
// DRAGGING
// =====================================================

function mousePressed() {
  // Evita l'interazione con i punti se si clicca sotto l'area del grafico
  if (mouseY > GRAPHIC_HEIGHT - 10) return;

  for (let p of points) {
    if (dist(mouseX, mouseY, p.x, p.y) < 12) {
      selectedPoint = p;
      break;
    }
  }
}

function mouseDragged() {
  if (selectedPoint) {
    selectedPoint.x = constrain(mouseX, 10, width - 10);
    selectedPoint.y = constrain(mouseY, 10, GRAPHIC_HEIGHT - 10);
  }
}

function mouseReleased() {
  selectedPoint = null;
}

function windowResized() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  resizeCanvas(canvasWidth, 390);
}