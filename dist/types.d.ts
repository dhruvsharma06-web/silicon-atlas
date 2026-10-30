export interface SourceReference { group:string; url:string; verified:string }
export interface ProductVariant { id:string; manufacturer:string; productId:string; image:string|null; length:number|null; slots:number|null; powerConnectors:string|null }
export interface Product {
 id:string; type:'cpu'|'gpu'; vendor:'AMD'|'Intel'|'NVIDIA'; name:string; generation:string;
 memory:number|null; memoryType:string; power:number; powerLabel:string; socket:string|null;
 cores:number|null; threads:number|null; cache:string|null; igpu:boolean|null;
 psu:number|null; length:number|null; slots:number|null; image:string|null; source:string; verified:string;
 features:string[]; specs:Record<string,string>; notes:string; requirements:string[]; provenance:SourceReference[]; benchmarks:BenchmarkRun[];
}
export interface TestConditions { application:string; version:string|null; resolution:string|null; quality:string; rayTracing:string; renderingMode:string; frameGeneration:boolean; platform:string; driver:string|null; date:string }
export interface BenchmarkRun { productId:string; category:'rasterization'|'ray-tracing'|'single-thread'|'multi-thread'|'creator'|'gaming'; metric:string; value:number; unit:string; higherIsBetter:boolean; conditions:TestConditions; source:SourceReference; license:string }
export interface CompatibilityRequirement { productId:string; component:string; status:'change'|'verify'|'likely-reusable'; reason:string; source:SourceReference|null }
