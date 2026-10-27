"use client";

import Link from "next/link";
import {useState, type FormEvent} from "react";
import type {SiteLanguage} from "../../data/site-languages";
import styles from "./CareerHome.module.css";

const sampleQuestions = [
  "ModuleNotFoundError: No module named requests",
  "TS2322",
  "Mi GPU se sobrecalienta",
];

export default function FeaturedTechnicalChat({language}:{language:SiteLanguage}) {
  const t=(es:string,en:string,de:string,fr:string,pt:string)=>{
    const values={es,en,de,fr,pt};
    return values[language];
  };
  const [draft,setDraft]=useState("");
  const [showInfo,setShowInfo]=useState(false);
  const [messages,setMessages]=useState<Array<{role:"user"|"assistant";content:string}>>([]);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState("");
  async function goToChat(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query=draft.trim();
    if(!query || sending)return;
    setSending(true);
    setError("");
    try{
      // Never create a fake reply. The regular application API validates user,
      // workspace ownership, usage limits and provider configuration.
      const created=await fetch("/api/assistant/conversations",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({scope:"technical",mode:"assistant"}),
      });
      if(created.status===401){setError(t("Inicia sesión para usar Nexus Technical.","Sign in to use Nexus Technical.","Für Nexus Technical anmelden.","Connectez-vous pour utiliser Nexus Technical.","Entre para usar o Nexus Technical."));return;}
      const thread=await created.json() as {conversation?:{id:string};error?:string};
      if(!created.ok || !thread.conversation?.id)throw Error(t("No se pudo crear la conversación.","Could not start conversation.","Unterhaltung konnte nicht gestartet werden.","Impossible de créer la conversation.","Não foi possível iniciar a conversa."));
      const reply=await fetch("/api/assistant/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({scope:"technical",conversationId:thread.conversation.id,message:query,mode:"assistant",expertise:"general",currentResearch:false}),
      });
      const data=await reply.json() as {answer?:string;error?:string};
      if(!reply.ok || !data.answer)throw Error(data.error||t("El motor técnico no está disponible todavía.","Technical engine is not available yet.","Technisches System derzeit nicht verfügbar.","Le moteur technique n’est pas encore disponible.","O mecanismo técnico ainda não está disponível."));
      setMessages([{role:"user",content:query},{role:"assistant",content:data.answer}]);
      setDraft("");
      setShowInfo(false);
    }catch(cause){setError(cause instanceof Error?cause.message:t("No se pudo responder.","Could not respond.","Antwort fehlgeschlagen.","Réponse indisponible.","Não foi possível responder."));}
    finally{setSending(false);}
  }
  return <section className={styles.featuredChat} aria-label={t("Vista previa interactiva de Nexus Technical","Interactive Nexus Technical preview","Interaktive Nexus-Technical-Vorschau","Aperçu interactif de Nexus Technical","Prévia interativa do Nexus Technical")}>
    <div className={styles.featuredChatBar}>
      <span className={styles.featuredChatMark}>N</span>
      <div><strong>Nexus Technical</strong><small>{t("Guías técnicas propias · prueba local","Original technical guides · local test","Eigene technische Anleitungen · lokaler Test","Guides techniques propres · essai local","Guias técnicas próprias · teste local")}</small></div>
      <span className={styles.featuredChatStatus} title={t("Demostración de interfaz, no conexión verificada","UI preview, connection not verified","UI-Vorschau, Verbindung nicht geprüft","Aperçu de l’interface, connexion non vérifiée","Prévia da interface, conexão não verificada")}>{t("DEMO","PREVIEW","VORSCHAU","APERÇU","PRÉVIA")}</span>
    </div>
    <div className={styles.featuredChatMessages} role="log" aria-live="polite" aria-label="Nexus Technical">
      {messages.length===0?<div className={styles.featuredChatBubble}>
        <b>Nexus Technical</b>
        <p>{t("Hola. Puedo orientarte sobre errores de Python, TypeScript, Windows y seguridad usando guías revisadas.","Hello. I can guide you through Python, TypeScript, Windows and security issues using reviewed guides.","Hallo. Ich helfe bei Python-, TypeScript-, Windows- und Sicherheitsfragen mit geprüften Anleitungen.","Bonjour. Je peux aider avec Python, TypeScript, Windows et la sécurité à partir de guides vérifiés.","Olá. Posso ajudar com Python, TypeScript, Windows e segurança usando guias revisados.")}</p>
      </div>:messages.map((message,index)=><div key={index} className={styles.featuredChatBubble}><b>{message.role==="assistant"?"Nexus Technical":t("Tú","You","Du","Vous","Você")}</b><p>{message.content}</p></div>)}
      {messages.length===0&&<div className={styles.featuredChatSuggestions} aria-label={t("Ejemplos para explorar","Examples to explore","Beispielfragen","Exemples à explorer","Exemplos para explorar")}>
        {sampleQuestions.slice(0,2).map((q,i)=><button key={q} type="button" onClick={()=>{setDraft(q);setShowInfo(true)}}>{i===0?"Python: import":"TypeScript: TS2322"}</button>)}
      </div>}
    </div>
    <form className={styles.featuredChatForm} onSubmit={goToChat}>
      <label className={styles.featuredChatLabel} htmlFor="featured-technical-question">{t("Tu pregunta técnica","Your technical question","Deine technische Frage","Votre question technique","Sua pergunta técnica")}</label>
      <div className={styles.featuredChatInputRow}>
        <input id="featured-technical-question" maxLength={4000} value={draft} onChange={e=>{setDraft(e.target.value);setShowInfo(false)}} placeholder={t("Pregunta sobre software o código…","Ask about software or code…","Frage zu Software oder Code…","Question sur un logiciel ou du code…","Pergunte sobre software ou código…")} />
        <button type="submit" disabled={!draft.trim() || sending} aria-label={t("Abrir asistente real","Open real assistant","Echten Assistenten öffnen","Ouvrir le véritable assistant","Abrir assistente real")}>{sending?"…":"↗"}</button>
      </div>
      {error&&<p className={styles.featuredChatError} role="alert">{error} <Link href="/login?next=%2Fassistant">{t("Iniciar sesión","Sign in","Anmelden","Connexion","Entrar")}</Link></p>}
      <p className={styles.featuredChatDisclaimer}>{showInfo?t("Ejemplo seleccionado. Continúa en el asistente con tu sesión.","Example selected. Continue in the assistant after signing in.","Beispiel gewählt. Im Assistenten nach Anmeldung fortfahren.","Exemple choisi. Poursuivez dans l’assistant après connexion.","Exemplo selecionado. Continue no assistente após entrar."):t("Las respuestas reales requieren sesión y un motor configurado.","Real answers require sign-in and a configured engine.","Echte Antworten erfordern Anmeldung und ein konfiguriertes System.","Les réponses réelles nécessitent une connexion et un moteur configuré.","Respostas reais exigem login e um mecanismo configurado.")}</p>
    </form>
    <Link className={styles.featuredChatFull} href="/assistant">{t("Abrir chat completo","Open full chat","Vollständigen Chat öffnen","Ouvrir le chat complet","Abrir chat completo")} <span aria-hidden="true">→</span></Link>
  </section>;
}
