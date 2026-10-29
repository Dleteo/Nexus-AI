"use client";

import Link from "next/link";
import {useRef,useState} from "react";
import {certifications, totalTrainingHours} from "../../data/certifications";
import {professionalProfile} from "../../data/profile";
import {siteLanguages, cvPath, portfolioPath, type SiteLanguage} from "../../data/site-languages";
import PortfolioContactChat from "./PortfolioContactChat";
import ProjectCover from "./ProjectCover";
import s from "./EditorialPortfolio.module.css";

type Messages = Record<SiteLanguage,string>;
const local=(language:SiteLanguage,es:string,en:string,de:string,fr:string,pt:string)=>{
  const translations:Messages={es,en,de,fr,pt};return translations[language];
};

const cards=[
  {
    number:"01",name:"Nexus AI Workspace",type:"FULL STACK / AI",
    href:"/projects/nexus-ai",repo:"https://github.com/Dleteo/Nexus-AI",
    technologies:["Next.js","TypeScript","Supabase"],
    description:["Espacio de proyectos, autenticación y asistencia técnica; desarrollo asistido por IA.","Project workspace, authentication and technical assistance; AI-assisted implementation.","Projektbereich, Anmeldung und technische Hilfe; KI-gestützte Umsetzung.","Espace projets, authentification et assistance technique ; développement assisté par IA.","Área de projetos, autenticação e assistência técnica; implementação assistida por IA."],
  },
  {
    number:"02",name:"Nexus Commerce",type:"COMMERCE / DEMO",
    lab:"commerce",repo:"https://github.com/Dleteo/Nexus-AI",
    technologies:["JavaScript","React","Business logic"],
    description:["Catálogo, carrito, inventario y pedidos simulados con persistencia local; sin pagos reales.","Catalog, cart, inventory and simulated orders with local storage; no real payments.","Katalog, Warenkorb, Lager und simulierte Bestellungen im lokalen Speicher; keine echten Zahlungen.","Catalogue, panier, stock et commandes simulées en stockage local ; aucun paiement réel.","Catálogo, carrinho, estoque e pedidos simulados com dados locais; sem pagamentos reais."],
  },
  {
    number:"03",name:"Nexus Studio",type:"VISUAL EDITOR / DEMO",
    lab:"studio",repo:"https://github.com/Dleteo/Nexus-AI",
    technologies:["React","TypeScript","HTML"],
    description:["Editor de bloques con vista previa, reorganización, deshacer y exportación HTML.","Block editor with live preview, reordering, undo and HTML export.","Blockeditor mit Vorschau, Umordnung, Rückgängig und HTML-Export.","Éditeur de blocs avec aperçu, réorganisation, annulation et export HTML.","Editor de blocos com prévia, reordenação, desfazer e exportação HTML."],
  },
  {
    number:"04",name:"Nexus Monitor",type:"API HEALTH / DEMO",
    lab:"monitor",repo:"https://github.com/Dleteo/Nexus-AI",
    technologies:["HTTP","Metrics","Testing"],
    description:["Comprobaciones manuales del endpoint local, latencia e historial de resultados; no es vigilancia continua.","Manual health checks of a local endpoint with latency metrics and history; not continuous monitoring.","Manuelle Zustandsprüfungen eines lokalen Endpunkts mit Latenz und Verlauf; kein Dauer-Monitoring.","Vérification manuelle de l'API locale, latence et historique ; sans surveillance continue.","Verificações manuais da API local, latência e histórico; sem monitoramento contínuo."],
  },
  {
    number:"05",name:"Nexus Software Factory",type:"WORKFLOW / PROTOTYPE",
    lab:"factory",repo:"https://github.com/Dleteo/Nexus-AI",
    technologies:["Workflow","Memory","Review","ZIP"],
    description:["Cola persistente, memoria portable, aprobación del contenido exacto y entregas ZIP con QA estática y revisión humana.","Persistent queue, portable memory, exact-content approval and ZIP handoffs with static QA and human review.","Persistente Aufträge, portables Wissen, exakte Inhaltsfreigabe und ZIP-Pakete mit statischer QA und Review.","File persistante, mémoire portable, approbation du contenu exact et ZIP avec QA statique et revue humaine.","Fila persistente, memória portátil, aprovação do conteúdo exato e ZIP com QA estática e revisão humana."],
  },
] as const;

export default function EditorialPortfolio({language="es"}:{language?:SiteLanguage}) {
  const t=(es:string,en:string,de:string,fr:string,pt:string)=>local(language,es,en,de,fr,pt);
  const labHref=(lab:string)=> (language==="es"?"/labs/":"/"+language+"/labs/")+lab;
  const cardHref=(card:(typeof cards)[number])=> "lab" in card ? labHref(card.lab) : card.href+"?lang="+language;
  const studyHref=(card:(typeof cards)[number])=>"/projects/"+("lab" in card ? (card.lab==="factory"?"nexus-factory":"nexus-"+card.lab) : "nexus-ai")+"?lang="+language;
  const [menu,setMenu]=useState(false);
  const mobileMenuButton=useRef<HTMLButtonElement|null>(null);
  const nav=[
    {label:t("INICIO","HOME","START","ACCUEIL","INÍCIO"),href:"#inicio"},
    {label:t("PROYECTOS","PROJECTS","PROJEKTE","PROJETS","PROJETOS"),href:"#proyectos"},
    {label:t("HABILIDADES","SKILLS","KENNTNISSE","COMPÉTENCES","HABILIDADES"),href:"#habilidades"},
    {label:t("CERTIFICADOS","CERTIFICATES","ZERTIFIKATE","CERTIFICATS","CERTIFICADOS"),href:"#certificados"},
    {label:t("TRAYECTORIA","EXPERIENCE","WEG","PARCOURS","TRAJETÓRIA"),href:"#trayectoria"},
    {label:t("CONTACTO","CONTACT","KONTAKT","CONTACT","CONTATO"),href:"#contacto"},
  ];
  const steps=[
    {a:t("DESCUBRIR","DISCOVER","ENTDECKEN","DÉCOUVRIR","DESCOBRIR"),b:t("Comprendo el problema y los requisitos.","I identify the problem and requirements.","Ich kläre Problem und Anforderungen.","Je définis le problème et les besoins.","Entendo o problema e os requisitos.")},
    {a:t("PLANIFICAR","PLAN","PLANEN","PLANIFIER","PLANEJAR"),b:t("Divido el trabajo y defino prioridades.","I break down work and set priorities.","Ich teile die Arbeit in Schritte ein.","Je répartis le travail et fixe les priorités.","Divido o trabalho e defino prioridades.")},
    {a:t("DESARROLLAR","BUILD","ENTWICKELN","DÉVELOPPER","DESENVOLVER"),b:t("Implemento soluciones y reviso el código.","I implement solutions and review the code.","Ich implementiere Lösungen und prüfe den Code.","Je développe et relis le code.","Implemento soluções e reviso o código.")},
    {a:t("VERIFICAR","VERIFY","PRÜFEN","VÉRIFIER","VERIFICAR"),b:t("Ejecuto pruebas y documento límites.","I run tests and document limitations.","Ich teste und dokumentiere Grenzen.","Je teste et documente les limites.","Executo testes e documento limites.")},
  ];
  const skills=["HTML / CSS","JavaScript","TypeScript","React","Next.js","Python","Supabase","Git / GitHub","Automated tests","Responsive UI","PostgreSQL / RLS","Accessibility"];
  const langs=siteLanguages.map(l=>({code:l.code,name:l.nativeName}));
  return <div className={s.page} id="inicio" lang={language}>
    <a className={s.skip} href="#main-content">{t("Ir al contenido","Skip to content","Zum Inhalt","Aller au contenu","Ir ao conteúdo")}</a>
    <header className={s.header}>
      <Link className={s.brand} href={portfolioPath(language)} aria-label="Nexus Portfolio"><span className={s.logo}>N</span><span>NEXUS<small>DEVELOPER PORTFOLIO</small></span></Link>
      <nav className={s.desktopNav} aria-label={t("Navegación principal","Primary navigation","Hauptnavigation","Navigation principale","Navegação principal")}>{nav.map(n=><a key={n.href} href={n.href}>{n.label}</a>)}</nav>
      <div className={s.headerRight}>
        <details className={s.languages}><summary aria-label={t("Seleccionar idioma","Select language","Sprache wählen","Choisir la langue","Selecionar idioma")}>{language.toUpperCase()} <span aria-hidden="true">⌄</span></summary><div className={s.languageOptions}>{langs.map(l=><Link href={portfolioPath(l.code)} key={l.code} hrefLang={l.code} aria-current={l.code===language?"page":undefined}>{l.name}</Link>)}</div></details>
        <Link href={cvPath(language)} className={s.cv}>{t("Ver CV","View CV","Lebenslauf","Voir CV","Ver CV")} <span aria-hidden="true">→</span></Link>
        <button ref={mobileMenuButton} className={s.menuToggle} type="button" aria-controls="mobile-portfolio-nav" onClick={()=>setMenu(previous=>!previous)} aria-expanded={menu} aria-label={t("Menú","Menu","Menü","Menu","Menu")}>{menu?"✕":"☰"}</button>
      </div>
    </header>
    {menu&&<nav id="mobile-portfolio-nav" className={s.mobileNav} aria-label="Mobile portfolio navigation" onKeyDown={event=>{if(event.key==="Escape"){setMenu(false);mobileMenuButton.current?.focus();}}}>{nav.map(n=><a href={n.href} onClick={()=>setMenu(false)} key={n.href}>{n.label}</a>)}</nav>}
    <main id="main-content" tabIndex={-1}>
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroBackdrop} aria-hidden="true">PORTFOLIO</div>
        <div className={s.heroPortrait} role="img" aria-label={t("Fotografía del desarrollador","Developer portrait","Porträt des Entwicklers","Portrait du développeur","Retrato do desenvolvedor")}/>
        <div className={s.heroLeft}>
          <p className={s.handwritten}><span className={s.handwrittenInk}>{t("Hola, soy","Hello, I'm","Hallo, ich bin","Bonjour, je suis","Olá, sou")}</span></p>
          <h1 id="hero-title"><span>JOSHUA</span><span>VALLEJO</span><span className={s.red}>SANCHEZ</span></h1>
          <p className={s.role}>{t("DESARROLLADOR WEB JUNIOR","JUNIOR WEB DEVELOPER","JUNIOR WEBENTWICKLER","DÉVELOPPEUR WEB JUNIOR","DESENVOLVEDOR WEB JÚNIOR")}</p>
          <p className={s.heroDescription}>{t("Desarrollo interfaces, aplicaciones con datos y proyectos de IA. Documento el código, las pruebas y lo que todavía estoy aprendiendo.","I build interfaces, data-driven applications and AI projects. I document the code, tests and what I am still learning.","Ich entwickle Oberflächen, datenbasierte Apps und KI-Projekte. Ich dokumentiere Code, Tests und Lernfortschritt.","Je développe des interfaces, des applications de données et des projets d’IA. Je documente le code, les tests et mes apprentissages.","Desenvolvo interfaces, aplicativos de dados e projetos de IA. Documento código, testes e o que ainda estou aprendendo.")}</p>
          <div className={s.heroActions}><a href="#proyectos" className={s.primary}>{t("Ver mis proyectos","View my projects","Projekte ansehen","Voir mes projets","Ver meus projetos")} <span>→</span></a><a className={s.secondary} href="#contacto">{t("Contactarme","Contact me","Kontakt","Me contacter","Contato")} <span>↓</span></a></div>
        </div>
        <div className={s.heroRight}>
          <p className={s.heroManifesto}><span className={s.spark}>✦</span>{t("CONVIERTO IDEAS EN EXPERIENCIAS DIGITALES CON PROPÓSITO.","I TURN IDEAS INTO PURPOSEFUL DIGITAL EXPERIENCES.","ICH MACHE AUS IDEEN SINNVOLLE DIGITALE ERLEBNISSE.","JE TRANSFORME LES IDÉES EN EXPÉRIENCES NUMÉRIQUES UTILES.","TRANSFORMO IDEIAS EM EXPERIÊNCIAS DIGITAIS COM PROPÓSITO.")}</p>
          <div className={s.numbers}>
            <div><strong>{totalTrainingHours.toLocaleString(language)}<small>h</small></strong><span>{t("FORMACIÓN DOCUMENTADA","DOCUMENTED TRAINING","DOKUMENTIERTE KURSE","FORMATION DOCUMENTÉE","FORMAÇÃO DOCUMENTADA")}</span></div>
            <div><strong>11</strong><span>{t("REPOSITORIOS REVISADOS","REPOSITORIES REVIEWED","GEPRÜFTE REPOSITORIES","DÉPÔTS EXAMINÉS","REPOSITÓRIOS ANALISADOS")}</span></div>
            <div><strong>{String(certifications.length).padStart(2,"0")}</strong><span>{t("CERTIFICADOS Y CONSTANCIAS","TRAINING RECORDS","ZERTIFIKATE","ATTESTATIONS","CERTIFICADOS")}</span></div>
          </div>
        </div>
        <div className={s.heroAvailability}>{t("DISPONIBLE PARA OPORTUNIDADES JUNIOR","OPEN TO JUNIOR OPPORTUNITIES","OFFEN FÜR JUNIOR-STELLEN","OUVERT AUX OPPORTUNITÉS JUNIOR","ABERTO A OPORTUNIDADES JÚNIOR")}</div>
      </section>

      <section className={s.projects} id="proyectos" aria-labelledby="projects-title">
        <div className={s.sectionHeader}><h2 id="projects-title">{t("PROYECTOS DESTACADOS","FEATURED PROJECTS","AUSGEWÄHLTE PROJEKTE","PROJETS À LA UNE","PROJETOS EM DESTAQUE")} <span className={s.spark}>✦</span></h2><a href={professionalProfile.github} target="_blank" rel="noopener noreferrer">{t("VER TODOS LOS REPOSITORIOS","VIEW ALL REPOSITORIES","ALLE REPOSITORIES","VOIR TOUS LES DÉPÔTS","VER REPOSITÓRIOS")} <span>⟶</span></a></div>
        <p className={s.projectIntro}>{t("Cinco proyectos. Un espacio propio para cada idea.","Five projects. A dedicated space for every idea.","Fünf Projekte. Ein eigener Raum für jede Idee.","Cinq projets. Un espace dédié à chaque idée.","Cinco projetos. Um espaço próprio para cada ideia.")}</p>
        <div className={s.projectGrid}>{cards.map(card=>{
          const project="lab" in card ? card.lab : "workspace";
          return <article className={s.projectCard} data-project={project} key={card.number}>
            <Link className={s.projectPicture} href={cardHref(card)} aria-label={card.name}>
              <ProjectCover project={project} language={language}/>
            </Link>
            <div className={s.projectCopy}>
              <div className={s.cardTop}><b>{card.number} / 05</b><span>{card.type}</span></div>
              <div className={s.projectTitle}><h3><Link href={studyHref(card)}>{card.name}</Link></h3></div>
              <p>{card.description[({es:0,en:1,de:2,fr:3,pt:4} as const)[language]]}</p>
              <div className={s.tags}>{card.technologies.map(v=><span key={v}>{v}</span>)}</div>
              <div className={s.projectLinks}>
                <Link href={studyHref(card)} className={s.studyLink}>{t("Ver caso de estudio","Read case study","Fallstudie lesen","Voir l’étude de cas","Ver estudo de caso")} <span aria-hidden="true">→</span></Link>
                {"lab" in card&&<Link href={labHref(card.lab)} className={s.demoLink}>{t("Abrir proyecto","Open project","Projekt öffnen","Ouvrir le projet","Abrir projeto")} <span aria-hidden="true">→</span></Link>}
              </div>
            </div>
          </article>;
        })}</div>
        <p className={s.evidence}><span>●</span> {t("Proyectos demostrables; sin clientes ni resultados comerciales inventados.","Verifiable projects; no invented clients or commercial results.","Nachweisbare Projekte; keine erfundenen Kunden oder Erfolge.","Projets vérifiables ; aucun client ou résultat inventé.","Projetos verificáveis; sem clientes ou resultados inventados.")}</p>
      </section>

      <section className={s.proof} id="trayectoria">
        <article className={s.proofColumn} id="certificados"><h2>{t("EDUCACIÓN Y FORMACIÓN","EDUCATION & TRAINING","AUSBILDUNG & KURSE","FORMATION","EDUCAÇÃO E FORMAÇÃO")} <span className={s.spark}>✦</span></h2><ul className={s.education}>{certifications.slice(0,4).map(c=><li key={c.id}><span>{c.hours}h</span><div><strong>{c.title}</strong><small>{c.issuer}</small></div></li>)}</ul><div className={s.certificateSummary}><strong>{certifications.length} {t("constancias documentadas","documented credentials","dokumentierte Nachweise","attestations documentées","certificados documentados")}</strong><span>{totalTrainingHours}h {t("de formación","of training","Ausbildung","de formation","de formação")}</span></div><Link className={s.sectionLink} href={cvPath(language)}>{t("Ver formación y CV","View training and CV","Kurse und Lebenslauf","Voir formation et CV","Ver formação e CV")} →</Link></article>
        <article className={s.proofColumn} id="habilidades"><h2>{t("HABILIDADES","SKILLS","KENNTNISSE","COMPÉTENCES","HABILIDADES")} <span className={s.spark}>✦</span></h2><div className={s.skillTags}>{skills.map(skill=><span key={skill}>{skill}</span>)}</div><p className={s.smallNote}>{t("Diferencio práctica propia de integraciones realizadas con asistencia de IA.","Hands-on work is distinguished from AI-assisted integrations.","Eigene Praxis und KI-gestützte Integration werden unterschieden.","Je distingue la pratique directe des intégrations assistées par IA.","Distingo a prática própria das integrações assistidas por IA.")}</p></article>
        <article className={s.proofColumn}><h2>{t("MI PROCESO","MY PROCESS","MEIN PROZESS","MON PROCESSUS","MEU PROCESSO")} <span className={s.spark}>✦</span></h2><ol className={s.steps}>{steps.map((step,i)=><li key={i}><b>{String(i+1).padStart(2,"0")}</b><span aria-hidden="true" className={s.stepIcon}>{["⌕","◇","✎","✓"][i]}</span><div><strong>{step.a}</strong><p>{step.b}</p></div></li>)}</ol></article>
      </section>

      <section className={s.contact} id="contacto" aria-labelledby="contact-title">
        <div className={s.contactLeft}><div className={s.contactArtwork} aria-hidden="true"><span className={s.screen}>NEXUS <small>AI WORKSPACE</small><b>{t("Soluciones reales.","Real solutions.","Echte Lösungen.","Solutions concrètes.","Soluções reais.")}</b></span></div><p className={s.contactOverline}>{t("HABLEMOS","LET'S TALK","SPRECHEN WIR","PARLONS","VAMOS CONVERSAR")}</p><h2 id="contact-title">{t("TRABAJEMOS","LET'S WORK","ARBEITEN WIR","TRAVAILLONS","VAMOS TRABALHAR")} <span>{t("JUNTOS","TOGETHER","ZUSAMMEN","ENSEMBLE","JUNTOS")}</span> <i>✦</i></h2><p className={s.contactText}>{t("Estoy abierto a oportunidades de desarrollador junior y colaboraciones. Puedes escribirme o preguntarle a Nexus sobre mis proyectos.","I'm open to junior developer opportunities and collaborations. Email me or ask Nexus about my work.","Ich bin offen für Junior-Stellen und Zusammenarbeit. Schreib mir oder frage Nexus nach meinen Projekten.","Je suis ouvert aux postes juniors et collaborations. Écrivez-moi ou interrogez Nexus sur mon travail.","Estou aberto a vagas júnior e colaborações. Envie um e-mail ou pergunte ao Nexus sobre meu trabalho.")}</p><a href={"mailto:"+professionalProfile.email} className={s.contactCTA}>✉ {t("Enviar correo","Send email","E-Mail senden","Envoyer un e-mail","Enviar e-mail")} <span>→</span></a><div className={s.socials}><a href={professionalProfile.github} target="_blank" rel="noopener noreferrer">GitHub →</a><a href={professionalProfile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn →</a><a href={professionalProfile.instagram} target="_blank" rel="noopener noreferrer">Instagram →</a></div><p className={s.location}>{professionalProfile.location}</p></div>
        <div className={s.contactRight}><div className={s.contactTitle}><b><span className={s.live}/> NEXUS / {t("CONTACTO","CONTACT","KONTAKT","CONTACT","CONTATO")}</b><span>{t("GUÍA DE MI PORTAFOLIO","PORTFOLIO GUIDE","PORTFOLIO-HILFE","GUIDE PORTFOLIO","GUIA DO PORTFÓLIO")}</span></div><PortfolioContactChat language={language}/></div>
      </section>
      <footer className={s.footer}><span>© {new Date().getFullYear()} NEXUS · Joshua Vallejo Sanchez</span><a href="#inicio">{t("VOLVER ARRIBA","BACK TO TOP","NACH OBEN","RETOUR EN HAUT","VOLTAR AO TOPO")} ↑</a></footer>
    </main>
  </div>;
}
