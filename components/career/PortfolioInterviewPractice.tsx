'use client';
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import type {SiteLanguage} from '@/data/site-languages';
import {getPortfolioInterviewExercises} from '@/data/portfolio-interview';
import {words} from './DevelopmentEvidence';
import s from './PortfolioCompanion.module.css';

export type InterviewPracticeState={index:number;answers:Record<string,{text:string;revealed:boolean;reviewed:boolean}>};
export default function PortfolioInterviewPractice({language,state,onChange}:{language:SiteLanguage;state:InterviewPracticeState;onChange:(next:InterviewPracticeState)=>void}){
 const t=(es:string,en:string,de:string,fr:string,pt:string)=>words(language,es,en,de,fr,pt);
 const exercises=getPortfolioInterviewExercises(language),summary=state.index>=exercises.length;
 const exercise=exercises[Math.min(state.index,exercises.length-1)];
 const answer=state.answers[exercise.id]??{text:'',revealed:false,reviewed:false};
 const reviewed=exercises.filter(item=>state.answers[item.id]?.reviewed).length;
 const heading=useRef<HTMLHeadingElement>(null),scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{scroll.current?.scrollTo({top:0});heading.current?.focus({preventScroll:true});},[state.index]);
 function update(patch:Partial<typeof answer>){onChange({...state,answers:{...state.answers,[exercise.id]:{...answer,...patch}}});}
 function navigate(index:number){onChange({...state,index:Math.max(0,Math.min(exercises.length,index))});}
 function download(){
  const notes=[t('Práctica de entrevista del portafolio','Portfolio interview practice','Portfolio-Interviewübung','Pratique d’entretien du portfolio','Prática de entrevista do portfólio'),t('Notas personales de práctica. Revisión propia, sin evaluación automática ni puntuación de IA.','Personal practice notes. Self-review, without automatic assessment or an AI score.','Persönliche Übungsnotizen. Selbstprüfung, keine automatische Bewertung oder KI-Punktzahl.','Notes personnelles de pratique. Auto-évaluation, sans notation automatique ou score IA.','Notas pessoais de prática. Revisão própria, sem avaliação automática ou pontuação de IA.'),''];
  for(const item of exercises){
   const entry=state.answers[item.id];
   notes.push(item.project,item.question,t('Mi respuesta','My answer','Meine Antwort','Ma réponse','Minha resposta')+':',entry?.text||t('Sin responder','Not answered','Nicht beantwortet','Sans réponse','Sem resposta'),t('Revisada por mí','Reviewed by me','Von mir geprüft','Relue par moi','Revisada por mim')+': '+(entry?.reviewed?t('Sí','Yes','Ja','Oui','Sim'):t('No','No','Nein','Non','Não')),t('Criterios de revisión','Review criteria','Prüfkriterien','Critères de révision','Critérios de revisão')+':',...item.criteria.map(criterion=>'- '+criterion),new URL(item.caseStudyHref,window.location.origin).href,'');
  }
  const url=URL.createObjectURL(new Blob([notes.join('\n')],{type:'text/plain;charset=utf-8'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='portfolio-interview-'+language+'.txt';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <section className={s.practicePanel} aria-label={t('Práctica de entrevista local','Local interview practice','Lokale Interviewübung','Pratique d’entretien locale','Prática de entrevista local')}>
  <div className={s.practiceScroll} ref={scroll}>
   <p className={s.notice}>{t('Ejercicio local: tú revisas tus respuestas. No es una evaluación generada por IA. Descarga tus notas antes de salir de esta página. Nuevo chat borra estas notas.','Local exercise: you review your answers. This is not an AI assessment. Download your notes before leaving this page. New chat clears these notes.','Lokale Übung: Du prüfst deine Antworten selbst. Keine KI-Bewertung. Lade deine Notizen vor dem Verlassen der Seite herunter. Neues Gespräch löscht diese Notizen.','Exercice local : vous relisez vos réponses. Aucune évaluation IA. Téléchargez vos notes avant de quitter cette page. Nouvelle conversation efface ces notes.','Exercício local: você revisa suas respostas. Não é uma avaliação por IA. Baixe suas notas antes de sair desta página. Nova conversa limpa estas notas.')}</p>
   <p className={s.practiceProgress} role="status">{t('Revisadas por ti','Reviewed by you','Von dir geprüft','Relues par vous','Revisadas por você')}: {reviewed}/{exercises.length}</p>
   <progress className={s.practiceMeter} value={reviewed} max={exercises.length} aria-label={t('Preguntas revisadas','Questions reviewed','Geprüfte Fragen','Questions relues','Perguntas revisadas')}/>
   <h3 tabIndex={-1} ref={heading}>{summary?t('Tus notas de práctica','Your practice notes','Deine Übungsnotizen','Vos notes de pratique','Suas notas de prática'):exercise.project}</h3>
   {summary?<>
    <p>{t('Puedes volver a cualquier pregunta y mejorar tu respuesta. El progreso solo refleja tu propia revisión.','Return to any question to improve your answer. Progress only reflects your own review.','Kehre zu jeder Frage zurück und verbessere deine Antwort. Der Fortschritt zeigt nur deine eigene Prüfung.','Revenez à une question pour améliorer votre réponse. La progression reflète seulement votre relecture.','Volte a qualquer pergunta para melhorar sua resposta. O progresso reflete apenas sua própria revisão.')}</p>
    <ol className={s.practiceSummary}>{exercises.map((item,index)=><li key={item.id}><button type="button" onClick={()=>navigate(index)}>{item.project} — {state.answers[item.id]?.reviewed?t('Revisada','Reviewed','Geprüft','Relue','Revisada'):t('Pendiente','Pending','Offen','À revoir','Pendente')}</button></li>)}</ol>
   </>:<>
    <p className={s.practiceQuestion}>{exercise.question}</p>
    <form onSubmit={event=>{event.preventDefault();if(answer.text.trim())update({revealed:true});}}>
     <label htmlFor="portfolio-practice-answer">{t('Tu respuesta de práctica','Your practice answer','Deine Übungsantwort','Votre réponse de pratique','Sua resposta de prática')}</label>
     <textarea id="portfolio-practice-answer" className={s.composer} rows={5} maxLength={2000} value={answer.text} onChange={event=>update({text:event.target.value,reviewed:false})}/>
     <button disabled={!answer.text.trim()} type="submit">{t('Mostrar criterios de revisión','Show review criteria','Prüfkriterien anzeigen','Afficher les critères','Mostrar critérios de revisão')}</button>
    </form>
    {answer.revealed&&<div className={s.practiceReview}>
     <h4>{t('Revisa tu respuesta','Review your answer','Prüfe deine Antwort','Relisez votre réponse','Revise sua resposta')}</h4>
     <ul>{exercise.criteria.map(criterion=><li key={criterion}>{criterion}</li>)}</ul>
     <details><summary>{t('Ver explicación de ejemplo','View sample explanation','Beispielerklärung ansehen','Voir un exemple d’explication','Ver explicação de exemplo')}</summary><p>{exercise.example}</p></details>
     <label className={s.selfReview}><input type="checkbox" disabled={!answer.text.trim()} checked={answer.reviewed} onChange={event=>update({reviewed:event.target.checked})}/>{t('He revisado mi respuesta con estos criterios','I reviewed my answer against these criteria','Ich habe meine Antwort anhand dieser Kriterien geprüft','J’ai relu ma réponse selon ces critères','Revisei minha resposta com estes critérios')}</label>
    </div>}
    <Link className={s.practiceEvidence} href={exercise.caseStudyHref}>{t('Consultar evidencia del proyecto','Read project evidence','Projektnachweise ansehen','Consulter les preuves du projet','Consultar evidências do projeto')} →</Link>
   </>}
  </div>
  <footer className={s.practiceActions}>
   <button type="button" disabled={state.index===0} onClick={()=>navigate(state.index-1)}>{t('Anterior','Previous','Zurück','Précédente','Anterior')}</button>
   {!summary&&<button type="button" onClick={()=>navigate(state.index+1)}>{state.index===exercises.length-1?t('Ver resumen','View summary','Übersicht','Voir le résumé','Ver resumo'):t('Siguiente','Next','Weiter','Suivante','Próxima')}</button>}
   <button type="button" onClick={download}>{t('Descargar mis notas','Download my notes','Notizen herunterladen','Télécharger mes notes','Baixar minhas notas')}</button>
  </footer>
 </section>;
}
