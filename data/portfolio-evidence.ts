export type EvidenceGroup = {
  title: string;
  status: "Practiced in personal projects" | "AI-assisted project implementation";
  description: string;
  items: string[];
};

export const evidenceGroups: EvidenceGroup[] = [
  {
    title: "Frontend foundations",
    status: "Practiced in personal projects",
    description: "Browser projects in my GitHub demonstrate JavaScript interactions, state, layout and DOM work.",
    items: ["HTML5", "CSS3", "Flexbox", "CSS Grid", "Bootstrap 5", "JavaScript ES6", "DOM", "localStorage"],
  },
  {
    title: "Nexus AI application stack",
    status: "AI-assisted project implementation",
    description: "Technologies implemented in Nexus AI with AI-assisted development, followed by code review and functional checks.",
    items: ["React", "Next.js 16", "TypeScript", "Tailwind CSS", "Next.js API routes", "Supabase Auth", "PostgreSQL / RLS", "Gemini API"],
  },
  {
    title: "Quality & collaboration tooling",
    status: "AI-assisted project implementation",
    description: "Repository practices and automated checks; not a claim of professional team or open-source work.",
    items: ["Git & GitHub", "GitHub Actions", "ESLint", "TypeScript checks", "Production builds", "HTTP smoke tests", "Chromium browser tests"],
  },
  {
    title: "PC & operating system knowledge",
    status: "Practiced in personal projects",
    description: "Hands-on computer setup and troubleshooting outside formal software employment.",
    items: ["Windows installation", "PC setup", "Device drivers", "Basic hardware diagnosis"],
  },
];

export const professionalExperience = {
  title: "Hospitality and kitchen operations",
  type: "Non-developer employment",
  summary: "Hands-on night-shift kitchen and cleaning operations involving procedures, team coordination and reliable service under time constraints.",
  note: "Transferable workplace experience. I am seeking my first professional software development role.",
};

export const foundationResearch = {
  title: "Nexus Foundation",
  status: "Experimental research — not a production AI assistant",
  summary: "An original causal language-model research project using PyTorch, a self-trained BPE tokenizer, GPU experiments, isolated checkpoints and objective evaluations.",
  limitation: "Early research: its neural model cannot yet reliably converse, program or diagnose cybersecurity problems. Local Qwen models generate candidate learning data, not the original model weights.",
};

export const nexusCaseStudy = {
  problem: "Bring personal project management and contextual development assistance into one workspace, while demonstrating end-to-end web application engineering.",
  choices: [
    "Next.js App Router, React and TypeScript for modular pages and typed components.",
    "Supabase authentication and PostgreSQL row-level security for user-owned project records.",
    "Server-side AI integration so provider keys are not exposed in the browser.",
    "CI, linting, type checks, builds and browser checks to reduce regressions.",
  ],
  scope: "Personal portfolio product under active development, not a client commission or a published commercial SaaS.",
};
