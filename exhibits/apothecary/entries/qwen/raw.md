```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Flicker-Flicker Philtre</title>
<style>
  html, body { margin:0; padding:0; height:100%; overflow:hidden; background:transparent; }
  canvas { position:fixed; inset:0; width:100%; height:100%; display:block; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
"use strict";
var cv = document.getElementById('c');
var ctx = cv.getContext('2d');
var W = 0, H = 0, TAU = Math.PI * 2;

function resize(){
  var d = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.max(1, Math.round(W * d));
  cv.height = Math.max(1, Math.round(H * d));
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
window.addEventListener('resize', resize);
resize();

var ptr = { x: -9999, y: -9999, alive: false };
function setPtr(e){ ptr.x = e.clientX; ptr.y = e.clientY; ptr.alive = true; }
window.addEventListener('pointermove', setPtr, { passive: true });
window.addEventListener('pointerdown', setPtr, { passive: true });
document.addEventListener('mouseout', function(e){ if(!e.relatedTarget) ptr.alive = false; }, { passive: true });

function rnd(seed){ var s = seed >>> 0; return function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

var S = 0.38;
var NW = Math.sin(S);      // neck half-width as fraction of R
var COS = Math.cos(S);

var flies = [], motes = [], bubbles = [], rings = [];
var nextBub = 0, nextGlub = 0, lastKey = -1, avgB = 0.3;

function geom(){
  var R = Math.min(H * 0.295, W * 0.36);
  var cx = W / 2;
  var by = H * 0.985 - R;
  var nw = R * NW;
  var shoulderY = by - R * COS;
  var neckTop = by - R * 1.5;
  var surfY = by - R * 0.45;
  var surfHW = Math.sqrt(R * R - (surfY - by) * (surfY - by)) * 0.98;
  return { R:R, cx:cx, by:by, nw:nw, shoulderY:shoulderY, neckTop:neckTop, surfY:surfY, surfHW:surfHW };
}

function build(g){
  var rand = rnd(20240613);
  flies = [];
  var n = Math.max(6, Math.min(13, Math.round(g.R / 13)));
  for(var i = 0; i < n; i++){
    var a = rand() * TAU, r = (0.15 + 0.62 * rand()) * g.R;
    flies.push({
      x: g.cx + Math.cos(a) * r * 0.9,
      y: g.by + g.R * 0.15 + Math.sin(a) * r * 0.62,
      vx: 0, vy: 0,
      w1: rand() * 9, w2: rand() * 9,
      per: 2.6 + rand() * 3.6, off: rand(),
      sz: 0.75 + rand() * 0.7
    });
  }
  motes = [];
  for(i = 0; i < 16; i++){
    motes.push({ x: g.cx + (rand()*2-1) * g.R * 0.65, y: g.by + (rand()*1.1-0.25) * g.R * 0.8, ph: rand() * 9, sp: 0.3 + rand() * 0.6 });
  }
  bubbles = []; rings = [];
}

function interiorPath(g){
  var p = new Path2D();
  p.moveTo(g.cx - g.nw, g.neckTop);
  p.lineTo(g.cx - g.nw, g.shoulderY);
  p.arc(g.cx, g.by, g.R, Math.PI * 1.5 - S, -Math.PI * 0.5 + S, true);
  p.lineTo(g.cx + g.nw, g.neckTop);
  p.closePath();
  return p;
}

function rr(x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

var t0 = performance.now(), lastT = t0;

function frame(now){
  var T = (now - t0) / 1000;
  var dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  ctx.clearRect(0, 0, W, H);
  if (W < 30 || H < 40){ requestAnimationFrame(frame); return; }

  var g = geom();
  var key = Math.round(g.R) * 10000 + Math.round(W) * 100 + Math.round(H) % 100;
  if (key !== lastKey){ build(g); lastKey = key; }
  var k = g.R / 150;

  // ---- update flies ----
  var sumB = 0, m = g.R * 0.09;
  for (var i = 0; i < flies.length; i++){
    var f = flies[i];
    f.vx += (Math.sin(T * 0.6 + f.w1) + Math.sin(T * 1.35 + f.w2) * 0.6) * g.R * 0.05 * dt;
    f.vy += (Math.cos(T * 0.5 + f.w2) + Math.sin(T * 1.1 + f.w1) * 0.6) * g.R * 0.05 * dt;
    if (ptr.alive){
      var dx = ptr.x - f.x, dy = ptr.y - f.y, d = Math.hypot(dx, dy);
      if (d < g.R * 1.9 && d > 1) { f.vx += dx / d * g.R * 0.10 * dt; f.vy += dy / d * g.R * 0.10 * dt; }
    }
    var vmax = g.R * 0.09, sp = Math.hypot(f.vx, f.vy);
    if (sp > vmax){ f.vx *= vmax / sp; f.vy *= vmax / sp; }
    f.x += f.vx * dt; f.y += f.vy * dt;
    if (f.y < g.surfY + m){ f.y = g.surfY + m; f.vy = Math.abs(f.vy) * 0.5; }
    var ddx = f.x - g.cx, ddy = f.y - g.by, dd = Math.hypot(ddx, ddy), rr2 = g.R - m;
    if (dd > rr2){
      var kk = rr2 / dd; f.x = g.cx + ddx * kk; f.y = g.by + ddy * kk;
      var nx = ddx / dd, ny = ddy / dd, dot = f.vx * nx + f.vy * ny;
      f.vx -= 2 * dot * nx; f.vy -= 2 * dot * ny; f.vx *= 0.6; f.vy *= 0.6;
    }
    var b0 = 0.5 + 0.5 * Math.sin(TAU * (T / f.per + f.off));
    var b = b0 * b0 * b0;
    b *= 0.72 + 0.28 * Math.sin(TAU * T * 2.1 + f.w1 * 7);
    f.b = Math.max(0, Math.min(1, b));
    sumB += f.b;
  }
  avgB += ((flies.length ? sumB / flies.length : 0.3) - avgB) * 0.05;

  // ---- spawn bubbles ----
  if (T > nextBub){
    nextBub = T + 0.7 + Math.random() * 1.1;
    bubbles.push({ x: g.cx + (Math.random()*2-1) * g.R * 0.55, y: g.by + g.R * 0.82, r: (1 + Math.random() * 1.8) * k, big: false, ph: Math.random() * 9 });
  }
  if (T > nextGlub){
    nextGlub = T + 5 + Math.random() * 4;
    bubbles.push({ x: g.cx + (Math.random()*2-1) * g.R * 0.3, y: g.by + g.R * 0.85, r: (4 + Math.random() * 2) * k, big: true, ph: Math.random() * 9 });
  }
  for (i = bubbles.length - 1; i >= 0; i--){
    var bu = bubbles[i];
    bu.y -= (bu.big ? g.R * 0.085 : g.R * 0.05) * dt;
    bu.x += Math.sin(T * 2 + bu.ph) * g.R * 0.01 * dt;
    if (bu.y <= g.surfY + bu.r){
      if (bu.big) rings.push({ x: bu.x, r: bu.r * 0.8, a: 0.6 });
      bubbles.splice(i, 1);
    }
  }
  for (i = rings.length - 1; i >= 0; i--){
    var rg = rings[i];
    rg.r += g.R * 0.14 * dt; rg.a -= 0.9 * dt;
    if (rg.a <= 0) rings.splice(i, 1);
  }

  // ---- ambient glow behind bottle ----
  var gBoost = 0;
  if (ptr.alive){
    var pd = Math.hypot(ptr.x - g.cx, ptr.y - g.by);
    gBoost = 0.06 * Math.max(0, 1 - pd / (g.R * 2.2));
  }
  var ga = 0.11 + avgB * 0.12 + gBoost;
  var gg = ctx.createRadialGradient(g.cx, g.by, g.R * 0.1, g.cx, g.by, g.R * 1.9);
  gg.addColorStop(0, 'rgba(255,180,90,' + ga.toFixed(3) + ')');
  gg.addColorStop(1, 'rgba(255,180,90,0)');
  ctx.fillStyle = gg;
  ctx.fillRect(0, 0, W, H);

  // ---- shelf shadow + warm light pool ----
  var sg = ctx.createRadialGradient(g.cx, g.by + g.R, 0, g.cx, g.by + g.R, g.R * 1.1);
  sg.addColorStop(0, 'rgba(20,8,2,0.35)');
  sg.addColorStop(1, 'rgba(20,8,2,0)');
  ctx.save();
  ctx.translate(g.cx, g.by + g.R + g.R * 0.02);
  ctx.scale(1, 0.14);
  ctx.translate(-g.cx, -(g.by + g.R));
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(g.cx, g.by + g.R, g.R * 1.1, 0, TAU); ctx.fill();
  ctx.restore();

  var ip = interiorPath(g);

  // ---- empty glass interior ----
  ctx.fillStyle = 'rgba(255,232,205,0.07)';
  ctx.fill(ip);

  // ---- liquid + everything inside, clipped ----
  ctx.save();
  ctx.clip(ip);

  var hue = 36 + 6 * Math.sin(T * 0.15);
  var lg = ctx.createLinearGradient(0, g.surfY, 0, g.by + g.R);
  lg.addColorStop(0, 'hsla(' + hue + ',95%,63%,0.92)');
  lg.addColorStop(0.5, 'hsla(' + (hue - 6) + ',92%,48%,0.95)');
  lg.addColorStop(1, 'hsla(' + (hue - 12) + ',90%,33%,0.97)');
  ctx.fillStyle = lg;
  ctx.fillRect(g.cx - g.R, g.surfY, g.R * 2, g.R * 2);

  // caustic glows
  ctx.globalCompositeOperation = 'lighter';
  ctx.save();
  ctx.beginPath(); ctx.rect(g.cx - g.R, g.surfY, g.R * 2, g.R * 2); ctx.clip();
  for (i = 0; i < 3; i++){
    var cxp = g.cx + Math.sin(T * (0.2 + i * 0.07) + i * 2.1) * g.R * 0.45;
    var cyp = g.by + g.R * 0.3 + Math.cos(T * (0.16 + i * 0.05) + i) * g.R * 0.35;
    var cg = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, g.R * 0.55);
    cg.addColorStop(0, 'rgba(255,214,150,0.09)');
    cg.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(cxp, cyp, g.R * 0.55, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';

  // drifting golden motes
  for (i = 0; i < motes.length; i++){
    var mo = motes[i];
    var mx = mo.x + Math.sin(T * mo.sp + mo.ph) * 6 * k;
    var my = mo.y + Math.cos(T * mo.sp * 0.7 + mo.ph) * 5 * k;
    ctx.fillStyle = 'rgba(255,214,140,' + (0.14 + 0.1 * Math.sin(T * 1.7 + mo.ph)).toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(mx, my, 1.1 * k, 0, TAU); ctx.fill();
  }

  // bubbles
  for (i = 0; i < bubbles.length; i++){
    bu = bubbles[i];
    ctx.strokeStyle = 'rgba(255,236,200,0.5)';
    ctx.lineWidth = Math.max(1, 0.9 * k);
    ctx.beginPath(); ctx.arc(bu.x, bu.y, bu.r, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,250,230,0.55)';
    ctx.beginPath(); ctx.arc(bu.x - bu.r * 0.3, bu.y - bu.r * 0.35, Math.max(0.6, bu.r * 0.22), 0, TAU); ctx.fill();
  }

  // fireflies
  ctx.globalCompositeOperation = 'lighter';
  for (i = 0; i < flies.length; i++){
    f = flies[i];
    var b = f.b;
    var gr2 = (6 + 13 * b) * f.sz * k;
    if (gr2 > 0.5){
      var fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, gr2);
      fg.addColorStop(0, 'rgba(255,208,110,' + (0.55 * b).toFixed(3) + ')');
      fg.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(f.x, f.y, gr2, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,246,205,' + (0.9 * b).toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(f.x, f.y, (1.1 + 1.7 * b) * f.sz * k, 0, TAU); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // inner edge shading for depth
  ctx.strokeStyle = 'rgba(90,40,5,0.32)';
  ctx.lineWidth = g.R * 0.22;
  ctx.stroke(ip);

  ctx.restore(); // un-clip

  // ---- liquid surface ----
  ctx.fillStyle = 'hsla(' + hue + ',95%,72%,0.85)';
  ctx.beginPath();
  ctx.ellipse(g.cx, g.surfY + Math.sin(T * 0.9) * 1.5 * k, g.surfHW, g.R * 0.06, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,190,0.6)';
  ctx.lineWidth = Math.max(1, 1.2 * k);
  ctx.beginPath();
  ctx.ellipse(g.cx, g.surfY + Math.sin(T * 0.9) * 1.5 * k, g.surfHW * (0.97 + 0.02 * Math.sin(T * 1.3)), g.R * 0.045, 0, Math.PI, TAU);
  ctx.stroke();
  for (i = 0; i < rings.length; i++){
    rg = rings[i];
    ctx.strokeStyle = 'rgba(255,244,210,' + rg.a.toFixed(3) + ')';
    ctx.lineWidth = Math.max(1, 1.1 * k);
    ctx.beginPath(); ctx.ellipse(rg.x, g.surfY, rg.r, rg.r * 0.28, 0, 0, TAU); ctx.stroke();
  }

  // ---- glass wall + outline ----
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255,238,215,0.30)';
  ctx.lineWidth = Math.max(3, g.R * 0.07);
  ctx.stroke(ip);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.4;
  ctx.stroke(ip);

  // specular highlights
  ctx.strokeStyle = 'rgba(255,255,255,0.30)';
  ctx.lineWidth = g.R * 0.065;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(g.cx - g.R * 0.62, g.by - g.R * 0.72);
  ctx.bezierCurveTo(g.cx - g.R * 0.85, g.by - g.R * 0.25, g.cx - g.R * 0.80, g.by + g.R * 0.30, g.cx - g.R * 0.50, g.by + g.R * 0.72);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.beginPath();
  ctx.moveTo(g.cx + g.R * 0.66, g.by - g.R * 0.55);
  ctx.quadraticCurveTo(g.cx + g.R * 0.85, g.by + g.R * 0.1, g.cx + g.R * 0.55, g.by + g.R * 0.68);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = g.R * 0.045;
  ctx.beginPath();
  ctx.moveTo(g.cx - g.nw * 0.55, g.neckTop + g.R * 0.06);
  ctx.lineTo(g.cx - g.nw * 0.55, g.shoulderY - g.R * 0.08);
  ctx.stroke();

  // ---- lip ----
  var lipH = g.R * 0.17, lipHW = g.nw * 1.45;
  var lg2 = ctx.createLinearGradient(0, g.neckTop - lipH * 0.4, 0, g.neckTop - lipH * 0.4 + lipH);
  lg2.addColorStop(0, 'rgba(255,245,230,0.55)');
  lg2.addColorStop(1, 'rgba(220,190,160,0.30)');
  rr(g.cx - lipHW, g.neckTop - lipH * 0.4, lipHW * 2, lipH, lipH * 0.45);
  ctx.fillStyle = lg2; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.2; ctx.stroke();

  // ---- cork ----
  var ct = g.neckTop - g.R * 0.47, cb = g.neckTop + g.R * 0.08;
  var chw1 = g.nw * 0.95, chw2 = g.nw * 0.80, cr = g.R * 0.06;
  ctx.beginPath();
  ctx.moveTo(g.cx - chw1 + cr, ct);
  ctx.lineTo(g.cx + chw1 - cr, ct);
  ctx.quadraticCurveTo(g.cx + chw1, ct, g.cx + chw1, ct + cr);
  ctx.lineTo(g.cx + chw2, cb);
  ctx.lineTo(g.cx - chw2, cb);
  ctx.lineTo(g.cx - chw1, ct + cr);
  ctx.quadraticCurveTo(g.cx - chw1, ct, g.cx - chw1 + cr, ct);
  ctx.closePath();
  var cg2 = ctx.createLinearGradient(0, ct, 0, cb);
  cg2.addColorStop(0, '#c89a62');
  cg2.addColorStop(1, '#7c5530');
  ctx.fillStyle = cg2; ctx.fill();
  ctx.strokeStyle = 'rgba(70,42,16,0.5)';
  ctx.lineWidth = 1.2; ctx.stroke();

  var ck = ctx.createLinearGradient(0, cb - g.R * 0.12, 0, cb);
  ck.addColorStop(0, 'rgba(255,170,80,0)');
  ck.addColorStop(1, 'rgba(255,170,80,' + (0.25 + avgB * 0.3).toFixed(3) + ')');
  ctx.fillStyle = ck;
  ctx.fillRect(g.cx - chw2, cb - g.R * 0.12, chw2 * 2, g.R * 0.12);

  var crand = rnd(99);
  ctx.strokeStyle = 'rgba(70,42,16,0.22)';
  ctx.lineWidth = 1;
  for (i = 0; i < 3; i++){
    var gy = ct + (cb - ct) * (0.25 + i * 0.22);
    var gw = chw1 + (chw2 - chw1) * ((gy - ct) / (cb - ct));
    ctx.beginPath();
    ctx.ellipse(g.cx, gy, gw * 0.8, g.R * 0.02, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(70,42,16,0.28)';
  for (i = 0; i < 9; i++){
    var px = g.cx + (crand() * 2 - 1) * chw1 * 0.75;
    var py = ct + crand() * (cb - ct - cr) + cr * 0.5;
    ctx.beginPath(); ctx.arc(px, py, (0.7 + crand()) * k, 0, TAU); ctx.fill();
  }
  var hl = ctx.createLinearGradient(g.cx - chw1, 0, g.cx - chw1 * 0.15, 0);
  hl.addColorStop(0, 'rgba(255,235,205,0.28)');
  hl.addColorStop(1, 'rgba(255,235,205,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(g.cx - chw1, ct, chw1 * 0.85, cb - ct);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Flicker-Flicker Philtre",
  "statement": "Fireflies steeped in warm honey-light, each blink a small wish keeping itself company. Cup a hand near the glass and they drift over, curious, to see who's visiting."
}
```