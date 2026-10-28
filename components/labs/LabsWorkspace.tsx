"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedProducts, addToCart, placeOrder, moveBlock, renderPageHtml, summarizeChecks, buildFactoryProposal } from "../../lib/labs-core.mjs";
import type { SiteLanguage } from "../../data/site-languages";

type Product = {id:string; name:string; category:string; price:number; stock:number};
type Block = {id:string; type:"hero"|"text"|"button"; text:string};
type Check = {at:string; ok:boolean; ms:number};
type Proposal = {request:string;kind:string;status:string;stages:{id:string;label:string;detail:string;completed:boolean}[];acceptance:string[]};
const initialBlocks:Block[]=[{id:"hero-1",type:"hero",text:"Build something remarkable."},{id:"text-2",type:"text",text:"Your next idea starts here."},{id:"button-3",type:"button",text:"Get started"}];
type LabId = "commerce"|"studio"|"monitor"|"factory";
const projects: {id:LabId;name:string;category:string}[]=[
  {id:"commerce",name:"Nexus Commerce",category:"FULL STACK CONCEPT"},
  {id:"studio",name:"Nexus Studio",category:"FRONTEND EDITOR"},
  {id:"monitor",name:"Nexus Monitor",category:"SERVICE HEALTH"},
  {id:"factory",name:"Nexus Software Factory",category:"WORKFLOW ENGINE"},
];
const key=(name:string)=>"nexus-labs-v1-"+name;
function stored<T>(name:string,fallback:T):T {try{const raw=localStorage.getItem(key(name));return raw ? JSON.parse(raw) as T : fallback;}catch{return fallback;}}
export default function LabsWorkspace({language="es"}:{language?:SiteLanguage}) {
  const [active,setActive]=useState<LabId>("commerce");
  const [inventory,setInventory]=useState<Product[]>([...seedProducts]);
  const [cart,setCart]=useState<Record<string,number>>({});
  const [orders,setOrders]=useState<{total:number;count:number}[]>([]);
  const [blocks,setBlocks]=useState<Block[]>(initialBlocks);
  const [selected,setSelected]=useState(0);
  const [checks,setChecks]=useState<Check[]>([]);
  const [request,setRequest]=useState("Create an accessible registration form with email validation");
  const [kind,setKind]=useState("feature");
  const [proposals,setProposals]=useState<Proposal[]>([]);
  const [notice,setNotice]=useState("");
  const [ready,setReady]=useState(false);
  const isSpanish=language==="es";
  useEffect(()=>{const frame=requestAnimationFrame(()=>{setInventory(stored("inventory",[...seedProducts]));setCart(stored("cart",{}));setOrders(stored("orders",[]));setBlocks(stored("blocks",initialBlocks));setChecks(stored("checks",[]));setProposals(stored("proposals",[]));setReady(true);});return ()=>cancelAnimationFrame(frame);},[]);
  useEffect(()=>{if(!ready)return;for(const [name,value] of Object.entries({inventory,cart,orders,blocks,checks,proposals})){try{localStorage.setItem(key(name),JSON.stringify(value));}catch{}}},[ready,inventory,cart,orders,blocks,checks,proposals]);
  const btn="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-red-400 disabled:opacity-40";
  const primary="rounded-xl bg-[#de4e65] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#bc304c] focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40";
  const card="rounded-2xl border border-white/10 bg-[#1e1e23] p-5";
  const money=(n:number)=>new Intl.NumberFormat(language,{style:"currency",currency:"USD"}).format(n);
  const total=inventory.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0);
  const proposal=proposals[0];
  function updateBlock(text:string){setBlocks(previous=>previous.map((block,index)=>index===selected?{...block,text}:block));}
  function downloadHtml(){const blob=new Blob([renderPageHtml(blocks)],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="nexus-studio-export.html";a.click();URL.revokeObjectURL(url);}
  async function checkService(){const start=performance.now();try{const response=await fetch("/api/labs/health",{cache:"no-store"});const json=await response.json();const ok=response.ok&&json.status==="ok";setChecks(previous=>[{at:new Date().toLocaleTimeString(),ok,ms:Math.round(performance.now()-start)},...previous].slice(0,30));}catch{setChecks(previous=>[{at:new Date().toLocaleTimeString(),ok:false,ms:Math.round(performance.now()-start)},...previous].slice(0,30));}}
  const stats=summarizeChecks(checks);
  return <main lang={language} className="min-h-screen bg-[#111115] px-4 py-8 text-[#f6f0ee] sm:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div><p className="text-xs font-semibold uppercase tracking-[.3em] text-[#ed8797]">NEXUS / ENGINEERING LABS</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">{isSpanish?"CUATRO PROYECTOS.":"FOUR PROJECTS."}</h1><p className="mt-2 max-w-2xl text-sm text-stone-400">{isSpanish?"Prototipos interactivos con lógica real. Los límites de cada módulo se muestran con transparencia.":"Interactive prototypes with real application logic. Capabilities and limitations are disclosed."}</p></div>
        <Link href={language==="es"?"/":"/"+language} className={btn}>{isSpanish?"← Volver al portafolio":"← Back to portfolio"}</Link>
      </header>
      <div className="grid gap-5 lg:grid-cols-[245px_1fr]">
        <nav aria-label="Nexus labs" className="flex flex-wrap content-start gap-2 lg:flex-col">
          {projects.map((p,index)=><button key={p.id} type="button" aria-current={active===p.id?"page":undefined} onClick={()=>{setActive(p.id);setNotice("");}} className={"rounded-2xl border p-4 text-left transition "+(active===p.id?"border-[#de4e65] bg-[#43252c]":"border-white/10 bg-[#1e1e23] hover:border-white/30")}><span className="block text-xs text-[#ed8797]">0{index+1} / {p.category}</span><strong className="mt-1 block text-base">{p.name}</strong></button>)}
        </nav>
        <div className="min-w-0 space-y-5">
          <div className={card}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold">{projects.find(p=>p.id===active)?.name}</h2><span className="rounded-full border border-amber-500/40 px-3 py-1 text-xs text-amber-200">LOCAL MVP · NO PRODUCTION</span></div>
            <p className="mt-2 text-sm leading-6 text-stone-400">{active==="commerce"?"Product catalog, shopping cart, stock validation and simulated checkout. No real payment or server database.":active==="studio"?"Build a landing page, edit text, reorder elements and export safe static HTML.":active==="monitor"?"Checks the health endpoint of this application only. No arbitrary external targets or background polling.":"Rule-based task planning and human-review workflow. No AI inference, repository edits or automatic code execution."}</p>
          </div>
          {notice&&<p role="status" className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm">{notice}</p>}
          {active==="commerce"&&<div className="grid gap-5 xl:grid-cols-[1fr_290px]">
            <section className="grid gap-3 sm:grid-cols-2" aria-label="Product catalog">{inventory.map(p=><article className={card} key={p.id}><div className="mb-4 flex aspect-[8/5] items-center justify-center rounded-xl bg-gradient-to-br from-[#532c39] to-[#24252e] text-5xl" aria-hidden="true">{p.id==="keyboard"?"⌨":p.id==="headset"?"◉":p.id==="monitor"?"▣":"⌁"}</div><p className="text-xs uppercase tracking-widest text-stone-400">{p.category}</p><h3 className="mt-1 text-xl font-bold">{p.name}</h3><p className="mt-2 text-[#ee9dad]">{money(p.price)} · {p.stock} available</p><button className={primary+" mt-4 w-full"} disabled={p.stock<1||(cart[p.id]||0)>=p.stock} onClick={()=>{const result=addToCart(cart,inventory,p.id);if(result.ok)setCart(result.cart);else setNotice("Not enough stock.");}}>Add to cart</button></article>)}</section>
            <aside className={card+" h-fit"}><h3 className="text-xl font-bold">Shopping cart</h3><div className="mt-4 space-y-3">{inventory.filter(p=>(cart[p.id]||0)>0).map(p=><div key={p.id} className="flex items-center justify-between gap-2 text-sm"><span>{p.name} × {cart[p.id]}</span><button className={btn} aria-label={"Remove one "+p.name} onClick={()=>setCart(old=>({...old,[p.id]:Math.max(0,(old[p.id]||0)-1)}))}>−</button></div>)}</div><div className="mt-5 border-t border-white/10 pt-3 text-xl font-bold">{money(total)}</div><button className={primary+" mt-4 w-full"} disabled={total===0} onClick={()=>{const result=placeOrder(cart,inventory);if(!result.ok){setNotice("Unable to place order: "+result.reason);return;}setInventory(result.inventory);setOrders(previous=>[{total:result.total,count:result.lines.length},...previous]);setCart({});setNotice("Demo order created. No payment was collected.");}}>Place demo order</button><p className="mt-4 text-sm text-stone-400">Demo orders: {orders.length}</p><button className={btn+" mt-3 w-full"} onClick={()=>{setInventory([...seedProducts]);setCart({});setOrders([]);setNotice("Local commerce demo reset.");}}>Reset demo inventory</button></aside>
          </div>}
          {active==="studio"&&<div className="grid gap-4 xl:grid-cols-[310px_1fr]">
            <aside className={card+" space-y-4"}><h3 className="font-bold">Page blocks</h3><div className="space-y-2">{blocks.map((b,i)=><button key={b.id} className={"block w-full rounded-lg border p-3 text-left text-sm "+(selected===i?"border-[#de4e65] bg-[#43252c]":"border-white/10")} onClick={()=>setSelected(i)}>{i+1}. {b.type} — {b.text.slice(0,25)}</button>)}</div><div className="flex flex-wrap gap-2">{(["hero","text","button"] as const).map(type=><button key={type} className={btn} onClick={()=>{setBlocks(old=>[...old,{id:crypto.randomUUID(),type,text:type==="hero"?"New heading":type==="button"?"Click here":"New paragraph"}]);setSelected(blocks.length);}}>+ {type}</button>)}</div>{blocks[selected]&&<><label htmlFor="block-editor" className="block text-sm font-semibold">Selected block text</label><textarea id="block-editor" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" rows={4} maxLength={500} value={blocks[selected].text} onChange={e=>updateBlock(e.target.value)}/><div className="flex gap-2"><button className={btn} onClick={()=>{setBlocks(old=>moveBlock(old,selected,-1));setSelected(x=>Math.max(0,x-1));}}>↑ Move</button><button className={btn} onClick={()=>{setBlocks(old=>moveBlock(old,selected,1));setSelected(x=>Math.min(blocks.length-1,x+1));}}>↓ Move</button><button className={btn} onClick={()=>{setBlocks(old=>old.filter((_,i)=>i!==selected));setSelected(0);}}>Delete</button></div></>}<button className={primary+" w-full"} onClick={downloadHtml}>Export HTML</button></aside>
            <section className={card}><p className="mb-5 text-xs font-semibold uppercase tracking-[.2em] text-stone-400">Live preview</p><div className="min-h-80 rounded-xl bg-[#f7f2ee] p-8 text-[#19191d]">{blocks.map(b=>b.type==="hero"?<h2 key={b.id} className="my-5 text-4xl font-black">{b.text}</h2>:b.type==="button"?<span key={b.id} className="my-3 inline-block rounded-lg bg-[#bd334e] px-5 py-3 font-semibold text-white">{b.text}</span>:<p key={b.id} className="my-4 leading-7">{b.text}</p>)}</div><p className="mt-3 text-xs text-stone-400">Buttons in the preview are visual components; exported output is static HTML.</p></section>
          </div>}
          {active==="monitor"&&<section className={card}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-xl font-bold">Nexus API Health</h3><p className="mt-1 text-sm text-stone-400">GET /api/labs/health · same-origin only</p></div><button className={primary} onClick={checkService}>Run health check</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[{name:"Checks",value:stats.total},{name:"Successful",value:stats.successful},{name:"Average success",value:stats.averageMs===null?"—":stats.averageMs+" ms"}].map(s=><div className="rounded-xl bg-[#111115] p-5" key={s.name}><p className="text-sm text-stone-400">{s.name}</p><strong className="mt-2 block text-3xl">{s.value}</strong></div>)}</div><h4 className="mt-8 font-bold">Recent checks</h4><div className="mt-3 space-y-2">{checks.length===0&&<p className="text-sm text-stone-400">No checks yet. Start the first manual probe.</p>}{checks.map((entry,i)=><div key={i} className="flex justify-between rounded-lg bg-[#111115] p-3 text-sm"><span>{entry.at}</span><span className={entry.ok?"text-emerald-400":"text-rose-400"}>{entry.ok?"HEALTHY":"ERROR"}</span><span>{entry.ms} ms</span></div>)}</div><button className={btn+" mt-5"} onClick={()=>setChecks([])}>Clear local history</button><p className="mt-4 text-xs text-stone-400">Measures client-observed latency; results are not server logs or continuous uptime evidence.</p></section>}
          {active==="factory"&&<div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <section className={card+" space-y-4"}><h3 className="text-xl font-bold">New engineering request</h3><label htmlFor="factory-request" className="block text-sm">Describe what you want to build</label><textarea id="factory-request" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" maxLength={500} rows={5} value={request} onChange={e=>setRequest(e.target.value)}/><label htmlFor="factory-kind" className="block text-sm">Request type</label><select id="factory-kind" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" value={kind} onChange={e=>setKind(e.target.value)}><option value="feature">Feature</option><option value="bug">Bug fix</option><option value="refactor">Refactor</option></select><button className={primary+" w-full"} onClick={()=>{const p=buildFactoryProposal(request,kind);if(!p){setNotice("Describe a task using 10 to 500 characters.");return;}setProposals(old=>[p,...old].slice(0,15));setNotice("Rule-based plan prepared; implementation and testing are NOT automatic.");}}>Create reviewable plan</button><p className="text-xs text-stone-400">This workflow is a deterministic planning prototype. It never modifies code or uses an AI provider.</p></section>
            <section className={card}><h3 className="text-xl font-bold">Review board</h3>{proposal?<><p className="mt-3 text-sm text-stone-300">{proposal.request}</p><span className="mt-3 inline-block rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">{proposal.status}</span><ol className="mt-5 space-y-3">{proposal.stages.map(step=><li key={step.id} className="rounded-xl border border-white/10 p-3"><p className="font-semibold">{step.completed?"✓ ":"○ "}{step.label}</p><p className="mt-1 text-xs text-stone-400">{step.detail}</p></li>)}</ol><h4 className="mt-5 font-semibold">Acceptance checklist</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-400">{proposal.acceptance.map(x=><li key={x}>{x}</li>)}</ul><button className={btn+" mt-5"} onClick={()=>setProposals(old=>old.map((p,i)=>i===0?{...p,status:"approved-for-manual-work"}:p))}>Approve plan (manual work only)</button></>:<p className="mt-4 text-sm text-stone-400">Create a request to generate a reviewable planning checklist.</p>}<p className="mt-4 text-xs text-stone-400">Saved local plans: {proposals.length}</p></section>
          </div>}
        </div>
      </div>
    </div>
  </main>;
}
