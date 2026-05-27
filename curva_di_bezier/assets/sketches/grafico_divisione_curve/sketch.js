// ============================================
// Bezier Curve Splitting Visualization
// p5.js version
// ============================================

let points = [];
let selectedPoint = null;
let tSlider;

const panelW = 300;
const panelH = 300;

function setup() {
  createCanvas(panelW * 3, panelH + 50);

  // Default cubic Bezier
  points = [
    createVector(90, 220),
    createVector(40, 40),
    createVector(260, 40),
    createVector(210, 220)
  ];

  tSlider = createSlider(0, 100, 50);
  tSlider.position(10, panelH);
  tSlider.style("width", "240px");

  // SLIDER NERO
  tSlider.style("accent-color", "black");

  textFont("Roboto");
  textSize(14);
}

function draw() {
  background(255);

  const t = tSlider.value() / 100;

  // ---------------------------------
  // de Casteljau subdivision
  // ---------------------------------

  const levels = getLevels(points, t);

  const leftCurve = [
    levels[0][0],
    levels[1][0],
    levels[2][0],
    levels[3][0]
  ];

  const rightCurve = [
    levels[3][0],
    levels[2][1],
    levels[1][2],
    levels[0][3]
  ];

  const p = levels[3][0];

  // =========================================
  // PANEL 1
  // =========================================

  push();
  translate(0, 0);

  drawMainPanel(points, levels, p);

  pop();

  // divider
  stroke(0);
  line(panelW, 0, panelW, panelH);

  // =========================================
  // PANEL 2
  // =========================================

  push();
  translate(panelW, 0);

  drawSplitPanel(points, leftCurve, p, "Prima metà");

  pop();

  // divider
  stroke(0);
  line(panelW * 2, 0, panelW * 2, panelH);

  // =========================================
  // PANEL 3
  // =========================================

  push();
  translate(panelW * 2, 0);

  drawSplitPanel(points, rightCurve, p, "Seconda metà");

  pop();
}

// =====================================================
// MAIN PANEL
// =====================================================

function drawMainPanel(basePoints, levels, p) {
  // full curve
  drawBezier(basePoints, color(200));

  // skeleton
  drawSkeleton(basePoints, color(200));

  // points
  drawPoints(basePoints, false);

  // struts
  drawStruts(levels);

  // point on curve
  noFill();
  stroke("red");
  strokeWeight(1.5);
  circle(p.x, p.y, 6);

  noStroke();
  fill(0);
  text("Curva completa", 10, 20);
}

// =====================================================
// SPLIT PANELS
// =====================================================

function drawSplitPanel(originalCurve, subCurve, p, label) {
  // original curve
  drawBezier(originalCurve, color(180, 220, 255));
  drawSkeleton(originalCurve, color(180, 220, 255));

  // split curve
  drawBezier(subCurve, color(0));
  drawSkeleton(subCurve, color(0));

  // control points
  fill(255);
  stroke(0);

  for (let pt of subCurve) {
    circle(pt.x, pt.y, 6);
  }

  // point on curve
  noFill();
  stroke("red");
  strokeWeight(1.5);
  circle(p.x, p.y, 6);

  noStroke();
  fill(0);
  text(label, 10, 20);
}

// =====================================================
// DRAW BEZIER
// =====================================================

function drawBezier(pts, col) {
  noFill();
  stroke(col);
  strokeWeight(2);

  beginShape();

  for (let t = 0; t <= 1.001; t += 0.01) {
    const p = bezierPointCustom(pts, t);
    vertex(p.x, p.y);
  }

  endShape();
}

// =====================================================
// DRAW SKELETON
// =====================================================

function drawSkeleton(pts, col) {
  noFill();
  stroke(col);
  strokeWeight(1);

  beginShape();

  for (let p of pts) {
    vertex(p.x, p.y);
  }

  endShape();
}

// =====================================================
// DRAW CONTROL POINTS
// =====================================================

function drawPoints(pts, filled = true) {
  stroke(0);
  strokeWeight(1);

  if (filled) fill(255);
  else noFill();

  for (let p of pts) {
    circle(p.x, p.y, 8);
  }
}

// =====================================================
// DRAW STRUTS
// =====================================================

function drawStruts(levels) {
  stroke(173, 216, 230);
  strokeWeight(1.5);
  noFill();

  for (let level of levels.slice(1)) {
    beginShape();

    for (let p of level) {
      vertex(p.x, p.y);
      circle(p.x, p.y, 6);
    }

    endShape();
  }
}

// =====================================================
// de Casteljau levels
// =====================================================

function getLevels(basePoints, t) {
  let levels = [];
  levels.push(basePoints.map(p => p.copy()));

  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    let next = [];

    for (let i = 0; i < prev.length - 1; i++) {
      next.push(
        p5.Vector.lerp(prev[i], prev[i + 1], t)
      );
    }

    levels.push(next);
  }

  return levels;
}

// =====================================================
// Bezier point
// =====================================================

function bezierPointCustom(pts, t) {
  let temp = pts.map(p => p.copy());

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

// =====================================================
// DRAGGING
// =====================================================

function mousePressed() {
  // drag solo nel primo pannello
  if (mouseX > panelW) return;

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