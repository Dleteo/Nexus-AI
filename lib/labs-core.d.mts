export type Product={id:string;name:string;category:string;price:number;stock:number};
export type Block={id:string;type:"hero"|"text"|"button";text:string};
export type Check={at:string;ok:boolean;ms:number};
export type FactoryProposal={request:string;kind:string;status:string;stages:{id:string;label:string;detail:string;completed:boolean}[];acceptance:string[]};
export const seedProducts:ReadonlyArray<Product>;
export function addToCart(cart:Record<string,number>,inventory:ReadonlyArray<Product>,id:string):{ok:boolean;cart:Record<string,number>;reason?:string};
export function placeOrder(cart:Record<string,number>,inventory:ReadonlyArray<Product>):{ok:boolean;reason?:string;inventory:Product[];total:number;lines:{id:string;name:string;quantity:number;subtotal:number}[]};
export function moveBlock(blocks:ReadonlyArray<Block>,index:number,direction:number):Block[];
export function escapeHtml(value:unknown):string;
export function renderPageHtml(blocks:ReadonlyArray<Block>):string;
export function summarizeChecks(checks:ReadonlyArray<Check>):{total:number;successful:number;failed:number;averageMs:number|null};
export function buildFactoryProposal(request:string,kind?:string):FactoryProposal|null;

export function observedAvailability(checks:ReadonlyArray<Check>):{sampleCount:number;percent:number|null;minMs:number|null;maxMs:number|null};
export function renderFactoryIssueMarkdown(proposal:FactoryProposal|null):string;

export function filterProducts(inventory:ReadonlyArray<Product>,search?:string,category?:string):Product[];
export function successfulLatencyP95(checks:ReadonlyArray<Check>):number|null;
export function reviewFactoryPlan(plan:FactoryProposal,explicitApproval:boolean):FactoryProposal;
