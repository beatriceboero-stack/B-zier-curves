// ============================================
// Bezier Curve Flattening
// p5.js version — Stile e layout coordinati
// Testi posizionati sotto al grafico
// ============================================

let points = [];
let selectedPoint = null;

let stepsSlider;
const curveType = "cubic"; // Sottoinsieme nativo impostato su "cubic"

let scaleFactor = 1;
const GRAPHIC_HEIGHT = 250; // Altezza dedicata all'area di disegno della curva

// ============================================
// SETUP
// ============================================

function setup() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  // Altezza calibrata a 380 per ospitare i testi sotto allo slider
  createCanvas(canvasWidth, 380);

  // Curva originale ricollocata dentro la safe zone verticale
  if (curveType === "quadratic") {
    points = [
      createVector(70, GRAPHIC_HEIGHT - 30),
      createVector(250, 50),
      createVector(430, GRAPHIC_HEIGHT - 30)
    ];
  } else {
    points = [
      createVector(110, GRAPHIC_HEIGHT - 30),
      createVector(30, 80),
      createVector(300, 30),
      createVector(390, GRAPHIC_HEIGHT - 40)
    ];
  }

  // Slider segmenti (Stile minimale coordinato)
  stepsSlider = createSlider(1, 20, curveType === "quadratic" ? 4 : 8);
  stepsSlider.position(10, GRAPHIC_HEIGHT + 15);
  stepsSlider.style("width", "240px");
  stepsSlider.style("-webkit-appearance", "none");
  stepsSlider.style("appearance", "none");
  stepsSlider.style("height", "2px"); 
  stepsSlider.style("background", "#e2e2e2"); 
  stepsSlider.style("outline", "none");
  stepsSlider.style("accent-color", "#777777"); 

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

// ============================================
// DRAW
// ============================================

function draw() {
  background(255);

  const steps = stepsSlider.value();
  const labelSize = max(12, 13 * scaleFactor);

  // Calcolo delle posizioni verticali del testo sotto allo slider
  const mainTextY = GRAPHIC_HEIGHT + 55;
  const hintTextY = GRAPHIC_HEIGHT + 77;

  // ----------------------------------------
  // skeleton
  // ----------------------------------------
  drawSkeleton();

  // ----------------------------------------
  // flattened polygon
  // ----------------------------------------
  stroke(0);
  strokeWeight(1.5);
  noFill();

  beginShape();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    let p;
    if (curveType === "quadratic") {
      p = getQuadraticPoint(t);
    } else {
      p = getCubicPoint(t);
    }

    vertex(p.x, p.y);
  }
  endShape();

  // ----------------------------------------
  // control points
  // ----------------------------------------
  drawControlPoints();

  // ----------------------------------------
  // Label formatted (SPOSTATI SOTTO AL GRAFICO)
  // ----------------------------------------
  let infoString = `Semplificato in ${steps} segmenti`;
  drawTextSafe(infoString, 10, mainTextY, labelSize, false);

  let hintString = "Trascina i punti di controllo per modificare la forma della curva";
  drawTextSafe(hintString, 10, hintTextY, labelSize - 1, true);
}

// ============================================
// DRAW SKELETON
// ============================================

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

// ============================================
// DRAW CONTROL POINTS
// ============================================

function drawControlPoints() {
  stroke(0);
  strokeWeight(1.5);
  fill(255);

  for (let p of points) {
    circle(p.x, p.y, 12);
  }
}

// ============================================
// QUADRATIC POINT
// ============================================

function getQuadraticPoint(t) {
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];

  const mt = 1 - t;

  const x =
    mt * mt * p0.x +
    2 * mt * t * p1.x +
    t * t * p2.x;

  const y =
    mt * mt * p0.y +
    2 * mt * t * p1.y +
    t * t * p2.y;

  return createVector(x, y);
}

// ============================================
// CUBIC POINT
// ============================================

function getCubicPoint(t) {
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const p3 = points[3];

  const mt = 1 - t;

  const x =
    mt * mt * mt * p0.x +
    3 * mt * mt * t * p1.x +
    3 * mt * t * t * p2.x +
    t * t * t * p3.x;

  const y =
    mt * mt * mt * p0.y +
    3 * mt * mt * t * p1.y +
    3 * mt * t * t * p2.y +
    t * t * t * p3.y;

  return createVector(x, y);
}

// ============================================
// DRAG CONTROL POINTS
// ============================================

function mousePressed() {
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

  resizeCanvas(canvasWidth, 380);
}