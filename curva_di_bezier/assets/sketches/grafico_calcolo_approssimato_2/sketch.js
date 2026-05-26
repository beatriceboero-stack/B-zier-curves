// ======================================================
// Bezier Length Approximation — p5.js
// Replica molto fedele all'originale Bezier.js
// ======================================================

let points = [];
let selectedPoint = null;
let stepsSlider;

// scegli:
// "quadratic"
// "cubic"
const curveType = "cubic";

// ======================================================
// SETUP
// ======================================================

function setup() {
  createCanvas(500, 340);

  if (curveType === "quadratic") {
    points = [
      createVector(70, 250),
      createVector(250, 40),
      createVector(430, 250)
    ];
  } else {
    points = [
      createVector(100, 250),
      createVector(30, 80),
      createVector(320, 40),
      createVector(400, 240)
    ];
  }

  // slider segmenti
  stepsSlider = createSlider(
    2,
    20,
    curveType === "quadratic" ? 4 : 8
  );

  stepsSlider.position(10, 305);
  stepsSlider.style("width", "240px");

  textFont("Arial");
  textSize(14);
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

    LUT.push(
      curveType === "quadratic"
        ? quadraticPoint(t)
        : cubicPoint(t)
    );
  }

  // ==================================================
  // skeleton azzurro chiaro
  // ==================================================

  stroke(173, 216, 230);
  strokeWeight(1);
  noFill();

  beginShape();

  for (let p of points) {
    vertex(p.x, p.y);
  }

  endShape();

  // ==================================================
  // approssimazione rossa
  // ==================================================

  stroke("red");
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
    `Approximate length, ${steps} steps: ${approxLength.toFixed(2)} (true: ${trueLength.toFixed(2)})`,
    10,
    20
  );
}

// ======================================================
// QUADRATIC BEZIER
// ======================================================

function quadraticPoint(t) {
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];

  const mt = 1 - t;

  return createVector(
    mt * mt * p0.x +
    2 * mt * t * p1.x +
    t * t * p2.x,

    mt * mt * p0.y +
    2 * mt * t * p1.y +
    t * t * p2.y
  );
}

// ======================================================
// CUBIC BEZIER
// ======================================================

function cubicPoint(t) {
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const p3 = points[3];

  const mt = 1 - t;

  return createVector(
    mt * mt * mt * p0.x +
    3 * mt * mt * t * p1.x +
    3 * mt * t * t * p2.x +
    t * t * t * p3.x,

    mt * mt * mt * p0.y +
    3 * mt * mt * t * p1.y +
    3 * mt * t * t * p2.y +
    t * t * t * p3.y
  );
}

// ======================================================
// TRUE LENGTH
// ======================================================

function getTrueLength() {
  let total = 0;

  let prev =
    curveType === "quadratic"
      ? quadraticPoint(0)
      : cubicPoint(0);

  const precision = 500;

  for (let i = 1; i <= precision; i++) {
    const t = i / precision;

    const p =
      curveType === "quadratic"
        ? quadraticPoint(t)
        : cubicPoint(t);

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
// DRAGGING
// ======================================================

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