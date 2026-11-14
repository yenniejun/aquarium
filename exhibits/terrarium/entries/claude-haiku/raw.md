```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Patient Lanternbloom</title>
<style>
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }
  canvas {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function () {
  var cv = document.getElementById('c');
  var ctx = cv.getContext('2d');
  var TAU = Math.PI * 2;
  var dpr = 1, vw = 1, vh = 1, k = 1, ox = 0, oy = 0;
  var D = 1;   // overall brightness, set each frame
  var NIGHT = 0;

  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function sm(a, b, x) {
    var u = clamp((x - a) / (b - a), 0, 1);
    return u * u * (3 - 2 * u);
  }
  function rnd(i) {
    var x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function hsl(h, s, l, a) {
    var ll = l * D;
    return 'hsla(' + h.toFixed(1) + ',' + s.toFixed(1) + '%,' + ll.toFixed(1) + '%,' + (a === undefined ? 1 : a) + ')';
  }

  // Logical design space is 300 x 400, scaled to fit the viewport.
  function resize() {
    dpr = window.devicePixelRatio || 1;
    vw = window.innerWidth;
    vh = window.innerHeight;
    cv.width = Math.max(1, Math.round(vw * dpr));
    cv.height = Math.max(1, Math.round(vh * dpr));
    k = Math.min(vw / 300, vh / 400);
    ox = (vw - 300 * k) / 2;
    oy = (vh - 400 * k) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  function stateAt(t) {
    var g = t < 10 ? sm(0, 10, t) : (t < 34 ? 1 : 1 - sm(34, 40, t));
    var f = sm(16, 20, t);
    var n = sm(17, 21, t) * (1 - sm(36, 40, t));
    var bloom = sm(7, 10, t) * (1 - sm(16, 20, t));
    return { g: g, f: f, n: n, bloom: bloom };
  }

  var BASE = { x: 150, y: 346 };

  function soil(S) {
    ctx.beginPath();
    ctx.moveTo(28, 352);
    ctx.bezierCurveTo(60, 336, 240, 336, 272, 352);
    ctx.lineTo(272, 384);
    ctx.lineTo(28, 384);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, 336, 0, 384);
    grad.addColorStop(0, hsl(24, 36, 26));
    grad.addColorStop(1, hsl(22, 40, 14));
    ctx.fillStyle = grad;
    ctx.fill();

    for (var i = 0; i < 28; i++) {
      var px = 40 + rnd(i) * 220;
      var py = 356 + rnd(i * 3 + 1) * 24;
      var r = 1.2 + rnd(i * 5 + 2) * 2.2;
      ctx.beginPath();
      ctx.ellipse(px, py, r * 1.3, r, 0, 0, TAU);
      ctx.fillStyle = hsl(30, 8, 38 + rnd(i * 7) * 14);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(px - r * 0.3, py - r * 0.35, r * 0.4, r * 0.25, 0, 0, TAU);
      ctx.fillStyle = hsl(30, 10, 62, 0.5);
      ctx.fill();
    }
  }

  function stemPt(s, sway, H) {
    var p0x = BASE.x, p0y = BASE.y;
    var p1x = BASE.x + sway * 0.3, p1y = BASE.y - H * 0.55;
    var p2x = BASE.x + sway, p2y = BASE.y - H;
    var a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c = s * s;
    return {
      x: a * p0x + b * p1x + c * p2x,
      y: a * p0y + b * p1y + c * p2y
    };
  }

  function draw() {
    var now = Date.now() / 1000;
    var t = now % 40;
    var S = stateAt(t);
    NIGHT = S.n;
    D = 1 - 0.4 * S.n;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);

    soil(S);

    var sway = Math.sin(now * 0.9) * 4 * (0.3 + S.g) + Math.sin(now * 0.37) * 2;
    var H = 190 * S.g;
    var tip = stemPt(1, sway, H);

    // Stem
    if (S.g > 0.01) {
      ctx.beginPath();
      ctx.moveTo(BASE.x, BASE.y);
      ctx.quadraticCurveTo(BASE.x + sway * 0.3, BASE.y - H * 0.55, tip.x, tip.y);
      ctx.strokeStyle = hsl(122, 42, 34);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Fronds
    for (var i = 0; i < 6; i++) {
      var s = 0.28 + i * 0.12;
      var P = stemPt(s, sway, H);
      var side = (i % 2) ? 1 : -1;
      var a = side * (0.95 - i * 0.08);
      a = a * (1 - 0.85 * S.f) + Math.sin(now * 1.1 + i * 1.7) * 0.07 * (1 - S.f);
      var gl = clamp(S.g * 1.4 - i * 0.1, 0, 1);
      var L = (36 - i * 3) * gl;
      if (L < 0.5) continue;

      var dx0 = Math.sin(a), dy0 = -Math.cos(a);
      var droop = L * 0.35 * (1 - S.f * 0.9);
      var T = { x: P.x + dx0 * L, y: P.y + dy0 * L + droop * 0.6 };
      var C = { x: P.x + dx0 * L * 0.5, y: P.y + dy0 * L * 0.5 + droop };
      var hue = 140 + i * 6;

      // Frond rib
      ctx.beginPath();
      ctx.moveTo(P.x, P.y);
      ctx.quadraticCurveTo(C.x, C.y, T.x, T.y);
      ctx.strokeStyle = hsl(hue, 45, 36);
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Leaflets
      for (var u = 0.15; u <= 0.95; u += 0.08) {
        var bx = (1 - u) * (1 - u) * P.x + 2 * (1 - u) * u * C.x + u * u * T.x;
        var by = (1 - u) * (1 - u) * P.y + 2 * (1 - u) * u * C.y + u * u * T.y;
        var ddx = 2 * (1 - u) * (C.x - P.x) + 2 * u * (T.x - C.x);
        var ddy = 2 * (1 - u) * (C.y - P.y) + 2 * u * (T.y - C.y);
        var ln = Math.hypot(ddx, ddy) || 1;
        var tx = ddx / ln, ty = ddy / ln;
        var nx = -ty, ny = tx;
        var ls = (Math.floor(u * 10) % 2) ? 1 : -1;
        var vx = nx * ls * 0.8 + tx * 0.5;
        var vy = ny * ls * 0.8 + ty * 0.5;
        var vl = Math.hypot(vx, vy) || 1;
        vx /= vl; vy /= vl;
        var leafLen = (1 - u * 0.6) * 7 * gl;
        var cx = bx + vx * leafLen / 2, cy = by + vy * leafLen / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, leafLen / 2, 1.8 * gl + 0.6, Math.atan2(vy, vx), 0, TAU);
        ctx.fillStyle = hsl(hue + u * 10, 55, 40 + u * 6, 0.95);
        ctx.fill();
      }

      // Fiddlehead spiral at frond tip
      var spiralScale = gl * (1 - S.f * 0.5);
      ctx.beginPath();
      for (var j = 0; j <= 40; j++) {
        var th = j * 0.35;
        var r = (0.5 + j * 0.09) * spiralScale;
        var sx = T.x + Math.cos(th) * r;
        var sy = T.y + Math.sin(th) * r;
        if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = hsl(hue + 8, 50, 46);
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    // Blossom petals (open by day)
    if (S.bloom > 0.01) {
      for (var p = 0; p < 6; p++) {
        var pa = p * TAU / 6 + now * 0.05;
        var pr = 7 * S.bloom;
        ctx.beginPath();
        ctx.ellipse(tip.x + Math.cos(pa) * pr, tip.y + Math.sin(pa) * pr,
          6 * S.bloom + 0.5, 3.2 * S.bloom + 0.3, pa, 0, TAU);
        ctx.fillStyle = hsl(330 + p * 4, 70, 72, 0.85);
        ctx.fill();
      }
    }

    // Lantern (bud by night, glowing orb)
    if (S.g > 0.05) {
      var glowA = 0.12 + 0.7 * S.n;
      var halo = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 24);
      halo.addColorStop(0, 'rgba(255,226,160,' + (glowA * 0.9).toFixed(3) + ')');
      halo.addColorStop(1, 'rgba(255,226,160,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 24, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(tip.x, tip.y, 2.6 + 1.4 * S.f, 3.4 + 1.6 * S.f, 0, 0, TAU);
      ctx.fillStyle = 'rgba(255,' + Math.round(220 + 20 * S.n) + ',' + Math.round(150 + 60 * S.n) + ',' + (0.55 + 0.4 * S.n).toFixed(3) + ')';
      ctx.fill();
    }

    // Seed-motes drifting up on moonlit nights
    if (S.n > 0.02 && S.g > 0.5) {
      for (var m = 0; m < 14; m++) {
        var cyc = (((t - 20 + m * 0.7) % 5) + 5) % 5 / 5;
        var alpha = Math.sin(Math.PI * cyc) * S.n * 0.9 * S.g;
        if (alpha < 0.01) continue;
        var mx = tip.x + Math.sin(m * 2.3 + cyc * 4) * (6 + 8 * cyc);
        var my = tip.y - cyc * (50 + rnd(m) * 25);
        ctx.beginPath();
        ctx.arc(mx, my, 0.9 + rnd(m + 40) * 0.6, 0, TAU);
        ctx.fillStyle = 'rgba(255,245,200,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Patient Lanternbloom",
  "statement": "A fern that unrolls from a seed at dawn, blooms at noon, and folds around a glowing lantern at dusk. At night it releases drifting seed-motes into the moonlight, then curls back into a seed before the sun returns."
}
```