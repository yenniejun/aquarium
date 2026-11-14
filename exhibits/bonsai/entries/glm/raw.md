```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html,body{margin:0;padding:0;width:100%;height:100%;background:transparent;overflow:hidden}
  svg{display:block;width:100vmin;height:100vmin;margin:0 auto}
</style>
</head>
<body>
<svg id="t" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="trunkG" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#553c2c"/>
      <stop offset="1" stop-color="#71563f"/>
    </linearGradient>
  </defs>
</svg>
<script>
(function(){
const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('t');
function E(n,a,p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}

const sway=[];      // rotating parts
const padCenters=[]; // for drifting needles

/* ---------- pot ----------
   Shallow unglazed brown pot; its feet rest exactly on the page bottom. */
const pot=E('g',{},svg);
E('rect',{x:396,y:988,width:52,height:12,rx:4,fill:'#442b1b'},pot);
E('rect',{x:552,y:988,width:52,height:12,rx:4,fill:'#442b1b'},pot);
E('path',{d:'M344,894 L656,894 L630,986 Q500,1000 370,986 Z',fill:'#6b4430'},pot);
E('path',{d:'M344,894 L656,894 L647,918 L353,918 Z',fill:'rgba(0,0,0,0.14)'},pot);
E('rect',{x:326,y:864,width:348,height:27,rx:11,fill:'#7c5138'},pot);
E('rect',{x:330,y:866,width:340,height:7,rx:3.5,fill:'#8d5f42'},pot);
E('ellipse',{cx:500,cy:880,rx:143,ry:9,fill:'#241a12'},pot);
E('path',{d:'M360,884 Q500,905 640,884 Q500,895 360,884 Z',fill:'#3c281a'},pot);

/* moss and one stone */
const mossCols=['#4a6b33','#5a7a3d','#3e5c2a'];
[[418,875,15,5],[468,872,11,4],[560,873,17,6],[612,876,12,4],[532,876,9,3]].forEach(m=>{
  E('ellipse',{cx:m[0],cy:m[1],rx:m[2],ry:m[3],fill:mossCols[(Math.random()*3)|0],opacity:0.95},pot);
});
E('polygon',{points:'372,877 381,850 410,841 439,851 448,877',fill:'#938e84'},pot);
E('path',{d:'M381,850 L410,841 L439,851',stroke:'#b0aaa0','stroke-width':3,fill:'none','stroke-linecap':'round'},pot);
E('circle',{cx:404,cy:860,r:2,fill:'#6f6a60'},pot);
E('circle',{cx:424,cy:866,r:1.6,fill:'#6f6a60'},pot);

/* ---------- helpers ---------- */
function grow(x,y,a0,a1,len,steps){
  const pts=[],sl=len/steps;
  for(let i=0;i<=steps;i++){
    const t=i/steps,a=a0+(a1-a0)*Math.pow(t,0.85);
    pts.push({x,y,a}); x+=sl*Math.sin(a); y-=sl*Math.cos(a);
  }
  return pts;
}
function taper(sp,wf){
  const L=[],R=[],n=sp.length-1;
  for(let i=0;i<=n;i++){
    const p=sp[i],w=wf(i/n),px=Math.cos(p.a),py=Math.sin(p.a);
    L.push([p.x+px*w/2,p.y+py*w/2]);R.push([p.x-px*w/2,p.y-py*w/2]);
  }
  return 'M'+L.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L')
       +' L'+R.reverse().map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L')+' Z';
}
function addSway(e,cx,cy,amp,sp,ph){sway.push({e,cx,cy,amp,sp,ph});}

/* foliage pad: a flattened wind-combed cluster of needles */
const mainCols=['#4d7d60','#41705a','#5c8f6f','#3a6350'];
const backCols=['#31543f','#28483a','#3a6350'];
function pad(parent,cx,cy,R,cols){
  const g=E('g',{},parent);
  const ang=-0.22, n=Math.round(R*1.15);
  for(let i=0;i<n;i++){
    const u=(Math.random()*2-1)*R;
    const v=(Math.random()*2-1)*R*0.30*Math.sqrt(Math.max(0,1-(u/R)*(u/R)));
    const x=cx+u*Math.cos(ang)-v*Math.sin(ang);
    const y=cy+u*Math.sin(ang)+v*Math.cos(ang);
    const na=ang+(Math.random()-0.5)*0.8, l=6+Math.random()*6;
    E('line',{x1:x.toFixed(1),y1:y.toFixed(1),
              x2:(x+Math.cos(na)*l).toFixed(1),y2:(y+Math.sin(na)*l).toFixed(1),
              stroke:cols[(Math.random()*cols.length)|0],
              'stroke-width':2.1,'stroke-linecap':'round'},g);
  }
  addSway(g,cx,cy,1.7+Math.random(),2.2+Math.random()*1.4,Math.random()*6.28);
  padCenters.push({x:cx,y:cy});
  return g;
}

/* ---------- tree ---------- */
const gTree=E('g',{},svg);
addSway(gTree,500,880,0.55,0.55,0);

const spine=grow(500,880,-0.15,0.75,560,24);
const pt=s=>spine[Math.round(s*24)];

/* trunk: tapered, flared at the root, with a pale shari streak */
E('ellipse',{cx:492,cy:882,rx:42,ry:5,fill:'rgba(0,0,0,0.25)'},gTree);
E('path',{d:taper(spine,s=>{let w=30*Math.pow(1-s,1.15)+4;if(s<0.06)w+=9*(1-s/0.06);return w;}),
          fill:'url(#trunkG)'},gTree);
(function shari(){
  let d='M';
  for(let i=4;i<=15;i++){
    const p=spine[i],w=(30*Math.pow(1-i/24,1.15)+4)/2-2;
    d+=((p.x+Math.cos(p.a)*w).toFixed(1))+','+((p.y+Math.sin(p.a)*w).toFixed(1))+' L';
  }
  E('path',{d:d.slice(0,-1),stroke:'#cfc7b0','stroke-width':2.6,fill:'none',
            opacity:0.75,'stroke-linecap':'round'},gTree);
})();

/* a bleached jin — the stub of a branch the wind took long ago */
(function jin(){
  const p=pt(0.42), j=grow(p.x+2,p.y,0.1,-1.6,75,9);
  E('path',{d:taper(j,t=>4*(1-t)+0.8),fill:'#d8d2bd'},gTree);
  E('path',{d:'M'+j[2].x+','+j[2].y+' L'+j[7].x+','+j[7].y,stroke:'#a49d87',
            'stroke-width':1.2,fill:'none'},gTree);
})();

/* a stubborn little branch against the wind */
(function leftBranch(){
  const p=pt(0.26), b=grow(p.x-2,p.y,p.a+0.05,-1.2,60,7);
  const g=E('g',{},gTree);
  addSway(g,p.x,p.y,2.2,0.9,2.5);
  E('path',{d:taper(b,t=>3.2*(1-t)+1),fill:'#6a4c39'},g);
  pad(g,b[b.length-1].x,b[b.length-1].y-4,24,mainCols);
})();

/* wind-swept branches, all leaning downwind */
const specs=[{s:0.18,len:180},{s:0.32,len:160},{s:0.46,len:135},{s:0.60,len:110},{s:0.74,len:90},{s:0.87,len:68}];
specs.forEach((sp,bi)=>{
  const p=pt(sp.s), a0=p.a+0.12, a1=Math.min(p.a+1.05,1.3);
  const br=grow(p.x,p.y,a0,a1,sp.len,11);
  const g=E('g',{},gTree);
  addSway(g,p.x,p.y,1.4+Math.random()*0.8,0.7+Math.random()*0.35,Math.random()*6.28);
  const bw=5.5*(1-sp.s)+2;
  E('path',{d:taper(br,t=>bw*(1-t)+1.5),fill:'#6a4c39'},g);
  const tip=br[br.length-1];
  /* dark pad behind for depth */
  pad(g,tip.x-10,tip.y-14,sp.len*0.24,backCols);
  /* two sub-branches with small pads */
  [0.45,0.72].forEach((t,k)=>{
    const q=br[Math.round(t*11)], na=q.a+0.4;
    const ex=q.x+Math.sin(na)*34, ey=q.y-Math.cos(na)*34;
    E('line',{x1:q.x,y1:q.y,x2:ex,y2:ey,stroke:'#6a4c39','stroke-width':2.4,'stroke-linecap':'round'},g);
    pad(g,ex,ey,18+8*(1-sp.s),mainCols);
  });
  pad(g,tip.x,tip.y,sp.len*0.3+18,mainCols);
});
/* apex pad */
(function apex(){
  const p=spine[24];
  pad(gTree,p.x,p.y-4,32,mainCols);
})();

/* ---------- drifting needles ---------- */
const gP=E('g',{},svg);
const parts=[];let lastSpawn=0;
function spawn(){
  const c=padCenters[(Math.random()*padCenters.length)|0];
  const l=E('line',{x1:c.x,y1:c.y,x2:c.x+7,y2:c.y+3,stroke:'#5c8f6f',
                    'stroke-width':2,'stroke-linecap':'round'},gP);
  parts.push({l,x:c.x,y:c.y,vx:0.8+Math.random()*0.7,vy:0.35+Math.random()*0.3,
              ph:Math.random()*6.28,life:0,max:240+Math.random()*140});
}

/* ---------- animation ---------- */
let gust=0,lastX=null;
addEventListener('pointermove',e=>{
  if(lastX!==null)gust=Math.min(2.5,gust+Math.abs(e.clientX-lastX)*0.012);
  lastX=e.clientX;
},{passive:true});

function frame(ts){
  const t=ts/1000;
  gust*=0.96;
  const w=1+gust*0.9;
  for(const s of sway){
    const a=s.amp*Math.sin(t*s.sp+s.ph)*(0.55+0.5*w);
    s.e.setAttribute('transform','rotate('+a.toFixed(3)+' '+s.cx+' '+s.cy+')');
  }
  if(ts-lastSpawn>2400+Math.random()*1400){spawn();lastSpawn=ts;}
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    p.x+=p.vx*(0.5+w*0.6); p.y+=p.vy+Math.sin(t*2+p.ph)*0.45; p.life++;
    p.l.setAttribute('x1',p.x.toFixed(1));p.l.setAttribute('y1',p.y.toFixed(1));
    p.l.setAttribute('x2',(p.x+7).toFixed(1));p.l.setAttribute('y2',(p.y+3).toFixed(1));
    p.l.setAttribute('opacity',Math.max(0,1-p.life/p.max).toFixed(2));
    if(p.life>p.max||p.y>940){p.l.remove();parts.splice(i,1);}
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
  "title": "Storm-Swept Salt Juniper",
  "statement": "A tree shaped entirely by a wind it has never once obeyed: every branch combed downwind, one bleached jin marking a limb lost to some old gale. It lives in a plain unglazed pot because the story is all in the bend, and it sheds the occasional needle just to prove it's still growing."
}
```