export type ExportOrder={total:number;count:number;id?:number;createdAt?:string};
export type ExportBlock={id:string;type:"hero"|"text"|"button";text:string};
export type ExportCheck={at:string;ok:boolean;ms:number};
export type FactoryAuditJob={request:string;kind:string;status:string;events:{stage:string;detail:string;at?:string}[];qa:{passed:boolean;checks:{name:string;passed:boolean}[]}|null};
export function commerceLedgerCsv(orders:ReadonlyArray<ExportOrder>,local?:boolean):string;
export function studioDocumentJson(blocks:ReadonlyArray<ExportBlock>,local?:boolean,revision?:number|null):string;
export function monitorSamplesCsv(checks:ReadonlyArray<ExportCheck>,local?:boolean):string;
export function factoryAuditMarkdown(job:FactoryAuditJob):string;
