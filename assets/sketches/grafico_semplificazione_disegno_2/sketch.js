// ============================================
// Bezier Curve Flattening
// p5.js — versione fedele all'originale
// ============================================

let points = [];
let selectedPoint = null;

let stepsSlider;

// scegli:
// "quadratic"
// "cubic"
const curveType = "cubic";

// ============================================
// SETUP
// ============================================

function setup() {
  createCanvas(500, 340);

  // curva originale
  if (curveType === "quadratic") {
    points = [
      createVector(70, 250),
      createVector(250, 50),
      createVector(430, 250)
    ];
  } else {
    points = [
      createVector(110, 250),
      createVector(30, 80),
      createVector(300, 30),
      createVector(390, 240)
    ];
  }

  // slider fino a 20 segmenti
  stepsSlider = createSlider(1, 20, curveType === "quadratic" ? 4 : 8);

  stepsSlider.position(10, 305);
  stepsSlider.style("width", "240px");
  stepsSlider.style("accent-color", "black");

  textFont("Roboto");
  textSize(14);
}

// ============================================
// DRAW
// ============================================

function draw() {
  background(255);

  const steps = stepsSlider.value();

  // ----------------------------------------
  // skeleton
  // ----------------------------------------

  drawSkeleton();

  // ----------------------------------------
  // flattened polygon
  // ----------------------------------------

  stroke(0);
  strokeWeight(2);
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
  // label
  // ----------------------------------------

  noStroke();
  fill(0);

  text(`Semplificato in ${steps} segmenti`, 10, 20);
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
    if (dist(mouseX, mouseY, p.x, p.y) < 10) {
      selectedPoint = p;
      break;
    }
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