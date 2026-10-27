"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { certifications, totalTrainingHours } from "../../data/certifications";
import { selectedGithubProjects } from "../../data/github-projects";
import { professionalProfile } from "../../data/profile";
import styles from "./CareerHome.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import PortfolioContactChat from "./PortfolioContactChat";
import {cvDownloadPath,cvFileName,cvDownloadLabels,cvPath,type SiteLanguage} from "../../data/site-languages";
import {careerTranslate} from "../../data/career-translation";

type Category = "all" | "product" | "frontend" | "research";
type CredentialFilter = "all" | "Course completion" | "Attendance certificate";

type Project = {
  id: string;
  title: string;
  category: Exclude<Category, "all">;
  kind: string;
  summary: string;
  evidence: string;
  stack: string[];
  repo?: string;
  demo?: string;
  image?: string;
  imageAlt?: string;
};

const projects: Project[] = [
  {
    id: "nexus",
    title: "Nexus AI",
    category: "product",
    kind: "Aplicación principal · Full-stack e IA",
    summary: "Espacio de trabajo con autenticación, proyectos privados, conversaciones persistentes y un asistente para planificar, aprender y depurar.",
    evidence: "Next.js, Supabase Auth, PostgreSQL/RLS, API del proveedor de IA y verificaciones CI.",
    stack: ["Next.js", "TypeScript", "React", "Supabase", "IA"],
    repo: "https://github.com/Dleteo/Nexus-AI",
    demo: "/assistant",
  },
  {
    id: "todo",
    title: "Task Tracker",
    category: "frontend",
    kind: "Productividad · JavaScript",
    summary: "Gestor de tareas con creación, finalización y eliminación de pendientes. Los datos se conservan en el navegador.",
    evidence: "Eventos del DOM, estado de interfaz y persistencia con localStorage.",
    stack: ["JavaScript", "HTML", "CSS", "localStorage"],
    repo: selectedGithubProjects[0].repoUrl,
    demo: selectedGithubProjects[0].demoUrl,
    image: selectedGithubProjects[0].previewImage,
    imageAlt: selectedGithubProjects[0].previewDescription,
  },
  {
    id: "hangman",
    title: "Hangman Game",
    category: "frontend",
    kind: "Juego interactivo · Lógica",
    summary: "Juego de palabras con selección de letras, estados de victoria o derrota y palabras personalizadas.",
    evidence: "Lógica condicional, validación de entradas y respuesta a acciones del usuario.",
    stack: ["JavaScript", "HTML", "CSS"],
    repo: selectedGithubProjects[1].repoUrl,
    demo: selectedGithubProjects[1].demoUrl,
    image: selectedGithubProjects[1].previewImage,
    imageAlt: selectedGithubProjects[1].previewDescription,
  },
  {
    id: "foundation",
    title: "Nexus Foundation",
    category: "research",
    kind: "Investigación privada · Machine learning",
    summary: "Laboratorio experimental de Transformer causal y tokenización BPE, con entrenamiento y evaluaciones reproducibles.",
    evidence: "Proyecto de investigación; el modelo propio aún no es un asistente conversacional fiable.",
    stack: ["Python", "PyTorch", "BPE", "Evaluación"],
  },
];

const projectFilters: { value: Category; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "product", label: "Producto IA" },
  { value: "frontend", label: "Frontend" },
  { value: "research", label: "Investigación" },
];

const technicalSkills = [
  { title: "Fundamentos web", detail: "Practicados directamente", items: ["HTML5", "CSS3", "JavaScript", "DOM", "Responsive UI", "localStorage"] },
  { title: "Aplicaciones modernas", detail: "Implementados con asistencia de IA", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL / RLS"] },
  { title: "Calidad y herramientas", detail: "Evidencia en repositorios", items: ["Git / GitHub", "GitHub Actions", "ESLint", "Pruebas de navegador", "HTTP smoke tests", "Revisión de código"] },
];

function Arrow({ external = false }: { external?: boolean }) {
  return <span aria-hidden="true">{external ? "↗" : "→"}</span>;
}

function ProjectVisual({ project, language }: { project: Project; language: SiteLanguage }) {
  const t=(value:string)=>careerTranslate(language,value);
  if (project.id === "nexus") {
    return (
      <div className={styles.nexusPreview} aria-label="Representación de los módulos de Nexus AI">
        <div className={styles.windowTop}><span /><span /><span /><small>nexus-ai / workspace</small></div>
        <div className={styles.windowBody}>
          <div className={styles.previewNav}><strong>N</strong><i/><i/><i/></div>
          <div className={styles.previewMain}>
            <span className={styles.previewEyebrow}>NEXUS / AI WORKSPACE</span>
            <strong>{t("Tu espacio para crear.")}</strong>
            <div className={styles.previewMessage}>{t("¿En qué proyecto trabajamos hoy?")}</div>
            <div className={styles.previewPrompt}><span>{t("Planificar · Depurar · Aprender")}</span><b>↗</b></div>
          </div>
        </div>
      </div>
    );
  }
  if (project.image) {
    return (
      <div className={styles.projectImage}>
        <Image src={project.image} alt={project.imageAlt || project.title} fill unoptimized sizes="(max-width: 760px) 100vw, 45vw" className={styles.projectImageAsset}/>
      </div>
    );
  }
  return (
    <div className={styles.researchVisual} aria-label="Diagrama conceptual de un modelo Transformer">
      <span className={styles.researchLabel}>{t("LABORATORIO / EXPERIMENTAL")}</span>
      <div className={styles.researchNodes}><span>Corpus</span><b>→</b><span>BPE</span><b>→</b><span>Transformer</span><b>→</b><span>{t("Evaluación")}</span></div>
      <small>{t("Arquitectura propia · Resultados en evaluación")}</small>
    </div>
  );
}

export default function CareerHome({language="es"}:{language?:SiteLanguage}) {
  const t=(value:string)=>careerTranslate(language,value);
  const [category, setCategory] = useState<Category>("all");
  const [credentialFilter, setCredentialFilter] = useState<CredentialFilter>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleProjects = projects.filter((project) => category === "all" || project.category === category).map(project=>({...project,kind:t(project.kind),summary:t(project.summary),evidence:t(project.evidence)}));
  const visibleCertificates = certifications.filter((certificate) => credentialFilter === "all" || certificate.credentialType === credentialFilter);

  const navigation = [
    { href: "#inicio", label: t("Inicio") },
    { href: "#proyectos", label: t("Proyectos") },
    { href: "#habilidades", label: t("Habilidades") },
    { href: "#certificados", label: t("Certificados") },
    { href: "#trayectoria", label: t("Trayectoria") },
    { href: "#nexus-ai", label: t("Asistente IA") },
    { href: "#contacto", label: t("Contacto") },
  ];

  return (
    <div className={styles.site} id="inicio" lang={language}>
      <a className={styles.skipLink} href="#principal">{t("Ir al contenido")}</a>
      <aside className={styles.sidebar} aria-label={t("Navegación del portafolio")}>
        <Link href="/" className={styles.logo}><span className={styles.logoMark}>N</span><span>NEXUS<small>DEVELOPER PORTFOLIO</small></span></Link>
        <div className={styles.sidebarDivider}/>
        <p className={styles.sideLabel}>{t("EXPLORAR")}</p>
        <nav className={styles.desktopNavigation} aria-label={t("Secciones del portafolio")}>
          {navigation.map((item, index) => <a key={item.href} href={item.href} className={index === 0 ? styles.selectedNav : ""}><span className={styles.navNumber}>{String(index + 1).padStart(2, "0")}</span>{item.label}</a>)}
        </nav>
        <div className={styles.sidebarBottom}>
          <span className={styles.sidebarStatus}><span/>{t("Portafolio en desarrollo")}</span>
          <a href={professionalProfile.github} target="_blank" rel="noopener noreferrer">GitHub / Dleteo <Arrow external/></a>
          <Link href={cvPath(language)}>{t("Ver curriculum")} <Arrow/></Link>
          <small>© {new Date().getFullYear()} · {t("Desarrollo con evidencia")}</small>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}><span className={styles.liveDot}/><span>{t("PORTAFOLIO DE DESARROLLADOR")}</span></div>
          <nav className={styles.topbarActions} aria-label={t("Accesos rápidos")}>
            <a href={professionalProfile.github} target="_blank" rel="noopener noreferrer" className={styles.topLink}>GitHub <Arrow external/></a>
            <Link href={cvPath(language)} className={styles.topButton}>{t("Ver CV")} <Arrow/></Link>
            <button type="button" aria-label={mobileMenuOpen ? t("Cerrar menú") : t("Abrir menú")} aria-expanded={mobileMenuOpen} aria-controls="career-mobile-nav" className={styles.menuButton} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? t("Cerrar") : t("Menú")} <span aria-hidden="true">{mobileMenuOpen ? "×" : "☰"}</span></button>
          </nav>
        </header>
        <div className="border-b border-[#273a50] px-5 py-3 sm:px-9"><LanguageSwitcher language={language}/></div>
        {mobileMenuOpen && <nav id="career-mobile-nav" className={styles.mobileNavigation} aria-label={t("Menú del portafolio")}>{navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</a>)}</nav>}

        <main id="principal" className={styles.main}>
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroContent}>
              <span className={styles.sectionKicker}><span className={styles.kickerLine}/>{t("BIENVENIDO A MI ESPACIO")}</span>
              <p className={styles.introName}>{t("Hola, soy")} {professionalProfile.name}.</p>
              <h1 id="hero-title">{t("Construyo experiencias digitales")} <em>{t("con propósito.")}</em></h1>
              <p className={styles.heroDescription}>{t("Desarrollador web junior enfocado en interfaces, aplicaciones con datos e inteligencia artificial. Me gusta transformar problemas reales en software claro, funcional y comprobable.")}</p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#proyectos">{t("Explorar mis proyectos")} <Arrow/></a>
                <Link href={cvPath(language)} className={styles.secondaryButton}>{t("Currículum y experiencia")} <Arrow/></Link>
              </div>
              <p className={styles.heroNote}>{t("Pensilvania, EE. UU.")} <span>·</span>{t("Abierto a oportunidades junior")}</p>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.orbGlow} aria-hidden="true" />
              <div className={styles.heroPortrait} role="img" aria-label={t("Retrato del desarrollador de su portafolio anterior")}>
                <div className={styles.portraitBackdrop} aria-hidden="true">NEXUS</div>
                <div className={styles.portraitPhoto} aria-hidden="true"/>
                <div className={styles.portraitCaption}><span>DEVELOPER / 2026</span><strong>{professionalProfile.name}</strong></div>
              </div>
              <span className={styles.visualFootnote}>{t("Código real. Progreso demostrable.")}</span>
            </div>
          </section>

          <section className={styles.metrics} aria-label={t("Indicadores documentados")}>
            <div><strong>{totalTrainingHours.toLocaleString(language==="es"?"es-ES":language, { maximumFractionDigits: 1 })} <span>h</span></strong><small>{t("Formación documentada")}</small></div>
            <div><strong>{certifications.length.toString().padStart(2, "0")}</strong><small>{t("Certificados y constancias")}</small></div>
            <div><strong>11</strong><small>{t("Repositorios revisados en GitHub*")}</small></div>
            <div><strong>01</strong><small>{t("Producto principal con IA")}</small></div>
          </section>
          <p className={styles.metricsNote}>{t("* Conteo revisado el 26/10/2026. Las horas de cursos no se presentan como horas de programación; el registro de práctica se añadirá cuando haya datos medibles.")}</p>

          <section className={styles.section} id="proyectos" aria-labelledby="projects-title">
            <div className={styles.sectionHeading}><div><p className={styles.sectionKicker}>{t("01 / TRABAJO SELECCIONADO")}</p><h2 id="projects-title">{t("Proyectos que demuestran")} <em>{t("cómo trabajo.")}</em></h2><p>{t("Una selección breve con objetivos, decisiones técnicas y acceso a código real.")}</p></div><a className={styles.textLink} href={professionalProfile.github} target="_blank" rel="noopener noreferrer">{t("Ver repositorios")} <Arrow external/></a></div>
            <div className={styles.filters} role="group" aria-label={t("Filtrar proyectos")}>
              {projectFilters.map((filter) => <button key={filter.value} type="button" aria-pressed={category === filter.value} className={category === filter.value ? styles.activeFilter : styles.filter} onClick={() => setCategory(filter.value)}>{t(filter.label)}</button>)}
            </div>
            <div className={styles.projectGrid} aria-live="polite">
              {visibleProjects.map((project) => <article key={project.id} className={styles.projectCard}>
                <ProjectVisual project={project} language={language}/>
                <div className={styles.projectCardBody}><span className={styles.projectKind}>{project.kind}</span><h3>{project.title}</h3><p>{project.summary}</p><div className={styles.techList}>{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div><p className={styles.evidence}>{project.evidence}</p><div className={styles.projectLinks}><Link href={"/projects/" + ({"nexus":"nexus-ai","todo":"task-tracker","hangman":"hangman","foundation":"nexus-foundation"} as Record<string,string>)[project.id]+"?lang="+language}>{t("Caso de estudio")} <Arrow/></Link>{project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer">{t("Código")} <Arrow external/></a>}{project.demo && (project.demo.startsWith("/") ? <Link href={project.demo}>{t("Explorar")} <Arrow/></Link> : <a href={project.demo} target="_blank" rel="noopener noreferrer">{t("Demo")} <Arrow external/></a>)}{!project.repo && <span>{t("Investigación privada · sin demo pública")}</span>}</div></div>
              </article>)}
            </div>
          </section>

          <section id="habilidades" className={styles.section} aria-labelledby="skills-title">
            <div className={styles.sectionHeading}><div><p className={styles.sectionKicker}>{t("02 / TECNOLOGÍAS")}</p><h2 id="skills-title">{t("Habilidades con")} <em>{t("contexto real.")}</em></h2><p>{t("Diferencio la práctica directa de las tecnologías integradas mediante herramientas de IA.")}</p></div></div>
            <div className={styles.skillGrid}>{technicalSkills.map((group, index) => <article className={styles.skillCard} key={group.title}><span className={styles.skillNumber}>0{index+1} {t("/ ÁREA")}</span><h3>{t(group.title)}</h3><p>{t(group.detail)}</p><div className={styles.techList}>{group.items.map((item) => <span key={item}>{t(item)}</span>)}</div></article>)}</div>
          </section>

          <section id="certificados" className={styles.section} aria-labelledby="certs-title">
            <div className={styles.sectionHeading}><div><p className={styles.sectionKicker}>{t("03 / APRENDIZAJE CONTINUO")}</p><h2 id="certs-title">{t("Formación y")} <em>{t("certificaciones.")}</em></h2><p>{t("Registros documentados por curso, entidad emisora, fecha y horas indicadas.")}</p></div><strong className={styles.trainingCount}>{totalTrainingHours.toLocaleString(language==="es"?"es-ES":language)} h <small>{t("de formación")}</small></strong></div>
            <div className={styles.filters} role="group" aria-label={t("Filtrar certificados")}>
              {([{ value: "all", label: t("Todos") }, { value: "Course completion", label: t("Cursos completados") }, { value: "Attendance certificate", label: t("Constancias de asistencia") }] as const).map((item) => <button type="button" key={item.value} aria-pressed={credentialFilter === item.value} className={credentialFilter === item.value ? styles.activeFilter : styles.filter} onClick={() => setCredentialFilter(item.value)}>{item.label}</button>)}
            </div>
            <div className={styles.certificateGrid} aria-live="polite">{visibleCertificates.map((certificate) => <article className={styles.certificateCard} key={certificate.id}>
              <a className={styles.certificateImage} href={certificate.credentialUrl || certificate.image} target="_blank" rel="noopener noreferrer" aria-label={t("Abrir certificado: ") + certificate.title}><Image src={certificate.image} alt={t("Certificado de ") + certificate.title} fill sizes="(max-width: 760px) 90vw, 28vw" className={styles.certificateImageAsset}/></a>
              <div className={styles.certificateDetails}><div className={styles.certTop}><span>{certificate.issuer}</span><strong>{certificate.hours} h</strong></div><h3>{certificate.title}</h3><p>{certificate.credentialType === "Course completion" ? t("Curso completado") : t("Constancia de asistencia")} · {certificate.date}</p><a href={certificate.credentialUrl || certificate.image} target="_blank" rel="noopener noreferrer">{certificate.credentialUrl ? t("Verificar credencial") : t("Ver certificado")} <Arrow external/></a></div>
            </article>)}</div>
            <p className={styles.certFinePrint}>{t("Horas de formación, no experiencia laboral ni horas de código. Los enlaces de verificación se muestran cuando están disponibles.")}</p>
          </section>

          <section id="trayectoria" className={styles.section} aria-labelledby="journey-title"><div className={styles.sectionHeading}><div><p className={styles.sectionKicker}>{t("04 / MI TRAYECTORIA")}</p><h2 id="journey-title">{t("Preparándome para")} <em>{t("el siguiente paso.")}</em></h2></div></div>
            <div className={styles.journeyGrid}><div className={styles.journeyPanel}><div className={styles.journeyRow}><span>{t("ACTUALIDAD")}</span><div><h3>{t("Desarrollo de proyectos personales")}</h3><p>{t("Construcción y mejora de Nexus AI, documentación de decisiones, pruebas y colaboración con herramientas de IA.")}</p></div></div><div className={styles.journeyRow}><span>2024—2026</span><div><h3>{t("Formación técnica continua")}</h3><p>{t("Desarrollo web, fundamentos de ingeniería de software, IA aplicada y formación introductoria en ciberseguridad.")}</p></div></div><div className={styles.journeyRow}><span>{t("EXPERIENCIA")}</span><div><h3>{t("Operaciones y trabajo en equipo")}</h3><p>{t("Experiencia laboral fuera del desarrollo de software, con disciplina operativa, coordinación y ejecución de procedimientos.")}</p></div></div></div><div className={styles.resumePanel}><span className={styles.sectionKicker}>{t("PERFIL PROFESIONAL")}</span><h3>{t("Todo lo esencial, en un solo CV.")}</h3><p>{t("Resumen profesional, experiencia transferible, habilidades técnicas y formación documentada, listo para una conversación con reclutadores.")}</p><Link href={cvPath(language)} className={styles.primaryButton}>{t("Abrir currículum")} <Arrow/></Link><Link href="/interview" className={styles.secondaryButton}>{t("Preparar entrevista")} <Arrow/></Link><a href={cvDownloadPath(language)} download={cvFileName(language)}>{cvDownloadLabels[language]} ↓</a></div></div>
          </section>

          <section id="nexus-ai" className={styles.aiPanel} aria-labelledby="ai-title"><div><p className={styles.sectionKicker}>{t("05 / PRODUCTO EN DESARROLLO")}</p><h2 id="ai-title">{t("Una IA que acompaña")} <em>{t("el proceso.")}</em></h2><p>{t("Nexus AI ya incorpora un asistente con modos de planificación, depuración, aprendizaje y simulación de entrevistas. Las guías técnicas y el laboratorio de modelos propios se desarrollan por separado y no se presentan como diagnósticos automáticos fiables.")}</p><div className={styles.aiModes}><span>{t("Planificar")}</span><span>{t("Depurar")}</span><span>{t("Aprender")}</span><span>{t("Entrevistas")}</span></div><Link href="/assistant" className={styles.primaryButton}>{t("Explorar el asistente")} <Arrow/></Link><small>{t("El acceso al asistente requiere iniciar sesión. La disponibilidad del proveedor depende de su configuración.")}</small></div><div className={styles.aiTerminal} aria-hidden="true"><div><span/><span/><span/><small>nexus / assistant</small></div><p><b>01</b> {t("¿Qué quieres construir hoy?")}</p><p><b>02</b> {t("Divide el objetivo en tareas.")}</p><p><b>03</b> {t("Comprueba el resultado.")}</p><p><b>04</b> {t("Documenta lo aprendido.")}</p><span>{t("El proceso también forma parte del proyecto.")}</span></div></section>

          <section id="contacto" className={styles.contact} aria-labelledby="contact-title"><p className={styles.sectionKicker}>{t("06 / SIGUIENTE CAPÍTULO")}</p><h2 id="contact-title">{t("Hablemos de")} <em>{t("lo que podemos construir.")}</em></h2><p>{t("Busco mi primera oportunidad profesional en desarrollo web. Aquí puedes consultar mi código, explorar mis proyectos y revisar mi currículum.")}</p><div className={styles.contactActions}><a href={professionalProfile.github} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>{t("Ver mi GitHub")} <Arrow external/></a><Link href={cvPath(language)} className={styles.secondaryButton}>{t("Consultar CV")} <Arrow/></Link></div><PortfolioContactChat language={language}/></section>
          <footer className={styles.footer}><span>NEXUS / DEVELOPER PORTFOLIO</span><span>{t("Diseñado para mostrar trabajo real")} · {new Date().getFullYear()}</span><a href="#inicio">{t("Volver arriba ↑")}</a></footer>
        </main>
      </div>
    </div>
  );
}
