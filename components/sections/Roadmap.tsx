import { roadmap } from "../../data/roadmap";

export default function Roadmap() {
  const completedMilestones = roadmap.filter((item) => /complete/i.test(item.phase)).length;
  const progress = Math.round((completedMilestones / roadmap.length) * 100);

  return (
    <section className="nexus-section scroll-mt-20 px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="nexus-kicker mb-4">Product evolution</p><h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">A roadmap with visible progress.</h2></div>
          <p className="max-w-md text-sm leading-7 text-slate-400">The foundation is in place. The remaining milestones focus on refining the product, testing edge cases, and preparing for a release.</p>
        </div>
        <div className="nexus-panel mt-10 flex flex-col gap-6 overflow-hidden p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="nexus-kicker mb-3">Build path</p>
            <p className="text-xl font-semibold tracking-tight text-white">From prototype to production.</p>
            <p className="mt-2 text-sm text-slate-400">{completedMilestones} of {roadmap.length} documented milestones complete. This reflects development phases, not personal skill ratings.</p>
          </div>
          <div className="flex min-w-0 items-center gap-5 sm:w-56">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Progress</span><span className="font-semibold tabular-nums text-cyan-200">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-label="Completed product milestones" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-violet-400" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
        <ol className="nexus-flow-rail mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {roadmap.map((item, index) => {
            const complete = /complete/i.test(item.phase);
            return (
              <li key={item.phase} className="relative flex min-w-0 flex-col gap-3">
                <div className={`relative z-10 grid size-11 place-items-center rounded-2xl border text-sm font-semibold shadow-[0_0_25px_-12px_rgba(103,232,249,0.45)] sm:size-[52px] ${complete ? "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-200" : "border-cyan-200/20 bg-cyan-200/[0.05] text-cyan-100"}`}>{complete ? "✓" : String(index + 1).padStart(2, "0")}</div>
                <article className="nexus-panel flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3"><p className={`text-[10px] font-bold tracking-[0.17em] ${complete ? "text-emerald-200" : "text-cyan-200"}`}>{item.phase}</p><span className={`rounded-full border px-2.5 py-1 text-[10px] ${complete ? "border-emerald-200/15 bg-emerald-200/[0.04] text-emerald-200" : "border-cyan-200/15 bg-cyan-200/[0.04] text-cyan-100"}`}>{complete ? "Delivered" : "Next milestone"}</span></div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug sm:text-xl">{item.title}</h3><p className="mt-2 mb-6 max-w-3xl text-sm leading-7 text-slate-400">{item.description}</p>
                  <div className="mt-auto h-1 overflow-hidden rounded-full bg-white/[0.05]"><div className={`h-full rounded-full ${complete ? "w-full bg-gradient-to-r from-emerald-400/80 to-cyan-300/80" : "w-1/4 bg-gradient-to-r from-blue-400 to-violet-400"}`} /></div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
