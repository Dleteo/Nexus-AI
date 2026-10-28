"use client";

import {useState, type FormEvent} from "react";
import Link from "next/link";
import type {SiteLanguage} from "../../data/site-languages";
import styles from "./CareerHome.module.css";
import {professionalProfile} from "../../data/profile";

const email=professionalProfile.email;
const socials=[
  {name:"GitHub",url:professionalProfile.github},
  {name:"LinkedIn",url:professionalProfile.linkedin},
  {name:"Instagram",url:professionalProfile.instagram},
] as const;
const featuredCaseStudies=[
  {slug:"nexus-ai",name:"Nexus AI Workspace"},
  {slug:"nexus-commerce",name:"Nexus Commerce"},
  {slug:"nexus-studio",name:"Nexus Studio"},
  {slug:"nexus-monitor",name:"Nexus Monitor"},
  {slug:"nexus-software-factory",name:"Nexus Software Factory"},
] as const;

type Topic="projects"|"skills"|"social"|"email"|"technical"|"unknown";
function classify(query:string):Topic {
  const q=query.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  if(/corre|email|mail|contact|contrat|hire|job|recrut|escribir|contat/.test(q))return "email";
  if(/github|linkedin|instagram|red|social|network|perfil|reseau/.test(q))return "social";
  if(/nexus\s*technical|tecnico|technical|technisch|technique|tecnico\s*nexus/.test(q))return "technical";
  if(/proyec|project|projet|portfolio|portafolio|nexus|projeto|projekt/.test(q))return "projects";
  if(/habil|skill|exper|certif|curso|stack|learn|techno|bildung|formac/.test(q))return "skills";
  if(/python|code|codi|program|software|hardware|typescript|error|cve|security|segurid/.test(q))return "technical";
  return "unknown";
}
const sentences:Record<Topic,[string,string,string,string,string]>={
  projects:[
    "Estos son mis cinco proyectos destacados: Nexus AI Workspace (portafolio y asistentes), Commerce (inventario y compras simuladas), Studio (editor y revisiones), Monitor (sondeos manuales) y Software Factory (plantillas revisadas, sin ejecutar código). Puedes abrir sus casos de estudio aquí mismo.",
    "My five featured projects are Nexus AI Workspace (portfolio and assistants), Commerce (inventory and simulated orders), Studio (editor and revisions), Monitor (manual health checks), and Software Factory (reviewed templates, no code execution). Open their case studies below.",
    "Meine fünf Hauptprojekte sind Nexus AI Workspace (Portfolio und Assistenten), Commerce (Lager und Testbestellungen), Studio (Editor und Versionen), Monitor (manuelle Prüfungen) und Software Factory (geprüfte Vorlagen ohne Codeausführung). Die Fallstudien sind unten verlinkt.",
    "Mes cinq projets principaux sont Nexus AI Workspace (portfolio et assistants), Commerce (stock et commandes simulées), Studio (éditeur et versions), Monitor (contrôles manuels) et Software Factory (modèles validés, sans exécution de code). Les études de cas sont accessibles ci-dessous.",
    "Meus cinco projetos principais são Nexus AI Workspace (portfólio e assistentes), Commerce (estoque e pedidos simulados), Studio (editor e revisões), Monitor (verificações manuais) e Software Factory (modelos revisados, sem executar código). Veja os estudos de caso abaixo."
  ],
  skills:[
    "Perfil junior: HTML, CSS, JavaScript, React, Next.js, Supabase, pruebas automatizadas y GitHub. La formación documentada no equivale a experiencia profesional de programación.",
    "Junior profile: HTML, CSS, JavaScript, React, Next.js, Supabase, automated tests and GitHub. Documented training is not professional coding experience.",
    "Junior-Profil: HTML, CSS, JavaScript, React, Next.js, Supabase, automatisierte Tests und GitHub. Kursstunden sind keine Berufserfahrung.",
    "Profil junior : HTML, CSS, JavaScript, React, Next.js, Supabase, tests automatisés et GitHub. Les heures de formation ne sont pas une expérience professionnelle.",
    "Perfil júnior: HTML, CSS, JavaScript, React, Next.js, Supabase, testes automatizados e GitHub. Horas de cursos não são experiência profissional."
  ],
  social:[
    "Puedes consultar GitHub, LinkedIn e Instagram con los enlaces de esta tarjeta, recuperados del portafolio anterior.",
    "Visit GitHub, LinkedIn and Instagram using the links below, recovered from the owner's previous portfolio.",
    "GitHub, LinkedIn und Instagram findest du über die Links unten aus dem vorherigen Portfolio.",
    "Vous trouverez GitHub, LinkedIn et Instagram via les liens ci-dessous de l'ancien portfolio.",
    "Veja GitHub, LinkedIn e Instagram nos links abaixo do portfólio anterior."
  ],
  email:[
    "Pulsa «Preparar correo» para escribir al desarrollador. Se abrirá tu aplicación de correo; el mensaje no se envía automáticamente.",
    "Choose «Compose email» to contact the developer. Your mail application will open; nothing is sent automatically.",
    "Klicke auf «E-Mail vorbereiten», um den Entwickler zu kontaktieren. Die E-Mail wird nicht automatisch versendet.",
    "Cliquez sur «Préparer un e-mail» pour contacter le développeur. Rien n'est envoyé automatiquement.",
    "Escolha «Preparar e-mail» para entrar em contato. O e-mail não será enviado automaticamente."
  ],
  technical:[
    "Para preguntas técnicas complejas, abre Nexus Technical. Requiere inicio de sesión y motor configurado; esta sección solo responde preguntas documentadas sobre el portafolio.",
    "For complex technical questions, open Nexus Technical. It requires sign-in and a configured engine; this contact assistant only answers documented portfolio questions.",
    "Für technische Fragen öffne Nexus Technical. Anmeldung und konfigurierte Engine sind erforderlich; hier gibt es nur dokumentierte Portfolio-Antworten.",
    "Pour les questions techniques, ouvrez Nexus Technical (connexion et moteur configuré nécessaires). Ce module présente uniquement le portfolio.",
    "Para perguntas técnicas, abra o Nexus Technical (login e mecanismo configurado necessários). Este módulo apresenta apenas o portfólio."
  ],
  unknown:[
    "Puedo explicar los proyectos, habilidades, redes sociales o cómo enviar un correo. Selecciona un tema.",
    "I can explain projects, skills, social links or email contact. Choose a topic.",
    "Ich kann Projekte, Kenntnisse, soziale Profile und E-Mail-Kontakt erklären. Wähle ein Thema.",
    "Je peux présenter les projets, compétences, réseaux sociaux et le contact par e-mail. Choisissez un thème.",
    "Posso explicar projetos, habilidades, redes e contato por e-mail. Escolha um tópico."
  ]
};

export default function PortfolioContactChat({language}:{language:SiteLanguage}) {
  const locale={es:0,en:1,de:2,fr:3,pt:4}[language];
  const t=(es:string,en:string,de:string,fr:string,pt:string)=>[es,en,de,fr,pt][locale];
  const [question,setQuestion]=useState("");
  const [conversation,setConversation]=useState<{topic:Topic;question:string;reply:string}|null>(null);
  const [showEmail,setShowEmail]=useState(false);
  const [visitor,setVisitor]=useState("");
  const [replyEmail,setReplyEmail]=useState("");
  const [message,setMessage]=useState("");

  function answer(topic:Topic,input:string) {
    setConversation({topic,question:input,reply:sentences[topic][locale]});
    if(topic==="email")setShowEmail(true);
  }
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q=question.trim().slice(0,500);
    if(!q)return;
    answer(classify(q),q);
    setQuestion("");
  }
  const body=["Hola, me gustaría contactar contigo.","Nombre: "+(visitor||"No indicado"),"Correo de respuesta: "+(replyEmail||"No indicado"),"",message].join("\n").slice(0,1600);
  const mailto="mailto:"+email+"?subject="+encodeURIComponent("Contacto desde Nexus AI")+"&body="+encodeURIComponent(body);
  return <section className={styles.portfolioContactChat} aria-label={t("Asistente de contacto","Contact assistant","Kontaktassistent","Assistant de contact","Assistente de contato")}>
    <div className={styles.portfolioContactHead}>
      <span className={styles.portfolioContactSymbol}>N</span>
      <div><strong>NEXUS / CONTACT</strong><small>{t("Información de proyectos · lógica propia","Project information · original logic","Projektinformationen · eigene Logik","Informations projets · logique propre","Informações de projetos · lógica própria")}</small></div>
      <span className={styles.portfolioContactFlag}>{t("SIN COSTE DE API","NO API COST","KEINE API-KOSTEN","SANS FRAIS API","SEM CUSTO DE API")}</span>
    </div>
    <div className={styles.portfolioContactBody} role="log" aria-live="polite" aria-label={t("Respuestas de contacto","Contact answers","Kontaktantworten","Réponses de contact","Respostas de contato")}>
      {conversation?<><div className={styles.portfolioContactQuestion}>{conversation.question}</div><div className={styles.portfolioContactReply}><b>Nexus</b><p>{conversation.reply}</p></div></>:<div className={styles.portfolioContactReply}><b>Nexus</b><p>{t("Hola. Pregúntame por los proyectos, las habilidades o cómo contactar al desarrollador.","Hello. Ask about projects, skills or how to contact the developer.","Hallo. Frage nach Projekten, Kenntnissen oder Kontaktmöglichkeiten.","Bonjour. Demandez des informations sur les projets, compétences ou contacts.","Olá. Pergunte sobre projetos, habilidades ou contato.")}</p></div>}
    </div>
    {conversation?.topic==="projects"&&<nav aria-label={t("Casos de estudio destacados","Featured case studies","Fallstudien der Hauptprojekte","Études de cas principales","Estudos de caso em destaque")} className="mt-3 grid gap-2 sm:grid-cols-2">
      {featuredCaseStudies.map(study=><Link key={study.slug} href={"/projects/"+study.slug+"?lang="+language}
        className="rounded-lg border border-[#854253] bg-[#1e151b] px-3 py-2 text-xs font-semibold text-[#ffd2dc] hover:border-[#f39bb0] focus-visible:outline-2 focus-visible:outline-[#f39bb0]">{study.name} ↗</Link>)}
    </nav>}
    <div className={styles.portfolioContactChoices}>
      <button type="button" onClick={()=>answer("projects",t("Proyectos","Projects","Projekte","Projets","Projetos"))}>{t("Proyectos","Projects","Projekte","Projets","Projetos")}</button>
      <button type="button" onClick={()=>answer("skills",t("Habilidades","Skills","Kenntnisse","Compétences","Habilidades"))}>{t("Habilidades","Skills","Kenntnisse","Compétences","Habilidades")}</button>
      <button type="button" onClick={()=>answer("social",t("Redes","Social links","Profile","Réseaux","Redes"))}>{t("Redes","Socials","Profile","Réseaux","Redes")}</button>
      <button type="button" onClick={()=>answer("email",t("Correo","Email","E-Mail","E-mail","E-mail"))}>{t("Correo","Email","E-Mail","E-mail","E-mail")}</button>
    </div>
    <form className={styles.portfolioContactAsk} onSubmit={submit}>
      <label htmlFor="nexus-contact-question">{t("Tu pregunta","Your question","Deine Frage","Votre question","Sua pergunta")}</label>
      <div><input id="nexus-contact-question" value={question} maxLength={500} onChange={e=>setQuestion(e.target.value)} placeholder={t("¿Cómo puedo contactarte?","How can I contact you?","Wie kann ich dich erreichen?","Comment vous contacter ?","Como posso entrar em contato?")}/><button disabled={!question.trim()} type="submit" aria-label={t("Preguntar","Ask","Fragen","Demander","Perguntar")}>↗</button></div>
    </form>
    <nav className={styles.portfolioContactLinks} aria-label={t("Redes y contacto","Social links and contact","Profile und Kontakt","Réseaux et contact","Redes e contato")}>
      {socials.map(item=><a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer">{item.name} ↗</a>)}
      <Link href="/assistant">Nexus Technical ↗</Link>
    </nav>
    <div className={styles.portfolioContactMailTrigger}><button type="button" aria-controls="nexus-contact-email-form" onClick={()=>setShowEmail(x=>!x)} aria-expanded={showEmail}>{t("Preparar correo","Compose email","E-Mail vorbereiten","Préparer un e-mail","Preparar e-mail")} ↗</button></div>
    {showEmail&&<div id="nexus-contact-email-form" role="group" aria-label={t("Preparar un mensaje de correo","Prepare an email message","E-Mail-Nachricht vorbereiten","Préparer un message e-mail","Preparar mensagem de e-mail")} className={styles.portfolioContactMail}>
      <input maxLength={80} value={visitor} onChange={e=>setVisitor(e.target.value)} aria-label={t("Nombre","Name","Name","Nom","Nome")} placeholder={t("Tu nombre","Your name","Dein Name","Votre nom","Seu nome")}/>
      <input type="email" maxLength={160} value={replyEmail} onChange={e=>setReplyEmail(e.target.value)} aria-label={t("Tu correo","Your email","Deine E-Mail","Votre e-mail","Seu e-mail")} placeholder={t("Tu correo","Your email","Deine E-Mail","Votre e-mail","Seu e-mail")}/>
      <textarea rows={3} maxLength={1000} value={message} onChange={e=>setMessage(e.target.value)} aria-label={t("Mensaje","Message","Nachricht","Message","Mensagem")} placeholder={t("Tu mensaje","Your message","Deine Nachricht","Votre message","Sua mensagem")}/>
      <a className={styles.portfolioContactMailButton} href={mailto}>{t("Abrir mi aplicación de correo","Open my email app","E-Mail-Programm öffnen","Ouvrir mon application e-mail","Abrir aplicativo de e-mail")} ↗</a>
    </div>}
    <p className={styles.portfolioContactNote}>{t("Respuestas programadas sobre datos públicos, no generación neuronal. No almacenamos los mensajes aquí. El correo solo se envía si el visitante lo confirma desde su aplicación.","Scripted answers about public information, not neural generation. No messages are saved here. Email is only sent if the visitor confirms it in their app.","Programmierte Antworten über öffentliche Daten, kein neuronales Modell. Nachrichten werden hier nicht gespeichert. Versand nur nach Bestätigung im E-Mail-Programm.","Réponses programmées sur des données publiques, sans IA générative. Aucun message n'est enregistré ici. L’envoi est confirmé dans l’application e-mail.","Respostas programadas sobre dados públicos, sem geração neural. Mensagens não são armazenadas aqui. O envio precisa de confirmação no aplicativo de e-mail.")}</p>
  </section>;
}
