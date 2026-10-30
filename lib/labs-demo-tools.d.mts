export type DemoProduct={id:string;stock:number};
export type StudioBlock={id:string;type:"hero"|"text"|"button";text:string};
export type ManualSample={ok:boolean;ms:number;at?:string};
export type FilterJob={id:string;request:string;status:"proposed"|"approved"|"built"};
export function setCartQuantity(
 cart:Record<string,number>,products:ReadonlyArray<DemoProduct>,
 productId:string,nextQuantity:number
):{ok:boolean;reason?:string;cart:Record<string,number>};
export function parseStudioDocument(raw:string):StudioBlock[];
export function summarizeManualIncidents(
 checks:ReadonlyArray<ManualSample>,slowThresholdMs?:number
):{sampleCount:number;currentFailures:number;longestFailures:number;slowSamples:number;incidents:number};
export function filterFactoryJobs<T extends FilterJob>(jobs:ReadonlyArray<T>,status?:string,search?:string):T[];
