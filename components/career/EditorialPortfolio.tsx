"use client";

import Link from "next/link";
import {useRef,useState} from "react";
import {certifications, totalTrainingHours} from "../../data/certifications";
import {professionalProfile} from "../../data/profile";
import {siteLanguages, cvPath, portfolioPath, type SiteLanguage} from "../../data/site-languages";
import PortfolioContactChat from "./PortfolioContactChat";
import DevelopmentEvidence from "./DevelopmentEvidence";
import PortfolioCompanion from "./PortfolioCompanion";
import ContactIcon from "./ContactIcon";
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
  const [contactFeedback,setContactFeedback]=useState("");
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
    {a:t("DESCUBRIR","DISCOVER","ENTDECKEN","DÉCOUVRIR","DESCOBRIR"),b:t("Recojo requisitos, público, restricciones y evidencias disponibles.","I identify the problem and requirements.","Ich kläre Problem und Anforderungen.","Je définis le problème et les besoins.","Entendo o problema e os requisitos.")},
    {a:t("PLANIFICAR","PLAN","PLANEN","PLANIFIER","PLANEJAR"),b:t("Defino alcance, prioridades y criterios de aceptación antes de construir.","I break down work and set priorities.","Ich teile die Arbeit in Schritte ein.","Je répartis le travail et fixe les priorités.","Divido o trabalho e defino prioridades.")},
    {a:t("DESARROLLAR","BUILD","ENTWICKELN","DÉVELOPPER","DESENVOLVER"),b:t("Construyo componentes y flujos con IA, revisando datos, accesibilidad y seguridad.","I implement solutions and review the code.","Ich implementiere Lösungen und prüfe den Code.","Je développe et relis le code.","Implemento soluções e reviso o código.")},
    {a:t("VERIFICAR","VERIFY","PRÜFEN","VÉRIFIER","VERIFICAR"),b:t("Compruebo tipos, build, APIs y navegador; documento resultados y límites.","I run tests and document limitations.","Ich teste und dokumentiere Grenzen.","Je teste et documente les limites.","Executo testes e documento limites.")},
    {a:t("REVISAR","REVIEW","PRÜFEN","RELIRE","REVISAR"),b:t("Inspecciono el cambio y las evidencias antes de aceptar la entrega.","I inspect changes and evidence before accepting delivery.","Ich prüfe Änderungen und Nachweise vor der Abnahme.","Je relis changements et preuves avant livraison.","Reviso alterações e evidências antes da entrega.")},
    {a:t("DOCUMENTAR Y ENTREGAR","DOCUMENT & HANDOFF","DOKUMENTIEREN","DOCUMENTER ET LIVRER","DOCUMENTAR E ENTREGAR"),b:t("Registro decisiones, límites y próximos pasos; conservo una versión revisable.","I record decisions, limits and next steps, preserving a reviewable version.","Ich dokumentiere Entscheidungen, Grenzen und nächste Schritte.","Je documente décisions, limites et prochaines étapes.","Registro decisões, limites e próximos passos.")},
  ];

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
            <div><strong>4<small> / 6 d</small></strong><span>{t("DÍAS REALIZADOS / ESTIMADOS","DAYS COMPLETED / ESTIMATED","TAGE UMGESETZT / GESCHÄTZT","JOURS RÉALISÉS / ESTIMÉS","DIAS REALIZADOS / ESTIMADOS")}</span></div>
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

      <DevelopmentEvidence language={language}/>
      <section className={s.processShowcase} id="trayectoria" aria-labelledby="process-title">
        <div><p className={s.processKicker}>03 / FROM INTENT TO EVIDENCE</p><h2 id="process-title">{t("Así convierto una idea en algo demostrable.","How I turn an idea into demonstrable work.","Von der Idee zum nachweisbaren Ergebnis.","De l’idée au résultat vérifiable.","Da ideia ao trabalho demonstrável.")}</h2><p>{t("Un proceso iterativo: comprender, definir, construir, verificar y documentar. Uso IA para apoyar el trabajo y reviso lo que produce.","An iterative process: understand, define, build, verify and document. AI supports the work, and I review its output.","Verstehen, planen, bauen, prüfen und dokumentieren – mit überprüfter KI-Unterstützung.","Comprendre, définir, construire, vérifier et documenter avec une assistance IA relue.","Entender, definir, construir, verificar e documentar com apoio de IA revisado.")}</p></div>
        <ol className={s.processCards}>{steps.map((step,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><strong>{step.a}</strong><p>{step.b}</p></li>)}</ol>
      </section>

      <section className={s.contact} id="contacto" aria-labelledby="contact-title">
        <div className={s.contactLeft}><div className={s.contactArtwork} aria-hidden="true"><span className={s.screen}>NEXUS <small>AI WORKSPACE</small><b>{t("Soluciones reales.","Real solutions.","Echte Lösungen.","Solutions concrètes.","Soluções reais.")}</b></span></div><p className={s.contactOverline}>{t("HABLEMOS","LET'S TALK","SPRECHEN WIR","PARLONS","VAMOS CONVERSAR")}</p><h2 id="contact-title">{t("TRABAJEMOS","LET'S WORK","ARBEITEN WIR","TRAVAILLONS","VAMOS TRABALHAR")} <span>{t("JUNTOS","TOGETHER","ZUSAMMEN","ENSEMBLE","JUNTOS")}</span> <i>✦</i></h2><p className={s.contactText}>{t("Estoy abierto a oportunidades de desarrollador junior y colaboraciones. Puedes escribirme o preguntarle a Nexus sobre mis proyectos.","I'm open to junior developer opportunities and collaborations. Email me or ask Nexus about my work.","Ich bin offen für Junior-Stellen und Zusammenarbeit. Schreib mir oder frage Nexus nach meinen Projekten.","Je suis ouvert aux postes juniors et collaborations. Écrivez-moi ou interrogez Nexus sur mon travail.","Estou aberto a vagas júnior e colaborações. Envie um e-mail ou pergunte ao Nexus sobre meu trabalho.")}</p><a href={"mailto:"+professionalProfile.email} className={s.contactCTA}><ContactIcon name="email"/> {t("Enviar correo","Send email","E-Mail senden","Envoyer un e-mail","Enviar e-mail")} <span>→</span></a><div className={s.directContact}><a href={"mailto:"+professionalProfile.email}><ContactIcon name="email"/>{professionalProfile.email}</a><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(professionalProfile.email);setContactFeedback(t("Correo copiado","Email copied","E-Mail kopiert","E-mail copié","E-mail copiado"));}catch{setContactFeedback(t("Abre el enlace de correo para contactar.","Use the email link to contact me.","Nutze den E-Mail-Link.","Utilisez le lien e-mail.","Use o link de e-mail."));}}}>{t("Copiar correo","Copy email","E-Mail kopieren","Copier l’e-mail","Copiar e-mail")}</button><span role="status">{contactFeedback}</span></div><div className={s.socials}><a href={professionalProfile.github} target="_blank" rel="noopener noreferrer"><ContactIcon name="github"/>GitHub <span aria-hidden="true">→</span></a><a href={professionalProfile.linkedin} target="_blank" rel="noopener noreferrer"><ContactIcon name="linkedin"/>LinkedIn <span aria-hidden="true">→</span></a><a href={professionalProfile.instagram} target="_blank" rel="noopener noreferrer"><ContactIcon name="instagram"/>Instagram <span aria-hidden="true">→</span></a></div><p className={s.location}>{professionalProfile.location}</p></div>
        <div className={s.contactRight}><div className={s.contactTitle}><b><span className={s.live}/> NEXUS / {t("CONTACTO","CONTACT","KONTAKT","CONTACT","CONTATO")}</b><span>{t("GUÍA DE MI PORTAFOLIO","PORTFOLIO GUIDE","PORTFOLIO-HILFE","GUIDE PORTFOLIO","GUIA DO PORTFÓLIO")}</span></div><PortfolioContactChat language={language}/></div>
      </section>
      <footer className={s.footer}><span>© {new Date().getFullYear()} NEXUS · Joshua Vallejo Sanchez</span><a href="#inicio">{t("VOLVER ARRIBA","BACK TO TOP","NACH OBEN","RETOUR EN HAUT","VOLTAR AO TOPO")} ↑</a></footer>
    </main>
    <PortfolioCompanion language={language}/>
  </div>;
}
