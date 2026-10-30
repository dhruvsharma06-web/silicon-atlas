// Procedural floorplan illustrations. Each drawing is generated from the product's own record
// (execution units, memory bus, core layout, cache), so no two parts share an image. Schematic, not a die photo.
export const vendorColor = {NVIDIA:'#76d300',AMD:'#ff4b3e',Intel:'#3ea6ff'};
const hash=s=>[...s].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619),2166136261)>>>0;
const rnd=seed=>()=>((seed=Math.imul(seed^seed>>>15,seed|1)^(seed+Math.imul(seed^seed>>>7,seed|61)))>>>0)/4294967296;
const tile=(x,y,w,h,cx,cy,cls='')=>`<rect class="die-tile ${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" style="--d:${(Math.hypot(x+w/2-cx,y+h/2-cy)/90).toFixed(2)}s"/>`;

function gpuDie(p,r){
 // NVIDIA SMs carry 128 CUDA cores; AMD and Intel list compute units / Xe cores directly.
 const units=p.vendor==='NVIDIA'?Math.round((p.units||2048)/128):(p.units||32);
 const bus=parseInt(p.specs['Memory interface'])||({8:128,12:192,16:256,20:320,24:384,32:512}[p.memory]||256);
 const chips=Math.max(4,bus/32),gx=50,gy=28,gw=140,gh=104,cx=gx+gw/2,cy=gy+gh/2;
 const cols=Math.ceil(Math.sqrt(units*gw/gh)),rows=Math.ceil(units/cols),pad=10,tw=(gw-pad*2)/cols,th=(gh-pad*2-14)/rows;
 let s=`<rect class="die-body" x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="3"/>`;
 for(let i=0;i<units;i++){const c=i%cols,rw=Math.floor(i/cols);s+=tile(gx+pad+c*tw+.8,gy+pad+rw*th+.8,tw-1.6,th-1.6,cx,cy,r()<.12?'hot':'')}
 s+=`<rect class="die-cache" x="${gx+pad}" y="${gy+gh-pad-11}" width="${gw-pad*2}" height="9" rx="1"/>`;
 // memory packages ring the die, one per 32-bit channel
 const side=Math.ceil(chips/4),pos=[];for(let i=0;i<side;i++){const t=(i+.5)/side;pos.push([gx+t*gw-9,6],[gx+t*gw-9,gy+gh+8],[22,gy+t*gh-9],[gx+gw+8,gy+t*gh-9])}
 pos.slice(0,chips).forEach(([x,y],i)=>s+=`<rect class="die-mem" x="${x}" y="${y}" width="18" height="18" rx="2" style="--d:${(i*.08).toFixed(2)}s"/>`);
 return s;
}
function cpuDie(p,r){
 const cx=120,cy=80;let s=`<rect class="die-ihs" x="30" y="6" width="180" height="148" rx="10"/>`;
 if(p.vendor==='AMD'){
  const ccds=p.cores>8?2:1,x3d=/X3D/.test(p.name);
  for(let c=0;c<ccds;c++){const x=46+c*76,y=22;s+=`<rect class="die-body" x="${x}" y="${y}" width="66" height="58" rx="2"/>`;
   const n=Math.ceil(p.cores/ccds);for(let i=0;i<8;i++){const on=i<n;s+=tile(x+5+(i%4)*14.5,y+5+Math.floor(i/4)*29,13,12,cx,cy,on?'':'off')}
   s+=`<rect class="die-cache ${x3d?'stack':''}" x="${x+5}" y="${y+21}" width="56" height="12" rx="1"/>`}
  s+=`<rect class="die-body io" x="70" y="96" width="100" height="44" rx="2"/>`;for(let i=0;i<10;i++)s+=tile(76+(i%5)*18.5,102+Math.floor(i/5)*17,15,12,cx,cy,'io');
 }else{
  const pc=p.cores-(+p.specs['Core configuration']?.match(/\+ (\d+)/)?.[1]||0),ec=p.cores-pc,clusters=Math.ceil(ec/4),tiles=p.socket==='LGA1851';
  const x=tiles?44:46,w=tiles?150:148;s+=`<rect class="die-body" x="${x}" y="20" width="${w}" height="${tiles?72:120}" rx="2"/>`;
  const slots=pc+clusters,cols=Math.min(slots,tiles?6:5),tw=(w-10)/cols,rows=Math.ceil(slots/cols),th=((tiles?72:84)-10)/rows;
  let k=0;for(let i=0;i<pc;i++,k++)s+=tile(x+5+(k%cols)*tw+1,25+Math.floor(k/cols)*th+1,tw-2,th-2,cx,cy,'');
  for(let i=0;i<clusters;i++,k++){const bx=x+5+(k%cols)*tw+1,by=25+Math.floor(k/cols)*th+1;for(let j=0;j<4;j++)s+=tile(bx+(j%2)*(tw-2)/2+.6,by+Math.floor(j/2)*(th-2)/2+.6,(tw-2)/2-1.2,(th-2)/2-1.2,cx,cy,'e')}
  if(tiles){['gpu','soc','io'].forEach((n,i)=>{s+=`<rect class="die-body ${n==='gpu'?'':'io'}" x="${44+i*51}" y="100" width="46" height="40" rx="2"/>`;for(let j=0;j<4;j++)s+=tile(49+i*51+(j%2)*19,105+Math.floor(j/2)*16,16,13,cx,cy,n==='gpu'?'hot':'io')})}
  else s+=`<rect class="die-cache" x="51" y="110" width="138" height="12" rx="1"/>`;
 }
 for(let i=0;i<24;i++){const a=r()*Math.PI*2;s+=`<circle class="die-dot" cx="${(cx+Math.cos(a)*95).toFixed(1)}" cy="${(cy+Math.sin(a)*70).toFixed(1)}" r=".9"/>`}
 return s;
}
export function dieArt(p,{label=true}={}){
 const r=rnd(hash(p.id)),c=vendorColor[p.vendor];
 const body=p.type==='gpu'?gpuDie(p,r):cpuDie(p,r);
 return `<svg class="die-art" viewBox="0 0 240 160" style="--vc:${c}" role="img" aria-label="Schematic floorplan illustration of ${p.name.replace(/"/g,'')}"><defs><linearGradient id="sweep-${p.id}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g class="die-grid">${body}</g><rect class="die-sweep" x="-80" y="0" width="70" height="160" fill="url(#sweep-${p.id})"/>${label?`<text class="die-label" x="232" y="155" text-anchor="end">${p.type==='gpu'?(p.vendor==='NVIDIA'?Math.round(p.units/128)+' SM':p.units+(p.vendor==='Intel'?' XE':' CU')):p.cores+' CORES'} · SCHEMATIC</text>`:''}</svg>`;
}
