"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { setGuideLanguage, setGuideVoice, useGuideLanguage, useGuideVoice } from "./guidePreferences";

// Public portfolio guide. NEVER put AI provider keys or privileged Supabase data in this client component.
// General AI queries must go through the existing authenticated /assistant route and server quotas.
type Lang = "es" | "en" | "pt" | "fr";
type Message = { from: "visitor" | "nexus"; text: string; id: number };
type GuideEvent = CustomEvent<{ language?: Lang; prompt?: string; open?: boolean }>;

const langTags: Record<Lang, string> = { es: "es-ES", en: "en-US", pt: "pt-BR", fr: "fr-FR" };
const words = {
  es: { bubble: "Preguntar a Nexus", header: "NEXUS · GUÍA", subtitle: "Portafolio público · No es el asistente general", start: "Hola. Soy el guía de Nexus AI. Puedes preguntarme por los proyectos, las habilidades o la experiencia del creador. Para consultas técnicas abiertas, inicia sesión en el asistente.", placeholder: "Pregunta sobre el portafolio...", send: "Enviar", listen: "Activar voz", mute: "Silenciar voz", mic: "Dictar pregunta", unavailable: "El reconocimiento de voz no está disponible en este navegador.", general: "Esta guía pública conoce el portafolio, pero no responde preguntas técnicas generales ni noticias actuales. Abre el asistente autenticado para esas funciones.", ask: "Pregúntame por proyectos, conocimientos, experiencia, certificados o Nexus Foundation.", assistant: "Abrir asistente completo", projects: "Estos son los proyectos: Nexus AI es el proyecto principal, con autenticación, gestión de proyectos y un asistente externo; también hay Task Tracker, Hangman Game y Text Encoder / Decoder.", skills: "Joshua ha practicado HTML5, CSS3, Flexbox, Grid, Bootstrap 5, JavaScript ES6, DOM y localStorage. Ha integrado Next.js, React, TypeScript, Supabase y Gemini con asistencia de IA.", experience: "Joshua ha trabajado en un hotel de Bedford, Pensilvania, y tiene experiencia en pizzería, supermercado y flores. No presenta esos trabajos como experiencia remunerada de desarrollo.", about: "Joshua Vallejo Sanchez está construyendo su carrera como Junior Web Developer y desarrolla Nexus AI como proyecto principal.", foundation: "Nexus Foundation es una investigación experimental de un Transformer original con PyTorch y tokenizador BPE. No es la IA que responde en Nexus AI y todavía no conversa de forma fiable.", certs: "El portafolio muestra los certificados y sus horas documentadas. Abre la sección de certificados para ver títulos y credenciales verificables.", saved: "Guía local. No se envían las preguntas a servicios de IA." },
  en: { bubble: "Ask Nexus", header: "NEXUS · GUIDE", subtitle: "Public portfolio · Not the general assistant", start: "Hello. I am the Nexus AI portfolio guide. Ask about the projects, skills and the developer's background. For general technical questions, sign in to the assistant.", placeholder: "Ask about the portfolio...", send: "Send", listen: "Enable voice", mute: "Mute voice", mic: "Dictate question", unavailable: "Speech recognition is not supported in this browser.", general: "This public guide knows the portfolio but cannot answer open-ended technical questions or current news. Open the authenticated assistant for those functions.", ask: "Ask about projects, skills, experience, certificates, or Nexus Foundation.", assistant: "Open full assistant", projects: "Projects: Nexus AI is the flagship, with authentication, project management and an external AI assistant. Other work includes Task Tracker, Hangman Game and Text Encoder / Decoder.", skills: "Joshua has practiced HTML5, CSS3, Flexbox, Grid, Bootstrap 5, JavaScript ES6, DOM and localStorage. He has integrated Next.js, React, TypeScript, Supabase and Gemini with AI assistance.", experience: "Joshua has worked at a hotel in Bedford, Pennsylvania, and has experience in pizza making, supermarkets and floral work. Those are not presented as paid software developer roles.", about: "Joshua Vallejo Sanchez is pursuing a Junior Web Developer role and is creating Nexus AI as his flagship project.", foundation: "Nexus Foundation is experimental research into an original Transformer using PyTorch and a BPE tokenizer. It does not power Nexus AI and cannot yet reliably converse.", certs: "The portfolio lists training certificates and documented hours. Open the certificates section for source details.", saved: "Local guide. Questions are not sent to AI services." },
  pt: { bubble: "Perguntar ao Nexus", header: "NEXUS · GUIA", subtitle: "Portfólio público · Não é o assistente geral", start: "Olá. Sou o guia de Nexus AI. Pergunte sobre projetos, habilidades e experiência. Para perguntas gerais, entre no assistente.", placeholder: "Pergunte sobre o portfólio...", send: "Enviar", listen: "Ativar voz", mute: "Desativar voz", mic: "Ditado", unavailable: "Reconhecimento de voz indisponível.", general: "Este guia conhece somente o portfólio. Para perguntas técnicas e notícias atuais, abra o assistente autenticado.", ask: "Pergunte sobre projetos, habilidades, experiência, certificados ou Nexus Foundation.", assistant: "Abrir assistente completo", projects: "Nexus AI é o projeto principal, com autenticação, gestão de projetos e assistente externo. Também há Task Tracker, Hangman e Text Encoder.", skills: "Joshua praticou HTML, CSS, JavaScript, DOM e localStorage. Integra Next.js, React, TypeScript, Supabase e Gemini com assistência de IA.", experience: "Joshua trabalhou em hotel em Bedford e tem experiência em pizzaria, supermercado e flores; não são empregos de desenvolvimento.", about: "Joshua Vallejo Sanchez está construindo carreira como desenvolvedor web júnior com Nexus AI.", foundation: "Nexus Foundation é pesquisa experimental com PyTorch e BPE, não o modelo que responde em Nexus AI.", certs: "Os certificados e horas estão no portfólio.", saved: "Guia local, sem consulta a serviços de IA." },
  fr: { bubble: "Demander à Nexus", header: "NEXUS · GUIDE", subtitle: "Portfolio public · Pas l'assistant général", start: "Bonjour. Je suis le guide de Nexus AI. Posez des questions sur les projets, compétences et expériences. Pour des questions générales, connectez-vous à l'assistant.", placeholder: "Question sur le portfolio...", send: "Envoyer", listen: "Activer la voix", mute: "Couper la voix", mic: "Dictée", unavailable: "Reconnaissance vocale indisponible.", general: "Ce guide connaît uniquement le portfolio. Pour des questions techniques et l'actualité, ouvrez l'assistant authentifié.", ask: "Demandez les projets, compétences, expériences, certificats ou Nexus Foundation.", assistant: "Ouvrir l'assistant complet", projects: "Nexus AI est le projet principal, avec authentification, gestion de projets et assistant externe. Autres projets : Task Tracker, Hangman et Text Encoder.", skills: "Joshua a pratiqué HTML, CSS, JavaScript, DOM et localStorage. Next.js, React, TypeScript, Supabase et Gemini ont été intégrés avec l'aide de l'IA.", experience: "Joshua a travaillé dans un hôtel à Bedford et dans une pizzeria, un supermarché et le secteur floral, pas comme développeur rémunéré.", about: "Joshua Vallejo Sanchez développe sa carrière de développeur web junior avec Nexus AI.", foundation: "Nexus Foundation est une recherche expérimentale avec PyTorch et BPE ; ce n'est pas le modèle qui anime Nexus AI.", certs: "Les certificats et les heures sont détaillés sur le portfolio.", saved: "Guide local sans consultation de service d'IA." },
};

const topics = [
  { pattern: /proyec|project|projet|portafolio|portf[oó]lio|github|repo|hangman|encript|encoder/i, key: "projects" },
  { pattern: /habil|skill|compet|knowledge|conoc|css|html|javascript|react|supabase|type(script)?/i, key: "skills" },
  { pattern: /experien|trabaj|work|hotel|bedford|pizz|supermerc|flor|emploi/i, key: "experience" },
  { pattern: /foundation|transformer|pytorch|tokeniz|investig|research|recherche|modelo|model/i, key: "foundation" },
  { pattern: /certif|curso|course|horas|hours|formation|school/i, key: "certs" },
  { pattern: /quien|qui[eé]n|who|autor|author|joshua|creador|creator|criador|about|sobre/i, key: "about" },
] as const;

function answerFor(question: string, language: Lang) {
  const normalized = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const topic = topics.find(({ pattern }) => pattern.test(normalized));
  return topic ? words[language][topic.key] : words[language].general;
}

export default function NexusCompanion() {
  const [open, setOpen] = useState(false);
  const lang = useGuideLanguage();
  const voice = useGuideVoice();
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);
  const counter = useRef(0);
  const speech = useRef<SpeechSynthesisUtterance | null>(null);
  const locale = words[lang];

  const addMessage = useCallback((from: Message["from"], text: string) => {
    counter.current += 1;
    setMessages((current) => [...current.slice(-29), { from, text, id: counter.current }]);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    window.dispatchEvent(new Event("nexus:speech-end"));
  }, []);

  const speak = useCallback((text: string, language: Lang) => {
    if (typeof window === "undefined" || !voice || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langTags[language];
    utterance.rate = 0.96;
    utterance.pitch = 0.88;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((item) => item.lang.toLowerCase() === langTags[language].toLowerCase())
      ?? voices.find((item) => item.lang.toLowerCase().startsWith(language)) ?? null;
    utterance.onstart = () => { setSpeaking(true); window.dispatchEvent(new Event("nexus:speech-start")); };
    const ended = () => { setSpeaking(false); window.dispatchEvent(new Event("nexus:speech-end")); };
    utterance.onend = ended;
    utterance.onerror = ended;
    speech.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voice]);

  useEffect(() => {
    function onGuide(event: Event) {
      const detail = (event as GuideEvent).detail;
      if (!detail) return;
      const language = detail.language ?? lang;
      if (detail.language) setGuideLanguage(detail.language);
      if (detail.prompt) {
        addMessage("nexus", detail.prompt);
        speak(detail.prompt, language);
      }
      if (detail.open) setOpen(true);
    }
    function onLanguage(event: Event) {
      const next = (event as CustomEvent<Lang>).detail;
      if (next === "es" || next === "en" || next === "pt" || next === "fr") stop();
    }
    window.addEventListener("nexus:guide", onGuide);
    window.addEventListener("nexus:language", onLanguage);
    return () => { window.removeEventListener("nexus:guide", onGuide); window.removeEventListener("nexus:language", onLanguage); };
  }, [addMessage, lang, speak, stop]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages]);
  useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);

  function selectLanguage(value: Lang) {
    setGuideLanguage(value);
  }

  function send(question: string) {
    const cleaned = question.trim().slice(0, 320);
    if (!cleaned) return;
    addMessage("visitor", cleaned);
    const reply = answerFor(cleaned, lang);
    addMessage("nexus", reply);
    speak(reply, lang);
    setDraft("");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); send(draft); }

  function startDictation() {
    type RecognitionLike = { lang: string; start: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
    const browser = window as Window & { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
    const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Constructor) { addMessage("nexus", locale.unavailable); return; }
    const rec = new Constructor();
    rec.lang = langTags[lang];
    rec.onresult = (event) => { const transcript = event.results[0]?.[0]?.transcript; if (transcript) setDraft(transcript); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try { rec.start(); setListening(true); } catch { setListening(false); }
  }

  return (
    <aside className="nexus-companion" aria-label="Nexus portfolio guide" lang={lang}>
      {open ? (
        <section className="nexus-companion-window" aria-label={locale.header}>
          <header className="nexus-companion-head">
            <div className={`nexus-companion-avatar ${speaking ? "talking" : ""}`} role="img" aria-label="Nexus guide portrait" />
            <div><strong>{locale.header}</strong><span>{locale.subtitle}</span></div>
            <button type="button" aria-label="Close chat" onClick={() => { setOpen(false); stop(); }}>✕</button>
          </header>
          <div className="nexus-companion-options">
            <label htmlFor="nexus-companion-language" className="nexus-companion-sr">Language</label>
            <select id="nexus-companion-language" value={lang} onChange={(event: ChangeEvent<HTMLSelectElement>) => selectLanguage(event.target.value as Lang)} aria-label="Language">
              <option value="es">Español</option><option value="en">English</option><option value="pt">Português</option><option value="fr">Français</option>
            </select>
            <button type="button" onClick={() => { const next = !voice; setGuideVoice(next); if (!next) stop(); }} aria-pressed={voice} aria-label={voice ? locale.mute : locale.listen}>{voice ? "◖))" : "◖×"}</button>
            <button type="button" onClick={startDictation} aria-label={locale.mic} aria-pressed={listening}>🎙 {listening ? "●" : ""}</button>
          </div>
          <div className="nexus-companion-messages" ref={scroller} role="log" aria-live="polite">
            {messages.length === 0 && <p className="nexus-companion-message bot">{locale.start}</p>}
            {messages.map((message) => <p key={message.id} className={`nexus-companion-message ${message.from === "visitor" ? "user" : "bot"}`}>{message.text}</p>)}
          </div>
          <div className="nexus-companion-shortcuts"><button type="button" onClick={() => send(lang === "es" ? "proyectos" : "projects")}>Projects</button><button type="button" onClick={() => send(lang === "es" ? "habilidades" : "skills")}>Skills</button><button type="button" onClick={() => send("Nexus Foundation")}>Foundation</button></div>
          <form onSubmit={onSubmit} className="nexus-companion-form"><label htmlFor="nexus-companion-draft" className="nexus-companion-sr">{locale.placeholder}</label><input id="nexus-companion-draft" maxLength={320} value={draft} onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)} placeholder={locale.placeholder} /><button type="submit" disabled={!draft.trim()} aria-label={locale.send}>➤</button></form>
          <footer className="nexus-companion-foot"><span>{locale.saved}</span><Link href="/assistant">{locale.assistant} ↗</Link></footer>
        </section>
      ) : (
        <button type="button" className="nexus-companion-trigger" onClick={() => setOpen(true)} aria-label={locale.bubble} aria-expanded="false"><span aria-hidden="true">◈</span>{locale.bubble}</button>
      )}
    </aside>
  );
}
