import { technologies } from "../../data/technologies";

const groups = [
  { title: "Application", description: "The interface and app structure", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4"], mark: "01", tone: "text-cyan-200" },
  { title: "Data & identity", description: "Persistent data with user boundaries", items: ["Supabase Auth", "PostgreSQL + Row-Level Security", "Next.js Route Handlers", "HTTP-only Session Cookies"], mark: "02", tone: "text-blue-200" },
  { title: "AI & quality", description: "Assistant integration and validation", items: ["Gemini API", "GitHub Actions CI", "ESLint", "Production Build Validation"], mark: "03", tone: "text-violet-200" },
];

export default function TechStack() {
  return (
    <section id="tech" className="nexus-section-alt scroll-mt-20 px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="nexus-kicker mb-4">Under the surface</p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">A real stack, not a list of buzzwords.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-400">These are the technologies currently reflected in the repository—not tools reserved for a future version.</p>
        </div>

        <div className="mt-11 grid gap-4 lg:grid-cols-3">
          {groups.map((group) => (
            <article key={group.title} className="rounded-2xl border border-white/[0.09] bg-[#0b111d]/80 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div><p className={`text-xs font-bold tracking-[0.17em] ${group.tone}`}>STACK / {group.mark}</p><h3 className="mt-3 text-xl font-semibold text-slate-100">{group.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{group.description}</p></div>
                <span className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-lg text-slate-400">⌘</span>
              </div>
              <div className="mt-6 space-y-2">
                {group.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3">
                    <span className={`grid size-6 place-items-center rounded-md bg-white/[0.04] text-[10px] ${group.tone}`} aria-hidden="true">✓</span>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-600">{technologies.length} documented stack entries across application, data, and quality workflows.</p>
      </div>
    </section>
  );
}
