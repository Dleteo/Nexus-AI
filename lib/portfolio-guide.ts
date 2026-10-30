import {certifications,totalTrainingHours} from '../data/certifications';
import {personalPracticeHours,proficiency,skillEvidence} from '../data/professional-development';
import {professionalProfile} from '../data/profile';
import {resumeCopy} from '../data/resume-copy';
import {getCaseStudy} from '../data/case-studies';
import {translatedCaseStudy} from '../data/localized-case-studies';
import {cvPath,cvDownloadPath,type SiteLanguage} from '../data/site-languages';

export type PortfolioGuideAnswer={
 text:string;
 topic:string;
 links:{href:string;label:string}[];
 project?:string;
};
const projects=[
 {slug:'nexus-ai',name:'Nexus AI Workspace',pattern:/\b(?:workspace|nexus[\s-]+ai)\b/},
 {slug:'nexus-commerce',name:'Nexus Commerce',pattern:/\bcommerce\b/},
 {slug:'nexus-studio',name:'Nexus Studio',pattern:/\bstudio\b/},
 {slug:'nexus-monitor',name:'Nexus Monitor',pattern:/\bmonitor\b/},
 {slug:'nexus-factory',name:'Nexus Software Factory',pattern:/\b(?:factory|fabrica)\b/},
] as const;
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

/** Public, deterministic answers. This helper neither calls a model nor stores visitor data. */
export function answerPortfolioQuestion(question:string,language:SiteLanguage,previousProject?:string):PortfolioGuideAnswer{
 const t=(es:string,en:string,de:string,fr:string,pt:string)=>({es,en,de,fr,pt})[language];
 const q=normalize(question).slice(0,2000);
 const projectLink=(slug:string,label:string)=>({href:'/projects/'+slug+'?lang='+language,label});
 const allProjectLinks=projects.map(p=>projectLink(p.slug,p.name));
 const sectionLink=(id:string,label:string)=>({href:'#'+id,label});
 // Compare only explicitly named public projects, preserving their mention order.
 const wantsComparison=/\b(?:compar(?:e|es|ed|ing|a|ar|as|aisons?|isons?|er|ez|ons|ando|acao|acoes|acion|aciones)|vergleichen|vergleiche|vergleich|versus|vs|differences?|diferencias?|diferencas?|unterschiede?|differenzen?)\b/.test(q);
 if(wantsComparison){
  const mentioned=projects.map(project=>({project,index:q.search(project.pattern)}))
   .filter(match=>match.index>=0).sort((a,b)=>a.index-b.index).map(match=>match.project);
  if(mentioned.length<2)return {
   topic:'comparison-choice',
   text:t('¿Qué proyectos quieres comparar? Elige al menos dos de estos cinco proyectos documentados.','Which projects would you like to compare? Choose at least two of these five documented projects.','Welche Projekte möchtest du vergleichen? Wähle mindestens zwei dieser fünf dokumentierten Projekte.','Quels projets souhaitez-vous comparer ? Choisissez au moins deux de ces cinq projets documentés.','Quais projetos gostaria de comparar? Escolha pelo menos dois destes cinco projetos documentados.'),
   links:allProjectLinks,
  };
  const purpose=t('Propósito','Purpose','Zweck','Objectif','Objetivo');
  const technologies=t('Tecnologías','Technologies','Technologien','Technologies','Tecnologias');
  const limitation=t('Límite documentado','Documented limitation','Dokumentierte Grenze','Limite documentée','Limite documentado');
  const blocks=mentioned.map(project=>{
   const study=translatedCaseStudy(getCaseStudy(project.slug)!,language);
   return project.name+'\n'+purpose+': '+study.lead+'\n'+technologies+': '+study.tech.join(' · ')+'\n'+limitation+': '+study.limitations[0];
  });
  return {
   topic:'project-comparison',
   text:t('Comparación de proyectos','Project comparison','Projektvergleich','Comparaison des projets','Comparação de projetos')+'\n\n'+blocks.join('\n\n'),
   links:mentioned.map(project=>projectLink(project.slug,project.name)),
  };
 }
 const explicit=projects.find(p=>p.pattern.test(q));
 const wantsTests=/\b(?:tests?|testing|tested|pruebas?|probar|pruefe?n|prufungen?|testes?|testee?s?|gepruft|verificacoes)\b/.test(q);
 const wantsLimits=/\b(?:limits?|limitations?|limites?|limitaciones|restricciones|grenzen|einschrankungen|limitations|restricoes|cannot|disabled|execution|execute|ejecutar|executar|ausfuhrung|sandbox|autonomous|autonomos)\b/.test(q);
 const isFollowup=/\b(?:more|details?|else|about it|mas|detalles|weiter|mehr|details|encore|mais|detalhes)\b/.test(q);
 const prior=projects.find(p=>p.slug===previousProject||p.slug==='nexus-'+previousProject);
 const selected=explicit??((wantsTests||wantsLimits||isFollowup)?prior:undefined);
 const limitsLabel=t('Límites','Limitations','Grenzen','Limites','Limites');
 const testsLabel=t('Pruebas documentadas','Documented checks','Dokumentierte Prüfungen','Vérifications documentées','Verificações documentadas');
 if(selected){
  const original=getCaseStudy(selected.slug)!;
  const study=translatedCaseStudy(original,language);
  const links=[projectLink(selected.slug,t('Ver caso de estudio','Read case study','Fallstudie lesen','Voir l’étude de cas','Ver estudo de caso'))];
  if(wantsTests){
   const details:Record<string,string>={
    'nexus-ai':t('Se comprueban APIs autenticadas, separación por usuario y flujos de navegador. Las pruebas de modelos usan proveedores simulados; no acreditan inferencia real.','Checks cover authenticated APIs, per-user access and browser flows. Model tests use simulated providers and do not verify live inference.','Geprüft werden authentifizierte APIs, nutzergetrennter Zugriff und Browserabläufe. Modelltests verwenden simulierte Anbieter und belegen keine echte Inferenz.','Les vérifications couvrent les API authentifiées, l’accès par utilisateur et les parcours navigateur. Les tests de modèles utilisent des fournisseurs simulés, sans prouver une inférence réelle.','As verificações cobrem APIs autenticadas, acesso por usuário e fluxos de navegador. Os testes de modelos usam provedores simulados e não comprovam inferência real.'),
    'nexus-commerce':t('Las pruebas del backend local comprueban validación de pedidos, transacciones, stock y compras concurrentes; también hay comprobaciones HTTP y de navegador. No se procesan pagos reales.','Local backend tests cover order validation, transactions, inventory and concurrent orders, alongside HTTP and browser checks. No real payments are processed.','Lokale Backendtests prüfen Bestellvalidierung, Transaktionen, Lagerbestand und parallele Bestellungen sowie HTTP- und Browserabläufe. Es werden keine echten Zahlungen verarbeitet.','Les tests du backend local vérifient les commandes, les transactions, les stocks et les achats concurrents, avec des contrôles HTTP et navigateur. Aucun paiement réel n’est traité.','Os testes do backend local verificam pedidos, transações, estoque e compras simultâneas, além de HTTP e navegador. Não há pagamentos reais.'),
    'nexus-studio':t('Las pruebas cubren conflictos de revisión, guardado, restauración de versiones y escapado del HTML exportado, además de peticiones HTTP y flujos del editor.','Tests cover revision conflicts, saving, restoring versions and escaping exported HTML, plus HTTP requests and editor flows.','Tests prüfen Versionskonflikte, Speichern, Wiederherstellung und HTML-Escaping sowie HTTP-Anfragen und Editorabläufe.','Les tests couvrent les conflits de versions, l’enregistrement, la restauration et l’échappement HTML, ainsi que les requêtes HTTP et les parcours de l’éditeur.','Os testes cobrem conflitos de revisão, salvamento, restauração e escape do HTML exportado, além de HTTP e fluxos do editor.'),
    'nexus-monitor':t('Se prueban respuestas HTTP fallidas o malformadas, persistencia de mediciones, latencia y alertas locales. Son comprobaciones manuales, no monitorización continua ni un SLA.','Checks cover failed or malformed HTTP responses, stored measurements, latency and local alerts. These are manual checks, not continuous monitoring or an SLA.','Geprüft werden fehlerhafte HTTP-Antworten, gespeicherte Messwerte, Latenz und lokale Warnungen. Das sind manuelle Prüfungen, keine Dauerüberwachung oder ein SLA.','Les tests couvrent les réponses HTTP défaillantes ou malformées, les mesures enregistrées, la latence et les alertes locales. Il s’agit de contrôles manuels, sans surveillance continue ni SLA.','As verificações cobrem respostas HTTP falhas ou malformadas, medições salvas, latência e alertas locais. São verificações manuais, não monitoramento contínuo nem SLA.'),
    'nexus-factory':t('Las pruebas verifican aprobación del snapshot, memoria, validaciones estáticas e integridad del ZIP. La QA estática no ejecuta el código generado; el sandbox real sigue pendiente.','Tests check snapshot approval, memory, static validation and ZIP integrity. Static QA does not execute generated code; the real sandbox remains unverified.','Tests prüfen Snapshot-Freigabe, Speicher, statische Validierung und ZIP-Integrität. Statische QA führt keinen generierten Code aus; die echte Sandbox ist noch nicht verifiziert.','Les tests vérifient l’approbation du snapshot, la mémoire, la validation statique et l’intégrité ZIP. La QA statique n’exécute pas le code généré ; le véritable sandbox reste non vérifié.','Os testes verificam aprovação do snapshot, memória, validação estática e integridade ZIP. A QA estática não executa código gerado; o sandbox real continua sem verificação.'),
   };
   return {topic:'project-tests',project:selected.slug,text:selected.name+' — '+testsLabel+'\n'+details[selected.slug],links};
  }
  if(wantsLimits){
   const limits=selected.slug==='nexus-ai'?[t('Las respuestas generadas necesitan sesión y un proveedor configurado. Las pruebas con modelos simulados no acreditan inferencia real.','Generated answers require sign-in and a configured provider. Simulated model tests do not verify live inference.','Generierte Antworten erfordern Anmeldung und einen konfigurierten Anbieter. Simulierte Modelltests belegen keine echte Inferenz.','Les réponses générées nécessitent une connexion et un fournisseur configuré. Les tests simulés ne prouvent pas une inférence réelle.','Respostas geradas exigem login e um provedor configurado. Testes simulados não comprovam inferência real.')]:study.limitations;
   return {topic:'project-limits',project:selected.slug,text:selected.name+' — '+limitsLabel+'\n'+limits.join('\n'),links};
  }
  return {topic:'project',project:selected.slug,text:selected.name+'\n'+study.lead+'\n'+study.role+'\n'+study.tech.join(' · '),links};
 }
 if(wantsTests||wantsLimits){
  return {topic:'projects',text:t('¿Qué proyecto quieres revisar? Elige uno para consultar sus pruebas y límites.','Which project would you like to review? Choose one to explore its checks and limitations.','Welches Projekt möchtest du prüfen? Wähle eines für Tests und Grenzen.','Quel projet souhaitez-vous examiner ? Choisissez-en un pour voir ses tests et limites.','Qual projeto gostaria de revisar? Escolha um para ver testes e limites.'),links:allProjectLinks};
 }
 if(/\b(?:certificates?|certificados?|certificats?|zertifikate?|attestations?|courses?|cursos?|training|formation|bildung|formacao|hours?|horas?|stunden|heures?|100|94)\b/.test(q)){
  const hours=totalTrainingHours.toLocaleString(language),practice=personalPracticeHours.toLocaleString(language);
  return {topic:'training',text:t(
   `${certifications.length} certificados y ${hours} horas de formación documentada. Por separado, Joshua estima ${practice} horas programando el portafolio; no son horas cronometradas ni experiencia laboral acreditada.`,
   `${certifications.length} certificates and ${hours} documented training hours. Separately, Joshua estimates ${practice} hours programming the portfolio; this is not tracked time or verified professional experience.`,
   `${certifications.length} Nachweise und ${hours} dokumentierte Kursstunden. Separat schätzt Joshua ${practice} Stunden Programmierarbeit am Portfolio; keine gemessene Zeit oder belegte Berufserfahrung.`,
   `${certifications.length} attestations et ${hours} heures de formation documentée. Séparément, Joshua estime ${practice} heures de programmation du portfolio ; ce ne sont pas des heures chronométrées ni une expérience professionnelle attestée.`,
   `${certifications.length} certificados e ${hours} horas de formação documentada. Separadamente, Joshua estima ${practice} horas programando o portfólio; não são horas cronometradas nem experiência profissional comprovada.`
  ),links:[sectionLink('certificados',t('Ver certificados','View certificates','Nachweise ansehen','Voir les attestations','Ver certificados'))]};
 }
 if(/\b(?:cv|resume|curriculum|lebenslauf|curriculo)\b/.test(q)){
  return {topic:'cv',text:t('Puedes leer el CV o descargar el PDF en el idioma seleccionado.','Read the resume or download its PDF in the selected language.','Lies den Lebenslauf oder lade das PDF in der gewählten Sprache herunter.','Consultez le CV ou téléchargez son PDF dans la langue sélectionnée.','Leia o currículo ou baixe o PDF no idioma selecionado.'),links:[{href:cvPath(language),label:t('Ver CV','View resume','Lebenslauf ansehen','Voir CV','Ver currículo')},{href:cvDownloadPath(language),label:t('Descargar PDF','Download PDF','PDF herunterladen','Télécharger PDF','Baixar PDF')}]};
 }
 if(/\b(?:contact|contacto|contactar|kontakt|contato|contatar|contacter|email|e-mail|mail|correo|contratar|hire|hiring|recruiter|recrutement)\b/.test(q)){
  return {topic:'contact',text:t('Puedes escribir a Joshua para oportunidades junior o colaboraciones: ','Contact Joshua about junior opportunities or collaborations: ','Kontaktiere Joshua für Junior-Stellen oder Zusammenarbeit: ','Contactez Joshua pour un poste junior ou une collaboration : ','Fale com Joshua sobre vagas júnior ou colaborações: ')+professionalProfile.email,links:[{href:'mailto:'+professionalProfile.email,label:t('Enviar correo','Send email','E-Mail senden','Envoyer un e-mail','Enviar e-mail')},sectionLink('contacto',t('Contacto','Contact','Kontakt','Contact','Contato'))]};
 }
 if(/\b(?:github|linkedin|instagram|socials?|redes|reseaux|netzwerke?)\b/.test(q)){
  return {topic:'social',text:t('Estos son los perfiles públicos de Joshua.','These are Joshua’s public profiles.','Das sind Joshuas öffentliche Profile.','Voici les profils publics de Joshua.','Estes são os perfis públicos de Joshua.'),links:[{href:professionalProfile.github,label:'GitHub'},{href:professionalProfile.linkedin,label:'LinkedIn'},{href:professionalProfile.instagram,label:'Instagram'}]};
 }
 if(/\b(?:experience|experiencia|experiences?|berufserfahrung|career|background|first role|first job|junior|responsibility|responsabilidad|constancia)\b/.test(q)){
  return {topic:'experience',text:t('Joshua busca su primera oportunidad profesional en desarrollo web. ','Joshua is seeking his first professional web development opportunity. ','Joshua sucht seine erste berufliche Stelle in der Webentwicklung. ','Joshua recherche sa première opportunité professionnelle en développement web. ','Joshua busca sua primeira oportunidade profissional em desenvolvimento web. ')+resumeCopy[language].experience,links:[{href:cvPath(language),label:t('Ver CV','View resume','Lebenslauf ansehen','Voir CV','Ver currículo')}]};
 }
 if(/\b(?:ai|ia|ki|llm|models?|modelos?|modeles?|ollama|gemini|openai|agents?|agentes?|autonomous|autonomos?)\b/.test(q)){
  return {topic:'ai',text:t('La IA se utiliza como apoyo al desarrollo y revisión. Esta guía usa respuestas locales verificables. Las respuestas generadas requieren sesión y un proveedor configurado; las pruebas simuladas no demuestran inferencia real. Factory no ejecuta código generado ni agentes autónomos.','AI supports development and review. This guide provides local, documented answers. Generated answers need sign-in and a configured provider; simulated tests do not establish live inference. Factory does not execute generated code or autonomous agents.','KI unterstützt Entwicklung und Prüfung. Dieser Guide gibt lokale, dokumentierte Antworten. Generierte Antworten benötigen Anmeldung und einen konfigurierten Anbieter; simulierte Tests belegen keine echte Inferenz. Factory führt weder generierten Code noch autonome Agenten aus.','L’IA aide au développement et à la revue. Ce guide fournit des réponses locales documentées. Les réponses générées exigent une connexion et un fournisseur configuré ; les tests simulés ne prouvent pas une inférence réelle. Factory n’exécute ni code généré ni agents autonomes.','A IA apoia o desenvolvimento e a revisão. Este guia oferece respostas locais documentadas. Respostas geradas exigem login e um provedor configurado; testes simulados não comprovam inferência real. Factory não executa código gerado nem agentes autônomos.'),links:[projectLink('nexus-ai','Nexus AI Workspace'),projectLink('nexus-factory','Nexus Software Factory')]};
 }
 if(/\b(?:technical|tecnico|technisch|technique|hardware|gpu|cpu|malware|cve|debug|debugging|bug|bugs|error|errors|code|codigo|programming|programmieren|programmierung|programar|programacao|programmation|codage|security|seguridad)\b/.test(q)){
  return {topic:'technical',text:t('Esta guía explica datos del portafolio. Para diagnóstico técnico o ayuda de programación, abre Nexus Technical. Las respuestas generadas requieren sesión y proveedor configurado.','This guide explains portfolio information. For technical troubleshooting or programming help, open Nexus Technical. Generated answers require sign-in and a configured provider.','Dieser Guide erklärt Portfolio-Daten. Für technische Diagnose oder Programmierhilfe öffne Nexus Technical. Generierte Antworten benötigen Anmeldung und einen konfigurierten Anbieter.','Ce guide présente les informations du portfolio. Pour le dépannage technique ou la programmation, ouvrez Nexus Technical. Les réponses générées nécessitent une connexion et un fournisseur configuré.','Este guia apresenta informações do portfólio. Para diagnóstico técnico ou ajuda de programação, abra o Nexus Technical. Respostas geradas exigem login e um provedor configurado.'),links:[{href:'/assistant?scope=technical',label:'Nexus Technical'}]};
 }
 if(/\b(?:skills?|habilidades?|competences?|kompetenzen|kenntnisse|stack|technologies|tecnologias|react|next|javascript|typescript|python|html|css|sql|supabase|git|accessibility|testing)\b/.test(q)){
  const skill=skillEvidence.find(s=>normalize(s.name).split(/[^a-z0-9]+/).filter(word=>word.length>=3).some(word=>new RegExp('\\b'+word+'\\b').test(q)));
  const details=skill?skill.name+': '+t('uso en proyectos','project usage','Projektnutzung','usage en projets','uso em projetos')+' '+skill.projects+'/'+projects.length+'; '+t('conocimiento estimado','estimated familiarity','geschätzte Kenntnisse','connaissances estimées','conhecimento estimado')+' '+(proficiency[skill.id]??0)+'/5. ':'';
  return {topic:'skills',text:details+t('Los puntos distinguen presencia en proyectos y familiaridad provisional basada en trabajo asistido por IA. No son una prueba de dominio independiente.','Ratings distinguish project presence from provisional familiarity based on AI-assisted work. They are not an independent proficiency assessment.','Die Punkte unterscheiden Projektnutzung und vorläufige Vertrautheit aus KI-gestützter Arbeit. Sie sind kein unabhängiger Kompetenznachweis.','Les points distinguent la présence dans les projets et la familiarité provisoire issue du travail assisté par IA. Ils ne sont pas une évaluation indépendante.','Os pontos distinguem presença em projetos e familiaridade provisória baseada no trabalho assistido por IA. Não são uma avaliação independente de domínio.'),links:[sectionLink('habilidades',t('Ver habilidades','View skills','Kenntnisse ansehen','Voir les compétences','Ver habilidades'))]};
 }
 if(/\b(?:projects?|proyectos?|projets?|projetos?|projekte|portfolio|portafolio|portefolio)\b/.test(q)){
  return {topic:'projects',text:t('Mis cinco proyectos destacados: ','My five featured projects: ','Meine fünf Hauptprojekte: ','Mes cinq projets principaux : ','Meus cinco projetos principais: ')+projects.map(p=>p.name).join(' · '),links:allProjectLinks};
 }
 if(/^\s*(?:hello|hi|hey|hola|buenas|hallo|bonjour|salut|ola|oi)[!.\s]*$/.test(q)){
  return {topic:'greeting',text:t('Hola, soy la guía del portafolio de Joshua. Puedo explicar sus proyectos, formación, habilidades y contacto. ¿Por dónde empezamos?','Hello, I’m Joshua’s portfolio guide. I can explain his projects, training, skills and contact options. Where would you like to start?','Hallo, ich bin Joshuas Portfolio-Guide. Ich erkläre Projekte, Kurse, Kenntnisse und Kontaktmöglichkeiten. Womit möchtest du anfangen ?','Bonjour, je suis le guide du portfolio de Joshua. Je peux présenter ses projets, formations, compétences et contacts. Par où commencer ?','Olá, sou o guia do portfólio de Joshua. Posso apresentar projetos, formação, habilidades e contato. Por onde começamos?'),links:[sectionLink('proyectos',t('Proyectos','Projects','Projekte','Projets','Projetos')),{href:cvPath(language),label:'CV'}]};
 }

 return {topic:'unknown',text:t('¿Quieres conocer un proyecto, el CV, los certificados o cómo contactar a Joshua? Dime el nombre del proyecto para obtener una respuesta concreta.','Would you like to explore a project, the resume, certificates or contacting Joshua? Name a project for a specific answer.','Möchtest du ein Projekt, den Lebenslauf, Nachweise oder Joshuas Kontakt ansehen? Nenne ein Projekt für eine konkrete Antwort.','Souhaitez-vous découvrir un projet, le CV, les attestations ou contacter Joshua ? Nommez un projet pour une réponse précise.','Gostaria de conhecer um projeto, o currículo, os certificados ou falar com Joshua? Diga o nome de um projeto para uma resposta específica.'),links:[sectionLink('proyectos',t('Proyectos','Projects','Projekte','Projets','Projetos')),{href:cvPath(language),label:'CV'},sectionLink('certificados',t('Certificados','Certificates','Nachweise','Attestations','Certificados'))]};
}
