```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#03040c;}
  canvas{position:fixed;left:0;top:0;width:100%;height:100%;display:block;touch-action:auto;}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
(function(){
  var cv = document.getElementById('c');
  var ctx = cv.getContext('2d');
  var W=0,H=0,R=100,cx=0,cy=0,dpr=1;

  function resize(){
    dpr = Math.min(window.devicePixelRatio||1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
    R = Math.min(W,H)/2; cx = W/2; cy = H/2;
  }
  window.addEventListener('resize', resize);
  resize();

  // pointer parallax
  var ptx=0,pty=0,px=0,py=0;
  window.addEventListener('pointermove', function(e){
    ptx = (e.clientX/W-0.5)*2; pty = (e.clientY/H-0.5)*2;
  }, {passive:true});

  // glow sprites
  function sprite(r,g,b){
    var s=64, c=document.createElement('canvas'); c.width=c.height=s;
    var x=c.getContext('2d');
    var gr=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    gr.addColorStop(0,'rgba(255,255,255,1)');
    gr.addColorStop(0.15,'rgba('+r+','+g+','+b+',0.75)');
    gr.addColorStop(0.45,'rgba('+r+','+g+','+b+',0.18)');
    gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
    x.fillStyle=gr; x.fillRect(0,0,s,s);
    return c;
  }
  var spW = sprite(190,210,255), spG = sprite(255,205,120), spP = sprite(255,190,225), spC = sprite(170,235,255);

  function rnd(a,b){return a+Math.random()*(b-a);}
  function sm(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}

  // sky
  var pv = {x:0,y:-0.7};
  var bg = [];
  var sprites = [spW,spW,spW,spP,spG,spC];
  for(var i=0;i<900;i++){
    var a=rnd(0,Math.PI*2), d=1.9*Math.sqrt(Math.random());
    var m=Math.pow(Math.random(),3);
    bg.push({x:pv.x+Math.cos(a)*d, y:pv.y+Math.sin(a)*d, r:0.35+m*1.5, ph:rnd(0,6.28), sp:rnd(0.8,3), b:0.35+m*0.65, s:sprites[(Math.random()*sprites.length)|0]});
  }
  // faint milky band
  var band=[];
  for(var i=0;i<700;i++){
    var u=rnd(-2,2), w=(Math.random()+Math.random()+Math.random()-1.5)*0.28;
    var ang=-0.55;
    band.push({x:u*Math.cos(ang)-w*Math.sin(ang)+0.1, y:u*Math.sin(ang)+w*Math.cos(ang)+0.1, r:rnd(0.3,0.9), a:rnd(0.08,0.3), ph:rnd(0,6)});
  }

  // moth constellation
  var TILT=0.18, OFF={x:-0.08,y:0.12};
  var L = [ // local coords, mag, wing flag, wing side, upper
    [0,-0.28,2.4,0],   //0 head
    [0,-0.12,3.0,0],   //1 thorax
    [0,0.08,2.2,0],    //2 abdomen
    [0,0.30,2.0,0],    //3 tail
    [-0.14,-0.52,1.6,0], //4 antL
    [0.14,-0.52,1.9,0],  //5 antR
    [-0.52,-0.34,2.8,1], //6 UL tip
    [-0.50,-0.06,2.0,1], //7 UL low
    [-0.30,0.22,2.4,1],  //8 LL tip
    [0.52,-0.34,2.8,1],  //9 UR tip
    [0.50,-0.06,2.0,1],  //10 UR low
    [0.30,0.22,2.4,1]    //11 LR tip
  ];
  var LANT = {x:0.57,y:-0.52};
  var E = [[3,2],[2,1],[1,0],[0,4],[0,5],[1,6],[6,7],[7,8],[8,2],[1,9],[9,10],[10,11],[11,2]];
  var T0=2.6, ESTEP=0.45, EDUR=0.6;
  var starT=[]; for(var i=0;i<L.length;i++) starT.push(99);
  E.forEach(function(e,i){ var s=T0+i*ESTEP; starT[e[0]]=Math.min(starT[e[0]],s); starT[e[1]]=Math.min(starT[e[1]],s+EDUR*0.9); });
  var REACH0 = 9.0, REACH1=10.8, ALIVE0=10.6, ALIVE1=16.4, FADE0=17.4, FADE1=19.6, LOOP=21;

  var pts=[]; // world positions of moth stars this frame
  var parts=[]; // dust

  // shooting star
  var shoot=null, nextShoot=5;

  function frame(now){
    requestAnimationFrame(frame);
    var t=now/1000;
    var dt=Math.min(0.05, t-(frame.last||t)); frame.last=t;
    var lt = t % LOOP;
    px += (ptx-px)*0.04; py += (pty-py)*0.04;

    var ang = t*0.006, ca=Math.cos(ang), sa=Math.sin(ang);
    function xf(x,y,par){
      var dx=x-pv.x, dy=y-pv.y;
      var rx=dx*ca-dy*sa+pv.x, ry=dx*sa+dy*ca+pv.y;
      return [cx+(rx+px*par)*R, cy+(ry+py*par)*R];
    }

    ctx.setTransform(dpr,0,0,dpr,0,0);
    // backdrop
    var g=ctx.createLinearGradient(0,cy-R,0,cy+R);
    g.addColorStop(0,'#03040f'); g.addColorStop(0.6,'#0a0c26'); g.addColorStop(1,'#1b1238');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

    // nebulae
    ctx.globalCompositeOperation='lighter';
    var nb=[[-0.5,0.55,0.75,'120,70,200',0.13],[0.55,0.35,0.7,'50,150,190',0.09],[-0.1,-0.75,0.6,'200,90,160',0.07]];
    for(var i=0;i<nb.length;i++){
      var p=xf(nb[i][0],nb[i][1],0.006), rr=nb[i][2]*R;
      var gr=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],rr);
      gr.addColorStop(0,'rgba('+nb[i][3]+','+nb[i][4]+')'); gr.addColorStop(1,'rgba('+nb[i][3]+',0)');
      ctx.fillStyle=gr; ctx.fillRect(p[0]-rr,p[1]-rr,rr*2,rr*2);
    }
    // band dust
    ctx.fillStyle='#bcd0ff';
    var ps=Math.max(0.6,R/260);
    for(var i=0;i<band.length;i++){
      var b=band[i], p=xf(b.x,b.y,0.008);
      if(p[0]<0||p[0]>W||p[1]<0||p[1]>H) continue;
      ctx.globalAlpha=b.a*(0.7+0.3*Math.sin(t*0.7+b.ph));
      ctx.fillRect(p[0],p[1],b.r*ps*1.4,b.r*ps*1.4);
    }

    // background stars
    var sc=Math.max(0.7,R/300);
    for(var i=0;i<bg.length;i++){
      var s=bg[i], p=xf(s.x,s.y,0.01);
      var dxx=p[0]-cx, dyy=p[1]-cy;
      if(dxx*dxx+dyy*dyy>R*R*1.2) continue;
      var tw=0.65+0.35*Math.sin(t*s.sp+s.ph);
      ctx.globalAlpha=s.b*tw;
      var sz=s.r*sc*3.2;
      ctx.drawImage(s.s,p[0]-sz,p[1]-sz,sz*2,sz*2);
    }
    ctx.globalAlpha=1;

    // timeline values
    var fadeOut = 1-sm((lt-FADE0)/(FADE1-FADE0));
    var env = sm((lt-ALIVE0)/1.0)*(1-sm((lt-ALIVE1)/1.0));
    var flapPh = Math.max(0,lt-ALIVE0);
    var f = 1-0.55*env*(0.5-0.5*Math.cos(flapPh*6.9));
    var bob = env*Math.sin(flapPh*3.45)*0.012;

    // moth star positions
    var cT=Math.cos(TILT), sT=Math.sin(TILT);
    for(var i=0;i<L.length;i++){
      var s=L[i], lx=s[0], ly=s[1];
      if(s[3]){ lx*=f; if(ly<0.1) ly-= (1-f)*0.07; }
      var wx=lx*cT-ly*sT+OFF.x, wy=lx*sT+ly*cT+OFF.y+bob;
      pts[i]=[wx,wy];
    }
    var sp=[]; for(var i=0;i<pts.length;i++) sp[i]=xf(pts[i][0],pts[i][1],0.02);
    var lp = xf(LANT.x,LANT.y,0.02);

    // wing fills
    if(env>0.01){
      var wings=[[1,6,7,8,2],[1,9,10,11,2]];
      for(var w=0;w<2;w++){
        var q=wings[w];
        var gr=ctx.createRadialGradient(sp[1][0],sp[1][1],0,sp[1][0],sp[1][1],R*0.6);
        gr.addColorStop(0,'rgba(255,215,150,'+(0.20*env)+')');
        gr.addColorStop(1,'rgba(150,170,255,'+(0.07*env)+')');
        ctx.fillStyle=gr; ctx.beginPath();
        ctx.moveTo(sp[q[0]][0],sp[q[0]][1]);
        for(var k=1;k<q.length;k++) ctx.lineTo(sp[q[k]][0],sp[q[k]][1]);
        ctx.closePath(); ctx.fill();
        // eyespot
        var ex=(sp[q[1]][0]+sp[q[2]][0]+sp[1][0])/3, ey=(sp[q[1]][1]+sp[q[2]][1]+sp[1][1])/3;
        var es=R*0.07;
        ctx.globalAlpha=env*0.8; ctx.drawImage(spG,ex-es,ey-es,es*2,es*2);
      }
      ctx.globalAlpha=1;
    }

    // lines
    ctx.lineCap='round';
    for(var i=0;i<E.length;i++){
      var p=sm((lt-(T0+i*ESTEP))/EDUR);
      if(p<=0) continue;
      var a=sp[E[i][0]], b=sp[E[i][1]];
      var x2=a[0]+(b[0]-a[0])*p, y2=a[1]+(b[1]-a[1])*p;
      var al=fadeOut;
      ctx.strokeStyle='rgba(150,180,255,'+(0.22*al)+')'; ctx.lineWidth=Math.max(2,R*0.012);
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.strokeStyle='rgba(225,235,255,'+(0.85*al)+')'; ctx.lineWidth=Math.max(0.8,R*0.0035);
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(x2,y2); ctx.stroke();
      if(p<1 && al>0.01){
        var hs=R*0.05; ctx.globalAlpha=al; ctx.drawImage(spW,x2-hs,y2-hs,hs*2,hs*2); ctx.globalAlpha=1;
      }
    }
    // reach line (dotted) antenna -> lantern
    var rp=sm((lt-REACH0)/(REACH1-REACH0));
    if(rp>0){
      var a=sp[5], x2=a[0]+(lp[0]-a[0])*rp, y2=a[1]+(lp[1]-a[1])*rp;
      ctx.setLineDash([R*0.01,R*0.025]);
      ctx.strokeStyle='rgba(255,215,150,'+(0.8*fadeOut)+')'; ctx.lineWidth=Math.max(1,R*0.005);
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.setLineDash([]);
    }

    // constellation stars
    for(var i=0;i<L.length;i++){
      var rv = sm((lt-starT[i])/0.7)*fadeOut;
      var br = 0.4+0.6*rv;
      var tw = 0.8+0.2*Math.sin(t*(1.3+i*0.37)+i*2);
      var mag=L[i][2];
      var size = R*(0.018+mag*0.012)*(1+0.5*rv);
      var p=sp[i];
      ctx.globalAlpha=Math.min(1,br*tw);
      ctx.drawImage(i>=4&&i<=5?spC:spW,p[0]-size*2,p[1]-size*2,size*4,size*4);
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(p[0],p[1],Math.max(0.8,size*0.22),0,6.283); ctx.fill();
      if(rv>0.02){
        ctx.strokeStyle='rgba(255,255,255,'+(0.5*rv*tw)+')'; ctx.lineWidth=Math.max(0.6,R*0.002);
        var sl=size*(1.3+0.4*mag/3);
        ctx.beginPath(); ctx.moveTo(p[0]-sl,p[1]); ctx.lineTo(p[0]+sl,p[1]); ctx.moveTo(p[0],p[1]-sl); ctx.lineTo(p[0],p[1]+sl); ctx.stroke();
      }
    }
    ctx.globalAlpha=1;

    // lantern star
    var lr = sm((lt-REACH0+0.3)/1.0)*fadeOut;
    var pulse = 0.5+0.5*Math.sin(t*2.2);
    var lb = 0.55+0.45*lr*(0.7+0.3*pulse) + 0.25*env*pulse*lr;
    var ls = R*(0.06+0.045*lr+0.02*env*pulse);
    ctx.globalAlpha=Math.min(1,lb);
    ctx.drawImage(spG,lp[0]-ls*2.4,lp[1]-ls*2.4,ls*4.8,ls*4.8);
    ctx.globalAlpha=1;
    ctx.fillStyle='#fff7e0'; ctx.beginPath(); ctx.arc(lp[0],lp[1],Math.max(1.2,ls*0.22),0,6.283); ctx.fill();
    ctx.strokeStyle='rgba(255,230,170,'+(0.35+0.4*lr)+')'; ctx.lineWidth=Math.max(0.7,R*0.0025);
    var sl=ls*(1.4+0.8*lr+0.4*env*pulse);
    ctx.beginPath(); ctx.moveTo(lp[0]-sl,lp[1]); ctx.lineTo(lp[0]+sl,lp[1]); ctx.moveTo(lp[0],lp[1]-sl); ctx.lineTo(lp[0],lp[1]+sl); ctx.stroke();
    var sl2=sl*0.55; ctx.globalAlpha=0.6;
    ctx.beginPath(); ctx.moveTo(lp[0]-sl2,lp[1]-sl2); ctx.lineTo(lp[0]+sl2,lp[1]+sl2); ctx.moveTo(lp[0]-sl2,lp[1]+sl2); ctx.lineTo(lp[0]+sl2,lp[1]-sl2); ctx.stroke();
    ctx.globalAlpha=1;

    // wing dust
    if(env>0.2 && parts.length<70){
      for(var k=0;k<2;k++){
        if(Math.random()<0.35*env){
          var wi=[6,9,8,11][(Math.random()*4)|0];
          parts.push({x:pts[wi][0]+rnd(-0.02,0.02), y:pts[wi][1]+rnd(-0.02,0.02), vx:rnd(-0.015,0.015), vy:rnd(0.01,0.045), l:0, m:rnd(1.2,2.4), c:Math.random()<0.6?spG:spC});
        }
      }
    }
    for(var i=parts.length-1;i>=0;i--){
      var d=parts[i]; d.l+=dt; d.x+=d.vx*dt; d.y+=d.vy*dt;
      if(d.l>d.m){parts.splice(i,1);continue;}
      var q=xf(d.x,d.y,0.02), k=d.l/d.m, al=Math.sin(k*3.1416);
      var z=R*0.025*(1-k*0.4);
      ctx.globalAlpha=al*0.9; ctx.drawImage(d.c,q[0]-z,q[1]-z,z*2,z*2);
    }
    ctx.globalAlpha=1;

    // shooting star
    if(!shoot && t>nextShoot){
      var sx=rnd(-0.8,0.2), sy=rnd(-0.9,-0.4);
      shoot={x:sx,y:sy,vx:rnd(0.9,1.3),vy:rnd(0.35,0.6),l:0};
      nextShoot=t+rnd(8,14);
    }
    if(shoot){
      shoot.l+=dt; shoot.x+=shoot.vx*dt; shoot.y+=shoot.vy*dt;
      var k=shoot.l/0.9;
      if(k>=1){shoot=null;} else {
        var X=cx+shoot.x*R, Y=cy+shoot.y*R, tl=0.22;
        var gr=ctx.createLinearGradient(X,Y,X-shoot.vx*tl*R,Y-shoot.vy*tl*R);
        var al=Math.sin(k*3.1416);
        gr.addColorStop(0,'rgba(255,255,255,'+al+')'); gr.addColorStop(1,'rgba(180,200,255,0)');
        ctx.strokeStyle=gr; ctx.lineWidth=Math.max(1,R*0.006); ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(X,Y); ctx.lineTo(X-shoot.vx*tl*R,Y-shoot.vy*tl*R); ctx.stroke();
      }
    }

    // soft vignette
    ctx.globalCompositeOperation='source-over';
    var vg=ctx.createRadialGradient(cx,cy,R*0.6,cx,cy,R*1.05);
    vg.addColorStop(0,'rgba(2,3,10,0)'); vg.addColorStop(1,'rgba(2,3,10,0.55)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  }
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>
```

```json
{
  "title": "The Moth Who Borrowed the Moon",
  "statement": "Long ago a small moth mistook the Moon for a porch lamp and flew up to ask if it might stay a while. The Moon, flattered, lent her one gold spark to carry home, and on clear nights the moth still flutters toward it, shaking silver dust from her wings."
}
```