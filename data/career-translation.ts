import type {SiteLanguage} from "./site-languages";

/** Shared visual portfolio; every user-facing string has four localized variants. */
const entries = [
 [
  "Inicio",
  "Home",
  "Startseite",
  "Accueil",
  "Início"
 ],
 [
  "Proyectos",
  "Projects",
  "Projekte",
  "Projets",
  "Projetos"
 ],
 [
  "Habilidades",
  "Skills",
  "Kenntnisse",
  "Compétences",
  "Competências"
 ],
 [
  "Certificados",
  "Certificates",
  "Zertifikate",
  "Certificats",
  "Certificados"
 ],
 [
  "Trayectoria",
  "Experience",
  "Werdegang",
  "Parcours",
  "Trajetória"
 ],
 [
  "Asistente IA",
  "AI assistant",
  "KI-Assistent",
  "Assistant IA",
  "Assistente IA"
 ],
 [
  "Contacto",
  "Contact",
  "Kontakt",
  "Contact",
  "Contato"
 ],
 [
  "Ir al contenido",
  "Skip to content",
  "Zum Inhalt springen",
  "Aller au contenu",
  "Pular para o conteúdo"
 ],
 [
  "Navegación del portafolio",
  "Portfolio navigation",
  "Portfolio-Navigation",
  "Navigation du portfolio",
  "Navegação do portfólio"
 ],
 [
  "Secciones del portafolio",
  "Portfolio sections",
  "Portfolio-Abschnitte",
  "Rubriques du portfolio",
  "Seções do portfólio"
 ],
 [
  "EXPLORAR",
  "EXPLORE",
  "ENTDECKEN",
  "EXPLORER",
  "EXPLORAR"
 ],
 [
  "Portafolio en desarrollo",
  "Portfolio in progress",
  "Portfolio in Entwicklung",
  "Portfolio en cours",
  "Portfólio em desenvolvimento"
 ],
 [
  "Ver curriculum",
  "View résumé",
  "Lebenslauf ansehen",
  "Voir le CV",
  "Ver currículo"
 ],
 [
  "Desarrollo con evidencia",
  "Evidence-based development",
  "Nachweisbare Entwicklung",
  "Développement étayé par des preuves",
  "Desenvolvimento com evidências"
 ],
 [
  "PORTAFOLIO DE DESARROLLADOR",
  "DEVELOPER PORTFOLIO",
  "ENTWICKLER-PORTFOLIO",
  "PORTFOLIO DÉVELOPPEUR",
  "PORTFÓLIO DE DESENVOLVEDOR"
 ],
 [
  "Accesos rápidos",
  "Quick links",
  "Schnellzugriff",
  "Accès rapides",
  "Acessos rápidos"
 ],
 [
  "Ver CV",
  "View résumé",
  "Lebenslauf ansehen",
  "Voir le CV",
  "Ver currículo"
 ],
 [
  "Cerrar menú",
  "Close menu",
  "Menü schließen",
  "Fermer le menu",
  "Fechar menu"
 ],
 [
  "Abrir menú",
  "Open menu",
  "Menü öffnen",
  "Ouvrir le menu",
  "Abrir menu"
 ],
 [
  "Cerrar",
  "Close",
  "Schließen",
  "Fermer",
  "Fechar"
 ],
 [
  "Menú",
  "Menu",
  "Menü",
  "Menu",
  "Menu"
 ],
 [
  "Menú del portafolio",
  "Portfolio menu",
  "Portfolio-Menü",
  "Menu du portfolio",
  "Menu do portfólio"
 ],
 [
  "BIENVENIDO A MI ESPACIO",
  "WELCOME TO MY WORKSPACE",
  "WILLKOMMEN IN MEINEM BEREICH",
  "BIENVENUE DANS MON ESPACE",
  "BEM-VINDO AO MEU ESPAÇO"
 ],
 [
  "Hola, soy",
  "Hello, I'm",
  "Hallo, ich bin",
  "Bonjour, je suis",
  "Olá, eu sou"
 ],
 [
  "Construyo experiencias digitales",
  "I build digital experiences",
  "Ich entwickle digitale Erlebnisse",
  "Je crée des expériences numériques",
  "Construo experiências digitais"
 ],
 [
  "con propósito.",
  "with purpose.",
  "mit Sinn.",
  "avec un objectif.",
  "com propósito."
 ],
 [
  "Desarrollador web junior enfocado en interfaces, aplicaciones con datos e inteligencia artificial. Me gusta transformar problemas reales en software claro, funcional y comprobable.",
  "I'm a junior web developer focused on interfaces, data-driven apps and AI. I turn real problems into clear, functional, testable software.",
  "Als Junior-Webentwickler konzentriere ich mich auf Oberflächen, datenbasierte Anwendungen und KI. Ich verwandle reale Probleme in klare, funktionale und überprüfbare Software.",
  "Développeur web junior axé sur les interfaces, les applications de données et l’IA. Je transforme des problèmes réels en logiciels clairs, fonctionnels et vérifiables.",
  "Sou desenvolvedor web júnior focado em interfaces, aplicações de dados e IA. Transformo problemas reais em software claro, funcional e verificável."
 ],
 [
  "Explorar mis proyectos",
  "Explore my projects",
  "Meine Projekte entdecken",
  "Explorer mes projets",
  "Explorar meus projetos"
 ],
 [
  "Currículum y experiencia",
  "Résumé and experience",
  "Lebenslauf und Erfahrung",
  "CV et expérience",
  "Currículo e experiência"
 ],
 [
  "Pensilvania, EE. UU.",
  "Pennsylvania, USA",
  "Pennsylvania, USA",
  "Pennsylvanie, États-Unis",
  "Pensilvânia, EUA"
 ],
 [
  "Abierto a oportunidades junior",
  "Open to junior roles",
  "Offen für Junior-Stellen",
  "Ouvert aux postes juniors",
  "Aberto a vagas júnior"
 ],
 [
  "FEATURED WORK / 001",
  "FEATURED WORK / 001",
  "PROJEKT-HIGHLIGHT / 001",
  "PROJET À LA UNE / 001",
  "PROJETO EM DESTAQUE / 001"
 ],
 [
  "PROYECTO DESTACADO",
  "FEATURED PROJECT",
  "AUSGEWÄHLTES PROJEKT",
  "PROJET À LA UNE",
  "PROJETO EM DESTAQUE"
 ],
 [
  "Ir al proyecto Nexus AI",
  "Go to the Nexus AI project",
  "Zum Nexus-AI-Projekt",
  "Aller au projet Nexus AI",
  "Ir ao projeto Nexus AI"
 ],
 [
  "Código real. Progreso demostrable.",
  "Real code. Verifiable progress.",
  "Echter Code. Nachweisbarer Fortschritt.",
  "Du vrai code. Des progrès vérifiables.",
  "Código real. Progresso verificável."
 ],
 [
  "Indicadores documentados",
  "Documented metrics",
  "Dokumentierte Kennzahlen",
  "Indicateurs documentés",
  "Indicadores documentados"
 ],
 [
  "Formación documentada",
  "Documented training",
  "Dokumentierte Weiterbildung",
  "Formation documentée",
  "Formação documentada"
 ],
 [
  "Certificados y constancias",
  "Certificates and attendance records",
  "Zertifikate und Teilnahmebescheinigungen",
  "Certificats et attestations",
  "Certificados e comprovantes"
 ],
 [
  "Repositorios revisados en GitHub*",
  "GitHub repositories reviewed*",
  "Geprüfte GitHub-Repositories*",
  "Dépôts GitHub examinés*",
  "Repositórios analisados no GitHub*"
 ],
 [
  "Producto principal con IA",
  "Main AI application",
  "KI-Hauptanwendung",
  "Application principale avec IA",
  "Aplicação principal com IA"
 ],
 [
  "* Conteo revisado el 26/10/2026. Las horas de cursos no se presentan como horas de programación; el registro de práctica se añadirá cuando haya datos medibles.",
  "* Count reviewed October 26, 2026. Course hours are not coding hours; practice hours will be added when measured.",
  "* Stand vom 26.10.2026. Kursstunden sind keine Programmierstunden; Praxisstunden folgen, wenn Messdaten vorliegen.",
  "* Nombre vérifié le 26/10/2026. Les heures de cours ne sont pas des heures de code ; le temps de pratique sera ajouté une fois mesuré.",
  "* Contagem revisada em 26/10/2026. Horas de cursos não são horas de programação; a prática será adicionada quando medida."
 ],
 [
  "01 / TRABAJO SELECCIONADO",
  "01 / SELECTED WORK",
  "01 / AUSGEWÄHLTE ARBEITEN",
  "01 / PROJETS SÉLECTIONNÉS",
  "01 / TRABALHO SELECIONADO"
 ],
 [
  "Proyectos que demuestran",
  "Projects that show",
  "Projekte, die zeigen,",
  "Des projets qui montrent",
  "Projetos que mostram"
 ],
 [
  "cómo trabajo.",
  "how I work.",
  "wie ich arbeite.",
  "comment je travaille.",
  "como eu trabalho."
 ],
 [
  "Una selección breve con objetivos, decisiones técnicas y acceso a código real.",
  "A focused selection with goals, technical decisions and links to real code.",
  "Eine Auswahl mit Zielen, technischen Entscheidungen und Links zum echten Code.",
  "Une sélection avec objectifs, choix techniques et accès au code réel.",
  "Uma seleção com objetivos, decisões técnicas e acesso ao código real."
 ],
 [
  "Ver repositorios",
  "View repositories",
  "Repositories ansehen",
  "Voir les dépôts",
  "Ver repositórios"
 ],
 [
  "Filtrar proyectos",
  "Filter projects",
  "Projekte filtern",
  "Filtrer les projets",
  "Filtrar projetos"
 ],
 [
  "Todos",
  "All",
  "Alle",
  "Tous",
  "Todos"
 ],
 [
  "Producto IA",
  "AI product",
  "KI-Produkt",
  "Produit IA",
  "Produto IA"
 ],
 [
  "Frontend",
  "Frontend",
  "Frontend",
  "Frontend",
  "Frontend"
 ],
 [
  "Investigación",
  "Research",
  "Forschung",
  "Recherche",
  "Pesquisa"
 ],
 [
  "Caso de estudio",
  "Case study",
  "Fallstudie",
  "Étude de cas",
  "Estudo de caso"
 ],
 [
  "Código",
  "Source code",
  "Quellcode",
  "Code source",
  "Código-fonte"
 ],
 [
  "Explorar",
  "Explore",
  "Entdecken",
  "Explorer",
  "Explorar"
 ],
 [
  "Demo",
  "Demo",
  "Demo",
  "Démo",
  "Demo"
 ],
 [
  "Investigación privada · sin demo pública",
  "Private research · no public demo",
  "Private Forschung · keine öffentliche Demo",
  "Recherche privée · pas de démo publique",
  "Pesquisa privada · sem demo pública"
 ],
 [
  "02 / TECNOLOGÍAS",
  "02 / TECHNOLOGIES",
  "02 / TECHNOLOGIEN",
  "02 / TECHNOLOGIES",
  "02 / TECNOLOGIAS"
 ],
 [
  "Habilidades con",
  "Skills with",
  "Kenntnisse mit",
  "Des compétences avec",
  "Habilidades com"
 ],
 [
  "contexto real.",
  "real context.",
  "echtem Praxisbezug.",
  "une pratique réelle.",
  "contexto real."
 ],
 [
  "Diferencio la práctica directa de las tecnologías integradas mediante herramientas de IA.",
  "I distinguish hands-on practice from technologies integrated with AI-assisted tools.",
  "Ich unterscheide eigene Praxiserfahrung von Technologien, die mit KI-Hilfsmitteln integriert wurden.",
  "Je distingue la pratique directe des technologies intégrées avec l’aide d’outils d’IA.",
  "Distingo a prática direta das tecnologias integradas com ferramentas de IA."
 ],
 [
  "/ ÁREA",
  "/ AREA",
  "/ BEREICH",
  "/ DOMAINE",
  "/ ÁREA"
 ],
 [
  "03 / APRENDIZAJE CONTINUO",
  "03 / CONTINUOUS LEARNING",
  "03 / WEITERBILDUNG",
  "03 / FORMATION CONTINUE",
  "03 / APRENDIZADO CONTÍNUO"
 ],
 [
  "Formación y",
  "Training and",
  "Weiterbildung und",
  "Formation et",
  "Formação e"
 ],
 [
  "certificaciones.",
  "certifications.",
  "Zertifikate.",
  "certifications.",
  "certificações."
 ],
 [
  "Registros documentados por curso, entidad emisora, fecha y horas indicadas.",
  "Documented records for each course, issuer, date and number of hours.",
  "Dokumentierte Nachweise zu Kursen, Anbietern, Daten und Stunden.",
  "Informations documentées par cours, organisme, date et heures.",
  "Registros documentados por curso, emissor, data e horas."
 ],
 [
  "de formación",
  "of training",
  "Weiterbildung",
  "de formation",
  "de formação"
 ],
 [
  "Filtrar certificados",
  "Filter certificates",
  "Zertifikate filtern",
  "Filtrer les certificats",
  "Filtrar certificados"
 ],
 [
  "Cursos completados",
  "Completed courses",
  "Abgeschlossene Kurse",
  "Cours terminés",
  "Cursos concluídos"
 ],
 [
  "Constancias de asistencia",
  "Attendance records",
  "Teilnahmenachweise",
  "Attestations de présence",
  "Comprovantes de participação"
 ],
 [
  "Abrir certificado: ",
  "Open certificate: ",
  "Zertifikat öffnen: ",
  "Ouvrir le certificat : ",
  "Abrir certificado: "
 ],
 [
  "Certificado de ",
  "Certificate for ",
  "Zertifikat für ",
  "Certificat de ",
  "Certificado de "
 ],
 [
  "Curso completado",
  "Course completed",
  "Kurs abgeschlossen",
  "Cours terminé",
  "Curso concluído"
 ],
 [
  "Constancia de asistencia",
  "Attendance certificate",
  "Teilnahmebescheinigung",
  "Attestation de présence",
  "Comprovante de participação"
 ],
 [
  "Verificar credencial",
  "Verify credential",
  "Nachweis überprüfen",
  "Vérifier le certificat",
  "Verificar credencial"
 ],
 [
  "Ver certificado",
  "View certificate",
  "Zertifikat ansehen",
  "Voir le certificat",
  "Ver certificado"
 ],
 [
  "Horas de formación, no experiencia laboral ni horas de código. Los enlaces de verificación se muestran cuando están disponibles.",
  "Training hours are not work experience or coding hours. Verification links appear when available.",
  "Weiterbildungsstunden sind keine Berufserfahrung oder Programmierstunden. Verifizierungslinks erscheinen, falls verfügbar.",
  "Les heures de formation ne sont ni des heures de travail ni de code. Des liens de vérification sont proposés s'ils existent.",
  "Horas de formação não equivalem a experiência profissional ou horas de código. Links de verificação aparecem quando disponíveis."
 ],
 [
  "04 / MI TRAYECTORIA",
  "04 / MY JOURNEY",
  "04 / MEIN WERDEGANG",
  "04 / MON PARCOURS",
  "04 / MINHA TRAJETÓRIA"
 ],
 [
  "Preparándome para",
  "Preparing for",
  "Vorbereitung auf",
  "Me préparer à",
  "Preparando-me para"
 ],
 [
  "el siguiente paso.",
  "the next step.",
  "den nächsten Schritt.",
  "la prochaine étape.",
  "o próximo passo."
 ],
 [
  "ACTUALIDAD",
  "PRESENT",
  "AKTUELL",
  "AUJOURD'HUI",
  "ATUALMENTE"
 ],
 [
  "Desarrollo de proyectos personales",
  "Building personal projects",
  "Entwicklung eigener Projekte",
  "Développement de projets personnels",
  "Desenvolvimento de projetos pessoais"
 ],
 [
  "Construcción y mejora de Nexus AI, documentación de decisiones, pruebas y colaboración con herramientas de IA.",
  "Building and improving Nexus AI, documenting decisions, testing and collaborating with AI tools.",
  "Entwicklung und Verbesserung von Nexus AI, Dokumentation von Entscheidungen, Tests und Arbeit mit KI-Tools.",
  "Développement et amélioration de Nexus AI, documentation des choix, tests et collaboration avec des outils IA.",
  "Construção e melhoria do Nexus AI, documentação das decisões, testes e uso colaborativo de ferramentas de IA."
 ],
 [
  "Formación técnica continua",
  "Continuous technical training",
  "Kontinuierliche technische Weiterbildung",
  "Formation technique continue",
  "Formação técnica contínua"
 ],
 [
  "Desarrollo web, fundamentos de ingeniería de software, IA aplicada y formación introductoria en ciberseguridad.",
  "Web development, software engineering foundations, applied AI and introductory cybersecurity training.",
  "Webentwicklung, Grundlagen des Software Engineerings, angewandte KI und Einführung in Cybersicherheit.",
  "Développement web, bases du génie logiciel, IA appliquée et initiation à la cybersécurité.",
  "Desenvolvimento web, fundamentos de engenharia de software, IA aplicada e introdução à cibersegurança."
 ],
 [
  "EXPERIENCIA",
  "EXPERIENCE",
  "ERFAHRUNG",
  "EXPÉRIENCE",
  "EXPERIÊNCIA"
 ],
 [
  "Operaciones y trabajo en equipo",
  "Operations and teamwork",
  "Abläufe und Teamarbeit",
  "Opérations et travail d’équipe",
  "Operações e trabalho em equipe"
 ],
 [
  "Experiencia laboral fuera del desarrollo de software, con disciplina operativa, coordinación y ejecución de procedimientos.",
  "Work experience outside software development, with operational discipline, coordination and following procedures.",
  "Berufserfahrung außerhalb der Softwareentwicklung mit Disziplin, Koordination und zuverlässigen Arbeitsabläufen.",
  "Expérience professionnelle hors développement logiciel, avec rigueur, coordination et respect des procédures.",
  "Experiência profissional fora do desenvolvimento de software, com disciplina, coordenação e execução de processos."
 ],
 [
  "PERFIL PROFESIONAL",
  "PROFESSIONAL PROFILE",
  "BERUFSPROFIL",
  "PROFIL PROFESSIONNEL",
  "PERFIL PROFISSIONAL"
 ],
 [
  "Todo lo esencial, en un solo CV.",
  "Everything essential in one résumé.",
  "Alles Wesentliche in einem Lebenslauf.",
  "L’essentiel dans un seul CV.",
  "Tudo o que importa em um currículo."
 ],
 [
  "Resumen profesional, experiencia transferible, habilidades técnicas y formación documentada, listo para una conversación con reclutadores.",
  "Professional summary, transferable experience, technical skills and documented training, ready to discuss with recruiters.",
  "Berufsprofil, übertragbare Erfahrung, technische Kenntnisse und dokumentierte Weiterbildung – für Gespräche mit Recruitern.",
  "Profil professionnel, expérience transférable, compétences techniques et formation documentée, à présenter aux recruteurs.",
  "Resumo profissional, experiência transferível, competências técnicas e formação documentada, prontos para recrutadores."
 ],
 [
  "Abrir currículum",
  "Open résumé",
  "Lebenslauf öffnen",
  "Ouvrir le CV",
  "Abrir currículo"
 ],
 [
  "Preparar entrevista",
  "Prepare for interview",
  "Interview vorbereiten",
  "Préparer un entretien",
  "Preparar entrevista"
 ],
 [
  "05 / PRODUCTO EN DESARROLLO",
  "05 / PRODUCT IN DEVELOPMENT",
  "05 / PRODUKT IN ENTWICKLUNG",
  "05 / PRODUIT EN DÉVELOPPEMENT",
  "05 / PRODUTO EM DESENVOLVIMENTO"
 ],
 [
  "Una IA que acompaña",
  "AI that supports",
  "KI als Begleiter",
  "Une IA qui accompagne",
  "Uma IA que acompanha"
 ],
 [
  "el proceso.",
  "the process.",
  "den Prozess.",
  "le processus.",
  "o processo."
 ],
 [
  "Nexus AI ya incorpora un asistente con modos de planificación, depuración, aprendizaje y simulación de entrevistas. Las guías técnicas y el laboratorio de modelos propios se desarrollan por separado y no se presentan como diagnósticos automáticos fiables.",
  "Nexus AI already includes planning, debugging, learning and interview-practice modes. Technical guides and the original model lab are developed separately and are not presented as reliable automatic diagnostics.",
  "Nexus AI bietet bereits Modi für Planung, Debugging, Lernen und Interviewübungen. Technische Anleitungen und die eigene Modellforschung werden getrennt entwickelt und nicht als zuverlässige automatische Diagnose dargestellt.",
  "Nexus AI propose déjà des modes pour planifier, déboguer, apprendre et simuler des entretiens. Les guides techniques et la recherche sur le modèle original sont distincts et ne constituent pas des diagnostics automatiques fiables.",
  "O Nexus AI já inclui modos de planejamento, depuração, aprendizagem e entrevistas. As guias técnicas e o laboratório do modelo próprio são desenvolvidos separadamente e não são diagnósticos automáticos confiáveis."
 ],
 [
  "Planificar",
  "Plan",
  "Planen",
  "Planifier",
  "Planejar"
 ],
 [
  "Depurar",
  "Debug",
  "Debuggen",
  "Déboguer",
  "Depurar"
 ],
 [
  "Aprender",
  "Learn",
  "Lernen",
  "Apprendre",
  "Aprender"
 ],
 [
  "Entrevistas",
  "Interviews",
  "Interviews",
  "Entretiens",
  "Entrevistas"
 ],
 [
  "Explorar el asistente",
  "Explore the assistant",
  "Assistenten entdecken",
  "Explorer l’assistant",
  "Explorar o assistente"
 ],
 [
  "El acceso al asistente requiere iniciar sesión. La disponibilidad del proveedor depende de su configuración.",
  "Using the assistant requires sign-in. Model availability depends on configuration.",
  "Für den Assistenten ist eine Anmeldung erforderlich. Die Modellverfügbarkeit hängt von der Konfiguration ab.",
  "L’assistant nécessite une connexion. La disponibilité du fournisseur dépend de sa configuration.",
  "O assistente exige login. A disponibilidade do provedor depende da configuração."
 ],
 [
  "¿Qué quieres construir hoy?",
  "What do you want to build today?",
  "Was möchtest du heute entwickeln?",
  "Que souhaitez-vous créer aujourd’hui ?",
  "O que você quer construir hoje?"
 ],
 [
  "Divide el objetivo en tareas.",
  "Break the goal into tasks.",
  "Teile das Ziel in Aufgaben auf.",
  "Découpez l’objectif en tâches.",
  "Divida o objetivo em tarefas."
 ],
 [
  "Comprueba el resultado.",
  "Verify the result.",
  "Prüfe das Ergebnis.",
  "Vérifiez le résultat.",
  "Verifique o resultado."
 ],
 [
  "Documenta lo aprendido.",
  "Document what you learned.",
  "Dokumentiere deine Erkenntnisse.",
  "Documentez ce que vous avez appris.",
  "Documente o que aprendeu."
 ],
 [
  "El proceso también forma parte del proyecto.",
  "The process is part of the project.",
  "Der Prozess gehört zum Projekt.",
  "La démarche fait partie du projet.",
  "O processo também faz parte do projeto."
 ],
 [
  "06 / SIGUIENTE CAPÍTULO",
  "06 / NEXT CHAPTER",
  "06 / NÄCHSTES KAPITEL",
  "06 / PROCHAIN CHAPITRE",
  "06 / PRÓXIMO CAPÍTULO"
 ],
 [
  "Hablemos de",
  "Let's talk about",
  "Sprechen wir darüber,",
  "Parlons de",
  "Vamos conversar sobre"
 ],
 [
  "lo que podemos construir.",
  "what we can build.",
  "was wir entwickeln können.",
  "ce que nous pouvons créer.",
  "o que podemos construir."
 ],
 [
  "Busco mi primera oportunidad profesional en desarrollo web. Aquí puedes consultar mi código, explorar mis proyectos y revisar mi currículum.",
  "I'm seeking my first professional web development role. You can review my code, explore projects and read my résumé.",
  "Ich suche meine erste berufliche Stelle in der Webentwicklung. Hier findest du meinen Code, meine Projekte und meinen Lebenslauf.",
  "Je recherche mon premier poste en développement web. Vous pouvez consulter mon code, mes projets et mon CV.",
  "Procuro minha primeira oportunidade profissional em desenvolvimento web. Aqui você pode ver meu código, projetos e currículo."
 ],
 [
  "Ver mi GitHub",
  "View my GitHub",
  "Mein GitHub ansehen",
  "Voir mon GitHub",
  "Ver meu GitHub"
 ],
 [
  "Consultar CV",
  "View résumé",
  "Lebenslauf ansehen",
  "Consulter le CV",
  "Consultar currículo"
 ],
 [
  "Las redes y vías de contacto adicionales aparecerán cuando sus enlaces estén verificados.",
  "Additional contact links will appear once verified.",
  "Weitere Kontaktlinks erscheinen nach ihrer Überprüfung.",
  "D’autres moyens de contact seront ajoutés une fois vérifiés.",
  "Outros links de contato aparecerão quando forem verificados."
 ],
 [
  "Diseñado para mostrar trabajo real",
  "Designed to show real work",
  "Entwickelt, um echte Arbeit zu zeigen",
  "Conçu pour montrer un travail réel",
  "Criado para mostrar trabalho real"
 ],
 [
  "Volver arriba ↑",
  "Back to top ↑",
  "Nach oben ↑",
  "Retour en haut ↑",
  "Voltar ao topo ↑"
 ],
 [
  "Aplicación principal · Full-stack e IA",
  "Main application · Full-stack and AI",
  "Hauptanwendung · Fullstack und KI",
  "Application principale · Full-stack et IA",
  "Aplicação principal · Full-stack e IA"
 ],
 [
  "Espacio de trabajo con autenticación, proyectos privados, conversaciones persistentes y un asistente para planificar, aprender y depurar.",
  "Workspace with authentication, private projects, persistent conversations and an assistant for planning, learning and debugging.",
  "Arbeitsbereich mit Anmeldung, privaten Projekten, gespeicherten Unterhaltungen und Hilfe für Planung, Lernen und Debugging.",
  "Espace avec connexion, projets privés, conversations sauvegardées et assistant pour planifier, apprendre et déboguer.",
  "Espaço com autenticação, projetos privados, conversas persistentes e assistente para planejar, aprender e depurar."
 ],
 [
  "Next.js, Supabase Auth, PostgreSQL/RLS, API del proveedor de IA y verificaciones CI.",
  "Next.js, Supabase Auth, PostgreSQL/RLS, AI provider API and CI checks.",
  "Next.js, Supabase Auth, PostgreSQL/RLS, KI-Anbieter-API und CI-Prüfungen.",
  "Next.js, Supabase Auth, PostgreSQL/RLS, API de fournisseur IA et vérifications CI.",
  "Next.js, Supabase Auth, PostgreSQL/RLS, API do provedor de IA e verificações CI."
 ],
 [
  "Productividad · JavaScript",
  "Productivity · JavaScript",
  "Produktivität · JavaScript",
  "Productivité · JavaScript",
  "Produtividade · JavaScript"
 ],
 [
  "Gestor de tareas con creación, finalización y eliminación de pendientes. Los datos se conservan en el navegador.",
  "Task manager that creates, completes and removes tasks. Data is stored in the browser.",
  "Aufgabenverwaltung zum Erstellen, Abschließen und Löschen von Aufgaben. Daten bleiben im Browser.",
  "Gestion de tâches avec création, achèvement et suppression. Données conservées dans le navigateur.",
  "Gerenciador de tarefas para criar, concluir e excluir tarefas. Os dados ficam no navegador."
 ],
 [
  "Eventos del DOM, estado de interfaz y persistencia con localStorage.",
  "DOM events, UI state and localStorage persistence.",
  "DOM-Ereignisse, UI-Status und Speicherung mit localStorage.",
  "Événements DOM, état de l’interface et persistance avec localStorage.",
  "Eventos DOM, estado da interface e persistência com localStorage."
 ],
 [
  "Juego interactivo · Lógica",
  "Interactive game · Logic",
  "Interaktives Spiel · Logik",
  "Jeu interactif · Logique",
  "Jogo interativo · Lógica"
 ],
 [
  "Juego de palabras con selección de letras, estados de victoria o derrota y palabras personalizadas.",
  "Word game with letter selection, win/loss states and custom words.",
  "Wortspiel mit Buchstabenauswahl, Gewinn- und Verluststatus sowie eigenen Wörtern.",
  "Jeu de mots avec choix des lettres, états de victoire ou de défaite et mots personnalisés.",
  "Jogo de palavras com seleção de letras, vitória/derrota e palavras personalizadas."
 ],
 [
  "Lógica condicional, validación de entradas y respuesta a acciones del usuario.",
  "Conditional logic, input validation and user interaction.",
  "Bedingte Logik, Eingabevalidierung und Benutzerinteraktion.",
  "Logique conditionnelle, validation des entrées et interactions utilisateur.",
  "Lógica condicional, validação de entradas e interação com o usuário."
 ],
 [
  "Investigación privada · Machine learning",
  "Private research · Machine learning",
  "Private Forschung · Maschinelles Lernen",
  "Recherche privée · Apprentissage automatique",
  "Pesquisa privada · Aprendizado de máquina"
 ],
 [
  "Laboratorio experimental de Transformer causal y tokenización BPE, con entrenamiento y evaluaciones reproducibles.",
  "Experimental causal Transformer and BPE tokenization lab with reproducible training and evaluations.",
  "Experimentelles Labor für kausale Transformer und BPE-Tokenisierung mit reproduzierbarem Training und Evaluierung.",
  "Laboratoire expérimental de Transformer causal et tokenisation BPE, avec entraînements et évaluations reproductibles.",
  "Laboratório experimental de Transformer causal e tokenização BPE, com treinamento e avaliações reproduzíveis."
 ],
 [
  "Proyecto de investigación; el modelo propio aún no es un asistente conversacional fiable.",
  "Research project; the original model is not yet a reliable conversational assistant.",
  "Forschungsprojekt; das eigene Modell ist noch kein zuverlässiger Gesprächsassistent.",
  "Projet de recherche ; le modèle original n’est pas encore un assistant conversationnel fiable.",
  "Projeto de pesquisa; o modelo próprio ainda não é um assistente de conversa confiável."
 ],
 [
  "Fundamentos web",
  "Web foundations",
  "Webgrundlagen",
  "Fondamentaux du web",
  "Fundamentos web"
 ],
 [
  "Practicados directamente",
  "Practiced directly",
  "Direkt geübt",
  "Pratiqués directement",
  "Praticados diretamente"
 ],
 [
  "Aplicaciones modernas",
  "Modern applications",
  "Moderne Anwendungen",
  "Applications modernes",
  "Aplicações modernas"
 ],
 [
  "Implementados con asistencia de IA",
  "Implemented with AI assistance",
  "Mit KI-Unterstützung umgesetzt",
  "Mis en œuvre avec l’aide de l’IA",
  "Implementados com assistência de IA"
 ],
 [
  "Calidad y herramientas",
  "Quality and tooling",
  "Qualität und Werkzeuge",
  "Qualité et outils",
  "Qualidade e ferramentas"
 ],
 [
  "Evidencia en repositorios",
  "Evidence in repositories",
  "Nachweise in Repositories",
  "Preuves dans les dépôts",
  "Evidências nos repositórios"
 ],
 [
  "Pruebas de navegador",
  "Browser tests",
  "Browser-Tests",
  "Tests navigateur",
  "Testes de navegador"
 ],
 [
  "Revisión de código",
  "Code review",
  "Code-Review",
  "Revue de code",
  "Revisão de código"
 ],
 [
  "LABORATORIO / EXPERIMENTAL",
  "LAB / EXPERIMENTAL",
  "LABOR / EXPERIMENTELL",
  "LABORATOIRE / EXPÉRIMENTAL",
  "LABORATÓRIO / EXPERIMENTAL"
 ],
 [
  "Evaluación",
  "Evaluation",
  "Evaluierung",
  "Évaluation",
  "Avaliação"
 ],
 [
  "Arquitectura propia · Resultados en evaluación",
  "Original architecture · Results under evaluation",
  "Eigene Architektur · Ergebnisse in Prüfung",
  "Architecture originale · Résultats en cours d’évaluation",
  "Arquitetura própria · Resultados em avaliação"
 ],
 [
  "Tu espacio para crear.",
  "Your space to create.",
  "Dein Raum zum Entwickeln.",
  "Votre espace pour créer.",
  "Seu espaço para criar."
 ],
 [
  "¿En qué proyecto trabajamos hoy?",
  "Which project shall we work on today?",
  "An welchem Projekt arbeiten wir heute?",
  "Sur quel projet travaillons-nous aujourd’hui ?",
  "Em qual projeto vamos trabalhar hoje?"
 ],
 [
  "Planificar · Depurar · Aprender",
  "Plan · Debug · Learn",
  "Planen · Debuggen · Lernen",
  "Planifier · Déboguer · Apprendre",
  "Planejar · Depurar · Aprender"
 ],
 [
  "Representación de los módulos de Nexus AI",
  "Illustration of Nexus AI modules",
  "Darstellung der Nexus-AI-Module",
  "Illustration des modules Nexus AI",
  "Ilustração dos módulos Nexus AI"
 ],
 [
  "Diagrama conceptual de un modelo Transformer",
  "Conceptual diagram of a Transformer model",
  "Konzeptdiagramm eines Transformer-Modells",
  "Schéma conceptuel d’un modèle Transformer",
  "Diagrama conceitual de um modelo Transformer"
 ]
] as const;
const dictionary = new Map<string,readonly [string,string,string,string]>(entries.map(row=>[row[0],[row[1],row[2],row[3],row[4]]]));
const offset:Record<Exclude<SiteLanguage,"es">,number>={en:0,de:1,fr:2,pt:3};
export function careerTranslate(language:SiteLanguage,spanish:string):string {
 if(language==="es")return spanish;
 const translated=dictionary.get(spanish);
 return translated?translated[offset[language]]:spanish;
}
export function careerHasTranslation(spanish:string):boolean{return dictionary.has(spanish);}
