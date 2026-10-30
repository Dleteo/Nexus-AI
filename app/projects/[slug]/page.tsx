import type { Metadata } from "next";
import InterviewReviewChecklist from "../../../components/career/InterviewReviewChecklist";
import ArchitectureChallenge from "../../../components/career/ArchitectureChallenge";
import ProjectCover, { type ProjectKind } from "../../../components/career/ProjectCover";
import NexusAssistantPreview from "../../../components/career/NexusAssistantPreview";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "../../../data/case-studies";
import { translatedCaseStudy,caseLabels } from "../../../data/localized-case-studies";
import { isSiteLanguage,siteLanguages,type SiteLanguage,portfolioPath,cvPath } from "../../../data/site-languages";
import s from "./project.module.css";

const projectKinds: Record<string,ProjectKind> = {
  "nexus-ai":"workspace", "nexus-commerce":"commerce", "nexus-studio":"studio",
  "nexus-monitor":"monitor", "nexus-factory":"factory", "nexus-software-factory":"factory",
};
const pageCopy = {
  es:{language:"Idioma del proyecto",breadcrumb:"Ruta de navegación",learning:"PROYECTO DE APRENDIZAJE",study:"CASO DE ESTUDIO",cv:"VER CV",skip:"Ir al caso de estudio",back:"Volver a los proyectos",sketch:"Esquema de interfaz · abre la demo para usar el proyecto",demo:"Explorar este proyecto"},
  en:{language:"Case study language",breadcrumb:"Breadcrumb",learning:"LEARNING PROJECT",study:"CASE STUDY",cv:"VIEW CV",skip:"Skip to case study",back:"Back to projects",sketch:"Interface sketch · open the demo to use the project",demo:"Explore this project"},
  de:{language:"Sprache der Fallstudie",breadcrumb:"Brotkrumennavigation",learning:"LERNPROJEKT",study:"FALLSTUDIE",cv:"LEBENSLAUF",skip:"Zur Fallstudie",back:"Zurück zu den Projekten",sketch:"Oberflächenskizze · Projekt über die Demo öffnen",demo:"Dieses Projekt erkunden"},
  fr:{language:"Langue de l’étude de cas",breadcrumb:"Fil d’Ariane",learning:"PROJET D’APPRENTISSAGE",study:"ÉTUDE DE CAS",cv:"VOIR CV",skip:"Aller à l’étude de cas",back:"Retour aux projets",sketch:"Esquisse d’interface · ouvrez la démo pour utiliser le projet",demo:"Explorer ce projet"},
  pt:{language:"Idioma do estudo de caso",breadcrumb:"Navegação estrutural",learning:"PROJETO DE APRENDIZAGEM",study:"ESTUDO DE CASO",cv:"VER CV",skip:"Ir ao estudo de caso",back:"Voltar aos projetos",sketch:"Esboço de interface · abra a demo para usar o projeto",demo:"Explorar este projeto"},
} as const;

const nexusPresentation = {
  es:{edition:"EDICIÓN / OBSIDIANA",idea:"DISEÑADO PARA EXPLORAR",intro:"Una arquitectura, dos espacios de asistencia y una idea: convertir curiosidad técnica en trabajo demostrable.",a:"DOS ESPACIOS",at:"Portfolio y Technical con responsabilidades distintas.",b:"SEGURIDAD COMO BASE",bt:"Sesiones protegidas y acceso a datos separado por usuario.",c:"INGENIERÍA VERIFICABLE",ct:"Código, pruebas y límites documentados."},
  en:{edition:"OBSIDIAN / EDITION",idea:"BUILT FOR EXPLORATION",intro:"One architecture, two assistance workspaces and one goal: turn technical curiosity into demonstrable work.",a:"TWO WORKSPACES",at:"Portfolio and Technical with separate responsibilities.",b:"SECURITY BY DESIGN",bt:"Protected sessions and user-scoped data access.",c:"VERIFIABLE ENGINEERING",ct:"Documented code, tests and limitations."},
  de:{edition:"OBSIDIAN / EDITION",idea:"ZUM ENTDECKEN ENTWICKELT",intro:"Eine Architektur, zwei Assistenzbereiche und das Ziel, technische Ideen nachvollziehbar umzusetzen.",a:"ZWEI BEREICHE",at:"Portfolio und Technical mit getrennten Aufgaben.",b:"SICHERHEIT VON ANFANG AN",bt:"Geschützte Sitzungen und nutzergebundene Daten.",c:"ÜBERPRÜFBARE TECHNIK",ct:"Dokumentierter Code, Tests und Grenzen."},
  fr:{edition:"ÉDITION / OBSIDIENNE",idea:"CONÇU POUR EXPLORER",intro:"Une architecture et deux espaces d'assistance pour transformer la curiosité technique en travail vérifiable.",a:"DEUX ESPACES",at:"Portfolio et Technical avec des rôles distincts.",b:"SÉCURITÉ INTÉGRÉE",bt:"Sessions protégées et données séparées par utilisateur.",c:"INGÉNIERIE VÉRIFIABLE",ct:"Code, tests et limites documentés."},
  pt:{edition:"EDIÇÃO / OBSIDIANA",idea:"FEITO PARA EXPLORAR",intro:"Uma arquitetura, dois espaços de assistência e uma meta: transformar curiosidade técnica em trabalho verificável.",a:"DOIS ESPAÇOS",at:"Portfolio e Technical com funções distintas.",b:"SEGURANÇA DESDE A BASE",bt:"Sessões protegidas e dados isolados por usuário.",c:"ENGENHARIA VERIFICÁVEL",ct:"Código, testes e limites documentados."},
} as const;

export function generateStaticParams() { return caseStudies.map(({slug}) => ({slug})); }
export async function generateMetadata({params,searchParams}: {params: Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}): Promise<Metadata> {
  const {slug}=await params;
  const {lang}=await searchParams;
  const locale:SiteLanguage=lang&&isSiteLanguage(lang)?lang:"es";
  const base=getCaseStudy(slug);
  const project=base?translatedCaseStudy(base,locale):undefined;
  return {title:project?project.title+" | Nexus AI":"Proyecto no encontrado",description:project?.lead};
}

export default async function CaseStudyPage({params,searchParams}: {params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}) {
  const {slug}=await params;
  const {lang}=await searchParams;
  const locale:SiteLanguage=lang&&isSiteLanguage(lang)?lang:"es";
  const base=getCaseStudy(slug);
  if(!base)notFound();
  const project=translatedCaseStudy(base,locale);
  const label=caseLabels[locale];
  const copy=pageCopy[locale];
  const back=portfolioPath(locale);
  const kind=projectKinds[slug];
  const demo=project.demo?.startsWith("/labs")&&locale!=="es"?"/"+locale+project.demo:project.demo;
  const isLearning=["task-tracker","hangman","nexus-foundation"].includes(slug);
  const nexusEdition=slug==="nexus-ai";
  const nexusText=nexusPresentation[locale];

  return <main lang={locale} data-project-kind={kind||"legacy"} className={`${s.page} ${kind?s[kind]:s.legacy}`}>
    <a className={s.skip} href="#case-content">{copy.skip}</a>
    <header className={s.header}>
      <div className={s.headerInner}>
        <Link href={back} className={s.brand} aria-label="NEXUS AI"><span aria-hidden="true">N</span><span>NEXUS <b>AI</b></span></Link>
        <div className={s.headerLinks}><Link href={back+"#proyectos"}>← {label.back}</Link><Link href={cvPath(locale)} className={s.cv}>{copy.cv} →</Link></div>
      </div>
    </header>
    <div id="case-content" className={s.content} tabIndex={-1}>
      <div className={s.contextRow}>
        <nav aria-label={copy.breadcrumb} className={s.breadcrumb}><Link href={back}>{label.back}</Link><span aria-hidden="true">/</span><Link href={back+"#proyectos"}>{label.project}</Link><span aria-hidden="true">/</span><span>{project.title}</span></nav>
        <div className={s.languages} role="group" aria-label={copy.language}>{siteLanguages.map(item=><Link key={item.code} href={"/projects/"+slug+"?lang="+item.code} lang={item.code} aria-current={locale===item.code?"page":undefined}>{item.nativeName}</Link>)}</div>
      </div>
      <section className={s.hero} aria-labelledby="case-title">
        <div className={s.heroText}>
          {nexusEdition&&<p className={s.nexusEdition}><span aria-hidden="true">✧</span> {nexusText.edition} <span aria-hidden="true">—</span> NEXUS / 01</p>}
          <p className={s.eyebrow}>{isLearning?copy.learning:copy.study} <span aria-hidden="true">/</span> {project.tech.slice(0,2).join(" · ")}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className={s.lead}>{project.lead}</p>
          <div className={s.actions}>
            {demo&&(demo.startsWith("/")?<Link href={demo} className={s.primary}>{project.slug==="nexus-ai"?label.assistant:label.demo} <span aria-hidden="true">→</span></Link>:<a href={demo} target="_blank" rel="noopener noreferrer" className={s.primary}>{label.demo} →</a>)}
            {project.repository&&<a href={project.repository} target="_blank" rel="noopener noreferrer" className={s.secondary}>{label.code} →</a>}
          </div>
        </div>
        {kind&&<figure className={s.heroVisual}>{nexusEdition?<NexusAssistantPreview language={locale}/>:<ProjectCover project={kind} language={locale} spacious/>}<figcaption>{copy.sketch}</figcaption></figure>}
      </section>
      {nexusEdition&&<section className={s.nexusHighlights} aria-label={nexusText.idea}>
        <div className={s.nexusHighlightsIntro}><span>{nexusText.idea}</span><p>{nexusText.intro}</p></div>
        <div className={s.nexusHighlight}><span aria-hidden="true">◈</span><div><strong>{nexusText.a}</strong><p>{nexusText.at}</p></div></div>
        <div className={s.nexusHighlight}><span aria-hidden="true">⌘</span><div><strong>{nexusText.b}</strong><p>{nexusText.bt}</p></div></div>
        <div className={s.nexusHighlight}><span aria-hidden="true">✧</span><div><strong>{nexusText.c}</strong><p>{nexusText.ct}</p></div></div>
      </section>}
      <div className={s.tech}>{project.tech.map(tech=><span key={tech}>{tech}</span>)}</div>
      <dl className={s.facts}>
        <div><dt>{label.role}</dt><dd>{project.role}</dd></div>
        <div><dt>{label.status}</dt><dd>{project.status}</dd></div>
      </dl>
      <div className={s.reading}>
        <section className={s.section}><span className={s.sectionNumber} aria-hidden="true">01 /</span><div><h2>{label.problem}</h2><p>{project.problem}</p></div></section>
        <section className={s.section}><span className={s.sectionNumber} aria-hidden="true">02 /</span><div><h2>{label.approach}</h2><ol className={s.decisions}>{project.approach.map((item,index)=><li key={item}><span aria-hidden="true">{String(index+1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol></div></section>
        {project.evidence.length>0&&<section className={s.section}><span className={s.sectionNumber} aria-hidden="true">03 /</span><div><h2>{label.evidence}</h2><div className={s.evidence}>{project.evidence.map(item=><a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"><strong>{item.label} <span aria-hidden="true">→</span></strong><p>{item.detail}</p></a>)}</div></div></section>}
        <section className={s.section}><span className={s.sectionNumber} aria-hidden="true">04 /</span><div><h2>{label.lessons}</h2><ul className={s.list}>{project.lessons.map(item=><li key={item}>{item}</li>)}</ul></div></section>
        <section className={s.section}><span className={s.sectionNumber} aria-hidden="true">05 /</span><div><h2>{label.limits}</h2><ul className={s.list}>{project.limitations.map(item=><li key={item}>{item}</li>)}</ul><p className={s.next}><strong>{label.next}</strong>{project.next}</p></div></section>
        <div className={s.practice}><ArchitectureChallenge slug={project.slug} language={locale}/><InterviewReviewChecklist study={project} language={locale}/></div>
      </div>
      <footer className={s.footer}><Link href={back+"#proyectos"}>← {copy.back}</Link><span>NEXUS / {kind?.toUpperCase()||"PORTFOLIO"}</span></footer>
    </div>
  </main>;
}
