```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#07191d}
canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
<canvas aria-label="A luminous, pleated mushroom growing from a dark seed, releasing tiny folded moons."></canvas>
<script>
(()=>{
'use strict';
const canvas=document.querySelector('canvas');
const ctx=canvas.getContext('2d');
const specimen=document.createElement('canvas');
const ground=document.createElement('canvas');
let W,H,D,S,X,Y,art,earth;
const TAU=Math.PI*2;
let seed=71931;
function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function path(c,points){c.beginPath();points(c)}
function stroke(c,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function glow(c,x,y,r,color){
 const g=c.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
}
function makeLayer(el,k){
 el.width=Math.ceil(600*k);el.height=Math.ceil(800*k);
 const c=el.getContext('2d');c.setTransform(k,0,0,k,0,0);
 c.lineCap='round';c.lineJoin='round';return c;
}
function build(k){
 seed=71931;
 earth=makeLayer(ground,k);
 art=makeLayer(specimen,k);
 const e=earth,c=art;
 glow(e,302,660,221,'rgba(38,112,105,.14)');
 e.save();e.translate(300,704);e.scale(1,.20);
 glow(e,0,0,254,'rgba(0,0,0,.85)');e.restore();

 // A scattered root system, each branch finding a different route.
 for(let i=0;i<56;i++){
  let a=random()*TAU,reach=45+random()*190;
  let x=300+Math.cos(a)*reach,y=685+Math.sin(a)*reach*.25;
  e.beginPath();e.moveTo(299,673);
  e.bezierCurveTo(300+Math.cos(a)*40,690,x-25, y-15,x,y);
  stroke(e,`rgba(${i%3? '119,171,141':'226,189,118'},${.08+random()*.23})`,.4+random()*1.2);
  for(let j=0;j<3;j++){
   let q=.45+j*.17;
   let bx=300+(x-300)*q,by=678+(y-678)*q;
   e.beginPath();e.moveTo(bx,by);
   e.quadraticCurveTo(bx+12,by-7,bx+(random()-.5)*48,by-8-random()*12);
   stroke(e,'rgba(150,190,154,.15)',.6);
  }
 }
 for(let i=0;i<140;i++){
  let a=random()*TAU,r=Math.sqrt(random());
  let x=300+Math.cos(a)*220*r,y=693+Math.sin(a)*49*r;
  e.fillStyle=`rgba(114,152,129,${random()*.27})`;
  e.beginPath();e.ellipse(x,y,.5+random()*2,.4+random(),0,0,TAU);e.fill();
 }
 // The substrate resembles an opened, mineral-black seed.
 let g=e.createLinearGradient(230,636,354,719);
 g.addColorStop(0,'#435b57');g.addColorStop(.35,'#223c3b');
 g.addColorStop(.7,'#102629');g.addColorStop(1,'#071719');
 e.fillStyle=g;
 e.beginPath();e.moveTo(223,681);
 e.bezierCurveTo(218,651,255,628,292,636);
 e.bezierCurveTo(323,618,371,651,381,680);
 e.bezierCurveTo(366,718,254,733,223,681);e.fill();
 for(let i=0;i<85;i++){
  let x=237+random()*126,y=648+random()*57;
  if(((x-299)/72)**2+((y-678)/35)**2>1)continue;
  e.beginPath();e.moveTo(x,y);e.lineTo(x+random()*12-6,y+random()*7);
  stroke(e,random()>.5?'rgba(150,181,157,.12)':'rgba(0,7,12,.24)',.6);
 }
 e.beginPath();e.moveTo(252,699);e.lineTo(279,682);e.lineTo(277,666);
 e.lineTo(304,652);e.lineTo(318,639);
 stroke(e,'#a6bd8d',1.3);
 e.beginPath();e.moveTo(279,682);e.lineTo(308,689);e.lineTo(333,680);
 stroke(e,'rgba(230,208,141,.56)',.8);
 glow(e,293,669,43,'rgba(161,219,155,.19)');

 // A twisting, translucent stalk.
 g=c.createLinearGradient(264,0,336,0);
 g.addColorStop(0,'#214d4c');g.addColorStop(.24,'#598d7a');
 g.addColorStop(.48,'#d5d9aa');g.addColorStop(.6,'#86bca0');
 g.addColorStop(.82,'#295d58');g.addColorStop(1,'#102f36');
 c.fillStyle=g;
 c.beginPath();c.moveTo(277,677);
 c.bezierCurveTo(331,597,261,510,283,418);
 c.quadraticCurveTo(289,388,282,363);
 c.lineTo(325,360);
 c.bezierCurveTo(308,422,313,464,314,500);
 c.bezierCurveTo(320,575,338,630,315,675);
 c.quadraticCurveTo(298,686,277,677);c.fill();
 for(let i=0;i<18;i++){
  let p=i/17;
  c.beginPath();c.moveTo(282+p*30,674);
  c.bezierCurveTo(324+p*5,602,267+p*48,503,289+p*27,370);
  stroke(c,`rgba(218,240,182,${.05+.16*Math.sin(p*Math.PI)})`,.5+random());
 }
 for(let i=0;i<8;i++){
  let y=455+i*26;
  c.beginPath();c.moveTo(288,y);
  c.bezierCurveTo(326,y+7,323,y+27,301,y+35);
  stroke(c,'rgba(9,47,48,.22)',2);
  c.beginPath();c.moveTo(289,y-1);
  c.bezierCurveTo(326,y+6,323,y+26,301,y+34);
  stroke(c,'rgba(219,232,178,.24)',.8);
 }

 // The underside: a vault of individually folded lamellae.
 const hub={x:303,y:356};
 c.beginPath();c.moveTo(79,356);
 c.bezierCurveTo(176,325,426,323,521,356);
 c.bezierCurveTo(453,446,167,454,79,356);
 g=c.createLinearGradient(0,340,0,439);
 g.addColorStop(0,'#0b3239');g.addColorStop(.55,'#386e68');
 g.addColorStop(1,'#bfcb9b');c.fillStyle=g;c.fill();
 for(let i=0;i<72;i++){
  const a=i/72*Math.PI,b=(i+1)/72*Math.PI;
  const x=300+220*Math.cos(a),y=355+73*Math.sin(a);
  const xx=300+220*Math.cos(b),yy=355+73*Math.sin(b);
  c.beginPath();c.moveTo(hub.x,hub.y);
  c.bezierCurveTo(303+(x-303)*.25,380,303+(x-303)*.67,y+13,x,y);
  c.lineTo(xx,yy);
  c.bezierCurveTo(303+(xx-303)*.67,yy+7,303+(xx-303)*.25,370,hub.x,hub.y);
  g=c.createLinearGradient(300,353,x,y);
  g.addColorStop(0,'#133d40');
  g.addColorStop(.56,i%2?'#528f7e':'#a9c8a0');
  g.addColorStop(1,i%3?'#e1dbad':'#89bfa4');
  c.fillStyle=g;c.fill();
  c.beginPath();c.moveTo(hub.x,hub.y);
  c.bezierCurveTo(303+(x-303)*.25,380,303+(x-303)*.67,y+13,x,y);
  stroke(c,'rgba(236,241,191,.50)',.7);
 }

 // The cap has the texture of folded vellum and the translucency of sea glass.
 function cap(){
  c.beginPath();c.moveTo(79,356);
  c.bezierCurveTo(114,325,139,276,200,244);
  c.bezierCurveTo(239,222,268,206,301,207);
  c.bezierCurveTo(351,199,393,240,431,269);
  c.bezierCurveTo(475,302,488,333,521,356);
  c.bezierCurveTo(456,375,424,350,383,365);
  c.bezierCurveTo(340,381,317,357,279,369);
  c.bezierCurveTo(227,382,212,358,173,367);
  c.bezierCurveTo(132,377,106,366,79,356);c.closePath();
 }
 cap();
 g=c.createLinearGradient(125,242,468,380);
 g.addColorStop(0,'#204d57');g.addColorStop(.24,'#568e8a');
 g.addColorStop(.48,'#b4d4b9');g.addColorStop(.65,'#e5dab0');
 g.addColorStop(.82,'#bd9b80');g.addColorStop(1,'#518d88');
 c.fillStyle=g;c.fill();
 c.save();cap();c.clip();
 for(let i=0;i<57;i++){
  let t=(i/56)*2-1,x=300+t*231;
  c.beginPath();c.moveTo(303+t*5,204);
  c.bezierCurveTo(304+t*62,240,x-t*33,292,x,376);
  stroke(c,i%3===0?'rgba(247,240,195,.58)':'rgba(14,70,74,.26)',i%3===0?1.5:3.2);
  c.beginPath();c.moveTo(305+t*5,204);
  c.bezierCurveTo(307+t*62,240,x-t*33+3,292,x+3,376);
  stroke(c,'rgba(244,245,211,.23)',.7);
 }
 glow(c,309,255,111,'rgba(236,248,203,.22)');
 for(let i=0;i<140;i++){
  let x=100+random()*410,y=220+random()*154;
  c.fillStyle=`rgba(244,244,210,${random()*.35})`;
  c.beginPath();c.arc(x,y,.35+random()*.65,0,TAU);c.fill();
 }
 c.restore();
 cap();stroke(c,'rgba(222,233,187,.61)',1.25);

 // Loose sheets curl away from the rim without ever falling.
 for(let side of [-1,1]){
  for(let i=0;i<4;i++){
   let x=300+side*(128+i*23),y=365-i*1.5;
   c.beginPath();c.moveTo(x,y);
   c.bezierCurveTo(x+side*19,y+20,x+side*25,y+37-i*4,x+side*9,y+42-i*4);
   c.bezierCurveTo(x+side*30,y+39-i*4,x+side*30,y+17,x+side*6,y-2);
   g=c.createLinearGradient(x,y,x,y+44);
   g.addColorStop(0,'#b7caa7');g.addColorStop(1,'#52857e');
   c.fillStyle=g;c.fill();stroke(c,'rgba(231,229,181,.65)',.65);
  }
 }
 // Small luminous seams continue down into the seed.
 for(let i=0;i<26;i++){
  let y=430+random()*242,x=299+Math.sin(y*.028)*9+(random()-.5)*13;
  glow(c,x,y,2.7,'rgba(214,242,168,.5)');
 }
}
const dust=Array.from({length:38},()=>({
 x:random()*600,y:random()*800,r:.35+random()*1.15,
 v:4+random()*9,p:random()*TAU
}));
const spores=Array.from({length:17},(_,i)=>({
 phase:i/17,side:random()*2-1,drift:random()*TAU,
 size:3.5+random()*5.5
}));
function resize(){
 W=innerWidth;H=innerHeight;D=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);
 S=Math.min(W/600,H/800);X=(W-600*S)/2;Y=(H-800*S)/2;
 build(Math.min(S*D,2.5));
}
addEventListener('resize',resize,{passive:true});resize();
function frame(ms){
 const t=ms*.001;
 ctx.setTransform(D,0,0,D,0,0);
 ctx.fillStyle='#07191d';ctx.fillRect(0,0,W,H);
 const bg=ctx.createRadialGradient(W*.5,H*.39,0,W*.5,H*.43,Math.max(W,H)*.7);
 bg.addColorStop(0,'#173638');bg.addColorStop(.46,'#0c252a');bg.addColorStop(1,'#040e15');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 ctx.translate(X,Y);ctx.scale(S,S);
 glow(ctx,305,330,230,`rgba(101,166,132,${.035+.009*Math.sin(t*.7)})`);
 for(const p of dust){
  let y=((p.y-t*p.v)%800+800)%800;
  let x=p.x+Math.sin(t*.17+p.p)*13;
  ctx.globalAlpha=.12+.15*(.5+.5*Math.sin(t*.6+p.p));
  ctx.fillStyle='#b4d9c5';ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;
 ctx.drawImage(ground,0,0,600,800);
 ctx.save();
 ctx.translate(300,676);ctx.rotate(Math.sin(t*.36)*.004);
 ctx.scale(1+Math.sin(t*.62)*.002,1+Math.sin(t*.62)*.003);
 ctx.translate(-300,-676);
 ctx.drawImage(specimen,0,0,600,800);
 ctx.restore();

 // Each spore is a tiny folded crescent, not a point of light.
 for(const p of spores){
  let q=(p.phase+t*.021)%1;
  let y=327-q*274;
  let x=300+p.side*(55+q*145)+Math.sin(q*8+p.drift+t*.24)*(9+q*19);
  let alpha=Math.sin(q*Math.PI)*.8;
  ctx.save();ctx.translate(x,y);
  glow(ctx,0,0,p.size*4,`rgba(157,221,180,${alpha*.16})`);
  ctx.rotate(Math.sin(t*.53+p.drift)*.8+p.side*.5);
  let r=p.size*(.7+.3*Math.sin(t*.5+p.drift)**2);
  ctx.globalAlpha=alpha;
  ctx.beginPath();ctx.moveTo(0,-r);
  ctx.bezierCurveTo(r*.95,-r*.4,r*.8,r*.75,0,r*1.3);
  ctx.quadraticCurveTo(r*.26,0,0,-r);
  ctx.fillStyle='#dfdfb1';ctx.fill();
  ctx.beginPath();ctx.moveTo(0,-r);
  ctx.quadraticCurveTo(-r*.9,0,0,r*1.3);
  ctx.quadraticCurveTo(-r*.22,0,0,-r);
  ctx.fillStyle='#77b9aa';ctx.fill();
  ctx.beginPath();ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*.1,0,0,r*1.3);
  stroke(ctx,'#f3edc5',.55);
  ctx.restore();
 }
 ctx.globalAlpha=1;
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
  "title": "Moonfold Parasol",
  "statement": "Its translucent cap gathers moonlight into pleats, then releases the surplus as tiny folded crescents. Beneath the mineral seed, inquisitive threads follow every possible path through the dark."
}
```