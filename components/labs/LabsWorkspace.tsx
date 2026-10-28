"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { seedProducts, addToCart, placeOrder, moveBlock, renderPageHtml, summarizeChecks, observedAvailability, buildFactoryProposal, renderFactoryIssueMarkdown, filterProducts, successfulLatencyP95, reviewFactoryPlan } from "../../lib/labs-core.mjs";
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
  const [sqliteMode,setSqliteMode]=useState(false);
  const [sqliteBusy,setSqliteBusy]=useState(false);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("all");
  const [blocks,setBlocks]=useState<Block[]>(initialBlocks);
  const [selected,setSelected]=useState(0);
  const [undoBlocks,setUndoBlocks]=useState<Block[][]>([]);
  const [redoBlocks,setRedoBlocks]=useState<Block[][]>([]);
  const editorSnapshot=useRef<Block[]|null>(null);
  const [checks,setChecks]=useState<Check[]>([]);
  const [isChecking,setIsChecking]=useState(false);
  const [request,setRequest]=useState("Create an accessible registration form with email validation");
  const [kind,setKind]=useState("feature");
  const [proposals,setProposals]=useState<Proposal[]>([]);
  const [selectedProposal,setSelectedProposal]=useState(0);
  const [reviewConfirmed,setReviewConfirmed]=useState(false);
  const [notice,setNotice]=useState("");
  const [ready,setReady]=useState(false);
  const isSpanish=language==="es";
  useEffect(()=>{const frame=requestAnimationFrame(()=>{const query=new URLSearchParams(window.location.search).get("lab");if(projects.some(p=>p.id===query))setActive(query as LabId);setInventory(stored("inventory",[...seedProducts]));setCart(stored("cart",{}));setOrders(stored("orders",[]));setBlocks(stored("blocks",initialBlocks));setChecks(stored("checks",[]));setProposals(stored("proposals",[]));setReady(true);});return ()=>cancelAnimationFrame(frame);},[]);
  useEffect(()=>{if(!ready)return;for(const [name,value] of Object.entries({inventory,cart,orders,blocks,checks,proposals})){if(sqliteMode && (name==="inventory"||name==="cart"||name==="orders"))continue;try{localStorage.setItem(key(name),JSON.stringify(value));}catch{}}},[ready,sqliteMode,inventory,cart,orders,blocks,checks,proposals]);
  const btn="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-red-400 disabled:opacity-40";
  const primary="rounded-xl bg-[#de4e65] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#bc304c] focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40";
  const card="rounded-2xl border border-white/10 bg-[#1e1e23] p-5";
  const money=(n:number)=>new Intl.NumberFormat(language,{style:"currency",currency:"USD"}).format(n);
  const total=inventory.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0);
  const proposal=proposals[selectedProposal];
  const filteredInventory=filterProducts(inventory,search,category);
  const p95=successfulLatencyP95(checks);
  function updateBlock(text:string){setBlocks(previous=>previous.map((block,index)=>index===selected?{...block,text}:block));}
  function downloadHtml(){const blob=new Blob([renderPageHtml(blocks)],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="nexus-studio-export.html";a.click();URL.revokeObjectURL(url);}
  async function enableSqlite(){
    if(sqliteBusy)return;
    setSqliteBusy(true);
    try {
      const response=await fetch("/api/labs/commerce",{cache:"no-store"});
      const data=await response.json();
      if(!response.ok||!data.ok||!Array.isArray(data.inventory)||!Array.isArray(data.orders))throw new Error(data.reason||"backend-unavailable");
      setSqliteMode(true);setInventory(data.inventory);setOrders(data.orders);setCart({});
      setNotice("Local SQLite connected. Orders now persist on this computer, not in the cloud.");
    }catch{
      setNotice("Local SQLite unavailable. Run npm run dev with NEXUS_LABS_SQLITE=1 and Python installed. Browser demo remains active.");
    }finally{setSqliteBusy(false);}
  }
  function disableSqlite(){
    setSqliteMode(false);setInventory(stored("inventory",[...seedProducts]));setOrders(stored("orders",[]));setCart({});
    setNotice("Browser-only demo restored. SQLite records remain in your local database.");
  }
  async function checkoutOrder(){
    if(!sqliteMode){
      const result=placeOrder(cart,inventory);
      if(!result.ok){setNotice("Unable to place order: "+result.reason);return;}
      setInventory(result.inventory);setOrders(previous=>[{total:result.total,count:result.lines.length},...previous]);setCart({});
      setNotice("Demo order created. Saved in browser storage; no payment was collected.");
      return;
    }
    if(sqliteBusy)return;
    setSqliteBusy(true);
    try{
      const response=await fetch("/api/labs/commerce",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cart}),
      });
      const data=await response.json();
      if(!response.ok||!data.ok){
        if(data.reason==="insufficient-stock"){
          const latest=await fetch("/api/labs/commerce",{cache:"no-store"});
          if(latest.ok){const fresh=await latest.json();setInventory(fresh.inventory);setOrders(fresh.orders);}
        }
        setNotice("SQLite order rejected: "+(data.reason||"backend-error")+". Your cart was not charged.");
        return;
      }
      setInventory(data.inventory);setOrders(data.orders);setCart({});
      setNotice("Order #"+data.orderId+" saved atomically in local SQLite. No payment collected.");
    }catch{setNotice("Local SQLite unavailable. No order was confirmed.");}
    finally{setSqliteBusy(false);}
  }
  async function checkService(){if(isChecking)return;setIsChecking(true);const start=performance.now();try{const response=await fetch("/api/labs/health",{cache:"no-store"});const json=await response.json();const ok=response.ok&&json.status==="ok";setChecks(previous=>[{at:new Date().toISOString(),ok,ms:Math.round(performance.now()-start)},...previous].slice(0,30));}catch{setChecks(previous=>[{at:new Date().toISOString(),ok:false,ms:Math.round(performance.now()-start)},...previous].slice(0,30));}finally{setIsChecking(false);}}
  const stats=summarizeChecks(checks);
  const observed=observedAvailability(checks);
  function editBlocks(next:Block[]){setUndoBlocks(old=>[...old.slice(-19),blocks.map(b=>({...b}))]);setRedoBlocks([]);setBlocks(next);}
  function undoEditor(){const prior=undoBlocks.at(-1);if(!prior)return;setRedoBlocks(old=>[...old.slice(-19),blocks.map(b=>({...b}))]);setBlocks(prior);setUndoBlocks(old=>old.slice(0,-1));setSelected(0);}
  function redoEditor(){const next=redoBlocks.at(-1);if(!next)return;setUndoBlocks(old=>[...old.slice(-19),blocks.map(b=>({...b}))]);setBlocks(next);setRedoBlocks(old=>old.slice(0,-1));setSelected(0);}
  function finishEditingText(){const old=editorSnapshot.current;editorSnapshot.current=null;if(old&&JSON.stringify(old)!==JSON.stringify(blocks)){setUndoBlocks(history=>[...history.slice(-19),old]);setRedoBlocks([]);}}
  function downloadText(name:string,content:string){const blob=new Blob([content],{type:"text/markdown;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
  return <main lang={language} className="min-h-screen bg-[#111115] px-4 py-8 text-[#f6f0ee] sm:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div><p className="text-xs font-semibold uppercase tracking-[.3em] text-[#ed8797]">NEXUS / ENGINEERING LABS</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">{isSpanish?"CUATRO PROYECTOS.":"FOUR PROJECTS."}</h1><p className="mt-2 max-w-2xl text-sm text-stone-400">{isSpanish?"Prototipos interactivos con lógica real. Los límites de cada módulo se muestran con transparencia.":"Interactive prototypes with real application logic. Capabilities and limitations are disclosed."}</p></div>
        <Link href={language==="es"?"/":"/"+language} className={btn}>{isSpanish?"← Volver al portafolio":"← Back to portfolio"}</Link>
      </header>
      <div className="grid gap-5 lg:grid-cols-[245px_1fr]">
        <nav aria-label="Nexus labs" className="flex flex-wrap content-start gap-2 lg:flex-col">
          {projects.map((p,index)=><button key={p.id} type="button" aria-current={active===p.id?"page":undefined} onClick={()=>{setActive(p.id);setNotice("");window.history.replaceState(null,"",window.location.pathname+"?lab="+p.id);}} className={"rounded-2xl border p-4 text-left transition "+(active===p.id?"border-[#de4e65] bg-[#43252c]":"border-white/10 bg-[#1e1e23] hover:border-white/30")}><span className="block text-xs text-[#ed8797]">0{index+1} / {p.category}</span><strong className="mt-1 block text-base">{p.name}</strong></button>)}
        </nav>
        <div className="min-w-0 space-y-5">
          <div className={card}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold">{projects.find(p=>p.id===active)?.name}</h2><span className="rounded-full border border-amber-500/40 px-3 py-1 text-xs text-amber-200">LOCAL MVP · NO PRODUCTION</span></div>
            <p className="mt-2 text-sm leading-6 text-stone-400">{active==="commerce"?"Product catalog, shopping cart, stock validation and simulated checkout. No real payment or server database.":active==="studio"?"Build a landing page, edit text, reorder elements and export safe static HTML.":active==="monitor"?"Checks the health endpoint of this application only. No arbitrary external targets or background polling.":"Rule-based task planning and human-review workflow. No AI inference, repository edits or automatic code execution."}</p>
          </div>
          {notice&&<p role="status" className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm">{notice}</p>}
          {active==="commerce"&&<div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1e1e23] p-4"><div><p className="font-semibold">{sqliteMode?"SQLite backend: active on this computer":"Browser-only demo"}</p><p className="text-xs text-stone-400">{sqliteMode?"Real server-side transactions, local disk persistence. Never enabled in production.":"No server database required. Optional SQLite mode works only on localhost in development."}</p></div>{sqliteMode?<button className={btn} disabled={sqliteBusy} onClick={disableSqlite}>Use browser demo</button>:<button className={btn} disabled={sqliteBusy} onClick={enableSqlite}>{sqliteBusy?"Connecting…":"Use local SQLite"}</button>}</div><div className="grid gap-5 xl:grid-cols-[1fr_290px]">
            <section aria-label="Product catalog"><div className="mb-4 flex flex-col gap-3 sm:flex-row"><label className="flex-1 text-sm">Search products<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Keyboard, audio, displays..." className="mt-2 block w-full rounded-xl border border-white/20 bg-[#111115] p-3 text-white"/></label><label className="text-sm">Category<select value={category} onChange={event=>setCategory(event.target.value)} className="mt-2 block w-full rounded-xl border border-white/20 bg-[#111115] p-3 text-white"><option value="all">All categories</option>{[...new Set(inventory.map(p=>p.category))].map(name=><option key={name} value={name}>{name}</option>)}</select></label></div><p className="mb-3 text-sm text-stone-400" role="status">{filteredInventory.length} products found</p><div className="grid gap-3 sm:grid-cols-2">{filteredInventory.map(p=><article className={card} key={p.id}><div className="mb-4 flex aspect-[8/5] items-center justify-center rounded-xl bg-gradient-to-br from-[#532c39] to-[#24252e] text-5xl" aria-hidden="true">{p.id==="keyboard"?"⌨":p.id==="headset"?"◉":p.id==="monitor"?"▣":"⌁"}</div><p className="text-xs uppercase tracking-widest text-stone-400">{p.category}</p><h3 className="mt-1 text-xl font-bold">{p.name}</h3><p className="mt-2 text-[#ee9dad]">{money(p.price)} · {p.stock} available</p><button className={primary+" mt-4 w-full"} disabled={p.stock<1||(cart[p.id]||0)>=p.stock} onClick={()=>{const result=addToCart(cart,inventory,p.id);if(result.ok)setCart(result.cart);else setNotice("Not enough stock.");}}>Add to cart</button></article>)}{filteredInventory.length===0&&<p className="text-sm text-stone-400">No matching products. Try a different search.</p>}</div></section>
            <aside className={card+" h-fit"}><h3 className="text-xl font-bold">Shopping cart</h3><div className="mt-4 space-y-3">{inventory.filter(p=>(cart[p.id]||0)>0).map(p=><div key={p.id} className="flex items-center justify-between gap-2 text-sm"><span>{p.name} × {cart[p.id]}</span><button className={btn} aria-label={"Remove one "+p.name} onClick={()=>setCart(old=>({...old,[p.id]:Math.max(0,(old[p.id]||0)-1)}))}>−</button></div>)}</div><div className="mt-5 border-t border-white/10 pt-3 text-xl font-bold">{money(total)}</div><button className={primary+" mt-4 w-full"} disabled={total===0||sqliteBusy} onClick={checkoutOrder}>Place demo order</button><p className="mt-4 text-sm text-stone-400">Demo orders: {orders.length}</p><div aria-label="Local order history" className="mt-3 space-y-2">{orders.slice(0,5).map((order,i)=><p key={i} className="rounded-lg bg-[#111115] p-2 text-xs">#{orders.length-i} · {order.count} product lines · {money(order.total)}</p>)}</div>{!sqliteMode&&<button className={btn+" mt-3 w-full"} onClick={()=>{setInventory([...seedProducts]);setCart({});setOrders([]);setNotice("Local commerce demo reset.");}}>Reset demo inventory</button>}</aside>
          </div></div>}
          {active==="studio"&&<div className="grid gap-4 xl:grid-cols-[310px_1fr]">
            <aside className={card+" space-y-4"}><h3 className="font-bold">Page blocks</h3><div className="space-y-2">{blocks.map((b,i)=><button key={b.id} className={"block w-full rounded-lg border p-3 text-left text-sm "+(selected===i?"border-[#de4e65] bg-[#43252c]":"border-white/10")} onClick={()=>setSelected(i)}>{i+1}. {b.type} — {b.text.slice(0,25)}</button>)}</div><div className="flex flex-wrap gap-2">{(["hero","text","button"] as const).map(type=><button key={type} className={btn} onClick={()=>{editBlocks([...blocks,{id:crypto.randomUUID(),type,text:type==="hero"?"New heading":type==="button"?"Click here":"New paragraph"}]);setSelected(blocks.length);}}>+ {type}</button>)}</div>{blocks[selected]&&<><label htmlFor="block-editor" className="block text-sm font-semibold">Selected block text</label><textarea id="block-editor" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" rows={4} maxLength={500} value={blocks[selected].text} onFocus={()=>{editorSnapshot.current=blocks.map(b=>({...b}));}} onBlur={finishEditingText} onChange={e=>updateBlock(e.target.value)}/><div className="flex gap-2"><button className={btn} onClick={()=>{editBlocks(moveBlock(blocks,selected,-1));setSelected(x=>Math.max(0,x-1));}}>↑ Move</button><button className={btn} onClick={()=>{editBlocks(moveBlock(blocks,selected,1));setSelected(x=>Math.min(blocks.length-1,x+1));}}>↓ Move</button><button className={btn} onClick={()=>{editBlocks(blocks.filter((_,i)=>i!==selected));setSelected(0);}}>Delete</button></div></>}<div className="flex gap-2"><button className={btn+" flex-1"} disabled={undoBlocks.length===0} onClick={undoEditor}>Undo</button><button className={btn+" flex-1"} disabled={redoBlocks.length===0} onClick={redoEditor}>Redo</button></div><button className={primary+" w-full"} onClick={downloadHtml}>Export HTML</button></aside>
            <section className={card}><p className="mb-5 text-xs font-semibold uppercase tracking-[.2em] text-stone-400">Live preview</p><div className="min-h-80 rounded-xl bg-[#f7f2ee] p-8 text-[#19191d]">{blocks.map(b=>b.type==="hero"?<h2 key={b.id} className="my-5 text-4xl font-black">{b.text}</h2>:b.type==="button"?<span key={b.id} className="my-3 inline-block rounded-lg bg-[#bd334e] px-5 py-3 font-semibold text-white">{b.text}</span>:<p key={b.id} className="my-4 leading-7">{b.text}</p>)}</div><p className="mt-3 text-xs text-stone-400">Buttons in the preview are visual components; exported output is static HTML.</p></section>
          </div>}
          {active==="monitor"&&<section className={card}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-xl font-bold">Nexus API Health</h3><p className="mt-1 text-sm text-stone-400">GET /api/labs/health · same-origin only</p></div><button className={primary} disabled={isChecking} onClick={checkService}>{isChecking?"Checking…":"Run health check"}</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[{name:"Checks",value:stats.total},{name:"Successful",value:stats.successful},{name:"Average success",value:stats.averageMs===null?"—":stats.averageMs+" ms"}].map(s=><div className="rounded-xl bg-[#111115] p-5" key={s.name}><p className="text-sm text-stone-400">{s.name}</p><strong className="mt-2 block text-3xl">{s.value}</strong></div>)}</div><p className="mt-5 rounded-lg bg-[#111115] p-4 text-sm">Observed successful checks: <strong>{observed.percent===null?"—":observed.percent+"%"}</strong> · Range: {observed.minMs===null?"—":observed.minMs+"–"+observed.maxMs+" ms"} · {observed.sampleCount} samples</p><p className="mt-3 text-sm text-stone-400">p95 successful latency: <strong>{p95===null?"—":p95+" ms"}</strong> (last {checks.length} manually initiated checks)</p><div role="img" aria-label="Last checks latency bars, green successful, red failed" className="mt-4 flex h-24 items-end gap-1 rounded-xl bg-[#111115] p-3">{checks.slice(0,20).reverse().map((entry,i)=><span key={i} title={(entry.ok?"OK ":"ERROR ")+entry.ms+" ms"} className={"min-w-0 flex-1 rounded-t-sm "+(entry.ok?"bg-emerald-400":"bg-rose-500")} style={{height:Math.max(8,Math.min(100,Math.round(entry.ms/Math.max(1,observed.maxMs||1)*100)))+"%"}}/>)}</div><h4 className="mt-8 font-bold">Recent checks</h4><div className="mt-3 space-y-2">{checks.length===0&&<p className="text-sm text-stone-400">No checks yet. Start the first manual probe.</p>}{checks.map((entry,i)=><div key={i} className="flex justify-between rounded-lg bg-[#111115] p-3 text-sm"><span>{new Date(entry.at).toLocaleTimeString(language)}</span><span className={entry.ok?"text-emerald-400":"text-rose-400"}>{entry.ok?"HEALTHY":"ERROR"}</span><span>{entry.ms} ms</span></div>)}</div><button className={btn+" mt-5"} onClick={()=>setChecks([])}>Clear local history</button><p className="mt-4 text-xs text-stone-400">Measures client-observed latency; results are not server logs or continuous uptime evidence.</p></section>}
          {active==="factory"&&<div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <section className={card+" space-y-4"}><h3 className="text-xl font-bold">New engineering request</h3><label htmlFor="factory-request" className="block text-sm">Describe what you want to build</label><textarea id="factory-request" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" maxLength={500} rows={5} value={request} onChange={e=>setRequest(e.target.value)}/><label htmlFor="factory-kind" className="block text-sm">Request type</label><select id="factory-kind" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" value={kind} onChange={e=>setKind(e.target.value)}><option value="feature">Feature</option><option value="bug">Bug fix</option><option value="refactor">Refactor</option></select><button className={primary+" w-full"} onClick={()=>{const p=buildFactoryProposal(request,kind);if(!p){setNotice("Describe a task using 10 to 500 characters.");return;}setProposals(old=>[p,...old].slice(0,15));setSelectedProposal(0);setReviewConfirmed(false);setNotice("Rule-based plan prepared; implementation and testing are NOT automatic.");}}>Create reviewable plan</button><p className="text-xs text-stone-400">This workflow is a deterministic planning prototype. It never modifies code or uses an AI provider.</p></section>
            <section className={card}><h3 className="text-xl font-bold">Review board</h3>{proposals.length>1&&<label className="mt-3 block text-sm">Saved requests<select className="mt-2 block w-full rounded-lg border border-white/20 bg-[#111115] p-3" value={selectedProposal} onChange={event=>{setSelectedProposal(Number(event.target.value));setReviewConfirmed(false);}}>{proposals.map((p,i)=><option key={i} value={i}>{i+1}. {p.request.slice(0,48)}</option>)}</select></label>}{proposal?<><p className="mt-3 text-sm text-stone-300">{proposal.request}</p><span className="mt-3 inline-block rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">{proposal.status}</span><ol className="mt-5 space-y-3">{proposal.stages.map(step=><li key={step.id} className="rounded-xl border border-white/10 p-3"><p className="font-semibold">{step.completed?"✓ ":"○ "}{step.label}</p><p className="mt-1 text-xs text-stone-400">{step.detail}</p></li>)}</ol><h4 className="mt-5 font-semibold">Acceptance checklist</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-400">{proposal.acceptance.map(x=><li key={x}>{x}</li>)}</ul><label className="mt-5 flex items-start gap-2 text-sm text-stone-300"><input type="checkbox" className="mt-1 accent-[#de4e65]" checked={reviewConfirmed} onChange={event=>setReviewConfirmed(event.target.checked)}/>I reviewed this plan. Approval permits manual development only; it does not run code or tests.</label><button className={btn+" mt-3"} disabled={!reviewConfirmed||proposal.status!=="awaiting-review"} onClick={()=>{setProposals(old=>old.map((p,i)=>i===selectedProposal?reviewFactoryPlan(p,true):p));setReviewConfirmed(false);}}>Approve plan (manual work only)</button></>:<p className="mt-4 text-sm text-stone-400">Create a request to generate a reviewable planning checklist.</p>}{proposal&&<button className={btn+" mt-3 w-full"} onClick={()=>downloadText("nexus-factory-issue.md",renderFactoryIssueMarkdown(proposal))}>Export Markdown issue draft</button>}<p className="mt-4 text-xs text-stone-400">Saved local plans: {proposals.length}</p></section>
          </div>}
        </div>
      </div>
    </div>
  </main>;
}
