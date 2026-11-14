Here's my piece — a small maple in a celadon pot that sways, slowly turns with the seasons, and lets a leaf go every few seconds:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bonsai</title>
<style>
html,body{height:100%;margin:0;padding:0;background:transparent}
body{display:grid;place-items:center;overflow:hidden}
svg{display:block;width:min(100vw,100vh);height:min(100vw,100vh)}
</style>
</head>
<body>
<svg id="scene" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A small maple bonsai in a celadon pot shedding leaves in a breeze">
<defs>
  <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#7e6b59"/><stop offset="0.5" stop-color="#57463a"/><stop offset="1" stop-color="#362b23"/>
  </linearGradient>
  <linearGradient id="potBody" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d9eae2"/><stop offset="0.55" stop-color="#b3cfc4"/><stop offset="1" stop-color="#8db1a3"/>
  </linearGradient>
  <linearGradient id="potRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#e7f2ed"/><stop offset="1" stop-color="#bad4c9"/>
  </linearGradient>
  <radialGradient id="soil" cx="0.5" cy="0.4" r="0.75">
    <stop offset="0" stop-color="#4d3c2d"/><stop offset="1" stop-color="#2d231a"/>
  </radialGradient>
  <radialGradient id="padShade">
    <stop id="ps0" offset="0" stop-color="#2c4628" stop-opacity="0.5"/>
    <stop id="ps1" offset="0.62" stop-color="#3a5a30" stop-opacity="0.26"/>
    <stop offset="1" stop-color="#3a5a30" stop-opacity="0"/>
  </radialGradient>
  <g id="leaf">
    <path d="M0,-11 L2.7,-4.6 L7.8,-8.2 L6.4,-2.3 L11.8,-1.2 L6.6,2.4 L8.8,7.8 L2.9,5.8 L0,11.8 L-2.9,5.8 L-8.8,7.8 L-6.6,2.4 L-11.8,-1.2 L-6.4,-2.3 L-7.8,-8.2 L-2.7,-4.6 Z" fill="currentColor"/>
    <path d="M0,-9 L0,9.5" stroke="#1c2a14" stroke-width="0.9" opacity="0.25" fill="none"/>
    <path d="M0,9.5 L0,14.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9"/>
  </g>
</defs>

<g id="pot">
  <path d="M335,890 C332,922 340,957 353,977 Q363,998.8 388,998.8 L612,998.8 Q637,998.8 647,977 C660,957 668,922 665,890 Z"
        fill="url(#potBody)" stroke="#54736a" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M352,908 C350,934 357,962 368,976" stroke="#ffffff" stroke-opacity="0.32" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M648,912 C650,936 644,962 633,975" stroke="#3f5a50" stroke-opacity="0.16" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="500" cy="943" r="24" fill="none" stroke="#4c6a60" stroke-width="3.4" stroke-opacity="0.38"
          stroke-linecap="round" stroke-dasharray="126 25" transform="rotate(-70 500 943)"/>
  <rect x="318" y="850" width="364" height="46" rx="13" fill="url(#potRim)" stroke="#54736a" stroke-width="2.6"/>
  <rect x="328" y="855" width="344" height="9" rx="4.5" fill="#ffffff" opacity="0.28"/>
  <ellipse cx="500" cy="859" rx="150" ry="11" fill="url(#soil)"/>
  <g fill="#5c7c46">
    <ellipse cx="452" cy="863" rx="30" ry="9"/>
    <ellipse cx="548" cy="865" rx="27" ry="8" fill="#55763f"/>
    <ellipse cx="478" cy="867" rx="22" ry="7" fill="#648650"/>
    <ellipse cx="524" cy="860" rx="18" ry="6" fill="#6f9057"/>
    <ellipse cx="428" cy="859" rx="14" ry="5"/>
    <ellipse cx="572" cy="861" rx="13" ry="5" fill="#648650"/>
  </g>
  <g fill="#7fa05f" opacity="0.85">
    <ellipse cx="455" cy="861" rx="16" ry="5"/>
    <ellipse cx="546" cy="863" rx="14" ry="4"/>
    <ellipse cx="480" cy="865" rx="10" ry="3.5"/>
  </g>
  <ellipse cx="416" cy="861" rx="25" ry="13" fill="#a9aeb2" stroke="#767c80" stroke-width="1.6"/>
  <path d="M400,856 Q416,849 432,856" stroke="#eef2f4" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round"/>
  <ellipse cx="592" cy="864" rx="16" ry="9" fill="#9ba1a6" stroke="#71777b" stroke-width="1.4"/>
  <path d="M583,860 Q592,856 601,860" stroke="#e8ecef" stroke-width="2.4" fill="none" opacity="0.7" stroke-linecap="round"/>
  <use id="fall1" href="#leaf" transform="translate(445 868) rotate(72) scale(0.95)" style="color:#c96a38"/>
  <use id="fall2" href="#leaf" transform="translate(560 870) rotate(-115) scale(0.8)" style="color:#d8a03c"/>
</g>

<g id="fit"><g id="tree">
  <g id="wood"></g>
  <g id="pads"></g>
  <g id="drift"></g>
</g></g>
</svg>

<script>
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
function $(id){return document.getElementById(id);}
var wood=$("wood"),padsG=$("pads"),driftG=$("drift"),fit=$("fit"),treeG=$("tree");
function el(n,attrs,parent){var e=document.createElementNS(NS,n);for(var k in attrs){e.setAttribute(k,attrs[k]);}if(parent)parent.appendChild(e);return e;}
var seed=987654321;
function rand(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
var TAU=Math.PI*2,UP=-Math.PI/2,MAXD=7,BIAS=0.085;
var pads=[],leaves=[],pts=[];

function addPad(x,y,r,depth){
  var g=el("g",{},padsG);
  g.setAttribute("transform","translate("+x.toFixed(1)+" "+y.toFixed(1)+")");
  el("ellipse",{cx:0,cy:0,rx:(r*1.1).toFixed(1),ry:(r*0.88).toFixed(1),fill:"url(#padShade)"},g);
  var n=Math.round(r*0.5)+5,i;
  for(i=0;i<n;i++){
    var a=rand()*TAU,rad=Math.sqrt(rand())*r;
    var lx=Math.cos(a)*rad,ly=Math.sin(a)*rad*0.85;
    var s=(0.6+0.55*(rad/r))*(0.85+rand()*0.3);
    var u=el("use",{href:"#leaf",transform:"translate("+lx.toFixed(1)+" "+ly.toFixed(1)+") rotate("+(rand()*360).toFixed(0)+") scale("+s.toFixed(2)+")"},g);
    u.style.color="#7a9a5a";
    leaves.push({el:u,turn:rand()});
  }
  pads.push({el:g,x:x,y:y,r:r,phase:rand()*TAU,amp:0.9+(MAXD-depth)*0.75+rand()*0.9,speed:0.55+rand()*0.75});
  pts.push({x:x,y:y,r:r*1.05});
}

function branch(x,y,ang,len,w,depth,noPad){
  var seg=7,
      mx=x+Math.cos(ang)*len*0.5+(rand()-0.5)*len*0.4,
      my=y+Math.sin(ang)*len*0.5+(rand()-0.5)*len*0.3,
      ex=x+Math.cos(ang)*len+(rand()-0.5)*len*0.35,
      ey=y+Math.sin(ang)*len+(rand()-0.5)*len*0.3;
  var L=[],R=[],i,t,a,b,c,px,py,tx,ty,tl,nx,ny,hw;
  for(i=0;i<=seg;i++){
    t=i/seg;a=(1-t)*(1-t);b=2*(1-t)*t;c=t*t;
    px=a*x+b*mx+c*ex;py=a*y+b*my+c*ey;
    tx=2*(1-t)*(mx-x)+2*t*(ex-mx);ty=2*(1-t)*(my-y)+2*t*(ey-my);
    tl=Math.sqrt(tx*tx+ty*ty)||1;nx=-ty/tl;ny=tx/tl;
    hw=w*(1-0.42*t)/2;
    L.push((px+nx*hw).toFixed(1)+","+(py+ny*hw).toFixed(1));
    R.push((px-nx*hw).toFixed(1)+","+(py-ny*hw).toFixed(1));
  }
  var d="M"+L.join("L")+"L"+R.reverse().join("L")+"Z";
  el("path",{d:d,fill:"url(#bark)",stroke:"url(#bark)","stroke-width":"1.6","stroke-linejoin":"round"},wood);
  if(depth<=2&&w>9){
    el("path",{d:"M"+x.toFixed(1)+","+y.toFixed(1)+" Q"+mx.toFixed(1)+","+my.toFixed(1)+" "+ex.toFixed(1)+","+ey.toFixed(1),
      fill:"none",stroke:"#2b221b","stroke-width":Math.max(1,w*0.05).toFixed(2),opacity:"0.3"},wood);
  }
  pts.push({x:ex,y:ey,r:w*0.6+2});
  var endW=w*(1-0.42);
  if(depth>=MAXD||len<30||(!noPad&&pads.length>=22)){
    if(!noPad)addPad(ex,ey,Math.max(24,Math.min(64,endW*3.1)),depth);
    return;
  }
  var n=depth<2?(rand()<0.65?2:3):(depth<4?2:1);
  for(i=0;i<n;i++){
    var spread=0.42+rand()*0.55;
    var dir=(n===1)?((rand()<0.5?-1:1)*spread*0.6):((i-(n-1)/2)*spread*1.4+(rand()-0.5)*0.2);
    var na=ang+dir+BIAS*(depth/MAXD)+(rand()-0.5)*0.15;
    na=Math.max(-Math.PI+0.22,Math.min(-0.22,na));
    branch(ex,ey,na,len*(0.66+rand()*0.15),endW,depth+1,noPad);
  }
}

el("ellipse",{cx:500,cy:864,rx:46,ry:11,fill:"#3a2e24"},wood);
branch(500,866,0.20,30,15,MAXD,true);
branch(500,866,Math.PI-0.20,30,15,MAXD,true);
branch(500,866,UP+0.06,246,47,0,false);

var minX=1e9,maxX=-1e9,minY=1e9,i,p;
for(i=0;i<pts.length;i++){p=pts[i];minX=Math.min(minX,p.x-p.r);maxX=Math.max(maxX,p.x+p.r);minY=Math.min(minY,p.y-p.r);}
var bw=maxX-minX,bh=866-minY,cx=(minX+maxX)/2;
var s=Math.min(916/bw,(866-66)/bh,1.15),dx=0;
if(Math.abs(cx-500)>1e-6){s=Math.min(s,90/Math.abs(cx-500));dx=-(cx-500)*s;}
fit.setAttribute("transform","translate("+(500+dx).toFixed(1)+" 866) scale("+s.toFixed(3)+") translate(-500 -866)");

var RM=false;
try{RM=window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
var ptrT=0,ptr=0;
window.addEventListener("pointermove",function(e){ptrT=(e.clientX/window.innerWidth)*2-1;},{passive:true});

var SUM=[[84,120,64],[110,148,70],[140,170,90],[170,190,112]];
var AUT=[[196,84,56],[226,140,50],[240,190,72],[248,214,118]];
function ramp(st,u){
  u=Math.max(0,Math.min(0.9999,u))*(st.length-1);
  var i=Math.floor(u),f=u-i,a=st[i],b=st[i+1];
  return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];
}
function leafColor(u,st){
  var s=ramp(SUM,u),a=ramp(AUT,u);
  return "rgb("+Math.round(s[0]+(a[0]-s[0])*st)+","+Math.round(s[1]+(a[1]-s[1])*st)+","+Math.round(s[2]+(a[2]-s[2])*st)+")";
}
var ps0=$("ps0"),ps1=$("ps1"),fall1=$("fall1"),fall2=$("fall2");
function recolor(st){
  for(var i=0;i<leaves.length;i++){leaves[i].el.style.color=leafColor(leaves[i].turn,st);}
  var c0=ramp([[44,70,40],[122,86,44]],st),c1=ramp([[58,90,48],[152,112,60]],st);
  ps0.setAttribute("stop-color","rgb("+Math.round(c0[0])+","+Math.round(c0[1])+","+Math.round(c0[2])+")");
  ps1.setAttribute("stop-color","rgb("+Math.round(c1[0])+","+Math.round(c1[1])+","+Math.round(c1[2])+")");
  fall1.style.color=leafColor(0.12,st);
  fall2.style.color=leafColor(0.55,st);
}
function wind(t){
  var w=0.55+0.3*Math.sin(t*0.23+1.3)+0.22*Math.sin(t*0.061+0.4)+0.16*Math.sin(t*0.53+0.7);
  return Math.max(0,Math.min(1.3,w));
}

var drift=[],nextSpawn=1.0,lastCol=-9;
var start=performance.now(),last=start;
function frame(now){
  var t=(now-start)/1000,dt=(now-last)/1000;last=now;
  if(dt<=0||dt>0.05)dt=0.016;
  ptr+=(ptrT-ptr)*Math.min(1,dt*2.5);
  var w=wind(t)*(RM?0.45:1);
  var st=0.5+0.38*Math.sin(t*TAU/160+0.8);
  if(t-lastCol>0.4){lastCol=t;recolor(st);}
  var rot=Math.sin(t*0.35+0.5)*0.8*w+ptr*1.6*w;
  treeG.setAttribute("transform","rotate("+rot.toFixed(3)+" 500 866)");
  var i,p,a;
  for(i=0;i<pads.length;i++){p=pads[i];
    a=w*p.amp*Math.sin(t*p.speed+p.phase)+ptr*w*5;
    p.el.setAttribute("transform","translate("+p.x.toFixed(1)+" "+p.y.toFixed(1)+") rotate("+a.toFixed(2)+")");
  }
  nextSpawn-=dt;
  if(nextSpawn<=0&&pads.length&&drift.length<7){
    nextSpawn=(2.2+rand()*3.2)*(RM?2:1)/(0.6+w);
    p=pads[(rand()*pads.length)|0];
    var an=rand()*TAU,rr=Math.sqrt(rand())*p.r*0.9;
    var u=el("use",{href:"#leaf"},driftG);
    u.style.color=leafColor(rand(),st);
    drift.push({el:u,x:p.x+Math.cos(an)*rr,y:p.y+Math.sin(an)*rr*0.85,
      vx:(rand()-0.5)*24,vy:14+rand()*16,rot:rand()*360,vr:(rand()-0.5)*300,seed:rand()*10,s:0.85+rand()*0.3});
  }
  for(i=drift.length-1;i>=0;i--){
    var d=drift[i];
    d.x+=(d.vx+w*30+Math.sin(t*2.3+d.seed)*20)*dt;
    d.y+=d.vy*dt;d.vy+=4*dt;d.rot+=d.vr*dt;
    var op=1;
    if(d.y>770)op=Math.max(0,1-(d.y-770)/180);
    var edge=0;
    if(d.x>930)edge=(d.x-930)/70;
    if(d.x<60)edge=Math.max(edge,(60-d.x)/60);
    op=Math.min(op,Math.max(0,1-edge));
    d.el.setAttribute("transform","translate("+d.x.toFixed(1)+" "+d.y.toFixed(1)+") rotate("+d.rot.toFixed(0)+") scale("+d.s.toFixed(2)+")");
    d.el.setAttribute("opacity",op.toFixed(2));
    if(op<=0||d.y>960){d.el.remove();drift.splice(i,1);}
  }
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
  "title": "Amber Drift Maple",
  "statement": "A young maple in a celadon pot, caught mid-autumn: it sways a little, slowly turns gold, and lets one leaf go at a time, trusting the breeze to catch it."
}
```