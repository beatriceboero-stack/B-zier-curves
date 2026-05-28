// ======================================================
// Bernstein Polynomials Interactive Visualization
// Layout ottimizzato: Slider affiancato ai pesi e titoli grigio chiaro
// ======================================================

let tSlider;

let scaleFactor = 1;
let currentPanelW = 600;
let currentPanelH = 450;

// Colori estratti dalla foto originale dei polinomi
const colors = {
  w0: '#C94A4A', // Rosso/Mattone scuro
  w1: '#6E9B5E', // Verde oliva desaturato
  w2: '#4F759B', // Azzurro avio
  w3: '#6A5F9E'  // Viola/Indaco sommesso
};

// ======================================================
// SETUP
// ======================================================

function setup() {
  let canvasWidth = windowWidth;
  
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5; 

  let canvasHeight = 520 * scaleFactor;
  createCanvas(canvasWidth, canvasHeight);

  currentPanelW = canvasWidth;
  currentPanelH = canvasHeight - (100 * scaleFactor);

  // Inizializzazione Slider (la posizione assoluta viene gestita dinamicamente in updateSliderPosition)
  tSlider = createSlider(0, 1, 1.00, 0.01);
  
  tSlider.style("-webkit-appearance", "none");
  tSlider.style("appearance", "none");
  tSlider.style("height", "2px"); 
  tSlider.style("background", "#e2e2e2"); 
  tSlider.style("outline", "none");
  tSlider.style("accent-color", "#777777"); 
  
  updateSliderPosition();
  textFont("Inter", "sans-serif");
}

function updateSliderPosition() {
  let bx = currentPanelW * 0.05; 
  let by = currentPanelH * 0.15;
  let bw = 400 * scaleFactor;
  let bh = 180 * scaleFactor;
  
  // Posiziona lo slider a destra della sezione pesi (distante 240px in orizzontale dall'origine dei testi)
  let sliderX = bx + (240 * scaleFactor);
  let sliderY = by + bh + (55 * scaleFactor);
  
  tSlider.position(sliderX, sliderY);
  tSlider.style("width", (140 * scaleFactor) + "px");
}

// ======================================================
// TEXT SAFE (Identico per font e pesi alla reference)
// ======================================================

function drawTextSafe(str, x, y, size, isLightGray = false, customColor = null) {
  push();
  noStroke();
  if (customColor) {
    fill(customColor);
  } else if (isLightGray) {
    fill(153); // Grigio chiaro #999999 (come le scritte descrittive del reference)
  } else {
    fill(119); // Grigio medio #777777 del sito per i titoli principali e totali
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

  const tValue = tSlider.value();

  const titleSize = max(13, 15 * scaleFactor);
  const labelSize = max(11, 13 * scaleFactor);
  
  let bx = currentPanelW * 0.05; 
  let by = currentPanelH * 0.15;
  let bw = 400 * scaleFactor;
  let bh = 180 * scaleFactor;

  // 1. Titolo del Grafico: impostato in grigio chiaro (#999999) come richiesto
  drawTextSafe("Polinomi di Bernstein", bx, by - (20 * scaleFactor), titleSize, true);

  // 2. Disegno del rettangolo contenitore dello spettro
  stroke(226);
  strokeWeight(1.2 * scaleFactor);
  fill(255);
  rect(bx, by, bw, bh, 6 * scaleFactor);

  // 3. Calcolo e rendering delle curve di Bernstein
  drawCurves(bx, by, bw, bh);

  // 4. Linea di tracciamento verticale del tempo corrente t
  let indicatorX = map(tValue, 0, 1, bx, bx + bw);
  stroke(226, 226, 226, 150);
  strokeWeight(1 * scaleFactor);
  line(indicatorX, by, indicatorX, by + bh);

  // 5. Calcolo dei pesi
  let mt = 1 - tValue;
  let w0 = mt * mt * mt;
  let w1 = 3 * mt * mt * tValue;
  let w2 = 3 * mt * tValue * tValue;
  let w3 = tValue * tValue * tValue;
  let somma = w0 + w1 + w2 + w3;

  // Intersezioni sulla linea di scansione
  drawIntersections(tValue, bx, by, bw, bh, [w0, w1, w2, w3]);

  // 6. Blocco Informativo Inferiore (Legenda a sinistra, Controlli a destra)
  const infoY = by + bh + (35 * scaleFactor);
  const rowSpacing = 22 * scaleFactor;

  // Colonna Sinistra: Mostra solo il nome del punto P e il relativo coefficiente numerico
  drawTextSafe(`P0: ${w0.toFixed(2)}`, bx, infoY, labelSize, false, colors.w0);
  drawTextSafe(`P1: ${w1.toFixed(2)}`, bx, infoY + rowSpacing, labelSize, false, colors.w1);
  drawTextSafe(`P2: ${w2.toFixed(2)}`, bx, infoY + (rowSpacing * 2), labelSize, false, colors.w2);
  drawTextSafe(`P3: ${w3.toFixed(2)}`, bx, infoY + (rowSpacing * 3), labelSize, false, colors.w3);

  stroke(235);
  line(bx, infoY + (rowSpacing * 3) + (10 * scaleFactor), bx + (100 * scaleFactor), infoY + (rowSpacing * 3) + (10 * scaleFactor));
  drawTextSafe(`Somma pesi: ${somma.toFixed(1)}`, bx, infoY + (rowSpacing * 3) + (28 * scaleFactor), labelSize, false);

  // Colonna Destra: Parametro temporale posizionato esattamente a sinistra dello slider
  let labelX = bx + (185 * scaleFactor); 
  let labelY = by + bh + (68 * scaleFactor); // Allineato visivamente al centro orizzontale dello slider
  drawTextSafe(`t: ${tValue.toFixed(2)}`, labelX, labelY, labelSize, false);
}

// ======================================================
// FUNZIONI DI CALCOLO E TRACCIAMENTO DELLE CURVE
// ======================================================

function drawCurves(bx, by, bw, bh) {
  noFill();
  strokeWeight(1.5 * scaleFactor);

  for (let i = 0; i < 4; i++) {
    if (i === 0) stroke(colors.w0);
    if (i === 1) stroke(colors.w1);
    if (i === 2) stroke(colors.w2);
    if (i === 3) stroke(colors.w3);

    beginShape();
    for (let xOffset = 0; xOffset <= bw; xOffset++) {
      let localT = xOffset / bw;
      let mt = 1 - localT;
      let yVal = 0;

      if (i === 0) yVal = mt * mt * mt;
      if (i === 1) yVal = 3 * mt * mt * localT;
      if (i === 2) yVal = 3 * mt * localT * localT;
      if (i === 3) yVal = localT * localT * localT;

      let drawX = bx + xOffset;
      let drawY = map(yVal, 0, 1, by + bh - (4 * scaleFactor), by + (4 * scaleFactor));

      vertex(drawX, drawY);
    }
    endShape();
  }
}

function drawIntersections(t, bx, by, bw, bh, values) {
  let drawX = map(t, 0, 1, bx, bx + bw);
  let cKeys = [colors.w0, colors.w1, colors.w2, colors.w3];

  for (let i = 0; i < 4; i++) {
    let drawY = map(values[i], 0, 1, by + bh - (4 * scaleFactor), by + (4 * scaleFactor));
    fill(cKeys[i]);
    noStroke();
    circle(drawX, drawY, 6 * scaleFactor);
  }
}

// ======================================================
// FINESTRE E RIDIMENSIONAMENTO
// ======================================================

function windowResized() {
  let canvasWidth = windowWidth;
  scaleFactor = canvasWidth / 1800;
  if (scaleFactor < 0.5) scaleFactor = 0.5;

  let canvasHeight = 520 * scaleFactor;
  resizeCanvas(canvasWidth, canvasHeight);

  currentPanelW = canvasWidth;
  currentPanelH = canvasHeight - (100 * scaleFactor);

  updateSliderPosition();
}