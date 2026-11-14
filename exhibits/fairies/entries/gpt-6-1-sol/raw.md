```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mending</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #071a22; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<canvas aria-label="A luminous fairy draws a golden thread through broken porcelain above a dark, still pool."></canvas>
<script>
(() => {
  'use strict';

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const W = 600, H = 900, R = 1.5;
  let width, height, scale, ox, oy;
  let seed = 48127;

  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  }
  function between(a, b) { return a + random() * (b - a); }
  function path(c, d, fill, stroke, lineWidth = 1) {
    const p = new Path2D(d);
    if (fill) { c.fillStyle = fill; c.fill(p); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(p); }
  }
  function ellipse(c, x, y, rx, ry, fill, stroke, lw = 1) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  }
  function linear(c, x, y, xx, yy, stops) {
    const g = c.createLinearGradient(x, y, xx, yy);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    return g;
  }
  function glow(c, x, y, r, color) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    ellipse(c, x, y, r, r, g);
  }
  function layer(fn) {
    const el = document.createElement('canvas');
    el.width = W * R;
    el.height = H * R;
    const c = el.getContext('2d');
    c.scale(R, R);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    fn(c);
    return el;
  }
  function image(c, el) { c.drawImage(el, 0, 0, W, H); }

  function reed(c, x, y, length, lean, color) {
    c.save();
    c.translate(x, y);
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = .8;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(lean * .2, -length * .6, lean, -length);
    c.stroke();
    for (let i = 1; i < 8; i++) {
      const u = i / 9;
      const px = lean * u * u, py = -length * u;
      const side = i % 2 ? 1 : -1;
      const l = length * .18 * (1 - u * .65);
      path(c, `M${px},${py}
        Q${px + side*l*.9},${py-l*.8} ${px+side*l},${py-l}
        Q${px+side*l*.35},${py-l*.7} ${px},${py}`, color);
    }
    c.restore();
  }

  const background = layer(c => {
    c.fillStyle = linear(c, 0, 0, 430, 900, [
      [0, '#06131e'], [.4, '#12343d'], [.72, '#173d41'], [1, '#06191f']
    ]);
    c.fillRect(0, 0, W, H);

    glow(c, 403, 268, 290, '#517b703c');
    glow(c, 188, 446, 250, '#1e78852a');
    glow(c, 393, 650, 200, '#6c74402a');

    // A distant, half-submerged architectural memory.
    c.save();
    c.globalAlpha = .15;
    path(c, 'M435 558L435 177Q435 102 506 72L525 72Q455 125 455 197L455 558Z', '#75918a');
    path(c, 'M462 546L462 204Q462 150 504 125L514 125Q480 164 480 214L480 546Z', '#071e29');
    path(c, 'M517 83L527 83L527 559L517 559Z', '#66847b');
    path(c, 'M430 561L549 561L556 568L423 568Z', '#819086');
    c.restore();

    for (let i = 0; i < 100; i++) {
      const x = between(26, 574), y = between(22, 630);
      const a = between(.07, .46);
      ellipse(c, x, y, between(.35, 1.1), between(.35, 1.1), `rgba(211,218,180,${a})`);
      if (i % 17 === 0) {
        path(c, `M${x-3} ${y}H${x+3}M${x} ${y-3}V${y+3}`, null, '#c8c9a64a', .5);
      }
    }

    // Water and its almost invisible banks.
    c.fillStyle = linear(c, 0, 676, 0, 900, [
      [0, '#153a3a00'], [.18, '#0b2a31'], [1, '#071b22']
    ]);
    c.fillRect(0, 655, 600, 245);
    for (let i = 0; i < 74; i++) {
      const y = between(701, 899), x = between(0, 600);
      path(c, `M${x} ${y}q${between(10, 35)} -2 ${between(40, 110)} 0`, null,
        `rgba(104,158,149,${between(.025,.12)})`, between(.4,1));
    }
    for (let i = 0; i < 75; i++) {
      const y = between(762, 897);
      const x = 402 + between(-1, 1) * (900-y) * .42;
      path(c, `M${x} ${y}h${between(2, 17)}`, null,
        `rgba(205,183,112,${between(.04,.25)})`, between(.5,1.7));
    }

    for (let i = 0; i < 16; i++) {
      reed(c, between(-30, 110), between(830, 980),
        between(160, 320), between(-75, 70), i % 3 ? '#09282c' : '#2c4d48');
    }
    for (let i = 0; i < 13; i++) {
      reed(c, between(515, 650), between(850, 980),
        between(110, 240), between(-80, 30), i % 3 ? '#09252a' : '#36534b');
    }

    // Delicate hanging roots at the far edge of the clearing.
    for (let i = 0; i < 9; i++) {
      const x = between(-20, 118), end = between(130, 340);
      const d = `M${x} -15C${x+70} 64 ${x-35} ${end-70} ${x+10} ${end}`;
      path(c, d, null, '#6b8b732b', .8);
      ellipse(c, x+10, end, 2, 5, '#718a654a');
    }

    // Fine pigment grain, baked into the still layers.
    for (let i = 0; i < 25000; i++) {
      const x = random()*600, y = random()*900;
      c.fillStyle = random() < .5 ? '#c9e1ca08' : '#000a120c';
      c.fillRect(x, y, between(.35,1.2), between(.35,1.1));
    }
  });

  const bowl = layer(c => {
    glow(c, 405, 702, 120, '#edbf5a16');
    ellipse(c, 401, 772, 125, 14, '#020f1780');
    ellipse(c, 401, 773, 151, 22, null, '#82b5a52c', .6);
    ellipse(c, 401, 773, 178, 31, null, '#82b5a518', .6);

    const shell = `M291 637
      C328 621 464 619 514 637
      C505 704 472 751 407 758
      C346 756 308 710 291 637Z`;
    const porcelain = linear(c, 292, 627, 489, 752, [
      [0, '#91b6af'], [.22, '#d9ddd0'], [.49, '#b7c7bb'],
      [.73, '#73958e'], [1, '#284d50']
    ]);
    path(c, shell, porcelain, '#b3c8b18c', .8);
    const clip = new Path2D(shell);
    c.save();
    c.clip(clip);
    glow(c, 364, 666, 75, '#fff1d32a');
    for (let i = 0; i < 2300; i++) {
      c.fillStyle = random() < .5 ? '#f2eacc0c' : '#143e4010';
      c.fillRect(between(291,514), between(637,758), .7, .7);
    }
    // Faded botanical glaze.
    c.save();
    c.globalAlpha = .36;
    path(c, 'M332 671Q367 683 385 728M347 680Q336 666 329 668Q329 678 347 680M357 687Q361 669 369 668Q374 682 357 687M370 702Q348 689 344 698Q351 710 370 702M377 711Q383 689 391 690Q396 704 377 711',
      null, '#365f65', 1.1);
    path(c, 'M447 666Q454 695 437 724M451 683Q432 674 433 686Q438 692 451 683M448 699Q463 685 469 694Q460 705 448 699',
      null, '#365f65', .8);
    c.restore();
    const fractures = [
      'M384 632L376 656L393 675L382 700L400 720L407 758',
      'M393 675L419 678L437 700L470 714',
      'M382 700L357 705L345 732',
      'M476 635L463 657L472 674L452 693',
      'M309 667L333 670L343 690L357 705'
    ];
    for (const d of fractures) {
      path(c, d, null, '#614a2b', 3.4);
      path(c, d, null, '#d9a94e', 2.1);
      path(c, d, null, '#fff1ad', .65);
    }
    c.restore();

    ellipse(c, 402, 636, 111, 21,
      linear(c, 0, 615, 0, 657, [[0,'#061f28'],[1,'#396063']]),
      '#d2d6b5', 1.3);
    path(c, 'M294 637C322 657 459 665 512 638', null, '#f4e3ab', 1.5);
    path(c, 'M304 634C347 619 455 620 497 632', null, '#779d95', .7);

    // The missing section of the rim opens into the black interior.
    path(c, 'M446 616L464 621L458 636L442 643L428 638L435 626Z', '#133137');
    path(c, 'M428 638L442 643L458 636L464 621', null, '#e5bc68', 1.3);
    ellipse(c, 372, 636, 38, 6, null, '#789c8240', .5);
  });

  function wing(outline, veins, tint) {
    return layer(c => {
      const p = new Path2D(outline);
      c.save();
      c.clip(p);
      c.fillStyle = linear(c, 260, 410, 360, 155, [
        [0, '#68a69810'], [.35, '#79b7ad39'],
        [.7, tint], [1, '#bbd1a336']
      ]);
      c.fillRect(30, 110, 490, 410);
      glow(c, 311, 320, 170, '#70bba21a');
      glow(c, 166, 310, 100, '#6d9dd52b');

      // Uneven, hair-fine cells make the membrane more lace than glass.
      const rows = [];
      for (let y = 130, row = 0; y < 510; y += 22, row++) {
        const arr = [];
        for (let x = 36; x < 520; x += 25)
          arr.push([x + (row%2)*12 + between(-7,7), y+between(-6,6)]);
        rows.push(arr);
      }
      rows.forEach((row, j) => {
        row.forEach((p, i) => {
          if (!rows[j+1] || !row[i+1]) return;
          const b = row[i+1], d = rows[j+1][i], e = rows[j+1][i+1];
          if (random() < .34) {
            path(c, `M${p}L${b}L${d}Z`,
              random()<.5 ? '#bfd5a008' : '#5b9eae0c');
          }
          path(c, `M${p}Q${(p[0]+b[0])/2} ${p[1]+3} ${b}
            M${p}L${d}M${b}L${d}`, null, '#c7d6b51c', .45);
          if (e && random() < .15)
            ellipse(c, p[0], p[1], 1.3, 1.3, '#e2d7ab59');
        });
      });
      for (const d of veins) {
        path(c, d, null, '#233f4c70', 2.1);
        path(c, d, null, '#d0d7b98a', .65);
      }
      for (let i = 0; i < 1050; i++) {
        const x = between(30, 510), y = between(130, 510);
        ellipse(c, x, y, between(.25,.8), between(.25,.8), '#e2e9bb35');
      }
      c.restore();
      path(c, outline, null, '#a4c4ae80', .85);
      path(c, outline, null, '#d9d6a72e', 2.3);
    });
  }

  const leftUpper = wing(
    'M251 394C209 324 145 225 57 203C72 252 41 279 76 325C114 371 191 385 251 394Z',
    [
      'M251 394Q137 328 57 203',
      'M240 386Q151 350 65 280',
      'M223 373Q187 294 113 229',
      'M198 355Q139 350 78 326',
      'M167 322Q141 267 91 216',
      'M136 291Q109 296 59 281',
      'M211 380Q145 376 107 353'
    ], '#5d8ba543'
  );
  const rightUpper = wing(
    'M257 394C295 313 345 200 488 137C468 185 507 234 476 293C439 346 350 370 257 394Z',
    [
      'M257 394Q376 271 488 137',
      'M271 382Q373 347 476 293',
      'M295 353Q399 308 490 235',
      'M328 316Q377 228 455 155',
      'M358 280Q431 254 483 187',
      'M392 240Q410 188 449 157',
      'M302 362Q389 361 444 325',
      'M429 197Q460 193 477 172'
    ], '#7fa99b44'
  );
  const leftLower = wing(
    'M246 405C179 376 106 369 87 403C105 420 100 451 125 466C165 478 217 441 246 405Z',
    [
      'M246 405Q156 418 87 403',
      'M235 408Q166 444 125 466',
      'M196 414Q145 388 107 386',
      'M166 417Q128 438 112 446'
    ], '#557da746'
  );
  const rightLower = wing(
    'M261 403C329 391 431 357 460 388C442 416 451 448 419 477C374 491 315 445 261 403Z',
    [
      'M261 403Q376 433 460 388',
      'M280 411Q348 454 419 477',
      'M322 420Q376 384 430 378',
      'M367 424Q414 448 438 448'
    ], '#589b9350'
  );

  const fairy = layer(c => {
    const skin = linear(c, 227, 300, 282, 590, [
      [0, '#ebead4'], [.3, '#b6d0c5'], [.6, '#87b2ad'], [1, '#557d83']
    ]);
    const silk = linear(c, 225, 365, 282, 600, [
      [0, '#e4e5c9'], [.3, '#b0cfc4'], [.68, '#76a5a06e'], [1, '#76a5a000']
    ]);

    // Hair, loose as fine roots in water.
    path(c, 'M269 301C243 278 225 297 225 322C223 351 202 356 207 387C222 370 240 372 248 349L267 330Z',
      '#14383e', '#719b8c', .7);
    for (let i = 0; i < 18; i++) {
      const x = 229 + i*1.7;
      path(c, `M${x} ${303+Math.sin(i)*8}C${x-14} 327 ${x+5} 350 ${204+i*2} ${379+Math.sin(i)*11}`,
        null, i%3 ? '#8bb5a64c' : '#d4d7b68a', .55);
    }

    // The two legs describe a hovering, unhurried step.
    path(c, 'M245 503C238 538 238 565 225 589C217 605 207 614 204 629L198 646Q207 648 211 636L216 626C239 609 249 590 255 565L270 516Z',
      skin, '#b9d4bc64', .7);
    path(c, 'M263 505C277 529 284 547 280 566C276 586 258 600 250 612Q247 620 236 625Q234 620 241 614L246 602C256 581 263 566 255 550L245 523Z',
      linear(c,245,512,280,619,[[0,'#c1d2bc'],[1,'#6d9d98']]), '#c3d4bb64', .6);
    path(c, 'M241 549Q235 588 211 618M275 555Q273 581 250 605', null, '#ecedd256', .65);

    // Ribbons of a gown, with open air between the hems.
    path(c, 'M245 431C236 470 199 507 177 567C197 556 211 556 216 541C210 576 186 602 169 613C207 608 236 584 248 553C244 589 230 615 214 636C254 617 272 574 272 541C289 572 305 584 325 587C305 558 300 524 286 496L273 438Z',
      silk, '#b9d1ba41', .7);
    path(c, 'M252 440C242 492 217 529 203 570C229 550 248 511 259 468C256 530 248 570 228 608C264 578 276 527 269 468C283 512 298 543 308 557C295 505 289 474 272 438Z',
      linear(c,240,436,254,612,[[0,'#e1e3c5c9'],[.45,'#b1cec08a'],[1,'#82aaa000']]));
    for (let i = 0; i < 17; i++) {
      const s = i/16;
      path(c, `M${245+s*27} 440C${244+s*28} 485 ${190+s*110} 555 ${175+s*145} ${603-Math.sin(s*3.14)*39}`,
        null, `rgba(220,225,193,${.13 + Math.sin(s*3.14)*.22})`, .55);
    }

    // Far arm, relaxed, holding the free end of the thread.
    path(c, 'M244 378C232 380 227 400 226 418L216 441L193 452Q183 449 183 454L191 461Q198 463 201 457L226 449Q236 431 240 413L252 390Z',
      skin, '#c6d9bd73', .7);
    path(c, 'M191 452L183 448M194 452L189 446M197 454L194 447', null, '#b6cec0', 1.1);

    // Neck and fitted, petal-like bodice.
    path(c, 'M256 337L255 361Q250 370 242 376L262 393L278 377Q267 366 268 343Z', skin);
    path(c, 'M244 372Q256 386 275 371Q285 384 277 402L266 433L275 449Q257 443 243 452L247 432L237 401Q233 385 244 372Z',
      linear(c,235,383,282,445,[[0,'#d5dfc4'],[.4,'#87b0a8'],[.8,'#acc8b5'],[1,'#557e7c']]),
      '#dce2bd9c', .7);
    path(c, 'M242 382Q254 400 249 426M271 380Q257 400 261 432', null, '#f0e6be8a', .7);
    path(c, 'M261 389L257 403L260 415L257 431L264 443', null, '#ebc775', 1);
    for (let y = 396; y < 435; y += 7)
      path(c, `M254 ${y}l6 3`, null, '#f1d38a', .7);

    // Near arm and a finely articulated hand.
    path(c, 'M276 376C287 382 290 399 301 413Q306 419 312 415L346 395L355 390L365 392L372 389Q376 389 374 392L366 397L357 397L352 402C334 416 318 433 305 432C287 429 278 410 269 396Z',
      skin, '#d0dfc875', .8);
    path(c, 'M353 395L362 391M355 397L365 394M357 399L366 396', null, '#567c78', .6);
    path(c, 'M283 391Q290 408 303 421Q309 426 319 420', null, '#edf0cd70', .65);

    // Face in profile.
    path(c, 'M252 301C262 294 275 299 279 309L281 318L290 325Q290 328 282 329L283 334L279 336Q281 341 274 345Q263 349 254 338L248 322Z',
      linear(c,247,310,288,339,[[0,'#9bbeb3'],[.45,'#e1e4cb'],[1,'#ecdfbc']]),
      '#d1ddbf90', .6);
    path(c, 'M253 313Q242 303 237 303Q240 321 252 327Z',
      '#b6c9b5', '#e0dfbb', .6);
    path(c, 'M249 319L241 308', null, '#6a8e84', .7);
    path(c, 'M268 321Q274 324 280 321M270 322L268 324', null, '#284c50', .95);
    path(c, 'M278 334L282 334', null, '#8c7b69', .6);
    path(c, 'M266 336Q269 340 274 340', null, '#f6e6c28c', .75);
    ellipse(c, 272, 329, 3.8, 2.3, '#c6a67c38');

    // A swept fringe and a living crown of seed filaments.
    path(c, 'M246 321C239 310 242 298 251 295C267 288 279 300 280 309C268 304 263 307 258 314L252 326Z',
      '#285056', '#a5b8a0', .6);
    for (let i = 0; i < 8; i++)
      path(c, `M${246+i*3} 302Q${250+i*3} 292 ${278-i} ${307-i*.4}`,
        null, '#bfcaab6b', .55);
    const sprigs = [
      ['M251 300Q231 273 239 257',239,257],
      ['M258 297Q250 267 262 247',262,247],
      ['M267 299Q274 278 289 273',289,273],
      ['M247 305Q226 291 219 278',219,278]
    ];
    sprigs.forEach(([d,x,y],i) => {
      path(c,d,null,'#d7c484',.8);
      ellipse(c,x,y, i%2 ? 2 : 1.7,3.2,'#e3d3a0');
      glow(c,x,y,8,'#ead08a24');
    });
    path(c, 'M239 376Q226 370 224 361Q237 362 245 377M272 375Q281 362 288 361Q287 373 278 380',
      '#8eaf9b', '#ddd3a0', .65);
    ellipse(c, 255, 348, 1.6, 2.8, '#e7c875');
  });

  const foreground = layer(c => {
    for (let i = 0; i < 8; i++) {
      const x = between(-20, 130);
      reed(c, x, between(931, 1010), between(170, 280), between(-40,80), '#061a22');
    }
    for (let i = 0; i < 7; i++) {
      reed(c, between(505,650), between(943,1030), between(170,270), between(-70,30), '#061a22');
    }
    path(c, 'M0 846Q47 811 90 820Q73 827 54 832Q88 832 123 849Q64 846 0 882Z', '#071f26');
    path(c, 'M541 846Q562 817 600 810L600 869Q568 850 541 846Z', '#071f26');
  });

  const motes = Array.from({ length: 43 }, () => ({
    x: between(75, 535), y: between(180, 797),
    r: between(.55, 1.6), speed: between(.12,.36),
    phase: between(0,Math.PI*2)
  }));

  let pointerX = 0, pointerY = 0;
  let followX = 0, followY = 0;
  window.addEventListener('pointermove', e => {
    pointerX = (e.clientX / innerWidth - .5) * 5;
    pointerY = (e.clientY / innerHeight - .5) * 4;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.7);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    const fit = Math.max(width/W, height/H);
    // The scene fills its viewport, including when opened at unusual sizes.
    scale = fit*dpr;
    ox = (canvas.width-W*scale)/2;
    oy = (canvas.height-H*scale)/2;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function drawWing(el, angle, stretch, alpha) {
    ctx.save();
    ctx.translate(255,397);
    ctx.rotate(angle);
    ctx.scale(stretch,1);
    ctx.translate(-255,-397);
    ctx.globalAlpha = alpha;
    image(ctx, el);
    ctx.restore();
  }

  function shard(c, x, y, angle, size, t) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.scale(size,size);
    path(c, 'M-18 -17L11 -25L26 -4L9 20L-13 12L-8 1Z',
      linear(c,-15,-18,20,22,[[0,'#e1dec1'],[.45,'#a8bfb3'],[1,'#476e70']]),
      '#c3c9a3', .8);
    path(c, 'M-18 -17L-8 1L-13 12M-8 1L9 4L9 20', null, '#f1c878', 1);
    path(c, 'M-4 -15Q7 -7 12 -13M-2 -12Q-5 -3 1 1', null, '#426c6b', .65);
    c.restore();
    glow(c,x,y,22,`rgba(230,181,76,${.055+.02*Math.sin(t)})`);
  }

  let last = 0;
  function frame(ms) {
    requestAnimationFrame(frame);
    if (ms-last < 31) return;
    last = ms;
    const t = ms*.001;
    followX += (pointerX-followX)*.04;
    followY += (pointerY-followY)*.04;

    ctx.setTransform(scale,0,0,scale,ox,oy);
    image(ctx, background);

    // Slow ellipses expand beneath the light.
    for (let i = 0; i < 3; i++) {
      const p = ((t*.065+i/3)%1);
      ellipse(ctx,399,774,90+p*95,9+p*27,null,
        `rgba(172,192,146,${(1-p)*.16})`,.65);
    }
    image(ctx,bowl);

    const bob = Math.sin(t*.83)*4;
    const sway = Math.sin(t*.47)*.009;
    ctx.save();
    ctx.translate(followX, bob+followY);
    ctx.translate(253,401);
    ctx.rotate(sway);
    ctx.translate(-253,-401);

    const beat = Math.sin(t*1.45);
    drawWing(leftLower, -.017+beat*.018, .98+beat*.035, .77);
    drawWing(rightLower, .012-beat*.018, .98+beat*.035, .8);
    drawWing(leftUpper, -.012+beat*.023, .98+beat*.024, .91);
    drawWing(rightUpper, .012-beat*.025, .98+beat*.035, .94);

    glow(ctx,255,397,100,'#b1e2c30c');
    image(ctx,fairy);
    ctx.restore();

    const handX = 370+followX;
    const handY = 393+bob+followY;
    const sy = Math.sin(t*.72)*3;
    const sx = Math.sin(t*.51)*2;
    const shardX = 451+sx, shardY = 572+sy;

    // A single, impossible length of repair silk.
    const thread = `M${192+followX} ${455+bob+followY}
      C231 ${423+bob} 318 ${471+bob} ${handX} ${handY}
      C405 ${353+bob} 438 407 407 451
      C377 494 420 509 ${shardX-8} ${shardY-14}
      C${shardX+7} ${shardY+9} 455 611 445 637`;
    ctx.save();
    ctx.shadowColor = '#e9bd61';
    ctx.shadowBlur = 7;
    path(ctx, thread, null, '#e5c57880', 1.05);
    ctx.shadowBlur = 0;
    path(ctx, thread, null, '#f7e1a1c0', .5);
    ctx.restore();

    // Needle: tiny, functional, never a wand.
    path(ctx, `M${handX-3} ${handY+8}L${handX+10} ${handY-19}`, null, '#f8edd0', .85);
    ellipse(ctx,handX+8,handY-15,1,2,null,'#f6d698',.5);

    shard(ctx,shardX,shardY, -.2+Math.sin(t*.62)*.045,1,t);
    shard(ctx,490+Math.sin(t*.55)*2,606+Math.sin(t*.7+2)*3,.48+Math.sin(t*.5)*.08,.34,t);
    shard(ctx,417+Math.sin(t*.63)*2,596+Math.sin(t*.6+1)*2,-.6,.23,t);

    // Warmth moves along the repaired seams without obscuring them.
    glow(ctx,394,687,44,`rgba(244,184,67,${.055+Math.sin(t*.9)*.018})`);
    glow(ctx,445,637,14,`rgba(255,212,108,${.14+Math.sin(t*1.2)*.045})`);

    motes.forEach(m => {
      const x = m.x + Math.sin(t*m.speed+m.phase)*10;
      const y = m.y + Math.cos(t*m.speed*.7+m.phase)*14;
      const a = .2 + .45*Math.pow((Math.sin(t*.85+m.phase)+1)/2,2);
      glow(ctx,x,y,m.r*5,`rgba(220,209,132,${a*.12})`);
      ellipse(ctx,x,y,m.r,m.r,`rgba(232,219,158,${a})`);
    });

    // A pale petal drifts on the lower water.
    ctx.save();
    ctx.translate(171+Math.sin(t*.17)*9,788+Math.sin(t*.39)*1.8);
    ctx.rotate(.18+Math.sin(t*.3)*.09);
    path(ctx,'M-12 0Q0 -7 12 0Q0 4 -12 0','#98b8a67a');
    path(ctx,'M-11 1Q0 6 13 1',null,'#87b9a72e',.6);
    ctx.restore();

    image(ctx,foreground);
  }
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Fairy of Mending",
  "statement": "What was broken can become a map of light."
}
```