// Usage is repository evidence, not a test of independent proficiency.
// Personal practice hours and self-assessment must be supplied by the owner.
export const personalPracticeHours: number | null = null;
export const portfolioDevelopment = { completedDays: 4, estimatedTotalDays: 6, basis: "owner-reported calendar days, not tracked working hours" };
// Provisional familiarity inferred from AI-assisted project evidence, not an independent skills test.
export const proficiency: Record<string, number | null> = { html:2, javascript:2, typescript:1, react:2, python:1, git:2, supabase:1, sql:1, tests:2, accessibility:1, storage:2, ai:2 };
export const skillEvidence = [
 {id:'html',name:'HTML / CSS',projects:5,evidence:'Responsive UI · design systems'},
 {id:'javascript',name:'JavaScript',projects:5,evidence:'Events · state · validation'},
 {id:'typescript',name:'TypeScript',projects:5,evidence:'Typed components · API contracts'},
 {id:'react',name:'React / Next.js',projects:5,evidence:'App Router · components · routes'},
 {id:'python',name:'Python',projects:4,evidence:'Local backends · SQLite · tests'},
 {id:'git',name:'Git / GitHub',projects:5,evidence:'Branches · pull requests · CI'},
 {id:'supabase',name:'Supabase',projects:1,evidence:'Workspace auth · PostgreSQL / RLS'},
 {id:'sql',name:'SQL / SQLite',projects:5,evidence:'Transactions · revisions · persistence'},
 {id:'tests',name:'Automated testing',projects:5,evidence:'Unit · HTTP · browser · CI'},
 {id:'accessibility',name:'Accessibility',projects:5,evidence:'Keyboard · focus · responsive checks'},
 {id:'storage',name:'Browser storage',projects:4,evidence:'Cart · editor · probes · work queue'},
 {id:'ai',name:'AI-assisted development',projects:5,evidence:'Planning · review · documented limits'},
] as const;

// Shared wording keeps the online CV and its downloadable PDFs consistent.
export const skillRatingCopy = {
 es:{usage:"Uso en proyectos",knowledge:"Conocimiento estimado",note:"Uso: presencia en 5 proyectos. Conocimiento provisional: 1/5 = familiarización; 2/5 = práctica guiada con IA. No es una evaluación independiente."},
 en:{usage:"Project usage",knowledge:"Estimated knowledge",note:"Usage: presence across 5 projects. Provisional knowledge: 1/5 = introductory exposure; 2/5 = AI-guided practice. Not an independent assessment."},
 de:{usage:"Projektnutzung",knowledge:"Geschätzte Kenntnisse",note:"Nutzung: Präsenz in 5 Projekten. Vorläufige Kenntnisse: 1/5 = Einstieg; 2/5 = KI-gestützte Praxis. Keine unabhängige Bewertung."},
 fr:{usage:"Usage en projets",knowledge:"Connaissances estimées",note:"Usage : présence dans 5 projets. Connaissances provisoires : 1/5 = découverte ; 2/5 = pratique guidée par IA. Pas une évaluation indépendante."},
 pt:{usage:"Uso em projetos",knowledge:"Conhecimento estimado",note:"Uso: presença em 5 projetos. Conhecimento provisório: 1/5 = familiarização; 2/5 = prática guiada por IA. Não é avaliação independente."},
} as const;
