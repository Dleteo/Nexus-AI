import { roadmap } from "../../data/roadmap";

export default function Roadmap() {
  return (
    <section className="nexus-section scroll-mt-20 px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="nexus-kicker mb-4">Product evolution</p><h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">A roadmap with visible progress.</h2></div>
          <p className="max-w-md text-sm leading-7 text-slate-400">The foundation is in place. The remaining milestones focus on refining the product, testing edge cases, and preparing for a release.</p>
        </div>
        <ol className="relative mt-12 space-y-4 before:absolute before:bottom-8 before:left-[21px] before:top-8 before:w-px before:bg-gradient-to-b before:from-cyan-200/40 before:via-blue-300/15 before:to-transparent sm:before:left-[25px]">
          {roadmap.map((item, index) => {
            const complete = /complete/i.test(item.phase);
            return (
              <li key={item.phase} className="relative grid gap-4 sm:grid-cols-[52px_minmax(0,1fr)] sm:gap-5">
                <div className={`relative z-10 grid size-11 place-items-center rounded-xl border text-sm font-semibold sm:size-[52px] ${complete ? "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-200" : "border-cyan-200/20 bg-cyan-200/[0.05] text-cyan-100"}`}>{complete ? "✓" : String(index + 1).padStart(2, "0")}</div>
                <article className="nexus-panel p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3"><p className={`text-[10px] font-bold tracking-[0.17em] ${complete ? "text-emerald-200" : "text-cyan-200"}`}>{item.phase}</p><span className={`rounded-full border px-2.5 py-1 text-[10px] ${complete ? "border-emerald-200/15 bg-emerald-200/[0.04] text-emerald-200" : "border-cyan-200/15 bg-cyan-200/[0.04] text-cyan-100"}`}>{complete ? "Delivered" : "Next milestone"}</span></div>
                  <h3 className="mt-3 text-lg font-semibold sm:text-xl">{item.title}</h3><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">{item.description}</p>
                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.05]"><div className={`h-full rounded-full ${complete ? "w-full bg-gradient-to-r from-emerald-400/80 to-cyan-300/80" : "w-1/4 bg-gradient-to-r from-blue-400 to-violet-400"}`} /></div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
