"use client";

import Link from "next/link";
import {useState, type FormEvent} from "react";
import type {SiteLanguage} from "../../data/site-languages";
import {careerTranslate} from "../../data/career-translation";
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
  function goToChat(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query=draft.trim();
    if(!query)return;
    // No simulation: a real reply requires a signed-in session and configured backend.
    // Do not persist private questions in URL, analytics or localStorage.
    window.location.assign("/assistant");
  }
  return <section className={styles.featuredChat} aria-label={t("Vista previa interactiva de Nexus Technical","Interactive Nexus Technical preview","Interaktive Nexus-Technical-Vorschau","Aperçu interactif de Nexus Technical","Prévia interativa do Nexus Technical")}>
    <div className={styles.featuredChatBar}>
      <span className={styles.featuredChatMark}>N</span>
      <div><strong>Nexus Technical</strong><small>{t("Guías técnicas propias · prueba local","Original technical guides · local test","Eigene technische Anleitungen · lokaler Test","Guides techniques propres · essai local","Guias técnicas próprias · teste local")}</small></div>
      <span className={styles.featuredChatStatus} title={t("Demostración de interfaz, no conexión verificada","UI preview, connection not verified","UI-Vorschau, Verbindung nicht geprüft","Aperçu de l’interface, connexion non vérifiée","Prévia da interface, conexão não verificada")}>{t("DEMO","PREVIEW","VORSCHAU","APERÇU","PRÉVIA")}</span>
    </div>
    <div className={styles.featuredChatMessages}>
      <div className={styles.featuredChatBubble}>
        <b>Nexus Technical</b>
        <p>{t("Hola. Puedo orientarte sobre errores de Python, TypeScript, Windows y seguridad usando guías revisadas.","Hello. I can guide you through Python, TypeScript, Windows and security issues using reviewed guides.","Hallo. Ich helfe bei Python-, TypeScript-, Windows- und Sicherheitsfragen mit geprüften Anleitungen.","Bonjour. Je peux aider avec Python, TypeScript, Windows et la sécurité à partir de guides vérifiés.","Olá. Posso ajudar com Python, TypeScript, Windows e segurança usando guias revisados.")}</p>
      </div>
      <div className={styles.featuredChatSuggestions} aria-label={t("Ejemplos para explorar","Examples to explore","Beispielfragen","Exemples à explorer","Exemplos para explorar")}>
        {sampleQuestions.slice(0,2).map((q,i)=><button key={q} type="button" onClick={()=>{setDraft(q);setShowInfo(true)}}>{i===0?"Python: import":"TypeScript: TS2322"}</button>)}
      </div>
    </div>
    <form className={styles.featuredChatForm} onSubmit={goToChat}>
      <label className={styles.featuredChatLabel} htmlFor="featured-technical-question">{t("Tu pregunta técnica","Your technical question","Deine technische Frage","Votre question technique","Sua pergunta técnica")}</label>
      <div className={styles.featuredChatInputRow}>
        <input id="featured-technical-question" maxLength={4000} value={draft} onChange={e=>{setDraft(e.target.value);setShowInfo(false)}} placeholder={t("Pregunta sobre software o código…","Ask about software or code…","Frage zu Software oder Code…","Question sur un logiciel ou du code…","Pergunte sobre software ou código…")} />
        <button type="submit" disabled={!draft.trim()} aria-label={t("Abrir asistente real","Open real assistant","Echten Assistenten öffnen","Ouvrir le véritable assistant","Abrir assistente real")}>↗</button>
      </div>
      <p className={styles.featuredChatDisclaimer}>{showInfo?t("Ejemplo seleccionado. Continúa en el asistente con tu sesión.","Example selected. Continue in the assistant after signing in.","Beispiel gewählt. Im Assistenten nach Anmeldung fortfahren.","Exemple choisi. Poursuivez dans l’assistant après connexion.","Exemplo selecionado. Continue no assistente após entrar."):t("Para recibir respuestas debes iniciar sesión. Esta tarjeta no simula IA.","Sign in to receive answers. This card does not simulate AI.","Für Antworten anmelden. Diese Karte simuliert keine KI.","Connectez-vous pour obtenir des réponses. Cette carte ne simule pas d’IA.","Entre para receber respostas. Este cartão não simula IA.")}</p>
    </form>
    <Link className={styles.featuredChatFull} href="/assistant">{t("Abrir chat completo","Open full chat","Vollständigen Chat öffnen","Ouvrir le chat complet","Abrir chat completo")} <span aria-hidden="true">→</span></Link>
  </section>;
}
