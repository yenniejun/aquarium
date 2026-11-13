```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #062b37; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<canvas aria-label="A luminous, frill-finned sea creature gently cradles a golden pebble in a quiet underwater garden."></canvas>
<script>
(() => {
  'use strict';
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const background = document.createElement('canvas');
  const bg = background.getContext('2d');
  const TAU = Math.PI * 2;
  let width, height, scale, ox, oy, dpr;
  let pointer = { x: 450, y: 310, active: false };
  let seed = 8173;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const particles = Array.from({length: 66}, () => ({
    x: random() * 960 - 30, y: random() * 740,
    r: .45 + random() * 1.5, speed: 2 + random() * 6,
    phase: random() * TAU, a: .1 + random() * .32
  }));
  const pebbles = Array.from({length: 86}, () => ({
    x: random() * 1000 - 50, y: 530 + random() * 160,
    r: 1.5 + random() * 7, flat: .35 + random() * .4,
    color: random(), angle: random() * .6
  }));
  const freckles = Array.from({length: 46}, () => {
    const a = random() * TAU, r = Math.sqrt(random());
    return { x: Math.cos(a) * r * 58, y: -34 + Math.sin(a) * r * 52,
      r: .7 + random() * 1.7, a: random() * TAU };
  });

  function ellipse(c, x, y, rx, ry, color, rotation = 0) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, rotation, 0, TAU);
    c.fillStyle = color;
    c.fill();
  }
  function line(c, color, size) {
    c.strokeStyle = color; c.lineWidth = size;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  }
  function glow(c, x, y, r, inner, outer) {
    const g = c.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,inner); g.addColorStop(1,outer);
    c.fillStyle = g; c.fillRect(x-r,y-r,r*2,r*2);
  }

  function buildBackground() {
    background.width = Math.round(900 * Math.min(dpr, 1.5));
    background.height = Math.round(675 * Math.min(dpr, 1.5));
    bg.setTransform(background.width/900,0,0,background.height/675,0,0);
    let g = bg.createLinearGradient(0,0,720,675);
    g.addColorStop(0,'#246d74');
    g.addColorStop(.35,'#0b424f');
    g.addColorStop(.75,'#082c3d');
    g.addColorStop(1,'#102e3a');
    bg.fillStyle = g; bg.fillRect(0,0,900,675);

    glow(bg,340,25,490,'rgba(107,212,184,.19)','rgba(30,95,105,0)');
    glow(bg,710,330,290,'rgba(35,98,123,.17)','rgba(15,50,70,0)');
    for (let i=0; i<7; i++) {
      const x=85+i*72;
      const ray=bg.createLinearGradient(x,0,x+90,560);
      ray.addColorStop(0,'rgba(175,232,201,.065)');
      ray.addColorStop(1,'rgba(108,214,194,0)');
      bg.fillStyle=ray;
      bg.beginPath(); bg.moveTo(x,0); bg.lineTo(x+24,0);
      bg.lineTo(x+225,590); bg.lineTo(x+73,590); bg.fill();
    }

    // Distant, soft mineral shelves.
    bg.fillStyle='#103c47';
    bg.beginPath(); bg.moveTo(0,470);
    bg.bezierCurveTo(110,452,165,495,277,475);
    bg.bezierCurveTo(440,446,496,493,650,464);
    bg.bezierCurveTo(795,438,850,458,900,449);
    bg.lineTo(900,675); bg.lineTo(0,675); bg.fill();

    g=bg.createLinearGradient(0,500,0,700);
    g.addColorStop(0,'#315354'); g.addColorStop(.32,'#5c7065');
    g.addColorStop(1,'#a2977b');
    bg.fillStyle=g;
    bg.beginPath(); bg.moveTo(0,547);
    bg.bezierCurveTo(190,484,296,540,453,527);
    bg.bezierCurveTo(661,505,759,502,900,528);
    bg.lineTo(900,675); bg.lineTo(0,675); bg.fill();

    for(let i=0;i<21;i++){
      const y=536+i*8;
      bg.beginPath(); bg.moveTo(-30,y);
      bg.bezierCurveTo(205,y-29,270,y+23,460,y+3);
      bg.bezierCurveTo(670,y-19,791,y-9,940,y+12);
      line(bg,i%3===0?'rgba(220,215,166,.15)':'rgba(15,48,49,.12)',.7);
    }
    seed=925;
    for(let i=0;i<4200;i++){
      const x=random()*900,y=520+random()*155;
      bg.fillStyle=random()>.5?'rgba(230,220,173,.13)':'rgba(5,37,43,.13)';
      bg.fillRect(x,y,.5+random()*1.1,.5+random()*.7);
    }
    pebbles.forEach(p=>{
      ellipse(bg,p.x+2,p.y+2,p.r*1.35,p.r*p.flat,'rgba(6,31,36,.25)');
      const pg=bg.createLinearGradient(p.x,p.y-p.r,p.x,p.y+p.r);
      pg.addColorStop(0,p.color>.5?'#a2aba0':'#738c85');
      pg.addColorStop(1,'#38575a');
      ellipse(bg,p.x,p.y,p.r,p.r*p.flat,pg,p.angle);
    });

    // A low, water-worn stone, not an inhabited shell.
    g=bg.createLinearGradient(580,510,590,587);
    g.addColorStop(0,'#66847c');g.addColorStop(.4,'#3c6464');g.addColorStop(1,'#26494e');
    bg.beginPath();bg.moveTo(531,570);
    bg.bezierCurveTo(522,547,551,507,598,510);
    bg.bezierCurveTo(647,509,672,538,683,565);
    bg.bezierCurveTo(642,580,571,587,531,570); bg.fillStyle=g;bg.fill();
    for(let i=0;i<5;i++){
      bg.beginPath();bg.moveTo(551+i*7,548+i*5);
      bg.bezierCurveTo(580,521+i*6,625,526+i*7,655+i*3,551+i*5);
      line(bg,'rgba(157,183,155,.17)',1);
    }

    const vignette=bg.createRadialGradient(450,300,230,450,330,610);
    vignette.addColorStop(0,'rgba(0,15,28,0)');
    vignette.addColorStop(1,'rgba(0,13,27,.58)');
    bg.fillStyle=vignette;bg.fillRect(0,0,900,675);
  }

  function resize(){
    width=innerWidth; height=innerHeight; dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    scale=Math.max(width/900,height/675);
    ox=(width-900*scale)/2;oy=(height-675*scale)/2;
    buildBackground();
  }
  addEventListener('resize',resize);
  addEventListener('pointermove',e=>{
    pointer.x=(e.clientX-ox)/scale;pointer.y=(e.clientY-oy)/scale;
    pointer.active=true;
  },{passive:true});
  addEventListener('pointerout',()=>pointer.active=false,{passive:true});

  function ribbon(x,y,h,w,lean,t,color,highlight,phase){
    const bend=lean+Math.sin(t*.55+phase)*h*.075;
    ctx.beginPath();ctx.moveTo(x-w*.28,y);
    ctx.bezierCurveTo(x-w*.6,y-h*.3,x+bend-w*.6,y-h*.76,x+bend,y-h);
    ctx.bezierCurveTo(x+bend+w*.15,y-h*.62,x+w*.8,y-h*.22,x+w*.28,y);
    ctx.closePath();ctx.fillStyle=color;ctx.fill();
    ctx.beginPath();ctx.moveTo(x,y);
    ctx.bezierCurveTo(x+w*.1,y-h*.3,x+bend-w*.25,y-h*.75,x+bend,y-h);
    line(ctx,highlight,.9);
  }
  function garden(t,front){
    if(!front){
      for(let i=0;i<11;i++){
        ribbon(52+i*11,564+Math.sin(i)*8,130+(i%4)*38,12+i%3*6,
          -53+i*9,t,'#154f57','rgba(97,175,153,.27)',i*1.5);
      }
      for(let i=0;i<12;i++){
        ribbon(760+i*10,561+Math.cos(i)*13,118+(i%5)*36,13+i%3*5,
          -46+i*8,t,'#16464e','rgba(85,157,142,.28)',i*.8);
      }
    } else {
      for(let i=0;i<7;i++)
        ribbon(-8+i*19,704,120+(i%4)*33,19,-42+i*13,t,'#0a353e','rgba(74,139,126,.25)',i);
      for(let i=0;i<7;i++)
        ribbon(818+i*19,710,106+(i%4)*31,22,-39+i*9,t,'#092f3a','rgba(65,131,124,.2)',i+3);
    }
  }

  function fin(side,t){
    ctx.save();ctx.scale(side,1);
    const flap=Math.sin(t*1.65)*10;
    const pts=[];
    for(let i=0;i<=60;i++){
      const a=i/60*Math.PI;
      const x=48+Math.sin(a)*(108+6*Math.sin(a*7+t*2));
      const y=-57+i/60*143+Math.sin(a*8-t*2.2)*4+Math.sin(a)*flap;
      pts.push([x,y]);
    }
    const g=ctx.createLinearGradient(46,0,172,10);
    g.addColorStop(0,'rgba(70,173,165,.85)');
    g.addColorStop(.48,'rgba(129,205,181,.65)');
    g.addColorStop(.82,'rgba(239,181,153,.74)');
    g.addColorStop(1,'rgba(251,208,167,.85)');
    ctx.beginPath();ctx.moveTo(44,-55);
    pts.forEach(p=>ctx.lineTo(...p));ctx.quadraticCurveTo(34,64,44,-55);
    ctx.fillStyle=g;ctx.fill();
    for(let i=3;i<58;i+=4){
      const p=pts[i];
      ctx.beginPath();ctx.moveTo(49,-48+i*2.12);
      ctx.quadraticCurveTo(96,p[1]-9,p[0],p[1]);
      line(ctx,'rgba(239,235,191,.24)',.8);
    }
    ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));
    line(ctx,'rgba(255,217,184,.83)',1.5);
    ctx.beginPath();pts.slice(4,-4).forEach((p,i)=>i?ctx.lineTo(p[0]-4,p[1]):ctx.moveTo(p[0]-4,p[1]));
    line(ctx,'rgba(132,244,213,.48)',1);
    ctx.restore();
  }

  function arm(path,thick,back){
    ctx.beginPath();ctx.moveTo(path[0],path[1]);
    ctx.bezierCurveTo(...path.slice(2,8));
    ctx.bezierCurveTo(...path.slice(8,14));
    line(ctx,back?'#387d7e':'#70b6a3',thick+3);
    line(ctx,back?'#62a291':'#bad3b2',thick);
    ctx.beginPath();ctx.moveTo(path[0]-2,path[1]);
    ctx.bezierCurveTo(...path.slice(2,8));ctx.bezierCurveTo(...path.slice(8,14));
    line(ctx,back?'rgba(185,220,175,.25)':'rgba(247,227,184,.55)',2);
  }

  function creature(t){
    const x=449+Math.sin(t*.29)*38;
    const y=306+Math.sin(t*.67)*12+Math.sin(t*.24)*8;
    const tilt=Math.sin(t*.39)*.045;
    ctx.save();ctx.translate(x,y);ctx.rotate(tilt);

    glow(ctx,0,12,184,'rgba(92,221,183,.065)','rgba(50,180,170,0)');
    const wig=Math.sin(t*1.5)*8;
    arm([-42,54,-91,100,-55,154,-91,149,-112,147,-108,120,-96,128],13,true);
    arm([35,57,88,97,60,151,93,143,112,135,105,119,98,127],12,true);
    arm([-12,67,-33,117,-19,146,-39,162,-54,174,-64,160,-51,157],14,true);
    arm([16,67,48,119,30,163,53,160,71,155,65,139,57,145],13,true);

    fin(-1,t);fin(1,t+.35);

    const body=ctx.createLinearGradient(-60,-80,64,87);
    body.addColorStop(0,'#b8dec2');
    body.addColorStop(.22,'#7dc3ac');
    body.addColorStop(.57,'#479b94');
    body.addColorStop(.82,'#75af9c');
    body.addColorStop(1,'#ecd7b1');
    ctx.beginPath();ctx.moveTo(0,-102);
    ctx.bezierCurveTo(-60,-103,-83,-45,-73,11);
    ctx.bezierCurveTo(-70,57,-46,83,0,85);
    ctx.bezierCurveTo(49,85,71,54,74,7);
    ctx.bezierCurveTo(79,-51,55,-103,0,-102);
    ctx.fillStyle=body;ctx.fill();
    line(ctx,'rgba(197,240,207,.48)',1.1);

    ctx.save();
    ctx.beginPath();ctx.ellipse(-14,-41,43,54,-.3,0,TAU);ctx.clip();
    glow(ctx,-28,-66,76,'rgba(222,251,215,.37)','rgba(149,222,194,0)');
    ctx.restore();

    // A branching pattern beneath the translucent mantle.
    for(let s of [-1,1]){
      for(let i=0;i<5;i++){
        ctx.beginPath();ctx.moveTo(s*7,-80+i*12);
        ctx.quadraticCurveTo(s*(29+i*4),-80+i*13,s*(40+i*4),-55+i*15);
        line(ctx,'rgba(211,242,192,.13)',1);
      }
    }
    freckles.forEach(p=>{
      const alpha=.25+.15*Math.sin(t*.8+p.a);
      ellipse(ctx,p.x,p.y,p.r,p.r*.7,`rgba(232,236,173,${alpha})`);
    });
    for(let s of [-1,1]){
      // Warm cheeks and glossy, unhurried eyes.
      glow(ctx,s*46,43,23,'rgba(240,178,142,.38)','rgba(224,160,138,0)');
      ctx.save();ctx.translate(s*30,24);ctx.rotate(s*-.08);
      ellipse(ctx,0,2,20,23,'rgba(17,80,78,.36)');
      ellipse(ctx,0,0,17.5,21,'#bfd8ae');
      ellipse(ctx,0,1,14.5,18,'#173e43');
      let gx=pointer.active?Math.max(-3,Math.min(3,(pointer.x-x)*.013)):Math.sin(t*.43)*1.7;
      let gy=pointer.active?Math.max(-2,Math.min(3,(pointer.y-y)*.012)):1.8;
      ellipse(ctx,gx,gy,10.5,14.7,'#082b36');
      ctx.beginPath();ctx.ellipse(0,1,14.2,17.5,0,.1,2.8);
      line(ctx,'#bbbc7c',1.1);
      ellipse(ctx,-4+gx*.3,-6+gy*.3,4.2,5.2,'rgba(236,255,233,.92)',.25);
      ellipse(ctx,5,6,1.6,1.9,'rgba(134,218,203,.65)');
      ctx.restore();
    }
    // Small resting mouth.
    ctx.beginPath();ctx.moveTo(-6,56);ctx.quadraticCurveTo(0,60,6,56);
    line(ctx,'rgba(28,87,83,.65)',1.7);

    const stoneY=109+Math.sin(t*1.5)*2;
    glow(ctx,0,stoneY,67,'rgba(255,191,91,.23)','rgba(255,170,58,0)');
    let gem=ctx.createRadialGradient(-5,stoneY-6,1,0,stoneY,19);
    gem.addColorStop(0,'#fff6c3');gem.addColorStop(.45,'#f5d384');
    gem.addColorStop(1,'#b97a42');
    ellipse(ctx,0,stoneY,17,15,gem,-.24);
    ctx.beginPath();ctx.moveTo(-9,stoneY-5);ctx.quadraticCurveTo(-4,stoneY-12,3,stoneY-10);
    line(ctx,'rgba(255,255,222,.8)',1.8);

    arm([-48,64,-68,97,-39,127,-13,121,-2,119,-8,108,-14,113],16,false);
    arm([47,64,65,94,37,130,12,122,1,119,9,108,15,114],16,false);
    for(let s of [-1,1]){
      for(let i=0;i<4;i++){
        ellipse(ctx,s*(39-i*5),111+i*2,2.6,1.8,'rgba(250,221,179,.78)',s*.5);
      }
    }
    ctx.restore();
    return {x,y};
  }

  function render(ms){
    const t=ms*.001;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);
    ctx.translate(ox,oy);ctx.scale(scale,scale);
    ctx.drawImage(background,0,0,900,675);

    // The surface light slowly changes, like passing ripples.
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<4;i++){
      const x=150+i*110+Math.sin(t*.18+i)*35;
      const g=ctx.createLinearGradient(x,0,x+70,520);
      g.addColorStop(0,'rgba(123,203,174,.035)');
      g.addColorStop(1,'rgba(123,203,174,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+18,0);
      ctx.lineTo(x+190,560);ctx.lineTo(x+65,560);ctx.fill();
    }
    ctx.restore();
    garden(t,false);

    // The creature's soft shadow follows it across the sand.
    const sx=449+Math.sin(t*.29)*38;
    ctx.save();ctx.translate(sx,554);ctx.scale(1,.21);
    glow(ctx,0,0,111,'rgba(4,29,35,.34)','rgba(4,29,35,0)');
    ctx.restore();
    glow(ctx,sx,541,81,'rgba(236,193,100,.06)','rgba(236,193,100,0)');

    particles.forEach((p,i)=>{
      if(i%3===0)return;
      const yy=((p.y-t*p.speed)%730+730)%730-25;
      ellipse(ctx,p.x+Math.sin(t*.25+p.phase)*10,yy,p.r,p.r,
        `rgba(176,226,204,${p.a*.48})`);
    });
    creature(t);

    // Faint moving caustics on the sandy floor.
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<6;i++){
      const x=170+i*104+Math.sin(t*.31+i)*18;
      const y=584+Math.sin(i*2)*31;
      ctx.beginPath();ctx.ellipse(x,y,24+Math.sin(t*.4+i)*9,3.2,-.12,0,Math.PI*1.6);
      line(ctx,'rgba(145,199,162,.065)',1.5);
    }
    ctx.restore();
    garden(t,true);
    particles.forEach((p,i)=>{
      if(i%3!==0)return;
      const yy=((p.y-t*p.speed*.8)%730+730)%730-25;
      ellipse(ctx,p.x+Math.sin(t*.2+p.phase)*13,yy,p.r,p.r,
        `rgba(212,236,204,${p.a*.65})`);
    });
    requestAnimationFrame(render);
  }
  resize();
  requestAnimationFrame(render);
})();
</script>
</body>
</html>
```

```json
{
  "title": "Whispering Wobblefin",
  "statement": "A gentle collector of small wonders, the Whispering Wobblefin cradles a sun-colored pebble while its pleated fins turn passing currents into quiet little dances. It has nowhere urgent to be."
}
```