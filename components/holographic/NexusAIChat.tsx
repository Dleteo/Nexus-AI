"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useGuideLanguage } from "./guidePreferences";

type Lang = "es"|"en"|"pt"|"fr";
type Mode = "assistant"|"explain"|"debug"|"interview"|"plan";
type Message = { id:number; author:"nexus"|"visitor"; text:string };
type OpenDetail = { mode?:Mode; prompt?:string };
const ui = {
 es:{ title:"Hablar con Nexus AI", free:"Prueba gratuita con cuenta", hello:"Soy Nexus AI. ¿Qué necesitas aprender, construir o resolver?", auth:"Crea una cuenta gratuita para utilizar Nexus AI, guardar tus conversaciones y disfrutar de consultas limitadas cada día.", in:"Iniciar sesión", up:"Crear cuenta gratis", ask:"Escribe tu pregunta...", send:"Enviar", close:"Cerrar", waiting:"Nexus está pensando…", failure:"No se pudo completar la consulta.", news:"Las noticias recientes se consultan en el panel de noticias, con fuentes verificadas. Este chat no incorpora búsqueda web en directo.", modes:["General","Aprender","Solucionar","Entrevistas","Planificar"], soon:"Los planes premium aún no están disponibles. Nunca se cobrará sin confirmación." },
 en:{ title:"Talk to Nexus AI",free:"Free trial with an account",hello:"I'm Nexus AI. What would you like to learn, build or fix?",auth:"Create a free account to use Nexus AI, save conversations and access a limited number of daily questions.",in:"Sign in",up:"Create free account",ask:"Type your question...",send:"Send",close:"Close",waiting:"Nexus is thinking…",failure:"Couldn't complete the request.",news:"See verified current articles in the News panel. This chat does not include live web search.",modes:["General","Learn","Troubleshoot","Interviews","Plan"],soon:"Premium plans are not available yet. No charges are enabled." },
 pt:{ title:"Conversar com Nexus AI",free:"Teste gratuito com conta",hello:"Sou Nexus AI. O que deseja aprender ou resolver?",auth:"Crie uma conta gratuita para acessar consultas diárias limitadas.",in:"Entrar",up:"Criar conta grátis",ask:"Faça sua pergunta...",send:"Enviar",close:"Fechar",waiting:"Nexus está pensando…",failure:"Não foi possível concluir a solicitação.",news:"As notícias verificadas estão no painel de notícias, não neste chat.",modes:["Geral","Aprender","Resolver","Entrevistas","Planejar"],soon:"Os planos premium ainda não estão disponíveis." },
 fr:{ title:"Parler à Nexus AI",free:"Essai gratuit avec un compte",hello:"Je suis Nexus AI. Que voulez-vous apprendre ou résoudre ?",auth:"Créez un compte gratuit pour accéder à un nombre limité de questions par jour.",in:"Connexion",up:"Compte gratuit",ask:"Votre question...",send:"Envoyer",close:"Fermer",waiting:"Nexus réfléchit…",failure:"Impossible de traiter la demande.",news:"Les actualités vérifiées se trouvent dans le panneau Actualités, sans recherche web dans cette discussion.",modes:["Général","Apprendre","Dépanner","Entretiens","Planifier"],soon:"Les abonnements premium ne sont pas encore disponibles." }
} as const;
const modes: Mode[] = ["assistant","explain","debug","interview","plan"];

export default function NexusAIChat(){
 const lang = useGuideLanguage() as Lang;
 const t = ui[lang];
 const [open,setOpen]=useState(false);
 const [auth,setAuth]=useState<"checking"|"signed-in"|"guest">("checking");
 const [mode,setMode]=useState<Mode>("assistant");
 const [draft,setDraft]=useState("");
 const [messages,setMessages]=useState<Message[]>([]);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 const counter=useRef(0);
 const conversation=useRef<string|null>(null);
 const list=useRef<HTMLDivElement>(null);
 const busy=useRef(false);

 const add=useCallback((author:Message["author"], text:string)=>{
   setMessages(old=>[...old.slice(-29),{author,text,id:++counter.current}]);
 },[]);
 useEffect(()=>{
   const onOpen=(ev:Event)=>{
     const detail=(ev as CustomEvent<OpenDetail>).detail;
     if(detail?.mode && modes.includes(detail.mode)){ setMode(detail.mode); conversation.current=null; setMessages([]); }
     if(detail?.prompt)setDraft(detail.prompt.slice(0,1200));
     setOpen(true);
   };
   window.addEventListener("nexus:assistant-open",onOpen);
   return ()=>window.removeEventListener("nexus:assistant-open",onOpen);
 },[]);
 useEffect(()=>{
   if(!open)return;
   const ctrl=new AbortController();
   fetch("/api/auth/session",{signal:ctrl.signal,credentials:"same-origin",cache:"no-store"})
     .then(r=>r.ok?r.json():null)
     .then(d=>{if(!ctrl.signal.aborted)setAuth(d?.user?"signed-in":"guest");})
     .catch(()=>{if(!ctrl.signal.aborted)setAuth("guest");});
   return ()=>ctrl.abort();
 },[open]);
 useEffect(()=>{list.current?.scrollTo({top:list.current.scrollHeight,behavior:"smooth"});},[messages,pending]);
 function changeMode(next:Mode){if(busy.current)return;setMode(next);conversation.current=null;setMessages([]);setError("");}
 async function submit(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   const text=draft.trim().slice(0,1200);
   if(!text || busy.current || auth!=="signed-in")return;
   busy.current=true;setPending(true);setDraft("");setError("");add("visitor",text);
   try{
     if(!conversation.current){
       const create=await fetch("/api/assistant/conversations",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:text.slice(0,90),mode})});
       const result=await create.json().catch(()=>null);
       if(create.status===401)setAuth("guest");
       if(!create.ok || !result?.conversation?.id)throw new Error(result?.error||t.failure);
       conversation.current=result.conversation.id;
     }
     const response=await fetch("/api/assistant/chat",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({conversationId:conversation.current,message:text,mode})});
     const data=await response.json().catch(()=>null);
     if(response.status===401)setAuth("guest");
     if(!response.ok || typeof data?.answer!=="string")throw new Error(data?.error||t.failure);
     add("nexus",data.answer);
   }catch(cause){setError(cause instanceof Error?cause.message:t.failure);}
   finally{busy.current=false;setPending(false);}
 }
 if(!open)return null;
 return <div className="ncc-ai-layer" role="presentation">
   <button className="ncc-ai-dismiss" type="button" onClick={()=>setOpen(false)} aria-label={t.close}/>
   <section className="ncc-ai-window" role="dialog" aria-modal="true" aria-label={t.title}>
    <header className="ncc-ai-head"><div><small>NEXUS CORE / ONLINE</small><h2>{t.title}</h2><span>{t.free}</span></div><button type="button" onClick={()=>setOpen(false)} aria-label={t.close}>✕</button></header>
    <nav className="ncc-ai-modes" aria-label="Assistant mode">{modes.map((entry,index)=><button type="button" key={entry} className={mode===entry?"active":""} aria-pressed={mode===entry} onClick={()=>changeMode(entry)}>{t.modes[index]}</button>)}</nav>
    {auth!=="signed-in"?<div className="ncc-ai-auth"><div className="ncc-ai-orb">◉</div><h3>{t.hello}</h3><p>{auth==="checking"?"…":t.auth}</p><div className="ncc-ai-links"><Link href="/register">{t.up} ↗</Link><Link href="/login">{t.in} ↗</Link></div><p className="ncc-ai-premium">{t.soon}</p></div>:<>
      <div className="ncc-ai-messages" ref={list} role="log" aria-live="polite">
       {messages.length===0&&<p className="ncc-ai-message nexus">{t.hello}</p>}
       {messages.map(m=><p key={m.id} className={`ncc-ai-message ${m.author==="visitor"?"visitor":"nexus"}`}>{m.text}</p>)}
       {pending&&<p className="ncc-ai-message nexus">{t.waiting}</p>}
      </div>
      {error&&<p className="ncc-ai-error" role="alert">{error}</p>}
      <form className="ncc-ai-form" onSubmit={submit}><label className="ncc-sr" htmlFor="ncc-ai-input">{t.ask}</label><textarea id="ncc-ai-input" rows={2} maxLength={1200} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={t.ask}/><button type="submit" disabled={!draft.trim()||pending}>{t.send} →</button></form>
      <div className="ncc-ai-note">{t.news}</div>
    </>}
   </section>
 </div>;
}
