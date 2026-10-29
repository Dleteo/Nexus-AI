import type {SiteLanguage} from "../../data/site-languages";

type Counts={proposed:number;approved:number;built:number;passedStaticQa:number};
type Stage={id:string;number:string;title:string;description:string;count:number;tag:string};
const copy:Record<SiteLanguage,{
 kicker:string;title:string;description:string;review:string;template:string;qa:string;export:string;
 proposed:string;approved:string;built:string;passed:string;needsReview:string;staticOnly:string;
 ready:string;offline:string;execution:string;modeLocal:string;modeBrowser:string;footer:string;
}> = {
 es:{kicker:"CENTRO DE OPERACIONES / WORKFLOW",title:"De una idea a un entregable revisable.",description:"Cuatro estaciones, controles humanos y evidencia verificable. Los contadores muestran únicamente trabajos reales de esta sesión local.",review:"Planificación",template:"Aprobación humana",qa:"Paquete estático",export:"QA de archivos",proposed:"Propuestos",approved:"Aprobados",built:"Empaquetados",passed:"QA aprobada",needsReview:"Revisión requerida",staticOnly:"Plantilla fija",ready:"Sin trabajos aún",offline:"Planificador de navegador",execution:"EJECUCIÓN DE CÓDIGO DESACTIVADA",modeLocal:"MODO LOCAL / SQLITE",modeBrowser:"MODO NAVEGADOR",footer:"La QA verifica la estructura del paquete, no ejecuta el código ni garantiza producción."},
 en:{kicker:"OPERATIONS CENTER / WORKFLOW",title:"From an idea to a reviewable deliverable.",description:"Four stations, human approvals and inspectable evidence. Counts reflect actual local jobs, never fabricated throughput.",review:"Planning",template:"Human approval",qa:"Static package",export:"File QA",proposed:"Proposed",approved:"Approved",built:"Packaged",passed:"QA passed",needsReview:"Review required",staticOnly:"Fixed template",ready:"No jobs yet",offline:"Browser planner",execution:"CODE EXECUTION DISABLED",modeLocal:"LOCAL / SQLITE",modeBrowser:"BROWSER MODE",footer:"QA validates package files; it does not run the code or certify a production deployment."},
 de:{kicker:"BETRIEBSZENTRALE / WORKFLOW",title:"Von der Idee zum überprüfbaren Paket.",description:"Vier Stationen, menschliche Freigaben und prüfbare Ergebnisse. Angezeigt werden nur echte lokale Aufträge.",review:"Planung",template:"Freigabe",qa:"Statisches Paket",export:"Datei-QA",proposed:"Vorgeschlagen",approved:"Freigegeben",built:"Pakete",passed:"QA bestanden",needsReview:"Prüfung nötig",staticOnly:"Feste Vorlage",ready:"Noch keine Aufträge",offline:"Browser-Planung",execution:"CODEAUSFÜHRUNG DEAKTIVIERT",modeLocal:"LOKAL / SQLITE",modeBrowser:"BROWSER-MODUS",footer:"QA prüft Paketdateien, führt jedoch keinen Code aus und bestätigt keine Produktionsreife."},
 fr:{kicker:"CENTRE D'OPÉRATIONS / WORKFLOW",title:"De l'idée au livrable vérifiable.",description:"Quatre étapes, validation humaine et preuves consultables. Les compteurs n'affichent que les tâches réelles.",review:"Planification",template:"Validation humaine",qa:"Paquet statique",export:"QA des fichiers",proposed:"Proposés",approved:"Approuvés",built:"Paquets",passed:"QA réussie",needsReview:"Revue requise",staticOnly:"Modèle fixe",ready:"Aucune tâche",offline:"Planificateur navigateur",execution:"EXÉCUTION DU CODE DÉSACTIVÉE",modeLocal:"LOCAL / SQLITE",modeBrowser:"MODE NAVIGATEUR",footer:"La QA vérifie les fichiers sans exécuter le code ni garantir un déploiement."},
 pt:{kicker:"CENTRO DE OPERAÇÕES / WORKFLOW",title:"Da ideia ao pacote revisável.",description:"Quatro etapas, aprovação humana e evidências verificáveis. Os números mostram apenas trabalhos locais reais.",review:"Planejamento",template:"Aprovação humana",qa:"Pacote estático",export:"QA de arquivos",proposed:"Propostos",approved:"Aprovados",built:"Pacotes",passed:"QA aprovada",needsReview:"Revisão necessária",staticOnly:"Modelo fixo",ready:"Sem trabalhos",offline:"Planejador no navegador",execution:"EXECUÇÃO DE CÓDIGO DESATIVADA",modeLocal:"LOCAL / SQLITE",modeBrowser:"MODO NAVEGADOR",footer:"A QA verifica arquivos e não executa o código nem garante implantação em produção."},
};
export default function FactoryWorkflowBoard({language,counts,localMode}:{language:SiteLanguage;counts:Counts;localMode:boolean}){
 const t=copy[language];
 const stages:Stage[]=[
  {id:"plan",number:"01",title:t.review,description:t.needsReview,count:localMode?counts.proposed:0,tag:t.proposed},
  {id:"approve",number:"02",title:t.template,description:t.needsReview,count:localMode?counts.approved:0,tag:t.approved},
  {id:"build",number:"03",title:t.qa,description:t.staticOnly,count:localMode?counts.built:0,tag:t.built},
  {id:"verify",number:"04",title:t.export,description:t.staticOnly,count:localMode?counts.passedStaticQa:0,tag:t.passed}
 ];
 return <section className="factory-operations-board" aria-label="Factory workflow status" data-factory-mode={localMode?"local":"browser"}>
  <header className="factory-operations-head">
    <div><span className="factory-operations-overline"><span aria-hidden="true">◈</span> {t.kicker}</span><h2>{t.title}</h2><p>{t.description}</p></div>
    <div className="factory-operations-flags"><span className="factory-operations-mode">{localMode?t.modeLocal:t.modeBrowser}</span><span className="factory-operations-lock"><span aria-hidden="true">◧</span> {t.execution}</span></div>
  </header>
  <div className="factory-operations-track">
   {stages.map((stage,index)=><div className="factory-operations-stage" key={stage.id} data-stage={stage.id}>
    <div className="factory-operations-stage-top"><span className="factory-operations-stage-number">{stage.number}</span><span className="factory-operations-stage-glyph" aria-hidden="true">{["⌑","◇","▣","✓"][index]}</span></div>
    <h3>{stage.title}</h3><p>{stage.description}</p>
    <div className="factory-operations-stage-foot"><strong>{localMode?stage.count:"—"}</strong><span>{localMode?stage.tag:t.offline}</span></div>
   </div>)}
  </div>
  <footer className="factory-operations-foot"><span><i aria-hidden="true"/> {localMode?counts.proposed+counts.approved+counts.built===0?t.ready:t.modeLocal:t.modeBrowser}</span><small>{t.footer}</small></footer>
 </section>;
}
