```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Listening Tide</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: transparent;
  }
  body { display: grid; place-items: center; }
  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }
  .float {
    transform-origin: 223px 304px;
    animation: float 9s ease-in-out infinite;
  }
  .hair-left {
    transform-origin: 201px 152px;
    animation: hair-left 7s ease-in-out infinite;
  }
  .hair-right {
    transform-origin: 224px 153px;
    animation: hair-right 8s ease-in-out infinite;
  }
  .tail {
    transform-origin: 191px 291px;
    animation: tail 9s ease-in-out infinite;
  }
  .dorsal {
    transform-origin: 245px 334px;
    animation: fin 4.8s ease-in-out infinite;
  }
  .small-fin {
    transform-origin: 294px 432px;
    animation: small-fin 5.7s ease-in-out infinite;
  }
  .hand {
    transform-origin: 181px 243px;
    animation: listen 9s ease-in-out infinite;
  }
  .gills { animation: gills 4s ease-in-out infinite; }
  .light { animation: light 4s ease-in-out infinite; }
  .light:nth-child(3n) { animation-delay: -1.3s; }
  .light:nth-child(3n + 1) { animation-delay: -2.6s; }
  .eye-lid {
    transform-origin: 192px 181px;
    animation: blink 11s infinite;
  }
  .glimmer {
    stroke-dasharray: 1 13 2 29;
    animation: glimmer 16s linear infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(4px) rotate(-1deg); }
    50% { transform: translateY(-5px) rotate(1deg); }
  }
  @keyframes hair-left {
    0%, 100% { transform: rotate(-2deg); }
    50% { transform: rotate(3deg); }
  }
  @keyframes hair-right {
    0%, 100% { transform: rotate(2deg) skewX(-1deg); }
    50% { transform: rotate(-3deg) skewX(2deg); }
  }
  @keyframes tail {
    0%, 100% { transform: rotate(1.3deg); }
    50% { transform: rotate(-1.3deg); }
  }
  @keyframes fin {
    0%, 100% { transform: skewY(-2deg) scaleX(.88); opacity: .76; }
    50% { transform: skewY(2deg) scaleX(1.04); opacity: 1; }
  }
  @keyframes small-fin {
    0%, 100% { transform: rotate(-3deg) scaleX(.9); }
    50% { transform: rotate(5deg) scaleX(1.03); }
  }
  @keyframes listen {
    0%, 100% { transform: rotate(-1deg); }
    50% { transform: rotate(2deg); }
  }
  @keyframes gills {
    0%, 100% { opacity: .4; }
    50% { opacity: .85; }
  }
  @keyframes light {
    0%, 100% { opacity: .45; }
    50% { opacity: 1; }
  }
  @keyframes blink {
    0%, 43%, 46%, 100% { transform: scaleY(1); }
    44.5% { transform: scaleY(.08); }
  }
  @keyframes glimmer { to { stroke-dashoffset: -180; } }
  @media (prefers-reduced-motion: reduce) {
    .float, .hair-left, .hair-right, .tail, .hand,
    .dorsal, .small-fin { animation-duration: 22s; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 450 600" preserveAspectRatio="xMidYMid meet"
     xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="A pearl-faced merperson with flowing teal hair, a curled seahorse tail, and one hand raised to listen.">
<defs>
  <linearGradient id="hair" x1=".1" y1=".2" x2=".9" y2=".8">
    <stop stop-color="#102f40"/>
    <stop offset=".43" stop-color="#174b56"/>
    <stop offset=".77" stop-color="#338180"/>
    <stop offset="1" stop-color="#d7b879"/>
  </linearGradient>
  <linearGradient id="hairLight" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#8ad6bf"/>
    <stop offset=".5" stop-color="#499b97"/>
    <stop offset="1" stop-color="#e5c284"/>
  </linearGradient>
  <linearGradient id="skin" x1="0" y1=".1" x2="1" y2=".7">
    <stop stop-color="#fff0c9"/>
    <stop offset=".42" stop-color="#dfddba"/>
    <stop offset=".74" stop-color="#8eb6a5"/>
    <stop offset="1" stop-color="#3b7d7e"/>
  </linearGradient>
  <linearGradient id="arm" x1="0" y1="0" x2=".8" y2="1">
    <stop stop-color="#f3e9c5"/>
    <stop offset=".55" stop-color="#9dc7ae"/>
    <stop offset="1" stop-color="#448b87"/>
  </linearGradient>
  <linearGradient id="torso" x1="0" y1="0" x2="1" y2=".7">
    <stop stop-color="#c5dbc0"/>
    <stop offset=".35" stop-color="#71aea1"/>
    <stop offset=".72" stop-color="#286a72"/>
    <stop offset="1" stop-color="#173f53"/>
  </linearGradient>
  <linearGradient id="tailColor" x1=".1" y1=".2" x2=".9" y2=".85">
    <stop stop-color="#83b9a1"/>
    <stop offset=".25" stop-color="#2a8082"/>
    <stop offset=".52" stop-color="#174757"/>
    <stop offset=".78" stop-color="#20586a"/>
    <stop offset="1" stop-color="#43a39c"/>
  </linearGradient>
  <linearGradient id="belly" x1="0" y1="0" x2="1" y2=".3">
    <stop stop-color="#f3dba0" stop-opacity=".9"/>
    <stop offset=".55" stop-color="#b3caa5" stop-opacity=".6"/>
    <stop offset="1" stop-color="#72b6a8" stop-opacity=".06"/>
  </linearGradient>
  <linearGradient id="fin" x1="0" y1=".5" x2="1" y2=".2">
    <stop stop-color="#428e91" stop-opacity=".8"/>
    <stop offset=".5" stop-color="#69b7ad" stop-opacity=".36"/>
    <stop offset="1" stop-color="#dfc392" stop-opacity=".65"/>
  </linearGradient>
  <linearGradient id="ear" x1="0" y1="1" x2="1" y2="0">
    <stop stop-color="#3b8280"/>
    <stop offset=".6" stop-color="#91c0a6"/>
    <stop offset="1" stop-color="#edd5a6"/>
  </linearGradient>
  <radialGradient id="cheek">
    <stop stop-color="#da9c88" stop-opacity=".6"/>
    <stop offset="1" stop-color="#da9c88" stop-opacity="0"/>
  </radialGradient>
  <pattern id="scales" width="20" height="18" patternUnits="userSpaceOnUse">
    <path d="M-10 0Q0 16 10 0Q20 16 30 0M-20 9Q-10 25 0 9Q10 25 20 9Q30 25 40 9"
          fill="none" stroke="#c0dfbe" stroke-width=".65" opacity=".29"/>
    <path d="M7 5l2 1M17 14l2 1" stroke="#f3d5a0" stroke-width="1" opacity=".35"/>
  </pattern>
  <path id="tailShape" d="M187 286
    C171 321 209 344 246 365
    C299 394 330 432 308 476
    C290 516 233 529 199 505
    C166 482 177 449 202 446
    C227 443 240 466 226 480
    C243 480 264 468 262 450
    C260 422 210 410 183 383
    C155 354 150 318 173 286Z"/>
  <clipPath id="tailClip"><use href="#tailShape"/></clipPath>
  <clipPath id="bodyClip">
    <path d="M193 211C189 228 177 233 175 251C172 267 179 276 173 290
    Q191 307 216 294C212 274 229 258 230 241C230 227 214 224 212 210Z"/>
  </clipPath>
</defs>

<g class="float" stroke-linecap="round" stroke-linejoin="round">

  <!-- Long, living locks. -->
  <g class="hair-right">
    <path d="M213 138C256 126 275 166 269 201
      C262 242 304 252 320 233
      C324 267 281 282 260 253
      C269 297 309 315 331 294
      C329 335 280 332 255 293
      C231 257 247 216 223 190Z"
      fill="url(#hair)" stroke="#245963" stroke-width="1.1"/>
    <path d="M231 153C262 179 244 212 267 245S309 277 316 257
      M245 190C244 244 264 302 305 312
      M252 235C250 270 265 297 283 304"
      fill="none" stroke="url(#hairLight)" stroke-width="1.25" opacity=".8"/>
    <path d="M236 149C274 155 278 190 278 214
      C279 232 292 237 303 226
      C292 252 266 238 263 218
      C261 194 257 178 239 175Z"
      fill="#286d75" stroke="#7ab7a8" stroke-width=".7"/>
    <path d="M255 168C282 191 259 218 288 230" fill="none"
      stroke="#dcc38a" stroke-width=".8"/>
  </g>

  <g class="hair-left">
    <path d="M217 139C190 108 155 126 148 151
      C141 175 123 171 108 160
      C117 189 145 187 160 171
      C149 208 111 215 94 196
      C102 233 145 229 170 195
      C163 222 145 242 122 241
      C147 261 182 233 188 206Z"
      fill="url(#hair)" stroke="#245963" stroke-width="1.1"/>
    <path d="M200 141C161 130 166 169 142 177
      M187 147C164 164 172 190 144 211Q123 227 109 216
      M177 172C179 208 155 232 143 239"
      fill="none" stroke="url(#hairLight)" stroke-width="1.15" opacity=".85"/>
    <path d="M188 143C167 118 147 131 137 125
      C145 144 159 139 166 151Z" fill="#327b7c"/>
    <path d="M151 133Q171 133 186 148" fill="none" stroke="#b9d4ae" stroke-width=".9"/>
    <path d="M166 176C145 204 120 193 117 186" fill="none"
      stroke="#e0be7f" stroke-width=".85"/>
  </g>

  <!-- The dorsal fin is part of the seahorse body. -->
  <g class="tail">
    <g class="dorsal">
      <path d="M224 308
        C247 310 257 291 267 282
        Q267 309 284 313
        Q287 328 309 330
        Q307 347 331 352
        Q324 369 344 385
        Q317 391 308 406
        C283 386 253 366 224 343Z"
        fill="url(#fin)" stroke="#86b7a3" stroke-width=".9"/>
      <g fill="none" stroke="#d8d2a1" stroke-width=".75" opacity=".7">
        <path d="M232 329Q253 315 267 282"/>
        <path d="M238 337Q266 327 284 313"/>
        <path d="M245 345Q281 336 309 330"/>
        <path d="M255 354Q299 352 331 352"/>
        <path d="M269 366Q309 369 344 385"/>
        <path d="M281 378Q299 388 308 406"/>
      </g>
      <path d="M267 282Q267 309 284 313Q287 328 309 330
        Q307 347 331 352Q324 369 344 385"
        fill="none" stroke="#f4d5a3" stroke-width="1.2" opacity=".7"/>
    </g>

    <g class="small-fin">
      <path d="M295 421C315 415 330 418 346 409
        Q335 429 343 440Q325 443 330 459
        Q313 453 308 470L293 454Z"
        fill="url(#fin)" stroke="#91c5af" stroke-width=".8"/>
      <path d="M299 437L346 409M301 444L343 440M302 451L330 459"
        fill="none" stroke="#d7d3a6" stroke-width=".7" opacity=".75"/>
    </g>

    <use href="#tailShape" fill="url(#tailColor)" stroke="#245362" stroke-width="1.3"/>
    <use href="#tailShape" fill="url(#scales)"/>
    <g clip-path="url(#tailClip)">
      <path d="M174 294C160 339 181 367 218 391
        C263 419 293 437 277 474
        C258 509 209 505 192 480
        C190 498 215 516 241 513
        C284 509 308 485 302 454
        C295 414 254 393 222 371
        C191 350 179 324 190 294Z"
        fill="url(#belly)"/>
      <g id="ribs" fill="none" stroke="#164b58" stroke-width="1" opacity=".47"></g>
      <path d="M176 301C168 342 188 366 220 388
        C269 419 295 439 278 477C262 510 211 504 195 484"
        fill="none" stroke="#f6d69b" stroke-width="1.3" opacity=".65"/>
      <path d="M194 310C191 338 227 354 254 373
        C295 400 322 435 302 474"
        class="glimmer" fill="none" stroke="#c5f0d1" stroke-width="2.6"/>
    </g>
    <path d="M202 454C217 449 233 464 226 480"
      fill="none" stroke="#a6d0b5" stroke-width="1.1"/>
    <g id="tailLights"></g>
  </g>

  <!-- Far arm and its small, open palm. -->
  <path d="M220 235C240 241 242 260 251 276
    Q260 290 278 296
    L289 293Q292 291 294 294L287 300
    L300 297Q305 296 305 299L291 305
    L302 305Q307 307 303 309L287 311
    Q282 315 275 309
    C244 301 228 279 216 257Z"
    fill="url(#arm)" stroke="#3e7979" stroke-width="1.1"/>
  <path d="M242 272Q254 296 278 302M280 302Q284 302 287 305"
    fill="none" stroke="#e9e4b7" stroke-width="1"/>
  <path d="M274 300Q280 295 281 291Q283 287 285 290Q287 295 283 300"
    fill="url(#skin)" stroke="#568e85" stroke-width=".8"/>

  <!-- A seamless coat of nacre, rather than human clothing. -->
  <path d="M193 211C189 228 177 233 175 251
    C172 267 179 276 173 290
    Q191 307 216 294
    C212 274 229 258 230 241
    C230 227 214 224 212 210Z"
    fill="url(#torso)" stroke="#346d70" stroke-width="1.2"/>
  <g clip-path="url(#bodyClip)">
    <path d="M190 215Q198 241 212 246Q196 255 193 288L179 302
      Q190 270 182 254Z" fill="#d7dfb6" opacity=".48"/>
    <rect x="166" y="250" width="68" height="57" fill="url(#scales)"/>
    <path d="M179 246Q191 263 202 248Q210 259 224 247
      M177 257Q187 274 199 260Q210 273 221 260
      M176 270Q185 283 197 272Q207 286 217 274
      M175 284Q184 296 194 285Q204 300 216 285"
      fill="none" stroke="#a1cfb3" stroke-width="1" opacity=".7"/>
  </g>
  <path d="M195 222Q197 234 209 237M190 238Q201 243 211 240"
    fill="none" stroke="#e5e3b7" stroke-width="1"/>
  <path d="M211 257Q202 277 205 290" fill="none" stroke="#133f52" opacity=".45"/>

  <!-- The near arm makes a listening gesture. -->
  <g class="hand">
    <path d="M183 237C172 236 168 245 160 252
      C150 246 146 227 142 215
      C147 209 150 205 150 199
      Q149 194 146 197L141 205
      L143 187Q142 182 139 186L136 202
      L133 184Q130 180 129 186L130 204
      L124 190Q120 187 120 192L125 210
      Q119 205 117 208Q115 210 121 217
      L130 225
      C131 245 139 267 155 271
      C169 275 183 261 190 252Z"
      fill="url(#arm)" stroke="#407b7a" stroke-width="1.1"/>
    <path d="M133 211Q140 210 142 215M130 219Q134 215 138 218
      M138 230Q142 251 154 259Q164 262 172 253"
      fill="none" stroke="#eae6bf" stroke-width="1.1"/>
    <path d="M131 207L134 212M137 204L138 210"
      fill="none" stroke="#5d9083" stroke-width=".7"/>
  </g>

  <!-- Face, ear, and the short crown of sensory filaments. -->
  <path d="M183 151C198 135 224 145 230 163
    C237 183 226 210 209 217
    C196 224 181 210 179 198
    L173 192Q169 188 178 181
    L178 168Q177 159 183 151Z"
    fill="url(#skin)" stroke="#457975" stroke-width="1"/>
  <ellipse cx="190" cy="195" rx="15" ry="13" fill="url(#cheek)"/>
  <path d="M225 176C235 171 244 163 250 153
    Q247 168 252 174Q240 178 243 185
    Q231 183 225 197Z"
    fill="url(#ear)" stroke="#588d82" stroke-width=".8"/>
  <path d="M228 187L250 153M229 185L252 174M228 190L243 185"
    fill="none" stroke="#e2d6a5" stroke-width=".75" opacity=".8"/>
  <path d="M226 182Q231 177 233 180Q235 184 228 189"
    fill="none" stroke="#3b7975" stroke-width="1.4"/>

  <path d="M180 172Q188 166 198 172M209 170Q215 167 220 172"
    fill="none" stroke="#38666a" stroke-width="1.5"/>
  <g class="eye-lid">
    <path d="M182 180Q190 173 199 180Q191 186 182 180Z"
      fill="#f2eccb"/>
    <path d="M209 179Q215 174 220 179Q215 183 209 179Z"
      fill="#e3e4bf"/>
    <g id="gaze">
      <ellipse cx="190.5" cy="180" rx="3.4" ry="4" fill="#9c9e58"/>
      <ellipse cx="190" cy="180" rx="1.9" ry="3.2" fill="#153d49"/>
      <circle cx="189" cy="178.5" r="1" fill="#fff4cf"/>
      <ellipse cx="214" cy="178.8" rx="2.4" ry="3" fill="#9c9e58"/>
      <ellipse cx="213.7" cy="178.8" rx="1.3" ry="2.4" fill="#153d49"/>
      <circle cx="213" cy="178" r=".65" fill="#fff4cf"/>
    </g>
    <path d="M182 180Q190 173 199 180M209 179Q215 174 220 179"
      fill="none" stroke="#254e58" stroke-width="1.7"/>
  </g>
  <path d="M184 182Q181 189 184 192L189 193"
    fill="none" stroke="#7c9c87" stroke-width=".8"/>
  <path d="M186 202Q194 205 201 200"
    fill="none" stroke="#8f7368" stroke-width="1.2"/>
  <path d="M189 206Q195 208 199 204" fill="none" stroke="#f6e7c2" stroke-width="1.1"/>
  <g class="gills" fill="none" stroke="#458b83" stroke-width=".9">
    <path d="M216 192l-3 5M220 192l-4 8M222 195l-4 8"/>
  </g>
  <g fill="#fff0ba">
    <circle cx="200" cy="188" r="1.1"/>
    <circle cx="205" cy="187" r=".8"/>
    <circle cx="209" cy="188" r="1"/>
    <circle cx="202" cy="192" r=".7"/>
    <circle cx="208" cy="192" r=".65"/>
  </g>

  <path d="M176 168C169 147 184 130 201 130
    C222 124 242 145 237 166
    Q234 178 227 182
    C232 158 212 160 204 148
    C198 161 187 165 176 168Z"
    fill="url(#hair)" stroke="#2e6168" stroke-width="1"/>
  <path d="M178 159Q188 156 199 140
    M185 143Q199 129 215 139
    M211 143Q229 149 231 168"
    fill="none" stroke="url(#hairLight)" stroke-width="1.4"/>
  <path d="M202 136C196 120 186 118 188 108
    M211 136C213 118 223 113 220 102
    M218 139C231 125 240 128 243 117"
    fill="none" stroke="#6eaaa0" stroke-width="1.5"/>
  <g fill="#efdaa5" stroke="#589a91" stroke-width=".6">
    <path d="M188 108Q181 102 187 97Q194 101 188 108Z"/>
    <path d="M220 102Q213 96 219 90Q226 95 220 102Z"/>
    <path d="M243 117Q239 109 246 106Q251 113 243 117Z"/>
  </g>
  <g fill="#dfe5b9">
    <circle class="light" cx="187" cy="101.5" r="1.3"/>
    <circle class="light" cx="219" cy="95" r="1.4"/>
    <circle class="light" cx="246" cy="110" r="1.2"/>
  </g>

  <path d="M182 153Q192 146 198 138"
    fill="none" stroke="#efcf94" stroke-width="1.1"/>
  <g fill="#eac88c">
    <circle cx="180" cy="155" r="1.3"/>
    <circle cx="184" cy="152" r="1"/>
    <circle cx="188" cy="149" r="1"/>
    <circle cx="192" cy="145" r=".9"/>
  </g>
</g>
</svg>

<script>
(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const ribs = document.getElementById('ribs');
  const ribPaths = [
    'M169 309Q181 315 190 309',
    'M166 322Q179 330 191 323',
    'M169 336Q182 343 197 336',
    'M175 350Q189 356 206 349',
    'M185 364Q198 369 217 360',
    'M197 377Q211 379 229 371',
    'M212 389Q226 390 242 381',
    'M229 400Q243 403 256 391',
    'M245 412Q260 413 270 403',
    'M259 425Q275 425 282 417',
    'M270 439Q286 439 291 432',
    'M276 453Q292 455 299 449',
    'M277 468Q291 473 300 467',
    'M270 483Q282 491 290 485',
    'M257 493Q265 505 273 500',
    'M242 499Q244 510 252 512',
    'M226 499Q226 510 232 515',
    'M211 494Q209 503 214 509',
    'M198 484Q193 488 198 499'
  ];
  ribPaths.forEach(d => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    ribs.appendChild(p);
  });

  const lights = document.getElementById('tailLights');
  [
    [196,311,1.5], [207,333,1.6], [224,350,1.8],
    [245,364,1.7], [265,379,1.9], [282,396,1.6],
    [296,415,1.7], [304,435,1.5], [302,456,1.5],
    [294,477,1.3], [280,492,1.2], [262,503,1.1],
    [242,508,1], [222,505,.9]
  ].forEach(([x,y,r]) => {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'light');
    const halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', x);
    halo.setAttribute('cy', y);
    halo.setAttribute('r', r * 2.8);
    halo.setAttribute('fill', '#ccecc1');
    halo.setAttribute('opacity', '.12');
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', r);
    dot.setAttribute('fill', '#f6e9b0');
    g.append(halo, dot);
    lights.appendChild(g);
  });

  const svg = document.querySelector('svg');
  const gaze = document.getElementById('gaze');
  let last = 0;
  window.addEventListener('pointermove', event => {
    const now = performance.now();
    if (now - last < 60 || event.pointerType === 'touch') return;
    last = now;
    const r = svg.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - r.left) / r.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - r.top) / r.height * 2 - 1));
    gaze.setAttribute('transform', `translate(${x * 1.1} ${y * .65})`);
  }, { passive: true });
  document.addEventListener('pointerleave', () => gaze.removeAttribute('transform'));
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Listening Tide",
  "statement": "She curled her seahorse tail around nothing at all and held one hand toward the hull. Every sailor aboard heard, for a breath, the thing they had been trying to say."
}
```