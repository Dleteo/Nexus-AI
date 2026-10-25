"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent } from "react";
import { setGuideLanguage, useGuideLanguage } from "./guidePreferences";

type Language = "es" | "en" | "pt" | "fr";
type Zone = "cognition" | "knowledge" | "experience" | "creative" | "assistance" | "future";
type Localized = Record<Language, string>;
type Hologram = {
  id: Zone;
  number: string;
  rect: { left: string; top: string; width: string; height: string };
  title: Localized;
  intro: Localized;
  details: Localized[];
  links: { label: string; href: string; external?: boolean }[];
};

const languages: Record<Language, string> = { es: "Español", en: "English", pt: "Português", fr: "Français" };
const localized = (es: string, en: string, pt: string, fr: string): Localized => ({ es, en, pt, fr });

const zones: Hologram[] = [
  {
    id: "cognition", number: "01", rect: { left: "5.8%", top: "2.4%", width: "21.2%", height: "22%" },
    title: localized("Sobre el creador", "About the developer", "Sobre o criador", "À propos du créateur"),
    intro: localized("Joshua Vallejo Sanchez está desarrollando su carrera como Junior Web Developer. Nexus AI es su proyecto principal de portafolio.", "Joshua Vallejo Sanchez is pursuing a Junior Web Developer career. Nexus AI is his flagship portfolio project.", "Joshua Vallejo Sanchez está construindo sua carreira como desenvolvedor web júnior. Nexus AI é seu principal projeto.", "Joshua Vallejo Sanchez développe sa carrière de développeur web junior. Nexus AI est son projet principal."),
    details: [
      localized("Ubicación profesional: Pensilvania, Estados Unidos.", "Professional location: Pennsylvania, United States.", "Localização: Pensilvânia, EUA.", "Localisation : Pennsylvanie, États-Unis."),
      localized("Español nativo, inglés intermedio; experiencia laboral en hostelería, cocina, supermercado y otros entornos.", "Native Spanish and intermediate English; work experience in hospitality, kitchens, supermarkets and other settings.", "Espanhol nativo, inglês intermediário; experiência em hotelaria e comércio.", "Espagnol natif, anglais intermédiaire ; expérience en hôtellerie et commerce."),
      localized("No se afirma experiencia remunerada como desarrollador ni habilidades que no estén demostradas.", "No claim of paid developer employment or unverified skills.", "Sem alegar emprego pago em desenvolvimento ou competências não verificadas.", "Pas de revendication d'emploi rémunéré en développement ou de compétences non vérifiées."),
    ],
    links: [{ label: "Portfolio", href: "/portfolio" }, { label: "Résumé / CV", href: "/resume" }, { label: "GitHub", href: "https://github.com/Dleteo", external: true }],
  },
  {
    id: "knowledge", number: "02", rect: { left: "3.8%", top: "25.3%", width: "19.8%", height: "25%" },
    title: localized("Conocimientos y certificados", "Skills and credentials", "Conhecimentos e certificados", "Compétences et certificats"),
    intro: localized("Habilidades de frontend practicadas en proyectos personales y herramientas avanzadas integradas en Nexus AI con ayuda de IA.", "Frontend skills practiced in personal projects and advanced tools integrated into Nexus AI with AI assistance.", "Habilidades de frontend praticadas e tecnologias modernas usadas no Nexus AI com ajuda de IA.", "Compétences frontend pratiquées et technologies modernes intégrées avec l'assistance de l'IA."),
    details: [
      localized("Práctica directa: HTML5, CSS3, Flexbox, Grid, Bootstrap 5, JavaScript ES6, DOM y localStorage.", "Direct practice: HTML5, CSS3, Flexbox, Grid, Bootstrap 5, JavaScript ES6, DOM and localStorage.", "Prática direta: HTML5, CSS3, Flexbox, Grid, Bootstrap 5, JavaScript, DOM e localStorage.", "Pratique directe : HTML5, CSS3, Flexbox, Grid, Bootstrap 5, JavaScript, DOM et localStorage."),
      localized("Integración asistida: React, Next.js, TypeScript, Tailwind CSS, Supabase y Gemini.", "AI-assisted integration: React, Next.js, TypeScript, Tailwind CSS, Supabase and Gemini.", "Integração assistida: React, Next.js, TypeScript, Tailwind, Supabase e Gemini.", "Intégration assistée : React, Next.js, TypeScript, Tailwind, Supabase et Gemini."),
      localized("Los certificados se muestran con sus horas y credenciales reales.", "Credentials show verified titles, types and recorded training hours.", "Os certificados exibem títulos e horas reais.", "Les certificats indiquent leurs intitulés et heures réels."),
    ],
    links: [{ label: "Skills & Certificates", href: "/portfolio#skills" }, { label: "All certificates", href: "/portfolio#certifications" }],
  },
  {
    id: "experience", number: "03", rect: { left: "5.1%", top: "61.7%", width: "24.8%", height: "22.8%" },
    title: localized("Experiencia y trayectoria", "Work experience", "Experiência profissional", "Expérience professionnelle"),
    intro: localized("Experiencia real en un hotel de Bedford, Pensilvania, y en labores de pizzería, flores y supermercado. El aprendizaje técnico continúa mediante proyectos propios.", "Real work experience at a hotel in Bedford, Pennsylvania, and in pizza making, floral work and supermarket operations. Technical learning continues through personal projects.", "Experiência real em hotel em Bedford, pizzaria, flores e supermercado.", "Expérience réelle dans un hôtel à Bedford, dans une pizzeria, les fleurs et un supermarché."),
    details: [
      localized("Organización, responsabilidades de turno, coordinación con colegas y resolución práctica de problemas.", "Organization, shift responsibilities, coordinating with colleagues and practical problem-solving.", "Organização, responsabilidade e trabalho em equipe.", "Organisation, responsabilités et travail en équipe."),
      localized("Estas funciones no se presentan como empleo previo en desarrollo web.", "These roles are not described as previous software developer employment.", "Esses cargos não são apresentados como emprego de desenvolvedor.", "Ces postes ne sont pas présentés comme un emploi de développeur."),
    ],
    links: [{ label: "Experience", href: "/portfolio#experience" }, { label: "Résumé / CV", href: "/resume" }],
  },
  {
    id: "creative", number: "04", rect: { left: "72%", top: "3.8%", width: "22.5%", height: "20%" },
    title: localized("Mis proyectos", "My projects", "Meus projetos", "Mes projets"),
    intro: localized("Nexus AI es el proyecto destacado: gestión privada de proyectos, autenticación, un asistente integrado e historial. Los proyectos de aprendizaje documentan el camino recorrido.", "Nexus AI is the flagship: private project management, authentication, an integrated assistant and conversation history. Smaller projects document the learning journey.", "Nexus AI é o projeto principal com autenticação e assistente. Os demais mostram o aprendizado.", "Nexus AI est le projet principal avec authentification et assistant. Les autres retracent l'apprentissage."),
    details: [
      localized("Task Tracker: eventos DOM, tareas y almacenamiento local.", "Task Tracker: DOM events, tasks and browser persistence.", "Task Tracker: DOM e armazenamento local.", "Task Tracker : DOM et stockage local."),
      localized("Hangman Game: lógica de juego interactivo con JavaScript.", "Hangman Game: interactive JavaScript game logic.", "Hangman Game: lógica de jogo em JavaScript.", "Hangman Game : logique de jeu JavaScript."),
      localized("Text Encoder / Decoder: transformación de cadenas; no es criptografía segura.", "Text Encoder / Decoder: reversible string transformation, not secure cryptography.", "Text Encoder: transformação de texto, não criptografia segura.", "Text Encoder : transformation de texte, pas un chiffrement sûr."),
    ],
    links: [
      { label: "Nexus AI source", href: "https://github.com/Dleteo/Nexus-AI", external: true },
      { label: "Task Tracker", href: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript", external: true },
      { label: "Hangman Game", href: "https://github.com/Dleteo/hangman-game", external: true },
      { label: "Text Encoder", href: "https://github.com/Dleteo/Encriptor", external: true },
      { label: "Portfolio case study", href: "/portfolio#work" },
    ],
  },
  {
    id: "assistance", number: "05", rect: { left: "72.1%", top: "26.6%", width: "22%", height: "24.6%" },
    title: localized("Habla con Nexus AI", "Talk to Nexus AI", "Converse com Nexus AI", "Parlez à Nexus AI"),
    intro: localized("Usa la burbuja del guía para explorar el portafolio. Para preguntas generales de software, hardware, programación y aprendizaje, inicia sesión y abre el asistente real.", "Use the guide bubble to explore the portfolio. For general software, hardware, coding and learning questions, sign in and open the real assistant.", "Use a bolha para explorar o portfólio. Para perguntas gerais, entre no assistente após iniciar sessão.", "Utilisez la bulle pour le portfolio. Pour des questions générales, connectez-vous à l'assistant."),
    details: [
      localized("Guía pública: respuestas documentadas sobre este portafolio, sin llamar al proveedor de IA.", "Public guide: documented answers about this portfolio without provider API calls.", "Guia público: respostas locais verificáveis, sem chamadas à IA.", "Guide public : réponses locales vérifiées, sans API d'IA."),
      localized("El asistente completo usa una API externa; Nexus Foundation sigue siendo investigación experimental.", "The full assistant uses an external API; Nexus Foundation is still experimental research.", "O assistente usa uma API externa; Foundation segue experimental.", "L'assistant utilise une API externe ; Foundation reste expérimental."),
    ],
    links: [{ label: "Open assistant / Sign in", href: "/assistant" }, { label: "Create account", href: "/register" }],
  },
  {
    id: "future", number: "06", rect: { left: "70.1%", top: "62%", width: "24.1%", height: "21%" },
    title: localized("Nexus Foundation Lab", "Nexus Foundation Lab", "Nexus Foundation Lab", "Nexus Foundation Lab"),
    intro: localized("Investigación experimental sobre un modelo Transformer causal original: PyTorch, tokenización BPE, benchmarks y evaluación. No está listo para conversar de forma fiable.", "Experimental research on an original causal Transformer: PyTorch, BPE tokenization, benchmarks and evaluation. It cannot yet converse reliably.", "Pesquisa experimental de um Transformer causal original com PyTorch e BPE; ainda não conversa de forma confiável.", "Recherche expérimentale d'un Transformer causal original avec PyTorch et BPE ; pas encore fiable en conversation."),
    details: [
      localized("Los pesos originales y los datos de entrenamiento permanecen privados.", "Original model weights and training data remain private.", "Pesos e dados de treino continuam privados.", "Poids et données d'entraînement restent privés."),
      localized("Resultados y limitaciones deben documentarse antes de afirmar inteligencia general.", "Results and limits must be documented before claiming general intelligence.", "Os resultados e limites precisam ser documentados.", "Les résultats et limites doivent être documentés."),
    ],
    links: [{ label: "Research context", href: "/portfolio#experience" }],
  },
];

const ui = {
  es: { tag: "NEXUS / CENTRO DE COMANDO", title: "Una interfaz. Infinitas posibilidades.", description: "Selecciona un holograma para explorar proyectos y conocimientos; Nexus te explicará cada sección por voz.", guide: "Hablar con Nexus", voice: "Escuchar al asistente", status: "ESCENA INTERACTIVA · VERSIÓN 0.2", close: "Cerrar", ask: "Preguntar sobre esto", back: "Volver a explorar", caption: "Escena original intacta. Hologramas y narración reales; el avatar articulado 3D con labios/manos es una fase posterior.", nav: "Selecciona un panel", enter: "Entrar", speak: "Nexus está hablando", idle: "Nexus está listo" },
  en: { tag: "NEXUS / COMMAND CENTER", title: "One interface. Endless possibilities.", description: "Choose a hologram to discover projects and skills. Nexus will narrate each area.", guide: "Talk to Nexus", voice: "Hear the assistant", status: "INTERACTIVE SCENE · VERSION 0.2", close: "Close", ask: "Ask about this", back: "Explore more", caption: "Original scene preserved. Live panels and voice; a rigged 3D avatar with synced lips and hands remains a later milestone.", nav: "Choose a panel", enter: "Explore", speak: "Nexus is speaking", idle: "Nexus is ready" },
  pt: { tag: "NEXUS / CENTRAL DE COMANDO", title: "Uma interface. Infinitas possibilidades.", description: "Selecione um holograma. O Nexus explica cada área em voz alta.", guide: "Falar com Nexus", voice: "Ouvir o assistente", status: "CENA INTERATIVA · VERSÃO 0.2", close: "Fechar", ask: "Perguntar sobre isto", back: "Explorar", caption: "Imagem original intacta. Avatar 3D articulado será uma fase posterior.", nav: "Escolha um painel", enter: "Abrir", speak: "Nexus está falando", idle: "Nexus está pronto" },
  fr: { tag: "NEXUS / CENTRE DE COMMANDE", title: "Une interface. Des possibilités infinies.", description: "Sélectionnez un hologramme. Nexus vous présente chaque domaine à voix haute.", guide: "Parler à Nexus", voice: "Écouter l'assistant", status: "SCÈNE INTERACTIVE · VERSION 0.2", close: "Fermer", ask: "Question sur ce sujet", back: "Explorer", caption: "Scène originale intacte. Avatar 3D articulé prévu dans une étape ultérieure.", nav: "Choisissez un panneau", enter: "Ouvrir", speak: "Nexus parle", idle: "Nexus est prêt" },
};

function notifyGuide(language: Language, prompt: string, open = false) {
  window.dispatchEvent(new CustomEvent("nexus:guide", { detail: { language, prompt, open } }));
}

export default function CommandCenter() {
  const lang = useGuideLanguage();
  const [selected, setSelected] = useState<Zone | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const active = zones.find((zone) => zone.id === selected);
  const t = ui[lang];

  useEffect(() => {
    const started = () => setSpeaking(true);
    const ended = () => setSpeaking(false);
    window.addEventListener("nexus:speech-start", started);
    window.addEventListener("nexus:speech-end", ended);
    return () => { window.removeEventListener("nexus:speech-start", started); window.removeEventListener("nexus:speech-end", ended); };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const focusedBefore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const drawer = document.getElementById("ncc-drawer");
    drawer?.querySelector<HTMLButtonElement>("button")?.focus();
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setSelected(null); return; }
      if (event.key !== "Tab" || !drawer) return;
      const controls = Array.from(drawer.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],select,input'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeydown);
    return () => { document.removeEventListener("keydown", onKeydown); document.body.style.overflow = priorOverflow; focusedBefore?.focus(); };
  }, [selected]);

  function chooseLanguage(next: Language) {
    setGuideLanguage(next);
  }

  function openZone(zone: Hologram) {
    setSelected(zone.id);
    notifyGuide(lang, zone.intro[lang]);
  }

  return (
    <main className="ncc-root" lang={lang}>
      <div className="ncc-shell">
        <header className="ncc-topbar">
          <Link href="/" className="ncc-brand" aria-label="Nexus AI homepage"><span aria-hidden="true">◈</span> NEXUS <b>AI</b></Link>
          <div className="ncc-status"><i aria-hidden="true" />{t.status}</div>
          <div className="ncc-controls">
            <label htmlFor="ncc-language" className="ncc-sr">Language</label>
            <select id="ncc-language" aria-label="Language" value={lang} onChange={(event: ChangeEvent<HTMLSelectElement>) => chooseLanguage(event.target.value as Language)}>
              {(Object.keys(languages) as Language[]).map((code) => <option value={code} key={code}>{languages[code]}</option>)}
            </select>
            <button type="button" className="ncc-ghost" onClick={() => notifyGuide(lang, localized("Bienvenido al centro de comando. Selecciona uno de los hologramas para descubrir los proyectos, la experiencia y los conocimientos de Joshua.", "Welcome to the command center. Choose a hologram to explore Joshua's projects and experience.", "Bem-vindo ao centro de comando. Selecione um holograma para explorar os projetos.", "Bienvenue au centre de commande. Choisissez un hologramme pour explorer les projets.")[lang])}>{t.voice}</button>
          </div>
        </header>

        <section className="ncc-intro">
          <div className="ncc-kicker">{t.tag}</div>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </section>

        <div className="ncc-stage-shell">
          <section className={`ncc-stage ${speaking ? "ncc-is-speaking" : ""} ncc-motion`} aria-label={t.nav}>
            <div className="ncc-scene-art" aria-hidden="true" />
            <div className="ncc-scan" aria-hidden="true" />
            <div className="ncc-voice-ring" aria-hidden="true" />
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                className={`ncc-hotspot ${zone.id === selected ? "ncc-active" : ""}`}
                style={zone.rect}
                aria-label={`${zone.number} ${zone.title[lang]}`}
                aria-pressed={zone.id === selected}
                onClick={() => openZone(zone)}
              ><span>{zone.number} · {zone.title[lang]}</span></button>
            ))}
            <button className="ncc-avatar-target" type="button" aria-label={t.voice} onClick={() => notifyGuide(lang, localized("Hola. Soy Nexus, el guía del portafolio. Pulsa cualquier holograma y te contaré qué contiene.", "Hello. I'm Nexus, your portfolio guide. Choose any hologram and I will describe it.", "Olá. Sou Nexus. Escolha um holograma para descobrir mais.", "Bonjour. Je suis Nexus. Choisissez un hologramme.")[lang])} />
            <div className="ncc-corner ncc-tl" aria-hidden="true" /><div className="ncc-corner ncc-tr" aria-hidden="true" /><div className="ncc-corner ncc-bl" aria-hidden="true" /><div className="ncc-corner ncc-br" aria-hidden="true" />
          </section>
          <div className="ncc-bottom"><span>{t.nav}</span><span aria-live="polite">◉ {speaking ? t.speak : t.idle}</span></div>
        </div>

        <nav aria-label={t.nav} className="ncc-mobile-zones">
          {zones.map((zone) => <button type="button" key={zone.id} onClick={() => openZone(zone)}>{zone.number} / {zone.title[lang]} <span aria-hidden="true">↗</span></button>)}
        </nav>
        <p className="ncc-note">{t.caption}</p>
        <footer className="ncc-footer"><span>© NEXUS AI · ORIGINAL COMMAND CENTER</span><Link href="/portfolio">{t.enter} / PORTFOLIO ↗</Link><Link href="/assistant">AI ASSISTANT ↗</Link></footer>
      </div>
      {active && (
        <>
          <button className="ncc-backdrop" type="button" aria-label={t.close} onClick={() => setSelected(null)} />
          <aside id="ncc-drawer" className="ncc-drawer" role="dialog" aria-modal="true" aria-labelledby="ncc-drawer-heading" >
            <header className="ncc-drawer-head"><span>NEXUS / {active.number}</span><button type="button" aria-label={t.close} onClick={() => setSelected(null)}>✕</button></header>
            <div className="ncc-drawer-scroll">
              <div className="ncc-symbol">◈</div>
              <p className="ncc-kicker">HOLOGRAPHIC / {active.id.toUpperCase()}</p>
              <h2 id="ncc-drawer-heading">{active.title[lang]}</h2>
              <p className="ncc-summary">{active.intro[lang]}</p>
              <ul>{active.details.map((detail, index) => <li key={index}>{detail[lang]}</li>)}</ul>
              <div className="ncc-actions">{active.links.map((link) => link.external
                ? <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>
                : <Link key={link.href} href={link.href}>{link.label} ↗</Link>)}
              </div>
            </div>
            <footer className="ncc-drawer-footer">
              <button type="button" onClick={() => notifyGuide(lang, active.intro[lang])}>{t.voice}</button>
              <button type="button" onClick={() => { notifyGuide(lang, active.intro[lang], true); setSelected(null); }}>{t.ask}</button>
            </footer>
          </aside>
        </>
      )}
    </main>
  );
}
