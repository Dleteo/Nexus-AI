"use client";

import Link from "next/link";
import NexusAvatar3D from "./NexusAvatar3D";
import NexusAIChat from "./NexusAIChat";
import NexusNewsBoard from "./NexusNewsBoard";
import { useEffect, useState } from "react";
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
  action?: "chat" | "news";
  mode?: "assistant" | "explain" | "debug" | "interview" | "plan";
};

const languages: Record<Language, string> = { es: "Español", en: "English", pt: "Português", fr: "Français" };
const localized = (es: string, en: string, pt: string, fr: string): Localized => ({ es, en, pt, fr });

const zones: Hologram[] = [
  {
    id: "cognition", number: "01", rect: { left:"5.8%",top:"2.4%",width:"21.2%",height:"22%" },
    title: localized("Mi creador Josh","My creator Josh","Meu criador Josh","Mon créateur Josh"),
    intro: localized("Mi creador, Josh, es un desarrollador web junior en formación. Su nombre completo es Joshua Vallejo Sanchez. Aquí puedes explorar su CV, conocimientos, certificados y vías profesionales de contacto.","My creator, Josh, is an aspiring Junior Web Developer. His full name is Joshua Vallejo Sanchez. Explore his CV, skills, training and professional contact links.","Meu criador, Josh, está se formando como desenvolvedor web júnior. Nome completo: Joshua Vallejo Sanchez.","Mon créateur, Josh, se forme au développement web. Nom complet : Joshua Vallejo Sanchez."),
    details: [
      localized("Nombre completo escrito: Joshua Vallejo Sanchez. Presentación hablada: «mi creador, Josh».","Full written name: Joshua Vallejo Sanchez. Spoken introduction: «my creator, Josh».","Nome completo: Joshua Vallejo Sanchez.","Nom complet : Joshua Vallejo Sanchez."),
      localized("HTML, CSS, JavaScript, DOM, Flexbox, Grid y Bootstrap; integración de Next.js, TypeScript, Supabase e IA con asistencia técnica.","HTML, CSS, JavaScript, DOM, Flexbox, Grid, Bootstrap; assisted integration of Next.js, TypeScript, Supabase and AI.","HTML, CSS, JavaScript e ferramentas modernas integradas com assistência de IA.","HTML, CSS, JavaScript et outils modernes intégrés avec assistance IA."),
      localized("Idiomas: español e inglés. Certificados y CV disponibles sin cuenta ni suscripción.","Languages: Spanish and English. Certificates and CV available without signup or payment.","Idiomas: espanhol e inglês. Certificados públicos.","Langues : espagnol et anglais. Certifications publiques."),
    ],
    links: [{label:"Portfolio / Skills / Certificates",href:"/portfolio"},{label:"CV / Résumé",href:"/resume"},{label:"GitHub",href:"https://github.com/Dleteo",external:true}],
  },
  {
    id:"knowledge",number:"02",rect:{left:"3.8%",top:"25.3%",width:"19.8%",height:"25%"},
    title:localized("Estudia con Nexus","Learn with Nexus","Aprenda com Nexus","Apprendre avec Nexus"),
    intro:localized("Aprende programación, software y hardware paso a paso con Nexus AI. Crea una cuenta gratuita para guardar tus conversaciones.","Study programming, software and hardware with Nexus AI. Register for free to save conversations.","Aprenda programação e tecnologia com Nexus AI.","Apprenez la programmation et la technologie avec Nexus AI."),
    details:[localized("Explicaciones, ejemplos, ejercicios y corrección de código mediante el asistente autenticado.","Explanations, exercises and code feedback through the signed-in assistant.","Explicações, exercícios e feedback.","Explications, exercices et corrections."),localized("El acceso gratuito tiene un límite diario aplicado por el servidor.","Free access has a server-enforced daily quota.","Acesso gratuito com limite diário.","Accès gratuit avec quota quotidien.")],
    links:[{label:"Create free account",href:"/register"},{label:"Learning workspace",href:"/assistant"}],action:"chat",mode:"explain",
  },
  {
    id:"experience",number:"03",rect:{left:"5.1%",top:"61.7%",width:"24.8%",height:"22.8%"},
    title:localized("Entrevistas y mejora de proyectos","Interview & project coach","Entrevistas e projetos","Entretiens et projets"),
    intro:localized("Prepárate para entrevistas de programación, revisa la calidad de tus proyectos y descubre cómo mejorar tu portafolio.","Practice software interviews and get guidance for improving projects and portfolios.","Prepare entrevistas e melhore seus projetos.","Préparez les entretiens et améliorez vos projets."),
    details:[localized("Nexus evalúa tus respuestas de entrevista y propone pasos de mejora sin garantizar empleo.","Nexus provides interview feedback and practical improvements without promising a job.","Feedback de entrevistas e sugestões.","Retours d'entretiens et conseils concrets.")],
    links:[{label:"Start free",href:"/register"},{label:"Open interview assistant",href:"/assistant"}],action:"chat",mode:"interview",
  },
  {
    id:"creative",number:"04",rect:{left:"72%",top:"3.8%",width:"22.5%",height:"20%"},
    title:localized("Proyectos y redes","Projects & socials","Projetos e redes","Projets et réseaux"),
    intro:localized("Explora Nexus AI, los mejores proyectos reales de mi creador Josh y sus perfiles profesionales verificados.","Explore Nexus AI, the real projects built by my creator Josh, and verified professional links.","Explore Nexus AI e os projetos de Josh.","Explorez Nexus AI et les projets de Josh."),
    details:[localized("Nexus AI: autenticación, gestión de proyectos, asistente técnico y pruebas automatizadas.","Nexus AI: authentication, project workspace, AI and automated QA.","Nexus AI com autenticação e testes.","Nexus AI avec authentification et tests."),localized("También: Task Tracker, Hangman Game y Text Encoder. Instagram y LinkedIn se añadirán cuando se confirmen los enlaces.","Also: Task Tracker, Hangman Game and Text Encoder. LinkedIn/Instagram links are added only after verification.","Outros projetos com código real no GitHub.","Autres projets avec code sur GitHub.")],
    links:[{label:"Nexus AI code",href:"https://github.com/Dleteo/Nexus-AI",external:true},{label:"All GitHub projects",href:"https://github.com/Dleteo",external:true},{label:"Featured work",href:"/portfolio#work"}],
  },
  {
    id:"assistance",number:"05",rect:{left:"72.1%",top:"26.6%",width:"22%",height:"24.6%"},
    title:localized("Habla con Nexus AI","Talk to Nexus AI","Converse com Nexus AI","Parler à Nexus AI"),
    intro:localized("¿Qué quieres hacer? Escribe o utiliza tu micrófono en la guía. Abre el asistente para solucionar problemas de software, hardware y programación sin abandonar el centro de comando.","What would you like to do? Type or use your microphone in the guide. Open the assistant to solve software, hardware and coding problems without leaving the command center.","Pergunte ao Nexus sobre seus problemas técnicos.","Demandez l'aide de Nexus pour vos problèmes techniques."),
    details:[localized("El chat general necesita iniciar sesión: sus respuestas se procesan en el servidor con cuotas y protección de claves.","General AI chat requires sign-in and uses server-side quotas and protected credentials.","O chat usa autenticação e limites.","Le chat utilise une authentification et des limites.")],
    links:[{label:"Sign up free",href:"/register"},{label:"Full workspace",href:"/assistant"}],action:"chat",mode:"assistant",
  },
  {
    id:"future",number:"06",rect:{left:"70.1%",top:"62%",width:"24.1%",height:"21%"},
    title:localized("Noticias y tecnología","Technology newsroom","Notícias e tecnologia","Actualités tech"),
    intro:localized("Descubre novedades reales de programación, herramientas y desarrollo. Consulta titulares con enlaces a sus fuentes originales.","Discover real software and developer news with links to the original sources.","Descubra notícias com fontes originais.","Découvrez l'actualité avec ses sources originales."),
    details:[localized("Los titulares proceden de fuentes externas verificables, no son noticias inventadas. La búsqueda libre en vivo será una herramienta posterior.","Headlines come from verifiable public feeds; unlimited live web searching is not yet connected.","Fontes públicas verificáveis.","Sources publiques vérifiables.")],
    links:[{label:"Open Nexus AI",href:"/assistant"}],action:"news",
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
  const [showAvatar3D, setShowAvatar3D] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [languageGate, setLanguageGate] = useState(false);
  const [listeningLanguage, setListeningLanguage] = useState(false);
  const [languageMessage, setLanguageMessage] = useState("");
  const active = zones.find((zone) => zone.id === selected);
  const t = ui[lang];

  useEffect(() => {
    if (!window.localStorage.getItem("nexus-language-welcome-seen")) {
      const id = window.requestAnimationFrame(() => setLanguageGate(true));
      return () => window.cancelAnimationFrame(id);
    }
  }, []);

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
    window.localStorage.setItem("nexus-language-welcome-seen", "yes");
    setLanguageGate(false);
    setLanguageMessage("");
    notifyGuide(next, localized("Bienvenido a Nexus AI, el centro creado por Josh. ¿En qué puedo ayudarte?", "Welcome to Nexus AI, built by my creator Josh. How can I help?", "Bem-vindo ao Nexus AI, criado por Josh. Como posso ajudar?", "Bienvenue sur Nexus AI, créé par Josh. Comment vous aider ?")[next]);
  }
  function hearLanguage() {
    type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
    type Recognition = { lang: string; start(): void; onresult: ((e: RecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
    const browser = window as Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Speech = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Speech) { setLanguageMessage("Microphone unavailable. Select a language."); return; }
    const rec = new Speech();
    rec.lang = "en-US";
    rec.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript?.toLowerCase() ?? "";
      if (/espa[nñ]ol|spanish/.test(heard)) chooseLanguage("es");
      else if (/english|ingl[eé]s/.test(heard)) chooseLanguage("en");
      else if (/portugu[eê]s|portuguese/.test(heard)) chooseLanguage("pt");
      else if (/fran[cç]ais|french/.test(heard)) chooseLanguage("fr");
      else setLanguageMessage("Say Spanish, English, Portuguese or French.");
    };
    rec.onerror = () => { setListeningLanguage(false); setLanguageMessage("Microphone unavailable. Select a language."); };
    rec.onend = () => setListeningLanguage(false);
    try { rec.start(); setListeningLanguage(true); } catch { setListeningLanguage(false); }
  }

  function openZone(zone: Hologram) {
    setSelected(zone.id);
    notifyGuide(lang, zone.intro[lang]);
  }
  function openChat(mode: NonNullable<Hologram["mode"]>) {
    setSelected(null);
    window.dispatchEvent(new CustomEvent("nexus:assistant-open",{detail:{mode}}));
  }

  return (
    <main className="ncc-root" lang={lang}>
      <div className="ncc-shell">
        <nav className="ncc-hud-bar" aria-label="Nexus command controls">
          <Link href="/" className="ncc-hud-brand" aria-label="Nexus AI homepage">◈ NEXUS AI</Link>
          <div className="ncc-hud-actions">
            <button type="button" onClick={() => setLanguageGate(true)}>◎ {lang.toUpperCase()}</button>
            <button type="button" onClick={() => notifyGuide(lang, localized("Hola, soy Nexus. ¿Qué te gustaría explorar?","Hello, I'm Nexus. What would you like to explore?","Olá, sou Nexus.","Bonjour, je suis Nexus.")[lang], true)}>◉ {t.guide}</button>
            <Link href="/register">✧ {lang === "es" ? "Cuenta gratis" : "Free account"}</Link>
          </div>
        </nav>
        <div className="ncc-stage-shell">
          <section className={`ncc-stage ${speaking ? "ncc-is-speaking" : ""} ncc-motion`} aria-label={t.nav}>
                        <div className="ncc-next-scene" aria-hidden="true"><div className="ncc-orbital-halo" /><div className="ncc-floor-grid" /><div className="ncc-arc ncc-arc-a" /><div className="ncc-arc ncc-arc-b" /></div>
            <div className="ncc-main-avatar"><NexusAvatar3D speaking={speaking} gesture={selected ?? "idle"} label={lang === "es" ? "Avatar tridimensional de Nexus" : "Nexus three dimensional avatar"} /><div className="ncc-main-avatar-caption">NEXUS // AI CORE <span aria-live="polite">{speaking ? "● ONLINE VOICE" : "● STANDBY"}</span></div></div>
            <div className="ncc-scan" aria-hidden="true" />
            <div className="ncc-holographic-pulse" aria-hidden="true" />
            <div className="ncc-portrait-glow" aria-hidden="true" />
            <div className="ncc-voice-ring" aria-hidden="true" />
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                className={`ncc-hotspot ncc-node-${zone.id} ${zone.id === selected ? "ncc-active" : ""}`}
                style={{ left: zone.id === "cognition" ? "28%" : zone.id === "knowledge" ? "24.5%" : zone.id === "experience" ? "30%" : zone.id === "creative" ? "70%" : zone.id === "assistance" ? "70%" : "69%", top: zone.id === "cognition" || zone.id === "creative" ? "14%" : zone.id === "knowledge" || zone.id === "assistance" ? "39%" : "73%" }}
                aria-label={`${zone.number} ${zone.title[lang]}`}
                aria-pressed={zone.id === selected}
                onClick={() => openZone(zone)}
              ><b aria-hidden="true">{zone.number}</b><span>{zone.title[lang]}</span></button>
            ))}
            <button className="ncc-avatar-target" type="button" aria-label={t.voice} onClick={() => notifyGuide(lang, localized("Hola. Soy Nexus, el guía del portafolio. Pulsa cualquier holograma y te contaré qué contiene.", "Hello. I'm Nexus, your portfolio guide. Choose any hologram and I will describe it.", "Olá. Sou Nexus. Escolha um holograma para descobrir mais.", "Bonjour. Je suis Nexus. Choisissez un hologramme.")[lang])} />
            <div className="ncc-stage-arrows" aria-hidden="true"><span>❮</span><span>❯</span></div>
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
      {languageGate && <div className="ncc-language-overlay">
        <div className="ncc-language-card" role="dialog" aria-modal="true" aria-labelledby="ncc-language-title">
          <div className="ncc-language-orbit" aria-hidden="true">◉</div>
          <p className="ncc-language-eyebrow">NEXUS AI / INITIALIZING CONNECTION</p>
          <h2 id="ncc-language-title">CHOOSE YOUR LANGUAGE</h2>
          <p>Selecciona tu idioma / Choose your language</p>
          <div className="ncc-language-options">
            {(Object.keys(languages) as Language[]).map(code => <button type="button" key={code} onClick={() => chooseLanguage(code)}>{languages[code]} <span aria-hidden="true">↗</span></button>)}
          </div>
          <button type="button" className="ncc-language-microphone" onClick={hearLanguage}>🎙 {listeningLanguage ? "Listening..." : "Say your language / Di tu idioma"}</button>
          {languageMessage && <p role="status">{languageMessage}</p>}
        </div>
      </div>}
      <NexusAIChat />
      {newsOpen && <div className="ncc-news-overlay"><button type="button" className="ncc-backdrop" aria-label={t.close} onClick={()=>setNewsOpen(false)} /><div className="ncc-news-dialog" role="dialog" aria-modal="true" aria-label="Nexus Newsroom"><button type="button" className="ncc-news-close" aria-label={t.close} onClick={()=>setNewsOpen(false)}>✕</button><NexusNewsBoard /></div></div>}
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
              {active.action && <div className="ncc-feature-actions">{active.action === "chat" ? <button type="button" onClick={() => openChat(active.mode ?? "assistant")}>{lang === "es" ? "Abrir chat con Nexus AI" : "Open Nexus AI chat"} ↗</button> : <button type="button" onClick={() => { setSelected(null); setNewsOpen(true); }}>{lang === "es" ? "Ver noticias con fuentes" : "See verified news"} ↗</button>}</div>}
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
