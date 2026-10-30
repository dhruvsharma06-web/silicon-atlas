// Verified manufacturer specifications, 30 October 2026. No performance measurements are inferred.
const verified = '2026-10-30';
const nvidiaSource = 'https://www.nvidia.com/en-gb/geforce/graphics-cards/compare/';
const amdGPU = 'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/';
const amdCPU = 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/';
const intelCPU = 'https://www.intel.com/content/www/us/en/products/sku/';
const gpuRequirements = [
  'Check the exact board-partner model: its cooler, dimensions, connectors and power limits can differ from the reference specification.',
  'Confirm a suitable motherboard PCIe expansion slot, case length and thickness clearance, and clearance for the power cable bend.',
  'Verify PSU model, age, available connectors and the complete system load. A manufacturer PSU recommendation is not measured whole-system consumption.',
  'Check the exact card outputs, monitor input, cable bandwidth and display mode. A supported display resolution is not a gaming frame-rate guarantee.'
];
function gpu(id, vendor, name, memory, memoryType, power, psu, length, slots, source, extra) {
  return { id, type:'gpu', vendor, name, generation:vendor==='NVIDIA'?'GeForce RTX 40':'Radeon RX 7000', memory, memoryType, power,
    powerLabel:vendor==='NVIDIA'?'Total Graphics Power':'Typical Board Power', socket:null, cores:null, threads:null, cache:null, igpu:null,
    psu, length, slots, image:null, source, verified, features:['Ray tracing','AV1 encode',vendor==='NVIDIA'?'DLSS':'FSR'],
    specs:{'VRAM':`${memory} GB ${memoryType}`,'Power specification':`${power} W ${vendor==='NVIDIA'?'TGP':'TBP'}`,'Manufacturer PSU guidance':`${psu} W; system-dependent`,'Reference length':length===null?'Not available — check exact card':`${length} mm`,'Reference thickness':slots===null?'Not available — check exact card':`${slots} slots`,...extra},
    notes:'Reference specifications. AV1 hardware encoding can support compatible recording and video workflows; application support varies. Comparable workload benchmarks are not available in this catalogue.',
    requirements:gpuRequirements,
    provenance:[{group:'Specifications and reference requirements',url:source,verified}], benchmarks:[] };
}
function amd(id, name, cores, threads, l2, l3, power, base, boost, cooler) {
  const source=amdCPU+`amd-${id}.html`;
  return {id,type:'cpu',vendor:'AMD',name,generation:'Ryzen 7000',memory:null,memoryType:'DDR5',power,powerLabel:'Default TDP',socket:'AM5',cores,threads,cache:`${l3} MB L3`,igpu:true,psu:null,length:null,slots:null,image:null,source,verified,
    features:['Integrated graphics','DDR5'],
    specs:{'Cores / threads':`${cores} / ${threads}`,'Socket':'AM5','Architecture':'Zen 4','Base clock':`${base} GHz`,'Maximum boost':`Up to ${boost} GHz`,'L2 cache':`${l2} MB`,'L3 cache':`${l3} MB`,'Power specification':`${power} W default TDP`,'Memory support':'DDR5 UDIMM, 2 channels','Official memory speed':'DDR5-5200 with 2 DIMMs; DDR5-3600 with 4 DIMMs','Integrated graphics':'AMD Radeon Graphics (2 graphics cores)','Included cooler':'None'},
    notes:id.includes('x3d')?'Additional L3 cache is a design feature, not a universal performance score. Verify results for your games and applications.':'Core count describes parallel resources; software scaling and per-core performance still matter. No comparable workload benchmarks are included.',
    requirements:[`Use an AM5 motherboard that explicitly lists ${name} in its CPU support list. Check the required BIOS before installation.`, 'Use DDR5 memory; DDR4 cannot be reused on this platform. Consult the board memory support list and DIMM population guide.', `${cooler} Confirm AM5 mounting support, case clearance and motherboard power delivery. A cooler is not included.`, 'Integrated Radeon graphics are available; confirm the motherboard has the display outputs you need.', 'Chipset, BIOS and board implementation determine available PCIe and I/O features. Matching the socket alone does not establish compatibility.', 'TDP is a thermal design specification, not a measured complete-system power draw.'],
    provenance:[{group:'Specifications and platform requirements',url:source,verified}],benchmarks:[]};
}
function intel(id,name,sku,p,e,threads,l2,l3,power,turbo,base,boost,igpu) {
  const source=intelCPU+`${sku}/intel-core-${id.replace('core-','').replace('-','-processor-')}-${l3}m-cache-up-to-${boost.toFixed(2).replace('.','-')}-ghz/specifications.html`;
  return {id,type:'cpu',vendor:'Intel',name,generation:'Core 14th Gen',memory:null,memoryType:'DDR4 / DDR5',power,powerLabel:'Processor Base Power',socket:'LGA1700',cores:p+e,threads,cache:`${l3} MB Smart Cache`,igpu:!!igpu,psu:null,length:null,slots:null,image:null,source,verified,
    features:[...(igpu?['Integrated graphics']:[]),'DDR4','DDR5'],
    specs:{'Cores / threads':`${p+e} / ${threads}`,'Core configuration':`${p} Performance + ${e} Efficient`,'Socket':'LGA1700','P-core base clock':`${base} GHz`,'Maximum turbo':`Up to ${boost} GHz`,'L2 cache':`${l2} MB`,'L3 cache':`${l3} MB Intel Smart Cache`,'Power specification':`${power} W Processor Base Power`,'Maximum Turbo Power':`${turbo} W`,'Memory support':'DDR4 or DDR5; motherboard-specific','Official memory speed':`Up to DDR5-${id.includes('14400')||id.includes('14100')?'4800':'5600'} / DDR4-3200`,'Integrated graphics':igpu?`Intel UHD Graphics ${igpu}`:'None — discrete graphics required'},
    notes:e?`${p} Performance cores and ${e} Efficient cores serve different roles. Their total is not equivalent to the same number of identical cores. Compare application results, not core counts alone.`:'Four Performance cores with eight threads. Core count and clock speed alone do not predict application performance.',
    requirements:[`Use an LGA1700 motherboard whose CPU support list explicitly includes ${name}; confirm the minimum BIOS and current manufacturer firmware.`, 'Choose DDR4 or DDR5 to match the motherboard. The processor supports both, but a typical board accepts only one type.', `Choose an LGA1700-compatible cooler and suitable motherboard power delivery for the configured power limits; Maximum Turbo Power is ${turbo} W.`, igpu?'Integrated graphics are present; the motherboard must provide an appropriate monitor output.':'This F-series processor has no integrated graphics. A discrete GPU is required for display output.', 'Use current board firmware and recommended default power settings. Confirm cooler mounting, case clearance and PSU capacity for the whole build.'],
    provenance:[{group:'Specifications and platform requirements',url:source,verified}],benchmarks:[]};
}
/** @type {import('./types').Product[]} */
export const products = [
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
export const dataPolicy = {verified,scope:'Selected established desktop products: GeForce RTX 40, Radeon RX 7000, Ryzen 7000 and Intel Core 14th Gen. Not an exhaustive or latest-generation catalogue.',benchmarkStatus:'No independently licensed, comparable benchmark dataset is included. Performance results are unavailable; specification values are not performance estimates.',imageStatus:'Retail product photography is not included because redistribution permission has not been established. Any generic hardware illustration must be explicitly labeled conceptual.',priceStatus:'No current, regional or launch pricing dataset is included. No live price integration.'};
