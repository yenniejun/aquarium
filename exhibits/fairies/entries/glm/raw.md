I chose a graphite-sketch world: my fairy is perpetually half-drawn, tending a sheet of paper where a bird is forever almost finished, with a floating pencil that keeps completing strokes that fade. Everything — wings, one leg, hair ends, even the background construction lines — cycles through being sketched and erased, with a hand-drawn "boiling line" animation so the whole piece feels like a living pencil drawing. One red-chalk thread and a sanguine bird's eye are the only color.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>artwork</title>
<style>
  html,body{margin:0;padding:0;height:100%;background:#f1e7d4;overflow:hidden}
  body{display:flex;align-items:center;justify-content:center}
  #stage{position:relative;overflow:hidden;border-radius:0 0 18px 18px}
  canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
<div id="stage"><canvas id="c"></canvas></div>
<script>
(function(){
"use strict";
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const W=400, H=600;
const INK='#38342e', RED='#a4432c', PAPER='#f1e7d4', SHEET='#faf4e7';
let scale=1;

function resize(){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const vw=window.innerWidth, vh=window.innerHeight;
  let w=Math.min(vw,600), h=w*1.5;
  if(h>vh){ h=vh; w=h/1.5; }
  if(w<170){ w=170; h=Math.min(w*1.5,vh); }
  const st=document.getElementById('stage');
  st.style.width=w+'px'; st.style.height=h+'px';
  cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr);
  scale=cv.width/W;
}
window.addEventListener('resize',resize); resize();

/* ---------- geometry helpers ---------- */
function catmull(pts,seg){
  seg=seg||6;
  if(pts.length<2) return pts.map(p=>p.slice());
  const out=[];
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(0,i-1)], p1=pts[i], p2=pts[i+1], p3=pts[Math.min(pts.length-1,i+2)];
    for(let j=0;j<seg;j++){
      const t=j/seg, t2=t*t, t3=t2*t;
      out.push([
        .5*(2*p1[0]+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
        .5*(2*p1[1]+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
      ]);
    }
  }
  out.push(pts[pts.length-1].slice());
  return out;
}
function arc(cx,cy,r,a0,a1,n){
  n=n||26; const o=[];
  for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; o.push([cx+r*Math.cos(a), cy+r*Math.sin(a)]); }
  return o;
}
function h2(a,b,c){
  let x=(Math.imul(a,374761393)+Math.imul(b,668265263)+Math.imul(c,-2044887797))|0;
  x^=x>>>13; x=Math.imul(x,1274126177); x^=x>>>16;
  return (x>>>0)/4294967295;
}

/* ---------- stroke catalogue (draw order) ---------- */
const strokes=[]; let SID=0;
function S(g,pts,o){
  o=o||{};
  strokes.push({g:g,id:SID++,p:catmull(pts),
    w:o.w||1.3, a:(o.a===undefined?0.8:o.a), col:o.col||INK,
    cyc:o.cyc||null, fill:o.fill||null});
}

/* abandoned construction lines of the whole world */
S('I', arc(197,224,97,-2.4,3.6), {w:1,a:.07});
S('I', [[197,105],[199,300],[197,535]], {w:1,a:.05});
S('I', [[52,252],[200,249],[345,255]], {w:1,a:.05});
S('I', [[58,468],[125,325],[196,172]], {w:1,a:.045});
S('I', arc(332,470,78,2.6,4.6), {w:1,a:.05});
S('I', arc(326,118,24,0.4,5.4), {w:1,a:.05});

/* grounding shadow pool beneath the fairy */
for(let i=0;i<22;i++){
  const x=198+(h2(i,5,1)-.5)*160, y=492+(h2(i,6,2)-.5)*30;
  const dx=(x-198)/88, dy=(y-492)/16;
  if(dx*dx+dy*dy>1) continue;
  const L=9+h2(i,7,3)*10, tl=(h2(i,8,4)-.5)*4;
  S('FS',[[x-L/2,y+tl/2],[x+L/2,y-tl/2]],{w:1,a:.13});
}

/* shadow hatching under the drifting paper */
S('PS',[[282,420],[306,423]],{w:1,a:.18});
S('PS',[[295,427],[319,429]],{w:1,a:.14});
S('PS',[[277,428],[295,431]],{w:1,a:.12});

/* left wing — fully rendered */
S('WL',[[183,243],[152,205],[108,160],[68,137]],{w:1.7,a:.9});
S('WL',[[183,253],[156,222],[120,192],[80,158]],{w:1.5,a:.8});
S('WL',[[68,137],[73,149],[80,158]],{w:1.4,a:.7});
S('WL',[[184,247],[142,201],[114,172]],{w:1.2,a:.6});
S('WL',[[184,249],[157,226],[130,200]],{w:1.1,a:.5});
S('WL',[[184,251],[166,236],[147,216]],{w:1,a:.4});
S('WL',[[183,254],[163,253],[144,246],[136,234]],{w:1.3,a:.7});
(function(){
  const topC=catmull([[183,243],[152,205],[108,160],[68,137]],12);
  const botC=catmull([[183,253],[156,222],[120,192],[80,158]],12);
  for(let k=1;k<23;k++){
    const u=k/23;
    const ia=Math.min(topC.length-1,Math.floor(u*(topC.length-1)));
    const ib=Math.min(botC.length-1,Math.floor(u*(botC.length-1)));
    const A=topC[ia], B=botC[ib], A2=topC[Math.min(topC.length-1,ia+2)];
    let dx=A2[0]-A[0], dy=A2[1]-A[1];
    const dl=Math.hypot(dx,dy)||1; dx/=dl; dy/=dl;
    for(const s of [0.35,0.6,0.85]){
      if(h2(k,s*100|0,9)<0.25) continue;
      const px=A[0]+(B[0]-A[0])*s+(h2(k,s*100|0,11)-.5)*6;
      const py=A[1]+(B[1]-A[1])*s+(h2(k,s*100|0,12)-.5)*6;
      const L=7+h2(k,s*100|0,13)*8;
      S('WL',[[px,py],[px+dx*L,py+dy*L]],{w:.9,a:.12+h2(k,s*100|0,14)*.1});
    }
  }
})();

/* right wing — only ever an unfinished outline */
S('WR',[[211,244],[248,205],[288,158],[328,122]],{w:1.6,a:.5,cyc:[11,0]});
S('WR',[[211,252],[252,228],[294,196],[324,148]],{w:1.4,a:.45,cyc:[11,.08]});
S('WR',[[328,122],[325,135],[320,143]],{w:1.2,a:.4,cyc:[11,.16]});
S('WR',[[213,248],[258,222],[300,186]],{w:1.1,a:.35,cyc:[11,.24]});
S('WR',[[213,251],[240,243],[262,232]],{w:1,a:.3,cyc:[11,.33]});
S('WR',[[211,254],[230,258],[248,256],[258,246]],{w:1.1,a:.4,cyc:[11,.41]});

/* far arm, resting toward the knee */
S('B',[[187,247],[177,268],[170,291],[174,305]],{w:1.3,a:.65});
S('B',[[190,253],[180,274],[173,295],[177,308]],{w:1.2,a:.55});
S('B',[[174,305],[168,313],[165,320]],{w:1,a:.55});
S('B',[[174,305],[170,314],[169,321]],{w:1,a:.5});
S('B',[[175,306],[173,315],[175,322]],{w:1,a:.5});

/* legs — one finished, one dissolving into sketch */
S('B',[[191,303],[178,312],[169,317]],{w:1.5,a:.85});
S('B',[[193,309],[181,319],[172,323]],{w:1.4,a:.7});
S('B',[[170,321],[162,332],[157,344],[158,356]],{w:1.3,a:.7,cyc:[9,.15]});
S('B',[[159,352],[152,358],[148,352],[154,347],[160,352]],{w:1.2,a:.6,cyc:[9,.3]});
S('B',[[157,360],[150,368],[146,362],[152,357]],{w:1.1,a:.5,cyc:[9,.45]});
S('B',[[152,368],[148,380],[150,392]],{w:1,a:.35,cyc:[13,.2]});
S('B',[[160,366],[158,378],[162,388]],{w:1,a:.3,cyc:[13,.5]});
S('B',[[204,302],[215,310],[221,317]],{w:1.5,a:.85});
S('B',[[201,308],[213,317],[219,323]],{w:1.4,a:.7});
S('B',[[221,323],[219,336],[215,350]],{w:1.4,a:.8});
S('B',[[217,326],[214,338],[210,350]],{w:1.2,a:.6});
S('B',[[215,350],[207,354],[200,355]],{w:1.3,a:.8});
S('B',[[200,355],[197,358]],{w:1,a:.6});
S('B',[[203,355],[201,358]],{w:1,a:.6});

/* torso, collar, pelvis, heart in red chalk */
S('B',[[194,232],[193,239],[193,244]],{w:1.3,a:.85});
S('B',[[201,232],[201,239],[201,244]],{w:1.3,a:.85});
S('B',[[188,245],[181,262],[183,283],[189,301]],{w:1.6,a:.9});
S('B',[[206,245],[213,261],[209,283],[201,299]],{w:1.6,a:.9});
S('B',[[189,247],[197,254],[206,247]],{w:1.1,a:.7});
S('B',[[189,301],[193,308],[200,310],[209,299]],{w:1.4,a:.8});
S('B',[[192,258],[197,255],[201,259],[196,262],[192,258],[197,256.5]],{w:1.2,a:.85,col:RED});

/* near arm, reaching toward the paper */
S('B',[[206,246],[224,260],[240,272],[252,276]],{w:1.5,a:.9});
S('B',[[208,252],[225,270],[240,281],[250,284]],{w:1.4,a:.75});
S('B',[[250,283],[255,280],[258,282],[255,285]],{w:1.1,a:.7});
S('B',[[255,280],[262,277],[267,275]],{w:1,a:.7});
S('B',[[256,282],[264,281],[268,281]],{w:1,a:.7});
S('B',[[255,284],[262,286],[265,289]],{w:1,a:.65});

/* head, downcast face, drifting hair */
S('H', arc(197,217,16,-2.9,1.7), {w:1.5,a:.9});
S('H',[[188,228],[192,233],[197,234],[202,232]],{w:1.3,a:.8});
S('H',[[186,218],[183,221],[186,225]],{w:1,a:.6});
S('H',[[188,215],[191,217],[194,214]],{w:1.2,a:.85});
S('H',[[201,214],[204,216],[207,213]],{w:1.2,a:.85});
S('H',[[188,215],[186,214]],{w:1,a:.55});
S('H',[[207,213],[209,212]],{w:1,a:.55});
S('H',[[188,210],[192,208.5]],{w:.9,a:.45});
S('H',[[201,208.5],[205,210]],{w:.9,a:.45});
S('H',[[197,219],[198,222],[196,223]],{w:.9,a:.5});
S('H',[[193,227],[196,228],[199,226]],{w:1,a:.7});
S('H',[[184,207],[163,190],[138,172],[115,160]],{w:1.3,a:.8});
S('H',[[190,203],[176,181],[155,156],[130,138]],{w:1.4,a:.85});
S('H',[[197,201],[199,172],[190,142],[172,120]],{w:1.3,a:.8});
S('H',[[205,203],[220,188],[231,172]],{w:1.1,a:.7});
S('H',[[186,206],[183,216],[185,226]],{w:1,a:.6});
S('H',[[192,203],[188,178],[176,155]],{w:1,a:.6});
S('H',[[130,138],[118,126],[108,112]],{w:1.1,a:.5,cyc:[12,.1]});
S('H',[[172,120],[166,106],[163,92]],{w:1.1,a:.45,cyc:[12,.35]});

/* the sheet of paper, and the half-drawn bird */
strokes.push({g:'P',id:SID++,p:[],w:0,a:1,col:INK,cyc:null,fill:'paper'});
S('P',[[272,314],[292,313],[322,310],[348,309]],{w:1.5,a:.9});
S('P',[[348,309],[346,340],[345,372],[344,403]],{w:1.4,a:.8});
S('P',[[344,403],[316,400],[292,398],[268,397]],{w:1.3,a:.8});
S('P',[[268,397],[269,365],[270,340],[272,314]],{w:1.3,a:.8});
S('P',[[344,403],[330,390],[327,403]],{w:1,a:.6});
S('P',[[329,393],[335,396]],{w:.8,a:.4});
S('P', arc(298,350,6,-2.6,2.4), {w:1.1,a:.85});
S('P',[[292,351],[287,352],[292,353.5]],{w:1,a:.7});
S('P',[[297,348],[298.5,349.5]],{w:2,a:.9,col:RED});
S('P',[[303,355],[310,358],[319,362]],{w:1.2,a:.85});
S('P',[[303,357],[310,362],[318,365]],{w:1,a:.7});
S('P',[[305,356],[310,348],[318,344]],{w:1.1,a:.7,cyc:[8,.45]});
S('P',[[319,362],[328,359],[337,357]],{w:1.1,a:.6,cyc:[8,.5]});
S('P',[[306,358],[312,366],[320,370]],{w:1,a:.5,cyc:[8,.55]});
S('P',[[306,364],[304,370]],{w:1,a:.5,cyc:[8,.52]});
S('P',[[311,365],[310,371]],{w:1,a:.5,cyc:[8,.54]});
S('P',[[284,380],[294,382],[306,383]],{w:1,a:.25});
S('P',[[286,330],[290,336],[285,341]],{w:1,a:.25});
S('P',[[330,382],[338,384],[336,390]],{w:1,a:.2});

/* the pencil, forever trying to finish the bird */
S('K',[[306,238],[309,252],[314,266]],{w:1.2,a:.8});
S('K',[[313,235],[315,249],[319,265]],{w:1.2,a:.8});
S('K',[[314,266],[318,275]],{w:1,a:.8});
S('K',[[319,265],[318,275]],{w:1,a:.8});
S('K',[[318,275],[316.5,271]],{w:2.2,a:.9});
S('K',[[305,239],[312,236]],{w:1.6,a:.7});
S('K',[[303,238],[303,233],[307,230],[310,232]],{w:1,a:.6});

/* graphite smudge in the corners */
[[0,0,1,1],[400,0,-1,1],[0,600,1,-1],[400,600,-1,-1]].forEach(function(c,ci){
  for(let i=0;i<16;i++){
    const u=h2(ci,i,3), v=h2(ci,i,4);
    if(u+v>1.15) continue;
    const x=c[0]+c[2]*u*130, y=c[1]+c[3]*v*100;
    const L=12+h2(ci,i,5)*14;
    S('V',[[x,y],[x+c[2]*L*.7,y+c[3]*L*.7]],{w:1,a:.05});
  }
});

for(const st of strokes){
  let L=0; const cum=[0];
  for(let i=1;i<st.p.length;i++){
    L+=Math.hypot(st.p[i][0]-st.p[i-1][0], st.p[i][1]-st.p[i-1][1]);
    cum.push(L);
  }
  st.total=L;
}
const paperEdges=[
  catmull([[272,314],[292,313],[322,310],[348,309]],6),
  catmull([[348,309],[346,340],[345,372],[344,403]],6),
  catmull([[344,403],[316,400],[292,398],[268,397]],6),
  catmull([[268,397],[269,365],[270,340],[272,314]],6)
];

/* paper grain */
const pc=document.createElement('canvas'); pc.width=pc.height=140;
const px=pc.getContext('2d'); const im=px.createImageData(140,140);
for(let i=0;i<im.data.length;i+=4){
  const v=Math.random();
  im.data[i]=60; im.data[i+1]=54; im.data[i+2]=46;
  im.data[i+3]=v<0.6?0:(v-0.6)*50;
}
px.putImageData(im,0,0);
const grain=ctx.createPattern(pc,'repeat');

/* ---------- transforms ---------- */
function mRot(pxv,pyv,a){
  const c=Math.cos(a), s=Math.sin(a);
  return function(p){ return [pxv+(p[0]-pxv)*c-(p[1]-pyv)*s, pyv+(p[0]-pxv)*s+(p[1]-pyv)*c]; };
}
function mTr(dx,dy){ return function(p){ return [p[0]+dx, p[1]+dy]; }; }
function comp(f,g){ return function(p){ return f(g(p)); }; }

/* ---------- sketch renderer ---------- */
function drawPts(st,T,alpha,drawF,bf){
  const pts=st.p; if(pts.length<2) return;
  const jit=0.9+st.w*0.7;
  for(let pass=0;pass<2;pass++){
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){
      const c=(i/3)|0;
      const dx=(h2(st.id*31+pass*7,c,bf)-.5)*jit*1.5;
      const dy=(h2(st.id*31+pass*7+53,c,bf)-.5)*jit*1.5;
      const q=T(pts[i]);
      if(i) ctx.lineTo(q[0]+dx,q[1]+dy); else ctx.moveTo(q[0]+dx,q[1]+dy);
    }
    ctx.strokeStyle=st.col;
    ctx.lineWidth=st.w*(pass?0.8:1);
    ctx.globalAlpha=alpha*(pass?0.45:1);
    ctx.setLineDash(drawF<1?[Math.max(0.01,st.total*drawF),10000]:[]);
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.stroke();
  }
  ctx.setLineDash([]); ctx.globalAlpha=1;
}
function drawRaw(pts,col,w,alpha,bf,id){
  for(let pass=0;pass<2;pass++){
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){
      const c=(i/3)|0;
      const dx=(h2(id*31+pass*7,c,bf)-.5)*1.6, dy=(h2(id*31+pass*7+53,c,bf)-.5)*1.6;
      if(i) ctx.lineTo(pts[i][0]+dx,pts[i][1]+dy); else ctx.moveTo(pts[i][0]+dx,pts[i][1]+dy);
    }
    ctx.strokeStyle=col; ctx.lineWidth=w;
    ctx.globalAlpha=alpha*(pass?0.4:1);
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.stroke();
  }
  ctx.globalAlpha=1;
}
function fillPaper(T){
  ctx.beginPath();
  const q0=T(paperEdges[0][0]); ctx.moveTo(q0[0],q0[1]);
  for(const e of paperEdges) for(let i=0;i<e.length;i++){
    const q=T(e[i]); ctx.lineTo(q[0],q[1]);
  }
  ctx.closePath();
  ctx.globalAlpha=.9; ctx.fillStyle=SHEET; ctx.fill(); ctx.globalAlpha=1;
}

/* ---------- motes of graphite dust ---------- */
const motes=[];
function newMote(any){
  return {x:Math.random()*400, y:any?Math.random()*600:612,
    vy:5+Math.random()*9, ph:Math.random()*7,
    sz:0.6+Math.random()*1.4, a:0.06+Math.random()*0.28,
    red:Math.random()<0.14};
}
for(let i=0;i<42;i++) motes.push(newMote(true));

/* ---------- main loop ---------- */
let t=0, last=performance.now(), lastSigh=2;
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000); last=now; t+=dt;
  const bf=Math.floor(t*7.5);

  const bobY=7*Math.sin(t*1.05), bobX=3*Math.sin(t*0.7+1), rotB=0.035*Math.sin(t*0.9);
  const body=comp(mTr(bobX,bobY), mRot(200,310,rotB));
  const headA=-0.02+0.07*Math.sin(t*0.4)+0.04*Math.sin(t*0.13);
  const head=comp(body, mRot(196,236,headA));
  const wingL=comp(body, mRot(183,247,-0.18+0.16*Math.sin(t*1.9)));
  const wingR=comp(body, mRot(211,247, 0.18-0.16*Math.sin(t*1.9+0.9)));
  const paper=comp(mTr(2.5*Math.sin(t*0.97), 5*Math.sin(t*1.26)), mRot(310,356,-0.05+0.05*Math.sin(t*0.7)));
  const u8=(t/8)%1;
  const bell=(u8>0.5&&u8<0.85)?Math.sin(Math.PI*(u8-0.5)/0.35):0;
  const pen=comp(mTr(1.5*Math.sin(t*2.0)-8*bell, 4*Math.sin(t*2.4)+74*bell),
                 mRot(311,252,0.12*Math.sin(t*1.5)+0.3*bell));
  const M={I:function(p){return p;},FS:function(p){return p;},PS:function(p){return p;},
           B:body,H:head,WL:wingL,WR:wingR,P:paper,K:pen,V:function(p){return p;}};

  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=grain; ctx.fillRect(0,0,W,H);

  for(const st of strokes){
    let alpha=st.a, drawF=1;
    if(st.cyc){
      const u=((t/st.cyc[0])+st.cyc[1])%1;
      if(u<0.35) drawF=u/0.35;
      else if(u>=0.68) alpha*=1-(u-0.68)/0.32;
    }
    if(st.g==='FS') alpha*=(0.75+0.06*bobY);
    if(st.fill==='paper'){ fillPaper(M.P); continue; }
    drawPts(st, M[st.g], alpha, drawF, bf);
  }

  /* red thread, untied at the far end */
  const A=M.B([267,277]);
  const B=M.P([272,314]);
  const mx=(A[0]+B[0])/2+3*Math.sin(t*0.6);
  const my=(A[1]+B[1])/2+20+3*Math.sin(t*0.45+2);
  const pts=catmull([A,[A[0]+(mx-A[0])*0.35,A[1]+(my-A[1])*0.35],mx,
                     [mx+(B[0]-mx)*0.35,my+(B[1]-my)*0.35],B],7);
  drawRaw(pts,RED,1.2,0.8,bf,9001);
  const sw=2.5*Math.sin(t*0.8);
  const curl=catmull([B,[B[0]+7+sw,B[1]+9],[B[0]+15+sw*1.5,B[1]+4],[B[0]+10+sw,B[1]-5]],6);
  drawRaw(curl,RED,1.1,0.6,bf,9002);

  /* a small sigh of dust now and then */
  if(t-lastSigh>9){
    lastSigh=t;
    const mp=M.H([196,229]);
    for(let k=0;k<3&&motes.length<60;k++){
      motes.push({x:mp[0]+k*3-3,y:mp[1]+2,vy:9+Math.random()*5,ph:Math.random()*7,
                  sz:0.8+Math.random(),a:0.24,red:false});
    }
  }
  for(const m of motes){
    m.y-=m.vy*dt; m.x+=8*Math.sin(t*0.6+m.ph)*dt;
    if(m.y<-8) Object.assign(m,newMote(false));
    const tw=0.55+0.45*Math.sin(t*1.8+m.ph*3);
    ctx.globalAlpha=m.a*tw; ctx.fillStyle=m.red?RED:INK;
    ctx.beginPath(); ctx.arc(m.x,m.y,m.sz,0,6.283); ctx.fill();
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
  "title": "The Fairy of Unfinished Things",
  "statement": "What you never finished still waits, patient, keeping a place for you."
}
```