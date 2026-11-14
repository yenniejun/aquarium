```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tarot Artwork</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; height:100%; overflow:hidden; background:#0a120f; }
  body { position:fixed; inset:0; }
  svg { display:block; width:100vw; height:100vh; width:100dvw; height:100dvh; }

  .wingL, .wingR, .armL, .armR, .hairStrand, .antenna, .mist, .haloPulse, .dressSway {
    transform-box: view-box;
  }
  .wingL { transform-origin: 202px 272px; animation: flutterL 3.4s ease-in-out infinite; }
  .wingR { transform-origin: 198px 272px; animation: flutterR 3.4s ease-in-out infinite; }
  @keyframes flutterL {
    0%,100% { transform: rotate(4deg) scaleX(1); }
    28% { transform: rotate(-11deg) scaleX(.86); }
    52% { transform: rotate(7deg) scaleX(1.02); }
    74% { transform: rotate(-7deg) scaleX(.9); }
  }
  @keyframes flutterR {
    0%,100% { transform: rotate(-4deg) scaleX(1); }
    28% { transform: rotate(11deg) scaleX(.86); }
    52% { transform: rotate(-7deg) scaleX(1.02); }
    74% { transform: rotate(7deg) scaleX(.9); }
  }
  .armL { transform-origin: 184px 272px; animation: armSwayL 5s ease-in-out infinite; }
  .armR { transform-origin: 216px 272px; animation: armSwayR 5.5s ease-in-out infinite; }
  @keyframes armSwayL { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-7deg)} }
  @keyframes armSwayR { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(9deg)} }
  .hairStrand { animation: hairFlow 4.2s ease-in-out infinite; }
  .hairStrand:nth-child(odd){ animation-duration:5.1s; animation-delay:-1.4s; }
  @keyframes hairFlow { 0%,100%{transform:rotate(0deg) translateX(0)} 50%{transform:rotate(2deg) translateX(-3px)} }
  .haloPulse { transform-origin:200px 265px; animation: halo 6s ease-in-out infinite; }
  @keyframes halo { 0%,100%{transform:scale(1); opacity:.85} 50%{transform:scale(1.045); opacity:1} }
  .mist { animation: mistDrift 11s ease-in-out infinite alternate; }
  .mist2 { animation-duration:15s; animation-delay:-6s; }
  @keyframes mistDrift { from{transform:translateX(-16px)} to{transform:translateX(18px)} }
  .dressSway { transform-origin:200px 255px; animation: sway 4.8s ease-in-out infinite; }
  @keyframes sway { 0%,100%{transform:rotate(-1.2deg)} 50%{transform:rotate(1.4deg)} }
  .glowDot { animation: pulseGlow 2.8s ease-in-out infinite; }
  .glowDot:nth-child(2n){ animation-delay:-1.2s; }
  @keyframes pulseGlow { 0%,100%{opacity:.45} 50%{opacity:1} }
  .eye { transform-box: fill-box; transform-origin:center; transition: transform .08s linear; }
</style>
</head>
<body>
<svg id="scene" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="85%">
      <stop offset="0%" stop-color="#23473d"/>
      <stop offset="34%" stop-color="#12251f"/>
      <stop offset="68%" stop-color="#160f0b"/>
      <stop offset="100%" stop-color="#070908"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#b8ffe9" stop-opacity=".34"/>
      <stop offset="42%" stop-color="#4fae94" stop-opacity=".22"/>
      <stop offset="72%" stop-color="#c75b26" stop-opacity=".10"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wingL" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5fc0a5"/>
      <stop offset="38%" stop-color="#7a4a28"/>
      <stop offset="70%" stop-color="#c85f24"/>
      <stop offset="100%" stop-color="#2b1710"/>
    </linearGradient>
    <linearGradient id="wingR" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#63c2a7"/>
      <stop offset="38%" stop-color="#6f4527"/>
      <stop offset="70%" stop-color="#d96c26"/>
      <stop offset="100%" stop-color="#24120c"/>
    </linearGradient>
    <linearGradient id="dress" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b2a20"/>
      <stop offset="35%" stop-color="#8a3d1c"/>
      <stop offset="72%" stop-color="#c65a20"/>
      <stop offset="100%" stop-color="#1c0f0a"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eee0bd"/>
      <stop offset="60%" stop-color="#cdbb93"/>
      <stop offset="100%" stop-color="#8f7f61"/>
    </linearGradient>
    <linearGradient id="keyMetal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6b3b22"/>
      <stop offset="30%" stop-color="#c96424"/>
      <stop offset="55%" stop-color="#4a2a1a"/>
      <stop offset="78%" stop-color="#e07f2e"/>
      <stop offset="100%" stop-color="#241109"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff9a3c"/>
      <stop offset="45%" stop-color="#c7501e"/>
      <stop offset="100%" stop-color="#4a180b"/>
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>
    </filter>
  </defs>

  <rect width="400" height="600" fill="url(#bg)"/>

  <!-- distant ruined gate -->
  <g opacity=".20" stroke="#9fd8c5" stroke-width="5">
    <line x1="28" y1="0" x2="22" y2="600"/><line x1="78" y1="0" x2="76" y2="600"/>
    <line x1="330" y1="0" x2="336" y2="600"/><line x1="374" y1="0" x2="380" y2="600"/>
  </g>
  <g opacity=".13" fill="#d96c26">
    <circle cx="54" cy="118" r="19"/><circle cx="342" cy="88" r="24"/><circle cx="44" cy="438" r="28"/>
    <circle cx="356" cy="470" r="20"/><circle cx="92" cy="540" r="16"/><circle cx="312" cy="540" r="14"/>
  </g>
  <g id="bgLayer">
    <circle cx="200" cy="265" r="178" fill="url(#halo)" class="haloPulse"/>
    <circle cx="200" cy="265" r="126" fill="none" stroke="#7ed0b6" stroke-opacity=".20" stroke-width="1.5" stroke-dasharray="3 11"/>
    <circle cx="200" cy="265" r="148" fill="none" stroke="#e07f2e" stroke-opacity=".14" stroke-width="9" stroke-dasharray="2 28" stroke-linecap="round"/>
  </g>

  <g id="particlesBack"></g>

  <!-- the great rusted key, nearby and untouched -->
  <g id="keyGroup" filter="url(#rough)">
    <g transform="rotate(38 302 418)">
      <circle cx="302" cy="352" r="34" fill="none" stroke="url(#keyMetal)" stroke-width="17"/>
      <circle cx="302" cy="352" r="34" fill="none" stroke="#ff9a3c" stroke-opacity=".35" stroke-width="3" stroke-dasharray="4 13"/>
      <rect x="291" y="378" width="22" height="118" rx="9" fill="url(#keyMetal)"/>
      <rect x="307" y="452" width="38" height="17" rx="5" fill="url(#keyMetal)"/>
      <rect x="307" y="480" width="30" height="16" rx="5" fill="url(#keyMetal)"/>
      <g fill="#e87f2e" opacity=".85">
        <circle cx="294" cy="338" r="7"/><circle cx="318" cy="362" r="5"/><circle cx="299" cy="404" r="8"/>
        <circle cx="306" cy="438" r="5"/><circle cx="294" cy="472" r="7"/><circle cx="326" cy="458" r="4"/>
        <circle cx="290" cy="356" r="3" fill="#5fc0a5"/><circle cx="310" cy="486" r="3" fill="#5fc0a5"/>
        <circle cx="300" cy="424" r="3" fill="#ffe1a8"/>
      </g>
      <g fill="#160b06" opacity=".55">
        <circle cx="304" cy="390" r="4"/><circle cx="296" cy="452" r="5"/><circle cx="314" cy="352" r="4"/>
      </g>
    </g>
  </g>

  <!-- fairy -->
  <g id="fairy">
    <!-- wings -->
    <g class="wingL" opacity=".94">
      <path d="M202,272 C158,196 72,146 38,196 C12,234 48,292 116,306 C162,315 194,300 202,272 Z" fill="url(#wingL)"/>
      <path d="M202,288 C164,302 88,306 62,356 C44,392 96,412 146,378 C182,353 198,318 202,288 Z" fill="url(#wingL)" opacity=".88"/>
      <path d="M192,268 C150,224 102,196 62,202 M188,282 C146,282 104,292 82,322" stroke="#2a1208" stroke-width="2" fill="none" opacity=".55"/>
      <circle cx="92" cy="238" r="17" fill="#120b06" opacity=".72"/><circle cx="92" cy="238" r="8" fill="#ffab4a" opacity=".8"/>
      <circle cx="118" cy="352" r="10" fill="#120b06" opacity=".6"/><circle cx="55" cy="278" r="5" fill="#0d1713"/>
      <circle cx="150" cy="214" r="4" fill="#0d1713" opacity=".8"/>
    </g>
    <g class="wingR" opacity=".94">
      <path d="M198,272 C242,196 328,146 362,196 C388,234 352,292 284,306 C238,315 206,300 198,272 Z" fill="url(#wingR)"/>
      <path d="M198,288 C236,302 312,306 338,356 C356,392 304,412 254,378 C218,353 202,318 198,288 Z" fill="url(#wingR)" opacity=".88"/>
      <path d="M208,268 C250,224 298,196 338,202 M212,282 C254,282 296,292 318,322" stroke="#2a1208" stroke-width="2" fill="none" opacity=".55"/>
      <circle cx="308" cy="238" r="17" fill="#120b06" opacity=".72"/><circle cx="308" cy="238" r="8" fill="#ffab4a" opacity=".8"/>
      <circle cx="282" cy="352" r="10" fill="#120b06" opacity=".6"/><circle cx="345" cy="278" r="5" fill="#0d1713"/>
      <circle cx="250" cy="214" r="4" fill="#0d1713" opacity=".8"/>
    </g>

    <!-- legs -->
    <g stroke="#d8c69c" stroke-width="7" stroke-linecap="round" fill="none">
      <path d="M188,382 C182,424 170,458 156,486"/>
      <path d="M214,382 C224,418 238,444 252,462"/>
    </g>
    <path d="M156,486 l-10,12 l16,-3 Z" fill="#2b1710"/>
    <path d="M252,462 l16,4 l-10,10 Z" fill="#2b1710"/>

    <!-- arms -->
    <g class="armL">
      <path d="M184,274 C158,292 138,316 130,344" stroke="#e2d0a4" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="129" cy="347" r="6" fill="#e2d0a4"/>
      <path d="M129,347 l-14,8 M129,347 l-4,16 M129,347 l-18,-3" stroke="#e2d0a4" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <g class="armR">
      <path d="M216,274 C240,286 258,302 268,326" stroke="#e2d0a4" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="270" cy="329" r="6" fill="#e2d0a4"/>
      <path d="M270,329 l15,2 M270,329 l10,12 M270,329 l16,-8" stroke="#e2d0a4" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    <!-- dress / body -->
    <g class="dressSway">
      <path d="M200,238 C176,252 172,282 182,316 C172,344 162,372 150,398 C176,390 188,404 200,386 C212,404 226,390 250,400 C238,370 228,342 218,316 C228,282 224,252 200,238 Z" fill="url(#dress)"/>
      <path d="M200,246 C188,286 190,336 200,382 C210,336 212,286 200,246 Z" fill="#2e1a10" opacity=".55"/>
      <g fill="#ff8b35" opacity=".8">
        <circle cx="188" cy="300" r="5"/><circle cx="214" cy="326" r="7"/><circle cx="196" cy="356" r="4"/>
        <circle cx="222" cy="282" r="3"/><circle cx="176" cy="338" r="3" fill="#5fc0a5"/>
      </g>
      <path d="M176,262 C188,272 212,272 224,262" stroke="#5fc0a5" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
      <circle cx="200" cy="270" r="6" fill="#79d3b8" class="glowDot"/>
    </g>

    <!-- head -->
    <g id="head">
      <!-- hair back -->
      <g stroke="url(#hair)" stroke-width="7" stroke-linecap="round" fill="none" opacity=".92">
        <path class="hairStrand" d="M176,176 C156,218 158,268 142,306" style="transform-origin:176px 176px"/>
        <path class="hairStrand" d="M224,176 C244,218 242,268 258,306" style="transform-origin:224px 176px"/>
        <path class="hairStrand" d="M186,168 C172,210 176,246 164,282" style="transform-origin:186px 168px"/>
        <path class="hairStrand" d="M214,168 C228,210 224,246 236,282" style="transform-origin:214px 168px"/>
      </g>
      <!-- antennae -->
      <g stroke="#e8d8ae" stroke-width="2.5" fill="none" stroke-linecap="round">
        <path d="M186,158 C174,132 158,122 142,120"/>
        <path d="M214,158 C226,132 242,122 258,120"/>
      </g>
      <circle cx="140" cy="120" r="5" fill="#ffb14e" class="glowDot" filter="url(#soft)"/>
      <circle cx="260" cy="120" r="5" fill="#ffb14e" class="glowDot" filter="url(#soft)"/>
      <circle cx="140" cy="120" r="2.6" fill="#fff0bd"/>
      <circle cx="260" cy="120" r="2.6" fill="#fff0bd"/>

      <ellipse cx="200" cy="196" rx="29" ry="36" fill="url(#skin)"/>
      <path d="M171,188 C174,160 186,148 200,148 C216,148 228,162 229,188 C218,168 208,174 200,162 C192,174 181,168 171,188 Z" fill="url(#hair)"/>
      <!-- nail crown -->
      <g fill="#3a2418">
        <path d="M178,158 l4,-20 l7,17 Z"/><path d="M194,152 l6,-22 l6,22 Z"/><path d="M210,155 l8,-18 l4,20 Z"/>
      </g>
      <g class="eye">
        <ellipse cx="188" cy="198" rx="6.5" ry="8.5" fill="#100806"/>
        <circle cx="188" cy="200" r="2.6" fill="#ffab3d"/>
      </g>
      <g class="eye">
        <ellipse cx="212" cy="198" rx="6.5" ry="8.5" fill="#100806"/>
        <circle cx="212" cy="200" r="2.6" fill="#ffab3d"/>
      </g>
      <path d="M190,220 C196,224 204,224 210,220" stroke="#5a2315" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="176" cy="212" r="4" fill="#c75b26" opacity=".45"/>
      <circle cx="224" cy="212" r="4" fill="#3fa08c" opacity=".5"/>
      <!-- neck -->
      <rect x="192" y="226" width="16" height="20" rx="6" fill="#cdbb93"/>
    </g>
  </g>

  <g id="particlesFront"></g>
  <g id="flakes"></g>

  <!-- mist and vignette -->
  <ellipse class="mist" cx="200" cy="548" rx="230" ry="52" fill="#8fd8c2" opacity=".10" filter="url(#soft2)"/>
  <ellipse class="mist mist2" cx="180" cy="578" rx="250" ry="44" fill="#e07f2e" opacity=".10" filter="url(#soft2)"/>
  <rect width="400" height="600" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="36" filter="url(#soft2)"/>
</svg>

<script>
(function(){
  const NS = 'http://www.w3.org/2000/svg';
  const fairy = document.getElementById('fairy');
  const head = document.getElementById('head');
  const key = document.getElementById('keyGroup');
  const eyes = document.querySelectorAll('.eye');
  const back = document.getElementById('particlesBack');
  const front = document.getElementById('particlesFront');
  const flakesG = document.getElementById('flakes');
  head.style.transformBox = 'view-box';
  head.style.transformOrigin = '200px 205px';

  function mk(parent, type, attrs){
    const el = document.createElementNS(NS, type);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el); return el;
  }

  const motes = [];
  for (let i=0;i<46;i++){
    const frontLayer = i>28;
    const c = mk(frontLayer?front:back,'circle',{
      r:(Math.random()*2.2+0.7).toFixed(2),
      fill: Math.random()<.55 ? '#ffb14e' : (Math.random()<.5?'#7ed0b6':'#e8d8ae'),
      opacity:(Math.random()*.55+.25).toFixed(2)
    });
    motes.push({el:c,x:Math.random()*400,y:Math.random()*600,s:Math.random()*14+5,p:Math.random()*Math.PI*2,v:Math.random()*.22+.06});
  }
  const flakes = [];
  for (let i=0;i<16;i++){
    const p = mk(flakesG,'rect',{width:5,height:3,rx:1,fill: i%3?'#d96c26':'#5fc0a5',opacity:.85});
    flakes.push({el:p,x:275+Math.random()*65,y:340+Math.random()*180,v:Math.random()*.5+.25,r:Math.random()*360,vr:(Math.random()-.5)*3,p:Math.random()*Math.PI*2});
  }

  let mx=0,my=0,tx=0,ty=0,lastBlink=0,blinkUntil=0;
  window.addEventListener('pointermove', e=>{
    tx = (e.clientX/window.innerWidth - .5)*2;
    ty = (e.clientY/window.innerHeight - .5)*2;
  }, {passive:true});

  function frame(now){
    const t = now/1000;
    mx += (tx-mx)*.045; my += (ty-my)*.045;

    const bob = Math.sin(t*1.35)*9;
    fairy.setAttribute('transform', `translate(${mx*7} ${bob + my*4})`);
    key.setAttribute('transform', `translate(${ -mx*5} ${Math.sin(t*1.05+1.7)*7}) rotate(${Math.sin(t*.55)*3} 302 418)`);

    const headRot = Math.sin(t*.62)*5 + mx*9;
    const blinking = now < blinkUntil;
    if (now-lastBlink > 2800 + Math.sin(now*.001)*700 && !blinking){ blinkUntil = now+130; lastBlink = now; }
    const eyeS = blinking ? .08 : 1;
    eyes.forEach(e=>{ e.style.transform = `translate(${mx*2.2}px, ${my*1.4}px) scaleY(${eyeS})`; });
    head.style.transform = `rotate(${headRot}deg) translate(${mx*3}px, ${Math.sin(t*1.35)*1.5}px)`;

    motes.forEach(m=>{
      m.y -= m.v; m.x += Math.sin(t*.8 + m.p)*.22;
      if (m.y < -6){ m.y = 606; m.x = Math.random()*400; }
      m.el.setAttribute('cx', m.x + mx*m.s*.35);
      m.el.setAttribute('cy', m.y);
    });
    flakes.forEach(f=>{
      f.y += f.v; f.x += Math.sin(t*1.4+f.p)*.45 - .12; f.r += f.vr;
      if (f.y > 610){ f.y = 345+Math.random()*30; f.x = 278+Math.random()*58; }
      f.el.setAttribute('transform', `translate(${f.x} ${f.y}) rotate(${f.r})`);
      f.el.setAttribute('opacity', Math.max(.15, .9 - Math.max(0,f.y-480)/160));
    });
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
  "title": "The Fairy of Rust",
  "statement": "What decays remembers its shape; let go before you are held fast."
}
```