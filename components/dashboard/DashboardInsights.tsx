type ProjectSnapshot = {
  id: string;
  status: "active" | "archived";
  created_at: string;
};

type DashboardInsightsProps = {
  projects: ProjectSnapshot[];
};

export default function DashboardInsights({ projects }: DashboardInsightsProps) {
  const active = projects.filter((project) => project.status === "active").length;
  const archived = projects.length - active;
  const activePercent = projects.length === 0 ? 0 : Math.round((active / projects.length) * 100);

  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(midnight);
    start.setDate(start.getDate() + index - 6);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      label: start.toLocaleDateString(undefined, { weekday: "short" }),
      count: projects.filter((project) => {
        const date = new Date(project.created_at);
        return date >= start && date < end;
      }).length,
    };
  });

  const maxCount = Math.max(1, ...days.map((day) => day.count));
  const weeklyTotal = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <section id="insights" aria-labelledby="insights-title" className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(285px,0.85fr)]">
      <article className="nexus-panel relative min-w-0 overflow-hidden p-5 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 size-72 rounded-full bg-blue-500/[0.07] blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="nexus-kicker mb-2">Real workspace data</p>
            <h2 id="insights-title" className="text-lg font-semibold tracking-tight text-white sm:text-xl">Projects created this week</h2>
            <p className="mt-2 text-xs text-slate-400">Your last 7 days, based on saved project creation dates</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] px-4 py-3 text-right">
            <p className="text-2xl font-semibold tabular-nums text-cyan-200">{weeklyTotal}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">New projects</p>
          </div>
        </div>
        <div className="relative mt-8 grid h-44 grid-cols-7 items-end gap-2 border-b border-white/10 bg-[linear-gradient(to_top,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[length:100%_25%] px-1 pb-px sm:gap-4">
          {days.map((day, index) => (
            <div key={index} className="group flex h-full min-w-0 flex-col items-center justify-end gap-1">
              <span className="text-[11px] font-semibold tabular-nums text-slate-300">{day.count || ""}</span>
              <div
                role="img"
                aria-label={day.label + ": " + day.count + " new projects"}
                title={day.label + ": " + day.count + " new projects"}
                className="relative w-full max-w-12 rounded-t-lg border border-cyan-200/15 bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-300 shadow-[0_0_24px_-12px_rgba(56,189,248,0.9)] transition-all duration-300 group-hover:brightness-125"
                style={{ height: String(day.count === 0 ? 3 : Math.max(12, Math.round((day.count / maxCount) * 94))) + "%" }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2 px-1 text-center text-[10px] text-slate-500 sm:gap-4">
          {days.map((day, index) => <span key={index}>{day.label}</span>)}
        </div>
        <p className="mt-5 text-[11px] leading-5 text-slate-500">Chart values are calculated from your projects. Empty days are shown as a baseline, not as activity.</p>
      </article>

      <article className="nexus-panel relative flex min-w-0 flex-col overflow-hidden p-5 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 top-1/4 size-48 rounded-full bg-violet-500/[0.09] blur-3xl" />
        <div className="relative">
          <p className="nexus-kicker mb-2">Project distribution</p>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">Your workspace at a glance</h2>
          <p className="mt-2 text-xs text-slate-400">Active and archived projects</p>
        </div>
        <div className="relative mx-auto my-7 grid size-44 place-items-center rounded-full shadow-[0_0_45px_-18px_rgba(109,94,252,0.48)]"
          role="img"
          aria-label={active + " active projects and " + archived + " archived projects"}
          style={{ background: projects.length ? "conic-gradient(#2dd4bf 0% " + activePercent + "%, #8b5cf6 " + activePercent + "% 100%)" : "conic-gradient(#273248 0% 100%)" }}
        >
          <div className="grid size-[136px] place-content-center rounded-full bg-[#0a1020] text-center">
            <span className="text-4xl font-semibold tabular-nums text-white">{projects.length}</span>
            <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Total</span>
          </div>
        </div>
        <div className="relative mt-auto space-y-3 border-t border-white/[0.07] pt-5 text-xs">
          <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-slate-400"><span className="size-2 rounded-full bg-teal-400" />Active</span><span className="font-semibold tabular-nums text-slate-100">{active}</span></div>
          <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-slate-400"><span className="size-2 rounded-full bg-violet-500" />Archived</span><span className="font-semibold tabular-nums text-slate-100">{archived}</span></div>
        </div>
      </article>
    </section>
  );
}
