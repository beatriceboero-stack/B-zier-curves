const c = document.getElementById("c");
const ctx = c.getContext("2d");

// Dimensioni logiche della canvas
const logicalWidth = 1150;
const logicalHeight = 650;

// Sistema HD anti-sfocatura (DPR)
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  c.width = logicalWidth * dpr;
  c.height = logicalHeight * dpr;
  c.style.width = logicalWidth + "px";
  c.style.height = logicalHeight + "px";
  ctx.scale(dpr, dpr);
}
resizeCanvas();

// I tuoi 4 punti di controllo iniziali
let pts = [
 { x: 100, y: 520 },
 { x: 180, y: 160 },
 { x: 380, y: 160 },
 { x: 460, y: 520 }
];

let drag = null;
let t = 0.35;
let anim = true;
let trail = [];

const slider = document.getElementById("slider");
const tValue = document.getElementById("tValue");
const btn = document.getElementById("btn");
const weights = document.getElementById("weights");

slider.oninput = e => {
 t = +e.target.value;
 tValue.textContent = "t = " + t.toFixed(3);
};

btn.onclick = () => {
 anim = !anim;
 btn.textContent = anim ? "stop" : "start";
};

function lerp(a, b, ratio) {
 return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
}

function deCasteljau(p, ratio) {
 let levels = [p];
 while (levels[levels.length - 1].length > 1) {
  let prev = levels[levels.length - 1];
  let next = [];
  for (let i = 0; i < prev.length - 1; i++) {
   next.push(lerp(prev[i], prev[i + 1], ratio));
  }
  levels.push(next);
 }
 return levels;
}

function bez(ratio) {
 let L = deCasteljau(pts, ratio);
 return L[L.length - 1][0];
}

function bernstein(ratio) {
 let u = 1 - ratio;
 return {
  b0: u * u * u,
  b1: 3 * u * u * ratio,
  b2: 3 * u * ratio * ratio,
  b3: ratio * ratio * ratio
 };
}

// Disegna la griglia di base fissa a destra con l'aggiunta delle coordinate dinamiche
function drawSkeletonInPanel(scale, offsetX, offsetY) {
 ctx.strokeStyle = "#222";
 ctx.lineWidth = 1;
 ctx.beginPath();
 pts.forEach((p, i) => {
   let x = p.x * scale + offsetX;
   let y = p.y * scale + offsetY;
   i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
 });
 ctx.stroke();
 
 pts.forEach((p, i) => {
   let x = p.x * scale + offsetX;
   let y = p.y * scale + offsetY;
   ctx.fillStyle = "#444";
   ctx.beginPath();
   ctx.arc(x, y, 4, 0, Math.PI * 2);
   ctx.fill();
   ctx.fillStyle = "#666";
   ctx.font = "10px Arial";
   // Inserimento coordinate reali arrotondate nei mini-pannelli
   ctx.fillText(`P${i}(${Math.round(p.x)},${Math.round(p.y)})`, x + 8, y - 4);
 });
}

function draw() {
 ctx.clearRect(0, 0, logicalWidth, logicalHeight);
 ctx.fillStyle = "#000";
 ctx.fillRect(0, 0, logicalWidth, logicalHeight);

 let levels = deCasteljau(pts, t);
 let percentString = Math.floor(t * 100) + "%";

 // ===================================================
 // 1. GRAFICO INTERATTIVO PRINCIPALE (A Sinistra)
 // ===================================================
 ctx.beginPath();
 pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
 ctx.strokeStyle = "#222";
 ctx.stroke();

 let colors = ["#d6d0c4", "#aaa", "#777"];
 for (let l = 0; l < levels.length - 1; l++) {
  ctx.strokeStyle = colors[l];
  ctx.fillStyle = colors[l];
  ctx.beginPath();
  levels[l].forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.stroke();

  levels[l].forEach((p) => {
   ctx.beginPath();
   ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
   ctx.fill();
  });
 }

 ctx.beginPath();
 for (let i = 0; i <= 250; i++) {
  let p = bez(i / 250);
  i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
 }
 ctx.strokeStyle = "#fff";
 ctx.lineWidth = 2.5;
 ctx.stroke();
 ctx.lineWidth = 1;

 // Disegno punti draggabili con coordinate (X, Y) visibili a schermo
 pts.forEach((p, i) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#d6d0c4";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px Arial";
  ctx.fillText(`P${i} (${Math.round(p.x)}, ${Math.round(p.y)})`, p.x + 12, p.y - 12);
 });

 let pMain = bez(t);
 trail.push(pMain);
 if (trail.length > 100) trail.shift();

 ctx.beginPath();
 trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
 ctx.strokeStyle = "#444";
 ctx.stroke();

 ctx.beginPath();
 ctx.arc(pMain.x, pMain.y, 8, 0, Math.PI * 2);
 ctx.fillStyle = "#fff";
 ctx.fill();

 let eps = 0.001;
 let p1 = bez(Math.max(0, t - eps));
 let p2 = bez(Math.min(1, t + eps));
 let tg = { x: p2.x - p1.x, y: p2.y - p1.y };

 ctx.beginPath();
 ctx.moveTo(pMain.x - tg.x * 12, pMain.y - tg.y * 12);
 ctx.lineTo(pMain.x + tg.x * 12, pMain.y + tg.y * 12);
 ctx.strokeStyle = "#ff4500"; 
 ctx.stroke();

 // ===================================================
 // 2. PANNELLI DIDATTICI STEP-BY-STEP (A Destra)
 // ===================================================
 let pScale = 0.45; 
 let rightX = 620;  
 let pHeight = 200; 

 ctx.strokeStyle = "#1a1a1a";
 ctx.beginPath();
 ctx.moveTo(rightX - 30, 0);
 ctx.lineTo(rightX - 30, logicalHeight);
 ctx.stroke();

 // --- PANNELLO 1: Prima interpolazione lineare ---
 let y1 = 15;
 ctx.fillStyle = "#fff";
 ctx.font = "bold 13px Arial";
 ctx.fillText("1° STEP: Prima interpolazione lineare (Spaced " + percentString + ")", rightX, y1 + 20);
 drawSkeletonInPanel(pScale, rightX, y1);
 
 if (levels[1]) {
   ctx.strokeStyle = "#d6d0c4";
   ctx.beginPath();
   levels[1].forEach((p, i) => i ? ctx.lineTo(p.x * pScale + rightX, p.y * pScale + y1) : ctx.moveTo(p.x * pScale + rightX, p.y * pScale + y1));
   ctx.stroke();

   levels[1].forEach((p, idx) => {
     let px = p.x * pScale + rightX;
     let py = p.y * pScale + y1;
     ctx.fillStyle = "#d6d0c4";
     ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
     
     ctx.fillStyle = "#999";
     ctx.font = "11px monospace";
     let offset = (idx === 1) ? {x: -25, y: -10} : {x: 10, y: 4};
     ctx.fillText(percentString, px + offset.x, py + offset.y);
   });
 }

 // --- PANNELLO 2: Seconda interpolazione ---
 let y2 = y1 + pHeight;
 ctx.fillStyle = "#fff";
 ctx.font = "bold 13px Arial";
 ctx.fillText("2° STEP: Seconda interpolazione (Segmenti interni + Intersezione)", rightX, y2 + 20);
 drawSkeletonInPanel(pScale, rightX, y2);
 
 if (levels[1] && levels[2]) {
   ctx.strokeStyle = "rgba(214, 208, 194, 0.1)";
   ctx.beginPath();
   levels[1].forEach((p, i) => i ? ctx.lineTo(p.x * pScale + rightX, p.y * pScale + y2) : ctx.moveTo(p.x * pScale + rightX, p.y * pScale + y2));
   ctx.stroke();

   ctx.strokeStyle = "#777";
   ctx.lineWidth = 1.5;
   ctx.beginPath();
   levels[2].forEach((p, i) => i ? ctx.lineTo(p.x * pScale + rightX, p.y * pScale + y2) : ctx.moveTo(p.x * pScale + rightX, p.y * pScale + y2));
   ctx.stroke();
   ctx.lineWidth = 1;

   levels[1].forEach((p) => {
     let px = p.x * pScale + rightX;
     let py = p.y * pScale + y2;
     ctx.fillStyle = "#555";
     ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
   });

   levels[2].forEach((p, idx) => {
     let interX = p.x * pScale + rightX;
     let interY = p.y * pScale + y2;
     
     ctx.fillStyle = "#ff4500";
     ctx.beginPath();
     ctx.arc(interX, interY, 5, 0, Math.PI * 2);
     ctx.fill();

     ctx.fillStyle = "#fff";
     ctx.font = "11px monospace";
     let offset = (idx === 1) ? {x: -25, y: -8} : {x: 10, y: 4};
     ctx.fillText(percentString, interX + offset.x, interY + offset.y);
   });
 }

 // --- PANNELLO 3: Risultato finale ---
 let y3 = y2 + pHeight;
 ctx.fillStyle = "#fff";
 ctx.font = "bold 13px Arial";
 ctx.fillText("3° STEP: Punti finali della curva generati", rightX, y3 + 20);
 drawSkeletonInPanel(pScale, rightX, y3);
 
 ctx.beginPath();
 for (let i = 0; i <= 100; i++) {
  let p = bez(i / 100);
  i ? ctx.lineTo(p.x * pScale + rightX, p.y * pScale + y3) : ctx.moveTo(p.x * pScale + rightX, p.y * pScale + y3);
 }
 ctx.strokeStyle = "rgba(255,255,255,0.15)";
 ctx.stroke();

 if (levels[2]) {
   ctx.strokeStyle = "#333";
   ctx.beginPath();
   levels[2].forEach((p, i) => i ? ctx.lineTo(p.x * pScale + rightX, p.y * pScale + y3) : ctx.moveTo(p.x * pScale + rightX, p.y * pScale + y3));
   ctx.stroke();
 }
 
 if (levels[3] && levels[3][0]) {
   let pFinal = levels[3][0];
   ctx.fillStyle = "#fff";
   ctx.beginPath(); 
   ctx.arc(pFinal.x * pScale + rightX, pFinal.y * pScale + y3, 5, 0, Math.PI * 2); 
   ctx.fill();
   
   ctx.fillStyle = "#fff";
   ctx.font = "11px monospace";
   ctx.fillText(`ratio = ${t.toFixed(2)} (${Math.round(pFinal.x)}, ${Math.round(pFinal.y)})`, pFinal.x * pScale + rightX + 12, pFinal.y * pScale + y3 + 4);
 }

 let w = bernstein(t);
 weights.innerHTML =
 "P0: " + w.b0.toFixed(2) + " (Inizio)<br>" +
 "P1: " + w.b1.toFixed(2) + "<br>" +
 "P2: " + w.b2.toFixed(2) + "<br>" +
 "P3: " + w.b3.toFixed(2) + " (Fine)";
}

function loop() {
 if (anim) {
  t += 0.002;
  if (t > 1) t = 0;
  slider.value = t;
  tValue.textContent = "t = " + t.toFixed(3);
 }
 draw();
 requestAnimationFrame(loop);
}

c.onmousedown = e => {
 let r = c.getBoundingClientRect();
 let x = e.clientX - r.left;
 let y = e.clientY - r.top;

 pts.forEach((p, i) => {
  if (Math.hypot(p.x - x, p.y - y) < 15) drag = i;
 });
};

c.onmousemove = e => {
 if (drag == null) return;
 let r = c.getBoundingClientRect();
 pts[drag] = { x: e.clientX - r.left, y: e.clientY - r.top };
};

c.onmouseup = () => drag = null;
c.onmouseleave = () => drag = null;

loop();
