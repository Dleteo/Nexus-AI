import type { SiteLanguage } from "../../data/site-languages";
import Image from "next/image";
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

const workspaceDetails:Record<SiteLanguage,{
  intro:string;first:string;firstDesc:string;second:string;secondDesc:string;third:string;thirdDesc:string;
  status:string;projects:string;technical:string;
}>={
  es:{intro:"ESPACIO DE TRABAJO",first:"Nexus Portfolio",firstDesc:"Proyectos y CV",second:"Workspace",secondDesc:"Organiza tus ideas",third:"Nexus Technical",thirdDesc:"Consultas y código",status:"PORTAFOLIO",projects:"PROYECTOS",technical:"ASISTENCIA"},
  en:{intro:"WORKSPACE",first:"Nexus Portfolio",firstDesc:"Projects and CV",second:"Workspace",secondDesc:"Organize ideas",third:"Nexus Technical",thirdDesc:"Questions and code",status:"PORTFOLIO",projects:"PROJECTS",technical:"ASSISTANCE"},
  de:{intro:"ARBEITSBEREICH",first:"Nexus Portfolio",firstDesc:"Projekte und CV",second:"Workspace",secondDesc:"Ideen organisieren",third:"Nexus Technical",thirdDesc:"Fragen und Code",status:"PORTFOLIO",projects:"PROJEKTE",technical:"ASSISTENZ"},
  fr:{intro:"ESPACE DE TRAVAIL",first:"Nexus Portfolio",firstDesc:"Projets et CV",second:"Workspace",secondDesc:"Organiser les idées",third:"Nexus Technical",thirdDesc:"Questions et code",status:"PORTFOLIO",projects:"PROJETS",technical:"ASSISTANCE"},
  pt:{intro:"ESPAÇO DE TRABALHO",first:"Nexus Portfolio",firstDesc:"Projetos e CV",second:"Workspace",secondDesc:"Organizar ideias",third:"Nexus Technical",thirdDesc:"Perguntas e código",status:"PORTFÓLIO",projects:"PROJETOS",technical:"ASSISTÊNCIA"},
};

const shopEditorial:Record<SiteLanguage,{edition:string,headline:string,accent:string,sub:string,collection:string,view:string,note:string}> = {
  es:{edition:"THE EDIT / 2026",headline:"Objetos que",accent:"inspiran.",sub:"Tecnología esencial, diseño excepcional.",collection:"SELECCIÓN DESTACADA",view:"EXPLORAR COLECCIÓN",note:"FOTOGRAFÍAS ILUSTRATIVAS · TIENDA DEMO"},
  en:{edition:"THE EDIT / 2026",headline:"Made for",accent:"everyday.",sub:"Essential technology. Exceptional design.",collection:"THE CURATED EDIT",view:"EXPLORE COLLECTION",note:"ILLUSTRATIVE PHOTOS · DEMO STORE"},
  de:{edition:"THE EDIT / 2026",headline:"Für jeden",accent:"Tag.",sub:"Technik trifft auf besonderes Design.",collection:"UNSERE AUSWAHL",view:"KOLLEKTION ANSEHEN",note:"SYMBOLFOTOS · DEMO-SHOP"},
  fr:{edition:"THE EDIT / 2026",headline:"Le design au",accent:"quotidien.",sub:"Technologie essentielle et style affirmé.",collection:"NOTRE SÉLECTION",view:"EXPLORER LA COLLECTION",note:"PHOTOS D'ILLUSTRATION · DÉMO"},
  pt:{edition:"THE EDIT / 2026",headline:"Design para",accent:"o dia a dia.",sub:"Tecnologia essencial, estilo excepcional.",collection:"SELEÇÃO ESPECIAL",view:"EXPLORAR COLEÇÃO",note:"FOTOS ILUSTRATIVAS · LOJA DEMO"},
};
const shopCoverProducts = [
  {id:"keyboard",label:"KEYBOARD",price:"$79",photo:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&h=380&q=78"},
  {id:"headset",label:"AUDIO",price:"$59",photo:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&h=380&q=78"},
  {id:"monitor",label:"DISPLAY",price:"$249",photo:"https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=500&h=380&q=78"},
] as const;
const studioCoverCopy:Record<SiteLanguage,{layers:string,inspector:string,preview:string,heading:string,description:string,button:string,theme:string,spacing:string,alignment:string,export:string}> = {
  es:{layers:"CAPAS",inspector:"INSPECTOR",preview:"VISTA PREVIA",heading:"Diseña lo que sigue.",description:"Un espacio para tus mejores ideas.",button:"Explorar diseño",theme:"TEMA",spacing:"ESPACIADO",alignment:"ALINEACIÓN",export:"EXPORTAR HTML"},
  en:{layers:"LAYERS",inspector:"INSPECTOR",preview:"LIVE PREVIEW",heading:"Design what's next.",description:"A space for your best ideas.",button:"Explore design",theme:"THEME",spacing:"SPACING",alignment:"ALIGNMENT",export:"EXPORT HTML"},
  de:{layers:"EBENEN",inspector:"INSPEKTOR",preview:"VORSCHAU",heading:"Gestalte die Zukunft.",description:"Ein Raum für deine Ideen.",button:"Design entdecken",theme:"THEMA",spacing:"ABSTAND",alignment:"AUSRICHTUNG",export:"HTML EXPORT"},
  fr:{layers:"CALQUES",inspector:"INSPECTEUR",preview:"APERÇU",heading:"Créez la suite.",description:"Un espace pour vos idées.",button:"Explorer",theme:"THÈME",spacing:"ESPACEMENT",alignment:"ALIGNEMENT",export:"EXPORT HTML"},
  pt:{layers:"CAMADAS",inspector:"INSPETOR",preview:"PRÉVIA",heading:"Crie o próximo.",description:"Um espaço para suas ideias.",button:"Explorar design",theme:"TEMA",spacing:"ESPAÇAMENTO",alignment:"ALINHAMENTO",export:"EXPORTAR HTML"},
};
const monitorCoverLabels:Record<SiteLanguage,{health:string,checks:string,success:string,history:string,last:string,samples:string,preview:string}> = {
  es:{health:"Salud del servicio",checks:"PRUEBAS",success:"ÉXITO",history:"HISTORIAL DE RESPUESTAS",last:"ÚLTIMAS 20 PRUEBAS",samples:"SIN DATOS",preview:"VISTA DEMO / SIN DATOS"},
  en:{health:"Service health",checks:"CHECKS",success:"SUCCESS",history:"RESPONSE HISTORY",last:"LAST 20 CHECKS",samples:"NO DATA",preview:"DEMO VIEW / NO DATA"},
  de:{health:"Dienststatus",checks:"PRÜFUNGEN",success:"ERFOLG",history:"ANTWORTVERLAUF",last:"LETZTE 20",samples:"KEINE DATEN",preview:"DEMO / KEINE DATEN"},
  fr:{health:"État du service",checks:"CONTRÔLES",success:"RÉUSSITE",history:"HISTORIQUE",last:"20 DERNIERS",samples:"AUCUNE DONNÉE",preview:"DÉMO / SANS DONNÉES"},
  pt:{health:"Saúde do serviço",checks:"TESTES",success:"SUCESSO",history:"HISTÓRICO",last:"ÚLTIMOS 20",samples:"SEM DADOS",preview:"DEMO / SEM DADOS"},
};

/** A decorative product sketch, never a screenshot or a source of live metrics. */
export default function ProjectCover({project,language,spacious=false}:{project:ProjectKind;language:SiteLanguage;spacious?:boolean}) {
  const t=copy[language];
  return <div className={`${s.cover} ${s[project]} ${spacious?s.spacious:""}`} aria-hidden="true">
    <div className={s.coverTop}><span>N / {project.toUpperCase()}</span><span>{t.sketch}</span></div>
    {project==="workspace"&&<div className={s.workspaceWindow}>
      <div className={s.workspaceRail}><b>N</b><i/><i/><i/></div>
      <div className={s.workspaceBody}>
        <div className={s.workspaceHeader}><span className={s.eyebrow}>NEXUS AI / {workspaceDetails[language].intro}</span><span className={s.workspaceArrow}>↗</span></div>
        <strong className={s.workspaceTitle}>{t.projects}<span className={s.workspaceTitleSpark}>✦</span></strong>
        <div className={s.noteCards}>
          <div className={s.workspaceFeature}>
            <span className={s.workspaceFeatureTop}><span className={s.workspaceFeatureIcon}>◈</span><span className={s.workspaceFeatureMore}>⋮</span></span>
            <strong>{workspaceDetails[language].first}</strong><small>{workspaceDetails[language].firstDesc}</small>
            <div className={s.workspaceFeatureFoot}><span className={s.workspaceFeatureDots}><i/><i/><i/></span><span className={s.workspaceFeatureChip}>{workspaceDetails[language].status}</span></div>
          </div>
          <div className={s.workspaceFeature}>
            <span className={s.workspaceFeatureTop}><span className={s.workspaceFeatureIcon}>▤</span><span className={s.workspaceFeatureMore}>⋮</span></span>
            <strong>{workspaceDetails[language].second}</strong><small>{workspaceDetails[language].secondDesc}</small>
            <div className={s.workspaceFeatureFoot}><span className={s.workspaceFeatureBars}><i/><i/><i/><i/><i/></span><span className={s.workspaceFeatureChip}>{workspaceDetails[language].projects}</span></div>
          </div>
          <div className={s.workspaceFeature}>
            <span className={s.workspaceFeatureTop}><span className={s.workspaceFeatureIcon}>⌘</span><span className={s.workspaceFeatureMore}>⋮</span></span>
            <strong>{workspaceDetails[language].third}</strong><small>{workspaceDetails[language].thirdDesc}</small>
            <div className={s.workspaceFeatureFoot}><span className={s.workspaceFeatureNodes}><i/><i/><i/></span><span className={s.workspaceFeatureChip}>{workspaceDetails[language].technical}</span></div>
          </div>
        </div>
        <div className={s.assistants}><span className={s.workspaceTabActive}>◈ {t.portfolio}</span><span>⌘ {t.technical}</span></div>
      </div>
    </div>}
    {project==="commerce"&&<div className={s.shopWindow}>
      <div className={s.shopHeader}>
        <span className={s.shopMonogram}>N</span>
        <span className={s.shopBrand}>NEXUS / COMMERCE<small>THE ESSENTIALS COLLECTION</small></span>
        <span className={s.shopBag} aria-hidden="true">◫ <b>00</b></span>
      </div>
      <div className={s.shopEditorial}>
        <div className={s.shopEditorialCopy}>
          <span className={s.shopEyebrow}>{shopEditorial[language].edition}</span>
          <strong>{shopEditorial[language].headline} <em>{shopEditorial[language].accent}</em></strong>
          <small>{shopEditorial[language].sub}</small>
        </div>
        <div className={s.shopHeroPhoto}><Image unoptimized fill sizes="(max-width: 660px) 42vw, 230px" alt="" src={shopCoverProducts[0].photo}/></div>
      </div>
      <div className={s.shopCollectionHeading}><span>{shopEditorial[language].collection}</span><span>01 — 03</span></div>
      <div className={s.goods}>{shopCoverProducts.map((item)=><div className={s.shopProduct} key={item.id}>
        <div className={s.shopProductPhoto}><Image unoptimized fill sizes="(max-width: 660px) 28vw, 160px" alt="" src={item.photo}/></div>
        <div className={s.shopProductMeta}><b>{item.label}</b><span>{item.price}</span></div>
      </div>)}</div>
      <div className={s.shopFooter}><span>{shopEditorial[language].note}</span><span>{shopEditorial[language].view} ↗</span></div>
    </div>}
    {project==="studio"&&<div className={s.studioWindow}>
      <div className={s.studioChrome}>
        <div className={s.studioChromeIdentity}><span className={s.studioChromeSymbol} aria-hidden="true">✦</span><strong>NEXUS <span>/</span> STUDIO</strong><small>CREATIVE WORKSPACE</small></div>
        <div className={s.studioChromeControls} aria-hidden="true"><span>▣</span><span>▤</span><span>▯</span></div>
        <span className={s.studioChromeAction}>{studioCoverCopy[language].export} ↗</span>
      </div>
      <div className={s.studioEditorShell}>
        <aside className={s.studioLayerPanel}>
          <div className={s.studioPanelHeading}><span>{studioCoverCopy[language].layers}</span><b aria-hidden="true">＋</b></div>
          <div className={s.studioLayerActive}><span aria-hidden="true">▤</span> HERO <i>◉</i></div>
          <div className={s.studioLayer}><span aria-hidden="true">☷</span> TEXT <i>◉</i></div>
          <div className={s.studioLayer}><span aria-hidden="true">▣</span> BUTTON <i>◉</i></div>
          <div className={s.studioLayersFoot}><span aria-hidden="true">✧</span> 03 / LAYERS</div>
        </aside>
        <div className={s.studioCanvasArea}>
          <div className={s.studioCanvasBar}><span>{studioCoverCopy[language].preview}</span><span>100% <b>⌄</b></span></div>
          <div className={s.studioCanvasPaper}>
            <div className={s.studioPaperRibbon}><span>✳ THE DESIGN EDITION</span><span aria-hidden="true">↗</span></div>
            <div className={s.studioPaperBody}>
              <div className={s.studioPaperEyebrow}>CREATIVE / 001</div>
              <div className={s.studioPaperHeadline}>{studioCoverCopy[language].heading}</div>
              <div className={s.studioPaperDescription}>{studioCoverCopy[language].description}</div>
              <div className={s.studioPaperButton}>{studioCoverCopy[language].button} <span aria-hidden="true">↗</span></div>
            </div>
            <div className={s.studioPaperArtwork} aria-hidden="true"><span className={s.studioArtworkHalo}/><span className={s.studioArtworkShape}/><span className={s.studioArtworkOrb}/><span className={s.studioArtworkShine}/><span className={s.studioArtworkNumber}>Nº 01 / DIGITAL CRAFT</span></div>
            <div className={s.studioSelectionOutline}><span>HERO / SELECTED</span><i/><i/><i/><i/></div>
          </div>
          <div className={s.studioCanvasStatus}>DESIGN CANVAS <span>DESKTOP · 1440</span></div>
        </div>
        <aside className={s.studioPropertyPanel}>
          <div className={s.studioPanelHeading}><span>{studioCoverCopy[language].inspector}</span><b aria-hidden="true">⚙</b></div>
          <div className={s.studioPropertyLabel}>{studioCoverCopy[language].theme}</div>
          <div className={s.studioSwatches}><i/><i/><i/></div>
          <div className={s.studioPropertyLabel}>{studioCoverCopy[language].spacing}</div>
          <div className={s.studioPropertyBars}><i/><i/><i/></div>
          <div className={s.studioPropertyLabel}>{studioCoverCopy[language].alignment}</div>
          <div className={s.studioPropertyAlignment}><span>☷</span><span>≡</span></div>
        </aside>
      </div>
      <div className={s.studioWindowFoot}><span><i/> LOCAL / EDITOR</span><span>RESPONSIVE · 3 THEMES · STATIC HTML</span></div>
    </div>}
    {project==="monitor"&&<div className={s.monitorWindow}>
      <div className={s.monitorChrome}><span className={s.monitorBrandIcon} aria-hidden="true">✚</span><div className={s.monitorBrand}><strong>NEXUS <span>/</span> MONITOR</strong><small>CLINICAL SYSTEMS / API HEALTH</small></div><span className={s.monitorPreviewTag}>{monitorCoverLabels[language].preview}</span></div>
      <div className={s.monitorConsole}>
        <div className={s.monitorSidebar} aria-hidden="true"><span className={s.monitorSidebarActive}>✚</span><span>▦</span><span>⌁</span><span>⚙</span></div>
        <div className={s.monitorContent}>
          <div className={s.monitorHeader}><div><span className={s.monitorSectionKicker}>OVERVIEW / 01</span><b>{monitorCoverLabels[language].health}</b></div><span className={s.monitorUnmeasured}><i/>{t.empty}</span></div>
          <div className={s.monitorMetricCards}>
            <div><span>{monitorCoverLabels[language].checks}</span><strong>0</strong><small>{t.manual}</small></div>
            <div><span>{monitorCoverLabels[language].success}</span><strong>—</strong><small>{monitorCoverLabels[language].samples}</small></div>
            <div><span>P95 LATENCY</span><strong>—</strong><small>MS / {monitorCoverLabels[language].samples}</small></div>
          </div>
          <div className={s.monitorGraphPane}>
            <div className={s.monitorGraphHead}><span>{monitorCoverLabels[language].history}</span><small>{monitorCoverLabels[language].last}</small></div>
            <div className={s.monitorGraphGrid}><span className={s.monitorZeroLabel}>{t.empty}</span><i className={s.monitorBaseline}/></div>
            <div className={s.monitorGraphFoot}><span>0 MS</span><span>— MS</span></div>
          </div>
          <div className={s.monitorFooter}><span><i/> MANUAL PROBES ONLY</span><span>GET /api/labs/health</span></div>
        </div>
      </div>
    </div>}
    {project==="factory"&&<div className={s.factoryWindow}>
      <div className={s.factoryHeader}>
        <span className={s.factoryHeaderIdentity}><span className={s.factoryHeaderSymbol} aria-hidden="true">◈</span><span><strong>NEXUS / SOFTWARE FACTORY</strong><small>BUILD OPERATIONS · LOCAL WORKFLOW</small></span></span>
        <span className={s.factoryHeaderState}><i aria-hidden="true"/> REVIEW REQUIRED</span>
      </div>
      <div className={s.factoryWorkbenchPreview}>
        <div className={s.factoryPipelinePanel}>
          <div className={s.factoryPanelCaption}><span>WORKFLOW / 001</span><span>4 STATIONS</span></div>
          <div className={s.factoryPanelTitle}>Ship with confidence<span aria-hidden="true">.</span></div>
          <div className={s.pipeline}>
            <div><small>01 / INTAKE</small><strong>{t.plan}</strong><i aria-hidden="true">⌑</i></div>
            <div><small>02 / GATE</small><strong>{t.review}</strong><i aria-hidden="true">◇</i></div>
            <div><small>03 / BUILD</small><strong>{t.package}</strong><i aria-hidden="true">▣</i></div>
            <div><small>04 / CHECK</small><strong>STATIC QA</strong><i aria-hidden="true">✓</i></div>
          </div>
          <div className={s.factoryGate}><span aria-hidden="true">◧</span> HUMAN APPROVAL GATE <strong>REQUIRED</strong></div>
        </div>
        <aside className={s.factoryArtifactPanel}>
          <div className={s.factoryPanelCaption}><span>ARTIFACT EXPLORER</span><span>▣</span></div>
          <div className={s.factoryArtifactTree}>
            <span className={s.factoryArtifactFolder}>⌄ &nbsp; ▣ starter-page/</span>
            <span>⌑ &nbsp; index.html</span>
            <span>⌑ &nbsp; styles.css</span>
            <span>⌑ &nbsp; README.md</span>
          </div>
          <div className={s.factoryTerminal}><span>$ nexus factory inspect</span><strong>execution.enabled = false</strong><small>status: not_run</small></div>
        </aside>
      </div>
      <div className={s.factoryFooter}><span><i aria-hidden="true"/> TEMPLATE-BOUND / REVIEWABLE</span><span>◧ {t.disabled}</span></div>
    </div>}
  </div>;
}
