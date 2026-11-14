```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;height:100%;overflow:hidden;background:transparent;}
canvas{display:block;width:100vw;height:100vh;touch-action:pan-y;}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
const cv=document.getElementById('c');
const ctx=cv.getContext('2d');
let W=1,H=1,S=1,dpr=1;

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  S=Math.min(W,H*0.75);
}
window.addEventListener('resize',resize);
resize();

const frac=x=>x-Math.floor(x);
function sm(a,b,x){
  let k=(x-a)/(b-a);
  k=k<0?0:(k>1?1:k);
  return k*k*(3-2*k);
}

const pebbles=[];
for(let i=0;i<46;i++){
  pebbles.push({x:frac(i*0.6180339),y:0.015+frac(i*0.3819)*0.1,r:0.006+frac(i*0.77)*0.013,
    l:0.25+frac(i*0.13)*0.2});
}

const motes=[];
for(let j=0;j<26;j++){
  motes.push({
    rx:0.16+0.22*frac(j*0.618),
    ryk:0.25+0.2*frac(j*0.37),
    spd:0.25+0.35*frac(j*0.73),
    dir:(j%2)?1:-1,
    ph:j*2.399,
    hue:(160+j*11)%360,
    sz:0.006+0.004*frac(j*0.5),
    at:0.4+j*0.02,
    rise:0.5+j*0.02
  });
}

// growth cycle: grow, bloom and hold, then wilt back to a seed and begin again
const P=92, GT=58;
function growthAt(t){
  const ph=t%P;
  if(ph<GT){const x=ph/GT;return x*x*(3-2*x);}
  if(ph<P-12)return 1;
  return 1-sm(P-12,P,ph);
}

let px=0,pxT=0;
window.addEventListener('pointermove',e=>{pxT=(e.clientX/W-0.5)*2;},{passive:true});

function drawSoil(groundY){
  ctx.beginPath();
  ctx.moveTo(0,H);
  ctx.lineTo(0,groundY+H*0.02);
  ctx.quadraticCurveTo(W*0.5,groundY-H*0.03,W,groundY+H*0.02);
  ctx.lineTo(W,H);
  ctx.closePath();
  ctx.fillStyle='#3a2a20';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0,groundY+H*0.02);
  ctx.quadraticCurveTo(W*0.5,groundY-H*0.03,W,groundY+H*0.02);
  ctx.strokeStyle='rgba(255,220,180,0.10)';
  ctx.lineWidth=1.5;
  ctx.stroke();
  for(const p of pebbles){
    const x=p.x*W, y=groundY+p.y*H+H*0.02;
    ctx.beginPath();
    ctx.ellipse(x,y,S*p.r,S*p.r*0.6,0,0,Math.PI*2);
    ctx.fillStyle=`rgba(${Math.round(90*p.l+60)},${Math.round(75*p.l+50)},${Math.round(62*p.l+45)},0.9)`;
    ctx.fill();
  }
}

function draw(t){
  ctx.clearRect(0,0,W,H);
  px+=(pxT-px)*0.03;
  const g=growthAt(t);
  const groundY=H*0.9, cx=W*0.5;

  // soft light pooling around the plant
  if(g>0.05){
    const gr=ctx.createRadialGradient(cx,H*0.55,0,cx,H*0.55,S*0.65);
    gr.addColorStop(0,`rgba(120,255,210,${0.10*g})`);
    gr.addColorStop(1,'rgba(120,255,210,0)');
    ctx.fillStyle=gr;
    ctx.fillRect(0,0,W,H);
  }

  drawSoil(groundY);

  // seed, fades as the sprout emerges
  const seedA=1-sm(0.04,0.2,g);
  if(seedA>0.01){
    ctx.beginPath();
    ctx.ellipse(cx,groundY-S*0.008,S*0.018,S*0.012,0.2,0,Math.PI*2);
    ctx.fillStyle=`rgba(201,164,106,${seedA})`;
    ctx.fill();
  }

  const stemG=sm(0.02,0.5,g);
  const L=H*0.55*stemG+S*0.02;
  const sway=s=>Math.sin(t*0.7+s*2.2)*S*0.03*s*s+px*S*0.08*s*s;
  const pt=s=>[cx+S*0.06*s*s+sway(s), groundY-s*L];

  // stem
  const n=36;
  ctx.lineCap='round';
  for(let i=0;i<n;i++){
    const s0=i/n,s1=(i+1)/n;
    const a=pt(s0),b=pt(s1);
    ctx.beginPath();
    ctx.moveTo(a[0],a[1]);
    ctx.lineTo(b[0],b[1]);
    ctx.lineWidth=S*0.02*(1-0.55*s0)+0.8;
    ctx.strokeStyle=`hsl(${150-20*s0},55%,${40+12*s0}%)`;
    ctx.stroke();
  }

  // fronds that unfurl up the stem
  for(let i=0;i<6;i++){
    const s=0.18+0.12*i;
    const lg=sm(0.2+0.06*i,0.45+0.06*i,g);
    if(lg<=0.001)continue;
    const at=pt(s);
    const side=(i%2===0)?-1:1;
    const a=-Math.PI/2+side*(0.75+0.12*(i%3))+Math.sin(t*0.9+i*1.7)*0.06;
    const len=S*(0.24-0.018*i)*lg;
    const dx=Math.cos(a),dy=Math.sin(a);
    const ax=at[0],ay=at[1];
    const tipX=ax+dx*len, tipY=ay+dy*len+len*0.22*lg;
    const midX=ax+dx*len*0.5, midY=ay+dy*len*0.5+len*0.05;
    const px_=-dy,py_=dx,w=len*0.2;
    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.quadraticCurveTo(midX+px_*w,midY+py_*w,tipX,tipY);
    ctx.quadraticCurveTo(midX-px_*w,midY-py_*w,ax,ay);
    ctx.fillStyle=`hsl(${140+i*8},60%,${38+i*2}%)`;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.quadraticCurveTo(midX,midY,tipX,tipY);
    ctx.strokeStyle='rgba(220,255,240,0.18)';
    ctx.lineWidth=1;
    ctx.stroke();
  }

  // bell-flowers hanging from the crown
  const top=pt(1);
  ctx.globalCompositeOperation='lighter';
  const bells=[];
  for(let i=0;i<5;i++){
    const b=sm(0.5+i*0.03,0.8+i*0.02,g);
    if(b<=0.001)continue;
    const openAmt=sm(0.85,1.0,g)*(0.75+0.25*Math.sin(t*1.3+i*1.1));
    const o=0.35*b+0.65*openAmt;
    const hue=[280,190,45,320,160][i];
    const ang=Math.PI/2+(i-2)*0.42;
    const len=S*(0.14+0.03*((i*5)%3))*b;
    const bx=top[0]+Math.cos(ang)*len+Math.sin(t*1.2+i)*S*0.005;
    const by=top[1]+Math.sin(ang)*len;
    const pulse=0.5+0.5*Math.sin(t*5.6+i*1.3);
    const r=S*0.045*b*(1+0.04*Math.sin(t*9+i));
    bells.push({bx,by,r,o,hue,b,pulse});
    // halo
    if(b>0.05){
      const hg=ctx.createRadialGradient(bx,by,0,bx,by,r*3.6);
      hg.addColorStop(0,`hsla(${hue},100%,65%,${0.22*b*(0.6+0.4*pulse)})`);
      hg.addColorStop(1,`hsla(${hue},100%,60%,0)`);
      ctx.fillStyle=hg;
      ctx.beginPath();
      ctx.arc(bx,by,r*3.6,0,Math.PI*2);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation='source-over';

  for(let i=0;i<bells.length;i++){
    const B=bells[i];
    const {bx,by,r,o,hue,b}=B;
    // stalk
    const midX=(top[0]+bx)/2, midY=(top[1]+by)/2;
    ctx.beginPath();
    ctx.moveTo(top[0],top[1]);
    ctx.quadraticCurveTo(midX-S*0.02,midY,bx,by-r*0.8);
    ctx.strokeStyle='rgba(120,220,170,0.85)';
    ctx.lineWidth=Math.max(1,S*0.006);
    ctx.stroke();
    // hum rings
    if(o>0.5){
      for(let k=0;k<2;k++){
        const ph=frac(t*0.6+k*0.5+i*0.13);
        const rad=r*(1+ph*4);
        ctx.beginPath();
        ctx.arc(bx,by,rad,0,Math.PI*2);
        ctx.strokeStyle=`hsla(${hue},100%,75%,${(1-ph)*0.25*o})`;
        ctx.lineWidth=1;
        ctx.stroke();
      }
    }
    // bell body (mouth facing down)
    const rw=r*(0.55+0.45*o);
    ctx.beginPath();
    ctx.moveTo(bx-r*0.35,by-r*0.9);
    ctx.quadraticCurveTo(bx-rw*0.95,by-r*0.2,bx-rw,by+r*0.7);
    ctx.quadraticCurveTo(bx,by+r*0.7+r*0.35*o,bx+rw,by+r*0.7);
    ctx.quadraticCurveTo(bx+rw*0.95,by-r*0.2,bx+r*0.35,by-r*0.9);
    ctx.quadraticCurveTo(bx,by-r*1.1,bx-r*0.35,by-r*0.9);
    ctx.closePath();
    const bg=ctx.createRadialGradient(bx,by-r*0.3,r*0.1,bx,by,r*1.2);
    bg.addColorStop(0,`hsla(${hue},90%,82%,0.95)`);
    bg.addColorStop(1,`hsla(${hue},80%,45%,0.92)`);
    ctx.fillStyle=bg;
    ctx.fill();
    // stamen
    ctx.beginPath();
    ctx.arc(bx,by+r*0.1,Math.max(1,r*0.12),0,Math.PI*2);
    ctx.fillStyle=`rgba(255,250,220,${0.6+0.4*B.pulse})`;
    ctx.fill();
  }

  // motes orbiting the crown like tiny moons
  ctx.globalCompositeOperation='lighter';
  const cy=top[1]-S*0.01;
  for(let j=0;j<motes.length;j++){
    const m=motes[j];
    const ap=sm(m.at,m.at+0.1,g);
    if(ap<0.01)continue;
    const ang=m.ph+m.dir*t*m.spd;
    const rx=S*m.rx, ry=rx*m.ryk;
    const x=cx+rx*Math.cos(ang), y=cy+ry*Math.sin(ang)-S*0.05*sm(m.rise,m.rise+0.1,g);
    const z=Math.sin(ang);
    const size=S*m.sz*ap;
    const gl=ctx.createRadialGradient(x,y,0,x,y,size*3.5);
    gl.addColorStop(0,`hsla(${m.hue},100%,70%,${0.22*ap})`);
    gl.addColorStop(1,`hsla(${m.hue},100%,60%,0)`);
    ctx.fillStyle=gl;
    ctx.beginPath();
    ctx.arc(x,y,size*3.5,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x,y,size,0,Math.PI*2);
    ctx.fillStyle=`rgba(240,255,250,${ap*(0.45+0.4*(z+1)/2)})`;
    ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
}

const t0=performance.now();
function frame(now){
  draw((now-t0)/1000);
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
  "title": "Solar Sway Shimmerbell",
  "statement": "A sun-sipping sprout that unfurls its petal-leaves and hums through five bell-flowers, whose chimes ripple out as rings of light. Tiny glowing motes orbit its crown like moons, and every minute or so it wilts back to a seed and begins again."
}
```