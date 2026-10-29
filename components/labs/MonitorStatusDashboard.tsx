"use client";

import type {SiteLanguage} from "../../data/site-languages";

type Check = {at:string;ok:boolean;ms:number};
type Copy = {title:string;subtitle:string;endpoint:string;scope:string;unknown:string;passed:string;failed:string;last:string;checks:string;successful:string;p95:string;trend:string;empty:string;run:string;running:string;success:string;failure:string;note:string;latest:string;history:string;clinical:string;disclosure:string};
const copy:Record<SiteLanguage,Copy>={
 es:{title:"Centro de salud del servicio",subtitle:"Una lectura clara de las pruebas que realmente ejecutaste.",endpoint:"SERVICIO OBSERVADO",scope:"COMPROBACIÓN MANUAL",unknown:"SIN MEDICIONES",passed:"ÚLTIMA PRUEBA CORRECTA",failed:"ERROR EN ÚLTIMA PRUEBA",last:"Última medición",checks:"Pruebas realizadas",successful:"Correctas",p95:"Latencia p95",trend:"HISTORIAL DE RESPUESTAS",empty:"Sin datos todavía. Ejecuta una comprobación para ver los resultados.",run:"Comprobar ahora",running:"Comprobando…",success:"Correcta",failure:"Fallida",note:"Resultados de pruebas manuales, no tiempo de actividad continuo ni SLA.",latest:"ÚLTIMA MUESTRA",history:"Últimas 20 comprobaciones",clinical:"Telemetría del sistema",disclosure:"Diseño inspirado en monitores hospitalarios. No mide pacientes ni signos vitales."},
 en:{title:"Service health overview",subtitle:"A clear view of the checks you actually ran.",endpoint:"OBSERVED SERVICE",scope:"MANUAL CHECK",unknown:"NO MEASUREMENTS",passed:"LATEST CHECK PASSED",failed:"LATEST CHECK FAILED",last:"Last measurement",checks:"Recorded checks",successful:"Successful",p95:"p95 latency",trend:"RESPONSE HISTORY",empty:"No data yet. Run a health check to see real results.",run:"Check service now",running:"Checking…",success:"Passed",failure:"Failed",note:"Manually triggered samples, not continuous uptime or an SLA.",latest:"LATEST SAMPLE",history:"Last 20 checks",clinical:"System telemetry",disclosure:"Hospital-inspired interface. No patient data or vital signs are measured."},
 de:{title:"Dienststatus im Überblick",subtitle:"Nur tatsächlich durchgeführte Prüfungen.",endpoint:"BEOBACHTETER DIENST",scope:"MANUELLE PRÜFUNG",unknown:"KEINE MESSWERTE",passed:"LETZTE PRÜFUNG ERFOLGREICH",failed:"LETZTE PRÜFUNG FEHLGESCHLAGEN",last:"Letzte Messung",checks:"Prüfungen",successful:"Erfolgreich",p95:"p95-Latenz",trend:"ANTWORTVERLAUF",empty:"Noch keine Daten. Starte eine Prüfung.",run:"Dienst prüfen",running:"Prüfung läuft…",success:"Erfolg",failure:"Fehler",note:"Manuelle Messungen, keine kontinuierliche Verfügbarkeit oder SLA.",latest:"LETZTE MESSUNG",history:"Letzte 20 Prüfungen",clinical:"Systemtelemetrie",disclosure:"Krankenhaus-inspiriert. Keine Patienten- oder Vitaldaten."},
 fr:{title:"État du service",subtitle:"Une lecture claire des contrôles réellement lancés.",endpoint:"SERVICE OBSERVÉ",scope:"CONTRÔLE MANUEL",unknown:"AUCUNE MESURE",passed:"DERNIER CONTRÔLE RÉUSSI",failed:"DERNIER CONTRÔLE ÉCHOUÉ",last:"Dernière mesure",checks:"Contrôles",successful:"Réussis",p95:"Latence p95",trend:"HISTORIQUE DES RÉPONSES",empty:"Aucune donnée. Lancez un contrôle pour voir les résultats.",run:"Contrôler le service",running:"Contrôle…",success:"Réussi",failure:"Échec",note:"Échantillons manuels, pas de disponibilité continue ou de SLA.",latest:"DERNIÈRE MESURE",history:"20 derniers contrôles",clinical:"Télémétrie système",disclosure:"Interface inspirée de l’hôpital. Aucune donnée patient ni signe vital mesuré."},
 pt:{title:"Saúde do serviço",subtitle:"Uma visão clara das verificações realmente executadas.",endpoint:"SERVIÇO OBSERVADO",scope:"VERIFICAÇÃO MANUAL",unknown:"SEM MEDIÇÕES",passed:"ÚLTIMA VERIFICAÇÃO CORRETA",failed:"ÚLTIMA VERIFICAÇÃO FALHOU",last:"Última medição",checks:"Verificações",successful:"Corretas",p95:"Latência p95",trend:"HISTÓRICO DE RESPOSTAS",empty:"Ainda sem dados. Execute uma verificação para ver resultados.",run:"Verificar serviço",running:"Verificando…",success:"Correta",failure:"Falha",note:"Amostras manuais, sem disponibilidade contínua nem SLA.",latest:"ÚLTIMA AMOSTRA",history:"Últimas 20 verificações",clinical:"Telemetria do sistema",disclosure:"Interface inspirada em hospitais. Não mede pacientes nem sinais vitais."}
};

export default function MonitorStatusDashboard({checks,p95,language,isChecking,onCheck,localMode}:{
 checks:readonly Check[];p95:number|null;language:SiteLanguage;isChecking:boolean;onCheck:()=>void;localMode:boolean;
}){
 const t=copy[language];
 const latest=checks[0];
 const successful=checks.filter(check=>check.ok).length;
 const series=checks.slice(0,20).reverse();
 const max=Math.max(1,...series.map(check=>check.ms));
 const sampledPercent=checks.length?Math.round(successful/checks.length*100):null;
 const status=latest?(latest.ok?"ok":"error"):"unknown";
 const when=latest?new Date(latest.at):null;
 return <section className="monitor-status-dashboard" aria-label="Monitor sample status dashboard" data-monitor-status={status}>
  <div className="monitor-dashboard-top">
   <div className="monitor-dashboard-brand"><span className="monitor-brand-symbol" aria-hidden="true">⌁</span><div><span className="monitor-overline">NEXUS / OBSERVABILITY</span><h2>{t.title}</h2><p>{t.subtitle}</p></div></div>
   <div className="monitor-status-chip" role="status"><span aria-hidden="true" className="monitor-status-led"/>{status==="unknown"?t.unknown:status==="ok"?t.passed:t.failed}</div>
  </div>
  <div className="monitor-clinical-rail" aria-label={t.disclosure}>
   <div className="monitor-clinical-icon" aria-hidden="true">✚</div>
   <div className="monitor-clinical-copy"><strong>{t.clinical}</strong><span>{t.disclosure}</span></div>
   <svg className="monitor-clinical-wave" viewBox="0 0 480 65" aria-hidden="true" focusable="false" preserveAspectRatio="none">
     <path d="M0 34 H90 L104 34 L113 28 L122 39 L134 34 L145 34 L156 20 L165 48 L174 6 L184 60 L192 34 H270 L281 34 L291 26 L301 39 L311 34 H328 L340 20 L351 49 L362 7 L373 59 L383 34 H480" />
   </svg>
  </div>
  <div className="monitor-target-bar"><div><span className="monitor-overline">{t.endpoint}</span><code>GET /api/labs/health</code></div><div><span className="monitor-mode-tag">◉ {t.scope}</span><small>{localMode?"SQLite · localhost":"Browser · same origin"}</small></div><button type="button" className="monitor-run-button" disabled={isChecking} onClick={onCheck}>{isChecking?t.running:t.run} <span aria-hidden="true">↗</span></button></div>
  <div className="monitor-metrics-grid">
   <div className="monitor-metric"><span className="monitor-metric-label">{t.checks}</span><strong>{checks.length}</strong><small>{t.scope}</small><span className="monitor-metric-icon" aria-hidden="true">▦</span></div>
   <div className="monitor-metric"><span className="monitor-metric-label">{t.successful}</span><strong>{sampledPercent===null?"—":sampledPercent+"%"}</strong><small>{successful} / {checks.length}</small><span className="monitor-metric-icon" aria-hidden="true">◉</span></div>
   <div className="monitor-metric"><span className="monitor-metric-label">{t.p95}</span><strong>{p95===null?"—":p95}<span className="monitor-metric-unit">{p95===null?"":" ms"}</span></strong><small>{t.latest}: {latest?latest.ms+" ms":"—"}</small><span className="monitor-metric-icon" aria-hidden="true">⌁</span></div>
  </div>
  <div className="monitor-graph-panel">
   <div className="monitor-graph-heading"><div><span className="monitor-overline">{t.trend}</span><strong>{t.history}</strong></div><div className="monitor-graph-legend"><span><i className="monitor-legend-ok"/>{t.success}</span><span><i className="monitor-legend-error"/>{t.failure}</span></div></div>
   <div className="monitor-graph-surface">
    {series.length===0?<div className="monitor-graph-empty"><span aria-hidden="true">⌁</span><strong>{t.unknown}</strong><p>{t.empty}</p></div>:<div className="monitor-graph-bars" role="img" aria-label={t.history+": "+series.map(check=>(check.ok?t.success:t.failure)+" "+check.ms+" ms").join(", ")}>{series.map((check,index)=><span key={check.at+"-"+index} title={(check.ok?t.success:t.failure)+" · "+check.ms+" ms"} data-result={check.ok?"ok":"error"} style={{height:Math.max(8,Math.min(100,check.ms/max*100))+"%"}}/>)}</div>}
   </div>
   <div className="monitor-graph-axis"><span>0 ms</span><span>{series.length?max+" ms":"—"}</span></div>
  </div>
  <footer className="monitor-dashboard-foot"><span>{t.note}</span><span>{t.last}: {when&&!Number.isNaN(when.getTime())?when.toLocaleString(language):"—"}</span></footer>
 </section>;
}
