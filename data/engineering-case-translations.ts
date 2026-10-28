import type {CaseStudy} from "./case-studies";
import type {SiteLanguage} from "./site-languages";

type Fields = Pick<CaseStudy,"lead"|"role"|"status"|"problem"|"approach"|"lessons"|"limitations"|"next">;
type Locale = Exclude<SiteLanguage,"es">;
type LabSlug = "nexus-commerce"|"nexus-studio"|"nexus-monitor"|"nexus-software-factory";

/** Complete human-readable case studies; no machine translator or provider call. */
export const engineeringCaseTranslations:Record<Locale,Record<LabSlug,Fields>> = {
  en:{
    "nexus-commerce":{
      lead:"A storefront demo with catalog, cart, inventory and an optional local SQLite backend for transactional orders.",
      role:"Portfolio project with AI-assisted development and automated checks; no customers or real payments.",
      status:"Experimental MVP; SQLite backend restricted to local development.",
      problem:"Browser state can simulate checkout but cannot guarantee consistent stock when concurrent orders compete.",
      approach:["Separated browser-only cart state from an optional Python/SQLite server.","Used integer cents and calculated prices on the server instead of trusting browser amounts.","Validated the entire cart in one BEGIN IMMEDIATE database transaction.","Tested simultaneous orders, invalid quantities, HTTP persistence and production API lockout."],
      lessons:["Stock needs a server transaction, not just a visual cart.","The backend must validate quantities and compute prices.","Concurrency checks provide evidence beyond screenshots."],
      limitations:["No accounts, payment processing, taxes or real customers.","SQLite only runs in local development; hosted previews use browser storage.","Authentication, per-user authorization and idempotent order keys are still missing."],
      next:"Build authenticated, idempotent test orders without enabling real payments."
    },
    "nexus-studio":{
      lead:"A visual block editor with preview, HTML export and optional SQLite revision history.",
      role:"AI-assisted portfolio project with input validation and save/restore regression tests.",
      status:"Experimental MVP; revision backend runs locally during development only.",
      problem:"Edit content and recover earlier versions without silently overwriting another session's work.",
      approach:["Built editable heading, text and button blocks with reordering and undo/redo.","Escaped user content in exported static HTML.","Stored SQLite snapshots with a revision counter and rejected stale writes using HTTP 409.","Restored earlier snapshots as new revisions so the history remains intact."],
      lessons:["Concurrent changes need explicit revision control.","Restoring history should not destroy previous snapshots.","HTML export needs escaping and adversarial input tests."],
      limitations:["No real-time collaboration, accounts or public backend.","Static HTML export does not deploy a website.","Accessible drag-and-drop and advanced design controls remain future work."],
      next:"Add accessible visual styling while keeping conflict handling and XSS regression tests."
    },
    "nexus-monitor":{
      lead:"A manual health-check dashboard with SQLite history, p95 latency and local alert states.",
      role:"Observability learning project using Python and automated HTTP checks.",
      status:"Manual measurement MVP; not continuous uptime monitoring or an SLA.",
      problem:"Failed and malformed HTTP responses need an audit trail rather than disappearing from the dashboard.",
      approach:["Hard-coded the server probe to the Nexus loopback health endpoint.","Stored both successful probes and malformed protocol failures in SQLite.","Calculated observed success and p95, with states for recent failure, slowness and repeated failures.","Tested malformed responses, bounded retention and disabled production endpoints."],
      lessons:["Failures are monitoring data too.","A sample success rate does not establish continuous uptime.","Restrict monitoring targets to prevent unsafe server requests."],
      limitations:["Manual checks only; no daemon, notifications or verified SLO.","Only a fixed local service can be tested.","Bounded samples are not equivalent to total uptime."],
      next:"Design opt-in local scheduling and an allowlist, without claiming an SLO before measuring it."
    },
    "nexus-software-factory":{
      lead:"A local review-gated flow that generates a fixed HTML/CSS starter and delivers a checked ZIP.",
      role:"AI-assisted implementation, but the current workflow is deterministic and does not invoke an AI model.",
      status:"Controlled MVP; executing generated code remains disabled for safety.",
      problem:"Show an auditable delivery flow without claiming safe execution where no verified isolation exists.",
      approach:["Separated planning, source preview, explicit approval, static generation and QA.","Used fixed templates, escaped source text, a file manifest and integrity checks.","Validated snapshots and ZIP inputs in memory without extracting or executing them.","Displayed not_run until a real sandbox is verified; no generated-code runner was started."],
      lessons:["Template generation is not autonomous coding.","Static QA is not the same as running tests.","Sandbox isolation requires empirical verification before enabling code execution."],
      limitations:["No autonomous LLM, enabled Ollama provider or automated GitHub PRs.","Runtime sandbox P1 is unverified and execution remains disabled.","SHA-256 checksums do not attest authorship or security."],
      next:"Verify isolation in a dedicated environment before enabling test execution or local agents."
    }
  },
  de:{
    "nexus-commerce":{
      lead:"Shop-Demo mit Katalog, Warenkorb und optionalem lokalem SQLite-Backend für transaktionale Bestellungen.",
      role:"Portfolio-Projekt mit KI-gestützter Entwicklung und automatisierten Tests; ohne echte Kunden oder Zahlungen.",
      status:"Experimentelles MVP; SQLite nur in der lokalen Entwicklungsumgebung.",
      problem:"Ein Browser-Warenkorb garantiert bei gleichzeitigen Bestellungen keinen konsistenten Lagerbestand.",
      approach:["Browser-Demo und optionalen Python/SQLite-Server getrennt.","Preise serverseitig in ganzzahligen Cent berechnet.","Den gesamten Warenkorb in einer BEGIN IMMEDIATE-Transaktion geprüft.","Nebenläufige Bestellungen, ungültige Mengen, HTTP-Speicherung und Produktionssperre getestet."],
      lessons:["Lagerbestände brauchen Datenbanktransaktionen.","Preise und Mengen müssen serverseitig validiert werden.","Nebenläufigkeitstests liefern überprüfbare Belege."],
      limitations:["Keine Kundenkonten, echten Zahlungen oder Steuern.","SQLite funktioniert nur lokal; Online-Demos nutzen Browserspeicher.","Authentifizierung, Berechtigungen und idempotente Bestellungen fehlen."],
      next:"Authentifizierte Testbestellungen mit Idempotenz ergänzen, ohne Zahlungen zu aktivieren."
    },
    "nexus-studio":{
      lead:"Blockeditor mit Vorschau, HTML-Export und optionalem SQLite-Versionsverlauf.",
      role:"KI-gestütztes Portfolio-Projekt mit Eingabevalidierung und Regressionstests.",
      status:"Experimentelles MVP; Versionsspeicherung nur lokal.",
      problem:"Änderungen und frühere Versionen wiederherstellen, ohne parallel gespeicherte Arbeit zu überschreiben.",
      approach:["Blöcke mit Textbearbeitung, Reihenfolge und Rückgängig/Wiederholen gebaut.","Benutzereingaben beim HTML-Export maskiert.","SQLite-Snapshots mit Versionszähler gespeichert und veraltete Schreibzugriffe mit HTTP 409 abgelehnt.","Ältere Versionen als neue Revisionen wiederhergestellt."],
      lessons:["Parallele Änderungen erfordern Versionskontrolle.","Wiederherstellungen sollen alte Snapshots behalten.","HTML-Export braucht Eingabevalidierung."],
      limitations:["Keine Echtzeit-Zusammenarbeit oder öffentlichen Benutzerkonten.","HTML-Export veröffentlicht keine Website.","Barrierefreies Drag-and-drop und Designoptionen fehlen."],
      next:"Barrierefreie Gestaltungsfunktionen mit Konflikt- und XSS-Tests ergänzen."
    },
    "nexus-monitor":{
      lead:"Dashboard für manuelle Health-Checks mit SQLite-Verlauf, p95-Latenz und lokalen Alarmzuständen.",
      role:"Lernprojekt für Observability mit Python und automatisierten HTTP-Tests.",
      status:"Manuelles Mess-MVP; keine kontinuierliche Verfügbarkeitserfassung.",
      problem:"Fehlerhafte HTTP-Antworten müssen als Messwerte erhalten bleiben.",
      approach:["Nur den lokalen Nexus-Health-Endpunkt als Ziel zugelassen.","Erfolge und Protokollfehler in SQLite gespeichert.","Erfolgsanteil, p95 und Alarme für Fehler oder Langsamkeit berechnet.","Fehlerhafte Antworten, Speicherlimits und Produktionssperren getestet."],
      lessons:["Auch Fehler gehören zur Monitoring-Historie.","Stichproben beweisen keine permanente Verfügbarkeit.","Feste Ziele vermeiden gefährliche Server-Anfragen."],
      limitations:["Keine Hintergrundüberwachung oder Benachrichtigungen.","Nur der bekannte lokale Endpunkt wird getestet.","Stichproben entsprechen keiner SLA-Verfügbarkeit."],
      next:"Optionale lokale Zeitplanung mit sicherer Zielliste konzipieren."
    },
    "nexus-software-factory":{
      lead:"Lokaler Freigabeprozess, der eine feste HTML/CSS-Vorlage samt geprüftem ZIP erzeugt.",
      role:"KI-gestützte Entwicklung; der aktuelle Ablauf nutzt kein KI-Modell.",
      status:"Kontrolliertes MVP; Ausführung generierten Codes deaktiviert.",
      problem:"Einen nachvollziehbaren Workflow zeigen, ohne unbewiesene Sandbox-Sicherheit vorzutäuschen.",
      approach:["Planung, Quellvorschau, Freigabe, Generierung und statische QA getrennt.","Vorlagen, HTML-Escaping, Manifest und Integritätsprüfung eingesetzt.","Snapshots und ZIP-Dateien im Speicher geprüft, ohne Extraktion oder Ausführung.","Ausführungsstatus not_run beibehalten, bis echte Isolation geprüft ist."],
      lessons:["Eine Vorlage ist kein autonomer Programmieragent.","Statische QA ist kein ausgeführter Test.","Sandbox-Schutz muss praktisch nachgewiesen werden."],
      limitations:["Kein aktives LLM, Ollama oder automatischer GitHub-PR.","Sandbox P1 ist nicht verifiziert; keine Codeausführung.","SHA-256 ist keine Signatur oder Sicherheitsprüfung."],
      next:"Isolation in einer separaten Testumgebung verifizieren."
    }
  },
  fr:{
    "nexus-commerce":{
      lead:"Démo de boutique avec catalogue, panier, stock et backend SQLite local facultatif pour les commandes transactionnelles.",
      role:"Projet de portfolio développé avec assistance IA et tests automatisés ; sans clients ni paiements réels.",
      status:"MVP expérimental ; backend SQLite réservé au développement local.",
      problem:"Le panier du navigateur ne garantit pas la cohérence du stock face à deux commandes simultanées.",
      approach:["Séparation de la démo navigateur et du serveur Python/SQLite facultatif.","Calcul des prix en centimes entiers côté serveur.","Validation complète du panier dans une transaction BEGIN IMMEDIATE.","Tests de concurrence, quantités invalides, persistance HTTP et verrouillage en production."],
      lessons:["Le stock exige des transactions côté serveur.","Les prix et quantités ne doivent pas être approuvés depuis le navigateur.","Les tests concurrents apportent des preuves vérifiables."],
      limitations:["Pas de comptes, clients, taxes ou paiements réels.","SQLite est local ; la démo hébergée utilise le stockage navigateur.","Authentification, autorisations et idempotence restent à faire."],
      next:"Ajouter des commandes de test authentifiées et idempotentes, sans paiements."
    },
    "nexus-studio":{
      lead:"Éditeur de blocs avec aperçu, export HTML et historique de versions SQLite facultatif.",
      role:"Projet de portfolio assisté par IA avec validations et tests de restauration.",
      status:"MVP expérimental ; sauvegarde des versions uniquement en local.",
      problem:"Modifier et restaurer un document sans effacer les changements d'une autre session.",
      approach:["Blocs modifiables avec réorganisation, annulation et rétablissement.","Échappement des saisies lors de l'export HTML statique.","Snapshots SQLite et refus des versions obsolètes via HTTP 409.","Restauration en nouvelle révision pour conserver l'historique."],
      lessons:["Les modifications concurrentes demandent un contrôle de version.","La restauration doit préserver les anciens états.","L'export HTML exige une protection contre les saisies malveillantes."],
      limitations:["Pas de collaboration temps réel ni de comptes publics.","L'export statique ne publie pas de site.","Glisser-déposer accessible et styles avancés restent à créer."],
      next:"Ajouter la personnalisation visuelle accessible avec des tests XSS."
    },
    "nexus-monitor":{
      lead:"Tableau de contrôles de santé manuels avec SQLite, latence p95 et alertes locales.",
      role:"Projet d'observabilité utilisant Python et tests HTTP automatisés.",
      status:"MVP de mesures manuelles ; ni surveillance continue ni SLA.",
      problem:"Les erreurs HTTP et réponses invalides doivent apparaître dans l'historique.",
      approach:["Sonde limitée au point de santé local de Nexus.","Persistance des réussites et erreurs de protocole dans SQLite.","Calcul du taux de réussite observé, p95 et états d'alerte.","Tests des erreurs HTTP, limites d'historique et blocage en production."],
      lessons:["Les échecs constituent aussi des données de mesure.","Un échantillon ne prouve pas une disponibilité permanente.","Les destinations doivent être limitées pour protéger le serveur."],
      limitations:["Tests manuels uniquement, sans service continu ni notifications.","Une seule cible locale fixe.","Les échantillons ne constituent pas un SLA."],
      next:"Concevoir une planification locale facultative avec liste de destinations autorisées."
    },
    "nexus-software-factory":{
      lead:"Pipeline local avec validation humaine, génération d'un modèle HTML/CSS fixe et ZIP vérifié.",
      role:"Implémentation assistée par IA, mais l'application actuelle n'invoque aucun modèle.",
      status:"MVP contrôlé ; exécution de code généré désactivée.",
      problem:"Démontrer un processus traçable sans prétendre à une isolation non vérifiée.",
      approach:["Séparation du plan, de l'aperçu, de l'approbation, de la génération et des contrôles statiques.","Modèles fixes, échappement HTML, manifeste et vérification d'intégrité.","Validation mémoire des snapshots et ZIP sans extraction ni exécution.","État not_run tant qu'aucun sandbox réel n'a été validé."],
      lessons:["Un modèle fixe n'est pas un agent autonome.","Les contrôles statiques ne sont pas des tests exécutés.","L'isolation doit être vérifiée avant de permettre l'exécution."],
      limitations:["Pas de LLM autonome, Ollama actif ou PR automatiques.","Sandbox P1 non validé ; aucune exécution de code généré.","SHA-256 n'est ni signature ni audit de sécurité."],
      next:"Vérifier l'isolation dans un environnement de test dédié."
    }
  },
  pt:{
    "nexus-commerce":{
      lead:"Loja demonstrativa com catálogo, carrinho, estoque e backend SQLite local opcional para pedidos transacionais.",
      role:"Projeto de portfólio desenvolvido com auxílio de IA e testes automatizados; sem clientes nem pagamentos reais.",
      status:"MVP experimental; SQLite somente no desenvolvimento local.",
      problem:"O carrinho do navegador não garante estoque consistente durante pedidos simultâneos.",
      approach:["Separei a demonstração no navegador do servidor Python/SQLite opcional.","Calculei preços em centavos inteiros no backend.","Validei o pedido dentro de uma transação BEGIN IMMEDIATE.","Testei pedidos concorrentes, quantidades inválidas, persistência HTTP e bloqueio na produção."],
      lessons:["Estoque exige transações no servidor.","O backend deve validar preços e quantidades.","Testes de concorrência comprovam mais do que capturas de tela."],
      limitations:["Sem contas, clientes, impostos ou pagamentos reais.","SQLite é local; a demonstração online usa armazenamento do navegador.","Faltam autenticação, autorização e pedidos idempotentes."],
      next:"Adicionar pedidos de teste autenticados e idempotentes, sem pagamentos."
    },
    "nexus-studio":{
      lead:"Editor visual de blocos com prévia, exportação HTML e histórico opcional de revisões SQLite.",
      role:"Projeto com auxílio de IA, validação de entradas e testes de restauração.",
      status:"MVP experimental; revisões persistentes apenas no desenvolvimento local.",
      problem:"Editar e recuperar versões sem sobrescrever o trabalho de outra sessão.",
      approach:["Criei blocos editáveis, reordenação, desfazer e refazer.","Escapei conteúdo do usuário na exportação HTML.","Salvei snapshots SQLite e rejeitei revisões obsoletas com HTTP 409.","Restaurei versões antigas como novas revisões."],
      lessons:["Alterações concorrentes exigem controle de revisão.","A restauração deve preservar versões anteriores.","A exportação HTML precisa validar entradas."],
      limitations:["Sem colaboração em tempo real ou contas públicas.","Exportar HTML não publica um site.","Drag-and-drop acessível e estilos avançados são futuros."],
      next:"Adicionar design visual acessível e testes contra XSS."
    },
    "nexus-monitor":{
      lead:"Painel de verificações manuais com histórico SQLite, latência p95 e alertas locais.",
      role:"Projeto de observabilidade com Python e testes HTTP automatizados.",
      status:"MVP de medições manuais; sem monitoramento 24 horas ou SLA.",
      problem:"Falhas de HTTP e respostas malformadas precisam aparecer no histórico.",
      approach:["Restringi a sonda à API de saúde local do Nexus.","Registrei sucessos e erros de protocolo no SQLite.","Calculei taxa de sucesso observada, p95 e estados de alerta.","Testei erros HTTP, limites de histórico e bloqueio da produção."],
      lessons:["Falhas também são dados de monitoramento.","Amostras não comprovam disponibilidade contínua.","Destinos restritos evitam chamadas perigosas pelo servidor."],
      limitations:["Verificações apenas manuais; sem serviço contínuo ou notificações.","Somente um endpoint local fixo.","Amostras não equivalem a um SLA."],
      next:"Projetar verificações locais opcionais e uma lista segura de destinos."
    },
    "nexus-software-factory":{
      lead:"Fluxo local com aprovação humana que gera um modelo HTML/CSS fixo e um ZIP verificado.",
      role:"Implementação com auxílio de IA, mas o fluxo atual não chama nenhum modelo.",
      status:"MVP controlado; execução de código gerado desabilitada.",
      problem:"Demonstrar entrega auditável sem alegar isolamento de execução não verificado.",
      approach:["Separei planejamento, prévia, aprovação, geração e QA estático.","Usei modelos fixos, escape HTML, manifesto e verificação de integridade.","Validei snapshots e ZIPs em memória sem extrair nem executar.","Mantive o estado not_run até verificar isolamento real."],
      lessons:["Gerar um modelo não é programar de forma autônoma.","QA estática não equivale a executar testes.","O sandbox deve ser verificado antes de permitir execução."],
      limitations:["Sem LLM autônomo, Ollama ativo ou PRs automáticos.","Sandbox P1 não verificado; sem execução de código gerado.","SHA-256 não atesta autoria nem segurança."],
      next:"Verificar isolamento em um ambiente de testes dedicado."
    }
  }
};
