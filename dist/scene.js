import * as THREE from './vendor/three.module.js';
import {pointer} from './fx.js';
// Original conceptual graphics card. Fans spin, the light bar cycles, particles drift, the pointer adds parallax,
// and an optional scroll section rotates and explodes the assembly. Renders only while visible.
export function mountHardware(el,{scrollSection=null}={}){
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{return()=>{}};
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;el.replaceChildren(renderer.domElement);if(scrollSection)scrollSection.classList.add('is-live');renderer.domElement.setAttribute('aria-label','Illustrative graphics card with spinning fans, a light bar, cooling fins and circuit board');renderer.domElement.setAttribute('role','img');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.1,100),group=new THREE.Group();scene.add(group);camera.position.set(0,0,12);
 scene.add(new THREE.AmbientLight(0xd8dcff,1.1));const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(-3,6,6);scene.add(key);const rim=new THREE.DirectionalLight(0xff7a3d,5);rim.position.set(5,-2,3);scene.add(rim);const side=new THREE.DirectionalLight(0x3de8ff,3.2);side.position.set(-6,-3,-2);scene.add(side);
 const glowLight=new THREE.PointLight(0xff4d6d,14,9);glowLight.position.set(0,1.6,1.2);group.add(glowLight);
 const metal=new THREE.MeshStandardMaterial({color:0x3a3d44,metalness:.85,roughness:.28}),dark=new THREE.MeshStandardMaterial({color:0x111216,metalness:.6,roughness:.35}),silver=new THREE.MeshStandardMaterial({color:0x9aa0ab,metalness:.9,roughness:.22}),black=new THREE.MeshStandardMaterial({color:0x050506,roughness:.6}),pcbmat=new THREE.MeshStandardMaterial({color:0x14161c,metalness:.3,roughness:.5}),gold=new THREE.MeshStandardMaterial({color:0xd29a52,metalness:.75,roughness:.32}),
  led=new THREE.MeshStandardMaterial({color:0x000000,emissive:0xff4d6d,emissiveIntensity:3.2}),chip=new THREE.MeshStandardMaterial({color:0x111111,emissive:0xff6a2b,emissiveIntensity:.5,metalness:.4,roughness:.3});
 const mats=[metal,dark,silver,black,pcbmat,gold,led,chip];
 const box=(w,h,d,mat,x=0,y=0,z=0,parent=group)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m};
 const pcb=new THREE.Group(),cooler=new THREE.Group(),shell=new THREE.Group();group.add(pcb,cooler,shell);
 box(5.5,2.05,.08,pcbmat,0,0,-.24,pcb);box(5.7,2.2,.12,dark,0,0,-.48,pcb);
 for(let i=0;i<52;i++)box(.042,.26,.035,gold,-2+i*.075,-1.1,-.22,pcb);
 box(.85,.85,.12,silver,0,0,-.13,pcb);box(.55,.55,.05,chip,0,0,-.04,pcb);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;box(.35,.23,.08,black,Math.cos(a)*1.08,Math.sin(a)*.7,-.12,pcb)}
 for(let i=0;i<36;i++){box(.08,.14,.08,silver,-2.4+(i%12)*.42,(i<12?.83:i<24?-.82:.55),-.12,pcb)}
 for(let i=0;i<82;i++)box(.027,1.87,.52,metal,-2.65+i*.065,0,.08,cooler);
 for(let i=0;i<4;i++){const tube=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,5.4,10),gold);tube.rotation.z=Math.PI/2;tube.position.set(0,-.63+i*.42,.36);cooler.add(tube)}
 box(5.8,.18,.62,metal,0,1.02,.18,shell);box(5.8,.18,.62,metal,0,-1.02,.18,shell);box(.17,2.12,.62,metal,-2.83,0,.18,shell);box(.17,2.12,.62,metal,2.83,0,.18,shell);box(.17,2.05,.15,dark,0,0,.51,shell);
 box(4.6,.05,.08,led,.3,1.1,.42,shell);box(.06,1.6,.06,led,2.93,0,.4,shell);
 const fans=[];
 for(const x of [-1.4,1.4]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.88,.045,12,64),led);ring.position.set(x,0,.57);shell.add(ring);
  const disk=new THREE.Mesh(new THREE.CylinderGeometry(.83,.83,.05,64),black);disk.rotation.x=Math.PI/2;disk.position.set(x,0,.43);shell.add(disk);
  const fan=new THREE.Group();fan.position.set(x,0,.58);shell.add(fan);fans.push(fan);
  for(let i=0;i<11;i++){const blade=new THREE.Shape();blade.moveTo(.18,-.06);blade.bezierCurveTo(.4,-.28,.68,-.3,.82,-.1);blade.lineTo(.79,.09);blade.bezierCurveTo(.51,-.03,.37,.16,.18,.08);blade.closePath();const m=new THREE.Mesh(new THREE.ExtrudeGeometry(blade,{depth:.025,bevelEnabled:false}),dark);m.rotation.z=i*Math.PI*2/11;fan.add(m)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.09,32),silver);hub.rotation.x=Math.PI/2;hub.position.z=.035;fan.add(hub);
 }
 box(.12,2.6,.6,silver,-3,0,-.1);for(let i=0;i<3;i++)box(.13,.3,.16,black,-3.07,-.55+i*.5,-.05);box(.65,.16,.3,black,1.9,1.14,-.12,pcb);
 // drifting particles, like dust in a light beam
 const count=420,pos=new Float32Array(count*3);for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*14;pos[i*3+1]=(Math.random()-.5)*8;pos[i*3+2]=(Math.random()-.5)*6}
 const pgeo=new THREE.BufferGeometry();pgeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const pmat=new THREE.PointsMaterial({color:0xffa36b,size:.035,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false});const points=new THREE.Points(pgeo,pmat);scene.add(points);mats.push(pmat);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,raf=0,px=0,py=0;const t0=performance.now(),color=new THREE.Color();
 const copy=[['Power. In perspective.','A graphics card is a system of parts. Keep scrolling to orbit the assembly and see what sits beneath the shroud.'],['Built to move heat.','Fans push air through a dense heatsink. Case airflow and card clearance matter as much as the slot it fits into.'],['Know what’s inside.','The GPU does the computation. Dedicated memory holds working data. Neither capacity nor clock speed alone tells the performance story.']];let stage=-1;
 function render(now){raf=0;if(!visible||document.hidden)return;const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;
  if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=Math.max(12,3.5/(Math.tan(33*Math.PI/360)*camera.aspect));camera.updateProjectionMatrix()}
  const t=reduced.matches?0:(now-t0)/1000;let p=0;
  if(scrollSection&&!reduced.matches){const r=scrollSection.getBoundingClientRect();p=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-innerHeight)))}
  px+=(pointer.nx-px)*.06;py+=(pointer.ny-py)*.06;
  group.rotation.set(.23+p*.2+py*.18+Math.sin(t*.6)*.03,-.4+p*1.05+px*.35,-.25+p*.12);group.position.x=scrollSection?-.15:.4;group.position.y=Math.sin(t*.9)*.08;group.scale.setScalar(w<550?.87:1.05);
  const explode=Math.max(0,(p-.35)/.65);shell.position.z=explode*1.65;cooler.position.z=explode*.65;pcb.position.z=-explode*.7;
  fans.forEach((f,i)=>f.rotation.z=-t*(9+i*1.5));
  color.setHSL((.95+t*.06)%1,1,.55);led.emissive.copy(color);glowLight.color.copy(color);chip.emissiveIntensity=.4+.4*Math.sin(t*2.4)**2+explode*1.5;
  points.rotation.y=t*.03;points.position.y=Math.sin(t*.3)*.2;
  renderer.render(scene,camera);
  if(scrollSection){scrollSection.style.setProperty('--progress',p);const bar=scrollSection.querySelector('.progress');if(bar)bar.style.transform=`scaleX(${p})`;const s=p<.33?0:p<.68?1:2;if(s!==stage){stage=s;const title=scrollSection.querySelector('h2'),body=scrollSection.querySelector('.film-copy p:last-child'),box=scrollSection.querySelector('.film-copy');title.textContent=copy[s][0];body.textContent=copy[s][1];box.dataset.stage=s;box.classList.remove('swap');void box.offsetWidth;box.classList.add('swap')}}
  if(!reduced.matches)raf=requestAnimationFrame(render)}
 const request=()=>{if(!raf)raf=requestAnimationFrame(render)};const resize=new ResizeObserver(()=>{renderer.setSize(el.clientWidth,el.clientHeight,false);camera.aspect=el.clientWidth/Math.max(1,el.clientHeight);camera.position.z=Math.max(12,3.5/(Math.tan(33*Math.PI/360)*camera.aspect));camera.updateProjectionMatrix();request()});resize.observe(el);const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)request()});observer.observe(el);addEventListener('scroll',request,{passive:true});document.addEventListener('visibilitychange',request);reduced.addEventListener('change',request);request();
 return()=>{cancelAnimationFrame(raf);resize.disconnect();observer.disconnect();removeEventListener('scroll',request);document.removeEventListener('visibilitychange',request);reduced.removeEventListener('change',request);scene.traverse(o=>{o.geometry?.dispose()});mats.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove()};
}
