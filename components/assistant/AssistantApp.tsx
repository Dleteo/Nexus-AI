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

  if (loading) return <main className="min-h-screen bg-black px-6 py-24 text-white"><p className="mx-auto max-w-7xl text-gray-400">Cargando Nexus AI…</p></main>;

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <Link href="/" className="text-sm text-cyan-300 hover:text-white">← Volver a Nexus AI</Link>
          <div className="mt-6 flex items-center justify-between gap-2"><h1 className="text-lg font-semibold">Tus conversaciones</h1><button onClick={() => void newConversation().catch((e) => setError(e.message))} className="rounded-full bg-cyan-300 px-3 py-2 text-sm font-semibold text-black">+ Nueva</button></div>
          <p className="mt-2 text-xs leading-5 text-gray-500">Tu historial es privado y está vinculado a tu cuenta.</p>
          <ul className="mt-4 space-y-2">
            {conversations.map((item) => <li key={item.id} className="flex gap-1">
              <button onClick={() => void openConversation(item.id).catch((e) => setError(e.message))} className={`min-w-0 flex-1 rounded-xl px-3 py-3 text-left text-sm ${current?.id === item.id ? "bg-cyan-300/10 text-cyan-100" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                <span className="block truncate">{item.title}</span><span className="mt-1 block text-xs opacity-60">{modes.find((m) => m.id === item.mode)?.label ?? "Copilot"}</span>
              </button>
              <button aria-label={`Eliminar ${item.title}`} onClick={() => void removeConversation(item.id)} className="rounded-lg px-2 text-gray-500 hover:bg-red-400/10 hover:text-red-200">×</button>
            </li>)}
          </ul>
          <div className="mt-8 border-t border-white/10 pt-4"><Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">Ir a tus proyectos →</Link></div>
        </aside>

        <section className="flex min-h-[72vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <header className="border-b border-white/10 p-5 sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Nexus AI · Copiloto</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{activeMode.label}</h2>
            <p className="mt-2 text-sm text-gray-400">{activeMode.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">{modes.map((item) => <button key={item.id} onClick={() => void chooseMode(item.id).catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo cambiar el modo."))} className={`rounded-full border px-3 py-2 text-xs transition ${mode === item.id ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-gray-400 hover:text-white"}`}>{item.label}</button>)}</div>
          </header>

          <div className="flex-1 space-y-5 p-4 sm:p-7">
            {!current && <div className="mx-auto max-w-xl py-12 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl">✦</div><h3 className="mt-5 text-xl font-semibold">¿Qué quieres resolver hoy?</h3><p className="mt-2 text-sm leading-6 text-gray-400">Pide ayuda con una idea, comparte un error, aprende un concepto o practica para una entrevista.</p><button onClick={() => void newConversation().catch((e) => setError(e.message))} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Empezar conversación</button></div>}
            {current && messages.length === 0 && <div className="mx-auto max-w-xl py-10 text-center"><h3 className="text-xl font-semibold">Empecemos por tu objetivo</h3><p className="mt-2 text-sm leading-6 text-gray-400">Cuéntame qué quieres construir o qué problema quieres solucionar.</p></div>}
            {messages.map((message, index) => <div key={message.id ?? `${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[82%] sm:px-5 ${message.role === "user" ? "bg-cyan-300/10 text-cyan-50" : "border border-white/10 bg-black/40 text-gray-200"}`}><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">{message.role === "user" ? "Tú" : "Nexus AI"}</p>{message.content}</div></div>)}
            {sending && <p className="text-sm text-gray-500" aria-live="polite">Nexus AI está pensando…</p>}
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          </div>
          <form onSubmit={sendMessage} className="border-t border-white/10 p-4 sm:p-6">
            <label htmlFor="assistant-message" className="sr-only">Tu mensaje</label>
            <textarea id="assistant-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={3} placeholder="Escribe tu pregunta, idea o error…" className="w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-cyan-300/50" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-gray-500">{remaining === null ? "Límite inicial: 10 solicitudes de IA al día." : `Te quedan ${remaining} solicitudes hoy.`} No compartas contraseñas ni claves privadas.</p><button disabled={!current || !draft.trim() || sending} type="submit" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">{sending ? "Enviando…" : "Enviar mensaje ↗"}</button></div>
          </form>
        </section>
      </div>
    </main>
  );
}
