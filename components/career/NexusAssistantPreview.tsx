import Link from "next/link";
import "./nexus-assistant-preview.css";
import type {SiteLanguage} from "../../data/site-languages";

const content = {
  es:{
    preview:"VISTA DE LA INTERFAZ",portal:"DOS ESPACIOS, UNA EXPERIENCIA",title:"Tu espacio para crear y resolver.",
    intro:"Organiza ideas, examina proyectos y prepara el siguiente paso de tu desarrollo.",
    portfolio:"NEXUS PORTFOLIO",portfolioDesc:"Proyectos · CV · Preparación",technical:"NEXUS TECHNICAL",technicalDesc:"Código · Arquitectura · Resolución",
    prompt:"¿En qué trabajamos hoy?",card1:"Revisar mi CV",card2:"Analizar un proyecto",card3:"Preparar entrevista",
    note:"Vista de diseño. El asistente real requiere iniciar sesión.",open:"Abrir asistente",
  },
  en:{
    preview:"INTERFACE PREVIEW",portal:"TWO WORKSPACES, ONE EXPERIENCE",title:"Your space to build and solve.",
    intro:"Organize ideas, review projects and plan your next engineering step.",
    portfolio:"NEXUS PORTFOLIO",portfolioDesc:"Projects · CV · Preparation",technical:"NEXUS TECHNICAL",technicalDesc:"Code · Architecture · Problem-solving",
    prompt:"What shall we work on today?",card1:"Review my CV",card2:"Analyze a project",card3:"Prepare for interviews",
    note:"Design preview. The real assistant requires sign-in.",open:"Open assistant",
  },
  de:{
    preview:"OBERFLÄCHENVORSCHAU",portal:"ZWEI ARBEITSBEREICHE, EIN ERLEBNIS",title:"Raum für Ideen und Lösungen.",
    intro:"Ideen ordnen, Projekte prüfen und den nächsten Entwicklungsschritt planen.",
    portfolio:"NEXUS PORTFOLIO",portfolioDesc:"Projekte · Lebenslauf · Vorbereitung",technical:"NEXUS TECHNICAL",technicalDesc:"Code · Architektur · Lösungen",
    prompt:"Woran arbeiten wir heute?",card1:"Lebenslauf prüfen",card2:"Projekt analysieren",card3:"Interview üben",
    note:"Designvorschau. Der Assistent erfordert eine Anmeldung.",open:"Assistent öffnen",
  },
  fr:{
    preview:"APERÇU DE L’INTERFACE",portal:"DEUX ESPACES, UNE EXPÉRIENCE",title:"L’espace pour créer et résoudre.",
    intro:"Organiser ses idées, examiner des projets et planifier la suite.",
    portfolio:"NEXUS PORTFOLIO",portfolioDesc:"Projets · CV · Préparation",technical:"NEXUS TECHNICAL",technicalDesc:"Code · Architecture · Résolution",
    prompt:"Sur quoi travaillons-nous ?",card1:"Revoir mon CV",card2:"Analyser un projet",card3:"Préparer un entretien",
    note:"Aperçu du design. La connexion est requise.",open:"Ouvrir l’assistant",
  },
  pt:{
    preview:"PRÉVIA DA INTERFACE",portal:"DOIS ESPAÇOS, UMA EXPERIÊNCIA",title:"Seu espaço para criar e resolver.",
    intro:"Organize ideias, examine projetos e planeje o próximo passo.",
    portfolio:"NEXUS PORTFOLIO",portfolioDesc:"Projetos · Currículo · Preparação",technical:"NEXUS TECHNICAL",technicalDesc:"Código · Arquitetura · Soluções",
    prompt:"No que vamos trabalhar hoje?",card1:"Revisar meu currículo",card2:"Analisar um projeto",card3:"Preparar entrevista",
    note:"Prévia do design. O assistente requer login.",open:"Abrir assistente",
  },
} as const;

/**
 * Deliberately a static architectural preview — no simulated replies, fabricated
 * AI activity or misleading live statuses. The real application opens via /assistant.
 */
export default function NexusAssistantPreview({language}:{language:SiteLanguage}){
  const t=content[language];
  return <div className="nexus-showcase-window" aria-label={t.preview}>
    <div className="nexus-showcase-topbar">
      <div className="nexus-showcase-window-controls" aria-hidden="true"><i/><i/><i/></div>
      <span>NEXUS AI <b>/</b> WORKSPACE</span>
      <span className="nexus-showcase-version">INTERFACE / 01</span>
    </div>
    <div className="nexus-showcase-layout">
      <aside className="nexus-showcase-sidebar">
        <div className="nexus-showcase-brand"><span className="nexus-showcase-monogram" aria-hidden="true">N</span><span>NEXUS <b>AI</b><small>INTELLIGENCE WORKSPACE</small></span></div>
        <p className="nexus-showcase-menu-label">{t.portal}</p>
        <div className="nexus-showcase-workspace nexus-showcase-workspace-selected"><span aria-hidden="true">◈</span><div><b>{t.portfolio}</b><small>{t.portfolioDesc}</small></div></div>
        <div className="nexus-showcase-workspace"><span aria-hidden="true">⌘</span><div><b>{t.technical}</b><small>{t.technicalDesc}</small></div></div>
        <div className="nexus-showcase-sidebar-bottom"><span aria-hidden="true">✦</span> NEXUS / SYSTEM DESIGN</div>
      </aside>
      <div className="nexus-showcase-canvas">
        <div className="nexus-showcase-canvas-top"><span className="nexus-showcase-pulse" aria-hidden="true"/> {t.preview}<span className="nexus-showcase-glyph" aria-hidden="true">✧</span></div>
        <div className="nexus-showcase-center">
          <div className="nexus-showcase-orbit" aria-hidden="true"><i/><i/><span>✧</span></div>
          <span className="nexus-showcase-overline">NEXUS / ASSISTANT WORKSPACE</span>
          <h2>{t.prompt}</h2>
          <p>{t.intro}</p>
          <div className="nexus-showcase-suggestions"><span>{t.card1} <i>↗</i></span><span>{t.card2} <i>↗</i></span><span>{t.card3} <i>↗</i></span></div>
        </div>
        <div className="nexus-showcase-compose">
          <span>{t.title}</span><span aria-hidden="true">↗</span>
        </div>
      </div>
    </div>
    <div className="nexus-showcase-footer"><span>{t.note}</span><Link href="/assistant">{t.open} <span aria-hidden="true">↗</span></Link></div>
  </div>;
}
