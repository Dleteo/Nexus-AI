import {engineeringCaseStudies} from "./engineering-case-studies";

export type CaseStudy = {
  slug: string;
  title: string;
  eyebrow: string;
  lead: string;
  role: string;
  status: string;
  tech: string[];
  problem: string;
  approach: string[];
  evidence: { label: string; detail: string; url: string }[];
  lessons: string[];
  limitations: string[];
  repository: string;
  demo?: string;
  next: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "nexus-ai",
    title: "Nexus AI",
    eyebrow: "01 / APLICACIÓN WEB E INTEGRACIÓN DE IA",
    lead: "Un espacio de trabajo para organizar proyectos y mantener conversaciones con un asistente técnico.",
    role: "Proyecto personal con implementación asistida por IA; revisión de código y comprobaciones documentadas.",
    status: "En desarrollo · no equivale a un SaaS comercial en producción",
    tech: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "GitHub Actions"],
    problem: "Quería reunir gestión de proyectos y ayuda de IA en una aplicación con cuentas y datos separados por usuario, en vez de depender de páginas aisladas.",
    approach: [
      "Separé las páginas públicas de las rutas protegidas y organicé el proyecto en componentes tipados con Next.js App Router.",
      "Utilicé Supabase Auth, cookies de sesión HTTP-only y políticas de seguridad a nivel de fila (RLS) para asociar los registros a su propietario.",
      "Implementé el acceso al proveedor de IA en rutas de servidor, conservando las claves fuera del navegador y limitando las solicitudes diarias.",
      "Añadí validaciones de lint, tipos, build y pruebas HTTP/navegador en GitHub Actions.",
    ],
    evidence: [
      { label: "Auditoría de seguridad", detail: "Controles de las cuatro APIs y restricciones documentadas del workspace.", url: "https://github.com/Dleteo/Nexus-AI/blob/feat/career-portfolio-20261026/docs/LABS_SECURITY_P0_2026-10-28.md" },
      { label: "Pruebas del espacio de trabajo", detail: "Pruebas de navegación y estados de la aplicación.", url: "https://github.com/Dleteo/Nexus-AI/blob/feat/career-portfolio-20261026/scripts/workspace_qa.py" },
      { label: "Rutas del asistente", detail: "Límites, autenticación y llamadas al proveedor desde servidor.", url: "https://github.com/Dleteo/Nexus-AI/blob/main/app/api/assistant/chat/route.ts" },
      { label: "Migraciones SQL y RLS", detail: "Tablas para conversaciones y acceso vinculado al usuario.", url: "https://github.com/Dleteo/Nexus-AI/blob/main/supabase/migrations/20261023130000_assistant_copilot_foundation.sql" },
      { label: "Validación continua", detail: "CI: ESLint, TypeScript, build y pruebas funcionales.", url: "https://github.com/Dleteo/Nexus-AI/blob/main/.github/workflows/ci.yml" },
    ],
    lessons: [
      "Separar la gestión del portafolio y la asistencia técnica ayuda a establecer responsabilidades y límites distintos.",
      "La integración con modelos externos no constituye evidencia de un modelo propio entrenado.",
      "Las claves privadas no deben incorporarse al frontend ni al control de versiones.",
      "Un proyecto funcional necesita criterios de prueba además de una interfaz atractiva.",
      "Una herramienta de IA requiere límites, validación y honestidad sobre lo que sí puede hacer.",
    ],
    limitations: [
      "El asistente depende de un proveedor externo configurado y de sus cuotas.",
      "El proyecto no debe presentarse como un servicio comercial o un despliegue de producción verificado.",
      "Nexus Foundation es un modelo experimental independiente; no alimenta el asistente web.",
    ],
    repository: "https://github.com/Dleteo/Nexus-AI",
    demo: "/assistant",
    next: "Mejorar pruebas de accesibilidad, experiencia móvil y documentación de despliegue público antes de una publicación estable.",
  },
  {
    slug: "task-tracker",
    title: "Task Tracker",
    eyebrow: "02 / JAVASCRIPT Y PERSISTENCIA LOCAL",
    lead: "Una pequeña aplicación de tareas que demuestra manipulación del DOM y almacenamiento en el navegador.",
    role: "Práctica personal de frontend con JavaScript, HTML y CSS.",
    status: "Proyecto educativo · datos locales al navegador",
    tech: ["JavaScript", "HTML", "CSS", "DOM", "localStorage"],
    problem: "Practicar el ciclo de vida de una interfaz: crear una tarea, cambiar su estado, eliminarla y conservar el resultado tras recargar la página.",
    approach: [
      "Modelé una lista de tareas con texto y un indicador de finalización.",
      "Conecté eventos de formulario y botones a operaciones de alta, actualización y eliminación.",
      "Guardé el estado serializado mediante localStorage para restaurarlo al abrir la página.",
    ],
    evidence: [
      { label: "Lógica de tareas", detail: "Funciones de creación, cambio de estado, eliminación y persistencia.", url: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript/blob/main/script.js" },
      { label: "Código y documentación", detail: "Instrucciones para ejecutar la aplicación sin backend.", url: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript" },
    ],
    lessons: [
      "Entendí la relación entre eventos, estado y renderizado del DOM.",
      "Un dato guardado en el navegador no equivale a sincronización entre dispositivos.",
    ],
    limitations: [
      "Es un ejercicio básico, sin autenticación ni sincronización multiusuario.",
      "El código original usa innerHTML para insertar texto de tareas; antes de convertirlo en producto se debe cambiar por creación segura de nodos y textContent.",
    ],
    repository: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript",
    demo: "https://dleteo.github.io/-To-Do-App-whit-JavaScript/",
    next: "Refactorizar el renderizado con textContent, añadir tests de entradas y, solo si el caso de uso lo pide, sincronización con base de datos.",
  },
  {
    slug: "hangman",
    title: "Hangman Game",
    eyebrow: "03 / LÓGICA E INTERACCIÓN",
    lead: "Un juego de adivinar palabras basado en eventos del teclado y estados de victoria o derrota.",
    role: "Práctica personal de JavaScript y manejo de estado.",
    status: "Proyecto educativo · juego de navegador",
    tech: ["JavaScript", "HTML", "CSS", "DOM"],
    problem: "Aprender a estructurar reglas de juego con cambios de estado, entradas del usuario y representación visual coherente de cada jugada.",
    approach: [
      "Mantuve una palabra objetivo, las letras acertadas y erradas, y el número de intentos.",
      "Bloqueé letras repetidas para evitar duplicar jugadas y actualicé la vista al cambiar el estado.",
      "Añadí validación para las palabras personalizadas y mensajes diferenciados de victoria o derrota.",
    ],
    evidence: [
      { label: "Motor del juego", detail: "Estados, control de teclado, intentos y renderizado del DOM.", url: "https://github.com/Dleteo/hangman-game/blob/main/js/script.js" },
      { label: "Repositorio", detail: "Estructura del juego y recursos gráficos originales.", url: "https://github.com/Dleteo/hangman-game" },
    ],
    lessons: [
      "Separar las reglas del juego de su representación facilita encontrar errores.",
      "Validar el formato de entrada evita estados inesperados.",
    ],
    limitations: [
      "Es una aplicación de aprendizaje, no un producto con pruebas automatizadas extensivas.",
      "La experiencia de teclado y los lectores de pantalla necesitan una revisión adicional de accesibilidad.",
    ],
    repository: "https://github.com/Dleteo/hangman-game",
    demo: "https://dleteo.github.io/hangman-game/",
    next: "Aislar el motor en funciones puras, escribir pruebas de reglas y reforzar la accesibilidad del teclado.",
  },
  {
    slug: "nexus-foundation",
    title: "Nexus Foundation",
    eyebrow: "04 / INVESTIGACIÓN DE MODELOS",
    lead: "Un laboratorio privado de redes neuronales para comprender tokenización, entrenamiento, evaluación y límites de un modelo de lenguaje.",
    role: "Investigación experimental; implementación en Python y PyTorch, con herramientas de apoyo.",
    status: "Experimental · sin demo pública ni asistente neuronal fiable",
    tech: ["Python", "PyTorch", "BPE", "Transformer", "Evaluación"],
    problem: "Entender desde sus fundamentos cómo se entrena y evalúa un Transformer pequeño, sin confundir resultados de predicción de tokens con inteligencia conversacional.",
    approach: [
      "Construí una arquitectura causal pequeña con tokenizador BPE y separación de datos para entrenamiento, validación y pruebas.",
      "Separé el laboratorio de modelos del catálogo documental de fuentes técnicas, evitando presentar búsquedas como conocimientos aprendidos.",
      "Introduje utilidades de evaluación y experimentos controlados, con protección de checkpoints y datos privados.",
    ],
    evidence: [],
    lessons: [
      "La reducción de loss no demuestra por sí misma comprensión o calidad de una respuesta.",
      "La procedencia y licencias del corpus son parte del diseño del sistema.",
    ],
    limitations: [
      "Los pesos experimentales no conversan ni programan con fiabilidad.",
      "El repositorio y los checkpoints se mantienen privados.",
    ],
    repository: "",
    next: "Definir pruebas reproducibles y ampliar exclusivamente datos autorizados antes de afirmar capacidades nuevas.",
  },
  ...engineeringCaseStudies,
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
