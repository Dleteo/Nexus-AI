"use client";

import type { ReactNode } from "react";
import type { SiteLanguage } from "../../data/site-languages";
import type { LabId } from "./LabsWorkspace";

type Product = {id:string;name:string;category:string;price:number;stock:number};
type EditorBlock = {id:string;type:"hero"|"text"|"button";text:string};
type HealthCheck = {at:string;ok:boolean;ms:number};
type PipelineCounts = {proposed:number;approved:number;built:number};
type Props = {
  lab:LabId;
  language:SiteLanguage;
  inventory:readonly Product[];
  cartUnits:number;
  cartTotal:number;
  orderCount:number;
  blocks:readonly EditorBlock[];
  checks:readonly HealthCheck[];
  p95:number|null;
  pipeline:PipelineCounts;
};
const labels = {
  commerce:{
    es:["CATÁLOGO / DEMOSTRACIÓN","Compra con claridad.","Tienda interactiva sin pagos reales.","Artículos","En carrito","Pedidos de prueba","Explorar catálogo"],
    en:["CATALOG / DEMONSTRATION","Shop with clarity.","Interactive storefront. No real payments.","Products","In cart","Demo orders","Browse catalog"],
    de:["KATALOG / DEMO","Klar einkaufen.","Interaktiver Shop ohne echte Zahlungen.","Produkte","Warenkorb","Testbestellungen","Katalog öffnen"],
    fr:["CATALOGUE / DÉMO","Acheter en toute clarté.","Boutique interactive sans paiement réel.","Produits","Panier","Commandes démo","Voir le catalogue"],
    pt:["CATÁLOGO / DEMO","Compre com clareza.","Loja interativa sem pagamentos reais.","Produtos","Carrinho","Pedidos de teste","Explorar catálogo"]
  },
  studio:{
    es:["ESTUDIO / LIENZO VISUAL","Diseña. Edita. Exporta.","Los bloques que ves provienen del editor real.","Bloques","Vista previa","PROPIEDADES","Abrir editor"],
    en:["STUDIO / LIVE CANVAS","Design. Edit. Export.","These blocks come from your actual editor.","Blocks","Live preview","PROPERTIES","Open editor"],
    de:["STUDIO / LEINWAND","Gestalten. Bearbeiten. Exportieren.","Blöcke aus dem tatsächlichen Editor.","Blöcke","Vorschau","EIGENSCHAFTEN","Editor öffnen"],
    fr:["STUDIO / CANEVAS","Créer. Modifier. Exporter.","Blocs issus de l'éditeur réel.","Blocs","Aperçu","PROPRIÉTÉS","Ouvrir l’éditeur"],
    pt:["STUDIO / TELA","Crie. Edite. Exporte.","Blocos do editor real.","Blocos","Prévia","PROPRIEDADES","Abrir editor"]
  },
  monitor:{
    es:["OBSERVABILIDAD / MANUAL","Métricas sin ficción.","La gráfica representa únicamente comprobaciones realizadas.","Comprobaciones","Correctas","Latencia p95","Ejecutar comprobación"],
    en:["OBSERVABILITY / MANUAL","Metrics, not fiction.","The chart shows only checks you have run.","Checks","Successful","p95 latency","Run health check"],
    de:["MONITORING / MANUELL","Messwerte, keine Fiktion.","Die Grafik zeigt nur ausgeführte Prüfungen.","Prüfungen","Erfolgreich","p95-Latenz","Prüfung starten"],
    fr:["OBSERVABILITÉ / MANUEL","Des mesures réelles.","Le graphique affiche uniquement les contrôles lancés.","Contrôles","Réussis","Latence p95","Lancer un contrôle"],
    pt:["OBSERVABILIDADE / MANUAL","Métricas reais.","O gráfico mostra apenas verificações executadas.","Verificações","Bem-sucedidas","Latência p95","Executar verificação"]
  },
  factory:{
    es:["INGENIERÍA / FLUJO REVISADO","Del plan a la revisión.","Propuestas y aprobaciones humanas; ejecución desactivada.","Propuestos","Aprobados","Paquetes creados","Abrir flujo"],
    en:["ENGINEERING / REVIEW PIPELINE","From plan to review.","Human approvals and static packaging; execution disabled.","Proposed","Approved","Packages built","Open workflow"],
    de:["ENGINEERING / FREIGABEPROZESS","Von der Planung zur Prüfung.","Manuelle Freigabe; Ausführung deaktiviert.","Vorgeschlagen","Freigegeben","Pakete","Workflow öffnen"],
    fr:["INGÉNIERIE / VALIDATION","Du plan à la revue.","Validation humaine ; exécution désactivée.","Proposés","Approuvés","Paquets créés","Ouvrir le flux"],
    pt:["ENGENHARIA / REVISÃO","Do plano à revisão.","Aprovação humana; execução desativada.","Propostos","Aprovados","Pacotes criados","Abrir fluxo"]
  }
} as const;

function Title({lab,language,children}:{lab:LabId;language:SiteLanguage;children:ReactNode}){
  const label=labels[lab][language];
  return <div className="lab-overview-intro"><span className="lab-overview-kicker">{label[0]}</span><h2>{label[1]}</h2><p>{label[2]}</p>{children}<a className="lab-overview-cta" href={"#"+lab+"-controls"}>{label[6]} <span aria-hidden="true">↘</span></a></div>;
}

export default function LabProductOverview({lab,language,inventory,cartUnits,cartTotal,orderCount,blocks,checks,p95,pipeline}:Props){
  const l=labels[lab][language];
  const money=(value:number)=>new Intl.NumberFormat(language,{style:"currency",currency:"USD"}).format(value);
  const successful=checks.filter(c=>c.ok).length;
  return <section className={"lab-product-overview lab-product-overview-"+lab} aria-label={lab+" product overview"}>
    <Title lab={lab} language={language}>
      {lab==="commerce"&&<div className="lab-overview-stats"><div><b>{inventory.length}</b><span>{l[3]}</span></div><div><b>{cartUnits}</b><span>{l[4]}</span></div><div><b>{orderCount}</b><span>{l[5]}</span></div></div>}
      {lab==="studio"&&<div className="lab-overview-stats"><div><b>{blocks.length}</b><span>{l[3]}</span></div><div><b>HTML</b><span>EXPORT</span></div></div>}
      {lab==="monitor"&&<div className="lab-overview-stats"><div><b>{checks.length}</b><span>{l[3]}</span></div><div><b>{successful}</b><span>{l[4]}</span></div><div><b>{p95===null?"—":p95+" ms"}</b><span>{l[5]}</span></div></div>}
      {lab==="factory"&&<div className="lab-overview-stats"><div><b>{pipeline.proposed}</b><span>{l[3]}</span></div><div><b>{pipeline.approved}</b><span>{l[4]}</span></div><div><b>{pipeline.built}</b><span>{l[5]}</span></div></div>}
    </Title>
    {lab==="commerce"&&<div className="lab-overview-screen lab-screen-commerce" aria-label="Local storefront preview">
      <div className="lab-screen-top"><strong>NEXUS / SHOP</strong><span>{cartUnits} BAG</span></div>
      <div className="lab-screen-products">{inventory.slice(0,3).map((product,index)=><div className="lab-screen-product" key={product.id}>
        <div className="lab-screen-product-photo" aria-hidden="true">{["⌨","◉","▣"][index]||"◈"}</div>
        <small>{product.category}</small><b>{product.name}</b><span>{money(product.price)}</span>
      </div>)}</div>
      <div className="lab-screen-bottom"><span>{inventory.length} ITEMS</span><strong>{money(cartTotal)} · BAG</strong></div>
    </div>}
    {lab==="studio"&&<div className="lab-overview-screen lab-screen-studio" aria-label="Preview of the current editable blocks">
      <div className="lab-studio-rail" aria-hidden="true"><span>▦</span><span>＋</span><span>◩</span><span>☷</span></div>
      <div className="lab-studio-artboard"><div className="lab-studio-artboard-top">PAGE / PREVIEW <span>●</span></div><div className="lab-studio-artboard-body">{blocks.slice(0,5).map(block=><div key={block.id} className={"lab-studio-preview-"+block.type}>{block.text}</div>)}</div></div>
      <div className="lab-studio-properties"><strong>{l[5]}</strong><span>TYPE</span><b>{blocks[0]?.type||"—"}</b><span>LAYERS</span><b>{blocks.length}</b><div className="lab-studio-swatches"><i/><i/><i/></div></div>
    </div>}
    {lab==="monitor"&&<div className="lab-overview-screen lab-screen-monitor" aria-label="Chart of actual manually collected checks">
      <div className="lab-screen-top"><strong>API / HEALTH</strong><span>{checks.length?"MANUAL DATA":"NO SAMPLES"}</span></div>
      <div className="lab-monitor-chart">{checks.length===0?<div className="lab-monitor-empty">NO CHECKS YET —</div>:checks.slice(0,14).reverse().map((check,i)=><div key={check.at+"-"+i} title={check.ms+" ms"} className={check.ok?"lab-monitor-bar-ok":"lab-monitor-bar-fail"} style={{height:Math.max(10,Math.min(100,check.ms/Math.max(...checks.map(c=>c.ms),1)*100))+"%"}}/>)}</div>
      <div className="lab-monitor-chart-axis"><span>0 ms</span><span>LAST {Math.min(checks.length,14)} CHECKS</span><span>{p95===null?"p95 —":"p95 "+p95+" ms"}</span></div>
      <div className="lab-screen-bottom"><span>● LOCAL ENDPOINT ONLY</span><strong>{successful}/{checks.length} PASSED</strong></div>
    </div>}
    {lab==="factory"&&<div className="lab-overview-screen lab-screen-factory" aria-label="Review pipeline and execution disclosure">
      <div className="lab-screen-top"><strong>NEXUS / PIPELINE</strong><span>REVIEW REQUIRED</span></div>
      <div className="lab-factory-stages"><div><small>01 / PLAN</small><strong>{pipeline.proposed} PROPOSED</strong></div><span aria-hidden="true">→</span><div><small>02 / APPROVE</small><strong>{pipeline.approved} APPROVED</strong></div><span aria-hidden="true">→</span><div><small>03 / PACKAGE</small><strong>{pipeline.built} BUILT</strong></div></div>
      <div className="lab-factory-console"><span>$ nexus factory status</span><strong>execution.enabled = false</strong><small>status: not_run · isolation_not_verified</small></div>
    </div>}
  </section>;
}
