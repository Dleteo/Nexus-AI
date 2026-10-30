'use client';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import type {SiteLanguage} from '@/data/site-languages';
import {answerPortfolioQuestion} from '@/lib/portfolio-guide';
import PortfolioResponse from './PortfolioResponse';
import {words} from './DevelopmentEvidence';
import s from './PortfolioCompanion.module.css';

type Mode='guide'|'ai';
type Task='assistant'|'explain'|'interview'|'plan'|'debug';
type Access='checking'|'signed_out'|'ready'|'unavailable';
type Message={role:'user'|'guide'|'ai';text:string;mode:Mode;project?:string;links?:{href:string;label:string}[]};

export default function PortfolioCompanion({language}:{language:SiteLanguage}){
 const t=(es:string,en:string,de:string,fr:string,pt:string)=>words(language,es,en,de,fr,pt);
 const [open,setOpen]=useState(false),[mode,setMode]=useState<Mode>('guide');
 const [task,setTask]=useState<Task>('assistant');
 const [hasUnread,setHasUnread]=useState(false);const followOutput=useRef(true);
 const [access,setAccess]=useState<Access>('checking'),[checkVersion,setCheckVersion]=useState(0);
 const [sessionVerified,setSessionVerified]=useState(false);
 const [draft,setDraft]=useState(''),[messages,setMessages]=useState<Message[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const identity=useRef<string|null>(null),previousProject=useRef<string|undefined>(undefined);
 const launcher=useRef<HTMLButtonElement>(null),input=useRef<HTMLTextAreaElement>(null),thread=useRef<string|null>(null);
 const pending=useRef(false),abort=useRef<AbortController|null>(null),log=useRef<HTMLDivElement>(null),epoch=useRef(0);

 const reset=useCallback(()=>{
  epoch.current++;abort.current?.abort();pending.current=false;thread.current=null;previousProject.current=undefined;
  followOutput.current=true;setHasUnread(false);setTask('assistant');
  setBusy(false);setMessages([]);setDraft('');setError('');
 },[]);
 useEffect(()=>{
  if(!open)return;
  input.current?.focus();let disposed=false;let check:AbortController|undefined;
  async function refresh(){
   check?.abort();const controller=new AbortController();check=controller;
   const timeout=setTimeout(()=>controller.abort(),8000);setAccess('checking');setSessionVerified(false);
   try{
    const response=await fetch('/api/auth/session',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw Error('session-unavailable');
    const data=await response.json();if(disposed||check!==controller)return;
    const next=typeof data.user?.id==='string'?data.user.id:null;
    if(identity.current!==null&&identity.current!==next)reset();
    identity.current=next;setSessionVerified(!!next);
    if(!next){setAccess('signed_out');return;}
    const status=await fetch('/api/assistant/status',{cache:'no-store',signal:controller.signal});
    if(disposed||check!==controller)return;
    if(status.status===401){reset();identity.current=null;setSessionVerified(false);setAccess('signed_out');return;}
    if(!status.ok)throw Error('status-unavailable');
    const config=await status.json();if(disposed||check!==controller)return;
    setAccess(config.assistants?.some((a:{scope?:string;status?:string})=>a.scope==='portfolio'&&a.status==='ready')?'ready':'unavailable');
   }catch{if(!disposed&&check===controller)setAccess('unavailable');}
   finally{clearTimeout(timeout);}
  }
  void refresh();window.addEventListener('focus',refresh);
  return()=>{disposed=true;check?.abort();window.removeEventListener('focus',refresh);};
 },[open,checkVersion,reset]);
 useEffect(()=>()=>{epoch.current++;abort.current?.abort();},[]);
 useEffect(()=>{
  if(!open||!log.current)return;
  if(followOutput.current)log.current.scrollTop=log.current.scrollHeight;
 },[messages,busy,mode,open,sessionVerified]);
 function latest(){followOutput.current=true;setHasUnread(false);log.current?.scrollTo({top:log.current.scrollHeight});}
 function changeMode(next:Mode){followOutput.current=true;setHasUnread(false);setMode(next);setError('');}
 function close(){followOutput.current=true;setHasUnread(false);setSessionVerified(false);setOpen(false);launcher.current?.focus();}
 function guide(text:string){
  followOutput.current=true;setHasUnread(false);
  const answer=answerPortfolioQuestion(text,language,previousProject.current);
  previousProject.current=answer.project;
  setMessages(m=>[...m,{role:'user' as const,text,mode:'guide' as const},{role:'guide' as const,text:answer.text,links:answer.links,project:answer.project,mode:'guide' as const}].slice(-24));
  setDraft('');setError('');
 }
 async function submit(e:FormEvent){
  e.preventDefault();const text=draft.trim();if(!text||pending.current)return;
  if(mode==='guide'){guide(text);return;}
  if(access!=='ready')return;
  followOutput.current=true;setHasUnread(false);setError('');pending.current=true;setBusy(true);setDraft('');
  setMessages(m=>[...m,{role:'user' as const,text,mode:'ai' as const}].slice(-24));
  const requestEpoch=epoch.current,controller=new AbortController();abort.current=controller;
  const timeout=setTimeout(()=>controller.abort(),30000);
  async function read(response:Response){
   if(response.status===401)throw Error('expired');
   if(response.status===429)throw Error('limit');
   if(response.status===503)throw Error('unavailable');
   if(!response.ok)throw Error('request-failed');
   return response.json();
  }
  try{
   let id=thread.current;
   if(!id){
    const response=await fetch('/api/assistant/conversations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:task,scope:'portfolio'}),signal:controller.signal});
    const data=await read(response);
    if(typeof data.conversation?.id!=='string')throw Error('invalid-response');
    if(epoch.current!==requestEpoch)return;
    id=data.conversation.id;thread.current=id;
   }
   const response=await fetch('/api/assistant/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:id,message:text,scope:'portfolio',language,mode:task,expertise:'general',currentResearch:false}),signal:controller.signal});
   const data=await read(response);
   if(typeof data.answer!=='string'||!data.answer.trim())throw Error('invalid-response');
   if(epoch.current!==requestEpoch)return;
   setHasUnread(!followOutput.current);
   setMessages(m=>[...m,{role:'ai' as const,text:data.answer.slice(0,20000),mode:'ai' as const}].slice(-24));
   // The visitor may already be typing their next question: never clear it here.
  }catch(cause){
   if(epoch.current!==requestEpoch)return;
   const code=cause instanceof Error?cause.message:'';
   if(code==='expired'){reset();identity.current=null;setSessionVerified(false);setAccess('signed_out');return;}
   if(code==='unavailable')setAccess('unavailable');
   setDraft(current=>current||text);
   setError(controller.signal.aborted?t('La respuesta tardó demasiado. Conservé tu pregunta.','The response timed out. Your question was kept.','Zeitüberschreitung. Deine Frage bleibt erhalten.','Délai dépassé. Votre question est conservée.','O tempo esgotou. Sua pergunta foi mantida.'):code==='limit'?t('Has alcanzado el límite de consultas. Tu pregunta se conserva.','The request limit was reached. Your question was kept.','Anfragelimit erreicht. Deine Frage bleibt erhalten.','Limite de demandes atteinte. Votre question est conservée.','Limite de consultas atingido. Sua pergunta foi mantida.'):t('No pude obtener una respuesta. Conservé tu pregunta; puedes usar la Guía o intentarlo más tarde.','I could not get an answer. Your question was kept; use Guide or try again later.','Keine Antwort verfügbar. Die Frage bleibt erhalten; nutze den Guide oder versuche es später.','Réponse indisponible. Votre question est conservée ; utilisez le Guide ou réessayez plus tard.','Não consegui uma resposta. Sua pergunta foi mantida; use o Guia ou tente mais tarde.'));
  }finally{
   clearTimeout(timeout);
   if(epoch.current===requestEpoch){pending.current=false;setBusy(false);}
  }
 }
 const prompts=[
  t('¿Qué proyectos puedo probar?','Which projects can I try?','Welche Projekte kann ich testen ?','Quels projets puis-je essayer ?','Quais projetos posso testar?'),
  t('Explícame Nexus Factory','Explain Nexus Factory','Erkläre Nexus Factory','Explique Nexus Factory','Explique o Nexus Factory'),
  t('¿Qué experiencia tienes?','What experience do you have?','Welche Erfahrung hast du?','Quelle expérience avez-vous ?','Qual é a sua experiência?'),
  t('Compara Commerce y Factory','Compare Commerce and Factory','Vergleiche Commerce und Factory','Comparer Commerce et Factory','Compare Commerce e Factory'),
  t('Muéstrame el CV','Show me the CV','Zeige den Lebenslauf','Montre le CV','Mostre o currículo'),
 ];
 return <div className={s.dock}>
 {open&&<section className={s.panel} id="nexus-floating-chat" role="dialog" aria-label={t('Nexus asistente flotante','Nexus floating assistant','Nexus schwebender Assistent','Nexus assistant flottant','Nexus assistente flutuante')} onKeyDown={e=>{if(e.key==='Escape')close();}}>
  <header><span className={s.mark}>N</span><div><strong>NEXUS / PORTFOLIO</strong><small>{t('Tu guía del portafolio','Your portfolio guide','Dein Portfolio-Guide','Votre guide portfolio','Seu guia do portfólio')}</small></div><button onClick={close} aria-label={t('Cerrar chat','Close chat','Chat schließen','Fermer le chat','Fechar chat')}>×</button></header>
  <div className={s.tabs}>
   <button disabled={busy} aria-pressed={mode==='guide'} onClick={()=>changeMode('guide')}>{t('Guía','Guide','Guide','Guide','Guia')}</button>
   <button disabled={busy} aria-pressed={mode==='ai'} onClick={()=>changeMode('ai')}>{t('IA','AI','KI','IA','IA')}</button>
   <button className={s.reset} disabled={busy} onClick={reset} aria-label={t('Nueva conversación; no borra el historial guardado','New conversation; saved history is not deleted','Neues Gespräch; gespeicherter Verlauf bleibt','Nouvelle conversation ; historique enregistré conservé','Nova conversa; histórico salvo mantido')}>{t('Nuevo chat','New chat','Neu','Nouveau','Novo chat')}</button>
  </div>
  <p className={s.notice}>{mode==='guide'?t('Respuestas locales con enlaces a los datos públicos del portafolio.','Local answers with links to public portfolio evidence.','Lokale Antworten mit Links zu öffentlichen Nachweisen.','Réponses locales avec liens vers les preuves publiques.','Respostas locais com links para evidências públicas.'):t('IA con el proveedor configurado. Requiere sesión; los mensajes se guardan en tu cuenta.','AI uses the configured provider. Sign-in required; messages are saved to your account.','KI benötigt Anmeldung; Nachrichten werden im Konto gespeichert.','IA avec connexion ; messages enregistrés dans votre compte.','IA exige login; mensagens ficam salvas na sua conta.')}</p>
  <div className={s.messages} role="log" aria-live="polite" aria-busy={busy} ref={log} onScroll={event=>{const node=event.currentTarget;const atBottom=node.scrollHeight-node.clientHeight-node.scrollTop<40;followOutput.current=atBottom;if(atBottom)setHasUnread(false);}}>
   <p className={s.greeting}>{t('Hola, soy Nexus. ¿Qué te gustaría conocer?','Hello, I’m Nexus. What would you like to explore?','Hallo, ich bin Nexus. Was möchtest du entdecken?','Bonjour, je suis Nexus. Que souhaitez-vous découvrir ?','Olá, sou Nexus. O que gostaria de conhecer?')}</p>
   {mode==='guide'&&<div className={s.prompts}>{prompts.map(prompt=><button key={prompt} type="button" onClick={()=>guide(prompt)}>{prompt}</button>)}</div>}
   {messages.filter(m=>m.mode===mode&&(mode!=='ai'||sessionVerified)).map((m,i)=><article key={i} data-role={m.role}><small>{m.role==='user'?t('Tú','You','Du','Vous','Você'):m.role==='ai'?'Nexus AI':'Nexus Guide'}</small>{m.role==='user'?<p>{m.text}</p>:<PortfolioResponse text={m.text} language={language}/>}{m.role==='guide'&&m.project&&<div className={s.followups}>
    <button type="button" onClick={()=>guide(t('Pruebas de ','Tests for ','Tests für ','Tests de ','Testes de ')+m.project)}>{t('Ver pruebas','Show tests','Tests ansehen','Voir les tests','Ver testes')}</button>
    <button type="button" onClick={()=>guide(t('Límites de ','Limitations of ','Grenzen von ','Limites de ','Limites de ')+m.project)}>{t('Ver límites','Show limitations','Grenzen ansehen','Voir les limites','Ver limites')}</button>
   </div>}{m.links&&<div className={s.answerLinks}>{m.links.map(link=><Link key={link.href} href={link.href}>{link.label} →</Link>)}</div>}</article>)}
   {busy&&<p role="status">{t('Preparando respuesta…','Preparing an answer…','Antwort wird vorbereitet…','Préparation de la réponse…','Preparando resposta…')}</p>}
  </div>
  {hasUnread&&<button className={s.latest} type="button" onClick={latest}>{t('Ver última respuesta','View latest answer','Neueste Antwort ansehen','Voir la dernière réponse','Ver última resposta')} ↓</button>}
  <nav className={s.shortcuts}>{[['#proyectos',t('Proyectos','Projects','Projekte','Projets','Projetos')],['#certificados',t('Certificados','Certificates','Nachweise','Attestations','Certificados')],['#contacto',t('Contacto','Contact','Kontakt','Contact','Contato')]].map(([href,label])=><a key={href} href={href} onClick={close}>{label} →</a>)}</nav>
  {mode==='ai'&&access==='ready'&&<label className={s.task}>{t('Tipo de ayuda','Help with','Aufgabe','Type d’aide','Tipo de ajuda')}<select value={task} disabled={busy} onChange={event=>setTask(event.target.value as Task)}>
   <option value="assistant">{t('Portafolio','Portfolio','Portfolio','Portfolio','Portfólio')}</option>
   <option value="explain">{t('Explicar','Explain','Erklären','Expliquer','Explicar')}</option>
   <option value="interview">{t('Practicar entrevista','Interview practice','Interview üben','Préparer un entretien','Praticar entrevista')}</option>
   <option value="plan">{t('Planificar mejora','Plan improvements','Verbesserungen planen','Planifier des améliorations','Planejar melhorias')}</option>
   <option value="debug">{t('Resolver un error','Debug an issue','Fehler beheben','Résoudre un problème','Resolver um erro')}</option>
  </select></label>}
  {mode==='ai'&&access==='checking'?<p className={s.notice} role="status">{t('Comprobando disponibilidad…','Checking availability…','Verfügbarkeit wird geprüft…','Vérification de disponibilité…','Verificando disponibilidade…')}</p>:mode==='ai'&&access==='signed_out'?<Link className={s.login} href="/login?next=%2Fassistant%3Fscope%3Dportfolio">{t('Iniciar sesión para usar IA','Sign in to use AI','Für KI anmelden','Se connecter pour utiliser IA','Entrar para usar IA')} →</Link>:mode==='ai'&&access==='unavailable'?<div className={s.unavailable}>
   <p>{t('El motor de IA no está disponible. La Guía del portafolio sigue funcionando.','The AI engine is unavailable. The portfolio Guide still works.','Die KI ist nicht verfügbar. Der Portfolio-Guide funktioniert weiterhin.','Le moteur IA est indisponible. Le Guide reste disponible.','O motor de IA está indisponível. O Guia continua funcionando.')}</p>
   <button type="button" onClick={()=>changeMode('guide')}>{t('Usar Guía','Use Guide','Guide nutzen','Utiliser le Guide','Usar Guia')}</button>
   <button type="button" onClick={()=>setCheckVersion(v=>v+1)}>{t('Comprobar de nuevo','Check again','Erneut prüfen','Vérifier à nouveau','Verificar novamente')}</button>
  </div>:<form onSubmit={submit}>
   <label className={s.sr} htmlFor="floating-nexus-question">{t('Pregunta al asistente flotante','Ask the floating assistant','Frage an Assistenten','Question à l’assistant','Pergunta ao assistente')}</label>
   <textarea className={s.composer} rows={2} ref={input} id="floating-nexus-question" aria-describedby="floating-nexus-composer-hint" maxLength={2000} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();event.currentTarget.form?.requestSubmit();}}} placeholder={t('Escribe tu pregunta…','Write your question…','Deine Frage…','Votre question…','Sua pergunta…')}/>
   <button disabled={busy||!draft.trim()} aria-label={t('Enviar pregunta flotante','Send floating question','Frage senden','Envoyer la question','Enviar pergunta')}>↑</button>
  </form>}
  {(mode==='guide'||access==='ready')&&<p id="floating-nexus-composer-hint" className={s.composerHint}>{t('Enter para enviar · Mayús+Enter para otra línea','Enter to send · Shift+Enter for a new line','Enter zum Senden · Umschalt+Enter für neue Zeile','Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne','Enter para enviar · Shift+Enter para nova linha')}</p>}
  {error&&<p className={s.error} role="alert">{error}</p>}
 </section>}
 <button ref={launcher} className={s.launcher} aria-expanded={open} aria-controls="nexus-floating-chat" aria-label={t('Abrir asistente Nexus','Open Nexus assistant','Nexus Assistent öffnen','Ouvrir l’assistant Nexus','Abrir assistente Nexus')} onClick={()=>open?close():setOpen(true)}><span className={s.mark}>{open?'×':'N'}</span><span>NEXUS <small>{t('Hablemos','Let’s talk','Sprechen wir','Parlons','Vamos conversar')}</small></span></button>
 </div>;
}
