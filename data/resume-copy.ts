/** Single source of truth for the web resume and both downloadable PDFs. */
import { extraResumeCopy } from "./resume-additional-copy";
import type { SiteLanguage } from "./site-languages";
export type ResumeLang = SiteLanguage;
export type ResumeProject = { name: string; stack: string; url: string; summary: string };
export type ResumeCopy = {
  locale: string;
  role: string;
  headline: string;
  summary: string;
  headings: { profile: string; projects: string; skills: string; experience: string; training: string; research: string; languages: string };
  projects: ResumeProject[];
  skillGroups: { title: string; items: string }[];
  experience: string;
  research: string;
  languages: string;
  trainingNote: string;
  completedLabel: string;
  attendanceLabel: string;
  footnote: string;
};
export const resumeCopy: Record<ResumeLang, ResumeCopy> = {
  es: {
    locale: "es",
    role: "Desarrollador web junior",
    headline: "JavaScript · React / Next.js · Aplicaciones con IA",
    summary: "Desarrollador web junior con proyectos prácticos de JavaScript y una aplicación Next.js con autenticación, gestión de proyectos y un asistente de IA. Experiencia de aprendizaje en interfaces responsive, persistencia y pruebas automatizadas. Busco mi primera oportunidad profesional en desarrollo web o frontend.",
    headings: { profile: "PERFIL PROFESIONAL", projects: "PROYECTOS SELECCIONADOS", skills: "COMPETENCIAS TÉCNICAS", experience: "EXPERIENCIA TRANSFERIBLE", training: "FORMACIÓN DOCUMENTADA", research: "INVESTIGACIÓN ADICIONAL", languages: "IDIOMAS" },
    projects: [
      { name: "Nexus AI", stack: "Next.js · React · TypeScript · Supabase", url: "https://github.com/Dleteo/Nexus-AI", summary: "Aplicación personal con cuentas de usuario, gestión de proyectos, chat de IA con historial y controles de acceso. Integración de IA y componentes implementados con asistencia; revisiones y pruebas documentadas." },
      { name: "Task Tracker", stack: "JavaScript · DOM · localStorage", url: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript", summary: "Gestor de tareas en navegador con creación, finalización, eliminación y persistencia local. Ejercicio de frontend, con mejoras de seguridad identificadas." },
      { name: "Hangman Game", stack: "JavaScript · HTML · CSS", url: "https://github.com/Dleteo/hangman-game", summary: "Juego de palabras con estados de victoria/derrota, entradas validadas y control de letras repetidas." },
    ],
    skillGroups: [
      { title: "Práctica directa", items: "HTML5, CSS3, diseño responsive, JavaScript ES6, DOM, localStorage, Git y GitHub." },
      { title: "Integración asistida por IA", items: "React, Next.js, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL/RLS, rutas API." },
      { title: "Calidad", items: "ESLint, type-check, compilación, pruebas HTTP y navegador, GitHub Actions." },
    ],
    experience: "Operaciones de cocina y hostelería (fuera de tecnología): seguimiento de procesos, trabajo en equipo, coordinación y ejecución fiable con plazos exigentes. Busco mi primer empleo profesional en desarrollo.",
    research: "Nexus Foundation: investigación experimental privada en Python/PyTorch sobre tokenización BPE y Transformers pequeños. No es un asistente conversacional listo para producción.",
    languages: "Español nativo · Inglés intermedio (autoevaluación).",
    trainingNote: "Las horas indicadas corresponden a formación, no a horas de programación ni a experiencia profesional.",
    completedLabel: "curso completado",
    attendanceLabel: "constancia de asistencia",
    footnote: "Sin atribuir títulos universitarios, experiencia comercial o resultados no verificados. Contacto adicional pendiente de confirmación.",
  },
  en: {
    locale: "en",
    role: "Junior Web Developer",
    headline: "JavaScript · React / Next.js · AI-integrated applications",
    summary: "Entry-level web developer with hands-on JavaScript projects and a Next.js application featuring authentication, project management, and an AI assistant. Practical learning experience in responsive interfaces, data persistence, and automated checks. Seeking a first professional Junior Web Developer or Junior Frontend Developer opportunity.",
    headings: { profile: "PROFESSIONAL PROFILE", projects: "SELECTED PROJECTS", skills: "TECHNICAL SKILLS", experience: "TRANSFERABLE EXPERIENCE", training: "DOCUMENTED TRAINING", research: "ADDITIONAL RESEARCH", languages: "LANGUAGES" },
    projects: [
      { name: "Nexus AI", stack: "Next.js · React · TypeScript · Supabase", url: "https://github.com/Dleteo/Nexus-AI", summary: "Personal application with user accounts, project management, saved AI chat history, and user-specific access controls. AI-assisted implementation, with documented code review and testing." },
      { name: "Task Tracker", stack: "JavaScript · DOM · localStorage", url: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript", summary: "Browser task manager supporting creation, completion, deletion, and local persistence. Educational frontend project with identified security improvements." },
      { name: "Hangman Game", stack: "JavaScript · HTML · CSS", url: "https://github.com/Dleteo/hangman-game", summary: "Word-guessing game featuring win/loss state, input validation, and repeated-letter handling." },
    ],
    skillGroups: [
      { title: "Hands-on practice", items: "HTML5, CSS3, responsive layouts, JavaScript ES6, DOM, localStorage, Git and GitHub." },
      { title: "AI-assisted implementation", items: "React, Next.js, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL/RLS, API routes." },
      { title: "Quality workflow", items: "ESLint, type checks, production builds, HTTP/browser testing, GitHub Actions." },
    ],
    experience: "Hospitality and kitchen operations (non-developer role): following procedures, teamwork, coordination, and reliable execution under time constraints. Seeking a first paid software development position.",
    research: "Nexus Foundation: private experimental Python/PyTorch research involving BPE tokenization and small Transformer models. Not a production-ready conversational AI.",
    languages: "Spanish: native · English: intermediate (self-assessed).",
    trainingNote: "Training hours are course/attendance hours, not coding hours or professional employment.",
    completedLabel: "course completion",
    attendanceLabel: "attendance certificate",
    footnote: "No unverified degree, paid developer employment, clients or results claimed. Additional contact details pending confirmation.",
  },
  ...extraResumeCopy,
};
