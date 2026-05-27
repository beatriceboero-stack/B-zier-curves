// ============================================
// Bezier Curve Length Approximation
// p5.js — versione con punti dinamici
// Compatibile con p5.js / Visual Studio Code
// Click per aggiungere punti
// Drag per spostare i punti
// Pulsante reset incluso
// ============================================

let points = [];
let selectedPoint = null;

let stepsSlider;
let resetButton;

// ============================================
// SETUP
// ============================================

function setup() {
  createCanvas(1800, 340);

  resetPoints();

  // slider segmenti
  stepsSlider = createSlider(2, 40, 12);

  stepsSlider.position(10, 305);
  stepsSlider.style("width", "240px");
  stepsSlider.style("accent-color", "black");

  // pulsante reset
  resetButton = createButton("Reset");

  resetButton.position(270, 303);

  resetButton.style("background", "black");
  resetButton.style("color", "white");
  resetButton.style("border", "none");
  resetButton.style("padding", "6px 14px");
  resetButton.style("cursor", "pointer");
  resetButton.style("font-family", "Roboto");

  resetButton.mousePressed(resetPoints);

  textFont("Roboto");
  textSize(14);
}

// ============================================
// RESET POINTS
// ============================================

function resetPoints() {
  // SOLO 3 punti iniziali
  points = [
    createVector(90, 250),
    createVector(220, 40),
    createVector(410, 240)
  ];
}

// ============================================
// DRAW
// ============================================

function draw() {
  background(255);

  const steps = stepsSlider.value();

  // =========================================
  // true bezier length
  // =========================================

  const trueLength = approximateTrueLength();

  // =========================================
  // LUT (sampled points)
  // =========================================

  let LUT = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    LUT.push(getBezierPoint(points, t));
  }

  // =========================================
  // skeleton
  // =========================================

  drawSkeleton();

  // =========================================
  // polygon approximation
  // =========================================

  stroke("black");
  strokeWeight(2);
  noFill();

  let approxLength = 0;

  for (let i = 1; i < LUT.length; i++) {
    const p0 = LUT[i - 1];
    const p1 = LUT[i];

    line(p0.x, p0.y, p1.x, p1.y);

    approxLength += dist(
      p0.x,
      p0.y,
      p1.x,
      p1.y
    );
  }

  // =========================================
  // control points
  // =========================================

  drawControlPoints();

  // =========================================
  // text
  // =========================================

  noStroke();
  fill(0);

  text(
    `Punti: ${points.length} | Segmenti: ${steps} | Lunghezza approssimata: ${approxLength.toFixed(2)} | Lunghezza reale: ${trueLength.toFixed(2)}`,
    10,
    20
  );

  text(
    "Click vuoto = aggiungi punto",
    10,
    42
  );
}

// ============================================
// DRAW SKELETON
// ============================================

function drawSkeleton() {
  stroke(180);
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
// GENERIC BEZIER POINT
// de Casteljau algorithm
// ============================================

function getBezierPoint(ctrlPoints, t) {
  let temp = ctrlPoints.map(p => p.copy());

  while (temp.length > 1) {
    let next = [];

    for (let i = 0; i < temp.length - 1; i++) {
      next.push(
        p5.Vector.lerp(temp[i], temp[i + 1], t)
      );
    }

    temp = next;
  }

  return temp[0];
}

// ============================================
// APPROX TRUE LENGTH
// ============================================

function approximateTrueLength() {
  let total = 0;

  let prev = getBezierPoint(points, 0);

  const resolution = 500;

  for (let i = 1; i <= resolution; i++) {
    const t = i / resolution;

    const p = getBezierPoint(points, t);

    total += dist(
      prev.x,
      prev.y,
      p.x,
      p.y
    );

    prev = p;
  }

  return total;
}

// ============================================
// DRAGGING + ADD POINTS
// ============================================

function mousePressed() {
  selectedPoint = null;

  // controllo selezione
  for (let p of points) {
    if (dist(mouseX, mouseY, p.x, p.y) < 10) {
      selectedPoint = p;
      return;
    }
  }

  // aggiungi nuovo punto
  if (mouseY < 290) {
    points.push(createVector(mouseX, mouseY));
  }
}

function mouseDragged() {
  if (selectedPoint) {
    selectedPoint.x = mouseX;
    selectedPoint.y = mouseY;
  }
}

function mouseReleased() {
  selectedPoint = null;
}