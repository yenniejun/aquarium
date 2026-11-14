```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Mending Moth</title>
<style>
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #000;
  }
  canvas {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
  }
</style>
</head>
<body>
<canvas id="sky"></canvas>
<script>
(function () {
  var cv = document.getElementById('sky');
  var ctx = cv.getContext('2d');
  var W, H, R, CX, CY, DPR, K;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Background field of stars, stored in polar form so the sky can turn slowly
  var field = [];
  for (var n = 0; n < 280; n++) {
    field.push({
      r: Math.sqrt(Math.random()) * 1.45,
      th: Math.random() * Math.PI * 2,
      s: Math.random() * 1.3 + 0.3,
      ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 2.2,
      warm: Math.random() < 0.12
    });
  }

  // Constellation: a mending moth. Coordinates in a unit space, y grows downward.
  // 0 head, 1-2 antennae, 3 thorax, 4 abdomen, 5 tail, 6-9 left wing, 10-13 right wing, 14 lantern heart
  var STARS = [
    { x: 0,     y: -0.42 },
    { x: -0.16, y: -0.72 },
    { x: 0.16,  y: -0.72 },
    { x: 0,     y: -0.2 },
    { x: 0,     y: 0.22 },
    { x: 0,     y: 0.46 },
    { x: -0.78, y: -0.4 },
    { x: -0.42, y: -0.14 },
    { x: -0.55, y: 0.3 },
    { x: -0.2,  y: 0.5 },
    { x: 0.78,  y: -0.4 },
    { x: 0.42,  y: -0.14 },
    { x: 0.55,  y: 0.3 },
    { x: 0.2,   y: 0.5 },
    { x: 0,     y: -0.02 }
  ];
  var EDGES = [
    [0, 1], [0, 2], [0, 3], [3, 4], [4, 5],
    [3, 7], [7, 6], [6, 8], [8, 9], [9, 4],
    [3, 11], [11, 10], [10, 12], [12, 13], [13, 4]
  ];
  var PATH = [3, 7, 6, 8, 9, 4, 13, 12, 10, 11, 3];
  var LANTERN = 14;
  var CYCLE = 16;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W / 2;
    CY = H / 2;
    R = Math.min(W, H) / 2;
    K = R * 0.62;
  }
  window.addEventListener('resize', resize);
  resize();

  // Wings are active while the moth is awake, fading in and out
  function wingAmt(ph) {
    return clamp((ph - 5.5) / 1.5, 0, 1) * (1 - clamp((ph - 12) / 2, 0, 1));
  }

  function pos(i, ph, t) {
    var s = STARS[i];
    var x = s.x, y = s.y;
    if (i >= 6 && i <= 13) {
      var f = 0.035 * Math.sin(ph * 2.6) * wingAmt(ph);
      x = x * (1 + f);
      y = y + 0.01 * Math.sin(ph * 2.6 + i) * wingAmt(ph);
    }
    return { x: CX + x * K, y: CY + y * K };
  }

  function glowStar(x, y, r, color, alpha) {
    if (alpha <= 0) return;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
    g.addColorStop(0, color.replace('A', (0.55 * alpha).toFixed(3)));
    g.addColorStop(1, color.replace('A', '0'));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,' + clamp(alpha, 0, 1).toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  var t0 = performance.now();

  function frame(now) {
    var t = (now - t0) / 1000;
    var ph = t % CYCLE;
    var out = 1 - clamp((ph - 12.5) / 3, 0, 1);

    // Night sky
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#02030a';
    ctx.fillRect(0, 0, W, H);

    var neb = ctx.createRadialGradient(CX - R * 0.25, CY - R * 0.3, 0, CX, CY, R * 1.15);
    neb.addColorStop(0, 'rgba(38,46,96,0.55)');
    neb.addColorStop(0.6, 'rgba(14,18,44,0.35)');
    neb.addColorStop(1, 'rgba(2,3,10,0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, W, H);

    var rot = t * 0.018;
    for (var b = 0; b < field.length; b++) {
      var f = field[b];
      var a = f.th + rot;
      var x = CX + Math.cos(a) * f.r * R;
      var y = CY + Math.sin(a) * f.r * R;
      var tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * f.sp + f.ph));
      ctx.fillStyle = f.warm ? 'rgba(255,220,180,' + (0.8 * tw).toFixed(3) + ')'
                             : 'rgba(210,225,255,' + (0.85 * tw).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, f.s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stitches: each edge is sewn in, one after another
    for (var k = 0; k < EDGES.length; k++) {
      var p = clamp((ph - 3 - 0.15 * k) / 0.6, 0, 1) * out;
      if (p <= 0) continue;
      var A = pos(EDGES[k][0], ph, t);
      var B = pos(EDGES[k][1], ph, t);
      var E = { x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p) };

      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(150,200,255,' + (0.12 * p).toFixed(3) + ')';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(E.x, E.y);
      ctx.stroke();

      ctx.setLineDash([2, 5]);
      ctx.lineDashOffset = -t * 12;
      ctx.strokeStyle = 'rgba(225,240,255,' + (0.85 * p).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(E.x, E.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Stars of the moth
    var lanternBoost = clamp((ph - 6) / 1, 0, 1) * (1 - clamp((ph - 12) / 2, 0, 1));
    for (var i = 0; i < STARS.length; i++) {
      var appear = clamp((ph - 0.12 * i) / 0.7, 0, 1) * out;
      if (appear <= 0) continue;
      var P = pos(i, ph, t);
      if (i === LANTERN) {
        var pulse = 1 + 0.15 * Math.sin(t * 2.1);
        var r = (3.2 + 2.2 * lanternBoost) * pulse;
        glowStar(P.x, P.y, r, 'rgba(255,190,110,A)', appear);
      } else {
        var tw2 = 0.85 + 0.15 * Math.sin(t * 3 + i);
        glowStar(P.x, P.y, 2.1, 'rgba(190,220,255,A)', appear * tw2);
      }
    }

    // A spark travels around the moth's outline while the wings are awake
    var u = (ph - 6) / 4;
    if (u >= 0 && u <= 1 && out > 0) {
      var L = PATH.length - 1;
      var fpos = u * L;
      var seg = Math.min(Math.floor(fpos), L - 1);
      var loc = fpos - seg;
      var SA = pos(PATH[seg], ph, t);
      var SB = pos(PATH[seg + 1], ph, t);
      var sp = { x: lerp(SA.x, SB.x, loc), y: lerp(SA.y, SB.y, loc) };
      glowStar(sp.x, sp.y, 2.6, 'rgba(255,230,190,A)', 0.9 * out);
    }

    // Feather-light vignette so the edge of the porthole stays soft
    var vg = ctx.createRadialGradient(CX, CY, R * 0.7, CX, CY, R * 1.02);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

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
  "title": "The Mending Moth",
  "statement": "Each night a moth made of silver thread flies the torn places of the dark and stitches them shut with its own small lantern, which is why the sky never quite unravels. When the lantern gutters out the stitches loosen, and the moth sleeps folded until the stars are sewn back in."
}
```