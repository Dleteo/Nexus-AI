import {getCaseStudy} from './case-studies';
import {translatedCaseStudy} from './localized-case-studies';
import type {SiteLanguage} from './site-languages';

export type PortfolioInterviewExercise={
 id:string;
 project:string;
 question:string;
 criteria:string[];
 example:string;
 caseStudyHref:string;
};
type Copy={question:string;criteria:[string,string,string]};
type Exercise={slug:string;approachIndexes:number[];copy:Record<SiteLanguage,Copy>};

// Practice material about public evidence, not automated grading or model output.
const exercises:Exercise[]=[
 {
  slug:'nexus-ai',approachIndexes:[1,2,3],copy:{
   en:{question:'How does Nexus AI separate users and protect model credentials? Explain one check and one limit.',criteria:['Describe authenticated routes and user-owned data protected by PostgreSQL RLS.','Explain why provider credentials and model calls stay on the server.','Distinguish tests with simulated providers from verified live model inference.']},
   es:{question:'¿Cómo separa Nexus AI a los usuarios y protege las credenciales del modelo? Explica una comprobación y un límite.',criteria:['Describe las rutas autenticadas y los datos por usuario protegidos con PostgreSQL RLS.','Explica por qué las credenciales y las llamadas al modelo permanecen en el servidor.','Distingue las pruebas con proveedores simulados de la inferencia real verificada.']},
   de:{question:'Wie trennt Nexus AI Benutzer und schützt Modellzugangsdaten? Erkläre eine Prüfung und eine Grenze.',criteria:['Beschreibe authentifizierte Routen und benutzereigene Daten mit PostgreSQL RLS.','Erkläre, warum Zugangsdaten und Modellaufrufe auf dem Server bleiben.','Unterscheide simulierte Anbietertests von verifizierter echter Modellinferenz.']},
   fr:{question:'Comment Nexus AI sépare-t-il les utilisateurs et protège-t-il les identifiants du modèle ? Expliquez une vérification et une limite.',criteria:['Décrire les routes authentifiées et les données utilisateur protégées par PostgreSQL RLS.','Expliquer pourquoi les identifiants et les appels au modèle restent côté serveur.','Distinguer les tests avec fournisseurs simulés d’une inférence réelle vérifiée.']},
   pt:{question:'Como o Nexus AI separa usuários e protege as credenciais do modelo? Explique uma verificação e um limite.',criteria:['Descreva rotas autenticadas e dados por usuário protegidos por PostgreSQL RLS.','Explique por que credenciais e chamadas ao modelo ficam no servidor.','Diferencie testes com provedores simulados de inferência real verificada.']},
  },
 },
 {
  slug:'nexus-commerce',approachIndexes:[1,2,3],copy:{
   en:{question:'Why does Nexus Commerce validate an order inside a database transaction rather than trusting the cart? How would you verify it?',criteria:['Explain atomic order and stock updates in the local SQLite backend.','Describe testing concurrent orders and invalid quantities instead of trusting browser prices.','State that the public demo uses browser-local state and processes no real payments.']},
   es:{question:'¿Por qué Nexus Commerce valida el pedido dentro de una transacción en lugar de confiar en el carrito? ¿Cómo lo comprobarías?',criteria:['Explica la actualización atómica de pedido e inventario en el backend SQLite local.','Describe pruebas de pedidos concurrentes y cantidades inválidas, sin confiar en precios del navegador.','Indica que la demo pública usa estado del navegador y no procesa pagos reales.']},
   de:{question:'Warum prüft Nexus Commerce eine Bestellung innerhalb einer Transaktion statt dem Warenkorb zu vertrauen? Wie würdest du das prüfen?',criteria:['Erkläre atomare Bestell- und Lageränderungen im lokalen SQLite-Backend.','Beschreibe Tests paralleler Bestellungen und ungültiger Mengen statt Browserpreisen zu vertrauen.','Sage, dass die öffentliche Demo lokalen Browserzustand nutzt und keine echten Zahlungen verarbeitet.']},
   fr:{question:'Pourquoi Nexus Commerce valide-t-il une commande dans une transaction plutôt que de faire confiance au panier ? Comment le vérifier ?',criteria:['Expliquer la mise à jour atomique des commandes et du stock dans le backend SQLite local.','Décrire les tests de commandes concurrentes et de quantités invalides sans faire confiance aux prix du navigateur.','Préciser que la démo publique utilise un état local au navigateur et ne traite aucun paiement réel.']},
   pt:{question:'Por que o Nexus Commerce valida pedidos dentro de uma transação em vez de confiar no carrinho? Como verificar isso?',criteria:['Explique atualizações atômicas de pedido e estoque no backend SQLite local.','Descreva testes de pedidos simultâneos e quantidades inválidas sem confiar nos preços do navegador.','Informe que a demo pública usa estado local do navegador e não processa pagamentos reais.']},
  },
 },
 {
  slug:'nexus-studio',approachIndexes:[1,2,3],copy:{
   en:{question:'How does Nexus Studio avoid overwriting a newer revision, and why must exported HTML be escaped?',criteria:['Explain the revision counter and HTTP 409 conflict for stale local writes.','Describe escaping exported text so entered tags are not executed as HTML.','Explain restoring as a new revision while preserving snapshots; this is not real-time collaboration.']},
   es:{question:'¿Cómo evita Nexus Studio sobrescribir una revisión más reciente y por qué debe escapar el HTML exportado?',criteria:['Explica el contador de revisión y el conflicto HTTP 409 para escrituras locales desactualizadas.','Describe el escapado del texto exportado para que las etiquetas ingresadas no se ejecuten como HTML.','Explica la restauración como una nueva revisión conservando snapshots; no es colaboración en tiempo real.']},
   de:{question:'Wie vermeidet Nexus Studio das Überschreiben neuerer Versionen und warum muss exportiertes HTML escaped werden?',criteria:['Erkläre Versionszähler und HTTP-409-Konflikte bei veralteten lokalen Schreibzugriffen.','Beschreibe HTML-Escaping, damit eingegebene Tags nicht als HTML ausgeführt werden.','Erkläre Wiederherstellung als neue Version mit erhaltenen Snapshots; keine Echtzeit-Zusammenarbeit.']},
   fr:{question:'Comment Nexus Studio évite-t-il d’écraser une version plus récente, et pourquoi échapper le HTML exporté ?',criteria:['Expliquer le compteur de version et le conflit HTTP 409 pour une écriture locale obsolète.','Décrire l’échappement du texte exporté pour que les balises saisies ne soient pas exécutées comme HTML.','Expliquer la restauration comme nouvelle version en conservant les snapshots ; ce n’est pas une collaboration en temps réel.']},
   pt:{question:'Como o Nexus Studio evita sobrescrever uma revisão mais recente e por que escapar o HTML exportado?',criteria:['Explique o contador de revisão e o conflito HTTP 409 para gravações locais desatualizadas.','Descreva o escape do texto exportado para que tags inseridas não sejam executadas como HTML.','Explique a restauração como nova revisão preservando snapshots; não é colaboração em tempo real.']},
  },
 },
 {
  slug:'nexus-monitor',approachIndexes:[1,2,3],copy:{
   en:{question:'Why should Nexus Monitor store failed HTTP checks, and what can its p95 measurement tell you?',criteria:['Explain recording failed or malformed HTTP responses as failed measurements.','Describe p95 and success rate as observations from a bounded sample.','State that checks are manual and limited to the known local endpoint, not continuous monitoring or an SLA.']},
   es:{question:'¿Por qué Nexus Monitor debe guardar las comprobaciones HTTP fallidas y qué puede indicar su p95?',criteria:['Explica el registro de respuestas HTTP fallidas o malformadas como mediciones fallidas.','Describe p95 y porcentaje de éxito como observaciones de una muestra acotada.','Indica que las comprobaciones son manuales y del endpoint local conocido, no vigilancia continua ni un SLA.']},
   de:{question:'Warum sollte Nexus Monitor fehlgeschlagene HTTP-Prüfungen speichern und was sagt der p95-Wert aus?',criteria:['Erkläre, warum fehlerhafte HTTP-Antworten als fehlgeschlagene Messungen gespeichert werden.','Beschreibe p95 und Erfolgsrate als Beobachtungen einer begrenzten Stichprobe.','Sage, dass Prüfungen manuell und auf den bekannten lokalen Endpunkt begrenzt sind, ohne Dauerüberwachung oder SLA.']},
   fr:{question:'Pourquoi Nexus Monitor doit-il conserver les contrôles HTTP échoués, et que peut indiquer son p95 ?',criteria:['Expliquer l’enregistrement des réponses HTTP défaillantes ou malformées comme mesures échouées.','Décrire p95 et taux de réussite comme observations d’un échantillon limité.','Préciser que les contrôles sont manuels et limités à l’endpoint local connu, sans surveillance continue ni SLA.']},
   pt:{question:'Por que o Nexus Monitor deve guardar verificações HTTP que falham e o que o p95 pode indicar?',criteria:['Explique o registro de respostas HTTP falhas ou malformadas como medições com falha.','Descreva p95 e taxa de sucesso como observações de uma amostra limitada.','Informe que as verificações são manuais e limitadas ao endpoint local conhecido, sem monitoramento contínuo nem SLA.']},
  },
 },
 {
  slug:'nexus-factory',approachIndexes:[1,3,4,6],copy:{
   en:{question:'What does approving a Nexus Factory snapshot authorize, and what does static QA fail to prove?',criteria:['Describe human approval of the exact snapshot before producing the fixed-template ZIP.','Distinguish static checks and ZIP integrity from executing generated code or verifying a real sandbox.','Explain that SHA-256 detects changed data but is not a digital signature; there are no autonomous agents.']},
   es:{question:'¿Qué autoriza aprobar un snapshot de Nexus Factory y qué no demuestra la QA estática?',criteria:['Describe la aprobación humana del snapshot exacto antes de producir el ZIP de una plantilla fija.','Distingue las comprobaciones estáticas y la integridad del ZIP de ejecutar código generado o verificar un sandbox real.','Explica que SHA-256 detecta cambios pero no es una firma digital; no hay agentes autónomos.']},
   de:{question:'Was erlaubt die Freigabe eines Nexus-Factory-Snapshots und was beweist statische QA nicht?',criteria:['Beschreibe die menschliche Freigabe des exakten Snapshots vor dem ZIP aus einer festen Vorlage.','Unterscheide statische Prüfungen und ZIP-Integrität von Codeausführung oder einer verifizierten echten Sandbox.','Erkläre, dass SHA-256 Datenänderungen erkennt, aber keine digitale Signatur ist; es gibt keine autonomen Agenten.']},
   fr:{question:'Qu’autorise l’approbation d’un snapshot Nexus Factory, et que ne prouve pas la QA statique ?',criteria:['Décrire l’approbation humaine du snapshot exact avant de produire le ZIP à partir d’un modèle fixe.','Distinguer les contrôles statiques et l’intégrité ZIP de l’exécution du code généré ou d’un véritable sandbox vérifié.','Expliquer que SHA-256 détecte les changements sans être une signature numérique ; aucun agent autonome.']},
   pt:{question:'O que a aprovação de um snapshot do Nexus Factory autoriza e o que a QA estática não comprova?',criteria:['Descreva a aprovação humana do snapshot exato antes de produzir o ZIP de um modelo fixo.','Diferencie verificações estáticas e integridade ZIP de execução do código gerado ou verificação de um sandbox real.','Explique que SHA-256 detecta alterações, mas não é assinatura digital; não há agentes autônomos.']},
  },
 },
];

export function getPortfolioInterviewExercises(language:SiteLanguage):PortfolioInterviewExercise[]{
 const prefix:Record<SiteLanguage,string>={
  en:'Practice example — not an assessment of your answer. This is an AI-assisted learning project. Documented approach: ',
  es:'Ejemplo de práctica — no es una evaluación de tu respuesta. Es un proyecto de aprendizaje asistido por IA. Enfoque documentado: ',
  de:'Übungsbeispiel — keine Bewertung deiner Antwort. Dies ist ein KI-gestütztes Lernprojekt. Dokumentierter Ansatz: ',
  fr:'Exemple d’entraînement — pas une évaluation de votre réponse. Il s’agit d’un projet d’apprentissage assisté par IA. Approche documentée : ',
  pt:'Exemplo de prática — não é avaliação da sua resposta. Este é um projeto de aprendizado com apoio de IA. Abordagem documentada: ',
 };
 const limit:Record<SiteLanguage,string>={en:'Documented limitation: ',es:'Límite documentado: ',de:'Dokumentierte Grenze: ',fr:'Limite documentée : ',pt:'Limite documentado: '};
 return exercises.map(({slug,approachIndexes,copy})=>{
  const source=getCaseStudy(slug);
  if(!source)throw new Error('Missing public interview case study: '+slug);
  const study=translatedCaseStudy(source,language);
  return {
   id:slug,
   project:slug==='nexus-ai'?'Nexus AI Workspace':study.title,
   question:copy[language].question,
   criteria:[...copy[language].criteria],
   example:prefix[language]+approachIndexes.map(index=>study.approach[index]).join(' ')+'\n\n'+limit[language]+study.limitations[0],
   caseStudyHref:'/projects/'+slug+'?lang='+language,
  };
 });
}
