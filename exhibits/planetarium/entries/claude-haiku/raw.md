```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #03050d;
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
<canvas id="c"></canvas>
<script>
(function () {
  var cv = document.getElementById('c');
  var ctx = cv.getContext('2d');
  var W, H, dpr, CX, CY, S, R;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H / 2;
    S = Math.min(W, H) * 0.40;
    R = Math.hypot(W, H) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // Background sky: stars orbit slowly around the centre.
  var field = [];
  for (var i = 0; i < 520; i++) {
    field.push({
      r: Math.sqrt(Math.random()),
      th: Math.random() * Math.PI * 2,
      s: Math.random() < 0.08 ? 1.6 : (Math.random() < 0.3 ? 1.1 : 0.6),
      ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.8,
      warm: Math.random() < 0.12
    });
  }

  // Milky-way dust along a band that turns with the sky.
  var dust = [];
  var bandAngle = 0.8;
  for (var j = 0; j < 380; j++) {
    var u = (Math.random() * 2 - 1) * 1.1;
    var off = (Math.random() + Math.random() + Math.random() - 1.5) * 0.22;
    dust.push({
      u: u,
      off: off,
      s: 0.4 + Math.random() * 0.8,
      a: 0.15 + Math.random() * 0.35
    });
  }

  // The constellation: a hare sitting beside a steaming kettle.
  // Coordinates are in units where 1 = S pixels from the centre.
  var P = [
    [-0.62,  0.02],  // 0  nose
    [-0.42, -0.12],  // 1  brow
    [-0.36, -0.52],  // 2  near ear tip
    [-0.24, -0.20],  // 3  ear root
    [-0.18, -0.46],  // 4  far ear tip
    [-0.08, -0.10],  // 5  neck
    [ 0.10,  0.10],  // 6  back
    [ 0.36,  0.02],  // 7  rump
    [ 0.46,  0.30],  // 8  haunch
    [ 0.10,  0.36],  // 9  belly
    [-0.18,  0.40],  // 10 front paw
    [-0.30,  0.42],  // 11 paw tip
    [ 0.60, -0.34],  // 12 kettle lid
    [ 0.80, -0.08],  // 13 kettle shoulder
    [ 0.66,  0.20],  // 14 kettle foot
    [ 0.72, -0.48],  // 15 kettle handle top
    [ 0.66, -0.62],  // 16 steam
    [ 0.77, -0.74],  // 17 steam
    [ 0.62, -0.88]   // 18 steam
  ];
  var EYE = 1; // brow star doubles as the bright eye
  var SEGS = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [1, 3],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
    [9, 14], [12, 13], [13, 14], [14, 12], [12, 15], [15, 13],
    [16, 17], [17, 18]
  ];
  var MAG = [];
  for (var k = 0; k < P.length; k++) {
    MAG.push(0.8 + ((k * 37) % 11) / 14);
  }
  MAG[EYE] = 2.2;

  var CYCLE = 16;
  var T0 = performance.now() / 1000;

  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  function drawSky(t) {
    var g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
    g.addColorStop(0, '#16213f');
    g.addColorStop(0.55, '#0a1027');
    g.addColorStop(1, '#03050d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    var rot = t * 0.012;

    // Dust band
    for (var d = 0; d < dust.length; d++) {
      var q = dust[d];
      var ang = bandAngle + rot;
      var px = q.u * Math.cos(ang) - q.off * Math.sin(ang);
      var py = q.u * Math.sin(ang) + q.off * Math.cos(ang);
      var x = CX + px * R * 0.8;
      var y = CY + py * R * 0.8;
      ctx.globalAlpha = q.a * 0.6;
      ctx.fillStyle = '#b9c8ff';
      ctx.beginPath();
      ctx.arc(x, y, q.s * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Background stars
    for (var f = 0; f < field.length; f++) {
      var st = field[f];
      var th = st.th + rot * (0.6 + st.r * 0.4);
      var x2 = CX + Math.cos(th) * st.r * R;
      var y2 = CY + Math.sin(th) * st.r * R;
      var tw = 0.55 + 0.45 * Math.sin(t * st.sp + st.ph);
      ctx.globalAlpha = 0.25 + 0.75 * tw;
      ctx.fillStyle = st.warm ? '#ffe2c2' : '#dfe8ff';
      ctx.beginPath();
      ctx.arc(x2, y2, st.s * (0.7 + 0.3 * tw), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawConstellation(t) {
    var lt = t % CYCLE;
    // Visibility envelope
    var vis = smooth(lt / 2.0) * (1 - smooth((lt - 12.5) / 2.5));
    if (vis <= 0.001) return;

    var bob = Math.sin(t * 0.4) * 3;
    var pos = [];
    for (var i = 0; i < P.length; i++) {
      pos.push([CX + P[i][0] * S, CY + P[i][1] * S + bob]);
    }

    // Stars appear in sequence during 0.4 .. 2.6 s
    var starsIn = [];
    for (var s = 0; s < P.length; s++) {
      starsIn.push(smooth((lt - 0.4 - s * 0.08) / 0.5));
    }

    // Lines trace out between 2.6 .. 6.0 s
    var prog = clamp((lt - 2.6) / 3.4, 0, 1);
    var nSeg = SEGS.length;

    ctx.lineCap = 'round';
    for (var e = 0; e < nSeg; e++) {
      var a = SEGS[e][0], b = SEGS[e][1];
      var kk = clamp(prog * nSeg - e, 0, 1);
      if (kk <= 0) continue;
      var ax = pos[a][0], ay = pos[a][1];
      var bx = pos[b][0], by = pos[b][1];
      var ex = ax + (bx - ax) * kk;
      var ey = ay + (by - ay) * kk;
      ctx.globalAlpha = vis * 0.35;
      ctx.strokeStyle = '#ffd9a6';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.globalAlpha = vis * 0.9;
      ctx.strokeStyle = '#fff3dc';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Stars with halos
    for (var p = 0; p < P.length; p++) {
      var sa = starsIn[p] * vis;
      if (sa <= 0.001) continue;
      var x = pos[p][0], y = pos[p][1];
      var m = MAG[p];
      var pulse = 0.85 + 0.15 * Math.sin(t * 2.3 + p);
      var rad = m * 14 * pulse;
      var gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
      gg.addColorStop(0, 'rgba(255,248,230,' + (0.95 * sa) + ')');
      gg.addColorStop(0.25, 'rgba(255,214,160,' + (0.45 * sa) + ')');
      gg.addColorStop(1, 'rgba(255,200,140,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = sa;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 1.4 * m, 0, Math.PI * 2);
      ctx.fill();
    }

    // Steam wisps: small drifting sparkles above the kettle
    if (prog >= 1) {
      for (var w = 0; w < 9; w++) {
        var life = (t * 0.35 + w / 9) % 1;
        var sx = CX + 0.70 * S + Math.sin(life * 6.28 + w) * 6;
        var sy = CY - 0.62 * S + bob - life * 26;
        ctx.globalAlpha = vis * (1 - life) * 0.7;
        ctx.fillStyle = '#fff5e4';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // A small ember runs along the figure while it is held
    if (lt > 6.0 && lt < 12.5) {
      var ph = ((lt - 6.0) * 0.9) % nSeg;
      var idx = Math.floor(ph);
      var fr = ph - idx;
      var sg = SEGS[idx];
      var ax2 = pos[sg[0]][0], ay2 = pos[sg[0]][1];
      var bx2 = pos[sg[1]][0], by2 = pos[sg[1]][1];
      var ex2 = ax2 + (bx2 - ax2) * fr;
      var ey2 = ay2 + (by2 - ay2) * fr;
      var eg = ctx.createRadialGradient(ex2, ey2, 0, ex2, ey2, 10);
      eg.addColorStop(0, 'rgba(255,190,120,' + (0.9 * vis) + ')');
      eg.addColorStop(1, 'rgba(255,190,120,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex2, ey2, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function frame() {
    var t = performance.now() / 1000 - T0;
    ctx.clearRect(0, 0, W, H);
    drawSky(t);
    drawConstellation(t);
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
  "title": "The Kettle Hare",
  "statement": "On the longest night a hare sat by the sea and promised to warm the sleeping moon's milk in a kettle of starlight, but every time she bent to light the fire she forgot which star was the flame. The sky remembers her by the steam that still rises from her kettle, and the faint thread of stars that says she has not finished yet."
}
```