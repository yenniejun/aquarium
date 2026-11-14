```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
    touch-action: pan-y;
  }
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    background: transparent;
    touch-action: pan-y;
    user-select: none;
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function () {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var TAU = Math.PI * 2;

  var skinHi = '#f8e0d0';
  var skinMid = '#e8b79a';
  var skinSh = '#c98b74';
  var ink = 'rgba(48, 32, 38, 0.46)';

  var viewScale = 1, ox = 0, oy = 0, dpr = 1;
  var lookX = 0, lookY = 0;
  var pointer = null;
  var last = 0;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(1, window.innerWidth);
    var h = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    viewScale = Math.min(w / 300, h / 400);
    ox = (w - 300 * viewScale) / 2;
    oy = (h - 400 * viewScale) / 2;
  }

  function applyView() {
    ctx.setTransform(dpr * viewScale, 0, 0, dpr * viewScale, dpr * ox, dpr * oy);
  }

  function spineX(y, t) {
    var pose = Math.sin((y - 170) * 0.018) * 7.5;
    var travel = Math.sin(t * 1.02 - y * 0.048) * (2.1 + Math.max(0, y - 205) * 0.034);
    var sway = Math.sin(t * 0.58) * (2.6 + Math.max(0, y - 150) * 0.012);
    var p = t % 6.8;
    var flick = 0;
    if (p > 5.4) {
      var u = (p - 5.4) / 1.4;
      flick = Math.sin(u * Math.PI) * Math.sin(u * TAU);
    }
    var flickAmt = flick * 9 * Math.max(0, (y - 236) / 120);
    return 150 + pose + travel + sway + flickAmt;
  }

  function pulseAt(u, t) {
    var phase = (t % 5.6) / 5.6;
    var d = u - phase;
    return Math.exp(-d * d * 46);
  }

  function qPoint(a, b, c, u) {
    var v = 1 - u;
    return {
      x: v * v * a.x + 2 * v * u * b.x + u * u * c.x,
      y: v * v * a.y + 2 * v * u * b.y + u * u * c.y
    };
  }

  function cPoint(a, b, c, d, u) {
    var v = 1 - u;
    return {
      x: v * v * v * a.x + 3 * v * v * u * b.x + 3 * v * u * u * c.x + u * u * u * d.x,
      y: v * v * v * a.y + 3 * v * v * u * b.y + 3 * v * u * u * c.y + u * u * u * d.y
    };
  }

  function smoothThrough(pts) {
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length < 3) {
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      return;
    }
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i].x + pts[i + 1].x) / 2;
      var my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    var n = pts.length - 1;
    ctx.lineTo(pts[n].x, pts[n].y);
  }

  function fillTaper(pts, widths, style, edge) {
    var L = [];
    var R = [];
    for (var i = 0; i < pts.length; i++) {
      var prev = pts[Math.max(0, i - 1)];
      var next = pts[Math.min(pts.length - 1, i + 1)];
      var tx = next.x - prev.x;
      var ty = next.y - prev.y;
      var len = Math.hypot(tx, ty) || 1;
      tx /= len;
      ty /= len;
      var nx = -ty;
      var ny = tx;
      L.push({ x: pts[i].x + nx * widths[i], y: pts[i].y + ny * widths[i] });
      R.push({ x: pts[i].x - nx * widths[i], y: pts[i].y - ny * widths[i] });
    }
    ctx.beginPath();
    smoothThrough(L);
    for (var j = R.length - 1; j >= 0; j--) ctx.lineTo(R[j].x, R[j].y);
    ctx.closePath();
    ctx.fillStyle = style;
    ctx.fill();
    if (edge) {
      ctx.strokeStyle = edge;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  function glowDot(x, y, r, alpha) {
    if (alpha < 0.03) return;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,' + (0.95 * alpha) + ')');
    g.addColorStop(0.4, 'rgba(190,248,255,' + (0.55 * alpha) + ')');
    g.addColorStop(1, 'rgba(190,248,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function hairStrand(sx, sy, c1x, c1y, c2x, c2y, ex, ey, width, color, t, phase, wind) {
    var w1 = Math.sin(t * 0.8 + phase) * wind + Math.sin(t * 0.31 + phase * 1.6) * wind * 0.35;
    var w2 = Math.sin(t * 0.92 + phase + 0.7) * wind * 1.2;
    var w3 = Math.sin(t * 0.74 + phase + 1.6) * wind * 1.45;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(c1x + w1, c1y, c2x + w2, c2y + w1 * 0.12, ex + w3, ey);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function drawTail(t) {
    var n = 26;
    var left = [];
    var right = [];
    var center = [];
    for (var i = 0; i <= n; i++) {
      var u = i / n;
      var y = 236 + u * 112;
      var x = spineX(y, t);
      var tx = spineX(y + 2.5, t) - spineX(y - 2.5, t);
      var ty = 5;
      var len = Math.hypot(tx, ty) || 1;
      var nx = -ty / len;
      var ny = tx / len;
      var hw = (18.5 * Math.pow(1 - u, 0.8) + 1.05) * (1 + 0.028 * Math.sin(t * 1.6 + u * 8));
      left.push({ x: x + nx * hw, y: y + ny * hw, nx: nx, ny: ny, hw: hw, u: u });
      right.push({ x: x - nx * hw, y: y - ny * hw });
      center.push({ x: x, y: y, nx: nx, ny: ny, hw: hw, u: u, tx: tx / len, ty: ty / len });
    }

    var outer = [];
    for (var i = 7; i <= n; i++) {
      var s = left[i];
      var lean = Math.sin(t * 1.15 + s.u * 4.2) * 3.2;
      var rag = Math.sin(s.u * 18 + t * 2.2) * 1.8;
      var fl = Math.max(3, 5.5 + 11 * Math.sin(Math.min(1, (s.u - 0.05) * 1.15) * Math.PI) + rag);
      outer.push({
        x: s.x + s.nx * (fl + lean),
        y: s.y + s.ny * fl * 0.12 + Math.sin(t * 1.8 + i) * 0.6
      });
    }
    ctx.beginPath();
    ctx.moveTo(left[7].x, left[7].y);
    for (var i = 0; i < outer.length; i++) ctx.lineTo(outer[i].x, outer[i].y);
    for (var i = n; i >= 7; i--) ctx.lineTo(left[i].x, left[i].y);
    ctx.closePath();
    var fg = ctx.createLinearGradient(0, 250, 0, 350);
    fg.addColorStop(0, 'rgba(227, 29, 69, 0.2)');
    fg.addColorStop(0.3, 'rgba(214, 28, 62, 0.82)');
    fg.addColorStop(1, 'rgba(240, 70, 86, 0.75)');
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(outer[0].x, outer[0].y);
    for (var i = 1; i < outer.length; i++) ctx.lineTo(outer[i].x, outer[i].y);
    ctx.strokeStyle = 'rgba(255, 186, 176, 0.8)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    for (var i = 7; i <= n; i += 2) {
      var s = left[i];
      var lean = Math.sin(t * 1.35 + s.u * 5) * 4.5;
      var fl = 9 + 13 * Math.sin(Math.min(1, s.u * 1.1) * Math.PI) + Math.sin(s.u * 15 + t * 2.4) * 2.4;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.quadraticCurveTo(
        s.x + s.nx * fl * 0.55 + lean * 0.3,
        s.y + 1.5,
        s.x + s.nx * (fl + lean),
        s.y + Math.sin(t * 2 + i) * 1.4
      );
      ctx.strokeStyle = (i % 4 === 0) ? '#ffb2a6' : '#e31d45';
      ctx.lineWidth = (i % 4 === 0) ? 1.15 : 0.8;
      ctx.stroke();
    }

    ctx.beginPath();
    var v0 = 9;
    ctx.moveTo(right[v0].x, right[v0].y);
    for (var i = v0; i <= n; i++) {
      var s = center[i];
      var fl = 3.2 + 6 * Math.sin(Math.min(1, (s.u - 0.15) * 1.2) * Math.PI) + Math.sin(t * 1.7 + i) * 1.3;
      ctx.lineTo(right[i].x - s.nx * fl, right[i].y - s.ny * fl * 0.2);
    }
    for (var i = n; i >= v0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 214, 214, 0.4)';
    ctx.fill();

    ctx.beginPath();
    smoothThrough(left);
    for (var i = n; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    var tg = ctx.createLinearGradient(0, 236, 0, 352);
    tg.addColorStop(0, '#e8f4f4');
    tg.addColorStop(0.38, '#c5dde0');
    tg.addColorStop(0.78, '#7eacb6');
    tg.addColorStop(1, '#5f8f9c');
    ctx.fillStyle = tg;
    ctx.fill();
    ctx.save();
    ctx.clip();
    var band = spineX(300, t);
    var hg = ctx.createLinearGradient(band - 16, 0, band + 12, 0);
    hg.addColorStop(0, 'rgba(255,255,255,0)');
    hg.addColorStop(0.5, 'rgba(255,255,255,0.32)');
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(70, 230, 160, 130);
    for (var i = 3; i < n; i += 4) {
      var s = center[i];
      ctx.fillStyle = (i % 8 === 3) ? 'rgba(255, 186, 206, 0.14)' : 'rgba(160, 230, 210, 0.13)';
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, Math.max(2, s.hw * 0.5), 4.2, Math.atan2(s.tx, s.ty), 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    ctx.beginPath();
    smoothThrough(left);
    for (var i = n; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    for (var i = 2; i < n; i++) {
      var s = center[i];
      var x = s.x + s.nx * s.hw * 0.32;
      var y = s.y + s.ny * s.hw * 0.32;
      if (i === 2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    for (var i = 3; i < n - 1; i += 2) {
      var a = left[i], b = right[i], c = center[i];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(c.x - c.nx * 1.2, c.y + 3, b.x, b.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.26)';
      ctx.lineWidth = 0.65;
      ctx.stroke();
    }

    ctx.beginPath();
    for (var i = 4; i < n; i++) {
      var s = center[i];
      var x = s.x - s.nx * s.hw * 0.22;
      var y = s.y - s.ny * s.hw * 0.22;
      if (i === 4) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 0.55;
    ctx.stroke();

    for (var i = 4; i < n - 1; i += 3) {
      var s = center[i];
      var uBody = 0.18 + s.u * 0.82;
      var b = 0.22 + 0.78 * pulseAt(uBody, t);
      var x = s.x - s.nx * s.hw * 0.22;
      var y = s.y - s.ny * s.hw * 0.22;
      glowDot(x, y, 3.4 + s.u * 2.4 + b * 2.2, Math.min(1, b + s.u * 0.12));
    }

    var tip = center[n];
    for (var s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.quadraticCurveTo(
        tip.x + s * 2.6 + Math.sin(t * 1.5 + s) * 2.2,
        tip.y + 6,
        tip.x + s * 4.2 + Math.sin(t * 1.7 + s) * 3.4,
        tip.y + 12
      );
      ctx.strokeStyle = s < 0 ? '#ef4d62' : '#d5eaf0';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    for (var side = -1; side <= 1; side += 2) {
      var y0 = 250;
      var x0 = spineX(y0, t) + side * 5;
      var flap = Math.sin(t * 0.86 + side * 1.1) * 8;
      var flap2 = Math.sin(t * 0.5 + side) * 6;
      var p0 = { x: x0, y: y0 };
      var p1 = { x: x0 + side * (14 + flap * 0.25), y: y0 + 14 };
      var p2 = { x: x0 + side * (24 + flap), y: y0 + 36 };
      var p3 = { x: x0 + side * (10 + flap2), y: y0 + 62 };
      var pts = [];
      var widths = [];
      for (var i = 0; i <= 8; i++) {
        var u = i / 8;
        pts.push(cPoint(p0, p1, p2, p3, u));
        widths.push(2.6 * (1 - u) + 0.3);
      }
      fillTaper(pts, widths, side < 0 ? 'rgba(210, 104, 114, 0.8)' : 'rgba(230, 146, 142, 0.74)', 'rgba(120, 50, 58, 0.28)');
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.strokeStyle = 'rgba(255, 236, 230, 0.6)';
      ctx.lineWidth = 0.75;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(
        p1.x - side * 1.5, p1.y + 1,
        p2.x - side * 1.5, p2.y,
        p3.x, p3.y
      );
      ctx.strokeStyle = 'rgba(140, 48, 58, 0.28)';
      ctx.lineWidth = 0.55;
      ctx.stroke();
    }
  }

  function drawUpper(t) {
    var neckY = 152;
    var neckX = spineX(neckY, t);
    var tang = Math.atan2(spineX(neckY + 8, t) - spineX(neckY - 8, t), 16);
    var hairColors = ['#7c1a30', '#9c243c', '#c42e48', '#ef6a62', '#ffc8b8'];

    ctx.save();
    ctx.translate(neckX, neckY);
    ctx.rotate(tang * 0.3 + lookX * 0.04 + Math.sin(t * 0.45) * 0.03);

    var backs = [
      [-4, -56, -24, -18, -44, 20, -36, 68, 4.4, 0, 0.3, 5],
      [6, -58, 26, -14, 42, 24, 32, 72, 4.2, 1, 1.2, 5],
      [-14, -44, -36, -6, -46, 26, -30, 54, 3.0, 1, 2.0, 4.2],
      [16, -42, 36, -2, 44, 30, 28, 58, 3.1, 0, 2.6, 4.2],
      [-6, -50, -16, 8, -18, 52, -14, 116, 2.3, 2, 0.7, 3.2],
      [2, -54, 8, 6, 6, 48, 4, 96, 2.0, 0, 1.5, 2.8],
      [-18, -34, -40, 6, -36, 36, -24, 48, 2.4, 2, 3.0, 3.4]
    ];
    for (var i = 0; i < backs.length; i++) {
      var s = backs[i];
      hairStrand(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], hairColors[s[9]], t, s[10], s[11]);
    }

    ctx.beginPath();
    ctx.moveTo(-14, -14);
    ctx.bezierCurveTo(-36, -24, -38, -52, -14, -72);
    ctx.bezierCurveTo(-4, -80, 12, -78, 20, -68);
    ctx.bezierCurveTo(40, -50, 38, -24, 18, -10);
    ctx.bezierCurveTo(12, 6, 4, 10, -2, 6);
    ctx.bezierCurveTo(-10, 10, -14, 0, -14, -14);
    ctx.closePath();
    var hairGrad = ctx.createLinearGradient(0, -80, 0, 8);
    hairGrad.addColorStop(0, '#c4364c');
    hairGrad.addColorStop(0.45, '#8e2034');
    hairGrad.addColorStop(1, '#641428');
    ctx.fillStyle = hairGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(80, 16, 32, 0.4)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    var crests = [
      [0, -60, 1, -78, -1, -90, 1, -102, 1.7],
      [-5, -56, -8, -72, -6, -84, -7, -94, 1.3],
      [6, -54, 9, -70, 8, -82, 8, -92, 1.3],
      [-10, -46, -14, -58, -12, -68, -13, -76, 1.05],
      [11, -44, 16, -56, 14, -66, 15, -74, 1.05],
      [2, -58, 4, -76, 0, -88, 2, -98, 1.15]
    ];
    for (var i = 0; i < crests.length; i++) {
      var s = crests[i];
      var wind = 2.4 + (i % 3);
      var ph = i * 0.8;
      var w1 = Math.sin(t * 1.05 + ph) * wind;
      var w2 = Math.sin(t * 1.28 + ph + 1) * wind * 1.25;
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      ctx.bezierCurveTo(s[2] + w1 * 0.35, s[3], s[4] + w2, s[5], s[6] + w2, s[7]);
      ctx.strokeStyle = (i % 3 === 0) ? '#ffd0c4' : (i % 3 === 1 ? '#ff746c' : '#e23048');
      ctx.lineWidth = s[8];
      ctx.stroke();
      var ex = s[6] + w2;
      var ey = s[7];
      var ember = 0.4 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.7 + i));
      var eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 4.2);
      eg.addColorStop(0, 'rgba(255, 220, 200, ' + ember + ')');
      eg.addColorStop(1, 'rgba(255, 120, 90, 0)');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex, ey, 4.2, 0, TAU);
      ctx.fill();
    }

    function ear(x, y, flip) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flip, 1);
      ctx.beginPath();
      ctx.moveTo(1, 5);
      ctx.quadraticCurveTo(15, 1, 12, -11);
      ctx.quadraticCurveTo(6, -15, 0, -7);
      ctx.quadraticCurveTo(4, -1, 1, 5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(214, 124, 114, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 60, 64, 0.4)';
      ctx.lineWidth = 0.55;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2.5, 1);
      ctx.quadraticCurveTo(7.5, -1, 7.2, -7);
      ctx.stroke();
      ctx.restore();
    }

    var neckGrad = ctx.createLinearGradient(-8, -6, 10, 18);
    neckGrad.addColorStop(0, skinHi);
    neckGrad.addColorStop(1, skinSh);
    ctx.beginPath();
    ctx.moveTo(-9, -8);
    ctx.quadraticCurveTo(-11, 8, -12, 20);
    ctx.lineTo(12, 20);
    ctx.quadraticCurveTo(11, 8, 10, -8);
    ctx.closePath();
    ctx.fillStyle = neckGrad;
    ctx.fill();

    function addTorso() {
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.bezierCurveTo(-20, 14, -36, 20, -38, 34);
      ctx.bezierCurveTo(-40, 48, -27, 56, -23, 70);
      ctx.bezierCurveTo(-24, 86, -21, 98, -18, 106);
      ctx.quadraticCurveTo(0, 114, 19, 106);
      ctx.bezierCurveTo(22, 98, 24, 86, 24, 70);
      ctx.bezierCurveTo(27, 56, 38, 48, 36, 34);
      ctx.bezierCurveTo(34, 20, 20, 14, 11, 8);
      ctx.closePath();
    }
    addTorso();
    var torsoGrad = ctx.createLinearGradient(-16, 12, 18, 108);
    torsoGrad.addColorStop(0, '#f3fafa');
    torsoGrad.addColorStop(0.42, '#c9e0e3');
    torsoGrad.addColorStop(1, '#7eacb4');
    ctx.fillStyle = torsoGrad;
    ctx.fill();
    ctx.save();
    addTorso();
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(Math.sin(t * 0.7) * 5, 60, 7, 30, 0.06, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 186, 206, 0.1)';
    ctx.beginPath();
    ctx.ellipse(7, 74, 9, 14, 0.3, 0, TAU);
    ctx.fill();
    for (var y = 34; y <= 102; y += 7) {
      var k = (y - 34) / 70;
      var hw = 12 + Math.sin(k * Math.PI) * 14;
      var off = (Math.floor(y / 7) % 2) * 4.2;
      for (var x = -hw; x <= hw; x += 8.6) {
        ctx.beginPath();
        ctx.arc(x + off, y, 4, 0.12 * Math.PI, 0.88 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
    }
    ctx.restore();
    addTorso();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-8, 9);
    ctx.quadraticCurveTo(1, 24, 9, 9);
    ctx.quadraticCurveTo(2, 6, -8, 9);
    ctx.fillStyle = skinMid;
    ctx.fill();

    function cap(x, y, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      var g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 13);
      g.addColorStop(0, skinHi);
      g.addColorStop(1, skinSh);
      ctx.beginPath();
      ctx.ellipse(0, 0, 12.5, 8.5, 0, 0, TAU);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }
    cap(-28, 30, -0.35);
    cap(26, 30, 0.3);

    function addHead() {
      ctx.beginPath();
      ctx.moveTo(1, -64);
      ctx.bezierCurveTo(22, -62, 28, -46, 25, -32);
      ctx.bezierCurveTo(23, -18, 15, -8, 1, -7);
      ctx.bezierCurveTo(-13, -8, -23, -18, -22, -32);
      ctx.bezierCurveTo(-26, -48, -18, -64, 1, -64);
      ctx.closePath();
    }
    addHead();
    var skinGrad = ctx.createRadialGradient(-6, -46, 3, 2, -32, 38);
    skinGrad.addColorStop(0, '#fff3ea');
    skinGrad.addColorStop(0.45, skinMid);
    skinGrad.addColorStop(1, skinSh);
    ctx.fillStyle = skinGrad;
    ctx.fill();
    ctx.save();
    addHead();
    ctx.clip();
    ctx.fillStyle = 'rgba(212, 118, 110, 0.26)';
    ctx.beginPath();
    ctx.ellipse(-11, -26, 6.5, 3.6, -0.25, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11, -25, 6.5, 3.8, 0.22, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.26)';
    ctx.beginPath();
    ctx.ellipse(-2, -50, 8, 4.4, -0.15, 0, TAU);
    ctx.fill();
    ctx.restore();
    addHead();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.stroke();

    ear(-24, -31, -1);
    ear(24, -30, 1);

    var blinkP = t % 8.4;
    var blink = 0;
    if (blinkP > 8.08) blink = Math.sin((blinkP - 8.08) / 0.32 * Math.PI);

    function eye(x, y, sc, tilt) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.2 * sc, 7.1, 0, 0, TAU);
      ctx.clip();
      ctx.fillStyle = '#f6f2ef';
      ctx.fillRect(-12, -12, 24, 24);
      var ix = lookX * 2.15;
      var iy = lookY * 1.45;
      var ig = ctx.createRadialGradient(ix - 0.5, iy - 0.7, 0.3, ix, iy, 4);
      ig.addColorStop(0, '#f3fffc');
      ig.addColorStop(0.34, '#8fd4cc');
      ig.addColorStop(0.7, '#2b7980');
      ig.addColorStop(1, '#14383e');
      ctx.beginPath();
      ctx.arc(ix, iy + 0.25, 3.45, 0, TAU);
      ctx.fillStyle = ig;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ix * 1.05, iy + 0.5, 1.6, 0, TAU);
      ctx.fillStyle = '#10181a';
      ctx.fill();
      if (blink < 0.8) {
        ctx.beginPath();
        ctx.arc(-1.7, -2, 1, 0, TAU);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1.4, 1.3, 0.4, 0, TAU);
        ctx.fillStyle = 'rgba(255, 176, 166, 0.75)';
        ctx.fill();
      }
      var lid = 0.15 + blink * 0.92;
      ctx.fillStyle = skinMid;
      ctx.fillRect(-12, -12, 24, 9 * lid + 2);
      ctx.fillStyle = skinSh;
      ctx.fillRect(-12, 5.6 - blink * 2.6, 24, 7);
      ctx.restore();
      ctx.beginPath();
      ctx.ellipse(x, y, 6.2 * sc, Math.max(0.8, 7.1 * (1 - blink * 0.84)), tilt, 0, TAU);
      ctx.strokeStyle = '#6a403c';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    eye(-8.2, -37, 0.92, -0.08);
    eye(8, -36.4, 1, 0.09);

    ctx.strokeStyle = '#5c3834';
    ctx.lineWidth = 0.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12.2, -39);
    ctx.lineTo(-15.2, -41.2);
    ctx.moveTo(-11.2, -41);
    ctx.lineTo(-13.4, -43.2);
    ctx.moveTo(12.4, -38.2);
    ctx.lineTo(15.6, -40.6);
    ctx.moveTo(11.2, -40.4);
    ctx.lineTo(13.6, -42.6);
    ctx.stroke();

    ctx.strokeStyle = '#7a403c';
    ctx.lineWidth = 1.45;
    ctx.beginPath();
    ctx.moveTo(-14.6, -46.6);
    ctx.quadraticCurveTo(-8.4, -50.6, -2.2, -47.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2.2, -47.6);
    ctx.quadraticCurveTo(9.2, -53.4, 15.2, -45.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(3, -29);
    ctx.quadraticCurveTo(5.8, -24.8, 3.4, -22.8);
    ctx.strokeStyle = 'rgba(150, 84, 74, 0.42)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-4.4, -17.2);
    ctx.quadraticCurveTo(1.3, -14.2, 6.6, -17.6);
    ctx.strokeStyle = '#c15c64';
    ctx.lineWidth = 1.15;
    ctx.stroke();

    var cheeks = [
      [10.5, -27, 0.85],
      [14.2, -23.2, 0.6],
      [16.4, -19.4, 0.4],
      [-11.2, -26.6, 0.5],
      [-14, -22.8, 0.32]
    ];
    for (var i = 0; i < cheeks.length; i++) {
      var c = cheeks[i];
      var a = c[2] * (0.42 + 0.38 * (0.5 + 0.5 * Math.sin(t * 1.15 + i * 0.8)));
      glowDot(c[0], c[1], 3, a);
    }

    var fronts = [
      [-16, -48, -32, -26, -36, -2, -26, 22, 3.1, 2, 0.4, 4],
      [14, -46, 30, -24, 34, 2, 24, 20, 2.9, 2, 1.4, 4],
      [-10, -58, -20, -50, -18, -42, -16, -36, 2.3, 3, 2.1, 1.8],
      [9, -56, 18, -48, 16, -40, 13, -34, 2.1, 4, 0.8, 1.6],
      [-20, -32, -32, -16, -28, 4, -20, 16, 1.9, 3, 1.8, 2.6],
      [18, -30, 30, -14, 26, 4, 18, 14, 1.8, 4, 2.4, 2.4]
    ];
    for (var i = 0; i < fronts.length; i++) {
      var s = fronts[i];
      hairStrand(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], hairColors[s[9]], t, s[10], s[11]);
    }

    function drawArm(a, b, c, w0, w1, w2) {
      var pts = [];
      var widths = [];
      for (var i = 0; i <= 8; i++) {
        var u = i / 8;
        pts.push(qPoint(a, b, c, u));
        widths.push(w0 * (1 - u) * (1 - u) + 2 * w1 * (1 - u) * u + w2 * u * u);
      }
      var g = ctx.createLinearGradient(a.x, a.y, c.x, c.y);
      g.addColorStop(0, skinMid);
      g.addColorStop(0.45, skinHi);
      g.addColorStop(1, skinSh);
      fillTaper(pts, widths, g, 'rgba(140, 80, 70, 0.28)');
    }

    var handBob = Math.sin(t * 0.9) * 1.4;
    drawArm({ x: -26, y: 32 }, { x: -40, y: 12 }, { x: -30, y: -10 + handBob }, 6.2, 4.8, 3.5);
    drawArm({ x: 24, y: 32 }, { x: 34, y: 30 }, { x: 14, y: 22 }, 5.8, 4.6, 3.4);

    function drawHand(x, y, angle, spread) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 1.4, 4.7, 5.4, 0, 0, TAU);
      ctx.fillStyle = skinMid;
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 80, 70, 0.28)';
      ctx.lineWidth = 0.55;
      ctx.stroke();
      var angs = [-0.42, -0.14, 0.14, 0.4];
      var lens = [6.1, 7.2, 6.6, 5.3];
      for (var i = 0; i < 4; i++) {
        var ang = angs[i] * spread + Math.sin(t * 1.45 + i + angle) * 0.045;
        var len = lens[i];
        ctx.beginPath();
        ctx.moveTo(Math.sin(ang) * 1.8, -0.4);
        ctx.quadraticCurveTo(Math.sin(ang) * len * 0.55, -len * 0.6, Math.sin(ang) * len * 0.88, -len);
        ctx.strokeStyle = skinSh;
        ctx.lineWidth = 2.05 - i * 0.08;
        ctx.stroke();
        ctx.strokeStyle = skinHi;
        ctx.lineWidth = 1.05;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-3.4, 2);
      ctx.quadraticCurveTo(-6.8, 1, -6.2, -3);
      ctx.strokeStyle = skinMid;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.restore();
    }
    drawHand(-30, -10 + handBob, -0.38 + Math.sin(t * 0.68) * 0.06, 0.92);
    drawHand(14, 22, -0.82 + Math.sin(t * 0.52) * 0.04, 0.68);

    hairStrand(16, -40, 28, -18, 22, 0, 14, 14, 1.5, '#f0a090', t, 2.3, 2.2);

    var hum = 0.6 + 0.4 * Math.pow(0.5 + 0.5 * Math.sin(t * 3.05), 2);
    var speak = pulseAt(0.03, t);
    var pa = Math.min(1, 0.45 + hum * 0.4 + speak * 0.7);
    var pg = ctx.createRadialGradient(0.2, 10, 0.3, 1, 12, 8.5);
    pg.addColorStop(0, 'rgba(255,255,248,' + (0.55 + 0.45 * pa) + ')');
    pg.addColorStop(0.38, 'rgba(255, 214, 176, ' + (0.75 * pa) + ')');
    pg.addColorStop(0.72, 'rgba(130, 216, 220, ' + (0.32 * pa) + ')');
    pg.addColorStop(1, 'rgba(130, 216, 220, 0)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(1, 12, 8.2, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0.2, 10.6, 1.15, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    glowDot(4, 30, 3.3, 0.28 + 0.72 * pulseAt(0.1, t));
    glowDot(3.2, 42, 2.8, 0.22 + 0.7 * pulseAt(0.14, t));

    ctx.restore();
  }

  function drawScene(t) {
    var bob = Math.sin(t * 0.76) * 2.1;
    ctx.save();
    ctx.translate(0, bob);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var hx = spineX(108, t);
    var halo = ctx.createRadialGradient(hx, 96, 2, hx, 100, 46);
    halo.addColorStop(0, 'rgba(255, 88, 70, 0.15)');
    halo.addColorStop(1, 'rgba(255, 88, 70, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(hx, 98, 46, 0, TAU);
    ctx.fill();

    var mx = spineX(300, t);
    var sea = ctx.createRadialGradient(mx, 310, 2, mx, 310, 36);
    sea.addColorStop(0, 'rgba(150, 220, 210, 0.1)');
    sea.addColorStop(1, 'rgba(150, 220, 210, 0)');
    ctx.fillStyle = sea;
    ctx.beginPath();
    ctx.arc(mx, 310, 36, 0, TAU);
    ctx.fill();

    drawTail(t);
    drawUpper(t);
    ctx.restore();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    if (document.hidden) return;
    var t = now / 1000;
    var tx = Math.sin(t * 0.26) * 0.42;
    var ty = Math.sin(t * 0.18) * 0.2;
    if (pointer) {
      tx = Math.max(-1, Math.min(1, (pointer.x - 150) / 100));
      ty = Math.max(-1, Math.min(1, (pointer.y - 116) / 100));
    }
    var ease = 1 - Math.exp(-dt * 2.6);
    lookX += (tx - lookX) * ease;
    lookY += (ty - lookY) * ease;
    applyView();
    ctx.clearRect(-80, -80, 460, 560);
    drawScene(t);
  }

  function toView(e) {
    var rect = canvas.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    var s = Math.min(w / 300, h / 400);
    if (s <= 0) return null;
    return {
      x: (e.clientX - rect.left - (w - 300 * s) / 2) / s,
      y: (e.clientY - rect.top - (h - 400 * s) / 2) / s
    };
  }

  window.addEventListener('pointermove', function (e) {
    pointer = toView(e);
  }, { passive: true });
  window.addEventListener('pointerleave', function () { pointer = null; }, { passive: true });
  window.addEventListener('blur', function () { pointer = null; });
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(document.documentElement);
  resize();
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Redcrest of the Soundings",
  "statement": "She hung upright in the black water the way a candle stands in a still room, silver as a spoon, with a storm-lantern mane and two long fins trailed out like oars. The lights along her side blinked a slow question, and the whole watch forgot the words for answering."
}
```