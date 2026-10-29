import type {Metadata} from "next";
import Link from "next/link";
import {certifications,totalTrainingHours} from "../../data/certifications";
import {professionalProfile as profile} from "../../data/profile";
import {resumeCopy,type ResumeLang} from "../../data/resume-copy";
import {siteLanguages,isSiteLanguage,cvDownloadPath,cvDownloadLabels,portfolioPath} from "../../data/site-languages";
import {skillEvidence,proficiency,skillRatingCopy} from "../../data/professional-development";
import styles from "./Resume.module.css";

export const metadata:Metadata={
  title:"Joshua Vallejo Sanchez | Curriculum vitae",
  description:"Currículum profesional de desarrollador web junior: proyectos verificables, formación documentada y contacto.",
};



export default async function ResumePage({searchParams}:{searchParams:Promise<{lang?:string}>}){
  const {lang}=await searchParams;
  const language:ResumeLang=lang&&isSiteLanguage(lang)?lang:"es";
  const copy=resumeCopy[language];
  const ratings=skillRatingCopy[language];
  const t=(es:string,en:string,de:string,fr:string,pt:string)=>({es,en,de,fr,pt})[language];
  const sortedTraining=[...certifications].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
  return <main className={styles.resumePage} lang={language}>
    <article className={styles.sheet} id="resume-print-sheet">
      <nav className={styles.minimalControls} aria-label={t("Opciones del CV","Resume controls","Lebenslauf-Optionen","Options du CV","Opções do currículo")}>
        <details className={styles.langPicker}>
          <summary aria-label={t("Cambiar idioma","Change language","Sprache ändern","Changer de langue","Alterar idioma")}>{language.toUpperCase()} <span aria-hidden="true">⌄</span></summary>
          <div className={styles.langMenu}>
            {siteLanguages.map(x=><Link key={x.code} href={"/resume?lang="+x.code} lang={x.code} hrefLang={x.code} aria-current={x.code===language?"page":undefined}>{x.nativeName}</Link>)}
          </div>
        </details>
        <Link className={styles.backButton} href={portfolioPath(language)}>← {t("Volver al portafolio","Back to portfolio","Zum Portfolio zurück","Retour au portfolio","Voltar ao portfólio")}</Link>
      </nav>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>{t("CURRÍCULUM VITAE","CURRICULUM VITAE","LEBENSLAUF","CURRICULUM VITAE","CURRÍCULO")}</p>
          <h1 className={styles.name}><span>JOSHUA</span><span>VALLEJO</span><em>SANCHEZ</em></h1>
          <p className={styles.role}>{copy.role}</p>
          <p className={styles.summary}>{copy.summary}</p>
          <div className={styles.pillRow}>
            <a className={styles.pill} href={"mailto:"+profile.email}>✉ {profile.email}</a>
            <a className={styles.pill} href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            {profile.linkedin&&<a className={styles.pill} href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
          </div>
          <p className={styles.location}>⌖ {t("Pensilvania, EE. UU.","Pennsylvania, USA","Pennsylvania, USA","Pennsylvanie, États-Unis","Pensilvânia, EUA")}</p>
        </div>

        <div className={styles.heroPhoto} role="img" aria-label={t("Retrato del desarrollador del portafolio original","Portrait from the developer's previous portfolio","Porträt aus dem früheren Portfolio","Portrait du portfolio précédent","Retrato do portfólio anterior")}>
          <div className={styles.heroLinks}>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            {profile.linkedin&&<a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
          </div>
        </div>

        <aside className={styles.heroAside} aria-label={t("Información del CV","Resume details","Lebenslaufdetails","Détails du CV","Detalhes do currículo")}>
          <div className={styles.stats}>
            <div className={styles.stat}><strong>{totalTrainingHours}<small>h</small></strong><span>{t("Formación documentada","Documented training","Dokumentierte Weiterbildung","Formation documentée","Formação documentada")}</span></div>
            <div className={styles.stat}><strong>11</strong><span>{t("Repositorios revisados","Repositories reviewed","Geprüfte Repositories","Dépôts examinés","Repositórios revisados")}</span></div>
            <div className={styles.stat}><strong>{String(certifications.length).padStart(2,"0")}</strong><span>{t("Certificados y constancias","Training records","Zertifikate und Nachweise","Certificats et attestations","Certificados e comprovantes")}</span></div>
          </div>
          <a className={styles.cta} href={cvDownloadPath(language)} download>{cvDownloadLabels[language]} <span>↗</span></a>
        </aside>
      </header>

      <div className={styles.topCards}>
        <section className={styles.infoCard} aria-labelledby="profile-heading"><h2 id="profile-heading" className={styles.cardHeader}><span>♧</span>{copy.headings.profile}</h2><p>{copy.summary}</p></section>
        <section className={styles.infoCard} aria-labelledby="goal-heading"><h2 id="goal-heading" className={styles.cardHeader}><span>◎</span>{t("OBJETIVO PROFESIONAL","CAREER GOAL","BERUFSZIEL","OBJECTIF PROFESSIONNEL","OBJETIVO PROFISSIONAL")}</h2><p>{t("Conseguir mi primera oportunidad en desarrollo web o frontend y contribuir con proyectos verificables, disciplina y aprendizaje continuo.","Earn my first web or frontend developer role, contributing documented projects, reliable execution and continuous learning.","Meine erste Stelle in der Web- oder Frontend-Entwicklung finden und mit nachweisbaren Projekten und kontinuierlichem Lernen beitragen.","Obtenir mon premier poste en développement web ou frontend en apportant des projets vérifiables et un apprentissage continu.","Conquistar minha primeira vaga em desenvolvimento web ou frontend, contribuindo com projetos verificáveis e aprendizado contínuo.")}</p></section>
        <section className={styles.infoCard} aria-labelledby="available-heading"><h2 id="available-heading" className={styles.cardHeader}><span>▣</span>{t("DISPONIBILIDAD","AVAILABILITY","VERFÜGBARKEIT","DISPONIBILITÉ","DISPONIBILIDADE")}</h2><p>{t("Abierto a oportunidades junior y conversaciones con equipos de tecnología.","Open to junior opportunities and discussions with engineering teams.","Offen für Junior-Stellen und Gespräche mit Entwicklungsteams.","Ouvert aux postes juniors et aux échanges avec des équipes techniques.","Aberto a oportunidades júnior e conversas com equipes de tecnologia.")}</p><div className={styles.avail}><span className={styles.dot}/>{t("Disponible para entrevistas","Available for interviews","Für Gespräche verfügbar","Disponible pour des entretiens","Disponível para entrevistas")}</div></section>
      </div>

      <div className={styles.columns}>
        <section className={styles.block} aria-labelledby="experience-heading">
          <h2 className={styles.blockHeading} id="experience-heading"><span>♧</span>{copy.headings.experience}</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}><span className={styles.year}>{t("Actual","Current","Aktuell","Actuel","Atual")}</span><strong>{t("Proyectos personales de software","Personal software projects","Eigene Softwareprojekte","Projets logiciels personnels","Projetos pessoais de software")}</strong><p>{t("Nexus AI, Task Tracker y Hangman: desarrollo, revisión de código y pruebas documentadas.","Nexus AI, Task Tracker and Hangman: development, code review and documented tests.","Nexus AI, Task Tracker und Hangman: Entwicklung, Codeprüfung und dokumentierte Tests.","Nexus AI, Task Tracker et Hangman : développement, revue de code et tests documentés.","Nexus AI, Task Tracker e Hangman: desenvolvimento, revisão de código e testes documentados.")}</p></div>
            <div className={styles.timelineItem}><span className={styles.year}>{t("Previo","Prior","Früher","Avant","Anterior")}</span><strong>{t("Sector floral, supervisión de supermercado y hotelería","Floral sector, supermarket supervision and hospitality","Blumenbranche, Supermarktaufsicht und Hotelgewerbe","Secteur floral, supervision de supermarché et hôtellerie","Setor floral, supervisão de supermercado e hotelaria")}</strong><p>{copy.experience}</p></div>
          </div>
          <p className={styles.note}>{t("Los proyectos son experiencia práctica de aprendizaje; no son puestos profesionales de desarrollo.","Projects demonstrate practical learning; they are not paid developer positions.","Projekte belegen praktische Lernarbeit, keine bezahlten Entwicklerstellen.","Les projets prouvent la pratique, pas des emplois rémunérés en développement.","Projetos demonstram prática, não empregos remunerados em desenvolvimento.")}</p>
        </section>
        <section className={styles.block} aria-labelledby="training-heading">
          <h2 className={styles.blockHeading} id="training-heading"><span>▢</span>{copy.headings.training}</h2>
          <ul className={styles.learning}>{sortedTraining.map(c=><li key={c.id}><b>{new Date(c.date).getFullYear()}</b><div><strong>{c.title}</strong><small>{c.issuer} · {c.hours} h · {c.credentialType==="Course completion"?copy.completedLabel:copy.attendanceLabel}</small></div></li>)}</ul>
          <p className={styles.note}>{copy.trainingNote}</p>
          <Link className={styles.actionLink} href={portfolioPath(language)+"#proyectos"}>{t("Ver proyectos y evidencia","View project evidence","Projektnachweise ansehen","Voir les projets","Ver evidências dos projetos")} ↗</Link>
        </section>
      </div>

      <div className={styles.bottom}>
        <section className={styles.block} aria-labelledby="projects-heading"><h2 className={styles.blockHeading} id="projects-heading"><span>▣</span>{copy.headings.projects}</h2>
          {copy.projects.map((item,i)=><a className={styles.projectItem} href={item.url} key={item.name} target="_blank" rel="noopener noreferrer"><span className={styles.projectNumber}>{String(i+1).padStart(2,"0")}</span><span><strong>{item.name}</strong><small>{item.stack} · {item.summary}</small></span><span className={styles.arrow}>↗</span></a>)}
        </section>
        <section className={styles.block} aria-labelledby="skills-heading"><h2 className={styles.blockHeading} id="skills-heading"><span>✧</span>{copy.headings.skills}</h2>
          <div className={styles.ratedSkills}>{skillEvidence.map(skill=><div className={styles.ratedSkill} key={skill.id}>
            <strong>{skill.name}</strong>
            {([{label:ratings.usage,value:skill.projects},{label:ratings.knowledge,value:proficiency[skill.id]??0}]).map(rating=><div className={styles.ratingRow} key={rating.label}>
              <span>{rating.label}</span><span className={styles.ratingDots} aria-label={`${rating.label}: ${rating.value}/5`}>
                {Array.from({length:5},(_,i)=><i key={i} aria-hidden="true" data-filled={i<rating.value}/>)}
              </span><small aria-hidden="true">{rating.value}/5</small>
            </div>)}
          </div>)}</div>
          <p className={styles.note}>{ratings.note}</p>
          {copy.skillGroups.map(group=><p key={group.title} className={styles.subtle}><strong>{group.title}:</strong> {group.items}</p>)}
        </section>
      </div>
      <div className={styles.bottom}>
        <section className={styles.block}><h2 className={styles.blockHeading}><span>✳</span>{copy.headings.research}</h2><p className={styles.subtle}>{copy.research}</p></section>
        <section className={styles.block}><h2 className={styles.blockHeading}><span>◎</span>{copy.headings.languages}</h2><p className={styles.subtle}>{copy.languages}</p><p className={styles.email}>✉ <a href={"mailto:"+profile.email}>{profile.email}</a></p></section>
      </div>
      <footer className={styles.foot}>© {new Date().getFullYear()} {profile.name} · {t("Información de proyectos y formación verificable. El motor Nexus Foundation sigue siendo experimental.","Documented projects and training. Nexus Foundation remains experimental.","Dokumentierte Projekte und Kurse. Nexus Foundation bleibt experimentell.","Projets et formations documentés. Nexus Foundation reste expérimental.","Projetos e formação documentados. Nexus Foundation continua experimental.")} · <a href={profile.github}>GitHub ↗</a></footer>
    </article>
  </main>;
}