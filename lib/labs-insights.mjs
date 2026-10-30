/**
 * Pure, local and explainable read-only insights for Nexus engineering labs.
 * Does not claim billing, automated uptime or executable-code test coverage.
 */
export function summarizeCart(cart, products) {
  if (!cart || typeof cart !== "object" || Array.isArray(cart) || !Array.isArray(products)) {
    return {valid:false,lines:[],units:0,total:0,reason:"invalid-cart"};
  }
  const keys=Object.keys(cart);
  const known=new Map(products.map(p=>[p.id,p]));
  const lines=[];
  let units=0,total=0;
  for (const id of keys) {
    const item=known.get(id), count=cart[id];
    if (!item || !Number.isSafeInteger(count) || count < 0 ||
        !Number.isSafeInteger(item.stock) || item.stock < 0 || count > item.stock ||
        typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0 ||
        !Number.isSafeInteger(Math.round(item.price*100)) ||
        Math.abs(Math.round(item.price*100)/100-item.price)>0.00001 ||
        typeof item.name !== "string" || item.name.length>100) {
      return {valid:false,lines:[],units:0,total:0,reason:"invalid-cart"};
    }
    if (count===0) continue;
    const priceCents=Math.round(item.price*100), lineCents=priceCents*count;
    if (!Number.isSafeInteger(lineCents) || !Number.isSafeInteger(total+lineCents)) {
      return {valid:false,lines:[],units:0,total:0,reason:"invalid-total"};
    }
    total+=lineCents;units+=count;
    lines.push({id,name:item.name,quantity:count,unitPrice:priceCents/100,subtotal:lineCents/100});
  }
  return {valid:true,lines,units,total:total/100,reason:null};
}

/** Static content checks, not accessibility certification or a test runner. */
export function auditStudioBlocks(blocks) {
  const issues=[];
  if (!Array.isArray(blocks) || blocks.length>30) return {ok:false,issues:["Invalid document structure."],words:0,blocks:0};
  const ids=new Set();
  let heroes=0,words=0;
  for(const block of blocks) {
    if (!block || typeof block.id!=="string" || ids.has(block.id) ||
        !["hero","text","button"].includes(block.type) ||
        typeof block.text!=="string" || block.text.length>500) {
      return {ok:false,issues:["Invalid block data."],words:0,blocks:0};
    }
    ids.add(block.id);
    if(block.type==="hero")heroes++;
    const trimmed=block.text.trim();
    if(!trimmed) issues.push("Empty "+block.type+" block: "+block.id.slice(0,30));
    words+=trimmed ? trimmed.split(/\s+/u).length : 0;
    if(block.type==="button" && trimmed.length>48)issues.push("Long button label: "+block.id.slice(0,30));
  }
  if(heroes===0) issues.push("Add a hero heading for a clearer page hierarchy.");
  if(heroes>1) issues.push("Review multiple hero headings for page hierarchy.");
  if(blocks.length===0) issues.push("Document has no visible content.");
  return {ok:issues.length===0,issues,words,blocks:blocks.length};
}

/** Explicit sample window: these are check counts, NOT time spans. */
export function summarizeSampleWindow(checks,limit=0) {
  if (!Array.isArray(checks) || ![0,5,10,30,100].includes(limit)) {
    return {count:0,success:0,failures:0,successPercent:null,p95Ms:null,checks:[]};
  }
  const selected=(limit===0?checks:checks.slice(0,limit)).filter(x=>
    x && typeof x.ok==="boolean" && Number.isSafeInteger(x.ms) && x.ms>=0 && x.ms<=30000);
  const timings=selected.filter(x=>x.ok).map(x=>x.ms).sort((a,b)=>a-b);
  const p95=timings.length?timings[Math.ceil(timings.length*.95)-1]:null;
  return {count:selected.length,success:timings.length,failures:selected.length-timings.length,
    successPercent:selected.length?Math.round(1000*timings.length/selected.length)/10:null,
    p95Ms:p95,checks:selected};
}

/** Read-only status counts; workflow transitions remain inside the backend. */
export function summarizeFactoryBoard(jobs) {
  if(!Array.isArray(jobs))return {total:0,proposed:0,approved:0,built:0,passedStaticQa:0};
  const result={total:0,proposed:0,approved:0,built:0,passedStaticQa:0};
  for(const job of jobs.slice(0,40)){
    if(!job || !["proposed","approved","built"].includes(job.status))continue;
    result.total++;result[job.status]++;
    if(job.status==="built"&&job.qa?.passed===true)result.passedStaticQa++;
  }
  return result;
}
