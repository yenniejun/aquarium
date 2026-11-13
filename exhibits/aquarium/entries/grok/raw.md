```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blinkblink Blenny</title>
<style>
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: #06262c;
    touch-action: pan-y;
  }
  svg {
    display: block;
    width: 100vw;
    height: 100vh;
  }
  .sway-a { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 7.5s ease-in-out infinite; }
  .sway-b { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 9.2s ease-in-out infinite reverse; }
  .sway-c { transform-box: fill-box; transform-origin: 40% 100%; animation: sway 6.4s ease-in-out infinite; }
  .sway-d { transform-box: fill-box; transform-origin: 60% 100%; animation: sway 8.1s ease-in-out infinite reverse; }
  .shaft { animation: shaft 11s ease-in-out infinite; }
  .shaft2 { animation: shaft 14s ease-in-out infinite reverse; }
  .mote { animation: rise 18s linear infinite; }
  .mote2 { animation: rise 23s linear infinite; }
  .mote3 { animation: rise 16s linear infinite; }
  @keyframes sway {
    0%, 100% { transform: rotate(-3.2deg); }
    50% { transform: rotate(4.4deg); }
  }
  @keyframes shaft {
    0%, 100% { opacity: 0.18; transform: translateX(0); }
    50% { opacity: 0.38; transform: translateX(28px); }
  }
  @keyframes rise {
    0% { transform: translateY(40px); opacity: 0; }
    12% { opacity: 0.55; }
    100% { transform: translateY(-860px); opacity: 0; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1f7d86"/>
      <stop offset="42%" stop-color="#0e4c56"/>
      <stop offset="100%" stop-color="#072e34"/>
    </linearGradient>
    <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e4c48a"/>
      <stop offset="55%" stop-color="#c49658"/>
      <stop offset="100%" stop-color="#8d6840"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ffe7a8" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffe7a8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7dcf8a"/>
      <stop offset="100%" stop-color="#1f6b48"/>
    </linearGradient>
    <linearGradient id="leaf2" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#d7e07a"/>
      <stop offset="100%" stop-color="#3d8f52"/>
    </linearGradient>
    <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c9b7a2"/>
      <stop offset="100%" stop-color="#6e5a4c"/>
    </linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f3b07a"/>
      <stop offset="45%" stop-color="#e07a4a"/>
      <stop offset="100%" stop-color="#f6e2c4"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>

  <rect width="1200" height="900" fill="url(#water)"/>
  <ellipse cx="420" cy="40" rx="520" ry="180" fill="url(#glow)"/>
  <g class="shaft" opacity="0.28">
    <polygon points="180,0 310,0 470,900 250,900" fill="#fff4c8"/>
  </g>
  <g class="shaft2" opacity="0.2">
    <polygon points="640,0 760,0 820,900 560,900" fill="#fff8dc"/>
  </g>

  <g opacity="0.35" fill="#9fe7c8">
    <ellipse class="mote" cx="180" cy="820" rx="3" ry="2"/>
    <ellipse class="mote2" cx="540" cy="860" rx="2.2" ry="1.6"/>
    <ellipse class="mote3" cx="910" cy="800" rx="2.6" ry="1.8"/>
    <ellipse class="mote" cx="720" cy="880" rx="1.8" ry="1.4" style="animation-delay:-6s"/>
    <ellipse class="mote2" cx="300" cy="840" rx="1.5" ry="1.2" style="animation-delay:-9s"/>
  </g>

  <path d="M0 690 C 180 640, 320 720, 520 680 C 740 636, 900 710, 1200 660 L 1200 900 L 0 900 Z" fill="url(#sand)"/>
  <g fill="#b8894e" opacity="0.45">
    <ellipse cx="90" cy="742" rx="18" ry="6"/>
    <ellipse cx="240" cy="768" rx="26" ry="7"/>
    <ellipse cx="610" cy="755" rx="22" ry="6"/>
    <ellipse cx="980" cy="748" rx="30" ry="8"/>
    <ellipse cx="1120" cy="772" rx="16" ry="5"/>
  </g>

  <g class="sway-a">
    <path d="M150 760 C 120 620, 90 480, 160 340 C 190 430, 210 560, 188 760 Z" fill="url(#leaf)"/>
    <path d="M168 760 C 200 600, 250 470, 210 330 C 188 470, 170 600, 176 760 Z" fill="#2f8a55" opacity="0.85"/>
  </g>
  <g class="sway-b">
    <path d="M980 770 C 940 600, 1000 430, 930 300 C 990 450, 1040 600, 1010 770 Z" fill="url(#leaf2)"/>
    <path d="M1005 770 C 1060 590, 1110 460, 1040 310 C 1088 480, 1048 620, 1024 770 Z" fill="#4ea36a"/>
  </g>
  <g class="sway-c">
    <path d="M70 790 C 40 680, 20 600, 55 540 C 48 640, 62 720, 78 790 Z" fill="#1c6a46"/>
    <path d="M108 800 C 130 690, 160 600, 128 520 C 150 640, 132 730, 116 800 Z" fill="#67b56a"/>
  </g>
  <g class="sway-d">
    <path d="M860 790 C 830 660, 800 560, 848 470 C 828 600, 850 700, 872 790 Z" fill="#246848"/>
    <path d="M900 800 C 940 670, 980 560, 940 450 C 968 590, 930 710, 912 800 Z" fill="#8ec96a"/>
  </g>

  <g>
    <ellipse cx="470" cy="700" rx="150" ry="46" fill="#5c463c" opacity="0.35" filter="url(#soft)"/>
    <path d="M300 700 C 320 620, 400 590, 500 608 C 610 628, 660 590, 700 640 C 680 700, 600 748, 470 752 C 380 754, 320 736, 300 700 Z" fill="url(#rock)"/>
    <path d="M340 668 C 390 640, 470 648, 530 670" fill="none" stroke="#e7d7c4" stroke-width="6" stroke-linecap="round" opacity="0.45"/>
    <ellipse cx="430" cy="690" rx="28" ry="12" fill="#8f9a62" opacity="0.55"/>
    <ellipse cx="560" cy="676" rx="18" ry="8" fill="#6d8a48" opacity="0.5"/>
    <path d="M620 710 C 650 660, 690 680, 676 724 Z" fill="#7d6a58"/>
  </g>
  <ellipse cx="180" cy="760" rx="70" ry="22" fill="#a98462"/>
  <ellipse cx="1040" cy="748" rx="90" ry="26" fill="#b08b66"/>
  <ellipse cx="1040" cy="742" rx="40" ry="10" fill="#d8c09a" opacity="0.4"/>

  <g id="fish">
    <g id="tail" fill="#e07a4a">
      <path d="M-78 2 C -118 -28, -132 -8, -108 4 C -134 16, -116 36, -78 8 Z"/>
    </g>
    <path id="bodyShape" d="M-70 6 C -40 -28, 20 -42, 62 -18 C 92 -4, 96 22, 58 34 C 10 50, -46 36, -70 6 Z" fill="url(#body)"/>
    <path d="M-20 -30 C 0 -62, 28 -58, 36 -22 C 18 -34, -4 -36, -20 -30 Z" fill="#f2a06a" opacity="0.95"/>
    <path d="M10 28 C 4 58, 36 62, 48 30 C 30 40, 16 36, 10 28 Z" fill="#f6d7b4" opacity="0.9"/>
    <path d="M48 -6 C 78 -22, 92 8, 70 18 C 78 6, 64 -2, 48 -6 Z" fill="#f6c49a"/>
    <ellipse cx="58" cy="6" rx="16" ry="11" fill="#f8d7bc"/>
    <g id="eyeL">
      <ellipse cx="72" cy="-6" rx="11" ry="12" fill="#fffaf3"/>
      <circle class="pupil" cx="75" cy="-5" r="5.2" fill="#1b1714"/>
      <circle cx="77.2" cy="-7.4" r="1.7" fill="#fff"/>
    </g>
    <path d="M86 8 Q 78 14 70 10" fill="none" stroke="#c45a38" stroke-width="1.6" stroke-linecap="round"/>
    <g fill="#6b341f" opacity="0.55">
      <ellipse cx="20" cy="-8" rx="5" ry="3.2" transform="rotate(-18 20 -8)"/>
      <ellipse cx="-8" cy="2" rx="6" ry="3.4" transform="rotate(12 -8 2)"/>
      <ellipse cx="8" cy="16" rx="4.5" ry="2.6"/>
      <ellipse cx="36" cy="14" rx="3.4" ry="2.2"/>
      <ellipse cx="-36" cy="-6" rx="4" ry="2.4"/>
    </g>
    <path d="M-10 -8 C 8 -4, 24 2, 18 8" fill="none" stroke="#fff6e8" stroke-width="2" opacity="0.35" stroke-linecap="round"/>
  </g>
</svg>
<script>
(function () {
  var fish = document.getElementById("fish");
  var tail = document.getElementById("tail");
  var pupil = fish.querySelector(".pupil");
  var t0 = performance.now();
  var perch = { x: 500, y: 628 };
  var pos = { x: perch.x, y: perch.y };
  var face = 1;
  var blink = 0;
  var nextBlink = 1.6;

  function loop(now) {
    var t = (now - t0) / 1000;
    var cycle = 14;
    var u = t % cycle;
    var target = { x: perch.x, y: perch.y };
    var wag = 0.4;
    var gaze = 2;

    if (u < 5.2) {
      target.x = perch.x + Math.sin(t * 0.7) * 4;
      target.y = perch.y + Math.sin(t * 1.3) * 1.5;
      gaze = 3 + Math.sin(t * 0.55) * 2.2;
      wag = 0.35;
    } else if (u < 8.4) {
      var p = (u - 5.2) / 3.2;
      var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      target.x = perch.x + Math.sin(e * Math.PI) * 210;
      target.y = perch.y - Math.sin(e * Math.PI) * 150 - 10;
      wag = 1.6;
      gaze = 4;
    } else if (u < 10.6) {
      target.x = perch.x + 18;
      target.y = perch.y - 168 + Math.sin(t * 1.8) * 8;
      wag = 0.9;
      gaze = Math.sin(t * 0.9) * 3;
    } else {
      var p2 = (u - 10.6) / 3.4;
      var e2 = p2 < 0.5 ? 2 * p2 * p2 : 1 - Math.pow(-2 * p2 + 2, 2) / 2;
      target.x = perch.x + 18 - Math.sin(e2 * Math.PI) * 40 * (1 - e2);
      target.y = (perch.y - 168) + (perch.y - (perch.y - 168)) * e2;
      target.x = perch.x + (1 - e2) * 30;
      wag = 1.1;
    }

    var dx = target.x - pos.x;
    var dy = target.y - pos.y;
    pos.x += dx * 0.045;
    pos.y += dy * 0.045;
    if (Math.abs(dx) > 1.2) face = dx > 0 ? 1 : -1;

    if (t > nextBlink) {
      blink = 1;
      nextBlink = t + 2.1 + Math.random() * 2.4;
    }
    blink *= 0.82;
    var eyeScale = 1 - Math.min(0.92, blink * 1.15);

    var bob = Math.sin(t * 2.2) * (0.8 + wag);
    var wagAng = Math.sin(t * (6 + wag * 8)) * (7 + wag * 10);
    fish.setAttribute("transform",
      "translate(" + pos.x.toFixed(1) + "," + (pos.y + bob).toFixed(1) + ") scale(" + face + ",1)");
    tail.setAttribute("transform", "rotate(" + wagAng.toFixed(2) + " -70 4)");
    pupil.setAttribute("cx", (75 + gaze * 0.35).toFixed(2));
    pupil.setAttribute("transform", "translate(75,-5) scale(1," + eyeScale.toFixed(3) + ") translate(-75,5)");

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Blinkblink Blenny",
  "statement": "A speckled blenny who treats the tank like a windowsill: perched, peering, then gone in a bright little dash before settling back to watch the light move."
}
```