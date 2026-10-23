import Link from "next/link";

const milestones = [
  { number: "01", title: "Product interface", detail: "Reusable React components and responsive layouts" },
  { number: "02", title: "Identity & data", detail: "Supabase Auth, server sessions, and user-owned projects" },
  { number: "03", title: "AI integration", detail: "Gemini assistant with five modes and saved history" },
  { number: "04", title: "Quality checks", detail: "Automated dependency audit, lint, types, and build" },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="nexus-section-alt scroll-mt-20 px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="self-start lg:sticky lg:top-32">
          <p className="nexus-kicker mb-4">Developer case study</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Built to learn. <span className="nexus-gradient-text">Engineered to work.</span></h2>
          <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">I’m pursuing a Junior Web Developer role and building Nexus AI as a hands-on portfolio. The goal is to connect interface design with real data, account security, and useful AI workflows—not just produce a static mockup.</p>
          <div className="mt-7 flex flex-wrap gap-2">{["React", "Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Gemini"].map((skill) => <span key={skill} className="rounded-lg border border-white/[0.09] bg-white/[0.025] px-3 py-2 text-xs text-slate-300">{skill}</span>)}</div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="https://github.com/Dleteo/Nexus-AI" target="_blank" rel="noopener noreferrer" className="nexus-primary-button">Explore source ↗</Link><Link href="#certifications" className="nexus-ghost-button">Certificates ↓</Link></div>
        </div>
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[0.17em] text-slate-500">ENGINEERING LOG</p><h3 className="mt-2 text-xl font-semibold">What’s actually implemented</h3></div><span className="rounded-full border border-emerald-200/15 bg-emerald-200/[0.04] px-3 py-1.5 text-[10px] text-emerald-200">● Core flows verified</span></div>
          <div className="nexus-panel overflow-hidden">
            {milestones.map((item, index) => <article key={item.number} className={`flex gap-4 p-5 sm:p-6 ${index < milestones.length - 1 ? "border-b border-white/[0.07]" : ""}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-100/10 bg-cyan-100/[0.035] text-xs font-semibold text-cyan-200">{item.number}</span>
              <div className="min-w-0 flex-1"><h4 className="font-semibold text-slate-100">{item.title}</h4><p className="mt-1.5 text-sm leading-6 text-slate-400">{item.detail}</p></div>
              <span className="mt-1 text-sm text-emerald-200" aria-label="Implemented">✓</span>
            </article>)}
            <div className="flex flex-col gap-2 bg-black/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-slate-500">Next milestone: refine visual design and finish pre-release testing.</p><Link href="https://github.com/Dleteo/Nexus-AI/actions" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-cyan-200 hover:text-white">View CI checks ↗</Link></div>
          </div>
        </div>
      </div>
    </section>
  );
}
