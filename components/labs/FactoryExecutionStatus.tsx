import type { SiteLanguage } from "../../data/site-languages";

const messages: Record<SiteLanguage, { title: string; detail: string }> = {
  es: {
    title: "Pruebas de ejecución: no ejecutadas",
    detail: "La QA actual sólo revisa archivos de la plantilla. La ejecución de código permanece desactivada porque el aislamiento del sandbox no está verificado.",
  },
  en: {
    title: "Execution tests: not run",
    detail: "Current QA only checks template files. Code execution remains disabled because sandbox isolation has not been verified.",
  },
  de: {
    title: "Ausführungstests: nicht ausgeführt",
    detail: "Die aktuelle QA prüft nur Vorlagendateien. Die Codeausführung bleibt deaktiviert, da die Isolation der Sandbox nicht verifiziert ist.",
  },
  fr: {
    title: "Tests d’exécution : non exécutés",
    detail: "La QA actuelle vérifie uniquement les fichiers du modèle. L’exécution de code reste désactivée car l’isolation du sandbox n’est pas vérifiée.",
  },
  pt: {
    title: "Testes de execução: não executados",
    detail: "A QA atual verifica apenas os arquivos do modelo. A execução de código permanece desativada porque o isolamento do sandbox não foi verificado.",
  },
};

/** Execution is unavailable in both Factory modes; static QA cannot change this state. */
export default function FactoryExecutionStatus({ language }: { language: SiteLanguage }) {
  const message = messages[language];
  return (
    <section aria-label={message.title} className="factory-execution-notice rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
      <h3 className="text-sm font-semibold text-amber-100">{message.title}</h3>
      <p className="mt-2 text-xs leading-5 text-stone-300">{message.detail}</p>
    </section>
  );
}
