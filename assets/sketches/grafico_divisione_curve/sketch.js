// ============================================
// Bezier Curve Splitting Visualization
// p5.js version — Stile e layout coordinati
// Testi posizionati sotto ai grafici
// ============================================

let points = [];
let selectedPoint = null;
let tSlider;

let scaleFactor = 1;
let panelW = 300;
const GRAPHIC_HEIGHT = 250; // Altezza dedicata all'area di disegno dei grafici

function setup() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  // Larghezza di ciascuno dei 3 pannelli calcolata dinamicamente
  panelW = canvasWidth / 3;

  // Altezza impostata a 380 per includere i testi sotto ai controlli
  createCanvas(canvasWidth, 380);

  // Default cubic Bezier proporzionata nel primo pannello
  points = [
    createVector(90, GRAPHIC_HEIGHT - 30),
    createVector(40, 40),
    createVector(260, 40),
    createVector(210, GRAPHIC_HEIGHT - 30)
  ];

  // Slider parametro t (Stile minimale coordinato)
  tSlider = createSlider(0, 100, 50);
  tSlider.position(10, GRAPHIC_HEIGHT + 15);
  tSlider.style("width", "240px");
  tSlider.style("-webkit-appearance", "none");
  tSlider.style("appearance", "none");
  tSlider.style("height", "2px"); 
  tSlider.style("background", "#e2e2e2"); 
  tSlider.style("outline", "none");
  tSlider.style("accent-color", "#777777"); 

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

function draw() {
  background(255);

  const t = tSlider.value() / 100;
  const labelSize = max(12, 13 * scaleFactor);

  // Calcolo delle posizioni verticali del testo sotto ai pannelli
  const mainTextY = GRAPHIC_HEIGHT + 55;
  const hintTextY = GRAPHIC_HEIGHT + 77;

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
  drawMainPanel(points, levels, p, labelSize, mainTextY);
  pop();

  // divider 1 (Colore coordinato e leggero)
  stroke(226);
  line(panelW, 0, panelW, GRAPHIC_HEIGHT);

  // =========================================
  // PANEL 2
  // =========================================
  push();
  translate(panelW, 0);
  drawSplitPanel(points, leftCurve, p, "Prima metà", labelSize, mainTextY);
  pop();

  // divider 2
  stroke(226);
  line(panelW * 2, 0, panelW * 2, GRAPHIC_HEIGHT);

  // =========================================
  // PANEL 3
  // =========================================
  push();
  translate(panelW * 2, 0);
  drawSplitPanel(points, rightCurve, p, "Seconda metà", labelSize, mainTextY);
  pop();

  // Indicazione globale posizionata in basso a sinistra (sotto lo slider)
  let hintString = `Parametro di taglio t = ${t.toFixed(2)}  |  Trascina i punti nel primo pannello per modificare la curva`;
  drawTextSafe(hintString, 10, hintTextY, labelSize - 1, true);
}

// =====================================================
// MAIN PANEL
// =====================================================

function drawMainPanel(basePoints, levels, p, labelSize, textY) {
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

  // Testo spostato sotto coordinato
  drawTextSafe("Curva completa", 10, textY, labelSize, false);
}

// =====================================================
// SPLIT PANELS
// =====================================================

function drawSplitPanel(originalCurve, subCurve, p, label, labelSize, textY) {
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

  // Testo spostato sotto coordinato rispetto al proprio pannello
  drawTextSafe(label, 10, textY, labelSize, false);
}

// =====================================================
// DRAW BEZIER
// =====================================================

function drawBezier(pts, col) {
  noFill();
  stroke(col);
  strokeWeight(1.5);

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
  strokeWeight(1.5);

  if (filled) fill(255);
  else noFill();

  for (let p of pts) {
    circle(p.x, p.y, 12);
  }
}

// =====================================================
// DRAW STRUTS
// =====================================================

function drawStruts(levels) {
  stroke(173, 216, 230);
  strokeWeight(1);
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
  // drag consentito solo all'interno del primo pannello e nell'area di disegno utile
  if (mouseX > panelW || mouseY > GRAPHIC_HEIGHT - 10) return;

  for (let p of points) {
    if (dist(mouseX, mouseY, p.x, p.y) < 12) {
      selectedPoint = p;
      break;
    }
  }
}

function mouseDragged() {
  if (selectedPoint) {
    selectedPoint.x = constrain(mouseX, 10, panelW - 10);
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

  panelW = canvasWidth / 3;
  resizeCanvas(canvasWidth, 380);
}