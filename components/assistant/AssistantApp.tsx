"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Mode = "assistant" | "plan" | "debug" | "explain" | "interview";
type Conversation = { id: string; title: string; mode: Mode; project_id: string | null; updated_at: string };
type Message = { id?: string; role: "user" | "assistant"; content: string; created_at?: string };
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
  const [mode, setMode] = useState<Mode>("assistant");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  const openConversation = useCallback(async (id: string) => {
    setError("");
    const response = await fetch(`/api/assistant/conversations/${id}`, { cache: "no-store" });
    const data = await response.json() as { conversation?: Conversation; messages?: Message[]; error?: string };
    if (!response.ok || !data.conversation) throw new Error(data.error ?? "No se pudo abrir la conversación.");
    setCurrent(data.conversation);
    setMode(data.conversation.mode);
    setMessages(data.messages ?? []);
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

  async function newConversation(nextMode: Mode = mode) {
    setError("");
    const response = await fetch("/api/assistant/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New conversation", mode: nextMode }),
    });
    const data = await response.json() as { conversation?: Conversation; error?: string };
    if (!response.ok || !data.conversation) throw new Error(data.error ?? "No se pudo crear la conversación.");
    setConversations((list) => [data.conversation!, ...list]);
    setCurrent(data.conversation);
    setMessages([]);
    setMode(nextMode);
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
        body: JSON.stringify({ conversationId: current.id, message: content, mode }),
      });
      const data = await response.json() as { answer?: string; error?: string; requestsRemaining?: number };
      if (!response.ok || !data.answer) throw new Error(data.error ?? "No se pudo obtener una respuesta.");
      setMessages((list) => [...list, { role: "assistant", content: data.answer! }]);
      setRemaining(data.requestsRemaining ?? null);
      setConversations((list) => list.map((item) => item.id === current.id ? { ...item, mode, title: item.title === "New conversation" ? content.slice(0, 80) : item.title, updated_at: new Date().toISOString() } : item).sort((a,b) => b.updated_at.localeCompare(a.updated_at)));
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

  const activeMode = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);

  if (loading) return <main className="min-h-screen px-4 py-28 text-[#302923] sm:px-6"><div className="mx-auto grid max-w-7xl animate-pulse gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"><div className="h-96 rounded-2xl bg-[#FFF2E8]" /><div className="h-[70vh] rounded-2xl bg-[#FFF2E8]" /></div></main>;

  return (
    <main className="min-h-screen px-3 pb-5 pt-20 text-[#302923] sm:px-5 sm:pt-24">
      <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="nexus-panel flex min-h-0 flex-col p-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7.5rem)]">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#E6BDA7] bg-gradient-to-br from-[#F8D6C3] to-[#FBECE3] text-xl text-[#AD5637]">✦</span>
              <span><span className="block text-sm font-bold">Nexus<span className="text-[#AD5637]">AI</span></span><span className="mt-0.5 block text-[10px] tracking-[0.12em] text-[#756155]">AI WORKSPACE</span></span>
            </Link>
            <Link href="/dashboard" aria-label="Open projects dashboard" title="Projects dashboard" className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#E9D9CC] text-[#756155] transition hover:border-[#E6BDA7] hover:text-[#AD5637]">▦</Link>
          </div>

          <button onClick={() => void newConversation().catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo crear la conversación."))} className="nexus-primary-button mt-6 w-full">＋ New conversation</button>

          <div className="mt-7 flex items-center justify-between px-1"><p className="text-[10px] font-bold tracking-[0.17em] text-[#756155]">RECENT HISTORY</p><span className="text-[10px] text-[#816B5E]">{conversations.length}</span></div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
            {conversations.length === 0 ? <div className="rounded-xl border border-dashed border-[#E9D9CC] px-3 py-6 text-center text-xs leading-5 text-[#756155]">Your saved conversations will appear here.</div> : <ul className="space-y-1.5">
              {conversations.map((item) => <li key={item.id} className="group flex min-w-0 items-center gap-1">
                <button onClick={() => void openConversation(item.id).catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo abrir la conversación."))} aria-current={current?.id === item.id ? "page" : undefined} className={`min-w-0 flex-1 rounded-xl border px-3 py-3 text-left transition ${current?.id === item.id ? "border-[#E7C9B5] bg-[#F9D8C5] text-[#40342E]" : "border-transparent text-[#756155] hover:border-[#E9D9CC] hover:bg-[#FFF2E8] hover:text-[#40342E]"}`}>
                  <span className="block truncate text-xs font-medium">{item.title}</span><span className="mt-1.5 block text-[10px] text-[#816B5E]">{modes.find((modeItem) => modeItem.id === item.mode)?.label ?? "Copilot"}</span>
                </button>
                <button aria-label={`Delete conversation ${item.title}`} title="Delete conversation" onClick={() => void removeConversation(item.id)} className="grid size-8 shrink-0 place-items-center rounded-lg text-[#816B5E] opacity-100 transition hover:bg-[#FCE8E6] hover:text-[#A93636] sm:opacity-0 sm:group-hover:opacity-100">×</button>
              </li>)}
            </ul>}
          </div>
          <div className="mt-5 border-t border-[#E9D9CC] pt-4">
            <div className="rounded-xl border border-[#E6BDA7] bg-gradient-to-br from-[#F8D6C3] to-[#FBECE3] p-3.5"><p className="text-xs font-semibold text-[#40342E]">A little progress adds up.</p><p className="mt-1.5 text-[11px] leading-5 text-[#756155]">Describe the next problem. The copilot will help you break it down.</p></div>
            <Link href="/dashboard" className="mt-4 flex items-center gap-2 px-1 text-xs text-[#756155] transition hover:text-[#AD5637]">← Back to your projects</Link>
          </div>
        </aside>

        <section className="nexus-panel flex min-h-[calc(100vh-7rem)] min-w-0 flex-col overflow-hidden lg:min-h-[calc(100vh-7.5rem)]">
          <header className="border-b border-[#E9D9CC] bg-[#FFFCF8] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="nexus-kicker mb-2">Your AI workspace</p><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{activeMode.label}</h1><p className="mt-1.5 max-w-xl text-xs leading-5 text-[#756155] sm:text-sm">{activeMode.description}</p></div>
              <div className="flex items-center gap-2 rounded-full border border-[#B6D7BD] bg-[#E6F3E8] px-3 py-1.5 text-[10px] text-[#3D7654]"><span className="size-1.5 rounded-full bg-emerald-300" /> READY TO HELP</div>
            </div>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Choose assistant mode">
              {modes.map((item) => <button key={item.id} onClick={() => void chooseMode(item.id).catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo cambiar el modo."))} aria-pressed={mode === item.id} className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition ${mode === item.id ? "border-[#E6BDA7] bg-[#FBE3D3] text-[#AD5637] shadow-[inset_0_0_18px_rgba(103,232,249,0.03)]" : "border-[#E9D9CC] bg-[#FFF2E8] text-[#756155] hover:border-[#E9D9CC] hover:text-[#40342E]"}`}>{item.label}</button>)}
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {!current && <div className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center sm:py-20">
              <div className="relative grid size-16 place-items-center rounded-2xl border border-[#E6BDA7] bg-gradient-to-br from-[#F8D6C3] to-[#FBECE3] text-3xl text-[#AD5637]"><span className="absolute inset-0 rounded-2xl shadow-[0_0_45px_-20px_rgba(103,232,249,.55)]" aria-hidden="true" />✦</div>
              <p className="nexus-kicker mt-6">Start with a question</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">What are we working on?</h2><p className="mt-3 max-w-lg text-sm leading-7 text-[#756155]">Plan a project, untangle an error, learn a concept step by step, or get ready for a technical interview.</p>
              <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-2">
                {[
                  { title: "Plan a project", text: "Turn an idea into clear tasks.", mode: "plan" as Mode, icon: "⌘" },
                  { title: "Debug an issue", text: "Find likely causes and next checks.", mode: "debug" as Mode, icon: "⌕" },
                  { title: "Learn a concept", text: "Understand code in plain language.", mode: "explain" as Mode, icon: "◇" },
                  { title: "Practice interviews", text: "Prepare structured technical answers.", mode: "interview" as Mode, icon: "↗" },
                ].map((item) => <button key={item.mode} onClick={() => { setMode(item.mode); setDraft(item.title === "Plan a project" ? "Help me plan a project step by step." : item.title === "Debug an issue" ? "Help me debug an issue. Ask me for the relevant code and error." : item.title === "Learn a concept" ? "Explain a web development concept step by step in simple language." : "Start a junior web developer mock interview, one question at a time."); }} className="group rounded-xl border border-[#E9D9CC] bg-[#FFF2E8] p-4 transition hover:border-[#E6BDA7] hover:bg-[#FBE3D3]"><span className="grid size-9 place-items-center rounded-lg border border-[#E9D9CC] bg-[#FFF2E8] text-lg text-[#AD5637]">{item.icon}</span><span className="mt-3 block text-sm font-semibold text-[#40342E]">{item.title} <span className="ml-1 text-[#816B5E] transition group-hover:translate-x-1 group-hover:text-[#AD5637]">↗</span></span><span className="mt-1.5 block text-xs leading-5 text-[#756155]">{item.text}</span></button>)}
              </div>
              <button onClick={() => void newConversation().catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo crear la conversación."))} className="nexus-primary-button mt-7">Start a conversation ↗</button>
            </div>}

            {current && messages.length === 0 && <div className="mx-auto max-w-xl py-12 text-center"><div className="mx-auto grid size-12 place-items-center rounded-xl border border-[#E6BDA7] bg-[#FBE3D3] text-xl text-[#AD5637]">✦</div><h2 className="mt-4 text-xl font-semibold">Let’s make the next step clear.</h2><p className="mt-2 text-sm leading-6 text-[#756155]">Write a question or use one of the suggestions below.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => setDraft("Help me plan my next step.")} className="nexus-ghost-button text-xs">Help me plan</button><button type="button" onClick={() => setDraft("Explain this code to me step by step.")} className="nexus-ghost-button text-xs">Explain code</button><button type="button" onClick={() => setDraft("Help me debug an error. What should I check first?")} className="nexus-ghost-button text-xs">Debug an error</button></div></div>}

            {messages.map((message, index) => <div key={message.id ?? `${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[96%] rounded-2xl border px-4 py-3.5 text-sm leading-7 sm:max-w-[85%] sm:px-5 ${message.role === "user" ? "border-[#E7C9B5] bg-gradient-to-br from-[#F8D6C3] to-[#FBECE3] text-[#40342E]" : "border-[#E9D9CC] bg-[#FFFCF8] text-[#40342E]"}`}><div className="mb-2 flex items-center gap-2"><span className={`grid size-6 place-items-center rounded-lg text-[11px] ${message.role === "user" ? "bg-[#F9D8C5] text-[#A6573D]" : "bg-[#FBE3D3] text-[#AD5637]"}`}>{message.role === "user" ? "JS" : "✦"}</span><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#756155]">{message.role === "user" ? "You" : "Nexus AI"}</p></div><p className="whitespace-pre-wrap break-words">{message.content}</p></div></div>)}
            {sending && <div className="flex items-center gap-3 text-xs text-[#756155]" aria-live="polite"><span className="flex gap-1"><span className="size-1.5 animate-pulse rounded-full bg-[#C97955]" /><span className="size-1.5 animate-pulse rounded-full bg-[#D69977] [animation-delay:120ms]" /><span className="size-1.5 animate-pulse rounded-full bg-[#DFB99F] [animation-delay:240ms]" /></span>Nexus AI is thinking…</div>}
            {error && <p role="alert" className="rounded-xl border border-[#EEB8B0] bg-[#FCE8E6] px-4 py-3 text-sm text-[#A93636]">{error}</p>}
          </div>

          <form onSubmit={sendMessage} className="border-t border-[#E9D9CC] bg-[#FFFCF8] p-3 sm:p-5">
            <label htmlFor="assistant-message" className="sr-only">Your message</label>
            <div className="rounded-2xl border border-white/[0.10] bg-[#FFFCF8] p-3 transition focus-within:border-[#E6BDA7] focus-within:shadow-[0_0_0_3px_rgba(103,232,249,0.035)] sm:p-4">
              <textarea id="assistant-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={3} placeholder="Ask a question, describe an idea, or paste an error…" className="nexus-field min-h-20 resize-y border-0 bg-transparent px-1 py-1 text-sm shadow-none focus:border-transparent focus:shadow-none" />
              <div className="mt-3 flex flex-col justify-between gap-3 border-t border-[#E9D9CC] pt-3 sm:flex-row sm:items-center">
                <p className="text-[10px] leading-5 text-[#816B5E]">{remaining === null ? "Daily limit: 10 AI requests per user." : `${remaining} AI requests remaining today.`} Never share passwords or private keys.</p>
                <button disabled={!current || !draft.trim() || sending} type="submit" className="nexus-primary-button w-full sm:w-auto">{sending ? "Thinking…" : "Send message"} <span aria-hidden="true">↗</span></button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
