let points = [];
let selected = -1;
let slider;

const panelW = 400;
const panelH = 450; // Ridotta l'altezza dei pannelli per fare spazio in alto e in basso

function setup(){
  // Crea e aggancia il canvas al suo contenitore specifico
  let canvas = createCanvas(1200, 560);
  canvas.parent("canvas-container");

  // Inizializzazione punti di controllo spostati leggermente più in alto
  points = [
    createVector(80, 320),
    createVector(200, 60),
    createVector(320, 320)
  ];

  // Crea lo slider e lo posiziona nel contenitore HTML in cima ai grafici
  slider = createSlider(5, 50, 25, 5);
  slider.parent("slider-container");

  textFont("Arial");
  textSize(14);
}

function draw(){
  background(255);

  let step = slider.value();

  // Disegna i 3 pannelli
  for(let p = 0; p < 3; p++){
    drawPanel(p, step);
  }

  // Scritta con percentuale dinamica posizionata sul fondo del canvas
  noStroke();
  fill("#5E3A87");
  textAlign(CENTER);
  text(
    "Suddivisione interpolazioni: " + step + "%",
    width / 2,
    545
  );
}

function drawPanel(panel, step){
  let offsetX = panel * panelW;

  // Divisori verticali tra i pannelli
  stroke(230);
  if(panel > 0){
    line(offsetX, 0, offsetX, panelH);
  }

  // Titoli spostati sul fondo (Y = 480) per non sovrapporsi alle linee superiori
  noStroke();
  fill("#4B2E83");
  textAlign(CENTER);
  let titolo = "";
  if(panel === 0) titolo = "Prima interpolazione lineare";
  if(panel === 1) titolo = "Seconda interpolazione";
  if(panel === 2) titolo = "Punti della curva";

  text(titolo, offsetX + panelW / 2, 480);

  // Scheletro geometrico (linee viola di controllo)
  stroke("#6A0DAD");
  line(offsetX + points[0].x, points[0].y, offsetX + points[1].x, points[1].y);
  line(offsetX + points[1].x, points[1].y, offsetX + points[2].x, points[2].y);

  // Curva di Bézier di sfondo (punti piccoli)
  noStroke();
  fill("#B497D6");
  for(let i = 0; i <= 100; i++){
    let t = i / 100;
    let p = bezierPointCalc(t);
    circle(offsetX + p.x, p.y, 3);
  }

  // Interpolazioni dinamiche regolate dallo slider
  for(let i = step; i < 100; i += step){
    let t = i / 100;
    let p1 = p5.Vector.lerp(points[0], points[1], t);
    let p2 = p5.Vector.lerp(points[1], points[2], t);
    let p = p5.Vector.lerp(p1, p2, t);
    let c = color(120 + i, 70, 180 + i / 2);

    fill(c);
    stroke(c);

    // Pannello 1: Punti sulle linee di controllo con etichette SOTTO i cerchi
    if(panel === 0){
      circle(offsetX + p1.x, p1.y, 10);
      circle(offsetX + p2.x, p2.y, 10);
      noStroke();
      fill("#5E3A87");
      textAlign(CENTER);
      text(i + "%", offsetX + p1.x, p1.y + 22); // Spostato sotto (y + 22)
      text(i + "%", offsetX + p2.x, p2.y + 22); // Spostato sotto (y + 22)
    }

    // Pannello 2: Segmenti interni intermedi con etichette SOTTO il punto centrale
    if(panel === 1){
      stroke(c);
      line(offsetX + p1.x, p1.y, offsetX + p2.x, p2.y);
      fill(c);
      circle(offsetX + p1.x, p1.y, 10);
      circle(offsetX + p2.x, p2.y, 10);
      circle(offsetX + p.x, p.y, 5);
      noStroke();
      fill("#5E3A87");
      textAlign(CENTER);
      text(i + "%", offsetX + p.x, p.y + 18); // Spostato sotto (y + 18)
    }

    // Pannello 3: Valori parametrici t stampati SOTTO i rispettivi punti
    if(panel === 2){
      noStroke();
      fill(c);
      circle(offsetX + p.x, p.y, 5);
      fill("#5E3A87");
      textAlign(CENTER);
      text("t=" + nf(t, 1, 2), offsetX + p.x, p.y + 18); // Spostato sotto (y + 18)
    }
  }

  // Sottotitoli inferiori descrittivi
  noStroke();
  fill("#4B2E83");
  textAlign(CENTER);
  let testo = "";
  if(panel === 0) testo = "Interpolazione tra punti";
  if(panel === 1) testo = "Nuovi segmenti generati";
  if(panel === 2) testo = "Punti appartenenti alla curva";

  text(testo, offsetX + panelW / 2, 510);

  // Disegno e coordinate dei Punti di Controllo trascinabili (Testo SOTTO il cerchio)
  fill("#2E003E");
  stroke("#2E003E");
  for(let pt of points){
    circle(offsetX + pt.x, pt.y, 12);
    noStroke();
    fill("#2E003E");
    textAlign(CENTER);
    text(
      "(" + floor(pt.x) + "," + floor(pt.y) + ")",
      offsetX + pt.x,
      pt.y + 24 // Spostato stabilmente sotto la coordinata del cerchio
    );
  }
}

function bezierPointCalc(t){
  let x = pow(1 - t, 2) * points[0].x + 2 * (1 - t) * t * points[1].x + pow(t, 2) * points[2].x;
  let y = pow(1 - t, 2) * points[0].y + 2 * (1 - t) * t * points[1].y + pow(t, 2) * points[2].y;
  return createVector(x, y);
}

function mousePressed(){
  for(let i = 0; i < points.length; i++){
    for(let p = 0; p < 3; p++){
      let offsetX = p * panelW;
      let d = dist(mouseX, mouseY, offsetX + points[i].x, points[i].y);
      if(d < 10){
        selected = i;
      }
    }
  }
}

function mouseDragged(){
  if(selected !== -1){
    let localX = mouseX % panelW;
    points[selected].x = constrain(localX, 20, panelW - 20);
    points[selected].y = constrain(mouseY, 40, panelH - 40); // Vincolato dentro l'altezza del pannello ridotto
  }
}

function mouseReleased(){
  selected = -1;
}
