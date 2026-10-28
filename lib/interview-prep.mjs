/**
 * User-authored interview prep notes. Checkbox completion is manual review,
 * NOT evidence that automated tests or deployment occurred.
 */
const escapeMd = value => String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/\r/g,"").replace(/^([#*>-]|\d+\.)\s/gm,"\\$&")
  .slice(0,1800);

const headings = {
  es:["Preparación de entrevista","Revisión manual (no evidencia de pruebas automatizadas):","Problema","Decisiones técnicas","Código y pruebas por revisar","Limitaciones que explicar","La revisión refleja sólo tu preparación. No acredita pruebas ejecutadas, inferencia de IA ni despliegue."],
  en:["Interview preparation","Manual review checklist (not automated test evidence):","Problem","Technical decisions","Source and tests to inspect","Limitations to explain","Review status reflects your own preparation only. It does not indicate a test run, AI inference, or a production deployment."],
  de:["Vorbereitung auf das Vorstellungsgespräch","Manuelle Checkliste (kein Nachweis automatisierter Tests):","Problem","Technische Entscheidungen","Quellcode und Tests prüfen","Grenzen erklären","Der Prüfstatus beschreibt nur die persönliche Vorbereitung; er bestätigt keine ausgeführten Tests, KI-Inferenz oder Bereitstellung."],
  fr:["Préparation à l’entretien","Liste de vérification manuelle (pas une preuve de tests automatisés) :","Problème","Décisions techniques","Code et tests à examiner","Limites à expliquer","Ce suivi reflète uniquement votre préparation, pas l’exécution de tests, une inférence IA ni un déploiement."],
  pt:["Preparação para entrevista","Lista de revisão manual (não comprova testes automatizados):","Problema","Decisões técnicas","Código e testes para revisar","Limitações a explicar","A revisão reflete apenas seu preparo, não comprova testes executados, inferência de IA ou implantação."]
};
export function buildInterviewPrepMarkdown(study, labels, checked, language="en") {
  if (!Object.hasOwn(headings,language)) throw new Error("invalid-interview-language");
  const h=headings[language];
  if (!study || typeof study.title !== "string" ||
      !Array.isArray(study.approach) || !Array.isArray(study.limitations) ||
      !Array.isArray(study.evidence) || !Array.isArray(checked) || checked.length !== 4 ||
      checked.some(item=>typeof item !== "boolean") ||
      !Array.isArray(labels) || labels.length !== 4 ||
      labels.some(item=>typeof item !== "string")) throw new Error("invalid-interview-data");
  const title=escapeMd(study.title);
  const lines=[
    "# "+h[0]+" — "+title,
    "",
    h[1],
    ...labels.map((label,i)=>"- ["+(checked[i]?"x":" ")+"] "+escapeMd(label)),
    "",
    "## "+h[2],
    escapeMd(study.problem || ""),
    "",
    "## "+h[3],
    ...study.approach.slice(0,12).map(item=>"- "+escapeMd(item)),
    "",
    "## "+h[4],
    ...study.evidence.slice(0,12)
      .filter(item=>item&&typeof item.url==="string"&&item.url.startsWith("https://github.com/"))
      .map(item=>"- "+escapeMd(item.label)+": "+item.url),
    "",
    "## "+h[5],
    ...study.limitations.slice(0,12).map(item=>"- "+escapeMd(item)),
    "",
    h[6],
    "",
  ];
  return lines.join("\n");
}
