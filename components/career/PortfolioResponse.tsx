'use client';
import {useState} from 'react';
import MessageContent from '@/components/assistant/MessageContent';
import type {SiteLanguage} from '@/data/site-languages';
import {words} from './DevelopmentEvidence';
import s from './PortfolioCompanion.module.css';

export default function PortfolioResponse({text,language}:{text:string;language:SiteLanguage}){
 const t=(es:string,en:string,de:string,fr:string,pt:string)=>words(language,es,en,de,fr,pt);
 const [feedback,setFeedback]=useState<{text:string;ok:boolean}|null>(null);
 async function copy(){
  try{await navigator.clipboard.writeText(text);setFeedback({text,ok:true});}
  catch{setFeedback({text,ok:false});}
 }
 return <div className={s.response}>
  <MessageContent content={text} copyCodeLabel={t('Copiar código','Copy code','Code kopieren','Copier le code','Copiar código')} copiedLabel={t('Copiado','Copied','Kopiert','Copié','Copiado')} copyCodeAriaLabel={t('Copiar código {language}','Copy {language} code','Code {language} kopieren','Copier le code {language}','Copiar código {language}')}/>
  <div className={s.copyRow}><button type="button" onClick={copy}>{t('Copiar respuesta','Copy answer','Antwort kopieren','Copier la réponse','Copiar resposta')}</button>
   <span role="status">{feedback?.text===text?(feedback.ok?t('Respuesta copiada','Answer copied','Antwort kopiert','Réponse copiée','Resposta copiada'):t('No se pudo copiar. Selecciona el texto para copiarlo.','Could not copy. Select the text to copy it.','Kopieren fehlgeschlagen. Markiere den Text zum Kopieren.','Copie impossible. Sélectionnez le texte pour le copier.','Não foi possível copiar. Selecione o texto para copiá-lo.')):''}</span>
  </div>
 </div>;
}
