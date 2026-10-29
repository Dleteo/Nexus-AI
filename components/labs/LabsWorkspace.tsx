"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import FactoryExecutionStatus from "./FactoryExecutionStatus";
import "./lab-themes.css";
import "./commerce-premium.css";
import "./studio-premium.css";
import "./monitor-premium.css";
import MonitorStatusDashboard from "./MonitorStatusDashboard";
import StudioDesignerCanvas, {type StudioDesign, type StudioViewport} from "./StudioDesignerCanvas";
import {STUDIO_DEFAULT_DESIGN, normalizeStudioDesign, renderDesignedStudioHtml} from "../../lib/labs-studio-design.mjs";
import LabQuickStart from "./LabQuickStart";
import LabProductOverview from "./LabProductOverview";
import CommerceProductPhoto from "./CommerceProductPhoto";
import {summarizeCart,auditStudioBlocks,summarizeSampleWindow,summarizeFactoryBoard} from "../../lib/labs-insights.mjs";
import {setCartQuantity,parseStudioDocument,summarizeManualIncidents,filterFactoryJobs} from "../../lib/labs-demo-tools.mjs";
import {commerceLedgerCsv,studioDocumentJson,monitorSamplesCsv,factoryAuditMarkdown} from "../../lib/labs-exports.mjs";
import { seedProducts, addToCart, placeOrder, moveBlock, renderPageHtml, summarizeChecks, observedAvailability, buildFactoryProposal, renderFactoryIssueMarkdown, filterProducts, successfulLatencyP95, reviewFactoryPlan } from "../../lib/labs-core.mjs";
import { portfolioPath, type SiteLanguage } from "../../data/site-languages";

type Product = {id:string; name:string; category:string; price:number; stock:number};
type Block = {id:string; type:"hero"|"text"|"button"; text:string};
type Check = {at:string; ok:boolean; ms:number};
type MonitorAlert = {level:"unknown"|"healthy"|"warning"|"critical";message:string;consecutiveFailures:number;successPercent:number|null;p95Ms:number|null;samples:number};
type MonitorData = {ok:boolean;reason?:string;checks?:Check[];alert?:MonitorAlert;mode?:string};
type Proposal = {request:string;kind:string;status:string;stages:{id:string;label:string;detail:string;completed:boolean}[];acceptance:string[]};
type FactoryExecutionState = {enabled:false;status:"not_run";reason:"isolation_not_verified"};
type FactoryJob = {id:string;request:string;kind:string;status:"proposed"|"approved"|"built";createdAt:string;plan:{template:string;scope:string;files:string[];stages:string[];acceptance:string[]};events:{stage:string;detail:string;at:string}[];qa:{passed:boolean;checks:{name:string;passed:boolean}[];mode:string}|null;downloadReady:boolean;execution:FactoryExecutionState};
type FactorySourcePreview = {jobId:string;files:{name:string;content:string;sha256:string}[];qa:{passed:boolean;checks:{name:string;passed:boolean}[];mode:string};note:string;execution:FactoryExecutionState;snapshot:{sha256:string;fileCount:number;totalBytes:number}};
type FactoryResponse = {ok:boolean;reason?:string;job?:FactoryJob;jobs?:FactoryJob[];preview?:FactorySourcePreview};
type StudioRevision = {revision:number;createdAt:string};
type StudioResponse = {ok:boolean;reason?:string;revision?:number;blocks?:Block[];revisions?:StudioRevision[]};
const initialBlocks:Block[]=[{id:"hero-1",type:"hero",text:"Build something remarkable."},{id:"text-2",type:"text",text:"Your next idea starts here."},{id:"button-3",type:"button",text:"Get started"}];
export type LabId = "commerce"|"studio"|"monitor"|"factory";
const projects: {id:LabId;name:string;category:string}[]=[
  {id:"commerce",name:"Nexus Commerce",category:"FULL STACK CONCEPT"},
  {id:"studio",name:"Nexus Studio",category:"FRONTEND EDITOR"},
  {id:"monitor",name:"Nexus Monitor",category:"SERVICE HEALTH"},
  {id:"factory",name:"Nexus Software Factory",category:"WORKFLOW ENGINE"},
];
const shellCopy = {
  es: {back:"Volver al portafolio",other:"Otros proyectos",guide:"Guía y alcance del proyecto",study:"Arquitectura y pruebas",demo:"Demostración interactiva",all:"Los cuatro laboratorios",intro:"Explora cada proyecto en su propio espacio.",scope:"Prototipo local"},
  en: {back:"Back to portfolio",other:"Other projects",guide:"Project guide and scope",study:"Architecture and tests",demo:"Interactive demonstration",all:"The four labs",intro:"Explore each project in its own workspace.",scope:"Local prototype"},
  de: {back:"Zurück zum Portfolio",other:"Weitere Projekte",guide:"Projektanleitung und Umfang",study:"Architektur und Tests",demo:"Interaktive Demonstration",all:"Die vier Labs",intro:"Jedes Projekt hat seinen eigenen Arbeitsbereich.",scope:"Lokaler Prototyp"},
  fr: {back:"Retour au portfolio",other:"Autres projets",guide:"Guide et portée du projet",study:"Architecture et tests",demo:"Démonstration interactive",all:"Les quatre laboratoires",intro:"Explorez chaque projet dans son propre espace.",scope:"Prototype local"},
  pt: {back:"Voltar ao portfólio",other:"Outros projetos",guide:"Guia e escopo do projeto",study:"Arquitetura e testes",demo:"Demonstração interativa",all:"Os quatro laboratórios",intro:"Explore cada projeto em seu próprio espaço.",scope:"Protótipo local"},
} as const;
const projectDescriptions:Record<LabId,Record<SiteLanguage,string>> = {
  commerce:{es:"Catálogo, carrito e inventario para compras de demostración.",en:"Catalog, cart and inventory for simulated shopping.",de:"Katalog, Warenkorb und Lager für simulierte Einkäufe.",fr:"Catalogue, panier et stock pour des achats simulés.",pt:"Catálogo, carrinho e estoque para compras simuladas."},
  studio:{es:"Un lienzo para editar bloques, probar ideas y exportar HTML.",en:"A canvas for editing blocks, trying ideas and exporting HTML.",de:"Eine Arbeitsfläche für Blöcke, Ideen und HTML-Export.",fr:"Un canevas pour éditer des blocs, explorer et exporter du HTML.",pt:"Uma tela para editar blocos, explorar ideias e exportar HTML."},
  monitor:{es:"Comprobaciones manuales, latencia e historial de la API local.",en:"Manual checks, latency and history for the local API.",de:"Manuelle Prüfungen, Latenz und Verlauf der lokalen API.",fr:"Contrôles manuels, latence et historique de l’API locale.",pt:"Verificações manuais, latência e histórico da API local."},
  factory:{es:"Organiza solicitudes, revisa planes y prepara entregas controladas.",en:"Organize requests, review plans and prepare controlled handoffs.",de:"Anfragen ordnen, Pläne prüfen und kontrollierte Pakete vorbereiten.",fr:"Organiser les demandes, revoir les plans et préparer les livraisons.",pt:"Organize solicitações, revise planos e prepare entregas controladas."},
};
const projectMarks:Record<LabId,string>={commerce:"◫",studio:"✦",monitor:"⌁",factory:"▧"};
const labStudySlugs:Record<LabId,string>={commerce:"nexus-commerce",studio:"nexus-studio",monitor:"nexus-monitor",factory:"nexus-software-factory"};
const key=(name:string)=>"nexus-labs-v1-"+name;
function stored<T>(name:string,fallback:T):T {try{const raw=localStorage.getItem(key(name));return raw ? JSON.parse(raw) as T : fallback;}catch{return fallback;}}
export default function LabsWorkspace({language="es",initialLab="commerce",standalone=false}:{language?:SiteLanguage;initialLab?:LabId;standalone?:boolean}) {
  const [active,setActive]=useState<LabId>(initialLab);
  const [inventory,setInventory]=useState<Product[]>([...seedProducts]);
  const [cart,setCart]=useState<Record<string,number>>({});
  const [orders,setOrders]=useState<{total:number;count:number}[]>([]);
  const [sqliteMode,setSqliteMode]=useState(false);
  const [sqliteBusy,setSqliteBusy]=useState(false);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("all");
  const [studioImport,setStudioImport]=useState<Block[]|null>(null);
  const [studioDesign,setStudioDesign]=useState<StudioDesign>({...STUDIO_DEFAULT_DESIGN});
  const [studioViewport,setStudioViewport]=useState<StudioViewport>("desktop");
  const [blocks,setBlocks]=useState<Block[]>(initialBlocks);
  const [selected,setSelected]=useState(0);
  const [undoBlocks,setUndoBlocks]=useState<Block[][]>([]);
  const [redoBlocks,setRedoBlocks]=useState<Block[][]>([]);
  const editorSnapshot=useRef<Block[]|null>(null);
  const [studioLocal,setStudioLocal]=useState(false);
  const [studioBusy,setStudioBusy]=useState(false);
  const [studioRevision,setStudioRevision]=useState(0);
  const [studioHistory,setStudioHistory]=useState<StudioRevision[]>([]);
  const [studioRestore,setStudioRestore]=useState("0");
  const [studioSaved,setStudioSaved]=useState("");
  const [checks,setChecks]=useState<Check[]>([]);
  const [isChecking,setIsChecking]=useState(false);
  const [monitorLocal,setMonitorLocal]=useState(false);
  const [sampleWindow,setSampleWindow]=useState(10);
  const [monitorAlert,setMonitorAlert]=useState<MonitorAlert|null>(null);
  const [request,setRequest]=useState("Create an accessible registration form with email validation");
  const [kind,setKind]=useState("feature");
  const [proposals,setProposals]=useState<Proposal[]>([]);
  const [selectedProposal,setSelectedProposal]=useState(0);
  const [reviewConfirmed,setReviewConfirmed]=useState(false);
  const [factoryLocal,setFactoryLocal]=useState(false);
  const [factoryBusy,setFactoryBusy]=useState(false);
  const [factoryJobs,setFactoryJobs]=useState<FactoryJob[]>([]);
  const [factorySelectedId,setFactorySelectedId]=useState("");
  const [factoryApproved,setFactoryApproved]=useState(false);
  const [factoryPreview,setFactoryPreview]=useState<FactorySourcePreview|null>(null);
  const [factoryFilter,setFactoryFilter]=useState("all");
  const [factorySearch,setFactorySearch]=useState("");
  const [notice,setNotice]=useState("");
  const [ready,setReady]=useState(false);
  const ui=shellCopy[language];
  const currentProject=projects.find(project=>project.id===active)!;
  const labHref=(lab:LabId)=>(language==="es"?"/labs/":"/"+language+"/labs/")+lab;
  useEffect(()=>{const frame=requestAnimationFrame(()=>{const query=new URLSearchParams(window.location.search).get("lab");if(!standalone && projects.some(p=>p.id===query))setActive(query as LabId);setInventory(stored("inventory",[...seedProducts]));setCart(stored("cart",{}));setOrders(stored("orders",[]));setBlocks(stored("blocks",initialBlocks));setStudioDesign(normalizeStudioDesign(stored("studio-design",STUDIO_DEFAULT_DESIGN)) as StudioDesign);setChecks(stored("checks",[]));setProposals(stored("proposals",[]));setReady(true);});return ()=>cancelAnimationFrame(frame);},[standalone]);
  useEffect(()=>{if(!ready)return;for(const [name,value] of Object.entries({inventory,cart,orders,blocks,checks,proposals})){if(sqliteMode && (name==="inventory"||name==="cart"||name==="orders"))continue;if(studioLocal&&name==="blocks")continue;if(monitorLocal&&name==="checks")continue;try{localStorage.setItem(key(name),JSON.stringify(value));}catch{}}},[ready,sqliteMode,studioLocal,monitorLocal,inventory,cart,orders,blocks,checks,proposals]);
  useEffect(()=>{if(!ready)return;try{localStorage.setItem(key("studio-design"),JSON.stringify(studioDesign));}catch{}},[ready,studioDesign]);
  const btn="lab-button rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-red-400 disabled:opacity-40";
  const primary="lab-button-primary rounded-xl bg-[#de4e65] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#bc304c] focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40";
  const card="lab-panel rounded-2xl border border-white/10 bg-[#1e1e23] p-5";
  const money=(n:number)=>new Intl.NumberFormat(language,{style:"currency",currency:"USD"}).format(n);
  const total=inventory.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0);
  const proposal=proposals[selectedProposal];
  const selectedFactoryJob=factoryJobs.find(job=>job.id===factorySelectedId)||factoryJobs[0];
  const filteredInventory=filterProducts(inventory,search,category);
  const p95=successfulLatencyP95(checks);
  const incidentMetrics=summarizeManualIncidents(checks);
  const cartBreakdown=summarizeCart(cart,inventory);
  const studioAudit=auditStudioBlocks(blocks);
  const selectedWindow=summarizeSampleWindow(checks,sampleWindow);
  const factoryBoard=summarizeFactoryBoard(factoryJobs);
  const visibleFactoryJobs=filterFactoryJobs(factoryJobs,factoryFilter,factorySearch);
  function changeCartItem(productId:string,quantity:number){
    if(sqliteBusy)return;
    const result=setCartQuantity(cart,inventory,productId,quantity);
    if(result.ok)setCart(result.cart);
    else setNotice("Quantity must be a whole number within available stock.");
  }
  async function readStudioImport(file:File|undefined){
    setStudioImport(null);
    if(!file)return;
    if(file.size>25000){
      setNotice("Studio JSON is too large (max 25 KB). No document was changed.");
      return;
    }
    try{
      const text=await file.text();
      const imported=parseStudioDocument(text);
      setStudioImport(imported);
      setNotice("Studio import validated: "+imported.length+" blocks. Review and confirm to replace the editor.");
    }catch{
      setNotice("Invalid Nexus Studio JSON. The current document was not changed.");
    }
  }
  function applyStudioImport(){
    if(!studioImport||studioBusy)return;
    editBlocks(studioImport);
    setSelected(0);
    setStudioImport(null);
    setNotice(studioLocal
      ?"Imported blocks are unsaved; select Save revision to persist to SQLite."
      :"Imported blocks are now in your browser editor. Use Undo to reverse this change.");
  }
  function updateBlock(text:string){setBlocks(previous=>previous.map((block,index)=>index===selected?{...block,text}:block));}
  function downloadHtml(){const blob=new Blob([renderDesignedStudioHtml(blocks,studioDesign,renderPageHtml)],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="nexus-studio-export.html";a.click();URL.revokeObjectURL(url);}
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
  function applyStudioResponse(data:StudioResponse,loadBlocks:boolean){
    if(!data.ok||typeof data.revision!=="number"||!Number.isSafeInteger(data.revision)||!Array.isArray(data.blocks)||!Array.isArray(data.revisions)){
      throw new Error("invalid-studio-response");
    }
    setStudioRevision(data.revision as number);
    setStudioHistory(data.revisions);
    if(loadBlocks){
      setBlocks(data.blocks);setSelected(0);setUndoBlocks([]);setRedoBlocks([]);
      setStudioSaved(JSON.stringify(data.blocks));
    }
  }
  async function connectStudio(){
    if(studioBusy)return;
    setStudioBusy(true);
    try{
      const response=await fetch("/api/labs/studio",{cache:"no-store"});
      const data=await response.json() as StudioResponse;
      if(!response.ok||!data.ok)throw new Error(data.reason||"backend-unavailable");
      applyStudioResponse(data,true);setStudioLocal(true);setStudioRestore("0");
      setNotice("Studio SQLite connected. Your browser-only draft remains stored separately.");
    }catch{setNotice("Studio SQLite unavailable. Enable NEXUS_LABS_STUDIO_SQLITE=1 in local development with Python installed.");}
    finally{setStudioBusy(false);}
  }
  function disconnectStudio(){
    if(studioBusy)return;
    setStudioLocal(false);
    setBlocks(stored("blocks",initialBlocks));setSelected(0);setUndoBlocks([]);setRedoBlocks([]);
    setNotice("Browser editor restored. SQLite revision history was kept on local disk.");
  }
  async function studioCommand(command:object,restore:boolean){
    if(!studioLocal||studioBusy)return;
    setStudioBusy(true);
    try{
      const response=await fetch("/api/labs/studio",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(command),
      });
      const data=await response.json() as StudioResponse;
      if(response.status===409){
        setNotice("Revision conflict: another local session saved changes. Your edits remain here; use Refresh from SQLite to reload.");
        return;
      }
      if(!response.ok||!data.ok){
        setNotice("Studio save failed: "+(data.reason||"invalid-document")+". Your edits remain in the editor.");
        return;
      }
      applyStudioResponse(data,restore);
      if(!restore&&data.blocks)setStudioSaved(JSON.stringify(data.blocks));
      setNotice(restore?"Older snapshot restored as new revision "+data.revision+".":"Document saved as SQLite revision "+data.revision+".");
    }catch{setNotice("Studio SQLite connection failed. Your current edits remain in the editor.");}
    finally{setStudioBusy(false);}
  }
  async function refreshStudio(){
    if(!studioLocal||studioBusy)return;
    setStudioBusy(true);
    try{
      const response=await fetch("/api/labs/studio",{cache:"no-store"});
      const data=await response.json() as StudioResponse;
      if(!response.ok||!data.ok)throw new Error("unavailable");
      applyStudioResponse(data,true);
      setNotice("Reloaded latest saved revision from SQLite. Previous unsaved edits were replaced.");
    }catch{setNotice("Unable to refresh local SQLite. No edits were replaced.");}
    finally{setStudioBusy(false);}
  }
  function loadMonitorData(data:MonitorData){
    if(!data.ok||!Array.isArray(data.checks)||!data.alert)throw new Error("invalid-monitor-response");
    if(!data.checks.every(entry=>typeof entry.at==="string"&&typeof entry.ok==="boolean"&&typeof entry.ms==="number"))throw new Error("invalid-monitor-checks");
    setChecks(data.checks);setMonitorAlert(data.alert);
  }
  async function enableMonitor(){
    if(isChecking)return;
    setIsChecking(true);
    try{
      const response=await fetch("/api/labs/monitor",{cache:"no-store"});
      const data=await response.json() as MonitorData;
      if(!response.ok||!data.ok)throw new Error("backend-unavailable");
      loadMonitorData(data);setMonitorLocal(true);
      setNotice("Local Monitor SQLite connected. Manual server probes and alert history are stored on this machine.");
    }catch{setNotice("Monitor SQLite unavailable. Enable NEXUS_LABS_MONITOR_SQLITE=1 with Python in local development.");}
    finally{setIsChecking(false);}
  }
  function disableMonitor(){
    if(isChecking)return;
    setMonitorLocal(false);setMonitorAlert(null);setChecks(stored("checks",[]));
    setNotice("Browser health checks restored. Local SQLite samples were kept on disk.");
  }
  async function checkService(){
    if(isChecking)return;
    setIsChecking(true);
    if(monitorLocal){
      try{
        const response=await fetch("/api/labs/monitor",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
        const data=await response.json() as MonitorData;
        if(!response.ok||!data.ok)throw new Error("backend-error");
        loadMonitorData(data);
        setNotice(data.checks?.[0]?.ok?"Local health probe succeeded and was saved.":"Local health probe failed; result saved and alert state updated.");
      }catch{setNotice("Local monitor unavailable. The check was not saved.");}
      finally{setIsChecking(false);}
      return;
    }
    const start=performance.now();
    try{
      const response=await fetch("/api/labs/health",{cache:"no-store"});
      const json=await response.json();
      const ok=response.ok&&json.status==="ok";
      setChecks(previous=>[{at:new Date().toISOString(),ok,ms:Math.round(performance.now()-start)},...previous].slice(0,30));
    }catch{
      setChecks(previous=>[{at:new Date().toISOString(),ok:false,ms:Math.round(performance.now()-start)},...previous].slice(0,30));
    }finally{setIsChecking(false);}
  }
  const stats=summarizeChecks(checks);
  const observed=observedAvailability(checks);
  function editBlocks(next:Block[]){setUndoBlocks(old=>[...old.slice(-19),blocks.map(b=>({...b}))]);setRedoBlocks([]);setBlocks(next);}
  function undoEditor(){const prior=undoBlocks.at(-1);if(!prior)return;setRedoBlocks(old=>[...old.slice(-19),blocks.map(b=>({...b}))]);setBlocks(prior);setUndoBlocks(old=>old.slice(0,-1));setSelected(0);}
  function redoEditor(){const next=redoBlocks.at(-1);if(!next)return;setUndoBlocks(old=>[...old.slice(-19),blocks.map(b=>({...b}))]);setBlocks(next);setRedoBlocks(old=>old.slice(0,-1));setSelected(0);}
  function finishEditingText(){const old=editorSnapshot.current;editorSnapshot.current=null;if(old&&JSON.stringify(old)!==JSON.stringify(blocks)){setUndoBlocks(history=>[...history.slice(-19),old]);setRedoBlocks([]);}}
  async function enableFactory(){
    if(factoryBusy)return;
    setFactoryBusy(true);
    try{
      const response=await fetch("/api/labs/factory",{cache:"no-store"});
      const data=await response.json() as FactoryResponse;
      if(!response.ok||!data.ok||!Array.isArray(data.jobs))throw new Error("backend-unavailable");
      setFactoryJobs(data.jobs);setFactorySelectedId(data.jobs[0]?.id||"");setFactoryLocal(true);
      setFactoryApproved(false);setFactoryPreview(null);
      setNotice("Local Factory enabled. It generates reviewed static templates only; no AI, shell or GitHub writes.");
    }catch{setNotice("Local Factory unavailable. Set NEXUS_LABS_FACTORY=1 in .env.local and run Next.js in development with Python.");}
    finally{setFactoryBusy(false);}
  }
  function disableFactory(){
    if(factoryBusy)return;
    setFactoryLocal(false);setFactoryApproved(false);setFactoryPreview(null);
    setNotice("Rule-based browser planning mode restored. Your SQLite jobs remain on local disk.");
  }
  async function previewFactorySource(){
    const id=selectedFactoryJob?.id;
    if(!id||factoryBusy)return;
    setFactoryBusy(true);
    try{
      const response=await fetch("/api/labs/factory?preview="+encodeURIComponent(id),{cache:"no-store"});
      const data=await response.json() as FactoryResponse;
      if(!response.ok||!data.ok||!data.preview||data.preview.jobId!==id){
        throw new Error(data.reason||"preview-unavailable");
      }
      setFactoryPreview(data.preview);
      setNotice("Fixed source preview loaded. Inspect the source and file hashes before approving.");
    }catch{
      setFactoryPreview(null);
      setNotice("Unable to preview generated source. No approval or build was performed.");
    }finally{setFactoryBusy(false);}
  }
  async function factoryAction(action:"propose"|"approve"|"build"){
    if(factoryBusy)return;
    const id=selectedFactoryJob?.id;
    if(action!=="propose"&&!id)return;
    if(action==="approve"&&!factoryApproved)return;
    setFactoryBusy(true);
    try{
      const payload=action==="propose"
        ?{action,request,kind}
        :action==="approve"
          ?{action,id,confirmed:true}
          :{action,id};
      const response=await fetch("/api/labs/factory",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),
      });
      const data=await response.json() as FactoryResponse;
      if(!response.ok||!data.ok||!data.job){
        setNotice("Factory operation rejected: "+(data.reason||"backend-error"));
        return;
      }
      const job=data.job;
      setFactoryJobs(old=>[job,...old.filter(previous=>previous.id!==job.id)].slice(0,20));
      setFactorySelectedId(job.id);setFactoryApproved(false);if(action==="propose")setFactoryPreview(null);
      setNotice(action==="propose"?"Review the plan before approving the local template build.":action==="approve"?"Human approval saved. Building the fixed template requires a separate click.":"Static HTML/CSS ZIP generated and checked. No user code was executed.");
    }catch{setNotice("Local Factory operation failed. No completion has been confirmed.");}
    finally{setFactoryBusy(false);}
  }
  function downloadFile(name:string,content:string,mediaType:string){
    const blob=new Blob([content],{type:mediaType+";charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;link.download=name;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportEvidence(format:"commerce"|"studio"|"monitor"|"factory"){
    try{
      if(format==="commerce"){
        downloadFile("nexus-commerce-demo-orders.csv",commerceLedgerCsv(orders,sqliteMode),"text/csv");
      }else if(format==="studio"){
        downloadFile("nexus-studio-document.json",studioDocumentJson(blocks,studioLocal,studioLocal&&JSON.stringify(blocks)===studioSaved?studioRevision:null),"application/json");
      }else if(format==="monitor"){
        downloadFile("nexus-monitor-manual-samples.csv",monitorSamplesCsv(checks,monitorLocal),"text/csv");
      }else if(selectedFactoryJob){
        downloadFile("nexus-factory-review.md",factoryAuditMarkdown(selectedFactoryJob),"text/markdown");
      }
    }catch{
      setNotice("Unable to export: the local data is invalid. No file was generated.");
    }
  }
  function downloadText(name:string,content:string){const blob=new Blob([content],{type:"text/markdown;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
  function selectLab(nextLab:LabId){
    setActive(nextLab);
    setNotice("");
    if(!standalone)window.history.replaceState(null,"",window.location.pathname+"?lab="+nextLab);
  }
  function labNavigationKeyDown(event:KeyboardEvent<HTMLElement>){
    const keys=["ArrowRight","ArrowDown","ArrowLeft","ArrowUp","Home","End"];
    if(!keys.includes(event.key))return;
    event.preventDefault();
    const index=projects.findIndex(project=>project.id===active);
    const nextIndex=event.key==="Home"?0:event.key==="End"?projects.length-1:
      (index+(event.key==="ArrowLeft"||event.key==="ArrowUp"?-1:1)+projects.length)%projects.length;
    const next=projects[nextIndex];
    selectLab(next.id);
    const buttons=event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
    buttons[nextIndex]?.focus();
  }
  return <main lang={language} data-lab={active} data-standalone={standalone?"true":"false"} className="nexus-lab-shell min-h-screen px-4 py-8 text-[#f6f0ee] sm:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="lab-project-header mb-8 border-b border-white/10 pb-6">
        <div className="lab-project-topline">
          <Link href={portfolioPath(language)+"#proyectos"} className="lab-portfolio-return"><span aria-hidden="true">←</span> {ui.back}</Link>
          {standalone&&<details className="lab-project-switcher">
            <summary>{ui.other} <span aria-hidden="true">⌄</span></summary>
            <nav data-lab-navigation aria-label={ui.other}>
              {projects.map(project=><Link key={project.id} href={labHref(project.id)} aria-current={active===project.id?"page":undefined}><span aria-hidden="true">{projectMarks[project.id]}</span>{project.name}</Link>)}
            </nav>
          </details>}
        </div>
        <div className="lab-project-heading">
          {standalone&&<span className="lab-project-mark" aria-hidden="true">{projectMarks[active]}</span>}
          <div><p className="lab-project-kicker">{standalone?ui.demo:"NEXUS / ENGINEERING LABS"}</p>
            <h1>{standalone?currentProject.name:ui.all}</h1>
            <p className="lab-project-description">{standalone?projectDescriptions[active][language]:ui.intro}</p>
          </div>
          {standalone&&<span className="lab-project-scope">{ui.scope}</span>}
        </div>
      </header>
      <div className={"nexus-labs-layout grid gap-5 "+(standalone?"lab-dedicated-layout":"lg:grid-cols-[245px_1fr]")}>
        {!standalone&&<nav data-lab-navigation aria-label="Nexus labs" onKeyDown={labNavigationKeyDown} className="flex flex-wrap content-start gap-2 lg:flex-col">
          {projects.map((project,index)=><button key={project.id} type="button" aria-pressed={active===project.id} aria-controls="nexus-active-lab" onClick={()=>selectLab(project.id)} className={"rounded-2xl border p-4 text-left transition "+(active===project.id?"border-[#de4e65] bg-[#43252c]":"border-white/10 bg-[#1e1e23] hover:border-white/30")}><span className="block text-xs text-[#ed8797]">0{index+1} / {project.category}</span><strong className="mt-1 block text-base">{project.name}</strong></button>)}
        </nav>}
        <div id="nexus-active-lab" role="region" aria-label="Active engineering lab" className="nexus-lab-workspace min-w-0 space-y-5">
          {standalone?<details className="lab-project-guide">
            <summary><span>{ui.guide}</span><span aria-hidden="true">＋</span></summary>
            <div className="lab-project-guide-content">
              <Link href={"/projects/"+labStudySlugs[active]+"?lang="+language} className="lab-study-link">{ui.study} <span aria-hidden="true">↗</span></Link>
              <LabQuickStart language={language} lab={active}/>
            </div>
          </details>:<>
          <div className={card+" nexus-lab-intro"}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold">{projects.find(p=>p.id===active)?.name}</h2><span className="rounded-full border border-amber-500/40 px-3 py-1 text-xs text-amber-200">LOCAL MVP · NO PRODUCTION</span></div><Link href={"/projects/"+labStudySlugs[active]+"?lang="+language} className="mt-4 inline-flex items-center rounded-lg border border-[#db6b83] px-4 py-2 text-sm font-semibold text-[#f2a6b8] hover:border-[#f1adbc] hover:text-white focus-visible:outline-2 focus-visible:outline-white">{({es:"Leer arquitectura y pruebas",en:"Read architecture and tests",de:"Architektur und Tests",fr:"Architecture et tests",pt:"Arquitetura e testes"} as const)[language]} <span className="ml-2" aria-hidden="true">↗</span></Link>
            <p className="mt-2 text-sm leading-6 text-stone-400">{active==="commerce"?"Product catalog, cart and simulated checkout. Optional local SQLite transactions; no real payments or public database.":active==="studio"?"Build a landing page, edit text, reorder elements and export safe static HTML.":active==="monitor"?"Checks the health endpoint of this application only. No arbitrary external targets or background polling.":"Rule-based task planning and human-review workflow. No AI inference, repository edits or automatic code execution."}</p><LabQuickStart language={language} lab={active}/>
          </div>
          </>}
          {notice&&<p role="status" className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm">{notice}</p>}
          {active==="commerce"&&<div className="commerce-storefront space-y-3"><LabProductOverview lab="commerce" language={language} inventory={inventory} cartUnits={Object.values(cart).reduce((a,b)=>a+b,0)} cartTotal={total} orderCount={orders.length} blocks={blocks} checks={checks} p95={p95} pipeline={factoryBoard}/><div id="commerce-controls" className="scroll-mt-20"/><div className="commerce-mode-bar flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1e1e23] p-4"><div><p className="font-semibold">{sqliteMode?"SQLite backend: active on this computer":"Browser-only demo"}</p><p className="text-xs text-stone-400">{sqliteMode?"Real server-side transactions, local disk persistence. Never enabled in production.":"No server database required. Optional SQLite mode works only on localhost in development."}</p></div>{sqliteMode?<button className={btn} disabled={sqliteBusy} onClick={disableSqlite}>Use browser demo</button>:<button className={btn} disabled={sqliteBusy} onClick={enableSqlite}>{sqliteBusy?"Connecting…":"Use local SQLite"}</button>}</div><div className="commerce-layout grid gap-5 xl:grid-cols-[1fr_290px]">
            <section className="commerce-catalog" aria-label="Product catalog"><div className="commerce-collection-heading"><div><span>CURATED TECH / COLLECTION 01</span><h2>Shop the essentials<span aria-hidden="true">.</span></h2><p>Thoughtful technology for your everyday setup.</p></div><span className="commerce-collection-index" aria-hidden="true">N / 2026</span></div><div className="commerce-search-controls mb-4 flex flex-col gap-3 sm:flex-row"><label className="flex-1 text-sm">Search products<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Keyboard, audio, displays..." className="mt-2 block w-full rounded-xl border border-white/20 bg-[#111115] p-3 text-white"/></label><label className="text-sm">Category<select value={category} onChange={event=>setCategory(event.target.value)} className="mt-2 block w-full rounded-xl border border-white/20 bg-[#111115] p-3 text-white"><option value="all">All categories</option>{[...new Set(inventory.map(p=>p.category))].map(name=><option key={name} value={name}>{name}</option>)}</select></label></div><p className="mb-3 text-sm text-stone-400" role="status">{filteredInventory.length} products found</p><div className="grid gap-3 sm:grid-cols-2">{filteredInventory.map(p=><article className={card+" commerce-product-card"} key={p.id}><CommerceProductPhoto id={p.id}/><p className="commerce-photo-caption">Illustrative photo · Unsplash</p><p className="text-xs uppercase tracking-widest text-stone-400">{p.category}</p><h3 className="mt-1 text-xl font-bold">{p.name}</h3><p className="commerce-product-price mt-2">{money(p.price)} <span>· {p.stock} available</span></p><button className={primary+" mt-4 w-full"} disabled={sqliteBusy||p.stock<1||(cart[p.id]||0)>=p.stock} onClick={()=>{const result=addToCart(cart,inventory,p.id);if(result.ok)setCart(result.cart);else setNotice("Not enough stock.");}}>Add to cart</button></article>)}{filteredInventory.length===0&&<p className="text-sm text-stone-400">No matching products. Try a different search.</p>}</div></section>
            <aside className={card+" commerce-cart h-fit"}><h3 className="text-xl font-bold">Shopping cart</h3><div className="mt-4 space-y-3">{inventory.filter(p=>(cart[p.id]||0)>0).map(p=><div key={p.id} className="commerce-cart-item flex items-center justify-between gap-2 text-sm"><CommerceProductPhoto id={p.id} compact/><span>{p.name} × {cart[p.id]}</span><div className="flex items-center gap-2"><button className={btn} aria-label={"Remove one "+p.name} disabled={sqliteBusy} onClick={()=>changeCartItem(p.id,(cart[p.id]||0)-1)}>−</button><button className={btn} aria-label={"Add one "+p.name} disabled={sqliteBusy||(cart[p.id]||0)>=p.stock} onClick={()=>changeCartItem(p.id,(cart[p.id]||0)+1)}>+</button></div></div>)}</div><section aria-label="Cart price breakdown" className="mt-5 rounded-xl border border-white/10 bg-[#111115] p-3">
                <h4 className="text-sm font-bold">Order estimate · no payment</h4>
                {cartBreakdown.valid&&cartBreakdown.lines.length>0?<ul className="mt-3 space-y-2 text-xs">{cartBreakdown.lines.map(line=><li key={line.id} className="flex justify-between gap-3"><span>{line.name} · {line.quantity} × {money(line.unitPrice)}</span><strong>{money(line.subtotal)}</strong></li>)}</ul>:<p className="mt-2 text-xs text-stone-400">{cartBreakdown.valid?"Your cart is empty.":"Invalid cart data. Reset the browser demo or adjust quantities."}</p>}
                <p className="mt-3 border-t border-white/10 pt-2 text-sm">Total estimated: <strong>{cartBreakdown.valid?money(cartBreakdown.total):"—"}</strong> · {cartBreakdown.units} units</p>
                <p className="mt-2 text-xs text-stone-400">Catalog prices only. No taxes, delivery, customer records or real charges.</p>
              </section><div className="mt-5 border-t border-white/10 pt-3 text-xl font-bold">{money(total)}</div><button className={primary+" mt-4 w-full"} disabled={total===0||sqliteBusy} onClick={checkoutOrder}>Place demo order</button><p className="mt-4 text-sm text-stone-400">Demo orders: {orders.length}</p><button className={btn+" mt-3 w-full"} disabled={orders.length===0||sqliteBusy} onClick={()=>exportEvidence("commerce")}>Export demo orders CSV</button><p className="mt-2 text-xs text-stone-500">Snapshot only; no payment or customer data.</p><div aria-label="Local order history" className="mt-3 space-y-2">{orders.slice(0,5).map((order,i)=><p key={i} className="rounded-lg bg-[#111115] p-2 text-xs">#{orders.length-i} · {order.count} product lines · {money(order.total)}</p>)}</div>{!sqliteMode&&<button className={btn+" mt-3 w-full"} onClick={()=>{setInventory([...seedProducts]);setCart({});setOrders([]);setNotice("Local commerce demo reset.");}}>Reset demo inventory</button>}</aside>
          </div></div>}
          {active==="studio"&&<div className="studio-designer space-y-4"><div className="studio-introduction"><div><span className="studio-introduction-kicker">NEXUS STUDIO / DESIGN ENVIRONMENT</span><h2>Design workspace</h2><p>Organize layers, design responsive pages, adjust document styles and inspect the exact HTML output — all locally.</p><div className="studio-introduction-features" aria-label="Editor capabilities"><span><b>03</b> DESIGN THEMES</span><span><b>03</b> DEVICE VIEWS</span><span><b>↗</b> HTML + JSON EXPORT</span></div></div><span className="studio-introduction-mark" aria-hidden="true">◫</span></div><div id="studio-controls" className="scroll-mt-20"/><div className="studio-mode-bar flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#1e1e23] p-4"><div><p className="font-semibold">{studioLocal?"SQLite version history · revision "+studioRevision:"Browser-only editor"}</p><p className="text-xs text-stone-400">{studioLocal?"Saved snapshots on this computer · "+(JSON.stringify(blocks)!==studioSaved?"Unsaved changes":"All changes saved"):"Drafts saved automatically to browser storage. SQLite mode is optional on localhost."}</p></div>{studioLocal?<button className={btn} disabled={studioBusy} onClick={disconnectStudio}>Use browser editor</button>:<button className={btn} disabled={studioBusy} onClick={connectStudio}>Use local SQLite</button>}</div>{studioLocal&&<div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-[#1e1e23] p-4"><button className={primary} disabled={studioBusy||JSON.stringify(blocks)===studioSaved} onClick={()=>studioCommand({action:"save",expectedRevision:studioRevision,blocks},false)}>{studioBusy?"Working…":"Save revision"}</button><button className={btn} disabled={studioBusy} onClick={refreshStudio}>Refresh from SQLite</button><label className="text-sm">Restore saved revision<select className="mt-2 block min-w-36 rounded-lg border border-white/20 bg-[#111115] p-2" value={studioRestore} onChange={e=>setStudioRestore(e.target.value)}>{studioHistory.map(item=><option key={item.revision} value={String(item.revision)}>Revision {item.revision}</option>)}</select></label><button className={btn} disabled={studioBusy||studioHistory.length===0} onClick={()=>studioCommand({action:"restore",expectedRevision:studioRevision,revision:Number(studioRestore)},true)}>Restore as new revision</button></div>}<div className="studio-editor-layout grid gap-4 xl:grid-cols-[310px_1fr]">
            <aside className={card+" space-y-4"}><h3 className="font-bold">Layers & tools</h3><p className="studio-editor-help">Select a layer here or click an element in the canvas. Changes update the preview instantly.</p><div className="studio-layer-list space-y-2">{blocks.map((b,i)=><button key={b.id} aria-pressed={selected===i} className={"block w-full rounded-lg border p-3 text-left text-sm "+(selected===i?"border-[#de4e65] bg-[#43252c]":"border-white/10")} onClick={()=>setSelected(i)}>{i+1}. {b.type} — {b.text.slice(0,25)}</button>)}</div><div className="studio-add-tools">{(["hero","text","button"] as const).map(type=><button key={type} className={btn} disabled={studioBusy||blocks.length>=30} onClick={()=>{editBlocks([...blocks,{id:crypto.randomUUID(),type,text:type==="hero"?"New heading":type==="button"?"Click here":"New paragraph"}]);setSelected(blocks.length);}}>+ {type}</button>)}</div>{blocks[selected]&&<><label htmlFor="block-editor" className="block text-sm font-semibold">Selected block text</label><textarea id="block-editor" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" rows={4} maxLength={500} value={blocks[selected].text} disabled={studioBusy} onFocus={()=>{editorSnapshot.current=blocks.map(b=>({...b}));}} onBlur={finishEditingText} onChange={e=>updateBlock(e.target.value)}/><div className="studio-block-actions flex flex-wrap gap-2"><button className={btn} disabled={studioBusy} onClick={()=>{editBlocks(moveBlock(blocks,selected,-1));setSelected(x=>Math.max(0,x-1));}}>↑ Move</button><button className={btn} disabled={studioBusy} onClick={()=>{editBlocks(moveBlock(blocks,selected,1));setSelected(x=>Math.min(blocks.length-1,x+1));}}>↓ Move</button><button className={btn} disabled={studioBusy} onClick={()=>{editBlocks(blocks.filter((_,i)=>i!==selected));setSelected(0);}}>Delete</button><button className={btn} disabled={studioBusy||blocks.length>=30} onClick={()=>{const block=blocks[selected];if(!block)return;editBlocks([...blocks.slice(0,selected+1),{...block,id:crypto.randomUUID()},...blocks.slice(selected+1)]);setSelected(selected+1);}}>Duplicate</button></div></>}<div className="flex gap-2"><button className={btn+" flex-1"} disabled={studioBusy||undoBlocks.length===0} onClick={undoEditor}>Undo</button><button className={btn+" flex-1"} disabled={studioBusy||redoBlocks.length===0} onClick={redoEditor}>Redo</button></div><div className="rounded-xl border border-white/15 p-3"><h4 className="text-sm font-bold">Starter layouts</h4><p className="studio-editor-help mt-1">Choose a layout to experiment with; you can undo the replacement.</p><div className="mt-3 flex flex-wrap gap-2"><button className={btn} disabled={studioBusy} onClick={()=>{if(!window.confirm("Replace your current blocks with a landing page template? You can Undo afterward."))return;editBlocks([{id:crypto.randomUUID(),type:"hero",text:"Build something extraordinary."},{id:crypto.randomUUID(),type:"text",text:"Present your idea with a clear message and a strong call to action."},{id:crypto.randomUUID(),type:"button",text:"Explore the project"}]);setSelected(0);}}>Landing page</button><button className={btn} disabled={studioBusy} onClick={()=>{if(!window.confirm("Replace your current blocks with a portfolio template? You can Undo afterward."))return;editBlocks([{id:crypto.randomUUID(),type:"hero",text:"Creative developer."},{id:crypto.randomUUID(),type:"text",text:"I design and build thoughtful web experiences with modern technologies."},{id:crypto.randomUUID(),type:"text",text:"Selected work · About · Contact"},{id:crypto.randomUUID(),type:"button",text:"See my work"}]);setSelected(0);}}>Portfolio</button></div></div><button className={primary+" w-full"} onClick={downloadHtml}>Export HTML</button><button className={btn+" w-full"} onClick={()=>exportEvidence("studio")}>Export blocks JSON</button>
              <div className="rounded-xl border border-white/15 p-3">
                <label htmlFor="studio-import-json" className="block text-sm font-semibold">Import Nexus Studio JSON</label>
                <p className="mt-1 text-xs text-stone-400">Review first. Import replaces visible blocks, does not run scripts, and does not automatically save SQLite revisions.</p>
                <input id="studio-import-json" type="file" accept=".json,application/json" disabled={studioBusy}
                  className="mt-3 block w-full text-xs text-stone-300 file:mr-2 file:rounded-lg file:border-0 file:bg-[#45303a] file:px-2 file:py-2 file:text-white"
                  onChange={event=>{void readStudioImport(event.target.files?.[0]);event.target.value="";}}/>
                {studioImport&&<div className="mt-3 rounded-lg bg-[#111115] p-3"><p className="text-xs">Validated preview: {studioImport.length} blocks</p>
                  <ul className="mt-2 max-h-36 space-y-1 overflow-auto text-xs text-stone-400">{studioImport.map(block=><li key={block.id}>{block.type} · {block.text.slice(0,55)}</li>)}</ul>
                  <div className="mt-3 flex flex-wrap gap-2"><button className={primary} disabled={studioBusy} onClick={applyStudioImport}>Replace editor with preview</button><button className={btn} onClick={()=>setStudioImport(null)}>Cancel import</button></div>
                </div>}
              </div></aside>
            <section className="studio-preview-panel"><StudioDesignerCanvas blocks={blocks} selected={selected} onSelect={setSelected} design={studioDesign} onDesignChange={setStudioDesign} viewport={studioViewport} onViewportChange={setStudioViewport} exportMarkup={renderDesignedStudioHtml(blocks,studioDesign,renderPageHtml)} disabled={studioBusy}/><p className="mt-3 text-xs text-stone-400">Click a block to select it. The exported HTML includes your theme, alignment and spacing; preview buttons stay static for safety.</p><section aria-label="Studio static content audit" className="studio-document-review mt-5 rounded-xl border border-white/10 bg-[#111115] p-4">
              <h4 className="font-semibold">Document content review</h4>
              <p className="mt-2 text-xs text-stone-300">{studioAudit.blocks} blocks · {studioAudit.words} words · {studioAudit.issues.length} suggestions</p>
              {studioAudit.ok?<p className="mt-2 text-sm text-emerald-300">No issues found by these limited content rules.</p>:<ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-amber-200">{studioAudit.issues.map((issue,index)=><li key={index}>{issue}</li>)}</ul>}
              <p className="mt-3 text-xs text-stone-500">Static checks only; not an accessibility audit or proof that the exported HTML is safe to deploy.</p>
            </section></section>
          </div></div>}
          {active==="monitor"&&<div className="monitor-console space-y-4"><LabProductOverview lab="monitor" language={language} inventory={inventory} cartUnits={Object.values(cart).reduce((a,b)=>a+b,0)} cartTotal={total} orderCount={orders.length} blocks={blocks} checks={checks} p95={p95} pipeline={factoryBoard}/><MonitorStatusDashboard checks={checks} p95={p95} language={language} isChecking={isChecking} onCheck={checkService} localMode={monitorLocal}/><div id="monitor-controls" className="scroll-mt-20"/><div className="monitor-source-bar flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1e1e23] p-4"><div><p className="font-semibold">{monitorLocal?"SQLite monitor: server-side checks":"Browser health checks"}</p><p className="text-xs text-stone-400">{monitorLocal?"Persistent SQLite history and local alerts; manual probes only.":"No background polling. Optional localhost SQLite backend."}</p></div>{monitorLocal?<button className={btn} disabled={isChecking} onClick={disableMonitor}>Use browser monitor</button>:<button className={btn} disabled={isChecking} onClick={enableMonitor}>Use local SQLite</button>}</div>{monitorLocal&&monitorAlert&&<div role="status" className={"monitor-alert-banner rounded-xl border p-4 "+(monitorAlert.level==="critical"?"border-rose-400/50 bg-rose-950/40":monitorAlert.level==="warning"?"border-amber-400/50 bg-amber-950/30":"border-white/10 bg-[#1e1e23]")}><p className="text-sm font-bold">Local alert: {monitorAlert.level.toUpperCase()}</p><p className="mt-1 text-sm">{monitorAlert.message}</p><p className="mt-1 text-xs text-stone-400">{monitorAlert.consecutiveFailures} consecutive failures · {monitorAlert.samples} recorded samples · p95 {monitorAlert.p95Ms===null?"—":monitorAlert.p95Ms+" ms"}</p></div>}<section className={card+" monitor-diagnostics-panel"}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-xl font-bold">Nexus API Health</h3><p className="mt-1 text-sm text-stone-400">GET /api/labs/health · same-origin only</p></div><button className={primary} disabled={isChecking} onClick={checkService}>{isChecking?"Checking…":"Run health check"}</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[{name:"Checks",value:stats.total},{name:"Successful",value:stats.successful},{name:"Average success",value:stats.averageMs===null?"—":stats.averageMs+" ms"}].map(s=><div className="rounded-xl bg-[#111115] p-5" key={s.name}><p className="text-sm text-stone-400">{s.name}</p><strong className="mt-2 block text-3xl">{s.value}</strong></div>)}</div><p className="mt-5 rounded-lg bg-[#111115] p-4 text-sm">Observed successful checks: <strong>{observed.percent===null?"—":observed.percent+"%"}</strong> · Range: {observed.minMs===null?"—":observed.minMs+"–"+observed.maxMs+" ms"} · {observed.sampleCount} samples</p><p className="mt-3 text-sm text-stone-400">p95 successful latency: <strong>{p95===null?"—":p95+" ms"}</strong> (last {checks.length} manually initiated checks)</p><div role="img" aria-label="Last checks latency bars, green successful, red failed" className="mt-4 flex h-24 items-end gap-1 rounded-xl bg-[#111115] p-3">{checks.slice(0,20).reverse().map((entry,i)=><span key={i} title={(entry.ok?"OK ":"ERROR ")+entry.ms+" ms"} className={"min-w-0 flex-1 rounded-t-sm "+(entry.ok?"bg-emerald-400":"bg-rose-500")} style={{height:Math.max(8,Math.min(100,Math.round(entry.ms/Math.max(1,observed.maxMs||1)*100)))+"%"}}/>)}</div><section aria-label="Manual incident analysis" className="monitor-incident-panel mt-6 rounded-xl border border-white/10 bg-[#17171c] p-4">
              <h4 className="font-bold">Manual-sample incident analysis</h4>
              <p className="mt-1 text-xs text-stone-400">Only the {incidentMetrics.sampleCount} recorded checks; not continuous uptime, an SLA or an automatic incident detector.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[
                {label:"Current failures",value:incidentMetrics.currentFailures},
                {label:"Longest failure streak",value:incidentMetrics.longestFailures},
                {label:"Failure sequences",value:incidentMetrics.incidents},
                {label:"Slow successes ≥500 ms",value:incidentMetrics.slowSamples},
              ].map(item=><div className="rounded-lg bg-[#111115] p-3" key={item.label}><p className="text-xs text-stone-400">{item.label}</p><p className="mt-2 text-xl font-bold">{item.value}</p></div>)}</div>
            </section><section aria-label="Manual sample window" className="monitor-window-panel mt-5 rounded-xl border border-white/10 bg-[#111115] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="font-semibold">Compare manual sample windows</h4>
                <label className="text-xs">Last measurements
                  <select aria-label="Select sample window" className="ml-2 rounded-lg border border-white/20 bg-[#1e1e23] p-2" value={sampleWindow} onChange={event=>setSampleWindow(Number(event.target.value))}>
                    <option value={5}>5 checks</option><option value={10}>10 checks</option><option value={30}>30 checks</option><option value={100}>100 checks</option><option value={0}>All loaded checks</option>
                  </select></label></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">{[
                {name:"Samples in window",value:selectedWindow.count},
                {name:"Observed successes",value:selectedWindow.successPercent===null?"—":selectedWindow.successPercent+"%"},
                {name:"p95 successful latency",value:selectedWindow.p95Ms===null?"—":selectedWindow.p95Ms+" ms"},
              ].map(item=><div className="rounded-lg border border-white/10 p-3" key={item.name}><p className="text-xs text-stone-400">{item.name}</p><strong className="mt-1 block text-lg">{item.value}</strong></div>)}</div>
              <p className="mt-3 text-xs text-stone-400">This selection counts recorded manual checks, not minutes of uptime or a time-based SLA. Export CSV still includes every loaded check.</p>
            </section><h4 className="mt-8 font-bold">Recent checks</h4><div className="monitor-check-history mt-3 space-y-2">{checks.length===0&&<p className="text-sm text-stone-400">No checks yet. Start the first manual probe.</p>}{checks.map((entry,i)=><div key={i} className="flex justify-between rounded-lg bg-[#111115] p-3 text-sm"><span>{new Date(entry.at).toLocaleTimeString(language)}</span><span className={entry.ok?"text-emerald-400":"text-rose-400"}>{entry.ok?"HEALTHY":"ERROR"}</span><span>{entry.ms} ms</span></div>)}</div><button className={btn+" mt-5 mr-3"} disabled={checks.length===0||isChecking} onClick={()=>exportEvidence("monitor")}>Export manual samples CSV</button>{!monitorLocal&&<button className={btn+" mt-5"} onClick={()=>setChecks([])}>Clear browser history</button>}<p className="mt-4 text-xs text-stone-400">{monitorLocal?"Measures server-observed latency of the fixed local Nexus health endpoint. Samples are manually triggered and kept on this computer. This is not continuous uptime monitoring.":"Measures client-observed latency; results are not server logs or continuous uptime evidence."}</p></section></div>}
          {active==="factory"&&<div className="factory-pipeline space-y-4"><LabProductOverview lab="factory" language={language} inventory={inventory} cartUnits={Object.values(cart).reduce((a,b)=>a+b,0)} cartTotal={total} orderCount={orders.length} blocks={blocks} checks={checks} p95={p95} pipeline={factoryBoard}/><div id="factory-controls" className="scroll-mt-20"/><FactoryExecutionStatus language={language}/><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1e1e23] p-4"><div><p className="font-semibold">{factoryLocal?"Local Software Factory · SQLite pipeline":"Browser-only planning prototype"}</p><p className="text-xs text-stone-400">{factoryLocal?"Approval → fixed template → static QA → downloadable ZIP; no AI agents or repository writes.":"Deterministic planning and Markdown export, without executing code."}</p></div>{factoryLocal?<button className={btn} disabled={factoryBusy} onClick={disableFactory}>Use browser planner</button>:<button className={btn} disabled={factoryBusy} onClick={enableFactory}>Use local Factory</button>}</div>{factoryLocal?<div className="grid gap-4 xl:grid-cols-[1fr_1fr]"><section className={card+" space-y-4"}><h3 className="text-xl font-bold">New local build request</h3><label htmlFor="local-factory-request" className="block text-sm">Request for a static starter page</label><textarea id="local-factory-request" rows={5} maxLength={500} className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" value={request} onChange={event=>setRequest(event.target.value)}/><label className="block text-sm" htmlFor="local-factory-kind">Task type</label><select id="local-factory-kind" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" value={kind} onChange={event=>setKind(event.target.value)}><option value="feature">Feature</option><option value="bug">Bug</option><option value="refactor">Refactor</option></select><button className={primary+" w-full"} disabled={factoryBusy} onClick={()=>factoryAction("propose")}>Prepare local build plan</button><p className="text-xs text-stone-400">Every request uses the same deliberately restricted static-page template. No code from the prompt is run or inserted as executable instructions.</p><section aria-label="Factory job board" className="rounded-xl border border-white/10 p-3">
              <h4 className="text-sm font-semibold">Local job board</h4><div aria-label="Local factory pipeline counts" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[
                {label:"Proposed",value:factoryBoard.proposed},
                {label:"Approved",value:factoryBoard.approved},
                {label:"Built",value:factoryBoard.built},
                {label:"Static QA passed",value:factoryBoard.passedStaticQa},
              ].map(item=><div className="rounded-lg bg-[#111115] p-2" key={item.label}><p className="text-[11px] text-stone-400">{item.label}</p><strong>{item.value}</strong></div>)}</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2"><label className="text-xs">Filter by status
                <select aria-label="Filter factory job status" className="mt-1 w-full rounded-lg border border-white/20 bg-[#111115] p-2" value={factoryFilter} onChange={event=>setFactoryFilter(event.target.value)}>
                  {["all","proposed","approved","built"].map(value=><option key={value} value={value}>{value}</option>)}
                </select></label>
                <label className="text-xs">Find request
                  <input type="search" aria-label="Search factory jobs" maxLength={100} className="mt-1 w-full rounded-lg border border-white/20 bg-[#111115] p-2" value={factorySearch} onChange={event=>setFactorySearch(event.target.value)} placeholder="Search local jobs"/>
                </label></div>
              <p className="mt-2 text-xs text-stone-400">{visibleFactoryJobs.length} of {factoryJobs.length} local jobs shown. Filtering never runs or approves a job.</p>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">{visibleFactoryJobs.map(job=><button type="button" key={job.id} className={btn+" w-full text-left"} onClick={()=>{setFactorySelectedId(job.id);setFactoryApproved(false);setFactoryPreview(null);}}>{job.status} · {job.request.slice(0,60)}</button>)}</div>
            </section>{factoryJobs.length>0&&<label className="block text-sm">Previous jobs<select className="mt-2 block w-full rounded-xl border border-white/20 bg-[#111115] p-3" value={selectedFactoryJob?.id||""} onChange={event=>{setFactorySelectedId(event.target.value);setFactoryApproved(false);setFactoryPreview(null);}}>{factoryJobs.map(job=><option key={job.id} value={job.id}>{job.status} · {job.request.slice(0,35)}</option>)}</select></label>}</section><section className={card}><h3 className="text-xl font-bold">Review → Build → QA</h3>{selectedFactoryJob?<><p className="mt-3 text-sm text-stone-300">{selectedFactoryJob.request}</p><p className="mt-2 text-xs uppercase tracking-widest text-[#ed8797]">{selectedFactoryJob.status} · {selectedFactoryJob.plan.template}</p><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-300">{selectedFactoryJob.plan.stages.map(stage=><li key={stage}>{stage}</li>)}</ol><p className="mt-4 text-xs text-stone-400">Planned files: {selectedFactoryJob.plan.files.join(", ")}</p><div className="mt-5 rounded-xl border border-white/10 bg-[#111115] p-3"><p className="text-sm font-semibold">Source review before approval</p><p className="mt-1 text-xs text-stone-400">Read-only HTML, CSS and README; no execution. SHA-256 values detect accidental changes, not author authenticity.</p><button className={btn+" mt-3 w-full"} disabled={factoryBusy} onClick={previewFactorySource}>{factoryBusy?"Loading…":"Preview generated source"}</button>{factoryPreview?.jobId===selectedFactoryJob.id&&<div className="mt-3 max-h-80 space-y-3 overflow-y-auto">{factoryPreview.files.map(file=><details key={file.name} className="rounded-lg border border-white/10 p-2"><summary className="cursor-pointer text-xs font-semibold">{file.name}</summary><p className="mt-2 break-all font-mono text-[10px] text-stone-400">SHA-256: {file.sha256}</p><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px] text-stone-300">{file.content}</pre></details>)}</div>}</div>{selectedFactoryJob.status==="proposed"&&<><label className="mt-5 flex items-start gap-2 text-sm"><input type="checkbox" checked={factoryApproved} onChange={e=>setFactoryApproved(e.target.checked)} className="mt-1 accent-[#de4e65]"/>I reviewed this fixed-template plan and approve creating the local artifact.</label><button className={btn+" mt-3 w-full"} disabled={!factoryApproved||factoryBusy||factoryPreview?.jobId!==selectedFactoryJob.id} onClick={()=>factoryAction("approve")}>Approve local build plan</button></>}{selectedFactoryJob.status==="approved"&&<button className={primary+" mt-5 w-full"} disabled={factoryBusy} onClick={()=>factoryAction("build")}>{factoryBusy?"Generating…":"Generate and run static QA"}</button>}{selectedFactoryJob.qa&&<div className="mt-5 rounded-xl border border-white/10 p-3"><p className="font-semibold">QA: {selectedFactoryJob.qa.passed?"PASSED":"FAILED"} · {selectedFactoryJob.qa.mode}</p><ul className="mt-3 space-y-2 text-xs">{selectedFactoryJob.qa.checks.map(check=><li key={check.name} className="flex gap-2"><span>{check.passed?"✓":"✗"}</span>{check.name}</li>)}</ul></div>}{selectedFactoryJob.downloadReady&&<a className={primary+" mt-4 block text-center"} href={"/api/labs/factory?artifact="+selectedFactoryJob.id} download>Download reviewed ZIP</a>}<button className={btn+" mt-4 w-full"} onClick={()=>exportEvidence("factory")}>Export review audit Markdown</button><h4 className="mt-5 font-semibold">Audit events</h4><ol className="mt-3 space-y-2 text-xs text-stone-400">{selectedFactoryJob.events.map((event,index)=><li key={index} className="rounded-lg bg-[#111115] p-3"><strong className="text-stone-200">{event.stage}</strong> · {event.detail}</li>)}</ol></>:<p className="mt-3 text-sm text-stone-400">Prepare a request to inspect the plan and approve a safe local build.</p>}</section></div>:<div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <section className={card+" space-y-4"}><h3 className="text-xl font-bold">New engineering request</h3><label htmlFor="factory-request" className="block text-sm">Describe what you want to build</label><textarea id="factory-request" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" maxLength={500} rows={5} value={request} onChange={e=>setRequest(e.target.value)}/><label htmlFor="factory-kind" className="block text-sm">Request type</label><select id="factory-kind" className="w-full rounded-lg border border-white/20 bg-[#111115] p-3" value={kind} onChange={e=>setKind(e.target.value)}><option value="feature">Feature</option><option value="bug">Bug fix</option><option value="refactor">Refactor</option></select><button className={primary+" w-full"} onClick={()=>{const p=buildFactoryProposal(request,kind);if(!p){setNotice("Describe a task using 10 to 500 characters.");return;}setProposals(old=>[p,...old].slice(0,15));setSelectedProposal(0);setReviewConfirmed(false);setNotice("Rule-based plan prepared; implementation and testing are NOT automatic.");}}>Create reviewable plan</button><p className="text-xs text-stone-400">This workflow is a deterministic planning prototype. It never modifies code or uses an AI provider.</p></section>
            <section className={card}><h3 className="text-xl font-bold">Review board</h3>{proposals.length>1&&<label className="mt-3 block text-sm">Saved requests<select className="mt-2 block w-full rounded-lg border border-white/20 bg-[#111115] p-3" value={selectedProposal} onChange={event=>{setSelectedProposal(Number(event.target.value));setReviewConfirmed(false);}}>{proposals.map((p,i)=><option key={i} value={i}>{i+1}. {p.request.slice(0,48)}</option>)}</select></label>}{proposal?<><p className="mt-3 text-sm text-stone-300">{proposal.request}</p><span className="mt-3 inline-block rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">{proposal.status}</span><ol className="mt-5 space-y-3">{proposal.stages.map(step=><li key={step.id} className="rounded-xl border border-white/10 p-3"><p className="font-semibold">{step.completed?"✓ ":"○ "}{step.label}</p><p className="mt-1 text-xs text-stone-400">{step.detail}</p></li>)}</ol><h4 className="mt-5 font-semibold">Acceptance checklist</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-400">{proposal.acceptance.map(x=><li key={x}>{x}</li>)}</ul><label className="mt-5 flex items-start gap-2 text-sm text-stone-300"><input type="checkbox" className="mt-1 accent-[#de4e65]" checked={reviewConfirmed} onChange={event=>setReviewConfirmed(event.target.checked)}/>I reviewed this plan. Approval permits manual development only; it does not run code or tests.</label><button className={btn+" mt-3"} disabled={!reviewConfirmed||proposal.status!=="awaiting-review"} onClick={()=>{setProposals(old=>old.map((p,i)=>i===selectedProposal?reviewFactoryPlan(p,true):p));setReviewConfirmed(false);}}>Approve plan (manual work only)</button></>:<p className="mt-4 text-sm text-stone-400">Create a request to generate a reviewable planning checklist.</p>}{proposal&&<button className={btn+" mt-3 w-full"} onClick={()=>downloadText("nexus-factory-issue.md",renderFactoryIssueMarkdown(proposal))}>Export Markdown issue draft</button>}<p className="mt-4 text-xs text-stone-400">Saved local plans: {proposals.length}</p></section>
          </div>}</div>}
        </div>
      </div>
    </div>
  </main>;
}
