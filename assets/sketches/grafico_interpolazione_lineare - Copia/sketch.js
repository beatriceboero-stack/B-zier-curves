// ======================================================
// Quadratic Bezier Interpolation Visualization
// p5.js — Slider Spostato in Basso e Layout Ottimizzato
// ======================================================

let points = [];
let selectedPoint = null;

let stepSlider;

const BASE_PANEL_W = 600;
const BASE_PANEL_H = 450;

let scaleFactor = 1;
let currentPanelW = 600;
let currentPanelH = 450;

// COORDINATE STRUTTURALI DEL TRIANGOLO
let relativePoints = [
  { x: 160 / BASE_PANEL_W, y: 310 / BASE_PANEL_H }, 
  { x: 300 / BASE_PANEL_W, y: 40 / BASE_PANEL_H },  
  { x: 440 / BASE_PANEL_W, y: 310 / BASE_PANEL_H }  
];

let paddingLeft = 0; 

// ======================================================
// SETUP
// ======================================================

function setup() {
  let canvasWidth = windowWidth;
  
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5; 

  // Aumentata l'altezza del canvas da 560 a 590 per dare più aria sul fondo
  let canvasHeight = 590 * scaleFactor;
  createCanvas(canvasWidth, canvasHeight);

  currentPanelW = canvasWidth / 3;
  currentPanelH = canvasHeight - (150 * scaleFactor); // Spazio calibrato per i testi e lo slider sotto

  initPoints();

  // Slider spostato ancora più in basso (da -30 a -20 dal fondo reale del canvas)
  stepSlider = createSlider(5, 50, 25, 5);
  stepSlider.position(0, canvasHeight - (20 * scaleFactor));
  
  // Stile minimale coerente
  stepSlider.style("width", (180 * scaleFactor) + "px");
  stepSlider.style("-webkit-appearance", "none");
  stepSlider.style("appearance", "none");
  stepSlider.style("height", "2px"); 
  stepSlider.style("background", "#e2e2e2"); 
  stepSlider.style("outline", "none");
  stepSlider.style("accent-color", "#777777"); 
  
  textFont("Inter", "sans-serif");
}

function initPoints() {
  points = [];
  for (let rp of relativePoints) {
    points.push(createVector(rp.x * currentPanelW, rp.y * currentPanelH));
  }
}

// ======================================================
// TEXT SAFE 
// ======================================================

function drawTextSafe(str, x, y, size, isTitle = false) {
  push();
  noStroke();
  if (isTitle) {
    fill(119); // Grigio #777777 del sito
    textStyle(NORMAL); 
    textAlign(CENTER); 
  } else {
    fill(153); // Grigio #999999 per etichette t e %
    textStyle(NORMAL);
    textAlign(LEFT);   
  }
  textSize(size);
  text(str, x, y);
  pop();
}

// ======================================================
// DRAW
// ======================================================

function draw() {
  background(255); 

  const step = stepSlider.value();

  const titleSize = max(13, 15 * scaleFactor);
  const labelSize = max(10, 12 * scaleFactor);
  
  // Posizione verticale dei titoli (perfettamente calcolata sotto i grafici)
  const titleY = currentPanelH + (55 * scaleFactor);

  // PANEL 1
  push();
  translate(0, 0);
  drawFirstPanel(step, titleSize, labelSize, titleY);
  pop();

  // PANEL 2
  push();
  translate(currentPanelW, 0);
  drawSecondPanel(step, titleSize, labelSize, titleY);
  pop();

  // PANEL 3
  push();
  translate(currentPanelW * 2, 0);
  drawThirdPanel(step, titleSize, labelSize, titleY);
  pop();
}

// ======================================================
// PANEL 1
// ======================================================

function drawFirstPanel(step, titleSize, labelSize, titleY) {
  drawSkeleton();

  drawTextSafe(
    `Prima interpolazione lineare, spaziato al ${step}%`,
    currentPanelW / 2, 
    titleY,
    titleSize,
    true
  );

  for (let i = step; i < 100; i += step) {
    const t = i / 100;
    setIterationColor(i);

    const np2 = p5.Vector.lerp(points[0], points[1], t);
    const np3 = p5.Vector.lerp(points[1], points[2], t);

    circle(np2.x, np2.y, 8 * scaleFactor); 
    drawTextSafe(`${i}%`, np2.x - (36 * scaleFactor), np2.y + (4 * scaleFactor), labelSize); 

    circle(np3.x, np3.y, 8 * scaleFactor);
    drawTextSafe(`${i}%`, np3.x + (12 * scaleFactor), np3.y + (4 * scaleFactor), labelSize); 
  }

  drawControlPoints();
}

// ======================================================
// PANEL 2
// ======================================================

function drawSecondPanel(step, titleSize, labelSize, titleY) {
  drawSkeleton();

  drawTextSafe(
    `Seconda interpolazione, tra coppie`,
    currentPanelW / 2, 
    titleY,
    titleSize,
    true
  );

  for (let i = step; i < 100; i += step) {
    const t = i / 100;
    setIterationColor(i);

    const np2 = p5.Vector.lerp(points[0], points[1], t);
    const np3 = p5.Vector.lerp(points[1], points[2], t);

    strokeWeight(1 * scaleFactor);
    line(np2.x, np2.y, np3.x, np3.y);

    circle(np2.x, np2.y, 6 * scaleFactor);
    circle(np3.x, np3.y, 6 * scaleFactor);

    const np4 = p5.Vector.lerp(np2, np3, t);
    circle(np4.x, np4.y, 7 * scaleFactor);
  }

  drawControlPoints();
}

// ======================================================
// PANEL 3
// ======================================================

function drawThirdPanel(step, titleSize, labelSize, titleY) {
  drawSkeleton();

  drawTextSafe(
    `Punti della curva generati`,
    currentPanelW / 2, 
    titleY,
    titleSize,
    true
  );

  for (let i = step; i < 100; i += step) {
    const t = i / 100;
    setIterationColor(i);

    const np2 = p5.Vector.lerp(points[0], points[1], t);
    const np3 = p5.Vector.lerp(points[1], points[2], t);
    const np4 = p5.Vector.lerp(np2, np3, t);

    circle(np4.x, np4.y, 7 * scaleFactor);

    if (step >= 20 || i == 50) { 
      drawTextSafe(
        `t=${(i / 100).toFixed(2)}`,
        np4.x + (12 * scaleFactor),
        np4.y + (4 * scaleFactor),
        labelSize
      );
    }
  }

  drawControlPoints();
}

// ======================================================
// SKELETON E GESTIONE MOUSE
// ======================================================

function drawSkeleton() {
  stroke(226); 
  strokeWeight(1.2 * scaleFactor);
  noFill();

  beginShape();
  for (let p of points) {
    vertex(p.x, p.y);
  }
  endShape();
}

function drawControlPoints() {
  stroke(0);
  strokeWeight(1.5 * scaleFactor);
  fill(255);

  for (let p of points) {
    circle(p.x, p.y, 12 * scaleFactor); 
  }
}

function setIterationColor(i) {
  const r = 2.5 * i;
  const b = 255 - 2.5 * i;
  fill(r, 0, b);
  stroke(r, 0, b, 100); 
}

function mousePressed() {
  let localX = mouseX % currentPanelW;
  for (let p of points) {
    if (dist(localX, mouseY, p.x, p.y) < 22 * scaleFactor) { 
      selectedPoint = p;
      break;
    }
  }
}

function mouseDragged() {
  if (selectedPoint) {
    selectedPoint.x = constrain(mouseX % currentPanelW, 25 * scaleFactor, currentPanelW - (25 * scaleFactor));
    selectedPoint.y = constrain(mouseY, 15 * scaleFactor, currentPanelH - (10 * scaleFactor));
  }
}

function mouseReleased() {
  selectedPoint = null;
}

function windowResized() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  let canvasHeight = 590 * scaleFactor;
  resizeCanvas(canvasWidth, canvasHeight);

  currentPanelW = canvasWidth / 3;
  currentPanelH = canvasHeight - (150 * scaleFactor);

  initPoints();

  stepSlider.position(0, canvasHeight - (20 * scaleFactor));
  stepSlider.style("width", (180 * scaleFactor) + "px");
}