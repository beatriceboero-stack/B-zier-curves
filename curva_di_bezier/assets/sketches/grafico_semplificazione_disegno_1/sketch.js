// ============================================
// Bezier Curve Flattening
// p5.js version
// ============================================

let points = [];
let selectedPoint = null;

let stepsSlider;
let curveType = "quadratic"; // "quadratic" oppure "cubic"

// ============================================
// SETUP
// ============================================

function setup() {
  createCanvas(1800, 520);

  // Cambia qui:
  // curveType = "quadratic";
  // curveType = "cubic";

  if (curveType === "quadratic") {
    points = [
      createVector(70, 250),
      createVector(250, 40),
      createVector(430, 250)
    ];
  } else {
    points = [
      createVector(70, 250),
      createVector(40, 40),
      createVector(460, 40),
      createVector(430, 250)
    ];
  }

  const maxSteps = curveType === "quadratic" ? 4 : 8;

// slider fino a 20 segmenti
stepsSlider = createSlider(1, 20, 8);

stepsSlider.position(10, 300);
stepsSlider.style("width", "220px");

  textFont("roboto");
  textSize(14);
}

// ============================================
// DRAW
// ============================================

function draw() {
  background(255);

  const steps = stepsSlider.value();

  // =========================================
  // Skeleton originale
  // =========================================

  drawSkeleton();

  // =========================================
  // Flattened polygon
  // =========================================

  noFill();
  stroke(0);
  strokeWeight(2);

  beginShape();

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const p =
      curveType === "quadratic"
        ? quadraticPoint(t)
        : cubicPoint(t);

    vertex(p.x, p.y);
  }

  endShape();

  // =========================================
  // Control points
  // =========================================

  drawControlPoints();

  // =========================================
  // Label
  // =========================================

  noStroke();
  fill(0);

  text(`Semplificato in ${steps} segmenti`, 10, 20);
}

// ============================================
// SKELETON
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
// CONTROL POINTS
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
// QUADRATIC BEZIER
// ============================================

function quadraticPoint(t) {
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
// CUBIC BEZIER
// ============================================

function cubicPoint(t) {
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
// DRAGGING
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