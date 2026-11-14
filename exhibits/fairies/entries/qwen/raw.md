```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Fairy of Unspoken Words</title>
<style>
  html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#05040f}
  canvas{display:block;position:fixed;inset:0}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
"use strict";
var cv=document.getElementById('c'),ctx=cv.getContext('2d');
var W=0,H=0,DPR=1,t=0,last=0;
var card={x:0,y:0,w:0,h:0,u:1};
var bg=null;
var sway=0,swayT=0,gaze=0;
var ptrIn=false,ptrX=0,ptrY=0;

/* ---------- glow sprites ---------- */
function makeGlow(r,g,b){
  var s=document.createElement('canvas');s.width=s.height=128;
  var c=s.getContext('2d');
  var gr=c.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+r+','+g+','+b+',0.9)');
  gr.addColorStop(0.35,'rgba('+r+','+g+','+b+',0.30)');
  gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
  c.fillStyle=gr;c.fillRect(0,0,128,128);return s;
}
var glowCool=makeGlow(165,205,255);
var glowWarm=makeGlow(255,224,168);
var glowVio =makeGlow(150,120,255);

/* ---------- static background ---------- */
var twinkles=[];
function neb(b,x,y,r,col){
  var rg=b.createRadialGradient(x,y,0,x,y,r);
  rg.addColorStop(0,col);rg.addColorStop(1,'rgba(0,0,0,0)');
  b.fillStyle=rg;b.fillRect(x-r,y-r,r*2,r*2);
}
function buildStatic(){
  bg=document.createElement('canvas');
  bg.width=Math.max(2,Math.round(card.w*DPR));
  bg.height=Math.max(2,Math.round(card.h*DPR));
  var b=bg.getContext('2d');
  b.scale(DPR*(card.w*DPR/bg.width), DPR*(card.h*DPR/bg.height));
  b.save();b.scale(bg.width/(card.w*DPR)*1,bg.height/(card.h*DPR)*1);b.restore();
  // simpler: draw in design units
  b.setTransform(bg.width/300,0,0,bg.height/450,0,0);
  var g=b.createLinearGradient(0,0,0,450);
  g.addColorStop(0,'#0a0821');g.addColorStop(0.55,'#161038');g.addColorStop(1,'#1d1230');
  b.fillStyle=g;b.fillRect(0,0,300,450);
  neb(b,90,110,150,'rgba(92,70,185,0.20)');
  neb(b,225,60,120,'rgba(60,115,195,0.16)');
  neb(b,150,360,180,'rgba(125,85,165,0.14)');
  for(var i=0;i<120;i++){
    var x=Math.random()*300,y=Math.random()*430,r=Math.random()*0.9+0.2;
    b.fillStyle='rgba(220,228,255,'+(Math.random()*0.55+0.1).toFixed(2)+')';
    b.beginPath();b.arc(x,y,r,0,7);b.fill();
  }
  twinkles.length=0;
  for(i=0;i<14;i++){
    twinkles.push({x:Math.random()*300,y:Math.random()*300+10,r:Math.random()*1.1+0.5,ph:Math.random()*6.28});
  }
}

/* ---------- resize ---------- */
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  cv.style.width=W+'px';cv.style.height=H+'px';
  var cw=Math.min(W,H*2/3),ch=cw*1.5;
  card.w=cw;card.h=ch;card.x=(W-cw)/2;card.y=(H-ch)/2;card.u=cw/300;
  buildStatic();
}
window.addEventListener('resize',resize);
resize();

/* ---------- pointer (gentle) ---------- */
function onMove(x,y){
  ptrX=x;ptrY=y;
  ptrIn=(x>=card.x&&x<=card.x+card.w&&y>=card.y&&y<=card.y+card.h);
}
window.addEventListener('pointermove',function(e){onMove(e.clientX,e.clientY);},{passive:true});
window.addEventListener('pointerdown',function(e){onMove(e.clientX,e.clientY);},{passive:true});

/* ---------- particles ---------- */
var GLYPHS=['…',';','~','—','?',',',"'",'e','a','s','o','w','l','m','q','&'];
var motes=[];
function spawnMote(m,first){
  m.x=95+Math.random()*110;
  m.y=first?(80+Math.random()*270):350+Math.random()*14;
  m.v=6+Math.random()*9;
  m.ph=Math.random()*6.28;
  m.dot=Math.random()<0.35;
  m.ch=GLYPHS[(Math.random()*GLYPHS.length)|0];
  m.size=5+Math.random()*6;
  m.warm=Math.random()<0.2;
}
for(var i=0;i<42;i++){var m={};spawnMote(m,true);motes.push(m);}

var ring=[];
for(i=0;i<12;i++){
  ring.push({
    a:Math.random()*6.28,
    rad:34+Math.random()*32,
    sp:(Math.random()<0.5?-1:1)*(0.12+Math.random()*0.2),
    ch:GLYPHS[(Math.random()*GLYPHS.length)|0],
    size:9+Math.random()*6,
    ph:Math.random()*6.28
  });
}

/* ---------- shapes ---------- */
function cardPath(c,x,y,w,h,r){
  c.beginPath();
  c.moveTo(x,y);
  c.lineTo(x+w,y);
  c.lineTo(x+w,y+h-r);
  c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h);
  c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y);
  c.closePath();
}

function drawBook(c,tt){
  c.fillStyle='rgba(0,0,0,0.35)';
  c.beginPath();c.ellipse(150,388,96,10,0,0,7);c.fill();
  // cover
  c.fillStyle='#231836';
  c.beginPath();
  c.moveTo(150,360);
  c.bezierCurveTo(124,350,92,350,66,360);
  c.lineTo(66,381);
  c.bezierCurveTo(92,372,124,372,150,383);
  c.bezierCurveTo(176,372,208,372,234,381);
  c.lineTo(234,360);
  c.bezierCurveTo(208,350,176,350,150,360);
  c.closePath();c.fill();
  // pages
  var pg=c.createLinearGradient(0,348,0,376);
  pg.addColorStop(0,'#f8ecd2');pg.addColorStop(1,'#c9a87e');
  c.fillStyle=pg;
  c.beginPath();
  c.moveTo(150,358);
  c.bezierCurveTo(126,349,96,349,72,357);
  c.lineTo(72,371);
  c.bezierCurveTo(96,363,126,363,150,372);
  c.closePath();c.fill();
  c.beginPath();
  c.moveTo(150,358);
  c.bezierCurveTo(174,349,204,349,228,357);
  c.lineTo(228,371);
  c.bezierCurveTo(204,363,174,363,150,372);
  c.closePath();c.fill();
  c.strokeStyle='rgba(90,60,40,0.55)';c.lineWidth=1.1;
  c.beginPath();c.moveTo(150,358);c.lineTo(150,372);c.stroke();
  // shimmering text lines (words not yet spoken)
  c.lineWidth=0.7;
  for(var i=0;i<4;i++){
    var a=0.30+0.20*Math.sin(tt*0.7+i*1.9);
    c.strokeStyle='rgba(46,38,82,'+a.toFixed(3)+')';
    var y=357.5+i*3.3;
    c.beginPath();c.moveTo(82,y+2.4);c.quadraticCurveTo(112,y-2.6,142,y+2.4);c.stroke();
    c.beginPath();c.moveTo(158,y+2.4);c.quadraticCurveTo(188,y-2.6,218,y+2.4);c.stroke();
  }
}

function drawWings(c,tt){
  for(var k=0;k<2;k++){
    var s=(k===0)?1:-1;
    c.save();c.scale(s,1);
    var fl=Math.sin(tt*2.3+(s<0?0.9:0));
    c.translate(2,-16);
    c.rotate(-0.16+fl*0.13);
    // upper wing
    c.beginPath();
    c.moveTo(0,0);
    c.bezierCurveTo(14,-26,46,-44,62,-36);
    c.bezierCurveTo(76,-29,70,-8,48,2);
    c.bezierCurveTo(30,10,10,6,0,0);
    var g=c.createLinearGradient(0,0,64,-36);
    g.addColorStop(0,'rgba(195,218,255,0.55)');
    g.addColorStop(1,'rgba(150,120,255,0.05)');
    c.fillStyle=g;c.fill();
    c.strokeStyle='rgba(212,226,255,0.35)';c.lineWidth=0.8;c.stroke();
    // faint lines of script inside the wing
    c.strokeStyle='rgba(222,236,255,0.16)';c.lineWidth=0.5;
    for(var i=1;i<=3;i++){
      c.beginPath();
      c.moveTo(5,-i*3);
      c.quadraticCurveTo(28,-10-i*8,54-i*6,-30+i*4);
      c.stroke();
    }
    // lower lobe
    c.beginPath();
    c.moveTo(0,0);
    c.bezierCurveTo(12,4,30,10,34,22);
    c.bezierCurveTo(36,32,22,34,12,24);
    c.bezierCurveTo(6,18,2,8,0,0);
    c.fillStyle='rgba(182,202,255,0.26)';c.fill();
    c.restore();
  }
}

function drawFairy(c,tt,gz){
  // trailing gown dissolving into mist
  var sw1=Math.sin(tt*1.3)*3,sw2=Math.sin(tt*0.9)*4;
  c.beginPath();
  c.moveTo(-4,-2);
  c.bezierCurveTo(-6,12,-2+sw1,26,1+sw2,46);
  c.bezierCurveTo(3,26,6,10,4,-2);
  var tg=c.createLinearGradient(0,0,0,48);
  tg.addColorStop(0,'rgba(200,220,255,0.75)');
  tg.addColorStop(1,'rgba(200,220,255,0)');
  c.fillStyle=tg;c.fill();

  drawWings(c,tt);

  // torso
  var bgr=c.createLinearGradient(0,-26,0,4);
  bgr.addColorStop(0,'rgba(228,240,255,0.95)');
  bgr.addColorStop(1,'rgba(175,200,255,0.55)');
  c.fillStyle=bgr;
  c.beginPath();
  c.moveTo(0,-26);
  c.bezierCurveTo(7,-22,7,-8,0,2);
  c.bezierCurveTo(-7,-8,-7,-22,0,-26);
  c.fill();

  // arms
  var reach=Math.sin(tt*0.6)*2;
  c.strokeStyle='rgba(218,232,255,0.85)';c.lineWidth=2;c.lineCap='round';
  c.beginPath();c.moveTo(3,-18);c.bezierCurveTo(10,-17,15,-21+reach,19,-27+reach);c.stroke();
  c.beginPath();c.moveTo(-3,-18);c.bezierCurveTo(-9,-14,-13,-8,-15,-2+reach*0.5);c.stroke();

  // the held, unspoken word at the fingertip
  var hx=19,hy=-28+reach;
  var pa=0.45+0.3*Math.sin(tt*1.4);
  c.globalCompositeOperation='lighter';
  c.globalAlpha=pa;
  c.drawImage(glowWarm,hx-9,hy-9,18,18);
  c.globalAlpha=0.5+0.4*Math.sin(tt*1.4);
  c.fillStyle='rgba(255,240,210,0.9)';
  c.font='italic 9px Georgia, "Times New Roman", serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText('…',hx,hy);
  c.globalAlpha=1;
  c.globalCompositeOperation='source-over';

  // head group: a slow turn
  c.save();
  c.translate(0,-24);
  c.rotate(Math.sin(tt*0.33)*0.09+gz*0.02);
  // hair streaming on a silent wind
  c.strokeStyle='rgba(192,208,255,0.75)';c.lineWidth=1.5;c.lineCap='round';
  for(var i=0;i<3;i++){
    var hw=Math.sin(tt*0.8+i*1.7)*3;
    c.beginPath();
    c.moveTo(-1+i,-11);
    c.bezierCurveTo(-6-i*2,-18,-12-i*3+hw,-24,-16-i*4+hw*1.5,-18-i*2);
    c.stroke();
  }
  // head
  var hg=c.createRadialGradient(gz,-7,0,gz,-7,8);
  hg.addColorStop(0,'rgba(245,250,255,1)');
  hg.addColorStop(0.7,'rgba(205,222,255,0.9)');
  hg.addColorStop(1,'rgba(180,200,255,0.25)');
  c.fillStyle=hg;
  c.beginPath();c.arc(0,-7,7,0,7);c.fill();
  // face glint drifts with the gaze
  c.fillStyle='rgba(255,255,255,0.85)';
  c.beginPath();c.arc(gz*2.2+1.5,-8.5,1.1,0,7);c.fill();
  c.restore();
}

/* ---------- main loop ---------- */
function frame(now){
  var tt=now*0.001;
  var dt=Math.min(0.05,tt-(last||tt));last=tt;t=tt;

  // pointer sway (gentle, eased)
  if(ptrIn){
    var lx=(ptrX-card.x)/card.u;
    swayT=Math.max(-10,Math.min(10,(lx-150)*0.10));
  }else swayT=0;
  sway+=(swayT-sway)*0.03;
  gaze=sway*0.3;

  var bob=Math.sin(t*0.9)*6;
  var fxd=150+sway,fyd=186+bob;

  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle='#05040f';ctx.fillRect(0,0,W,H);

  ctx.save();
  cardPath(ctx,card.x,card.y,card.w,card.h,card.u*16);
  ctx.clip();
  ctx.translate(card.x,card.y);
  ctx.scale(card.u,card.u);

  // background
  ctx.drawImage(bg,0,0,300,450);
  for(var i=0;i<twinkles.length;i++){
    var tw=twinkles[i];
    ctx.fillStyle='rgba(230,238,255,'+(0.25+0.45*(0.5+0.5*Math.sin(t*1.3+tw.ph))).toFixed(3)+')';
    ctx.beginPath();ctx.arc(tw.x,tw.y,tw.r,0,7);ctx.fill();
  }

  // book + its breath of light
  drawBook(ctx,t);
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=0.34+0.08*Math.sin(t*1.2);
  ctx.drawImage(glowWarm,150-95,352-70,190,140);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';

  // rising motes: letters escaping the page
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(i=0;i<motes.length;i++){
    var m=motes[i];
    m.y-=m.v*dt;
    m.x+=Math.sin(t*1.4+m.ph)*4*dt;
    if(m.y<72)spawnMote(m,false);
    var a=Math.min(1,(362-m.y)/45)*Math.min(1,(m.y-80)/55)*0.75;
    if(a<=0)continue;
    if(m.dot){
      ctx.fillStyle=m.warm?'rgba(255,228,175,'+a.toFixed(3)+')':'rgba(205,222,255,'+a.toFixed(3)+')';
      ctx.beginPath();ctx.arc(m.x,m.y,m.size*0.16+0.5,0,7);ctx.fill();
    }else{
      ctx.fillStyle=m.warm?'rgba(255,230,180,'+a.toFixed(3)+')':'rgba(200,218,255,'+a.toFixed(3)+')';
      ctx.font='italic '+m.size.toFixed(1)+'px Georgia, "Times New Roman", serif';
      ctx.fillText(m.ch,m.x,m.y);
    }
  }

  // fairy aura
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=0.42+0.13*Math.sin(t*1.7);
  ctx.drawImage(glowCool,fxd-70,fyd-70,140,140);
  ctx.globalAlpha=0.22+0.08*Math.sin(t*1.1+2);
  ctx.drawImage(glowVio,fxd-100,fyd-100,200,200);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';

  // the fairy herself
  ctx.save();
  ctx.translate(fxd,fyd);
  ctx.rotate(sway*0.008);
  drawFairy(ctx,t,gaze);
  ctx.restore();

  // orbiting glyphs — words circling, not yet chosen
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<ring.length;i++){
    var r0=ring[i];
    r0.a+=r0.sp*dt;
    var gx=fxd+Math.cos(r0.a)*r0.rad;
    var gy=fyd-6+Math.sin(r0.a)*r0.rad*0.5;
    var al=0.16+0.34*(0.5+0.5*Math.sin(t*1.1+r0.ph));
    ctx.globalAlpha=al*0.7;
    ctx.drawImage(glowCool,gx-r0.size*1.4,gy-r0.size*1.4,r0.size*2.8,r0.size*2.8);
    ctx.globalAlpha=al+0.25;
    ctx.fillStyle='rgba(215,230,255,1)';
    ctx.font='italic '+r0.size.toFixed(1)+'px Georgia, "Times New Roman", serif';
    ctx.fillText(r0.ch,gx,gy);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';

  // vignette
  var vg=ctx.createRadialGradient(150,210,110,150,225,320);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,'rgba(4,3,16,0.55)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,300,450);

  ctx.restore();
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
  "title": "The Fairy of Unspoken Words",
  "statement": "What remains unsaid gathers light, awaiting one brave voice."
}
```