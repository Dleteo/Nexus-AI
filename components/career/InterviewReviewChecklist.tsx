"use client";

import {useState} from "react";
import {buildInterviewPrepMarkdown} from "../../lib/interview-prep.mjs";
import type {CaseStudy} from "../../data/case-studies";
import type {SiteLanguage} from "../../data/site-languages";

type Labels = {heading:string;intro:string;tasks:[string,string,string,string];
  progress:string;download:string;reset:string;clarification:string};
const text:Record<SiteLanguage,Labels>={
  es:{
    heading:"Prepara cómo explicar este proyecto",
    intro:"Revisa estas cuatro partes y descarga tus apuntes para una entrevista. Marcar una casilla no ejecuta ninguna prueba.",
    tasks:["Puedo explicar qué problema resuelve","Puedo justificar una decisión de arquitectura","Revisé archivos de código o pruebas enlazadas","Puedo reconocer una limitación sin exagerar resultados"],
    progress:"partes revisadas",download:"Descargar notas de entrevista",reset:"Reiniciar revisión",
    clarification:"Es un registro personal de lectura, no una certificación de pruebas ni despliegue."
  },
  en:{
    heading:"Prepare to explain this project",
    intro:"Review these four aspects and download your interview notes. Checking a box does not run tests.",
    tasks:["I can explain the problem","I can justify an architecture decision","I reviewed linked source or test files","I can acknowledge a limitation without overstating results"],
    progress:"topics reviewed",download:"Download interview notes",reset:"Reset review",
    clarification:"This is a personal reading checklist, not proof of test execution or deployment."
  },
  de:{
    heading:"Dieses Projekt im Vorstellungsgespräch erklären",
    intro:"Vier Themen prüfen und Gesprächsnotizen herunterladen. Eine Auswahl führt keine Tests aus.",
    tasks:["Ich kann das Problem erläutern","Ich kann eine Architekturentscheidung begründen","Ich habe verlinkten Code oder Tests geprüft","Ich kann eine Grenze ohne Übertreibung erklären"],
    progress:"Themen geprüft",download:"Gesprächsnotizen herunterladen",reset:"Auswahl zurücksetzen",
    clarification:"Dies ist eine persönliche Checkliste, kein Nachweis für Tests oder Deployment."
  },
  fr:{
    heading:"Préparer la présentation de ce projet",
    intro:"Vérifiez quatre aspects et téléchargez vos notes. Cocher une case ne lance aucun test.",
    tasks:["Je peux expliquer le problème","Je peux justifier un choix d’architecture","J’ai consulté les fichiers de code ou tests liés","Je sais reconnaître une limite sans exagération"],
    progress:"sujets vérifiés",download:"Télécharger les notes d’entretien",reset:"Réinitialiser",
    clarification:"Cette liste de lecture n’atteste ni l’exécution de tests ni un déploiement."
  },
  pt:{
    heading:"Prepare-se para explicar este projeto",
    intro:"Revise quatro pontos e baixe as notas de entrevista. Marcar uma caixa não executa testes.",
    tasks:["Consigo explicar o problema","Consigo justificar uma decisão de arquitetura","Revisei arquivos de código ou testes vinculados","Consigo reconhecer uma limitação sem exagerar"],
    progress:"tópicos revisados",download:"Baixar notas de entrevista",reset:"Reiniciar revisão",
    clarification:"É uma lista pessoal de leitura, não prova de testes executados ou publicação."
  }
};

export default function InterviewReviewChecklist({study,language}:{study:CaseStudy;language:SiteLanguage}){
  const labels=text[language];
  const [checked,setChecked]=useState<boolean[]>([false,false,false,false]);
  function download(){
    const content=buildInterviewPrepMarkdown(study,labels.tasks,checked,language);
    const blob=new Blob([content],{type:"text/markdown;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="nexus-interview-"+study.slug+".md";
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section aria-label={labels.heading} className="mt-12 rounded-2xl border border-[#884457] bg-[#251a22] p-6 sm:p-8">
    <h2 className="text-2xl font-bold text-white">{labels.heading}</h2>
    <p className="mt-3 text-sm leading-7 text-slate-300">{labels.intro}</p>
    <fieldset className="mt-5 space-y-3">
      <legend className="sr-only">{labels.heading}</legend>
      {labels.tasks.map((task,index)=><label key={task} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#171217] p-4 text-sm leading-6 text-slate-100">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[#ed8797]" checked={checked[index]}
          onChange={event=>setChecked(previous=>previous.map((value,i)=>i===index?event.target.checked:value))}/>
        <span>{task}</span>
      </label>)}
    </fieldset>
    <p role="status" className="mt-5 text-sm font-semibold text-[#f4a3b6]">{checked.filter(Boolean).length}/4 {labels.progress}</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" onClick={download} className="rounded-lg bg-[#ed8797] px-5 py-3 text-sm font-bold text-[#190e14] hover:bg-[#ffb3c1] focus-visible:outline-2 focus-visible:outline-white">{labels.download}</button>
      <button type="button" onClick={()=>setChecked([false,false,false,false])}
        disabled={!checked.some(Boolean)} className="rounded-lg border border-[#a36678] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-[#eea1b3] disabled:opacity-40">{labels.reset}</button>
    </div>
    <p className="mt-4 text-xs leading-5 text-slate-400">{labels.clarification}</p>
  </section>;
}
