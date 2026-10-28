"use client";

import {useState} from "react";
import type {SiteLanguage} from "../../data/site-languages";

type Slug="nexus-ai"|"nexus-commerce"|"nexus-studio"|"nexus-monitor"|"nexus-software-factory";
type Choices=[string,string,string];
const correct:Record<Slug,number>={
  "nexus-ai":1,"nexus-commerce":2,"nexus-studio":0,
  "nexus-monitor":1,"nexus-software-factory":2,
};
const options:Record<SiteLanguage,Record<Slug,Choices>>={
  es:{
    "nexus-ai":["La aplicación guarda las claves de IA en el navegador.","La sesión y el acceso a datos se controlan desde el servidor con RLS.","Su asistente es un modelo autónomo entrenado desde cero."],
    "nexus-commerce":["El sistema procesa pagos bancarios reales.","El carrito por sí solo evita compras simultáneas con stock insuficiente.","SQLite valida el inventario dentro de una transacción de compra local."],
    "nexus-studio":["Las revisiones SQLite rechazan guardados obsoletos con conflicto 409.","Dos usuarios colaboran en tiempo real en producción.","El HTML exportado se publica directamente en Internet."],
    "nexus-monitor":["Las mediciones manuales prueban un SLA del 99,9 %.","El monitor registra sondeos manuales a un endpoint local fijo.","El usuario puede escanear cualquier red o servidor."],
    "nexus-software-factory":["Una IA ejecuta y publica automáticamente código generado.","La QA estática certifica que un sandbox está aislado.","El flujo usa plantillas fijas, aprobación humana y no ejecuta código generado."],
  },
  en:{
    "nexus-ai":["AI credentials are kept in the browser.","Sessions and data access are protected server-side with RLS.","Its assistant is a fully autonomous model trained from scratch."],
    "nexus-commerce":["The checkout processes real card payments.","The browser cart alone ensures concurrent stock safety.","SQLite validates inventory inside a local purchase transaction."],
    "nexus-studio":["SQLite revisions reject stale saves with HTTP 409.","Two users collaborate in real time in production.","Exported HTML is automatically published online."],
    "nexus-monitor":["Manual samples prove a 99.9% uptime SLA.","The monitor records manual probes to one fixed local endpoint.","Users may scan arbitrary networks and servers."],
    "nexus-software-factory":["An AI autonomously runs and deploys generated code.","Static QA proves that a runtime sandbox is isolated.","Fixed templates require human approval and generated code is not executed."],
  },
  de:{
    "nexus-ai":["KI-Zugangsdaten liegen im Browser.","Sitzungen und Datenzugriffe werden serverseitig durch RLS geschützt.","Der Assistent ist ein von Grund auf trainiertes autonomes Modell."],
    "nexus-commerce":["Echte Kartenzahlungen werden abgewickelt.","Der Browser-Warenkorb allein verhindert parallele Überverkäufe.","SQLite prüft den Bestand innerhalb einer lokalen Kauftransaktion."],
    "nexus-studio":["SQLite-Revisionskontrolle lehnt veraltete Schreibzugriffe mit HTTP 409 ab.","Zwei Nutzer arbeiten in Produktion in Echtzeit zusammen.","HTML-Exporte werden automatisch online veröffentlicht."],
    "nexus-monitor":["Manuelle Stichproben beweisen einen SLA von 99,9 %.","Das Monitoring prüft manuell einen festgelegten lokalen Endpunkt.","Beliebige Netzwerke können gescannt werden."],
    "nexus-software-factory":["Eine KI führt generierten Code aus und veröffentlicht ihn automatisch.","Statische QA beweist eine sichere Runtime-Sandbox.","Feste Vorlagen brauchen menschliche Freigabe; generierter Code wird nicht ausgeführt."],
  },
  fr:{
    "nexus-ai":["Les clés IA sont conservées dans le navigateur.","Les sessions et les données sont protégées côté serveur par RLS.","L'assistant est un modèle autonome entraîné depuis zéro."],
    "nexus-commerce":["Le paiement bancaire réel est activé.","Le panier navigateur suffit à empêcher les ruptures sous concurrence.","SQLite valide le stock dans une transaction d'achat locale."],
    "nexus-studio":["Les révisions SQLite rejettent les sauvegardes obsolètes avec HTTP 409.","Deux utilisateurs collaborent en temps réel en production.","L'export HTML est publié automatiquement sur Internet."],
    "nexus-monitor":["Des contrôles manuels prouvent un SLA de 99,9 %.","Le moniteur effectue des sondes manuelles vers une cible locale fixe.","On peut analyser n'importe quel réseau externe."],
    "nexus-software-factory":["Une IA exécute et déploie automatiquement le code généré.","Les contrôles statiques prouvent l'isolation du sandbox.","Les modèles fixes exigent l'approbation humaine et aucun code généré n'est exécuté."],
  },
  pt:{
    "nexus-ai":["As chaves de IA ficam expostas no navegador.","Sessões e dados são protegidos no servidor com RLS.","O assistente é um modelo autônomo treinado do zero."],
    "nexus-commerce":["O checkout cobra cartões reais.","O carrinho do navegador garante sozinho segurança contra compras concorrentes.","SQLite valida estoque em uma transação local de compra."],
    "nexus-studio":["Revisões SQLite rejeitam gravações antigas com HTTP 409.","Dois usuários colaboram em produção em tempo real.","O HTML exportado é publicado automaticamente na Internet."],
    "nexus-monitor":["Amostras manuais comprovam SLA de 99,9 %.","O monitor registra sondagens manuais de um endpoint local fixo.","Qualquer rede ou servidor pode ser examinado."],
    "nexus-software-factory":["Uma IA executa e publica automaticamente o código gerado.","QA estática comprova isolamento do sandbox.","Modelos fixos exigem aprovação humana e o código gerado não é executado."],
  },
};
const copy:Record<SiteLanguage,{title:string;question:string;correct:string;retry:string;reset:string;note:string}>={
  es:{title:"Desafío técnico",question:"¿Cuál afirmación describe de verdad esta implementación?",correct:"Correcto. Esta capacidad está respaldada por el caso de estudio.",retry:"Esa función no está implementada. Revisa las pruebas y limitaciones e inténtalo de nuevo.",reset:"Intentar otra vez",note:"Ejercicio de aprendizaje local. No es un certificado ni una prueba ejecutada."},
  en:{title:"Architecture challenge",question:"Which statement accurately describes this implementation?",correct:"Correct. This is supported by the documented case study.",retry:"That feature is not implemented. Review the evidence and limitations, then try again.",reset:"Try again",note:"Local learning exercise. Not a certification or executed test."},
  de:{title:"Architekturaufgabe",question:"Welche Aussage beschreibt diese Implementierung korrekt?",correct:"Richtig. Die Fallstudie belegt diese Funktion.",retry:"Diese Funktion ist nicht implementiert. Prüfe Belege und Grenzen und versuche es erneut.",reset:"Erneut versuchen",note:"Lokale Lernübung; kein Zertifikat und kein ausgeführter Test."},
  fr:{title:"Défi d'architecture",question:"Quelle affirmation décrit correctement cette implémentation ?",correct:"Correct. Le cas d'étude confirme cette fonctionnalité.",retry:"Cette fonction n'est pas réalisée. Consultez les preuves et les limites.",reset:"Réessayer",note:"Exercice local, sans certification ni exécution de tests."},
  pt:{title:"Desafio de arquitetura",question:"Qual afirmação descreve corretamente esta implementação?",correct:"Correto. O estudo de caso comprova esta função.",retry:"Esse recurso não foi implementado. Revise evidências e limites.",reset:"Tentar novamente",note:"Exercício local; não é certificado nem teste executado."},
};

export default function ArchitectureChallenge({slug,language}:{slug:string;language:SiteLanguage}){
  const [selection,setSelection]=useState<number|null>(null);
  if (!(slug in correct)) return null;
  const key=slug as Slug, labels=copy[language], choices=options[language][key];
  const isCorrect=selection===correct[key];
  return <section aria-label={labels.title} className="mt-10 rounded-2xl border border-[#825365] bg-[#1c171d] p-6 sm:p-8">
    <h2 className="text-2xl font-bold text-white">{labels.title}</h2>
    <p className="mt-3 text-sm text-slate-300">{labels.question}</p>
    <div className="mt-5 grid gap-3">{choices.map((choice,index)=><button key={index} type="button"
      aria-pressed={selection===index} onClick={()=>setSelection(index)}
      className={"rounded-xl border p-4 text-left text-sm leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-white "+
        (selection===index?"border-[#f09eaf] bg-[#472934] text-white":"border-white/15 bg-[#121116] text-slate-200 hover:border-[#a66a7d]")}>
      {index+1}. {choice}
    </button>)}</div>
    {selection!==null&&<div className="mt-5" role="status" aria-live="polite">
      <p className={isCorrect?"text-[#b4e6c5]":"text-[#f6b8c3]"}>{isCorrect?labels.correct:labels.retry}</p>
      <button type="button" onClick={()=>setSelection(null)} className="mt-3 rounded-lg border border-[#9d5e70] px-3 py-2 text-sm text-white">{labels.reset}</button>
    </div>}
    <p className="mt-4 text-xs text-slate-400">{labels.note}</p>
  </section>;
}
