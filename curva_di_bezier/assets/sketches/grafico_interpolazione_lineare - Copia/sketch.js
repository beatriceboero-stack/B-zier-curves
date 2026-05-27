// ======================================================
// Quadratic Bezier Interpolation Visualization
// p5.js — replica fedele dell'originale
// VERSIONE CON PANNELLI PIÙ SPAZIATI
// ======================================================

let points = [];
let selectedPoint = null;

let stepSlider;

const PANELS = 3;

// SPAZIATURA AUMENTATA
const PANEL_W = 380;
const PANEL_H = 320;

// ======================================================
// SETUP
// ======================================================

function setup() {
  createCanvas(PANEL_W * PANELS, PANEL_H + 60);

  // quadratic bezier
  points = [
    createVector(60, 250),
    createVector(160, 40),
    createVector(260, 250)
  ];

  // slider
  stepSlider = createSlider(5, 50, 25, 5);
  stepSlider.position(10, 300);
  stepSlider.style("width", "220px");

  // SLIDER NERO
  stepSlider.style("accent-color", "black");

  // FONT FIX
  textFont("Roboto");
  textSize(14);
}

// ======================================================
// TEXT SAFE
// ======================================================

function drawTextSafe(str, x, y) {
  push();
  noStroke();
  fill(0);
  text(str, x, y);
  pop();
}

// ======================================================
// DRAW
// ======================================================

function draw() {
  background(255);

  const step = stepSlider.value();

  // ==================================================
  // PANEL 1
  // ==================================================

  push();
  translate(0, 0);

  drawFirstPanel(step);

  pop();

  // divider
  stroke(0);
  line(PANEL_W, 0, PANEL_W, PANEL_H);

  // ==================================================
  // PANEL 2
  // ==================================================

  push();
  translate(PANEL_W, 0);

  drawSecondPanel(step);

  pop();

  // divider
  stroke(0);
  line(PANEL_W * 2, 0, PANEL_W * 2, PANEL_H);

  // ==================================================
  // PANEL 3
  // ==================================================

  push();
  translate(PANEL_W * 2, 0);

  drawThirdPanel(step);

  pop();
}

// ======================================================
// PANEL 1
// ======================================================

function drawFirstPanel(step) {
  stroke(0);
  fill(0);

  drawSkeleton();

  drawTextSafe(
    `Prima interpolazione lineare, spaziato al ${step}% (${Math.floor(99 / step)} segmenti)`,
    5,
    15
  );

  // SOLO interpolazioni
  for (let i = step; i < 100; i += step) {
    const t = i / 100;

    setIterationColor(i);

    const np2 = p5.Vector.lerp(points[0], points[1], t);
    const np3 = p5.Vector.lerp(points[1], points[2], t);

    circle(np2.x, np2.y, 8);
    drawTextSafe(`${i}%`, np2.x + 10, np2.y);

    circle(np3.x, np3.y, 8);
    drawTextSafe(`${i}%`, np3.x - 10, np3.y - 15);
  }

  drawControlPoints();
}

// ======================================================
// PANEL 2
// ======================================================

function drawSecondPanel(step) {
  stroke(0);
  fill(0);

  drawSkeleton();

  drawTextSafe(
    `Seconda interpolazione, tra ogni coppia generata`,
    5,
    15
  );

  for (let i = step; i < 100; i += step) {
    const t = i / 100;

    setIterationColor(i);

    const np2 = p5.Vector.lerp(points[0], points[1], t);
    const np3 = p5.Vector.lerp(points[1], points[2], t);

    line(np2.x, np2.y, np3.x, np3.y);

    circle(np2.x, np2.y, 8);
    circle(np3.x, np3.y, 8);

    const np4 = p5.Vector.lerp(np2, np3, t);

    circle(np4.x, np4.y, 4);

    drawTextSafe(`${i}%`, np4.x + 10, np4.y + 10);
  }

  drawControlPoints();
}

// ======================================================
// PANEL 3
// ======================================================

function drawThirdPanel(step) {
  stroke(0);
  fill(0);

  drawSkeleton();

  drawTextSafe(
    `Punti della curva generati in questo modo`,
    5,
    15
  );

  for (let i = step; i < 100; i += step) {
    const t = i / 100;

    setIterationColor(i);

    const np2 = p5.Vector.lerp(points[0], points[1], t);
    const np3 = p5.Vector.lerp(points[1], points[2], t);

    const np4 = p5.Vector.lerp(np2, np3, t);

    circle(np4.x, np4.y, 4);

    drawTextSafe(
      `ratio = ${(i / 100).toFixed(2)}`,
      np4.x + 10,
      np4.y + 15
    );
  }

  drawControlPoints();
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
// SKELETON
// ======================================================

function drawSkeleton() {
  stroke(0);
  strokeWeight(1);
  noFill();

  beginShape();

  for (let p of points) {
    vertex(p.x, p.y);
  }

  endShape();
}

// ======================================================
// CONTROL POINTS
// ======================================================

function drawControlPoints() {
  stroke(0);
  strokeWeight(1.5);
  fill(255);

  for (let p of points) {
    circle(p.x, p.y, 12);
  }
}

// ======================================================
// COLOR GRADIENT
// ======================================================

function setIterationColor(i) {
  const r = 2 * i;
  const b = 255 - 2 * i;

  fill(r, 0, b);
  stroke(r, 0, b, 90);
}

// ======================================================
// DRAGGING
// ======================================================

function mousePressed() {
  const localX = mouseX % PANEL_W;

  for (let p of points) {
    if (dist(localX, mouseY, p.x, p.y) < 10) {
      selectedPoint = p;
      break;
    }
  }
}

function mouseDragged() {
  if (selectedPoint) {
    selectedPoint.x = constrain(mouseX % PANEL_W, 0, PANEL_W);
    selectedPoint.y = constrain(mouseY, 0, PANEL_H);
  }
}

function mouseReleased() {
  selectedPoint = null;
}