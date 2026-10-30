import {certifications} from "../../data/certifications";
import type {SiteLanguage} from "../../data/site-languages";
import styles from "./CareerHome.module.css";

export default function CareerProcessStrip({language}:{language:SiteLanguage}) {
  const t=(es:string,en:string,de:string,fr:string,pt:string)=>({es,en,de,fr,pt})[language];
  const skills=[
    "HTML / CSS","JavaScript","TypeScript","React","Next.js",
    "Python","Supabase","Git / GitHub","Automated tests","Responsive UI",
  ];
  const steps=[
    {
      name:t("ENTENDER","DISCOVER","VERSTEHEN","COMPRENDRE","ENTENDER"),
      detail:t("Definir el problema y documentar lo que necesita el usuario.","Define the problem and document user needs.","Das Problem und die Nutzeranforderungen dokumentieren.","Définir le problème et les besoins des utilisateurs.","Definir o problema e documentar as necessidades do usuário."),
    },
    {
      name:t("PLANIFICAR","PLAN","PLANEN","PLANIFIER","PLANEJAR"),
      detail:t("Dividir el objetivo en tareas y elegir herramientas adecuadas.","Break the goal into tasks and select appropriate tools.","Das Ziel in Aufgaben aufteilen und passende Werkzeuge wählen.","Découper l'objectif en tâches et choisir les bons outils.","Dividir o objetivo em tarefas e escolher ferramentas adequadas."),
    },
    {
      name:t("CONSTRUIR","BUILD","ENTWICKELN","CONSTRUIRE","CONSTRUIR"),
      detail:t("Crear interfaces y componentes con código versionado.","Build interfaces and components with version-controlled code.","Oberflächen und Komponenten mit versioniertem Code erstellen.","Créer des interfaces et composants avec du code versionné.","Criar interfaces e componentes com código versionado."),
    },
    {
      name:t("COMPROBAR","VERIFY","PRÜFEN","VÉRIFIER","VERIFICAR"),
      detail:t("Probar, revisar límites y documentar los resultados.","Test, review limitations and document the results.","Testen, Grenzen prüfen und Ergebnisse dokumentieren.","Tester, vérifier les limites et documenter les résultats.","Testar, revisar limitações e documentar os resultados."),
    },
  ];
  return <div className={styles.processStrip}>
    <article className={styles.processColumn}>
      <h3>{t("EDUCACIÓN Y FORMACIÓN","EDUCATION & TRAINING","AUSBILDUNG & KURSE","FORMATION","EDUCAÇÃO E FORMAÇÃO")} <span aria-hidden="true">✦</span></h3>
      <p className={styles.processIntro}>{t("Certificados y asistencia documentados.","Documented certificates and attendance.","Dokumentierte Zertifikate und Teilnahmen.","Certificats et attestations documentés.","Certificados e presença documentados.")}</p>
      <div className={styles.processEducation}>
        {certifications.slice(0,4).map(item=><div key={item.id}>
          <span>{item.hours} h</span>
          <div><strong>{item.title}</strong><small>{item.issuer}</small></div>
        </div>)}
      </div>
      <a href="#certificados">{t("Ver registros y certificados","View records and certificates","Nachweise ansehen","Voir les certificats","Ver certificados")} ↗</a>
    </article>
    <article className={styles.processColumn}>
      <h3>{t("HABILIDADES","SKILLS","KENNTNISSE","COMPÉTENCES","HABILIDADES")} <span aria-hidden="true">✦</span></h3>
      <p className={styles.processIntro}>{t("Herramientas practicadas o integradas en proyectos.","Tools practiced or integrated into projects.","In Projekten verwendete oder geübte Werkzeuge.","Outils pratiqués ou intégrés aux projets.","Ferramentas praticadas ou integradas em projetos.")}</p>
      <div className={styles.processSkillTags}>{skills.map(name=><span key={name}>{name}</span>)}</div>
      <p className={styles.processCaution}>{t("La experiencia directa y la integración asistida se documentan por separado.","Direct experience and AI-assisted integration are documented separately.","Eigene Praxis und KI-gestützte Integration werden getrennt ausgewiesen.","La pratique directe et l'intégration assistée sont distinguées.","Prática direta e integração assistida são documentadas separadamente.")}</p>
    </article>
    <article className={styles.processColumn}>
      <h3>{t("MI PROCESO","MY PROCESS","MEIN PROZESS","MON PROCESSUS","MEU PROCESSO")} <span aria-hidden="true">✦</span></h3>
      <p className={styles.processIntro}>{t("Cómo abordo los proyectos personales.","How I approach personal projects.","Wie ich eigene Projekte umsetze.","Ma méthode pour les projets personnels.","Como trabalho em projetos pessoais.")}</p>
      <ol className={styles.processSteps}>{steps.map((step,index)=><li key={step.name}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{step.name}</strong><p>{step.detail}</p></div></li>)}</ol>
    </article>
  </div>;
}
