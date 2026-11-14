Here's my piece — a quiet sky that folds one small figure out of scattered stars, wakes it, and lets it settle again.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title> </title>
<style>
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#01020a}
canvas{position:fixed;left:0;top:0;display:block}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
"use strict";

var canvas=document.getElementById("c");
var ctx=canvas.getContext("2d");
var W=0,H=0,DPR=1,CX=0,CY=0,R=0,S=1;
var bgGrad=null,vigGrad=null;

function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u);}
function easeOutBack(u){u=clamp(u,0,1);var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);}
function rot(p,c,a){var dx=p.x-c.x,dy=p.y-c.y,ca=Math.cos(a),sa=Math.sin(a);return{x:c.x+dx*ca-dy*sa,y:c.y+dx*sa+dy*ca};}

function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  canvas.width=Math.max(1,Math.round(W*DPR));
  canvas.height=Math.max(1,Math.round(H*DPR));
  canvas.style.width=W+"px";canvas.style.height=H+"px";
  CX=W/2;CY=H/2;R=Math.min(W,H)/2;
  S=Math.max(0.55,Math.min(2.1,R/300));
  bgGrad=ctx.createLinearGradient(0,CY-R,0,CY+R);
  bgGrad.addColorStop(0,"#0b1132");
  bgGrad.addColorStop(0.5,"#070b22");
  bgGrad.addColorStop(1,"#030510");
  vigGrad=ctx.createRadialGradient(CX,CY,R*0.3,CX,CY,R);
  vigGrad.addColorStop(0,"rgba(2,3,12,0)");
  vigGrad.addColorStop(1,"rgba(1,2,8,0.65)");
}
window.addEventListener("resize",resize);
resize();

function glowSprite(rgb){
  var c=document.createElement("canvas");c.width=c.height=64;
  var g=c.getContext("2d");
  var gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,"rgba("+rgb+",0.85)");
  gr.addColorStop(0.3,"rgba("+rgb+",0.25)");
  gr.addColorStop(1,"rgba("+rgb+",0)");
  g.fillStyle=gr;g.fillRect(0,0,64,64);
  return c;
}
var sprWhite=glowSprite("255,255,255");
var sprBlue=glowSprite("168,198,255");
var sprWarm=glowSprite("255,224,168");
var sprHub=glowSprite("72,92,190");
var STAR_TINTS=[
  {img:sprWhite,core:"#ffffff"},
  {img:sprBlue,core:"#dce8ff"},
  {img:sprWarm,core:"#ffe9c4"}
];
function pickTint(){var r=Math.random();return r<0.55?STAR_TINTS[0]:(r<0.85?STAR_TINTS[1]:STAR_TINTS[2]);}

// star field
var stars=[];
var i;
for(i=0;i<240;i++){
  stars.push({
    r:Math.sqrt(Math.random())*0.97,
    a:Math.random()*Math.PI*2,
    l:0.25+Math.random()*0.75,
    sz:0.6+Math.random()*Math.random()*2.6,
    ph:Math.random()*6.2832,
    sp:0.4+Math.random()*1.6,
    al:0.35+Math.random()*0.65,
    tint:pickTint(),
    big:Math.random()<0.08
  });
}
// faint galactic band
var bandAng=0.9,bca=Math.cos(bandAng),bsa=Math.sin(bandAng);
for(i=0;i<170;i++){
  var u=Math.random()*2-1;
  var v=(Math.random()+Math.random()+Math.random()-1.5)*0.08;
  var bx=u*bca-v*bsa, by=u*bsa+v*bca;
  stars.push({
    r:Math.min(Math.sqrt(bx*bx+by*by),0.99),
    a:Math.atan2(by,bx),
    l:0.5,
    sz:0.35+Math.random()*0.8,
    ph:Math.random()*6.2832,
    sp:0.2+Math.random()*0.7,
    al:0.10+Math.random()*0.28,
    tint:Math.random()<0.8?STAR_TINTS[1]:STAR_TINTS[0],
    big:false
  });
}

// nebulae
var nebs=[
  {x:0.58,y:0.32,r:0.46,img:glowSprite("110,80,220"),a:0.10},
  {x:-0.64,y:-0.26,r:0.52,img:glowSprite("40,150,170"),a:0.085},
  {x:-0.12,y:0.70,r:0.42,img:glowSprite("190,80,150"),a:0.06},
  {x:0.22,y:-0.72,r:0.38,img:glowSprite("60,100,230"),a:0.08}
];

// the crane: points, edges, point radii
var P=[
  {x:-0.46,y:-0.16},{x:-0.26,y:0.02},{x:-0.12,y:0.12},{x:0.02,y:0.04},
  {x:-0.02,y:-0.34},{x:0.14,y:-0.04},{x:0.26,y:-0.26},{x:0.34,y:-0.28},
  {x:0.47,y:-0.23},{x:0.18,y:0.10},{x:0.02,y:0.16}
];
var EDGES=[[0,1],[1,2],[2,10],[10,9],[9,3],[3,2],[3,4],[4,9],[3,5],[5,6],[6,7],[7,8]];
var PR=[2.6,2.4,2.3,3.6,3.2,2.3,2.6,3.0,2.0,2.4,2.2];

// pointer
var ptr={x:0,y:0,tx:0,ty:0,on:false};
window.addEventListener("pointermove",function(e){
  ptr.tx=e.clientX-CX;ptr.ty=e.clientY-CY;ptr.on=true;
},{passive:true});
window.addEventListener("pointerdown",function(e){
  ptr.tx=e.clientX-CX;ptr.ty=e.clientY-CY;ptr.on=true;
},{passive:true});

// meteors and drifting sparks
var meteors=[],nextMeteor=4;
var sparks=[],sparkAcc=0;

var last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  var t=now/1000;
  var dt=Math.min(0.05,(now-last)/1000);
  last=now;
  var cyc=t%22;
  var theta=t*0.01047; // the sky turns once every ten minutes
  var ca=Math.cos(theta),sa=Math.sin(theta);

  ptr.x+=(ptr.tx-ptr.x)*Math.min(1,dt*4);
  ptr.y+=(ptr.ty-ptr.y)*Math.min(1,dt*4);

  ctx.fillStyle="#01020a";
  ctx.fillRect(0,0,W,H);
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX,CY,R,0,6.2832);
  ctx.clip();

  ctx.fillStyle=bgGrad;
  ctx.fillRect(CX-R,CY-R,R*2,R*2);

  ctx.globalCompositeOperation="lighter";

  // hub glow + nebulae
  var hs=R*1.5;
  ctx.globalAlpha=0.4;
  ctx.drawImage(sprHub,CX-hs/2,CY-hs/2,hs,hs);
  for(i=0;i<nebs.length;i++){
    var n=nebs[i];
    var nx=CX+(n.x*ca-n.y*sa)*R+ptr.x*0.02;
    var ny=CY+(n.x*sa+n.y*ca)*R+ptr.y*0.02;
    var nd=n.r*R*2;
    ctx.globalAlpha=n.a;
    ctx.drawImage(n.img,nx-nd/2,ny-nd/2,nd,nd);
  }

  // stars
  for(i=0;i<stars.length;i++){
    var st=stars[i];
    var ang=st.a+theta, rr=st.r*R;
    var px=CX+Math.cos(ang)*rr+ptr.x*st.l*0.035;
    var py=CY+Math.sin(ang)*rr+ptr.y*st.l*0.035;
    var tw=0.5+0.5*Math.sin(t*st.sp+st.ph);
    var al=st.al*(0.45+0.55*tw*tw);
    var sz=st.sz*S, d=sz*6;
    ctx.globalAlpha=al;
    ctx.drawImage(st.tint.img,px-d/2,py-d/2,d,d);
    if(sz>1.05){
      ctx.globalAlpha=al*0.95;
      ctx.fillStyle=st.tint.core;
      ctx.beginPath();ctx.arc(px,py,sz*0.55,0,6.2832);ctx.fill();
    }
    if(st.big){
      ctx.globalAlpha=al*0.4;
      ctx.strokeStyle="#eaf2ff";
      ctx.lineWidth=1;
      var L=sz*3.2;
      ctx.beginPath();
      ctx.moveTo(px-L,py);ctx.lineTo(px+L,py);
      ctx.moveTo(px,py-L);ctx.lineTo(px,py+L);
      ctx.stroke();
    }
  }

  // meteors
  if(t>nextMeteor&&meteors.length<3){
    var ma=Math.random()*6.2832;
    var sx=CX+Math.cos(ma)*R*0.95, sy=CY+Math.sin(ma)*R*0.95;
    var mdx=CX+(Math.random()-0.5)*R*0.7-sx, mdy=CY+(Math.random()-0.5)*R*0.7-sy;
    var mdd=Math.hypot(mdx,mdy)||1;
    var msp=R*(0.9+Math.random()*0.9);
    meteors.push({x:sx,y:sy,vx:mdx/mdd*msp,vy:mdy/mdd*msp,life:0,max:0.7+Math.random()*0.5,len:R*(0.10+Math.random()*0.10),sp:msp});
    nextMeteor=t+3+Math.random()*6;
  }
  for(var m=meteors.length-1;m>=0;m--){
    var mo=meteors[m];
    mo.life+=dt;
    if(mo.life>=mo.max){meteors.splice(m,1);continue;}
    mo.x+=mo.vx*dt;mo.y+=mo.vy*dt;
    var f=mo.life/mo.max;
    var mal=Math.sin(Math.PI*clamp(f*1.1,0,1))*0.8;
    var ux=mo.vx/mo.sp, uy=mo.vy/mo.sp;
    var tx3=mo.x-ux*mo.len, ty3=mo.y-uy*mo.len;
    var g=ctx.createLinearGradient(tx3,ty3,mo.x,mo.y);
    g.addColorStop(0,"rgba(170,205,255,0)");
    g.addColorStop(1,"rgba(225,240,255,"+mal+")");
    ctx.strokeStyle=g;
    ctx.lineWidth=Math.max(1,1.4*S);
    ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(tx3,ty3);ctx.lineTo(mo.x,mo.y);ctx.stroke();
    ctx.globalAlpha=mal;
    var gd=7*S;
    ctx.drawImage(sprWhite,mo.x-gd/2,mo.y-gd/2,gd,gd);
  }

  // the crane constellation
  var ga=sstep(1.2,2.4,cyc)*(1-sstep(15.5,18.0,cyc));
  if(ga>0.001){
    var env=sstep(7.0,9.0,cyc)*(1-sstep(12.5,14.0,cyc));
    var pulse=sstep(5.4,5.9,cyc)*(1-sstep(6.1,7.0,cyc));
    var flap=env*Math.sin(t*2.3)*0.36;
    var bob=Math.sin(t*0.9)*0.011*(0.45+0.55*env);
    var cs=R*0.78;
    var base=[],j;
    for(j=0;j<P.length;j++){base.push({x:P[j].x,y:P[j].y});}
    base[4]=rot(P[4],P[3],flap);
    base[0]=rot(P[0],P[1],-flap*0.45);
    base[7]=rot(P[7],P[6],flap*0.15);
    base[8]=rot(P[8],P[6],flap*0.15);
    var cw=[];
    for(j=0;j<P.length;j++){
      var rx=base[j].x*ca-base[j].y*sa;
      var ry=base[j].x*sa+base[j].y*ca+bob;
      cw.push({x:CX+rx*cs+ptr.x*0.028,y:CY+ry*cs+ptr.y*0.028});
    }
    // the beak glances toward the pointer
    var dxp=ptr.x-(cw[3].x-CX), dyp=ptr.y-(cw[3].y-CY);
    var ddp=Math.hypot(dxp,dyp);
    if(ddp>4&&ptr.on){
      var off=Math.min(ddp*0.045,R*0.02)*ga*(0.3+0.7*env);
      cw[8].x+=dxp/ddp*off;cw[8].y+=dyp/ddp*off;
      cw[7].x+=dxp/ddp*off*0.5;cw[7].y+=dyp/ddp*off*0.5;
    }

    // soft halo while awake
    if(env>0.02){
      ctx.globalAlpha=0.10*env;
      var gh=R*0.34;
      ctx.drawImage(sprWarm,cw[3].x-gh/2,cw[3].y-gh/2,gh,gh);
    }

    // lines trace in
    var lineP=clamp((cyc-2.0)/3.4,0,1);
    if(lineP>0){
      ctx.lineCap="round";
      var boost=(1+0.5*env)*(1+0.6*pulse);
      for(var e=0;e<EDGES.length;e++){
        var por=clamp(lineP*EDGES.length-e,0,1);
        if(por<=0)continue;
        var A=cw[EDGES[e][0]],B=cw[EDGES[e][1]];
        var mx=A.x+(B.x-A.x)*por,my=A.y+(B.y-A.y)*por;
        var al=0.5*ga*boost*clamp(por*4,0,1);
        ctx.strokeStyle="rgba(140,190,250,"+(al*0.30)+")";
        ctx.lineWidth=Math.max(1.2,2.4*S);
        ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(mx,my);ctx.stroke();
        ctx.strokeStyle="rgba(215,238,255,"+al+")";
        ctx.lineWidth=Math.max(0.7,1.05*S);
        ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(mx,my);ctx.stroke();
      }
    }

    // stars pop in one by one
    for(j=0;j<P.length;j++){
      var uu=(cyc-(1.2+j*0.22))/0.6;
      if(uu<=0)continue;
      var ea=easeOutBack(uu);
      var sal=clamp(ga*clamp(ea,0,1)*(1+0.7*pulse)*(1+0.35*env*(0.5+0.5*Math.sin(t*5+j*1.7))),0,1);
      if(sal<=0)continue;
      var p2=cw[j],r=PR[j]*S*(0.35+0.65*ea);
      ctx.globalAlpha=sal*0.85;
      var g2=r*5.5;
      ctx.drawImage(sprWarm,p2.x-g2/2,p2.y-g2/2,g2,g2);
      ctx.globalAlpha=sal;
      ctx.fillStyle="#fff7e8";
      ctx.beginPath();ctx.arc(p2.x,p2.y,r,0,6.2832);ctx.fill();
      if(r>2.6*S){
        ctx.globalAlpha=sal*0.35;
        ctx.strokeStyle="#ffe9c4";
        ctx.lineWidth=1;
        var L2=r*3;
        ctx.beginPath();
        ctx.moveTo(p2.x-L2,p2.y);ctx.lineTo(p2.x+L2,p2.y);
        ctx.moveTo(p2.x,p2.y-L2);ctx.lineTo(p2.x,p2.y+L2);
        ctx.stroke();
      }
    }

    // drifting sparks while awake
    if(cyc>8.2&&cyc<13.2){
      sparkAcc+=dt*8;
      while(sparkAcc>=1){
        sparkAcc-=1;
        var src=Math.random()<0.65?cw[4]:cw[0];
        sparks.push({x:src.x+(Math.random()-0.5)*4,y:src.y+(Math.random()-0.5)*4,
          vx:(Math.random()-0.5)*R*0.05,vy:-(0.04+Math.random()*0.08)*R,
          life:0,max:1.4+Math.random()*1.3,sz:0.7+Math.random()*1.5});
      }
    }
  }
  if(sparks.length>70){sparks.splice(0,sparks.length-70);}
  for(var k=sparks.length-1;k>=0;k--){
    var p=sparks[k];
    p.life+=dt;
    if(p.life>=p.max){sparks.splice(k,1);continue;}
    p.vx+=Math.sin(t*2.5+p.life*6)*R*0.02*dt;
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    var fa=1-p.life/p.max;
    ctx.globalAlpha=fa*0.75*ga;
    var ds=p.sz*S*4.5;
    ctx.drawImage(sprWarm,p.x-ds/2,p.y-ds/2,ds,ds);
  }
  ctx.globalAlpha=1;

  // pointer aura
  if(ptr.on){
    var pd=Math.hypot(ptr.x,ptr.y);
    if(pd<R*0.9){
      ctx.globalAlpha=0.05;
      var ad=R*0.5;
      ctx.drawImage(sprBlue,CX+ptr.x-ad/2,CY+ptr.y-ad/2,ad,ad);
      ctx.globalAlpha=1;
    }
  }

  // vignette
  ctx.globalCompositeOperation="source-over";
  ctx.fillStyle=vigGrad;
  ctx.fillRect(CX-R,CY-R,R*2,R*2);

  ctx.restore();
}
requestAnimationFrame(frame);

})();
</script>
</body>
</html>
```

```json
{
  "title": "The Paper Crane",
  "statement": "Folded from a handful of bright stars, it wakes once in a while, flaps its wings against the dark, and settles back into the turning sky."
}
```