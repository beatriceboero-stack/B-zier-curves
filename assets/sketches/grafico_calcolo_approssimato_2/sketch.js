// ======================================================
// Bezier Length Approximation — p5.js
// Versione con 4 punti iniziali dinamici
// Testi posizionati sotto al grafico con stile coordinato
// ======================================================

let points = [];
let selectedPoint = null;

let stepsSlider;
let resetButton;

let scaleFactor = 1;
const GRAPHIC_HEIGHT = 250; // Altezza dedicata all'area di disegno della curva

// ======================================================
// SETUP
// ======================================================

function setup() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  // Altezza impostata a 380 per includere i testi sotto ai controlli
  createCanvas(canvasWidth, 380);

  resetPoints();

  // Slider segmenti (Stile minimale coordinato)
  stepsSlider = createSlider(2, 40, 8);
  stepsSlider.position(10, GRAPHIC_HEIGHT + 15);
  stepsSlider.style("width", "240px");
  stepsSlider.style("-webkit-appearance", "none");
  stepsSlider.style("appearance", "none");
  stepsSlider.style("height", "2px"); 
  stepsSlider.style("background", "#e2e2e2"); 
  stepsSlider.style("outline", "none");
  stepsSlider.style("accent-color", "#777777"); 

  // Bottone reset (Stile minimale coordinato)
  resetButton = createButton("Reset");
  resetButton.position(270, GRAPHIC_HEIGHT + 10);
  resetButton.style("background", "none");
  resetButton.style("color", "#777777");
  resetButton.style("border", "1px solid #e2e2e2");
  resetButton.style("padding", "4px 12px");
  resetButton.style("cursor", "pointer");
  resetButton.style("font-family", "'Inter', sans-serif");
  resetButton.style("font-size", "12px");
  resetButton.style("border-radius", "3px");

  resetButton.mousePressed(resetPoints);

  textFont("Inter", "sans-serif");
}

// ======================================================
// RESET POINTS
// ======================================================

function resetPoints() {
  // 4 punti iniziali ricollocati dentro la safe zone verticale
  points = [
    createVector(100, GRAPHIC_HEIGHT - 40),
    createVector(30, 80),
    createVector(320, 40),
    createVector(400, GRAPHIC_HEIGHT - 50)
  ];
}

// ======================================================
// TEXT SAFE (Funzione di stile coordinato)
// ======================================================

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

// ======================================================
// DRAW
// ======================================================

function draw() {
  background(255);

  const steps = stepsSlider.value();
  const labelSize = max(12, 13 * scaleFactor);

  // Calcolo delle posizioni verticali del testo sotto ai controlli
  const mainTextY = GRAPHIC_HEIGHT + 55;
  const hintTextY = GRAPHIC_HEIGHT + 77;

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
  stroke(226); // Grigio chiaro #e2e2e2 coerente
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
  stroke(0);
  strokeWeight(1.5);
  noFill();

  let approxLength = 0;
  for (let i = 1; i < LUT.length; i++) {
    const p0 = LUT[i - 1];
    const p1 = LUT[i];
    line(p0.x, p0.y, p1.x, p1.y);

    approxLength += dist(p0.x, p0.y, p1.x, p1.y);
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
  // testo formattato (SPOSTATO SOTTO AL GRAFICO)
  // ==================================================
  let infoString = `Punti: ${points.length}  |  Segmenti: ${steps}  |  Lunghezza approssimata: ${approxLength.toFixed(2)}  |  Lunghezza reale: ${trueLength.toFixed(2)}`;
  drawTextSafe(infoString, 10, mainTextY, labelSize, false);

  let hintString = "Click sul vuoto per aggiungere un punto di controllo";
  drawTextSafe(hintString, 10, hintTextY, labelSize - 1, true);
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
      next.push(p5.Vector.lerp(temp[i], temp[i + 1], t));
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
    total += dist(prev.x, prev.y, p.x, p.y);
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
    if (dist(mouseX, mouseY, p.x, p.y) < 12) {
      selectedPoint = p;
      return;
    }
  }

  // aggiungi nuovo punto solo all'interno dell'area utile del grafico
  if (mouseY < GRAPHIC_HEIGHT - 10 && mouseY > 10) {
    points.push(createVector(mouseX, mouseY));
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