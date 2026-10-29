import type { SiteLanguage } from "../../data/site-languages";
import s from "./ProjectCover.module.css";

export type ProjectKind = "workspace" | "commerce" | "studio" | "monitor" | "factory";

type Copy = {
  sketch: string; projects: string; portfolio: string; technical: string;
  catalog: string; cart: string; inventory: string; order: string;
  canvas: string; blocks: string; edit: string; export: string;
  manual: string; empty: string; latency: string;
  plan: string; review: string; package: string; disabled: string;
};
const copy: Record<SiteLanguage, Copy> = {
  es: {sketch:"Esquema de interfaz",projects:"Proyectos",portfolio:"Portafolio",technical:"Asistencia técnica",catalog:"Catálogo",cart:"Carrito",inventory:"Inventario",order:"Pedido de prueba",canvas:"Tu próximo lienzo",blocks:"Bloques",edit:"Editar",export:"Exportar HTML",manual:"Medición manual",empty:"Sin mediciones",latency:"Latencia",plan:"Planificar",review:"Revisar",package:"Empaquetar",disabled:"Ejecución desactivada"},
  en: {sketch:"Interface sketch",projects:"Projects",portfolio:"Portfolio",technical:"Technical assistance",catalog:"Catalog",cart:"Cart",inventory:"Inventory",order:"Demo order",canvas:"Your next canvas",blocks:"Blocks",edit:"Edit",export:"Export HTML",manual:"Manual checks",empty:"No measurements",latency:"Latency",plan:"Plan",review:"Review",package:"Package",disabled:"Execution disabled"},
  de: {sketch:"Oberflächenskizze",projects:"Projekte",portfolio:"Portfolio",technical:"Technische Hilfe",catalog:"Katalog",cart:"Warenkorb",inventory:"Bestand",order:"Testbestellung",canvas:"Deine nächste Leinwand",blocks:"Blöcke",edit:"Bearbeiten",export:"HTML exportieren",manual:"Manuelle Messung",empty:"Keine Messwerte",latency:"Latenz",plan:"Planen",review:"Prüfen",package:"Paket",disabled:"Ausführung deaktiviert"},
  fr: {sketch:"Esquisse d’interface",projects:"Projets",portfolio:"Portfolio",technical:"Assistance technique",catalog:"Catalogue",cart:"Panier",inventory:"Stock",order:"Commande démo",canvas:"Votre prochaine création",blocks:"Blocs",edit:"Modifier",export:"Exporter HTML",manual:"Mesure manuelle",empty:"Aucune mesure",latency:"Latence",plan:"Planifier",review:"Vérifier",package:"Créer le paquet",disabled:"Exécution désactivée"},
  pt: {sketch:"Esboço de interface",projects:"Projetos",portfolio:"Portfólio",technical:"Assistência técnica",catalog:"Catálogo",cart:"Carrinho",inventory:"Estoque",order:"Pedido de teste",canvas:"Sua próxima tela",blocks:"Blocos",edit:"Editar",export:"Exportar HTML",manual:"Medição manual",empty:"Sem medições",latency:"Latência",plan:"Planejar",review:"Revisar",package:"Empacotar",disabled:"Execução desativada"},
};

/** A decorative product sketch, never a screenshot or a source of live metrics. */
export default function ProjectCover({project,language,spacious=false}:{project:ProjectKind;language:SiteLanguage;spacious?:boolean}) {
  const t=copy[language];
  return <div className={`${s.cover} ${s[project]} ${spacious?s.spacious:""}`} aria-hidden="true">
    <div className={s.coverTop}><span>N / {project.toUpperCase()}</span><span>{t.sketch}</span></div>
    {project==="workspace"&&<div className={s.workspaceWindow}>
      <div className={s.workspaceRail}><b>N</b><i/><i/><i/></div>
      <div className={s.workspaceBody}><span className={s.eyebrow}>NEXUS AI</span><strong>{t.projects}<span>→</span></strong>
        <div className={s.noteCards}><div><i/><i/><i/></div><div><i/><i/><i/></div><div><i/><i/><i/></div></div>
        <div className={s.assistants}><span>◈ {t.portfolio}</span><span>⌘ {t.technical}</span></div>
      </div>
    </div>}
    {project==="commerce"&&<div className={s.shopWindow}>
      <div className={s.shopHeader}><b>NEXUS / SHOP</b><span>{t.cart} <span>→</span></span></div>
      <div className={s.shopHeading}>{t.catalog}<span>↘</span></div>
      <div className={s.goods}><div><div className={s.keyboard}/><i/></div><div><div className={s.headphones}/><i/></div><div><div className={s.screen}/><i/></div></div>
      <div className={s.shopFooter}><span>{t.inventory}</span><span>→</span><span>{t.order}</span></div>
    </div>}
    {project==="studio"&&<div className={s.studioWindow}>
      <div className={s.editorBar}><span>◩ &nbsp; ＋ &nbsp; ↶</span><span>{t.export} →</span></div>
      <div className={s.editorBody}><div className={s.layers}><small>{t.blocks}</small><i/><i/><i/></div><div className={s.artboard}><span>✦</span><strong>{t.canvas}<span>.</span></strong><i/><i/><div>{t.edit} →</div></div><div className={s.properties}><i/><i/><i/></div></div>
    </div>}
    {project==="monitor"&&<div className={s.monitorWindow}>
      <div className={s.monitorHeader}><b>API / HEALTH</b><span>{t.manual}</span></div>
      <div className={s.chart}><span>{t.empty}</span><i/></div>
      <div className={s.monitorFooter}><span>GET /api/labs/health</span><span>{t.latency} —</span></div>
    </div>}
    {project==="factory"&&<div className={s.factoryWindow}>
      <div className={s.factoryHeader}><span>⌘ NEXUS / FACTORY</span><b>→</b></div>
      <div className={s.pipeline}><div><small>01</small><strong>{t.plan}</strong></div><span>→</span><div><small>02</small><strong>{t.review}</strong></div><span>→</span><div><small>03</small><strong>{t.package}</strong></div></div>
      <div className={s.codeFiles}><span>index.html</span><span>styles.css</span><span>README.md</span></div>
      <div className={s.factoryFooter}><span>▣ {t.disabled}</span><span>NOT_RUN</span></div>
    </div>}
  </div>;
}
