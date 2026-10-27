"use client";

import Link from "next/link";
import AssistantWorkspacePicker from "./AssistantWorkspacePicker";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import MessageContent from "./MessageContent";
import {expertises, type Expertise} from "../../lib/assistant-expertise";
import {conversationTitle,scopeFromTitle,type AssistantScope} from "../../lib/assistant-scopes";

type Mode = "assistant" | "plan" | "debug" | "explain" | "interview";
type Conversation = { id: string; scope: AssistantScope; title: string; mode: Mode; project_id: string | null; updated_at: string };
type Message = { sources?: Array<{uri:string;title?:string}>; id?: string; role: "user" | "assistant"; content: string; created_at?: string };
const modes: { id: Mode; label: string; description: string }[] = [
  { id: "assistant", label: "Copilot", description: "Resuelve problemas y avanza con tu idea." },
  { id: "plan", label: "Planificar", description: "Convierte una idea en tareas concretas." },
  { id: "debug", label: "Depurar", description: "Investiga errores y valida posibles soluciones." },
  { id: "explain", label: "Aprender", description: "Entiende código y conceptos paso a paso." },
  { id: "interview", label: "Entrevistas", description: "Practica preguntas técnicas y recibe feedback." },
];

export default function AssistantApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [current, setCurrent] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [scope,setScope]=useState<AssistantScope>("technical");
  const [switching,setSwitching]=useState(false);
  const [expertise, setExpertise] = useState<Expertise>("general");
  const [currentResearch, setCurrentResearch] = useState(false);
  const [mode, setMode] = useState<Mode>("assistant");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const endOfMessages = useRef<HTMLDivElement>(null);

  const openConversation = useCallback(async (id: string) => {
    setError("");
    const response = await fetch(`/api/assistant/conversations/${id}`, { cache: "no-store" });
    const data = await response.json() as { conversation?: Conversation; messages?: Message[]; error?: string };
    if (!response.ok || !data.conversation) throw new Error(data.error ?? "No se pudo abrir la conversación.");
    setCurrent(data.conversation);
    setScope(data.conversation.scope ?? scopeFromTitle(data.conversation.title));
    setMode(data.conversation.mode);
    setMessages(data.messages ?? []);
    setMobileHistoryOpen(false);
  }, []);

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/assistant/conversations", { cache: "no-store" });
    const data = await response.json() as { conversations?: Conversation[]; error?: string };
    if (response.status === 401) { window.location.replace("/login?next=%2Fassistant"); return; }
    if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar las conversaciones.");
    const list = data.conversations ?? [];
    setConversations(list);
    if (list.length && !current) await openConversation(list[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, openConversation]);

  useEffect(() => {
    let active = true;
    (async () => {
      try { await loadConversations(); }
      catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar el asistente."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [loadConversations]);

  async function newConversation(nextMode: Mode = mode, nextScope:AssistantScope = scope) {
    setError("");
    const response = await fetch("/api/assistant/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: nextMode, scope: nextScope }),
    });
    const data = await response.json() as { conversation?: Conversation; error?: string };
    if (!response.ok || !data.conversation) throw new Error(data.error ?? "No se pudo crear la conversación.");
    setConversations((list) => [data.conversation!, ...list]);
    setCurrent(data.conversation);
    setMessages([]);
    setMode(nextMode);
    setScope(nextScope);
    setMobileHistoryOpen(false);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !current || sending) return;
    setError("");
    setDraft("");
    setSending(true);
    const optimistic: Message = { role: "user", content };
    setMessages((list) => [...list, optimistic]);
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: current.id, message: content, mode, expertise, currentResearch:scope==="technical"&&currentResearch, scope }),
      });
      const data = await response.json() as { answer?: string; error?: string; requestsRemaining?: number; sources?: Array<{uri:string;title?:string}>; researchRequested?:boolean };
      if (!response.ok || !data.answer) throw new Error(data.error ?? "No se pudo obtener una respuesta.");
      setMessages((list) => [...list, { role: "assistant", content: data.answer!, sources: data.sources ?? [] }]);
      setRemaining(data.requestsRemaining ?? null);
      setConversations((list) => list.map((item) => item.id === current.id ? { ...item, mode, title: item.title === conversationTitle(scope) ? conversationTitle(scope) + content.slice(0, 55) : item.title, updated_at: new Date().toISOString() } : item).sort((a,b) => b.updated_at.localeCompare(a.updated_at)));
    } catch (cause) {
      setMessages((list) => list.filter((item) => item !== optimistic));
      setDraft(content);
      setError(cause instanceof Error ? cause.message : "No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }

  async function chooseMode(nextMode: Mode) {
    if (nextMode === mode) return;
    if (!current) {
      setMode(nextMode);
      return;
    }

    setError("");
    const response = await fetch(`/api/assistant/conversations/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: nextMode }),
    });
    const data = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) throw new Error(data?.error ?? "No se pudo guardar el modo de la conversación.");

    setMode(nextMode);
    setCurrent({ ...current, mode: nextMode });
    setConversations((list) => list.map((item) => item.id === current.id ? { ...item, mode: nextMode } : item));
  }

  async function removeConversation(id: string) {
    if (!window.confirm("¿Eliminar esta conversación y su historial permanentemente?")) return;
    const response = await fetch(`/api/assistant/conversations/${id}`, { method: "DELETE" });
    if (!response.ok) { setError("No se pudo eliminar la conversación."); return; }
    const next = conversations.filter((item) => item.id !== id);
    setConversations(next);
    if (current?.id === id) { setCurrent(null); setMessages([]); }
  }

  const scopedConversations = conversations.filter(item=>(item.scope ?? scopeFromTitle(item.title))===scope);
  function switchWorkspace(next:AssistantScope){
    if(sending||next===scope)return;
    setSwitching(true);
    setScope(next);
    setCurrent(null);
    setMessages([]);
    setDraft("");
    setError("");
    setRemaining(null);
    setMobileHistoryOpen(false);
    setSwitching(false);
  }
  const activeMode = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);
  useEffect(() => {
    if (sending || messages.length > 0) endOfMessages.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);
  async function copyMessage(content: string, index: number) {
    try { await navigator.clipboard.writeText(content); setCopiedMessage(index); }
    catch { setError("Could not copy the message. Please check browser clipboard permissions."); }
  }

  if (loading) return <main className="min-h-screen px-4 py-28 text-[#F4F1EB] sm:px-6"><div className="mx-auto grid max-w-7xl animate-pulse gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"><div className="h-96 rounded-2xl bg-[#34322F]" /><div className="h-[70vh] rounded-2xl bg-[#34322F]" /></div></main>;

  return (
    <main className="min-h-screen bg-[#080e18] px-3 pb-5 pt-20 text-slate-100 sm:px-5 sm:pt-24">
      <div className="mx-auto grid max-w-[1500px] gap-0 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0d1725] shadow-[0_24px_80px_-45px_rgba(18,96,171,.42)] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-slate-700/70 bg-[#0b1421] p-4 lg:h-[calc(100vh-7.5rem)] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-sky-500/60 bg-sky-500/10 text-xl font-black text-sky-300">N</span>
              <span><span className="block text-sm font-bold">Nexus<span className="text-sky-300"> AI</span></span><span className="mt-0.5 block text-[10px] tracking-[0.12em] text-[#BDB6AB]">AI WORKSPACE</span></span>
            </Link>
            <Link href="/dashboard" aria-label="Open projects dashboard" title="Projects dashboard" className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#34322F] text-[#BDB6AB] transition hover:border-[#4B463D] hover:text-[#D9B77B]">▦</Link>
          </div>

          <AssistantWorkspacePicker active={scope} disabled={sending||switching} onSelect={switchWorkspace}/>
          <button onClick={() => void newConversation().catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo crear la conversación."))} className="nexus-primary-button mt-6 w-full">＋ Nueva conversación</button>

          <button type="button" onClick={() => setMobileHistoryOpen((open) => !open)} className="mt-4 flex items-center justify-between rounded-xl border border-[#34322F] bg-[#111214] px-3 py-2 text-left text-xs font-semibold text-[#D9B77B] lg:hidden" aria-expanded={mobileHistoryOpen} aria-controls="assistant-history">Historial reciente ({scopedConversations.length}) <span aria-hidden="true">{mobileHistoryOpen ? "−" : "+"}</span></button>
          <div className="mt-7 hidden items-center justify-between px-1 lg:flex"><p className="text-[10px] font-bold tracking-[0.17em] text-[#BDB6AB]">RECENT HISTORY</p><span className="text-[10px] text-[#AFA89E]">{scopedConversations.length}</span></div>
          <div id="assistant-history" className={`mt-3 min-h-0 flex-1 overflow-y-auto ${mobileHistoryOpen ? "block max-h-56" : "hidden lg:block"}`}>
            {scopedConversations.length === 0 ? <div className="rounded-xl border border-dashed border-[#34322F] px-3 py-6 text-center text-xs leading-5 text-[#BDB6AB]">Your saved conversations will appear here.</div> : <ul className="space-y-1.5">
              {scopedConversations.map((item) => <li key={item.id} className="group flex min-w-0 items-center gap-1">
                <button onClick={() => void openConversation(item.id).catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo abrir la conversación."))} aria-current={current?.id === item.id ? "page" : undefined} className={`min-w-0 flex-1 rounded-xl border px-3 py-3 text-left transition ${current?.id === item.id ? "border-[#4B463D] bg-[#34322F] text-[#E6E1D8]" : "border-transparent text-[#BDB6AB] hover:border-[#34322F] hover:bg-[#34322F] hover:text-[#E6E1D8]"}`}>
                  <span className="block truncate text-xs font-medium">{item.title}</span><span className="mt-1.5 block text-[10px] text-[#AFA89E]">{modes.find((modeItem) => modeItem.id === item.mode)?.label ?? "Copilot"}</span>
                </button>
                <button aria-label={`Delete conversation ${item.title}`} title="Delete conversation" onClick={() => void removeConversation(item.id)} className="grid size-8 shrink-0 place-items-center rounded-lg text-[#AFA89E] opacity-100 transition hover:bg-[#3C2628] hover:text-[#FFB0A9] sm:opacity-0 sm:group-hover:opacity-100">×</button>
              </li>)}
            </ul>}
          </div>
          <div className="mt-5 hidden border-t border-[#34322F] pt-4 lg:block">
            <div className="rounded-xl border border-[#4B463D] bg-gradient-to-br from-[#34322F] to-[#34322F] p-3.5"><p className="text-xs font-semibold text-[#E6E1D8]">A little progress adds up.</p><p className="mt-1.5 text-[11px] leading-5 text-[#BDB6AB]">Describe the next problem. The copilot will help you break it down.</p></div>
            <Link href="/dashboard" className="mt-4 flex items-center gap-2 px-1 text-xs text-[#BDB6AB] transition hover:text-[#D9B77B]">← Back to your projects</Link>
          </div>
        </aside>

        <section className="royal-workspace-surface flex min-h-[calc(100vh-7rem)] min-w-0 flex-col overflow-hidden lg:min-h-[calc(100vh-7.5rem)]">
          <header className="border-b border-[#4D3A23] bg-[#0F0E0C] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="nexus-kicker mb-2">{scope==="portfolio"?"NEXUS PORTFOLIO":"NEXUS TECHNICAL"}</p><h1 className="nexus-royal-title text-2xl sm:text-3xl">{scope==="portfolio"?"Asistente de portafolio":activeMode.label}</h1><p className="mt-1.5 max-w-xl text-xs leading-5 text-[#BDB6AB] sm:text-sm">{scope==="portfolio"?"Revisa proyectos, redacta mejoras y prepara tu CV. No publica ni modifica código automáticamente.":activeMode.description}</p></div>
              <div className="flex items-center gap-2 rounded-full border border-[#496F55] bg-[#1B3828] px-3 py-1.5 text-[10px] text-[#A7D8B2]"><span className="size-1.5 rounded-full bg-[#A7D8B2]" /> LISTO PARA AYUDAR</div>
            </div>
            {scope==="technical" && <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Choose assistant mode">
              {modes.map((item) => <button key={item.id} onClick={() => void chooseMode(item.id).catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo cambiar el modo."))} aria-pressed={mode === item.id} className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition ${mode === item.id ? "border-[#4B463D] bg-[#34322F] text-[#D9B77B] shadow-none" : "border-[#34322F] bg-[#34322F] text-[#BDB6AB] hover:border-[#34322F] hover:text-[#E6E1D8]"}`}>{item.label}</button>)}
            </div>}
          </header>

          <div className="royal-workspace-surface min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {!current && <div className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center sm:py-20">
              <div className="grid size-20 place-items-center rounded-3xl border border-sky-500/50 bg-sky-500/10 text-4xl font-black text-sky-300" aria-hidden="true">{scope==="portfolio"?"P":"T"}</div>
              <p className="nexus-kicker mt-6">Start with a question</p><h2 className="royal-workspace-title mt-3 text-3xl sm:text-4xl">¿En qué trabajamos hoy?</h2><p className="mt-3 max-w-lg text-sm leading-7 text-[#BDB6AB]">{scope==="portfolio"?"Mejora los casos de estudio, prepara tu CV y organiza tu búsqueda de empleo.":"Resuelve consultas de hardware, software, programación y ciberseguridad defensiva."}</p>
              <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-2">
                {(scope==="portfolio" ? [
                  { title: "Revisar mi CV", text: "Mejora el resumen sin inventar experiencia.", mode: "assistant" as Mode, icon: "↗" },
                  { title: "Preparar entrevista", text: "Practica cómo explicar proyectos.", mode: "interview" as Mode, icon: "◇" },
                  { title: "Analizar proyectos", text: "Convierte trabajo real en casos de estudio.", mode: "plan" as Mode, icon: "⌘" },
                  { title: "Plan de mejora", text: "Identifica los siguientes pasos.", mode: "plan" as Mode, icon: "⌕" },
                ] : [
                  { title: "Plan a project", text: "Turn an idea into clear tasks.", mode: "plan" as Mode, icon: "⌘" },
                  { title: "Debug an issue", text: "Find likely causes and next checks.", mode: "debug" as Mode, icon: "⌕" },
                  { title: "Learn a concept", text: "Understand code in plain language.", mode: "explain" as Mode, icon: "◇" },
                  { title: "Practice interviews", text: "Prepare structured technical answers.", mode: "interview" as Mode, icon: "↗" },
                ]).map((item) => <button key={item.title} onClick={() => { setMode(item.mode); setDraft(scope==="portfolio"?item.title+": Ayúdame a preparar una mejora concreta y verificable de mi portafolio.":item.title === "Plan a project" ? "Help me plan a project step by step." : item.title === "Debug an issue" ? "Help me debug an issue. Ask me for the relevant code and error." : item.title === "Learn a concept" ? "Explain a web development concept step by step in simple language." : "Start a junior web developer mock interview, one question at a time."); }} className="nexus-royal-card royal-quick-card group rounded-xl p-4"><span className="grid size-9 place-items-center rounded-lg border border-[#34322F] bg-[#34322F] text-lg text-[#D9B77B]">{item.icon}</span><span className="mt-3 block text-sm font-semibold text-[#E6E1D8]">{item.title} <span className="ml-1 text-[#AFA89E] transition group-hover:translate-x-1 group-hover:text-[#D9B77B]">↗</span></span><span className="mt-1.5 block text-xs leading-5 text-[#BDB6AB]">{item.text}</span></button>)}
              </div>
              <button onClick={() => void newConversation().catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo crear la conversación."))} className="nexus-primary-button mt-7">Crear conversación ↗</button>
            </div>}

            {current && messages.length === 0 && <div className="mx-auto max-w-xl py-12 text-center"><div className="mx-auto grid size-12 place-items-center rounded-xl border border-[#4B463D] bg-[#34322F] text-xl text-[#D9B77B]">✦</div><h2 className="mt-4 text-xl font-semibold">Let’s make the next step clear.</h2><p className="mt-2 text-sm leading-6 text-[#BDB6AB]">Write a question or use one of the suggestions below.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => setDraft("Help me plan my next step.")} className="nexus-ghost-button text-xs">Help me plan</button><button type="button" onClick={() => setDraft("Explain this code to me step by step.")} className="nexus-ghost-button text-xs">Explain code</button><button type="button" onClick={() => setDraft("Help me debug an error. What should I check first?")} className="nexus-ghost-button text-xs">Debug an error</button></div></div>}

            {messages.map((message, index) => <div key={message.id ?? `${message.role}-${index}`} className={`flex min-w-0 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <article className={`group min-w-0 max-w-full rounded-2xl border px-4 py-4 text-sm leading-7 sm:max-w-[88%] sm:px-5 ${message.role === "user" ? "border-[#4B463D] bg-[#34322F] text-[#E6E1D8]" : "border-[#34322F] bg-[#1D1E20] text-[#E6E1D8] shadow-[0_9px_28px_-25px_rgba(0,0,0,.42)]"}`}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2"><span className={`grid size-7 place-items-center rounded-lg text-xs font-bold ${message.role === "user" ? "bg-[#4B463D] text-[#D9B77B]" : "bg-[#D9B77B] text-[#191713]"}`}>{message.role === "user" ? "You" : "✦"}</span><span className="text-xs font-semibold text-[#D9B77B]">{message.role === "user" ? "You" : "Nexus AI"}</span></div>
                  <button type="button" aria-label={`Copy message ${index + 1}`} onClick={() => void copyMessage(message.content, index)} className="rounded-lg border border-[#34322F] bg-[#1D1E20] px-2.5 py-1 text-[11px] font-medium text-[#D9B77B] transition hover:bg-[#34322F]">{copiedMessage === index ? "Copied!" : "Copy"}</button>
                </div>
                <MessageContent content={message.content} />
                {message.sources && message.sources.length > 0 && <div className="mt-3 border-t border-[#34322F] pt-3 text-xs"><p className="mb-2 font-semibold text-[#A7D8B2]">Fuentes consultadas</p>{message.sources.map((source,index)=><a key={source.uri+index} className="block break-all py-1 text-[#A7D8B2] underline" href={source.uri} target="_blank" rel="noopener noreferrer">{source.title || source.uri} ↗</a>)}</div>}
              </article>
            </div>)}
            <div ref={endOfMessages} aria-hidden="true" />
            {sending && <div className="flex items-center gap-3 text-xs text-[#BDB6AB]" aria-live="polite"><span className="flex gap-1"><span className="size-1.5 animate-pulse rounded-full bg-[#D9B77B]" /><span className="size-1.5 animate-pulse rounded-full bg-[#D9B77B] [animation-delay:120ms]" /><span className="size-1.5 animate-pulse rounded-full bg-[#4B463D] [animation-delay:240ms]" /></span>Nexus AI is thinking…</div>}
            {error && <p role="alert" className="rounded-xl border border-[#8D5456] bg-[#3C2628] px-4 py-3 text-sm text-[#FFB0A9]">{error}</p>}
          </div>

          {scope==="technical" && <div className="flex flex-wrap items-center gap-3 border-t border-[#34322F] bg-[#111214] px-4 py-3 text-xs sm:px-5">
            <label htmlFor="assistant-specialty" className="font-semibold text-[#D9B77B]">Especialidad</label>
            <select id="assistant-specialty" value={expertise} onChange={event=>setExpertise(event.target.value as Expertise)} className="rounded-lg border border-[#73552B] bg-[#1D1E20] px-3 py-2 text-[#F4F1EB]">
              {expertises.map(item=><option key={item} value={item}>{({general:"General",hardware:"Hardware",software:"Software",cybersecurity:"Ciberseguridad"})[item]}</option>)}
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-[#D9B77B]"><input type="checkbox" checked={currentResearch} onChange={event=>setCurrentResearch(event.target.checked)} disabled={sending} className="size-4 accent-[#D9B77B]"/>Consultar fuentes recientes</label>
            <span className="text-[#BDB6AB]">La búsqueda depende del proveedor. No compartas datos sensibles.</span>
          </div>}
          <form onSubmit={sendMessage} className="border-t border-[#493A25] bg-[#0B0A09] p-3 sm:p-5">
            <label htmlFor="assistant-message" className="sr-only">Your message</label>
            <div className="rounded-2xl border border-[#B58749]/80 bg-[#121110] p-3 shadow-[0_0_22px_-15px_rgba(242,185,92,.7)] transition focus-within:border-[#F1C77E] focus-within:shadow-[0_0_18px_-10px_rgba(240,183,83,.8)] sm:p-4">
              <textarea id="assistant-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} maxLength={4000} rows={3} placeholder="Ask a question, describe an idea, or paste an error…" className="nexus-field min-h-20 resize-y border-0 bg-transparent px-1 py-1 text-sm shadow-none focus:border-transparent focus:shadow-none" />
              <div className="mt-3 flex flex-col justify-between gap-3 border-t border-[#34322F] pt-3 sm:flex-row sm:items-center">
                <p className="text-[10px] leading-5 text-[#AFA89E]">{remaining === null ? "Daily limit: 10 AI requests per user." : `${remaining} AI requests remaining today.`} Ctrl/⌘ + Enter to send. Never share passwords or private keys.</p>
                <button disabled={!current || !draft.trim() || sending} type="submit" className="nexus-primary-button w-full sm:w-auto">{sending ? "Thinking…" : "Send message"} <span aria-hidden="true">↗</span></button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
