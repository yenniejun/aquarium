```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{height:100%;margin:0;overflow:hidden;background:transparent;touch-action:pan-y}
svg{position:fixed;inset:0;width:100%;height:100%;display:block}
#mermaid,#tail,.hair,#armL,#armR,#fin{will-change:transform}
</style>
</head>
<body>
<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe3d6"/>
      <stop offset=".55" stop-color="#f7bfae"/>
      <stop offset="1" stop-color="#e79a97"/>
    </linearGradient>
    <linearGradient id="tailG" gradientUnits="userSpaceOnUse" x1="150" y1="220" x2="220" y2="335">
      <stop offset="0" stop-color="#a8fff0"/>
      <stop offset=".45" stop-color="#4fd0c3"/>
      <stop offset="1" stop-color="#187f8f"/>
    </linearGradient>
    <linearGradient id="hairG" gradientUnits="userSpaceOnUse" x1="150" y1="76" x2="150" y2="260">
      <stop offset="0" stop-color="#eafffb"/>
      <stop offset=".5" stop-color="#86ead9"/>
      <stop offset="1" stop-color="#2aa79b"/>
    </linearGradient>
  </defs>
  <g id="mermaid">
    <g fill="none" stroke="url(#hairG)" stroke-linecap="round">
      <path class="hair" stroke-width="15" d="M145 82 C112 94 96 126 102 160 C107 190 92 216 76 236"/>
      <path class="hair" stroke-width="15" d="M155 82 C188 94 204 126 198 160 C193 192 210 218 226 238"/>
      <path class="hair" stroke-width="10" d="M139 88 C120 114 118 146 128 176 C136 200 128 226 116 250"/>
      <path class="hair" stroke-width="10" d="M161 88 C180 114 182 146 172 176 C164 200 172 226 184 250"/>
      <path class="hair" stroke-width="12" d="M150 80 C151 112 145 142 150 176 C155 206 147 232 150 258"/>
      <path class="hair" stroke-width="8" opacity=".85" d="M133 96 C124 122 130 148 124 172"/>
      <path class="hair" stroke-width="8" opacity=".85" d="M167 96 C176 122 170 148 176 172"/>
    </g>
    <g id="tail">
      <path d="M150 220 C135 252 138 288 163 313" fill="none" stroke="#123f4b" stroke-width="31" stroke-linecap="round" opacity=".28"/>
      <path d="M150 220 C135 252 138 288 163 313" fill="none" stroke="url(#tailG)" stroke-width="26" stroke-linecap="round"/>
      <path d="M163 313 C178 331 201 335 217 320" fill="none" stroke="#123f4b" stroke-width="25" stroke-linecap="round" opacity=".28"/>
      <path d="M163 313 C178 331 201 335 217 320" fill="none" stroke="url(#tailG)" stroke-width="20" stroke-linecap="round"/>
      <path d="M217 320 C231 307 230 288 215 281 C202 275 190 283 192 295 C194 307 207 311 213 302" fill="none" stroke="#123f4b" stroke-width="18" stroke-linecap="round" opacity=".28"/>
      <path d="M217 320 C231 307 230 288 215 281 C202 275 190 283 192 295 C194 307 207 311 213 302" fill="none" stroke="url(#tailG)" stroke-width="13" stroke-linecap="round"/>
      <path d="M146 232 C138 258 143 286 162 306" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".25"/>
      <path d="M193 294 C196 302 204 304 208 298" fill="none" stroke="#eafffb" stroke-width="5" stroke-linecap="round" opacity=".8"/>
      <g id="ridges" stroke="#0b5d6b" stroke-width="3" stroke-linecap="round" opacity=".3">
        <path d="M141 246 l15 7"/>
        <path d="M143 268 l16 5"/>
        <path d="M150 291 l15 2"/>
        <path d="M166 309 l14 -3"/>
        <path d="M188 323 l13 -7"/>
        <path d="M210 315 l10 -9"/>
      </g>
      <path id="fin" d="M188 244 C206 232 226 235 238 249 C224 253 206 259 190 256 Z" fill="#a9f7ec" opacity=".8" stroke="#187f8f" stroke-width="2"/>
    </g>
    <g id="torso">
      <path d="M143 140 L157 140 L158 164 L142 164 Z" fill="url(#skin)" stroke="#5b3a44" stroke-width="2"/>
      <path d="M118 178 C126 158 138 149 150 149 C162 149 174 158 182 178 C191 199 189 222 176 238 C165 249 135 249 124 238 C111 222 109 199 118 178 Z" fill="url(#skin)" stroke="#5b3a44" stroke-width="2.5"/>
      <path d="M132 184 C140 192 160 192 168 184" fill="none" stroke="#ffffff" stroke-width="3" opacity=".35" stroke-linecap="round"/>
    </g>
    <g id="armL">
      <path d="M126 180 C110 194 102 214 108 232" fill="none" stroke="#5b3a44" stroke-width="17" stroke-linecap="round"/>
      <path d="M126 180 C110 194 102 214 108 232" fill="none" stroke="#f6bca9" stroke-width="12" stroke-linecap="round"/>
      <circle cx="108" cy="232" r="8" fill="#f6bca9" stroke="#5b3a44" stroke-width="2.5"/>
    </g>
    <g id="armR">
      <path d="M174 180 C191 190 201 205 197 223" fill="none" stroke="#5b3a44" stroke-width="17" stroke-linecap="round"/>
      <path d="M174 180 C191 190 201 205 197 223" fill="none" stroke="#f6bca9" stroke-width="12" stroke-linecap="round"/>
      <circle cx="197" cy="223" r="8" fill="#f6bca9" stroke="#5b3a44" stroke-width="2.5"/>
    </g>
    <g id="head">
      <ellipse cx="150" cy="116" rx="32" ry="35" fill="url(#skin)" stroke="#5b3a44" stroke-width="2.5"/>
      <path d="M137 82 L142 66 L150 79 L158 66 L163 82 Z" fill="url(#tailG)" stroke="#187f8f" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="128" cy="131" rx="6" ry="4" fill="#ff9aa8" opacity=".45"/>
      <ellipse cx="172" cy="131" rx="6" ry="4" fill="#ff9aa8" opacity=".45"/>
      <g transform="translate(138 115)"><g id="eyeL"><circle r="4.6" fill="#21323a"/><circle cx="1.6" cy="-1.6" r="1.5" fill="#ffffff" opacity=".9"/></g></g>
      <g transform="translate(162 115)"><g id="eyeR"><circle r="4.6" fill="#21323a"/><circle cx="1.6" cy="-1.6" r="1.5" fill="#ffffff" opacity=".9"/></g></g>
      <path d="M150 123 q3 4 0 8" fill="none" stroke="#b76b6b" stroke-width="2" stroke-linecap="round"/>
      <ellipse id="mouth" cx="150" cy="138" rx="4.6" ry="2.8" fill="#8a3b4a" stroke="#5b3a44" stroke-width="1.8"/>
    </g>
    <g fill="none" stroke="url(#hairG)" stroke-linecap="round" opacity=".95">
      <path class="hair" stroke-width="7" d="M133 94 C124 118 129 144 122 168"/>
      <path class="hair" stroke-width="7" d="M167 94 C176 118 171 144 178 168"/>
      <path class="hair" stroke-width="6" d="M150 82 C145 106 155 130 150 154"/>
    </g>
  </g>
</svg>
<script>
(() => {
  const get = id => document.getElementById(id);
  const mer = get('mermaid'), tail = get('tail'), armL = get('armL'), armR = get('armR');
  const fin = get('fin'), eyeL = get('eyeL'), eyeR = get('eyeR'), mouth = get('mouth'), ridges = get('ridges');
  const hairs = Array.from(document.querySelectorAll('.hair'));
  const TAU = Math.PI * 2;
  let tx = 0, ty = 0, cx = 0, cy = 0, lastMove = -1e9;
  addEventListener('pointermove', e => {
    const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight);
    tx = Math.max(-1, Math.min(1, (e.clientX / w - .5) * 2));
    ty = Math.max(-1, Math.min(1, (e.clientY / h - .5) * 2));
    lastMove = performance.now();
  }, { passive: true });
  const t0 = performance.now();
  const speeds = [6.4, 7.8, 5.6, 8.6, 6.9, 7.3, 6.1, 7.6, 6.7];
  function frame(now) {
    const t = (now - t0) / 1000;
    if (now - lastMove > 160) { tx *= .985; ty *= .985; }
    cx += (tx - cx) * .05;
    cy += (ty - cy) * .05;
    const bob = Math.sin(t * TAU / 7.4) * -8;
    const tilt = cx * 2.4 + Math.sin(t * TAU / 11) * .7;
    mer.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) rotate(${tilt.toFixed(2)} 150 205)`);
    const tailA = Math.sin(t * TAU / 5.6) * 3.2 + Math.sin(t * TAU / 2.9) * 1.1 + cx * 3.5;
    const tailX = Math.sin(t * TAU / 3.7) * 3 + cx * 4;
    tail.setAttribute('transform', `translate(${tailX.toFixed(2)} 0) rotate(${tailA.toFixed(2)} 150 224)`);
    hairs.forEach((h, i) => {
      const sp = speeds[i % speeds.length], ph = i * 1.31;
      const a = Math.sin(t * TAU / sp + ph) * 3.3 + Math.sin(t * TAU / (sp * .53) + ph * 2) * 1.3 + cx * (2 + i * .3);
      const x = Math.sin(t * TAU / (sp * .71) + ph) * 3 + cx * 5;
      h.setAttribute('transform', `translate(${x.toFixed(2)} 0) rotate(${a.toFixed(2)} 150 104)`);
    });
    armR.setAttribute('transform', `rotate(${(Math.sin(t * TAU / 4.8) * -10 + cx * -5).toFixed(2)} 176 178)`);
    armL.setAttribute('transform', `rotate(${(Math.sin(t * TAU / 6.2 + 1.2) * 6.5 + cy * 3).toFixed(2)} 124 178)`);
    fin.setAttribute('transform', `rotate(${(Math.sin(t * TAU / 2.8) * 13).toFixed(2)} 196 246)`);
    const bp = (t % 5.8) / 5.8;
    const s = (bp > .93 && bp < .975) ? .08 : 1;
    eyeL.setAttribute('transform', `scale(1 ${s.toFixed(3)})`);
    eyeR.setAttribute('transform', `scale(1 ${s.toFixed(3)})`);
    const hum = .5 + .5 * Math.sin(t * TAU / 3.7);
    mouth.setAttribute('ry', (2 + 2.5 * hum).toFixed(2));
    mouth.setAttribute('rx', (4.2 + hum).toFixed(2));
    ridges.setAttribute('opacity', (.24 + .22 * (.5 + .5 * Math.sin(t * TAU / 5.6 + .8))).toFixed(3));
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
  "title": "The Spiral Psalter",
  "statement": "Sailors swear a seahorse-tailed singer lives in every bottle, humming the tune you were about to forget. I held mine to my ear, and it hummed back the one my grandmother used to sing."
}
```