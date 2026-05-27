// ======================================================
// Bezier Length Approximation — p5.js
// Versione con:
// - punti dinamici
// - reset
// - drag punti
// - compatibile con Visual Studio Code
// ======================================================

let points = [];
let selectedPoint = null;

let stepsSlider;
let resetButton;

// ======================================================
// SETUP
// ======================================================

function setup() {
  createCanvas(1800, 340);

  resetPoints();

  // slider segmenti
  stepsSlider = createSlider(2, 40, 8);

  stepsSlider.position(10, 305);
  stepsSlider.style("width", "240px");
  stepsSlider.style("accent-color", "black");

  // bottone reset
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

// ======================================================
// RESET POINTS
// ======================================================

function resetPoints() {
  // 4 punti iniziali
  points = [
    createVector(100, 250),
    createVector(30, 80),
    createVector(320, 40),
    createVector(400, 240)
  ];
}

// ======================================================
// DRAW
// ======================================================

function draw() {
  background(255);

  const steps = stepsSlider.value();

  // lunghezza vera approssimata ad alta precisione
  const trueLength = getTrueLength();

  // LUT
  const LUT = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    LUT.push(getBezierPoint(points, t));
  }

  // ==================================================
  // skeleton
  // ==================================================

  stroke(180);
  strokeWeight(1);
  noFill();

  beginShape();

  for (let p of points) {
    vertex(p.x, p.y);
  }

  endShape();

  // ==================================================
  // curva approssimata
  // ==================================================

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

  // ==================================================
  // control points
  // ==================================================

  stroke(0);
  strokeWeight(1.5);
  fill(255);

  for (let p of points) {
    circle(p.x, p.y, 12);
  }

  // ==================================================
  // testo
  // ==================================================

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

// ======================================================
// GENERIC BEZIER POINT
// de Casteljau algorithm
// ======================================================

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

// ======================================================
// TRUE LENGTH
// ======================================================

function getTrueLength() {
  let total = 0;

  let prev = getBezierPoint(points, 0);

  const precision = 500;

  for (let i = 1; i <= precision; i++) {
    const t = i / precision;

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

// ======================================================
// DRAGGING + ADD POINTS
// ======================================================

function mousePressed() {
  selectedPoint = null;

  // selezione punto
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