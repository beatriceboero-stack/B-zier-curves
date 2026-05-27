// ==========================================
// Bezier Curve + de Casteljau Visualization
// p5.js — Stile e layout coordinati
// Testi posizionati sotto al grafico
// ==========================================

let points = [];
let selectedPoint = null;
let tSlider;

let scaleFactor = 1;
const GRAPHIC_HEIGHT = 250; // Altezza dedicata all'area di disegno della curva

function setup() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  // Altezza calibrata a 380 per ospitare i testi sotto allo slider
  createCanvas(canvasWidth, 380);

  // punti originali adattati all'altezza dell'area grafica utile
  points = [
    createVector(90, GRAPHIC_HEIGHT - 50),
    createVector(25, 100),
    createVector(220, 40),
    createVector(210, GRAPHIC_HEIGHT - 10)
  ];

  // slider t (Stile minimale coordinato)
  tSlider = createSlider(0, 100, 0);
  tSlider.position(10, GRAPHIC_HEIGHT + 15);
  tSlider.style("width", "220px");
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

  // Calcolo delle posizioni verticali del testo sotto allo slider
  const mainTextY = GRAPHIC_HEIGHT + 55;
  const hintTextY = GRAPHIC_HEIGHT + 77;

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
  // Punto sulla curva e testo formattato
  // =========================
  if (t > 0 && t < 1) {
    const p = bezierPointAt(t);

    noStroke();
    fill(200, 100, 100);
    circle(p.x, p.y, 8);

    let infoString = `Interpolazione ${floor(t * 100)}% (t = ${t.toFixed(2)})`;
    drawTextSafe(infoString, 10, mainTextY, labelSize, false);
  } else {
    // Stringa segnaposto coordinata quando t è 0 o 1 per evitare che lo spazio rimanga vuoto
    let edgeString = t === 0 ? "Inizio della curva (t = 0.00)" : "Fine della curva (t = 1.00)";
    drawTextSafe(edgeString, 10, mainTextY, labelSize, false);
  }

  let hintString = "Sposta lo slider per osservare i passaggi geometrici dell'algoritmo di de Casteljau o trascina i punti";
  drawTextSafe(hintString, 10, hintTextY, labelSize - 1, true);

  // =========================
  // Control points
  // =========================
  drawControlPoints();
}

// ==========================================
// Skeleton
// ==========================================

function drawSkeleton() {
  stroke(226); // Grigio chiaro #e2e2e2 coerente
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
  strokeWeight(1.5);
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
  strokeWeight(1);
  fill(255);

  for (let level of levels) {
    beginShape();
    for (let p of level) {
      vertex(p.x, p.y);
    }
    endShape();

    // Disegna i cerchietti sopra le linee di livello
    for (let p of level) {
      fill(255);
      stroke(200, 100, 100);
      circle(p.x, p.y, 6);
    }
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
      next.push(p5.Vector.lerp(temp[i], temp[i + 1], t));
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
  // Disabilita il click sui punti nell'area dei controlli inferiori
  if (mouseY > GRAPHIC_HEIGHT - 10) return;

  for (let p of points) {
    if (dist(mouseX, mouseY, p.x, p.y) < 12) {
      selectedPoint = p;
      break;
    }
  }
}

function mouseDragged() {
  if (selectedPoint) {
    selectedPoint.x = constrain(mouseX, 10, width - 10);
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

  resizeCanvas(canvasWidth, 380);
}