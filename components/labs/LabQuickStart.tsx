import type {SiteLanguage} from "../../data/site-languages";

type LabId="commerce"|"studio"|"monitor"|"factory";
type Guide={heading:string;steps:[string,string,string];caution:string};
const titles:Record<SiteLanguage,string>={
  es:"Recorrido de la demostración",en:"Demo walkthrough",
  de:"Demo-Ablauf",fr:"Parcours de démonstration",pt:"Roteiro de demonstração",
};
const limits:Record<SiteLanguage,string>={
  es:"Alcance verificado",en:"Verified scope",de:"Verifizierter Umfang",
  fr:"Portée vérifiée",pt:"Escopo verificado",
};
const guide:Record<SiteLanguage,Record<LabId,Guide>>={
  es:{
    commerce:{heading:"Carrito e inventario",steps:["Busca un producto o filtra por categoría.","Añade unidades, revisa precios y registra un pedido simulado.","Exporta los pedidos y, solo en localhost, prueba SQLite."],caution:"Sin pagos reales, cuentas de clientes ni base de datos pública."},
    studio:{heading:"Edición con recuperación",steps:["Modifica un bloque y comprueba la vista previa.","Prueba deshacer, rehacer e importar JSON tras revisarlo.","Exporta HTML o usa revisiones SQLite solo en localhost."],caution:"No publica sitios ni ejecuta el HTML importado."},
    monitor:{heading:"Mediciones e incidentes",steps:["Ejecuta una comprobación manual de salud.","Compara muestras, fallos y latencias p95.","Exporta CSV y revisa las alertas locales si habilitas SQLite."],caution:"No es vigilancia continua ni demuestra un SLA."},
    factory:{heading:"Planificación y revisión humana",steps:["Escribe una solicitud y genera un plan revisable.","Confirma expresamente la revisión antes de cambiar de estado.","En localhost, examina las fuentes y genera un ZIP de plantilla fija."],caution:"No hay agentes autónomos ni ejecución de código generado."},
  },
  en:{
    commerce:{heading:"Cart and inventory",steps:["Search for products or filter categories.","Add units, inspect totals and place a simulated order.","Export sample orders; optionally test SQLite on localhost."],caution:"No real payments, customer accounts or public database."},
    studio:{heading:"Editing and recovery",steps:["Edit a block and check its live preview.","Try undo, redo and reviewed JSON import.","Export HTML, or use SQLite revisions on localhost."],caution:"Does not publish websites or execute imported HTML."},
    monitor:{heading:"Samples and incidents",steps:["Run a manual health check.","Compare samples, failures and p95 latency.","Export CSV and inspect local alerts in SQLite mode."],caution:"Not continuous monitoring or evidence of an SLA."},
    factory:{heading:"Human-reviewed delivery",steps:["Describe a task and create a reviewable plan.","Explicitly confirm review before changing status.","On localhost, inspect sources and generate a fixed-template ZIP."],caution:"No autonomous agents or generated-code execution."},
  },
  de:{
    commerce:{heading:"Warenkorb und Lager",steps:["Produkte suchen oder Kategorien filtern.","Mengen ändern, Preise prüfen und Testbestellung anlegen.","Bestellungen exportieren; SQLite nur lokal testen."],caution:"Keine echten Zahlungen, Kundenkonten oder öffentliche Datenbank."},
    studio:{heading:"Bearbeitung und Wiederherstellung",steps:["Block bearbeiten und Vorschau prüfen.","Rückgängig, Wiederholen und geprüften JSON-Import testen.","HTML exportieren oder lokale SQLite-Versionen verwenden."],caution:"Keine Veröffentlichung und keine Ausführung von HTML."},
    monitor:{heading:"Messungen und Fehler",steps:["Manuelle Zustandsprüfung starten.","Stichproben, Fehler und p95-Latenz vergleichen.","CSV exportieren und lokale SQLite-Alarme prüfen."],caution:"Keine Dauerüberwachung oder SLA-Messung."},
    factory:{heading:"Menschliche Prüfung",steps:["Aufgabe beschreiben und Plan erstellen.","Prüfung ausdrücklich bestätigen.","Lokal Quelldateien prüfen und Vorlagen-ZIP erzeugen."],caution:"Keine autonomen Agenten oder Codeausführung."},
  },
  fr:{
    commerce:{heading:"Panier et stock",steps:["Rechercher ou filtrer des produits.","Modifier les quantités, examiner les prix et simuler une commande.","Exporter les commandes ; tester SQLite seulement en local."],caution:"Sans paiement réel, compte client ou base publique."},
    studio:{heading:"Édition et récupération",steps:["Modifier un bloc et consulter l'aperçu.","Tester annulation, rétablissement et import JSON vérifié.","Exporter HTML ou utiliser les révisions SQLite locales."],caution:"Ne publie pas de site et n'exécute pas le HTML."},
    monitor:{heading:"Mesures et incidents",steps:["Lancer un contrôle manuel.","Comparer les échantillons, erreurs et latence p95.","Exporter CSV et consulter les alertes SQLite locales."],caution:"Ni surveillance continue ni preuve d'un SLA."},
    factory:{heading:"Validation humaine",steps:["Décrire une tâche et préparer un plan.","Confirmer explicitement la révision.","En local, consulter les sources et créer un ZIP prédéfini."],caution:"Aucun agent autonome ni exécution de code généré."},
  },
  pt:{
    commerce:{heading:"Carrinho e estoque",steps:["Pesquisar produtos ou filtrar categorias.","Ajustar quantidades, conferir preços e simular pedido.","Exportar pedidos; testar SQLite somente no localhost."],caution:"Sem pagamentos reais, contas ou banco de dados público."},
    studio:{heading:"Edição e recuperação",steps:["Editar um bloco e verificar a prévia.","Testar desfazer, refazer e importação JSON revisada.","Exportar HTML ou usar revisões SQLite locais."],caution:"Não publica sites nem executa o HTML."},
    monitor:{heading:"Amostras e incidentes",steps:["Executar verificação manual de saúde.","Comparar amostras, falhas e latência p95.","Exportar CSV e verificar alertas SQLite locais."],caution:"Não é monitoramento contínuo nem comprovação de SLA."},
    factory:{heading:"Entrega revisada por humanos",steps:["Descrever uma tarefa e preparar o plano.","Confirmar a revisão de forma explícita.","Localmente, examinar fontes e gerar ZIP de modelo fixo."],caution:"Sem agentes autônomos ou execução de código gerado."},
  },
};

export default function LabQuickStart({language,lab}:{language:SiteLanguage;lab:LabId}){
  const item=guide[language][lab];
  return <section aria-label={titles[language]} className="mt-5 rounded-2xl border border-[#714050] bg-[#191418] p-4 sm:p-5">
    <div className="flex flex-wrap items-center gap-2">
      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d56b85] text-[#f3a9bb]">✓</span>
      <h3 className="text-base font-semibold text-white">{item.heading}</h3>
    </div>
    <ol className="mt-4 grid gap-3 sm:grid-cols-3">
      {item.steps.map((step,index)=><li key={index} className="rounded-xl border border-white/10 bg-[#231c23] p-3 text-sm leading-6 text-stone-200">
        <span className="mb-2 block text-xs font-bold tracking-wider text-[#f0a5b7]">{String(index+1).padStart(2,"0")}</span>
        {step}
      </li>)}
    </ol>
    <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-stone-300">
      <strong className="text-[#f3acbe]">{limits[language]}:</strong> {item.caution}
    </p>
  </section>;
}
