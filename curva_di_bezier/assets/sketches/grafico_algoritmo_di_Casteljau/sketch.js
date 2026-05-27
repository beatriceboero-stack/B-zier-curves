// ==========================================
// Bezier Curve + de Casteljau Visualization
// p5.js
// ==========================================

let points = [];
let selectedPoint = null;
let tSlider;

function setup() {
  createCanvas(500, 320);

  // punti originali
  points = [
    createVector(90, 200),
    createVector(25, 100),
    createVector(220, 40),
    createVector(210, 240)
  ];

  // slider t
  tSlider = createSlider(0, 100, 0);
  tSlider.position(10, 285);
  tSlider.style("width", "220px");

  tSlider.style("accent-color", "black");

  textFont("Roboto");
  textSize(14);
}

function draw() {
  background(255);

  const t = tSlider.value() / 100;

  // =========================
  // Skeleton
  // =========================
  drawSkeleton();

  // =========================
  // Struts (SOTTO la curva)
  // =========================
  if (t > 0 && t < 1) {
    drawStruts(t);
  }

  // =========================
  // Curva Bézier (SOPRA)
  // =========================
  drawBezierCurve();

  // =========================
  // Punto sulla curva
  // =========================
  if (t > 0 && t < 1) {
    const p = bezierPointAt(t);

    noStroke();
    fill(200, 100, 100);
    circle(p.x, p.y, 8);

    fill(0);
    text(
      `Interpolazione ${floor(t * 100)}% (t=${t.toFixed(2)})`,
      10,
      20
    );
  }

  // =========================
  // Control points
  // =========================
  drawControlPoints();
}

// ==========================================
// Skeleton
// ==========================================

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

// ==========================================
// Curva Bézier
// ==========================================

function drawBezierCurve() {
  stroke(0);
  strokeWeight(2);
  noFill();

  beginShape();

  for (let t = 0; t <= 1.001; t += 0.01) {
    const p = bezierPointAt(t);
    vertex(p.x, p.y);
  }

  endShape();
}

// ==========================================
// de Casteljau
// ==========================================

function drawStruts(t) {
  const levels = getLevels(t);

  stroke(200, 100, 100);
  strokeWeight(1.5);
  fill(255);

  for (let level of levels) {
    beginShape();

    for (let p of level) {
      vertex(p.x, p.y);

      fill(255);
      stroke(200, 100, 100);
      circle(p.x, p.y, 8);
    }

    endShape();
  }
}

function getLevels(t) {
  let levels = [];

  let current = points.map(p => p.copy());

  while (current.length > 1) {
    let next = [];

    for (let i = 0; i < current.length - 1; i++) {
      const p = p5.Vector.lerp(current[i], current[i + 1], t);
      next.push(p);
    }

    levels.push(next);
    current = next;
  }

  return levels;
}

// ==========================================
// Punto Bézier tramite de Casteljau
// ==========================================

function bezierPointAt(t) {
  let temp = points.map(p => p.copy());

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

// ==========================================
// Control points
// ==========================================

function drawControlPoints() {
  stroke(0);
  strokeWeight(1.5);
  fill(255);

  for (let p of points) {
    circle(p.x, p.y, 12);
  }
}

// ==========================================
// Dragging
// ==========================================

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