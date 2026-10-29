"use client";

import {useMemo,useState} from "react";
import type {SiteLanguage} from "../../data/site-languages";
import {analyzeFactoryRequest,factoryBriefMarkdown,FACTORY_ROLES} from "../../lib/nexus-factory-engine.mjs";

type Props={request:string;kind:string;language:SiteLanguage};
type Labels={
 eyebrow:string;title:string;description:string;empty:string;valid:string;scope:string;risk:string;standard:string;moderate:string;elevated:string;
 flags:string;roles:string;skills:string;gates:string;criteria:string;export:string;noRun:string;noAi:string;approval:string;selected:string;
};
const copy:Record<SiteLanguage,Labels>={
 es:{eyebrow:"NEXUS FACTORY / CONTROL DE ESPECIFICACIONES",title:"Antes de construir, entendamos el trabajo.",description:"El coordinador determinista clasifica la solicitud y recomienda procedimientos verificables. No son agentes ejecutándose.",empty:"Describe una solicitud de 10 a 500 caracteres para preparar el análisis.",valid:"BORRADOR REVISABLE",scope:"ALCANCE",risk:"RIESGO",standard:"Estándar",moderate:"Moderado",elevated:"Elevado",flags:"Áreas que requieren revisión",roles:"Roles del flujo",skills:"Procedimientos recomendados",gates:"Puntos de control",criteria:"Criterios de aceptación",export:"Descargar especificación .md",noRun:"Sin ejecución",noAi:"Sin modelo externo",approval:"Aprobación humana",selected:"Rol seleccionado"},
 en:{eyebrow:"NEXUS FACTORY / SPEC CONTROL",title:"Understand the work before building.",description:"The deterministic coordinator classifies your request and recommends verifiable procedures. These are not running agents.",empty:"Describe a request in 10 to 500 characters to prepare the analysis.",valid:"REVIEWABLE DRAFT",scope:"SCOPE",risk:"RISK",standard:"Standard",moderate:"Moderate",elevated:"Elevated",flags:"Areas to review",roles:"Workflow roles",skills:"Recommended procedures",gates:"Review checkpoints",criteria:"Acceptance criteria",export:"Download specification .md",noRun:"No execution",noAi:"No external model",approval:"Human approval",selected:"Selected role"},
 de:{eyebrow:"NEXUS FACTORY / SPEZIFIKATION",title:"Erst verstehen, dann bauen.",description:"Deterministische Einstufung und prüfbare Verfahren. Es laufen keine Agenten.",empty:"Beschreibe einen Auftrag mit 10 bis 500 Zeichen.",valid:"PRÜFBARER ENTWURF",scope:"UMFANG",risk:"RISIKO",standard:"Standard",moderate:"Mittel",elevated:"Hoch",flags:"Zu prüfende Bereiche",roles:"Ablaufrollen",skills:"Empfohlene Verfahren",gates:"Kontrollpunkte",criteria:"Akzeptanzkriterien",export:"Spezifikation .md speichern",noRun:"Keine Ausführung",noAi:"Kein externes Modell",approval:"Menschliche Freigabe",selected:"Gewählte Rolle"},
 fr:{eyebrow:"NEXUS FACTORY / SPÉCIFICATION",title:"Comprendre avant de construire.",description:"Le coordinateur déterministe suggère des procédures vérifiables. Aucun agent n'est en cours.",empty:"Décrivez une demande de 10 à 500 caractères.",valid:"BROUILLON À VALIDER",scope:"PORTÉE",risk:"RISQUE",standard:"Standard",moderate:"Modéré",elevated:"Élevé",flags:"Domaines à vérifier",roles:"Rôles du flux",skills:"Procédures recommandées",gates:"Points de contrôle",criteria:"Critères d'acceptation",export:"Exporter la spécification .md",noRun:"Aucune exécution",noAi:"Sans modèle externe",approval:"Validation humaine",selected:"Rôle sélectionné"},
 pt:{eyebrow:"NEXUS FACTORY / ESPECIFICAÇÃO",title:"Entenda antes de construir.",description:"O coordenador determinístico recomenda procedimentos verificáveis. Nenhum agente está em execução.",empty:"Descreva um pedido de 10 a 500 caracteres.",valid:"RASCUNHO REVISÁVEL",scope:"ESCOPO",risk:"RISCO",standard:"Padrão",moderate:"Moderado",elevated:"Alto",flags:"Áreas para revisão",roles:"Papéis do fluxo",skills:"Procedimentos recomendados",gates:"Pontos de controle",criteria:"Critérios de aceitação",export:"Baixar especificação .md",noRun:"Sem execução",noAi:"Sem modelo externo",approval:"Aprovação humana",selected:"Papel selecionado"},
};
const roleNames:Record<SiteLanguage,Record<string,string>>={
 es:{triage:"Clasificación",spec:"Arquitectura",build:"Construcción",qa:"Calidad",review:"Revisión"},
 en:{triage:"Triage",spec:"Specification",build:"Builder",qa:"Quality",review:"Reviewer"},
 de:{triage:"Einstufung",spec:"Spezifikation",build:"Bauen",qa:"Qualität",review:"Review"},
 fr:{triage:"Qualification",spec:"Spécification",build:"Construction",qa:"Qualité",review:"Relecture"},
 pt:{triage:"Triagem",spec:"Especificação",build:"Construção",qa:"Qualidade",review:"Revisão"},
};
const roleDetails:Record<SiteLanguage,Record<string,string>>={
 es:{triage:"Clasifica la solicitud y detecta condiciones de riesgo.",spec:"Define requisitos y criterios comprobables.",build:"Solo implementaría cambios tras una aprobación válida.",qa:"Contrasta resultados con pruebas y evidencia real.",review:"Revisa código y seguridad antes de entregar a una persona."},
 en:{triage:"Classifies the request and identifies risk.",spec:"Defines requirements and testable criteria.",build:"Would only implement after valid human approval.",qa:"Compares results against real evidence and checks.",review:"Inspects code and safety before human handoff."},
 de:{triage:"Klassifiziert Arbeit und Risiken.",spec:"Definiert prüfbare Anforderungen.",build:"Umsetzung erst nach Freigabe.",qa:"Prüft echte Nachweise.",review:"Kontrolliert Code und Sicherheit."},
 fr:{triage:"Classe la demande et ses risques.",spec:"Définit les exigences vérifiables.",build:"Implémentation seulement après validation.",qa:"Vérifie les preuves réelles.",review:"Vérifie le code et la sécurité."},
 pt:{triage:"Classifica o pedido e os riscos.",spec:"Define requisitos testáveis.",build:"Implementa apenas após aprovação.",qa:"Compara resultados com evidências.",review:"Revisa código e segurança."},
};
function saveMarkdown(markdown:string){
 const blob=new Blob([markdown],{type:"text/markdown;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const link=document.createElement("a");
 link.href=url;link.download="nexus-factory-spec.md";link.click();
 URL.revokeObjectURL(url);
}
export default function NexusFactoryIntake({request,kind,language}:Props){
 const t=copy[language];
 const brief=useMemo(()=>analyzeFactoryRequest(request,kind),[request,kind]);
 const [role,setRole]=useState("triage");
 const roleData=FACTORY_ROLES.find((x:{id:string})=>x.id===role)||FACTORY_ROLES[0];
 return <section className="factory-intake" aria-label="Nexus Factory specification workspace">
  <header className="factory-intake-head">
   <div><span className="factory-intake-eyebrow">✳ {t.eyebrow}</span><h3>{t.title}</h3><p>{t.description}</p></div>
   <div className="factory-intake-assurances"><span>◧ {t.approval}</span><span>⌁ {t.noAi}</span><span>◇ {t.noRun}</span></div>
  </header>
  {brief?<div className="factory-intake-body">
   <div className="factory-intake-summary"><span className="factory-intake-ready"><i aria-hidden="true"/> {t.valid}</span><span>{t.scope}: <b>{brief.kind.toUpperCase()}</b></span><span>{t.risk}: <b data-risk={brief.risk}>{brief.risk==="elevated"?t.elevated:brief.risk==="moderate"?t.moderate:t.standard}</b></span></div>
   <div className="factory-intake-grid">
    <section className="factory-intake-roles" aria-label={t.roles}>
     <h4>{t.roles}</h4>
     <div className="factory-intake-role-tabs">{FACTORY_ROLES.map((item:{id:string},i:number)=><button type="button" key={item.id} aria-pressed={role===item.id} onClick={()=>setRole(item.id)}><span>{String(i+1).padStart(2,"0")}</span>{roleNames[language][item.id]}</button>)}</div>
     <div className="factory-intake-role-description" aria-live="polite"><small>{t.selected.toUpperCase()} / {roleData.id.toUpperCase()}</small><strong>{roleNames[language][roleData.id]}</strong><p>{roleDetails[language][roleData.id]}</p></div>
    </section>
    <section className="factory-intake-skills" aria-label={t.skills}>
     <h4>{t.skills}</h4>
     <div className="factory-intake-skill-list">{brief.skills.map((skill:{id:string;title:string;description:string;source:string})=><div key={skill.id}><span className="factory-intake-skill-mark" aria-hidden="true">✓</span><div><strong>{skill.title}</strong><p>{skill.description}</p><small>{skill.source}</small></div></div>)}</div>
     {brief.riskFlags.length>0&&<div className="factory-intake-risk"><strong>{t.flags}</strong><ul>{brief.riskFlags.map((flag:string)=><li key={flag}>{flag}</li>)}</ul></div>}
    </section>
   </div>
   <details className="factory-intake-details"><summary>{t.criteria} <span>{brief.acceptance.length}</span></summary><ul>{brief.acceptance.map((item:string)=><li key={item}>{item}</li>)}</ul></details>
   <div className="factory-intake-actions"><span>{brief.gates.length} {t.gates.toLowerCase()} · {t.approval}</span><button type="button" onClick={()=>{const md=factoryBriefMarkdown(brief);if(md)saveMarkdown(md);}}>{t.export} <span aria-hidden="true">↘</span></button></div>
  </div>:<div className="factory-intake-empty"><span aria-hidden="true">⌑</span><p>{t.empty}</p></div>}
 </section>;
}
