```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title></title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }
  svg {
    display: block;
    width: 100vw;
    height: 100vh;
    background: transparent;
  }
  .bob { animation: bob 5.2s ease-in-out infinite; }
  @keyframes bob {
    0%,100% { transform: translateY(0px) rotate(-.4deg); }
    50% { transform: translateY(-9px) rotate(.5deg); }
  }
  .armR { transform-box: fill-box; transform-origin: 12% 88%; animation: wave 4.4s ease-in-out infinite; }
  @keyframes wave {
    0%,100% { transform: rotate(0deg); }
    50% { transform: rotate(-6deg); }
  }
  .armL { transform-box: fill-box; transform-origin: 88% 18%; animation: swayL 5s ease-in-out infinite; }
  @keyframes swayL {
    0%,100% { transform: rotate(0deg); }
    50% { transform: rotate(5deg); }
  }
  .pearlGlow { animation: pulse 2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes pulse {
    0%,100% { opacity:.35; transform: scale(.8); }
    50% { opacity:.9; transform: scale(1.35); }
  }
  .bubble { animation: rise 5s ease-in infinite; opacity: 0; }
  .b2 { animation-delay: 1.6s; animation-duration: 6s; }
  .b3 { animation-delay: 3.1s; animation-duration: 5.6s; }
  @keyframes rise {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    15% { opacity:.65; }
    85% { opacity:.45; }
    100% { transform: translateY(-120px) translateX(10px); opacity:0; }
  }
  .lid { transform-box: fill-box; transform-origin: center; animation: blink 5.8s infinite; }
  @keyframes blink {
    0%, 91%, 100% { transform: scaleY(0); }
    94%, 96% { transform: scaleY(1); }
  }
  .finHair { animation: shimmer 3.8s ease-in-out infinite; }
  @keyframes shimmer {
    0%,100% { opacity:.55; }
    50% { opacity:1; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe7cf"/>
      <stop offset=".55" stop-color="#f7c9a3"/>
      <stop offset="1" stop-color="#eaa985"/>
    </linearGradient>
    <linearGradient id="tent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7c4dbd"/>
      <stop offset=".45" stop-color="#315fbf"/>
      <stop offset=".78" stop-color="#149a9c"/>
      <stop offset="1" stop-color="#39c6a5"/>
    </linearGradient>
    <linearGradient id="tent2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9b6bff"/>
      <stop offset="1" stop-color="#16a6a0"/>
    </linearGradient>
    <linearGradient id="hairG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b174f"/>
      <stop offset=".55" stop-color="#55308e"/>
      <stop offset="1" stop-color="#127a8c"/>
    </linearGradient>
    <radialGradient id="pearlG" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".55" stop-color="#ffe9a8"/>
      <stop offset="1" stop-color="#f2a93b"/>
    </radialGradient>
    <radialGradient id="irisG" cx=".4" cy=".35" r=".8">
      <stop offset="0" stop-color="#b8fff1"/>
      <stop offset=".5" stop-color="#18b7ad"/>
      <stop offset="1" stop-color="#173f8f"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>

  <g class="bob" id="mermaid">
    <!-- back hair strands, drawn by script -->
    <g id="hairBack" fill="none" stroke-linecap="round"></g>

    <!-- tentacles, drawn by script -->
    <g id="tentacles"></g>
    <g id="suckers" fill="#ffd9e3"></g>

    <!-- left arm (behind torso) -->
    <g class="armL">
      <path d="M151 172 C126 188 112 210 121 232 C126 245 140 250 151 242" fill="none" stroke="#f3bd93" stroke-width="17" stroke-linecap="round"/>
      <path d="M151 242 l-10 7 M148 246 l-4 10 M155 245 l2 10" stroke="#f3bd93" stroke-width="5" stroke-linecap="round" fill="none"/>
    </g>

    <!-- torso -->
    <path d="M180 128 C158 132 144 148 143 172 C143 198 158 214 160 238 C161 254 170 262 180 262 C190 262 199 254 200 238 C202 214 217 198 217 172 C216 148 202 132 180 128 Z" fill="url(#skin)"/>
    <!-- chest / shell top -->
    <path d="M145 184 C158 168 174 172 180 186 C186 172 202 168 215 184 C210 202 196 210 180 210 C164 210 150 202 145 184 Z" fill="#7c3fa0"/>
    <path d="M152 188 C160 178 172 179 177 189 M183 189 C188 179 200 178 208 188" fill="none" stroke="#c99aff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <circle cx="180" cy="202" r="5" fill="url(#pearlG)"/>
    <!-- necklace -->
    <g fill="#fff3c4">
      <circle cx="162" cy="150" r="2.6"/><circle cx="170" cy="156" r="2.8"/><circle cx="180" cy="158" r="3.2"/>
      <circle cx="190" cy="156" r="2.8"/><circle cx="198" cy="150" r="2.6"/>
    </g>
    <!-- belly light -->
    <ellipse cx="180" cy="232" rx="15" ry="22" fill="#fff" opacity=".14"/>

    <!-- mantle skirt where human becomes octopus -->
    <path d="M158 238 C150 258 132 266 128 278 C150 286 162 276 172 288 C178 278 184 278 190 288 C200 276 212 286 232 278 C228 266 210 258 202 238 C190 250 170 250 158 238 Z" fill="url(#tent2)"/>
    <g fill="#d9b8ff" opacity=".75">
      <circle cx="152" cy="262" r="3"/><circle cx="180" cy="270" r="3.4"/><circle cx="208" cy="262" r="3"/>
    </g>

    <!-- right arm raised, holding a pearl -->
    <g class="armR">
      <path d="M209 170 C232 158 250 140 258 116" fill="none" stroke="#f7c79e" stroke-width="17" stroke-linecap="round"/>
      <path d="M258 116 l-3 -13 M260 117 l5 -12 M263 119 l11 -8" stroke="#f7c79e" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="260" cy="96" r="18" fill="#ffd968" opacity=".4" filter="url(#soft)" class="pearlGlow"/>
      <circle cx="260" cy="96" r="9" fill="url(#pearlG)"/>
      <circle cx="257" cy="93" r="2.6" fill="#fff"/>
      <path d="M200 166 a13 7 -25 1 0 18 10 a13 7 -25 1 0 -18 -10" fill="#f2b23c"/>
    </g>

    <!-- head -->
    <g id="head">
      <!-- hair mass -->
      <path d="M180 38 C142 38 132 72 136 104 C138 126 128 142 118 152 C140 158 148 140 150 124 C158 140 202 140 210 124 C212 140 220 158 242 152 C232 142 222 126 224 104 C228 72 218 38 180 38 Z" fill="url(#hairG)"/>
      <!-- face -->
      <path d="M180 52 C156 52 145 72 146 96 C147 122 162 142 180 142 C198 142 213 122 214 96 C215 72 204 52 180 52 Z" fill="url(#skin)"/>
      <!-- ears -->
      <circle cx="145" cy="100" r="7" fill="#f3bd93"/><circle cx="215" cy="100" r="7" fill="#f3bd93"/>
      <circle cx="144" cy="106" r="2.4" fill="#ffe36e"/>
      <circle cx="216" cy="106" r="2.4" fill="#ffe36e"/>

      <!-- front hair sweep -->
      <path d="M145 84 C146 52 164 40 180 40 C202 40 216 56 215 84 C204 64 192 58 176 62 C160 66 150 72 145 84 Z" fill="#24103f"/>
      <path class="finHair" d="M154 58 C166 46 188 44 200 54" fill="none" stroke="#35d0c0" stroke-width="3" stroke-linecap="round" opacity=".8"/>

      <!-- shell hairpin -->
      <g transform="translate(214 62) rotate(24)">
        <path d="M0 0 L10 -7 L13 3 L8 11 L-3 8 Z" fill="#ff8fb0"/>
        <path d="M1 1 L10 -4 M2 3 L12 2" stroke="#ffd3df" stroke-width="1.6"/>
      </g>

      <!-- brows -->
      <path d="M156 91 C162 86 171 86 176 90" fill="none" stroke="#4a254f" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M184 90 C189 86 198 86 204 91" fill="none" stroke="#4a254f" stroke-width="2.6" stroke-linecap="round"/>

      <!-- eyes -->
      <g>
        <path d="M155 100 C161 93 172 93 177 100 C172 106 161 106 155 100 Z" fill="#fff"/>
        <path d="M183 100 C188 93 199 93 205 100 C199 106 188 106 183 100 Z" fill="#fff"/>
        <g id="pupils">
          <circle cx="166" cy="100" r="6" fill="url(#irisG)"/><circle cx="166" cy="100" r="2.8" fill="#11152e"/><circle cx="164" cy="98" r="1.4" fill="#fff"/>
          <circle cx="194" cy="100" r="6" fill="url(#irisG)"/><circle cx="194" cy="100" r="2.8" fill="#11152e"/><circle cx="192" cy="98" r="1.4" fill="#fff"/>
        </g>
        <path d="M155 100 C161 93 172 93 177 100 M183 100 C188 93 199 93 205 100" fill="none" stroke="#3d2148" stroke-width="2.2" stroke-linecap="round"/>
        <g class="lid" fill="#f7c79e">
          <rect x="153" y="92" width="26" height="15" rx="7"/>
          <rect x="181" y="92" width="26" height="15" rx="7"/>
        </g>
      </g>

      <!-- nose, sly smile, blush -->
      <path d="M180 103 C178 110 177 114 181 116" fill="none" stroke="#d98d64" stroke-width="2" stroke-linecap="round"/>
      <path d="M168 124 C176 130 188 129 194 121" fill="none" stroke="#a83a5e" stroke-width="3" stroke-linecap="round"/>
      <circle cx="194" cy="126" r="2" fill="#a83a5e"/>
      <ellipse cx="156" cy="116" rx="8" ry="4.5" fill="#ff9d9d" opacity=".42"/>
      <ellipse cx="204" cy="116" rx="8" ry="4.5" fill="#ff9d9d" opacity=".42"/>
      <!-- freckle sparkles like tiny scales -->
      <g fill="#159a9c" opacity=".8"><circle cx="158" cy="111" r="1.3"/><circle cx="202" cy="111" r="1.3"/><circle cx="180" cy="136" r="1.2"/></g>
    </g>

    <!-- front drifting hair strands -->
    <g id="hairFront" fill="none" stroke-linecap="round"></g>

    <!-- bubbles from a quiet hum -->
    <g fill="none" stroke="#dffcf6" stroke-width="1.6">
      <circle class="bubble" cx="226" cy="132" r="5"/>
      <circle class="bubble b2" cx="234" cy="140" r="3.4"/>
      <circle class="bubble b3" cx="220" cy="144" r="2.4"/>
    </g>
  </g>
</svg>

<script>
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const tentG = document.getElementById('tentacles');
  const suckG = document.getElementById('suckers');
  const hairB = document.getElementById('hairBack');
  const hairF = document.getElementById('hairFront');
  const pupils = document.getElementById('pupils');
  const head = document.getElementById('head');
  const mer = document.getElementById('mermaid');

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  function smooth(pts) {
    if (pts.length < 3) return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += 'C' + (p1[0] + (p2[0]-p0[0])/6).toFixed(1) + ' ' + (p1[1] + (p2[1]-p0[1])/6).toFixed(1) + ' ' +
                 (p2[0] - (p3[0]-p1[0])/6).toFixed(1) + ' ' + (p2[1] - (p3[1]-p1[1])/6).toFixed(1) + ' ' +
                 p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  // Tentacle configuration: base angle in radians (down = PI/2), curl, length
  const tents = [
    { bx: 150, by: 272, ang: 2.25, len: 138, curl: -1.15, ph: 0.0, w: 23 },
    { bx: 162, by: 280, ang: 1.95, len: 158, curl:  1.05, ph: 1.1, w: 24 },
    { bx: 176, by: 284, ang: 1.62, len: 168, curl: -0.95, ph: 2.2, w: 25 },
    { bx: 190, by: 284, ang: 1.32, len: 162, curl:  1.10, ph: 3.0, w: 24 },
    { bx: 202, by: 280, ang: 1.05, len: 150, curl: -1.05, ph: 4.1, w: 23 },
    { bx: 212, by: 270, ang: 0.78, len: 132, curl:  1.25, ph: 5.2, w: 21 }
  ];
  tents.forEach((t, i) => {
    t.path = el('path', { fill: i % 2 ? 'url(#tent2)' : 'url(#tent)', stroke: 'rgba(220,190,255,.35)', 'stroke-width': 1 }, tentG);
    t.suckers = [];
    for (let s = 0; s < 6; s++) {
      t.suckers.push(el('circle', { r: 4 - s * 0.42, opacity: 0.55 - s * 0.04 }, suckG));
    }
    t.spots = [];
    for (let s = 0; s < 4; s++) {
      t.spots.push(el('circle', { r: 2.6 - s * 0.3, fill: '#e9d5ff', opacity: .35 }, tentG));
    }
  });

  const hairsBack = [];
  const backDefs = [
    { x: 140, y: 78, len: 190, w: 13, c: '#2b174f', ph: 0 },
    { x: 152, y: 64, len: 210, w: 10, c: '#4a257e', ph: 1.4 },
    { x: 208, y: 64, len: 205, w: 10, c: '#3b2068', ph: 2.6 },
    { x: 220, y: 80, len: 185, w: 13, c: '#173f63', ph: 3.8 }
  ];
  backDefs.forEach(d => {
    hairsBack.push({ ...d, path: el('path', { stroke: d.c, 'stroke-width': d.w, opacity: .92 }, hairB) });
  });
  const hairsFront = [];
  const frontDefs = [
    { x: 143, y: 96, len: 132, w: 6, c: '#5d3696', ph: .7 },
    { x: 217, y: 96, len: 126, w: 6, c: '#177e8c', ph: 2.0 },
    { x: 150, y: 74, len: 96,  w: 4, c: '#35c7ba', ph: 3.1 }
  ];
  frontDefs.forEach(d => {
    hairsFront.push({ ...d, path: el('path', { stroke: d.c, 'stroke-width': d.w, opacity: .9 }, hairF) });
  });

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / Math.max(1, window.innerWidth) - .5) * 2;
    ty = (e.clientY / Math.max(1, window.innerHeight) - .5) * 2;
  }, { passive: true });

  function hairPath(h, time) {
    const pts = [], N = 12;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const sway = Math.sin(time * 1.15 + h.ph + t * 3.4) * (4 + t * 17);
      const drift = Math.sin(time * .55 + h.ph) * t * 7;
      pts.push([h.x + sway + drift, h.y + t * h.len + Math.sin(t * Math.PI) * 5]);
    }
    return smooth(pts);
  }

  function frame(ms) {
    const time = ms * 0.001;
    mx += (tx - mx) * .045; my += (ty - my) * .045;

    // tentacles
    tents.forEach((t) => {
      const N = 15, center = [];
      let x = t.bx + mx * 5, y = t.by, a = t.ang + mx * .09;
      const step = t.len / N;
      for (let i = 0; i <= N; i++) {
        const p = i / N;
        center.push([x, y]);
        a += (t.curl * 0.10 * Math.pow(p, 1.2)) + Math.sin(time * 1.35 + t.ph + p * 4.2) * 0.028;
        x += Math.cos(a) * step;
        y += Math.sin(a) * step;
      }
      const L = [], R = [];
      center.forEach((p, i) => {
        const pgr = i / N;
        const q = center[Math.min(N, i + 1)], o = center[Math.max(0, i - 1)];
        let dx = q[0]-o[0], dy = q[1]-o[1];
        const m = Math.hypot(dx, dy) || 1; dx/=m; dy/=m;
        const w = (t.w * Math.pow(1 - pgr, .65) + 2.6) / 2;
        L.push([p[0] - dy * w, p[1] + dx * w]);
        R.push([p[0] + dy * w, p[1] - dx * w]);
      });
      t.path.setAttribute('d', smooth(L) + 'L' + R.reverse().map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L') + 'Z');
      t.suckers.forEach((s, si) => {
        const idx = 3 + si * 2, p = center[Math.min(N, idx)];
        s.setAttribute('cx', p[0]); s.setAttribute('cy', p[1]);
      });
      t.spots.forEach((s, si) => {
        const p = center[2 + si * 3];
        s.setAttribute('cx', p[0] + 4); s.setAttribute('cy', p[1] - 2);
      });
    });

    hairsBack.forEach(h => h.path.setAttribute('d', hairPath(h, time)));
    hairsFront.forEach(h => h.path.setAttribute('d', hairPath(h, time + .6)));

    pupils.setAttribute('transform', 'translate(' + (mx * 4.2).toFixed(2) + ' ' + (my * 2.4).toFixed(2) + ')');
    head.setAttribute('transform', 'translate(' + (mx * 4).toFixed(2) + ' ' + (Math.sin(time * .9) * 1.5).toFixed(2) + ') rotate(' + (mx * 3.2 + Math.sin(time * .7) * 1.1).toFixed(2) + ' 180 95)');
    mer.style.transform = 'translateX(' + (Math.sin(time * .5) * 3 + mx * 3).toFixed(2) + 'px)';

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
  "title": "The Sly Ink Singer",
  "statement": "I swear she wound eight soft arms round my anchor chain, sang one low note that made the lanterns sway, and tucked a warm pearl into my boot. When I looked down to thank her, there was only a curl of ink and she was gone, smiling somewhere below."
}
```