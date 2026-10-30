// Motion layer: shader backdrop, pointer light, magnetic buttons, tilt cards, reveals, counters, kinetic type.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer: fine)');
export const pointer={x:innerWidth/2,y:innerHeight/2,nx:0,ny:0};
addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;pointer.nx=e.clientX/innerWidth*2-1;pointer.ny=e.clientY/innerHeight*2-1},{passive:true});

let started=false;
export function initGlobalFX(){
 if(started)return;started=true;
 const glow=document.querySelector('#cursor-glow'),bar=document.querySelector('#scroll-progress');
 let gx=pointer.x,gy=pointer.y;
 (function loop(){
  if(glow&&fine.matches&&!reduced.matches){gx+=(pointer.x-gx)*.12;gy+=(pointer.y-gy)*.12;glow.style.transform=`translate(${gx}px,${gy}px)`}
  if(bar){const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?scrollY/h:0})`}
  requestAnimationFrame(loop);
 })();
 // Tilt + spotlight on cards, delegated so newly rendered routes work without rebinding.
 document.addEventListener('pointermove',e=>{
  const card=e.target.closest?.('[data-tilt]');
  document.querySelectorAll('[data-tilt].tilting').forEach(c=>{if(c!==card)untilt(c)});
  if(!card||!fine.matches)return;
  const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  card.classList.add('tilting');card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);
  if(!reduced.matches)card.style.transform=`perspective(900px) rotateX(${(.5-y)*7}deg) rotateY(${(x-.5)*9}deg) translateY(-4px)`;
 },{passive:true});
 document.addEventListener('pointerleave',()=>document.querySelectorAll('[data-tilt].tilting').forEach(untilt));
 // Magnetic buttons
 document.addEventListener('pointermove',e=>{
  const b=e.target.closest?.('.magnetic');document.querySelectorAll('.magnetic.pulled').forEach(m=>{if(m!==b){m.classList.remove('pulled');m.style.transform=''}});
  if(!b||reduced.matches||!fine.matches)return;const r=b.getBoundingClientRect();
  b.classList.add('pulled');b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`;
 },{passive:true});
}
function untilt(c){c.classList.remove('tilting');c.style.transform=''}

export function splitText(root){
 root.querySelectorAll('[data-split]').forEach(el=>{
  if(el.dataset.done)return;el.dataset.done=1;let i=0;const label=el.textContent;
  const esc=c=>c.replace(/[&<>]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[x]));
  el.innerHTML=[...el.childNodes].map(n=>n.nodeName==='BR'?'<br>':n.textContent.split(' ').map(w=>w?`<span class="word" aria-hidden="true">${[...w].map(ch=>`<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`:'').join(' ')).join('');
  el.setAttribute('aria-label',label);
 });
}

function countUp(el){
 const end=parseFloat(el.dataset.count),dec=(el.dataset.count.split('.')[1]||'').length,dur=1400,t0=performance.now();
 if(reduced.matches){el.textContent=end.toFixed(dec);return}
 (function step(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=(end*e).toFixed(dec);if(k<1)requestAnimationFrame(step)})(t0);
}

// Reveal anything with [data-reveal]; count numbers with [data-count]; grow bars with [data-bar].
export function observe(root){
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const t=e.target;t.classList.add('in');
  if(t.dataset.count)countUp(t);t.querySelectorAll?.('[data-count]').forEach(countUp);io.unobserve(t)}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
 root.querySelectorAll('[data-reveal],[data-count]:not([data-reveal] [data-count]),.bars').forEach(el=>io.observe(el));
 return()=>io.disconnect();
}

// Pinned horizontal rail: vertical scroll drives the track sideways.
export function rail(section){
 const track=section.querySelector('.rail-track');if(!track)return()=>{};
 const size=()=>{section.style.height=reduced.matches||innerWidth<700?'auto':`${track.scrollWidth-innerWidth+innerHeight*1.15}px`};
 const onScroll=()=>{if(reduced.matches||innerWidth<700){track.style.transform='';return}const r=section.getBoundingClientRect(),max=track.scrollWidth-innerWidth,p=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height-innerHeight)));track.style.transform=`translate3d(${-p*max}px,0,0)`;section.style.setProperty('--rail',p)};
 size();onScroll();const ro=new ResizeObserver(()=>{size();onScroll()});ro.observe(track);addEventListener('scroll',onScroll,{passive:true});
 return()=>{ro.disconnect();removeEventListener('scroll',onScroll)};
}

// Video that grows from an inset card to full bleed as it scrolls into view.
export function expander(section){
 const onScroll=()=>{const r=section.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight*1.1)));section.style.setProperty('--grow',reduced.matches?1:p)};
 onScroll();addEventListener('scroll',onScroll,{passive:true});
 const vids=[...section.querySelectorAll('video')],io=new IntersectionObserver(es=>es.forEach(e=>{if(reduced.matches)return;e.isIntersecting?e.target.play().catch(()=>{}):e.target.pause()}));vids.forEach(v=>io.observe(v));
 return()=>{removeEventListener('scroll',onScroll);io.disconnect()};
}

const FRAG=`precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
 vec2 q=vec2(fbm(p*1.6+t*.05),fbm(p*1.6-t*.04+3.1));float f=fbm(p*2.2+q*1.8+t*.03);
 vec3 c=mix(vec3(.02,.02,.03),vec3(.55,.12,.32),smoothstep(.35,.85,f));
 c=mix(c,vec3(1.,.42,.12),smoothstep(.62,.95,f)*.85);c+=vec3(.05,.55,.75)*smoothstep(.55,.9,q.y)*.35;
 // receding circuit floor
 float y=uv.y;if(y<.42){float z=.42/(.42-y+.001);vec2 g=vec2(p.x*z,z+t*.6);vec2 gl=abs(fract(g*1.2)-.5);float line=smoothstep(.47,.5,max(gl.x,gl.y));c+=vec3(1.,.45,.2)*line*(1.-y/.42)*.35*smoothstep(0.,.25,y);
  float trace=step(.985,h(floor(g*1.2)))*(.5+.5*sin(t*3.+h(floor(g*1.2))*30.));c+=vec3(.2,.9,1.)*trace*.25*(1.-y/.42);}
 float d=length(p-vec2(m.x*.8,m.y*.45));c+=vec3(1.,.5,.25)*.18/(1.+d*d*12.);
 c*=1.-.55*length(uv-.5);gl_FragColor=vec4(c,1.);}`;
export function shader(canvas){
 const gl=canvas.getContext('webgl',{antialias:false,premultipliedAlpha:false});if(!gl)return()=>{};
 const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s};
 const prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}'));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(prog);
 if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return()=>{};gl.useProgram(prog);
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const ur=gl.getUniformLocation(prog,'r'),ut=gl.getUniformLocation(prog,'t'),um=gl.getUniformLocation(prog,'m');
 let raf=0,visible=true,mx=0,my=0;const t0=performance.now();canvas.classList.add('live');
 const draw=now=>{raf=0;const s=.6,w=Math.round(canvas.clientWidth*s),h=Math.round(canvas.clientHeight*s);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  gl.viewport(0,0,w,h);mx+=(pointer.nx-mx)*.05;my+=(-pointer.ny-my)*.05;gl.uniform2f(ur,w,h);gl.uniform1f(ut,reduced.matches?8:(now-t0)/1000);gl.uniform2f(um,mx,my);gl.drawArrays(gl.TRIANGLES,0,3);
  if(visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(draw)};
 const io=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(draw)});io.observe(canvas);
 const vis=()=>{if(!document.hidden&&visible&&!raf)raf=requestAnimationFrame(draw)};document.addEventListener('visibilitychange',vis);
 raf=requestAnimationFrame(draw);
 return()=>{cancelAnimationFrame(raf);io.disconnect();document.removeEventListener('visibilitychange',vis);gl.getExtension('WEBGL_lose_context')?.loseContext()};
}
