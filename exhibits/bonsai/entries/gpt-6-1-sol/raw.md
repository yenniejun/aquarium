```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: transparent; }
  svg { display: block; width: 100%; height: 100%; overflow: hidden; }
</style>
</head>
<body>
<svg viewBox="0 0 700 700" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A wind-stirred ginkgo with copper-veined leaves in a mended porcelain pot.">
<defs>
  <linearGradient id="porcelain" x1="0" y1="0" x2=".85" y2="1">
    <stop stop-color="#fcf4dd"/>
    <stop offset=".38" stop-color="#e9e5cd"/>
    <stop offset=".72" stop-color="#c3ceba"/>
    <stop offset="1" stop-color="#829b92"/>
  </linearGradient>
  <linearGradient id="glaze" x1="0" y1="0" x2=".8" y2="1">
    <stop stop-color="#497e78"/>
    <stop offset=".44" stop-color="#245c61"/>
    <stop offset="1" stop-color="#153c48"/>
  </linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#f9f1da"/>
    <stop offset="1" stop-color="#aebdac"/>
  </linearGradient>
  <radialGradient id="soil">
    <stop stop-color="#59604a"/>
    <stop offset="1" stop-color="#303f36"/>
  </radialGradient>
  <linearGradient id="bark" x1="0" y1="0" x2="1" y2=".15">
    <stop stop-color="#514d40"/>
    <stop offset=".28" stop-color="#8c8062"/>
    <stop offset=".52" stop-color="#b7a383"/>
    <stop offset=".76" stop-color="#86765c"/>
    <stop offset="1" stop-color="#4d574a"/>
  </linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="1" y2=".3">
    <stop stop-color="#958768"/>
    <stop offset=".4" stop-color="#ddd0aa"/>
    <stop offset=".72" stop-color="#c3b28b"/>
    <stop offset="1" stop-color="#80765b"/>
  </linearGradient>
  <linearGradient id="copper" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#976b40"/>
    <stop offset=".4" stop-color="#e5bc70"/>
    <stop offset=".65" stop-color="#b27c45"/>
    <stop offset="1" stop-color="#f0d59c"/>
  </linearGradient>
  <linearGradient id="leaf0" x1="0" y1="1" x2=".7" y2="0">
    <stop stop-color="#537c64"/><stop offset="1" stop-color="#9bb991"/>
  </linearGradient>
  <linearGradient id="leaf1" x1="0" y1="1" x2=".8" y2="0">
    <stop stop-color="#397061"/><stop offset="1" stop-color="#79a58a"/>
  </linearGradient>
  <linearGradient id="leaf2" x1="0" y1="1" x2=".5" y2="0">
    <stop stop-color="#78916a"/><stop offset="1" stop-color="#c4cb8d"/>
  </linearGradient>
  <linearGradient id="leaf3" x1="0" y1="1" x2=".7" y2="0">
    <stop stop-color="#a38c4e"/><stop offset="1" stop-color="#e3ca7e"/>
  </linearGradient>
  <linearGradient id="leaf4" x1="0" y1="1" x2=".8" y2="0">
    <stop stop-color="#447b71"/><stop offset="1" stop-color="#a7c3a8"/>
  </linearGradient>
  <g id="fan">
    <path d="M0-5 C-3-10-12-11-14-19 Q-14-23-10-23 Q-7-27-3-24 L0-21 2-24 Q6-27 10-23 Q14-24 15-20 C13-13 4-10 0-5Z"
          stroke="#657751" stroke-width=".38" stroke-opacity=".45"/>
    <path d="M0 1L0-5 M0-6Q-3-13-10-21 M0-6Q-1-15-3-23 M0-6Q3-15 7-23 M0-6Q7-13 12-20"
          fill="none" stroke="#c9b47b" stroke-width=".45" stroke-linecap="round" opacity=".7"/>
  </g>
  <clipPath id="bowlClip">
    <path d="M180 595 C188 635 216 672 278 686 Q350 706 422 686 C484 672 512 635 520 595Z"/>
  </clipPath>
</defs>

<!-- The foot is part of the vessel. -->
<path d="M279 680 Q350 690 421 680 L418 695 Q350 705 282 695Z" fill="#36575a"/>
<path d="M285 694 Q350 703 415 694 L414 698 Q350 702 286 698Z" fill="#b9b99d"/>

<path d="M180 595 C188 635 216 672 278 686 Q350 706 422 686 C484 672 512 635 520 595Z"
      fill="url(#porcelain)"/>
<g clip-path="url(#bowlClip)">
  <path d="M174 625 C205 616 216 639 243 634 C267 629 278 645 301 639
           C323 632 336 646 358 640 C391 630 412 641 438 624
           C461 610 490 627 527 608 L540 712H167Z" fill="url(#glaze)"/>
  <path d="M192 632 C216 627 221 642 242 639 M253 640Q277 647 295 643
           M373 644Q404 639 419 638 M458 629Q483 625 502 628"
        fill="none" stroke="#7ba093" stroke-width="1.4" opacity=".55"/>
  <path d="M212 607 C220 630 225 644 244 655 L259 674 281 687
           M244 655L265 649 279 650 296 639
           M265 649L270 633 267 618
           M448 600L435 618 441 637 425 654 429 677
           M441 637L465 647 479 645
           M425 654L402 660 393 676 375 687"
        fill="none" stroke="#6e6249" stroke-width="3.1" stroke-linejoin="round"/>
  <path d="M212 607 C220 630 225 644 244 655 L259 674 281 687
           M244 655L265 649 279 650 296 639
           M265 649L270 633 267 618
           M448 600L435 618 441 637 425 654 429 677
           M441 637L465 647 479 645
           M425 654L402 660 393 676 375 687"
        fill="none" stroke="url(#copper)" stroke-width="1.9" stroke-linejoin="round"/>
  <path d="M201 610Q209 642 235 662" fill="none" stroke="#fff8df" stroke-width="5" opacity=".27" stroke-linecap="round"/>
  <g id="glazeSpecks"></g>
</g>
<ellipse cx="350" cy="595" rx="170" ry="27" fill="url(#rim)"/>
<ellipse cx="350" cy="594" rx="157" ry="20" fill="url(#soil)"/>
<path d="M194 591C218 565 476 565 507 590" fill="none" stroke="#fff4d8" stroke-width="2" opacity=".8"/>
<g id="soilDetails"></g>

<g id="livingTree">
  <g id="boughs"></g>

  <path d="M333 591 C322 566 301 541 304 508
           C305 477 333 451 344 428
           C363 398 348 382 328 358
           C304 330 303 304 319 278
           C327 264 344 249 350 234
           C365 214 361 190 354 172
           L363 169 C377 199 376 221 363 243
           C344 271 331 287 333 309
           C333 332 351 347 365 370
           C384 401 372 429 351 454
           C326 484 321 503 331 530
           C339 550 358 568 366 588
           C359 600 345 601 333 591Z" fill="url(#bark)"/>

  <path d="M345 587 C333 557 313 536 315 510
           C317 481 347 453 356 429
           C370 397 351 376 335 355
           C314 327 316 304 329 282
           C343 260 360 245 365 224
           C360 251 340 276 336 296
           C330 320 341 341 357 362
           C374 385 380 405 366 433
           C352 463 328 487 328 510
           C328 537 346 555 352 578Z" fill="url(#wood)"/>

  <g fill="none" stroke-linecap="round">
    <path d="M334 580C326 557 308 538 310 511C312 484 339 454 347 434
             M323 333C313 307 325 287 337 271
             M361 240Q376 212 363 182"
          stroke="#3f4c40" stroke-width="2.1" opacity=".65"/>
    <path d="M345 575C335 548 320 531 322 508C323 488 341 467 352 446
             M356 423C369 395 345 370 333 350
             M325 318Q324 295 340 275"
          stroke="#ede0b9" stroke-width="1.25" opacity=".7"/>
    <path d="M356 579L351 560M330 549L325 532M313 519L315 503
             M335 473L344 459M360 441L365 429M371 411L371 399
             M360 379L353 368M320 342L315 328M317 295L322 284
             M344 260L351 250M368 222L369 210"
          stroke="#665f49" stroke-width="1.2"/>
    <path d="M332 492Q323 509 329 520Q337 529 336 517Q331 503 337 495"
          stroke="#665a42" stroke-width="1.2"/>
    <path d="M328 501Q324 512 332 519" stroke="#e4d3a6" stroke-width="1"/>
    <path d="M345 357Q355 367 358 380" stroke="#b98750" stroke-width="1.2" opacity=".8"/>
  </g>

  <g fill="url(#bark)">
    <path d="M335 572 C323 581 315 586 299 588 Q288 590 279 596
             C296 596 312 594 325 590 L345 589Z"/>
    <path d="M352 575 C365 583 371 587 384 588 Q400 591 413 597
             C390 597 368 593 352 590Z"/>
    <path d="M342 579 Q335 591 321 599 Q339 600 350 590 L365 594 Q363 586 352 580Z"/>
  </g>
  <g fill="none" stroke="#c8b58b" stroke-width="1.1" stroke-linecap="round">
    <path d="M337 582Q314 593 294 593 M358 584Q377 591 399 594 M346 589L333 597"/>
  </g>
</g>

<g id="frontMoss"></g>
<path d="M180 595 C187 631 510 632 520 595"
      fill="none" stroke="url(#rim)" stroke-width="7" stroke-linecap="round"/>
<path d="M191 606 C245 630 455 630 509 606"
      fill="none" stroke="#f1ead1" stroke-width="1.3" opacity=".8"/>
</svg>

<script>
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  let seed = 924731;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const between = (a,b) => a + (b-a)*rand();
  const soil = document.getElementById('soilDetails');
  const front = document.getElementById('frontMoss');
  const specks = document.getElementById('glazeSpecks');

  for (let i=0; i<90; i++) {
    const x=between(205,496), y=between(576,611);
    if (((x-350)/148)**2 + ((y-594)/18)**2 > 1) continue;
    make('ellipse', {
      cx:x, cy:y, rx:between(.7,2.5), ry:between(.4,1.3),
      fill:['#8b8765','#a9a180','#303f32','#6e7654'][i%4],
      opacity:between(.4,.8)
    }, soil);
  }
  function moss(cx,cy,rx,ry,n,parent) {
    for(let i=0;i<n;i++){
      const a=rand()*Math.PI*2, r=Math.sqrt(rand());
      const x=cx+Math.cos(a)*r*rx, y=cy+Math.sin(a)*r*ry;
      make('ellipse',{
        cx:x,cy:y,rx:between(1.5,5),ry:between(1,2.8),
        fill:['#63784c','#859259','#a0a56a','#4f6d49','#b0b279'][i%5]
      },parent);
      if(i%4===0) make('path',{
        d:`M${x} ${y}l${between(-2,2)} -3`,
        fill:'none',stroke:'#b0b77d','stroke-width':'.6'
      },parent);
    }
  }
  moss(278,587,43,8,65,soil);
  moss(406,589,40,8,54,soil);
  moss(312,601,22,4,30,front);
  moss(389,601,17,4,22,front);

  make('path',{d:'M435 591L441 581Q447 576 455 583L462 592Q451 598 435 591Z',fill:'#82928a'},soil);
  make('path',{d:'M441 581L446 589 455 583',fill:'none',stroke:'#bdc3af','stroke-width':'1'},soil);

  for(let i=0;i<95;i++) make('circle',{
    cx:between(193,508),cy:between(613,691),r:between(.3,.9),
    fill:i%3?'#acc0a5':'#d4cc9e',opacity:between(.12,.32)
  },specks);

  const movers=[];
  function samples(data) {
    const out=[];
    let x=data[0], y=data[1];
    for(let k=2;k<data.length;k+=6){
      const x1=data[k],y1=data[k+1],x2=data[k+2],y2=data[k+3],ex=data[k+4],ey=data[k+5];
      for(let j=0;j<=28;j++){
        if(k>2 && j===0) continue;
        const t=j/28,u=1-t;
        out.push({
          x:u*u*u*x+3*u*u*t*x1+3*u*t*t*x2+t*t*t*ex,
          y:u*u*u*y+3*u*u*t*y1+3*u*t*t*y2+t*t*t*ey
        });
      }
      x=ex;y=ey;
    }
    return out;
  }
  function limb(parent,data,width) {
    const p=samples(data), left=[],right=[];
    p.forEach((v,i)=>{
      const a=p[Math.max(0,i-1)], b=p[Math.min(p.length-1,i+1)];
      const len=Math.hypot(b.x-a.x,b.y-a.y)||1;
      v.nx=-(b.y-a.y)/len;v.ny=(b.x-a.x)/len;
      v.w=width*.5*(.045+.955*Math.pow(1-i/(p.length-1),.82));
      left.push(`${(v.x+v.nx*v.w).toFixed(2)},${(v.y+v.ny*v.w).toFixed(2)}`);
      right.push(`${(v.x-v.nx*v.w).toFixed(2)},${(v.y-v.ny*v.w).toFixed(2)}`);
    });
    make('path',{d:'M'+left.join('L')+'L'+right.reverse().join('L')+'Z',fill:'url(#bark)'},parent);
    for(let j=0;j<3;j++){
      const off=(j-1)*.46;
      const d=p.map((v,i)=>(i?'L':'M')+(v.x+v.nx*v.w*off).toFixed(2)+','+(v.y+v.ny*v.w*off).toFixed(2)).join('');
      make('path',{d,fill:'none',stroke:j===1?'#d3bd91':'#555744','stroke-width':j===1?.8:.65,opacity:.55},parent);
    }
  }

  function tuft(parent,c) {
    const [cx,cy,rx,ry,n,ax,ay]=c;
    const g=make('g',{},parent);
    movers.push({e:g,x:ax,y:ay,a:between(.35,.9),p:between(0,7),speed:between(.7,1.2)});
    for(let i=0;i<7;i++){
      const x=cx+(i/6-.5)*rx*1.65, y=cy+between(-ry*.45,ry*.5);
      make('path',{
        d:`M${ax} ${ay}Q${cx} ${ay-8} ${x} ${y}`,
        fill:'none',stroke:i%2?'#807a56':'#65745a',
        'stroke-width':between(.6,1.1),'stroke-linecap':'round',opacity:.82
      },g);
    }
    const leaves=[];
    for(let i=0;i<n;i++){
      const angle=rand()*Math.PI*2, r=Math.sqrt(rand());
      leaves.push({
        x:cx+Math.cos(angle)*r*rx,
        y:cy+Math.sin(angle)*r*ry,
        s:between(.59,.95),
        rot:Math.cos(angle)*r*43+between(-30,30),
        color:rand()
      });
    }
    leaves.sort((a,b)=>a.y-b.y);
    for(const l of leaves){
      let shade=l.color<.11?3:l.color<.30?2:l.color<.56?0:l.color<.79?1:4;
      make('use',{
        href:'#fan',
        transform:`translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.rot.toFixed(2)}) scale(${l.s.toFixed(3)})`,
        fill:`url(#leaf${shade})`
      },g);
    }
  }

  const configs=[
    {
      d:[330,473,296,441,267,429,236,431,201,433,164,438,126,410],w:18,
      c:[[116,402,37,18,25,140,421],[179,416,39,19,28,195,432],[242,411,38,19,28,254,433]]
    },
    {
      d:[356,412,397,414,413,390,444,378,477,363,505,374,541,345],w:15,
      c:[[441,365,37,19,25,440,381],[500,351,37,18,25,501,371],[551,333,35,18,24,533,352]]
    },
    {
      d:[329,331,284,330,264,300,239,286,211,271,190,285,165,268],w:16,
      c:[[146,258,41,22,30,174,276],[211,276,39,19,27,226,285],[274,300,32,17,23,280,315]]
    },
    {
      d:[338,303,379,293,418,277,448,250,479,224,520,235,555,210],w:16,
      c:[[429,247,37,20,28,444,258],[494,223,40,21,30,501,234],[564,202,40,22,32,545,220]]
    },
    {
      d:[355,226,336,211,308,196,306,173,304,148,326,135,336,118],w:11,
      c:[[301,154,37,21,28,310,174],[336,112,40,20,30,334,135]]
    },
    {
      d:[362,197,391,187,408,161,435,148,459,136,480,151,494,128],w:10,
      c:[[423,141,34,17,25,433,151],[482,125,36,19,27,482,142]]
    },
    {
      d:[358,176,361,145,351,123,360,103,366,89,377,88,382,86],w:7,
      c:[[372,85,32,17,28,363,111]]
    }
  ];

  const boughs=document.getElementById('boughs');
  configs.forEach((b,i)=>{
    const g=make('g',{},boughs);
    movers.push({e:g,x:b.d[0],y:b.d[1],a:i<2?.38:.6,p:i*.87,speed:.6+i*.045});
    limb(g,b.d,b.w);
    b.c.forEach(c=>{
      limb(g,[c[5],c[6],c[5]-3,c[6]-7,c[0]+3,c[1]+12,c[0],c[1]+2],2.4);
      tuft(g,c);
    });
  });

  const tree=document.getElementById('livingTree');
  let previous=-1;
  function animate(ms){
    requestAnimationFrame(animate);
    if(ms-previous<32) return;
    previous=ms;
    const t=ms*.001;
    const gust=Math.sin(t*.67)*.55+Math.sin(t*1.13+.8)*.24;
    tree.setAttribute('transform',`rotate(${(.14*gust).toFixed(3)} 349 590)`);
    for(const m of movers){
      const a=m.a*(Math.sin(t*m.speed+m.p)*.55+gust*.55+Math.sin(t*2.1+m.p)*.1);
      m.e.setAttribute('transform',`rotate(${a.toFixed(3)} ${m.x} ${m.y})`);
    }
  }
  requestAnimationFrame(animate);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Copper Lace Ginkgo",
  "statement": "An old, questioning trunk holds a gathering of little green fans, each threaded with copper light. Branching seams in the mended porcelain carry the tree’s patient complexity into its pot."
}
```