// Manufacturer specifications, snapshot 30 October 2026. No performance measurements are inferred.
const verified = '2026-10-30';
const nvidiaSource = 'https://www.nvidia.com/en-gb/geforce/graphics-cards/compare/';
const amdGPU = 'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/';
const amdCPU = 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/';
const amdCPU9 = 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/';
const amdGPU9 = 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/';
const intelUltra = 'https://www.intel.com/content/www/us/en/products/details/processors/core-ultra.html';
const intelArc = 'https://www.intel.com/content/www/us/en/products/sku/241598/intel-arc-b580-graphics/specifications.html';
const intelCPU = 'https://www.intel.com/content/www/us/en/products/sku/';
const gpuRequirements = [
  'Check the exact board-partner model: its cooler, dimensions, connectors and power limits can differ from the reference specification.',
  'Confirm a suitable motherboard PCIe expansion slot, case length and thickness clearance, and clearance for the power cable bend.',
  'Verify PSU model, age, available connectors and the complete system load. A manufacturer PSU recommendation is not measured whole-system consumption.',
  'Check the exact card outputs, monitor input, cable bandwidth and display mode. A supported display resolution is not a gaming frame-rate guarantee.'
];
function gpu(id, vendor, name, memory, memoryType, power, psu, length, slots, source, extra, opts={}) {
  const generation=opts.generation||(vendor==='NVIDIA'?'GeForce RTX 40':'Radeon RX 7000');
  return { id, type:'gpu', vendor, name, generation, release:opts.release||'2023', units:opts.units??null, memory, memoryType, power,
    powerLabel:vendor==='NVIDIA'?'Total Graphics Power':'Typical Board Power', socket:null, cores:null, threads:null, cache:null, igpu:null,
    psu, length, slots, image:null, source, verified, features:opts.features||['Ray tracing','AV1 encode',vendor==='NVIDIA'?'DLSS':'FSR'],
    specs:{'VRAM':`${memory} GB ${memoryType}`,'Power specification':`${power} W ${vendor==='NVIDIA'?'TGP':'TBP'}`,'Manufacturer PSU guidance':psu?`${psu} W; system-dependent`:'Not listed — follow the board partner’s guidance','Reference length':length===null?'Not available — check exact card':`${length} mm`,'Reference thickness':slots===null?'Not available — check exact card':`${slots} slots`,...extra},
    notes:'Reference specifications. AV1 hardware encoding can support compatible recording and video workflows; application support varies. Comparable workload benchmarks are not available in this catalogue.',
    requirements:gpuRequirements,
    provenance:[{group:'Specifications and reference requirements',url:source,verified}], benchmarks:[] };
}
function amd(id, name, cores, threads, l2, l3, power, base, boost, cooler, zen5=false, release='2022') {
  const source=(zen5?amdCPU9:amdCPU)+`amd-${id}.html`;
  return {id,type:'cpu',vendor:'AMD',name,generation:zen5?'Ryzen 9000':'Ryzen 7000',release,units:cores,memory:null,memoryType:'DDR5',power,powerLabel:'Default TDP',socket:'AM5',cores,threads,cache:`${l3} MB L3`,igpu:true,psu:null,length:null,slots:null,image:null,source,verified,
    features:['Integrated graphics','DDR5'],
    specs:{'Cores / threads':`${cores} / ${threads}`,'Socket':'AM5','Architecture':zen5?'Zen 5':'Zen 4','Base clock':`${base} GHz`,'Maximum boost':`Up to ${boost} GHz`,'L2 cache':`${l2} MB`,'L3 cache':`${l3} MB`,'Power specification':`${power} W default TDP`,'Memory support':'DDR5 UDIMM, 2 channels','Official memory speed':zen5?'DDR5-5600 with 2 DIMMs; 4-DIMM speed is lower — check AMD':'DDR5-5200 with 2 DIMMs; DDR5-3600 with 4 DIMMs','Integrated graphics':'AMD Radeon Graphics (2 graphics cores)','Included cooler':'None'},
    notes:id.includes('x3d')?'Additional L3 cache is a design feature, not a universal performance score. Verify results for your games and applications.':'Core count describes parallel resources; software scaling and per-core performance still matter. No comparable workload benchmarks are included.',
    requirements:[`Use an AM5 motherboard that explicitly lists ${name} in its CPU support list. Check the required BIOS before installation.`, 'Use DDR5 memory; DDR4 cannot be reused on this platform. Consult the board memory support list and DIMM population guide.', `${cooler} Confirm AM5 mounting support, case clearance and motherboard power delivery. A cooler is not included.`, 'Integrated Radeon graphics are available; confirm the motherboard has the display outputs you need.', 'Chipset, BIOS and board implementation determine available PCIe and I/O features. Matching the socket alone does not establish compatibility.', 'TDP is a thermal design specification, not a measured complete-system power draw.'],
    provenance:[{group:'Specifications and platform requirements',url:source,verified}],benchmarks:[]};
}
function intel(id,name,sku,p,e,threads,l2,l3,power,turbo,base,boost,igpu) {
  const source=intelCPU+`${sku}/intel-core-${id.replace('core-','').replace('-','-processor-')}-${l3}m-cache-up-to-${boost.toFixed(2).replace('.','-')}-ghz/specifications.html`;
  return {id,type:'cpu',vendor:'Intel',name,generation:'Core 14th Gen',release:'2023',units:p+e,memory:null,memoryType:'DDR4 / DDR5',power,powerLabel:'Processor Base Power',socket:'LGA1700',cores:p+e,threads,cache:`${l3} MB Smart Cache`,igpu:!!igpu,psu:null,length:null,slots:null,image:null,source,verified,
    features:[...(igpu?['Integrated graphics']:[]),'DDR4','DDR5'],
    specs:{'Cores / threads':`${p+e} / ${threads}`,'Core configuration':`${p} Performance + ${e} Efficient`,'Socket':'LGA1700','P-core base clock':`${base} GHz`,'Maximum turbo':`Up to ${boost} GHz`,'L2 cache':`${l2} MB`,'L3 cache':`${l3} MB Intel Smart Cache`,'Power specification':`${power} W Processor Base Power`,'Maximum Turbo Power':`${turbo} W`,'Memory support':'DDR4 or DDR5; motherboard-specific','Official memory speed':`Up to DDR5-${id.includes('14400')||id.includes('14100')?'4800':'5600'} / DDR4-3200`,'Integrated graphics':igpu?`Intel UHD Graphics ${igpu}`:'None — discrete graphics required'},
    notes:e?`${p} Performance cores and ${e} Efficient cores serve different roles. Their total is not equivalent to the same number of identical cores. Compare application results, not core counts alone.`:'Four Performance cores with eight threads. Core count and clock speed alone do not predict application performance.',
    requirements:[`Use an LGA1700 motherboard whose CPU support list explicitly includes ${name}; confirm the minimum BIOS and current manufacturer firmware.`, 'Choose DDR4 or DDR5 to match the motherboard. The processor supports both, but a typical board accepts only one type.', `Choose an LGA1700-compatible cooler and suitable motherboard power delivery for the configured power limits; Maximum Turbo Power is ${turbo} W.`, igpu?'Integrated graphics are present; the motherboard must provide an appropriate monitor output.':'This F-series processor has no integrated graphics. A discrete GPU is required for display output.', 'Use current board firmware and recommended default power settings. Confirm cooler mounting, case clearance and PSU capacity for the whole build.'],
    provenance:[{group:'Specifications and platform requirements',url:source,verified}],benchmarks:[]};
}
function ultra(id,name,p,e,l2,l3,power,turbo,base,boost,release,source=intelUltra) {
  return {id,type:'cpu',vendor:'Intel',name,generation:release>='2026'?'Core Ultra 200S Plus':'Core Ultra 200S',release,units:p+e,memory:null,memoryType:'DDR5',power,powerLabel:'Processor Base Power',socket:'LGA1851',cores:p+e,threads:p+e,cache:`${l3} MB Smart Cache`,igpu:true,psu:null,length:null,slots:null,image:null,source,verified,
    features:['Integrated graphics','DDR5','NPU'],
    specs:{'Cores / threads':`${p+e} / ${p+e}`,'Core configuration':`${p} Performance + ${e} Efficient`,'Socket':'LGA1851','Architecture':'Arrow Lake','P-core base clock':`${base} GHz`,'Maximum turbo':`Up to ${boost} GHz`,'L2 cache':`${l2} MB`,'L3 cache':`${l3} MB Intel Smart Cache`,'Power specification':`${power} W Processor Base Power`,'Maximum Turbo Power':turbo?`${turbo} W`:'Check Intel specification','Memory support':'DDR5 only (UDIMM / CUDIMM); motherboard-specific','Official memory speed':'Up to DDR5-6400 — check board QVL','Integrated graphics':'Intel Graphics (Xe-LPG)','AI acceleration':'Integrated NPU'},
    notes:`${p} Performance cores and ${e} Efficient cores, without Hyper-Threading: thread count equals core count. Compare application results, not core counts alone.`,
    requirements:[`Use an LGA1851 (Intel 800-series) motherboard whose CPU support list explicitly includes ${name}; confirm the minimum BIOS.`, 'LGA1851 accepts DDR5 only — DDR4 from an LGA1700 build cannot be reused.', 'LGA1700 coolers often fit LGA1851, but confirm with the cooler maker and check case clearance.', 'Integrated graphics are present; the motherboard must provide an appropriate monitor output.', 'Use current board firmware and Intel default power settings. Confirm PSU capacity for the whole build.'],
    provenance:[{group:'Specifications and platform requirements',url:source,verified}],benchmarks:[]};
}
const rtx50 = (extra)=>({'PCIe':'Gen 5','Display outputs':'HDMI 2.1b + 3 × DisplayPort 2.1b (reference)','Architecture':'Blackwell',...extra});
const rtx50opts = (release,units)=>({generation:'GeForce RTX 50',release,units,features:['Ray tracing','AV1 encode','DLSS 4','Multi Frame Generation']});
const rdna4 = (extra)=>({'Architecture':'RDNA 4','PCIe':'Gen 5','Display output standards':'DisplayPort 2.1a, HDMI 2.1b (board-partner dependent)','Power connectors':'Board-partner dependent; no AMD reference card',...extra});
const rdna4opts = (release,units)=>({generation:'Radeon RX 9000',release,units,features:['Ray tracing','AV1 encode','FSR 4']});
/** @type {import('./types').Product[]} */
export const products = [
  gpu('rtx-5090','NVIDIA','GeForce RTX 5090 32 GB',32,'GDDR7',575,1000,304,2,nvidiaSource,rtx50({'CUDA cores':'21760','Boost clock':'2.41 GHz','Memory interface':'512-bit','Power connectors':'4 × PCIe 8-pin via supplied adapter, or one 600 W PCIe Gen 5 cable'}),rtx50opts('2025-01',21760)),
  gpu('rtx-5080','NVIDIA','GeForce RTX 5080 16 GB',16,'GDDR7',360,850,304,2,nvidiaSource,rtx50({'CUDA cores':'10752','Boost clock':'2.62 GHz','Memory interface':'256-bit','Power connectors':'3 × PCIe 8-pin via supplied adapter, or ≥450 W PCIe Gen 5 cable'}),rtx50opts('2025-01',10752)),
  gpu('rtx-5070-ti','NVIDIA','GeForce RTX 5070 Ti 16 GB',16,'GDDR7',300,750,null,null,nvidiaSource,rtx50({'CUDA cores':'8960','Boost clock':'2.45 GHz','Memory interface':'256-bit','Power connectors':'2 × PCIe 8-pin via adapter, or ≥300 W PCIe Gen 5 cable; check card'}),rtx50opts('2025-02',8960)),
  gpu('rtx-5070','NVIDIA','GeForce RTX 5070 12 GB',12,'GDDR7',250,650,242,2,nvidiaSource,rtx50({'CUDA cores':'6144','Boost clock':'2.51 GHz','Memory interface':'192-bit','Power connectors':'2 × PCIe 8-pin via adapter, or ≥300 W PCIe Gen 5 cable'}),rtx50opts('2025-03',6144)),
  gpu('rtx-5060-ti','NVIDIA','GeForce RTX 5060 Ti 16 GB',16,'GDDR7',180,600,null,null,nvidiaSource,rtx50({'CUDA cores':'4608','Boost clock':'2.57 GHz','Memory interface':'128-bit','Power connectors':'1 × PCIe 8-pin or PCIe Gen 5 cable; check card','Variants':'Also sold with 8 GB — confirm the exact model'}),rtx50opts('2025-04',4608)),
  gpu('rtx-5060','NVIDIA','GeForce RTX 5060 8 GB',8,'GDDR7',145,550,null,null,nvidiaSource,rtx50({'CUDA cores':'3840','Boost clock':'2.50 GHz','Memory interface':'128-bit','Power connectors':'1 × PCIe 8-pin or PCIe Gen 5 cable; check card'}),rtx50opts('2025-05',3840)),
  gpu('rtx-5050','NVIDIA','GeForce RTX 5050 8 GB',8,'GDDR6',130,550,null,null,nvidiaSource,rtx50({'CUDA cores':'2560','Boost clock':'2.57 GHz','Memory interface':'128-bit','Power connectors':'1 × PCIe 8-pin or PCIe Gen 5 cable; check card'}),rtx50opts('2025-07',2560)),
  gpu('rx-9070-xt','AMD','Radeon RX 9070 XT 16 GB',16,'GDDR6',304,null,null,null,amdGPU9+'amd-radeon-rx-9070xt.html',rdna4({'Compute units':'64','Boost clock':'Up to 2.97 GHz','Memory interface':'256-bit','Memory bandwidth':'Up to 640 GB/s','Infinity Cache':'64 MB'}),rdna4opts('2025-03',64)),
  gpu('rx-9070','AMD','Radeon RX 9070 16 GB',16,'GDDR6',220,null,null,null,amdGPU9+'amd-radeon-rx-9070.html',rdna4({'Compute units':'56','Boost clock':'Up to 2.52 GHz','Memory interface':'256-bit','Memory bandwidth':'Up to 640 GB/s','Infinity Cache':'64 MB'}),rdna4opts('2025-03',56)),
  gpu('rx-9060-xt','AMD','Radeon RX 9060 XT 16 GB',16,'GDDR6',160,null,null,null,amdGPU9+'amd-radeon-rx-9060xt.html',rdna4({'Compute units':'32','Boost clock':'Up to 3.13 GHz','Memory interface':'128-bit','Memory bandwidth':'Up to 322 GB/s','Infinity Cache':'32 MB','Variants':'Also sold with 8 GB — confirm the exact model'}),rdna4opts('2025-06',32)),
  {...gpu('arc-b580','Intel','Arc B580 12 GB',12,'GDDR6',190,null,272,2,intelArc,{'Xe cores':'20','Graphics clock':'2.67 GHz','Memory interface':'192-bit','Memory bandwidth':'456 GB/s','Architecture':'Xe2 (Battlemage)','PCIe':'Gen 4 ×8','Power connectors':'1 × 8-pin (Intel Limited Edition)','Reference length':'272 mm (Intel Limited Edition)'},{generation:'Arc B-Series',release:'2024-12',units:20,features:['Ray tracing','AV1 encode','XeSS 2']}),powerLabel:'Total Board Power'},
  amd('ryzen-9-9950x3d','Ryzen 9 9950X3D',16,32,16,128,170,4.3,5.7,'Choose a high-capacity cooler; none is included.',true,'2025-03'),
  amd('ryzen-9-9950x','Ryzen 9 9950X',16,32,16,64,170,4.3,5.7,'Choose a high-capacity cooler; none is included.',true,'2024-08'),
  amd('ryzen-9-9900x','Ryzen 9 9900X',12,24,12,64,120,4.4,5.6,'Choose a cooler rated for 120 W TDP or more.',true,'2024-08'),
  amd('ryzen-7-9850x3d','Ryzen 7 9850X3D',8,16,8,96,120,4.7,5.6,'Choose a cooler rated for 120 W TDP or more.',true,'2026-01'),
  amd('ryzen-7-9800x3d','Ryzen 7 9800X3D',8,16,8,96,120,4.7,5.2,'Choose a cooler rated for 120 W TDP or more.',true,'2024-11'),
  amd('ryzen-7-9700x','Ryzen 7 9700X',8,16,8,32,65,3.8,5.5,'A mainstream tower cooler is a typical starting point at 65 W TDP.',true,'2024-08'),
  amd('ryzen-5-9600x','Ryzen 5 9600X',6,12,6,32,65,3.9,5.4,'A mainstream tower cooler is a typical starting point at 65 W TDP.',true,'2024-08'),
  ultra('core-ultra-9-285k','Core Ultra 9 285K',8,16,40,36,125,250,3.7,5.7,'2024-10'),
  ultra('core-ultra-7-270k-plus','Core Ultra 7 270K Plus',8,16,40,36,125,null,3.7,5.4,'2026-03'),
  ultra('core-ultra-7-265k','Core Ultra 7 265K',8,12,36,30,125,250,3.9,5.5,'2024-10'),
  ultra('core-ultra-5-250k-plus','Core Ultra 5 250K Plus',6,12,30,30,125,null,4.2,5.3,'2026-03'),
  ultra('core-ultra-5-245k','Core Ultra 5 245K',6,8,26,24,125,159,4.2,5.2,'2024-10'),
  gpu('rtx-4090','NVIDIA','GeForce RTX 4090 24 GB',24,'GDDR6X',450,850,304,3,nvidiaSource,{'CUDA cores':'16384','Boost clock':'2.52 GHz','Memory interface':'384-bit','PCIe':'Gen 4','Display outputs':'HDMI 2.1a + 3 × DisplayPort 1.4a (reference)','Power connectors':'3 × PCIe 8-pin via supplied adapter, or ≥450 W PCIe Gen 5 cable'}),
  gpu('rtx-4080-super','NVIDIA','GeForce RTX 4080 SUPER 16 GB',16,'GDDR6X',320,750,304,3,nvidiaSource,{'CUDA cores':'10240','Boost clock':'2.55 GHz','Memory interface':'256-bit','PCIe':'Gen 4','Display outputs':'HDMI 2.1a + 3 × DisplayPort 1.4a (reference)','Power connectors':'3 × PCIe 8-pin via supplied adapter, or ≥450 W PCIe Gen 5 cable'}),
  gpu('rtx-4070-ti-super','NVIDIA','GeForce RTX 4070 Ti SUPER 16 GB',16,'GDDR6X',285,700,null,null,nvidiaSource,{'CUDA cores':'8448','Boost clock':'2.61 GHz','Memory interface':'256-bit','PCIe':'Gen 4','Display outputs':'HDMI 2.1a + 3 × DisplayPort 1.4a (reference)','Power connectors':'2 × PCIe 8-pin via adapter, or ≥300 W PCIe Gen 5 cable; check card'}),
  gpu('rtx-4070-super','NVIDIA','GeForce RTX 4070 SUPER 12 GB',12,'GDDR6X',220,650,244,2,nvidiaSource,{'CUDA cores':'7168','Boost clock':'2.48 GHz','Memory interface':'192-bit','PCIe':'Gen 4','Display outputs':'HDMI 2.1a + 3 × DisplayPort 1.4a (reference)','Power connectors':'2 × PCIe 8-pin via adapter or ≥300 W PCIe Gen 5; some partner cards use 8-pin'}),
  gpu('rtx-4060','NVIDIA','GeForce RTX 4060 8 GB',8,'GDDR6',115,550,null,2,nvidiaSource,{'CUDA cores':'3072','Boost clock':'2.46 GHz','Memory interface':'128-bit','PCIe':'Gen 4','Display outputs':'HDMI 2.1a + 3 × DisplayPort 1.4a (reference)','Power connectors':'Varies by board partner; verify the exact card manual'}),
  gpu('rx-7900-xtx','AMD','Radeon RX 7900 XTX 24 GB',24,'GDDR6',355,800,287,2.5,amdGPU+'amd-radeon-rx-7900xtx.html',{'Compute units':'96','Boost clock':'Up to 2.5 GHz','Memory bandwidth':'Up to 960 GB/s','Infinity Cache':'96 MB','Display output standards':'DisplayPort 2.1, HDMI 2.1, USB-C (reference)','Power connectors':'2 × 8-pin (reference)'}),
  gpu('rx-7900-xt','AMD','Radeon RX 7900 XT 20 GB',20,'GDDR6',315,750,276,2.5,amdGPU+'amd-radeon-rx-7900xt.html',{'Compute units':'84','Boost clock':'Up to 2.4 GHz','Memory bandwidth':'Up to 800 GB/s','Infinity Cache':'80 MB','Display output standards':'DisplayPort 2.1, HDMI 2.1, USB-C (reference)','Power connectors':'2 × 8-pin (reference)'}),
  gpu('rx-7800-xt','AMD','Radeon RX 7800 XT 16 GB',16,'GDDR6',263,700,267,2.5,amdGPU+'amd-radeon-rx-7800-xt.html',{'Compute units':'60','Boost clock':'Up to 2.43 GHz','Memory bandwidth':'Up to 624 GB/s','Infinity Cache':'64 MB','Display output standards':'DisplayPort 2.1, HDMI 2.1 (reference)','Power connectors':'2 × 8-pin (reference)'}),
  gpu('rx-7700-xt','AMD','Radeon RX 7700 XT 12 GB',12,'GDDR6',245,700,267,2.5,amdGPU+'amd-radeon-rx-7700-xt.html',{'Compute units':'54','Boost clock':'Up to 2.544 GHz','Memory bandwidth':'Up to 432 GB/s','Infinity Cache':'48 MB','Display output standards':'DisplayPort 2.1, HDMI 2.1 (reference)','Power connectors':'2 × 8-pin (reference)'}),
  gpu('rx-7600','AMD','Radeon RX 7600 8 GB',8,'GDDR6',165,550,204,2,amdGPU+'amd-radeon-rx-7600.html',{'Compute units':'32','Boost clock':'Up to 2.655 GHz','Memory bandwidth':'Up to 288 GB/s','Infinity Cache':'32 MB','Display output standards':'Up to DisplayPort 2.1, HDMI 2.1; check exact model','Power connectors':'1 × 8-pin (reference)'}),
  amd('ryzen-9-7950x','Ryzen 9 7950X',16,32,16,64,170,4.5,5.7,'AMD recommends liquid cooling for optimal performance.'),
  amd('ryzen-9-7900x','Ryzen 9 7900X',12,24,12,64,170,4.7,5.6,'AMD recommends liquid cooling for optimal performance.'),
  amd('ryzen-7-7800x3d','Ryzen 7 7800X3D',8,16,8,96,120,4.2,5,'AMD recommends liquid cooling for optimal performance.'),
  amd('ryzen-7-7700x','Ryzen 7 7700X',8,16,8,32,105,4.5,5.4,'AMD recommends a premium air cooler for optimal performance.'),
  amd('ryzen-5-7600x','Ryzen 5 7600X',6,12,6,32,105,4.7,5.3,'AMD recommends a premium air cooler for optimal performance.'),
  intel('core-i9-14900k','Core i9-14900K','236773',8,16,32,32,36,125,253,3.2,6,'770'),
  intel('core-i7-14700k','Core i7-14700K','236783',8,12,28,28,33,125,253,3.4,5.6,'770'),
  intel('core-i5-14600k','Core i5-14600K','236799',6,8,20,20,24,125,181,3.5,5.3,'770'),
  intel('core-i5-14400f','Core i5-14400F','236777',6,4,16,9.5,20,65,148,2.5,4.7,null),
  intel('core-i3-14100','Core i3-14100','236774',4,0,8,5,12,60,110,3.5,4.7,'730')
];

for(const p of products)if(p.units===null&&p.type==='gpu')p.units=Number(p.specs['CUDA cores']||p.specs['Compute units'])||null;
export const newest=p=>p.release>='2024-08';

export const glossary = [
  {term:'Cores and threads',definition:'A core executes instructions. A thread is a stream of work the processor can schedule. Some cores support two threads; Intel Performance and Efficient cores have different designs. More threads help only when software can use them.'},
  {term:'Base and boost clocks',definition:'Clock speed measures cycles per second. Boost is conditional on workload, power and cooling. Different architectures do different amounts of work per cycle, so GHz is not a cross-product performance score.'},
  {term:'Cache',definition:'Small, fast memory close to CPU execution units. Its effect depends on the workload and architecture. L2 and L3 serve different roles; adding their capacities does not produce a performance rating.'},
  {term:'Socket',definition:'The physical and electrical CPU connection. A matching socket is necessary but insufficient: check the exact motherboard CPU support list and BIOS version.'},
  {term:'Memory support',definition:'The RAM standards and configurations supported by the CPU and motherboard. DDR4 and DDR5 are not interchangeable. Supported speeds can change with DIMM count and rank; advertised overclocked profiles are not guaranteed.'},
  {term:'VRAM',definition:'Memory dedicated to graphics data, textures and some compute workloads. Insufficient capacity can constrain a workload, but additional VRAM alone does not guarantee higher frame rates.'},
  {term:'Memory bandwidth',definition:'The rate at which data can move to and from memory, usually GB/s. Cache, compression and workload behavior affect how this translates into useful performance.'},
  {term:'GPU power',definition:'TGP and TBP are manufacturer graphics-card power specifications. They describe electrical requirements, not computational speed, and are not the same as a measured wall-power result.'},
  {term:'Ray tracing',definition:'A rendering method that simulates light paths. Its cost varies greatly with game, quality and implementation; compare tests with the same ray-tracing settings.'},
  {term:'Upscaling',definition:'Reconstructs a higher-resolution image from a lower-resolution render. Quality and speed depend on the technique, mode and game. Keep native-resolution and upscaled results separate.'},
  {term:'Frame generation',definition:'Creates additional displayed frames from rendered frames and motion information. The displayed frame rate is not the same as input responsiveness. Compare results with frame generation clearly identified.'},
  {term:'PCIe',definition:'The expansion link used by graphics cards and other devices. Slot size, electrical lane count, generation and shared motherboard lanes all matter. Consult the motherboard slot diagram.'},
  {term:'PSU requirements',definition:'Power-supply sizing must include the complete system, transient loads, connectors and PSU quality. A manufacturer wattage recommendation is a starting point, not proof of compatibility.'},
  {term:'CPU power',definition:'AMD default TDP, Intel Processor Base Power and Intel Maximum Turbo Power use different definitions. None is a gaming performance score or a measured whole-system power total.'}
];
export const benchmarkRuns = [];
export const dataPolicy = {verified,scope:'Current desktop generations — GeForce RTX 50, Radeon RX 9000, Arc B-Series, Ryzen 9000 and Core Ultra 200S (including the 2026 Ryzen 7 9850X3D and Core Ultra 200S Plus) — plus the previous RTX 40, RX 7000, Ryzen 7000 and Core 14th Gen. No new desktop GPU generation launched in 2026 as of this snapshot. Not exhaustive.',benchmarkStatus:'No independently licensed, comparable benchmark dataset is included. Performance results are unavailable; specification values are not performance estimates.',imageStatus:'Retail product photography is not included because redistribution permission has not been established. Any generic hardware illustration must be explicitly labeled conceptual.',priceStatus:'No current, regional or launch pricing dataset is included. No live price integration.'};
