/**
 * Public-facing Nexus One index.
 *
 * Only references existing PUBLIC source repositories and existing routes.
 * The private Nexus Foundation and backup repositories are deliberately
 * represented by a description, never copied into this public product.
 */
export type NexusOneProject = {
  id: string;
  title: string;
  subtitle: string;
  kind: "flagship" | "practice";
  summary: string;
  technologies: readonly string[];
  source: string;
  demo?: string;
  evidence: string;
};

export const nexusOneProjects: readonly NexusOneProject[] = [
  {
    id: "nexus-ai",
    title: "Nexus AI",
    subtitle: "The flagship / Product engineering",
    kind: "flagship",
    summary: "A responsive web application bringing together authentication, a user-owned project workspace, saved conversations and server-side AI assistance.",
    technologies: ["Next.js", "React", "TypeScript", "Supabase", "AI integration"],
    source: "https://github.com/Dleteo/Nexus-AI",
    evidence: "Case study, code, authenticated features and tracked automated checks. Built with AI-assisted implementation and review.",
  },
  {
    id: "task-tracker",
    title: "Task Tracker",
    subtitle: "DOM / Productivity",
    kind: "practice",
    summary: "An interactive task manager with local browser persistence.",
    technologies: ["HTML", "CSS", "JavaScript", "localStorage"],
    source: "https://github.com/Dleteo/-To-Do-App-whit-JavaScript",
    demo: "https://dleteo.github.io/-To-Do-App-whit-JavaScript/",
    evidence: "DOM events, local persistence and task state.",
  },
  {
    id: "hangman",
    title: "Hangman Game",
    subtitle: "JavaScript / Game logic",
    kind: "practice",
    summary: "A word guessing game with interactive letter selection and win/loss states.",
    technologies: ["HTML", "CSS", "JavaScript"],
    source: "https://github.com/Dleteo/hangman-game",
    demo: "https://dleteo.github.io/hangman-game/",
    evidence: "Conditionals, DOM events and game flow.",
  },
  {
    id: "encriptor",
    title: "Text Encoder / Decoder",
    subtitle: "JavaScript / Text utility",
    kind: "practice",
    summary: "A reversible text substitution exercise, not cryptographically secure encryption.",
    technologies: ["HTML", "CSS", "JavaScript"],
    source: "https://github.com/Dleteo/Encriptor",
    demo: "https://dleteo.github.io/Encriptor/",
    evidence: "Input handling and string transformations.",
  },
  {
    id: "dice",
    title: "Crazy Dices",
    subtitle: "JavaScript / Interaction",
    kind: "practice",
    summary: "Two dice roll on interaction, with a result calculated in the browser.",
    technologies: ["HTML", "CSS", "JavaScript", "DOM"],
    source: "https://github.com/Dleteo/Crazy-Dices",
    evidence: "DOM manipulation and random number logic.",
  },
  {
    id: "calculator",
    title: "Responsive Calculator",
    subtitle: "Frontend / Interface practice",
    kind: "practice",
    summary: "A calculator interface built as a frontend learning exercise.",
    technologies: ["Frontend practice"],
    source: "https://github.com/Dleteo/Calculator-responsiv",
    evidence: "Public repository. Verify its behavior before claiming advanced calculator functionality.",
  },
  {
    id: "first-page",
    title: "First Responsive Page",
    subtitle: "Frontend / Layout practice",
    kind: "practice",
    summary: "An early responsive web layout exercise.",
    technologies: ["Responsive layout"],
    source: "https://github.com/Dleteo/First-page-responsiv",
    evidence: "Public source demonstrating an early learning milestone.",
  },
  {
    id: "portfolio-legacy",
    title: "Early Portfolio",
    subtitle: "HTML / CSS / JavaScript",
    kind: "practice",
    summary: "An earlier personal portfolio, preserved as part of the development journey.",
    technologies: ["HTML", "CSS", "JavaScript"],
    source: "https://github.com/Dleteo/portfolio-",
    demo: "https://dleteo.github.io/portfolio-/",
    evidence: "Public history of earlier portfolio work.",
  },
] as const;

export const nexusOnePaths = {
  projects: "/portfolio#work",
  certificates: "/portfolio#certifications",
  resume: "/resume",
  resumePdf: "/Joshua-Vallejo-Sanchez-Resume.pdf",
  assistant: "/assistant",
  signUp: "/register",
  dashboard: "/dashboard",
  projectSource: "https://github.com/Dleteo/Nexus-AI",
  preview: "https://nexus-preview.onrender.com/",
} as const;
