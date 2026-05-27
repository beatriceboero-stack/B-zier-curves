// =====================================================
// Rational Cubic Bezier Curve — p5.js
// Replica fedele del demo originale Bezier.js
// =====================================================

let points = [];
let selectedPoint = null;

// pesi/ratios
let ratios = [1, 1, 1, 1];

// sliders
let sliders = [];

// =====================================================
// SETUP
// =====================================================

function setup() {
  createCanvas(1800, 520);

  // curva cubic standard
  points = [
    createVector(70, 250),
    createVector(80, 40),
    createVector(380, 40),
    createVector(420, 250)
  ];

  // sliders ratios
  for (let i = 0; i < 4; i++) {
    const s = createSlider(0.1, 5, 1, 0.01);

    s.position(500, 10 + i * 22);
    s.style("width", "180px");

    // SLIDER NERO
    s.style("accent-color", "#000");

    sliders.push(s);
  }

  textFont("roboto");
  textSize(14);
}

// =====================================================
// DRAW
// =====================================================

function draw() {
  background(255);

  // aggiorna ratios
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
  // labels sliders
  // =========================================

  noStroke();
  fill(0);

  for (let i = 0; i < 4; i++) {
    text(
      `ratio-${i + 1}: ${ratios[i].toFixed(2)}`,
      690,
      16 + i * 22
    );
  }
}

// =====================================================
// DRAW SKELETON
// =====================================================

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

// =====================================================
// DRAW CURVE
// =====================================================

function drawRationalBezier() {
  stroke(0);
  strokeWeight(2);
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
  const denom =
    wb0 + wb1 + wb2 + wb3;

  // rational coordinates
  const x =
    (
      wb0 * points[0].x +
      wb1 * points[1].x +
      wb2 * points[2].x +
      wb3 * points[3].x
    ) / denom;

  const y =
    (
      wb0 * points[0].y +
      wb1 * points[1].y +
      wb2 * points[2].y +
      wb3 * points[3].y
    ) / denom;

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