```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>fairy card</title>
<style>
  *{box-sizing:border-box}
  html,body{height:100%;margin:0;overflow:hidden;background:#030409}
  body{display:grid;place-items:center;min-height:100%;touch-action:manipulation;user-select:none;-webkit-user-select:none}
  .stage{position:relative;width:min(600px,94vw,64vh);aspect-ratio:2/3;max-height:96vh;overflow:hidden;border-radius:0 0 22px 22px;background:#070a18}
  .stage svg{position:absolute;inset:0;width:100%;height:100%;display:block}
  .layer{transform:translate(calc(var(--px,0)*var(--d,0)*1px),calc(var(--py,0)*var(--d,0)*1px));will-change:transform}
  .star{animation:twinkle 5s ease-in-out infinite}
  .win{animation:twinkle 7s ease-in-out infinite}
  .cloud{animation:cloud 46s ease-in-out infinite}
  .bob{transform-box:fill-box;transform-origin:50% 45%;animation:bob 5.4s ease-in-out infinite}
  .aura{transform-box:fill-box;transform-origin:center;animation:aura 4.2s ease-in-out infinite}
  .wing{transform-box:fill-box}
  .wl{transform-origin:100% 45%;animation:flapL .72s ease-in-out infinite}
  .wr{transform-origin:0% 45%;animation:flapR .72s ease-in-out infinite}
  .head{transform-box:fill-box;transform-origin:50% 92%;animation:head 8.5s ease-in-out infinite}
  .hair{transform-box:fill-box;transform-origin:65% 15%;animation:sway 6.5s ease-in-out infinite}
  .peek{transform-box:fill-box;transform-origin:50% 100%;animation:peek 6s ease-in-out infinite}
  .pool{transform-box:fill-box;transform-origin:center;animation:pool 4.8s ease-in-out infinite}
  .sheen{animation:sheen 5s ease-in-out infinite}
  .mote{transform-box:fill-box;opacity:0;animation:mote 9s linear infinite}
  .spark{fill:none;stroke:url(#trail);stroke-width:3.5;stroke-linecap:round;stroke-dasharray:3 17;opacity:.85;animation:dash 2.4s linear infinite}
  .reed{transform-box:fill-box;transform-origin:50% 100%;animation:reed 8s ease-in-out infinite}
  @keyframes twinkle{0%,100%{opacity:.22}50%{opacity:1}}
  @keyframes cloud{0%,100%{transform:translateX(-38px)}50%{transform:translateX(46px)}}
  @keyframes bob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1.3deg)}}
  @keyframes aura{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.08);opacity:.75}}
  @keyframes flapL{0%,100%{transform:rotate(9deg) scaleX(.96)}50%{transform:rotate(-16deg) scaleX(1.04)}}
  @keyframes flapR{0%,100%{transform:rotate(-9deg) scaleX(.96)}50%{transform:rotate(16deg) scaleX(1.04)}}
  @keyframes head{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg)}}
  @keyframes sway{0%,100%{transform:rotate(0) translateX(0)}50%{transform:rotate(3deg) translateX(3px)}}
  @keyframes peek{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-9px) rotate(1.5deg)}}
  @keyframes pool{0%,100%{opacity:.35;transform:scaleX(1)}50%{opacity:.68;transform:scaleX(1.12)}}
  @keyframes sheen{0%,100%{opacity:.12}50%{opacity:.34}}
  @keyframes mote{0%{transform:translate3d(0,40px,0) scale(.6);opacity:0}12%{opacity:.9}55%{opacity:.5}100%{transform:translate3d(var(--dx,14px),-360px,0) scale(1.2);opacity:0}}
  @keyframes dash{to{stroke-dashoffset:-80}}
  @keyframes reed{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(3deg)}}
</style>
</head>
<body>
<div class="stage" id="stage">
<svg viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#070a1c"/>
      <stop offset=".45" stop-color="#151b3f"/>
      <stop offset=".78" stop-color="#0a0d20"/>
      <stop offset="1" stop-color="#05060f"/>
    </linearGradient>
    <radialGradient id="moon" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff9d8"/>
      <stop offset=".42" stop-color="#ffe9a8" stop-opacity=".55"/>
      <stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aura" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="#dffbff" stop-opacity=".8"/>
      <stop offset=".42" stop-color="#9fc7ff" stop-opacity=".28"/>
      <stop offset=".75" stop-color="#b18cff" stop-opacity=".12"/>
      <stop offset="1" stop-color="#b18cff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wingL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8f7bff" stop-opacity=".05"/>
      <stop offset=".62" stop-color="#c9f4ff" stop-opacity=".42"/>
      <stop offset="1" stop-color="#f2fdff" stop-opacity=".92"/>
    </linearGradient>
    <linearGradient id="wingR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f2fdff" stop-opacity=".92"/>
      <stop offset=".38" stop-color="#c9f4ff" stop-opacity=".42"/>
      <stop offset="1" stop-color="#8f7bff" stop-opacity=".05"/>
    </linearGradient>
    <linearGradient id="dress" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9fbff"/>
      <stop offset=".42" stop-color="#a9c8ff"/>
      <stop offset=".78" stop-color="#8f78ff"/>
      <stop offset="1" stop-color="#33245f"/>
    </linearGradient>
    <radialGradient id="skin" cx="42%" cy="34%" r="70%">
      <stop offset="0" stop-color="#fff3e8"/>
      <stop offset=".65" stop-color="#f4d3c2"/>
      <stop offset="1" stop-color="#d9a9b8"/>
    </radialGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff3d4"/>
      <stop offset=".55" stop-color="#e7d2a4"/>
      <stop offset="1" stop-color="#b99f6d"/>
    </linearGradient>
    <linearGradient id="paperDark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d8c294"/>
      <stop offset="1" stop-color="#8f7648"/>
    </linearGradient>
    <radialGradient id="poolGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#dffcff" stop-opacity=".55"/>
      <stop offset="1" stop-color="#dffcff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset=".5" stop-color="#ffffff" stop-opacity=".65"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="trail" gradientUnits="userSpaceOnUse" x1="332" y1="398" x2="404" y2="668">
      <stop offset="0" stop-color="#eaffff"/>
      <stop offset=".5" stop-color="#9fd8ff"/>
      <stop offset="1" stop-color="#c9a8ff"/>
    </linearGradient>
  </defs>

  <rect width="600" height="900" fill="url(#bg)"/>

  <g class="layer" style="--d:5">
    <circle class="star" cx="64" cy="92" r="1.7" fill="#dff6ff" style="animation-delay:-1s"/>
    <circle class="star" cx="132" cy="154" r="1.2" fill="#ffffff" style="animation-delay:-3.4s"/>
    <circle class="star" cx="206" cy="70" r="2" fill="#cdefff" style="animation-delay:-2.1s"/>
    <circle class="star" cx="318" cy="126" r="1.4" fill="#ffffff" style="animation-delay:-4.2s"/>
    <circle class="star" cx="388" cy="62" r="1.8" fill="#dff6ff" style="animation-delay:-.7s"/>
    <circle class="star" cx="540" cy="96" r="1.5" fill="#ffffff" style="animation-delay:-2.8s"/>
    <circle class="star" cx="86" cy="318" r="1.3" fill="#cdefff" style="animation-delay:-5s"/>
    <circle class="star" cx="160" cy="250" r="1.9" fill="#ffffff" style="animation-delay:-1.6s"/>
    <circle class="star" cx="262" cy="210" r="1.2" fill="#dff6ff" style="animation-delay:-3.9s"/>
    <circle class="star" cx="520" cy="286" r="1.8" fill="#ffffff" style="animation-delay:-2.4s"/>
    <circle class="star" cx="452" cy="356" r="1.3" fill="#cdefff" style="animation-delay:-4.7s"/>
    <circle class="star" cx="58" cy="520" r="1.6" fill="#ffffff" style="animation-delay:-.9s"/>
    <circle class="star" cx="560" cy="500" r="1.4" fill="#dff6ff" style="animation-delay:-3.1s"/>
    <circle cx="462" cy="158" r="118" fill="url(#moon)"/>
    <circle cx="462" cy="158" r="43" fill="#fff7cf" opacity=".94"/>
    <circle cx="450" cy="146" r="7" fill="#e9d79b" opacity=".28"/>
    <circle cx="476" cy="168" r="5" fill="#e9d79b" opacity=".24"/>
    <circle cx="458" cy="176" r="4" fill="#e9d79b" opacity=".2"/>
    <ellipse class="cloud" cx="126" cy="214" rx="132" ry="28" fill="#aab8ff" opacity=".075"/>
    <ellipse class="cloud" cx="430" cy="278" rx="150" ry="32" fill="#8ea0ff" opacity=".06" style="animation-delay:-18s"/>
    <ellipse class="cloud" cx="250" cy="128" rx="110" ry="22" fill="#ffffff" opacity=".05" style="animation-delay:-31s"/>
  </g>

  <g class="layer" style="--d:10">
    <path d="M0 742 L0 690 C42 668 70 700 106 676 C150 644 190 690 236 664 C286 632 330 690 380 660 C430 632 470 682 520 654 C560 634 600 664 600 664 L600 900 L0 900 Z" fill="#0b0e1d"/>
    <rect class="win" x="92" y="694" width="7" height="10" rx="1" fill="#ffd98a" opacity=".5" style="animation-delay:-2s"/>
    <rect class="win" x="214" y="684" width="6" height="9" rx="1" fill="#9fd8ff" opacity=".45" style="animation-delay:-5s"/>
    <rect class="win" x="356" y="688" width="7" height="10" rx="1" fill="#ffd98a" opacity=".42" style="animation-delay:-1s"/>
    <rect class="win" x="506" y="676" width="6" height="9" rx="1" fill="#9fd8ff" opacity=".4" style="animation-delay:-3.6s"/>
    <path d="M0 724 C150 706 430 736 600 716 L600 900 L0 900 Z" fill="#151827"/>
    <path d="M0 724 C150 706 430 736 600 716 L600 744 C430 764 150 734 0 752 Z" fill="#2a2033" opacity=".86"/>
    <path d="M0 724 C150 706 430 736 600 716" fill="none" stroke="#6b4c5f" stroke-width="3" opacity=".55"/>
  </g>

  <g class="layer" style="--d:18">
    <g transform="translate(398 688) rotate(-5)">
      <ellipse cx="4" cy="72" rx="126" ry="24" fill="#000000" opacity=".34"/>
      <ellipse class="pool" cx="0" cy="64" rx="118" ry="24" fill="url(#poolGrad)"/>
      <rect x="-84" y="-58" width="164" height="102" rx="9" transform="rotate(-9)" fill="url(#paperDark)" opacity=".72"/>
      <rect x="-78" y="-50" width="158" height="98" rx="9" transform="rotate(6)" fill="url(#paperDark)" opacity=".82"/>
      <rect x="-82" y="-38" width="162" height="100" rx="9" transform="rotate(-3)" fill="url(#paper)" opacity=".9"/>
      <rect class="sheen" x="-70" y="-58" width="52" height="128" fill="url(#sheenGrad)" transform="rotate(18)"/>
      <g>
        <rect x="-82" y="-18" width="164" height="82" rx="8" fill="url(#paper)" stroke="#6b5636" stroke-width="2"/>
        <path d="M-82 -18 L0 -76 L82 -18 L0 -40 Z" fill="#d9c491" stroke="#6b5636" stroke-width="2"/>
        <rect class="peek" x="-58" y="-92" width="116" height="78" rx="5" fill="#fff8e6" stroke="#b89f6d" stroke-width="2"/>
        <path d="M-44 -72 L44 -72 M-44 -56 L36 -56 M-44 -40 L44 -40 M-44 -24 L24 -24" stroke="#8a7a5c" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        <path d="M-82 -18 L0 42 L82 -18 L82 64 L-82 64 Z" fill="url(#paper)" stroke="#6b5636" stroke-width="2"/>
        <path d="M-82 -18 L0 42 L82 -18" fill="none" stroke="#7a6540" stroke-width="2" opacity=".8"/>
        <circle cx="0" cy="22" r="9" fill="#c98bd8" opacity=".75"/>
        <circle cx="0" cy="22" r="4" fill="#fff0ff" opacity=".8"/>
      </g>
    </g>
  </g>

  <g class="layer" style="--d:16">
    <path class="spark" d="M332 398 C386 470 342 580 398 664"/>
  </g>

  <g class="layer" style="--d:14">
    <g transform="translate(246 386)">
      <g class="bob">
        <ellipse class="aura" cx="0" cy="10" rx="132" ry="154" fill="url(#aura)"/>
        <path class="wing wl" d="M-8 -8 C-70 4 -122 34 -142 82 C-92 86 -44 58 -6 22 Z" fill="url(#wingL)" opacity=".55"/>
        <path class="wing wl" d="M-10 -34 C-78 -96 -150 -88 -190 -28 C-148 4 -76 12 -8 -2 Z" fill="url(#wingL)" opacity=".8"/>
        <path class="wing wr" d="M8 -8 C70 4 122 34 142 82 C92 86 44 58 6 22 Z" fill="url(#wingR)" opacity=".55"/>
        <path class="wing wr" d="M10 -34 C78 -96 150 -88 190 -28 C148 4 76 12 8 -2 Z" fill="url(#wingR)" opacity=".8"/>
        <path d="M-16 -28 C-70 -70 -126 -74 -168 -38 M-14 2 C-66 18 -104 40 -128 68 M16 -28 C70 -70 126 -74 168 -38 M14 2 C66 18 104 40 128 68" fill="none" stroke="#eaffff" stroke-width="2" opacity=".28"/>
        <path d="M-12 96 C-16 118 -12 132 -22 148 M16 98 C20 120 14 134 26 150" fill="none" stroke="#f4d7c8" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="-24" cy="150" rx="8" ry="5" fill="#e9fbff" opacity=".9"/>
        <ellipse cx="28" cy="152" rx="8" ry="5" fill="#e9fbff" opacity=".9"/>
        <path d="M-18 -26 C-38 18 -54 58 -70 92 C-34 112 34 112 72 90 C50 54 34 16 18 -26 C8 -18 -8 -18 -18 -26 Z" fill="url(#dress)" stroke="#dff6ff" stroke-width="2" opacity=".98"/>
        <path d="M0 -64 C-16 -56 -22 -40 -18 -24 C-6 -16 8 -16 18 -26 C22 -42 14 -58 0 -64 Z" fill="url(#dress)" stroke="#eaffff" stroke-width="2"/>
        <path d="M-8 -18 C-18 22 -34 58 -52 86 M8 -18 C18 24 34 58 54 84 M0 -16 C0 24 0 60 0 96" fill="none" stroke="#ffffff" stroke-width="2" opacity=".25"/>
        <path d="M-16 -42 C-36 -26 -44 -4 -34 14" fill="none" stroke="#f4d7c8" stroke-width="8" stroke-linecap="round"/>
        <circle cx="-34" cy="14" r="6" fill="#f4d7c8"/>
        <path d="M16 -44 C44 -34 66 -14 84 10" fill="none" stroke="#f4d7c8" stroke-width="8" stroke-linecap="round"/>
        <circle cx="86" cy="12" r="7" fill="#f4d7c8"/>
        <circle cx="86" cy="12" r="14" fill="#dffcff" opacity=".22"/>
        <g transform="translate(0 -82)">
          <g class="head">
            <path class="hair" d="M-24 -16 C-52 -38 -82 -28 -92 4 C-70 0 -58 -14 -50 -32 C-44 -50 -32 -60 -18 -58 C-8 -72 14 -72 26 -56 C42 -54 52 -38 48 -20 C60 -30 72 -20 74 4 C60 30 30 36 12 26 C-6 36 -26 30 -24 -16 Z" fill="#251744"/>
            <path d="M-18 -54 C-50 -74 -82 -60 -96 -28 C-72 -40 -52 -30 -38 -12 C-30 -30 -24 -44 -18 -54 Z" fill="#33205f" opacity=".9"/>
            <circle cx="0" cy="0" r="25" fill="url(#skin)"/>
            <path d="M-22 -12 C-12 -24 12 -24 24 -10" fill="none" stroke="#f7d774" stroke-width="3" stroke-linecap="round"/>
            <path d="M0 -25 L3 -18 L10 -17 L4 -12 L6 -5 L0 -9 L-6 -5 L-4 -12 L-10 -17 L-3 -18 Z" fill="#ffe9a0"/>
            <ellipse cx="-8" cy="-2" rx="3.1" ry="4.6" fill="#17102c"/>
            <ellipse cx="9" cy="-3" rx="3.2" ry="4.8" fill="#17102c"/>
            <circle cx="-7" cy="-4" r="1" fill="#ffffff"/>
            <circle cx="10" cy="-5" r="1" fill="#ffffff"/>
            <path d="M-13 -9 Q-8 -12 -3 -9 M4 -10 Q9 -13 14 -9" fill="none" stroke="#3a2450" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="-14" cy="7" r="4" fill="#ff9fb8" opacity=".35"/>
            <circle cx="15" cy="7" r="4" fill="#ff9fb8" opacity=".35"/>
            <path d="M-5 10 Q2 16 10 9" fill="none" stroke="#7a3b5c" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M-24 4 C-30 16 -28 28 -20 36 M24 2 C32 14 32 26 24 36" fill="none" stroke="#2c1a4e" stroke-width="5" stroke-linecap="round"/>
          </g>
        </g>
      </g>
    </g>
  </g>

  <g class="layer" style="--d:8">
    <circle class="mote" cx="120" cy="620" r="2.4" fill="#bff3ff" style="--dx:-22px;animation-duration:10s;animation-delay:-2s"/>
    <circle class="mote" cx="190" cy="700" r="1.8" fill="#e7d7ff" style="--dx:18px;animation-duration:12s;animation-delay:-7s"/>
    <circle class="mote" cx="330" cy="560" r="2.1" fill="#dffcff" style="--dx:26px;animation-duration:9s;animation-delay:-4s"/>
    <circle class="mote" cx="470" cy="430" r="1.7" fill="#ffffff" style="--dx:-30px;animation-duration:13s;animation-delay:-9s"/>
    <circle class="mote" cx="540" cy="610" r="2.3" fill="#cdefff" style="--dx:12px;animation-duration:11s;animation-delay:-1s"/>
  </g>

  <g class="layer" style="--d:26">
    <circle class="mote" cx="300" cy="430" r="2.6" fill="#eaffff" style="--dx:30px;animation-duration:8s;animation-delay:-1.5s"/>
    <circle class="mote" cx="360" cy="520" r="2" fill="#bff3ff" style="--dx:-16px;animation-duration:10.5s;animation-delay:-5.5s"/>
    <circle class="mote" cx="382" cy="620" r="2.8" fill="#fff3c9" style="--dx:20px;animation-duration:7.5s;animation-delay:-3s"/>
    <circle class="mote" cx="246" cy="300" r="2.2" fill="#dff6ff" style="--dx:-24px;animation-duration:12s;animation-delay:-8s"/>
    <circle class="mote" cx="210" cy="470" r="1.9" fill="#e7d7ff" style="--dx:14px;animation-duration:9.5s;animation-delay:-6s"/>
    <circle class="mote" cx="430" cy="760" r="2.5" fill="#dffcff" style="--dx:-20px;animation-duration:8.8s;animation-delay:-2.2s"/>
    <circle class="mote" cx="150" cy="790" r="2.1" fill="#ffffff" style="--dx:24px;animation-duration:11.5s;animation-delay:-9.4s"/>
    <path class="reed" d="M36 900 C30 842 44 812 38 768" fill="none" stroke="#090b15" stroke-width="7" stroke-linecap="round"/>
    <path class="reed" d="M70 900 C78 848 62 818 76 776" fill="none" stroke="#0d1020" stroke-width="6" stroke-linecap="round" style="animation-delay:-3s"/>
    <path class="reed" d="M540 900 C532 846 552 820 544 770" fill="none" stroke="#090b15" stroke-width="7" stroke-linecap="round" style="animation-delay:-5s"/>
    <path class="reed" d="M578 900 C586 852 570 826 584 786" fill="none" stroke="#0d1020" stroke-width="6" stroke-linecap="round" style="animation-delay:-1.4s"/>
    <path d="M38 768 C52 760 60 764 66 774 M544 770 C530 760 520 766 514 776" fill="none" stroke="#6f86c9" stroke-width="2" opacity=".35" stroke-linecap="round"/>
  </g>
</svg>
</div>
<script>
  const stage = document.getElementById('stage');
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function tick(){
    cx += (tx - cx) * .06;
    cy += (ty - cy) * .06;
    stage.style.setProperty('--px', cx.toFixed(4));
    stage.style.setProperty('--py', cy.toFixed(4));
    if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) raf = requestAnimationFrame(tick);
    else raf = null;
  }
  function move(e){
    const r = stage.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - .5) * 2;
    ty = ((e.clientY - r.top) / r.height - .5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function reset(){ tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('pointermove', move, {passive:true});
  window.addEventListener('pointerleave', reset, {passive:true});
  window.addEventListener('blur', reset);
</script>
</body>
</html>
```

```json
{
  "title": "The Fairy of Unsent Letters",
  "statement": "She keeps the words you were almost brave enough to send."
}
```