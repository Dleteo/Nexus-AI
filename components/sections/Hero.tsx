import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden px-5 pb-20 pt-32 text-white sm:px-8 sm:pb-28 sm:pt-36"
    >
      <div aria-hidden="true" className="nexus-grid pointer-events-none absolute inset-x-0 top-0 h-[760px] opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-28 size-80 rounded-full bg-blue-600/10 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-24 size-96 rounded-full bg-violet-600/10 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12">
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-100/[0.045] px-3.5 py-2 text-xs font-medium text-cyan-100/90 shadow-[0_0_30px_-15px_rgba(103,232,249,0.45)]">
            <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
            JUNIOR WEB DEVELOPER · BUILDING IN PUBLIC
          </div>

          <p className="nexus-kicker mb-5">Nexus AI workspace</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl xl:text-[4.65rem]">
            Turn a loose idea into a{" "}
            <span className="nexus-gradient-text">working system.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            A personal workspace for planning projects, understanding code, debugging problems, and preparing for technical interviews—with an AI copilot that keeps your conversations in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="nexus-primary-button">
              Explore the workspace <span aria-hidden="true">↗</span>
            </Link>
            <Link href="#features" className="nexus-ghost-button">
              Discover the features <span aria-hidden="true">↓</span>
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2"><span className="text-cyan-300">✦</span> 5 focused AI modes</span>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <span className="inline-flex items-center gap-2"><span className="text-blue-300">◇</span> Personal project workspace</span>
            <span className="hidden h-4 w-px bg-white/10 sm:block" />
            <span className="inline-flex items-center gap-2"><span className="text-violet-300">⌘</span> TypeScript + Supabase</span>
          </div>
        </div>

        <div className="relative min-w-0">
          <div aria-hidden="true" className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/15 via-cyan-400/5 to-violet-500/15 blur-2xl" />
          <div className="nexus-panel relative overflow-hidden rounded-[1.6rem] p-2 sm:p-3">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-3 py-3 sm:px-4">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl border border-cyan-200/20 bg-gradient-to-br from-blue-500/25 to-cyan-300/10 text-lg text-cyan-100">✦</div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Nexus Workspace</p>
                  <p className="mt-0.5 text-[10px] tracking-wide text-slate-500">PRODUCT PREVIEW</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-[11px] text-emerald-200 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-300" /> SYSTEM ONLINE
              </div>
              <div className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-xs text-slate-300">JS</div>
            </div>

            <div className="grid min-h-[400px] sm:grid-cols-[126px_minmax(0,1fr)]">
              <aside className="hidden border-r border-white/[0.07] p-3 sm:block">
                <p className="mb-3 px-2 text-[9px] font-bold tracking-[0.18em] text-slate-600">WORKSPACE</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 rounded-lg border border-blue-300/10 bg-blue-400/[0.08] px-2 py-2.5 text-[11px] text-cyan-100"><span>⌂</span> Overview</div>
                  <div className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-[11px] text-slate-500"><span>▦</span> Projects</div>
                  <div className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-[11px] text-slate-500"><span>✦</span> AI Assistant</div>
                  <div className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-[11px] text-slate-500"><span>◷</span> Activity</div>
                </div>
                <div className="mt-9 rounded-xl border border-white/[0.07] bg-black/20 p-3">
                  <p className="text-[10px] text-slate-500">Daily AI usage</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-[40%] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" /></div>
                  <p className="mt-2 text-[10px] text-slate-600">Illustrative preview</p>
                </div>
              </aside>

              <div className="min-w-0 p-3 sm:p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Monday · Workspace</p>
                    <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">Your next build starts here.</h2>
                  </div>
                  <span className="rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-[10px] text-slate-400">Preview data</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                    <p className="text-[10px] text-slate-500">AI modes</p><p className="mt-2 text-2xl font-semibold text-white">05</p><p className="mt-1 text-[9px] text-cyan-300">Copilot tools</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                    <p className="text-[10px] text-slate-500">Workspace</p><p className="mt-2 text-2xl font-semibold text-white">∞</p><p className="mt-1 text-[9px] text-blue-300">Personal ideas</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                    <p className="text-[10px] text-slate-500">History</p><p className="mt-2 text-2xl font-semibold text-white">↻</p><p className="mt-1 text-[9px] text-violet-300">Saved sessions</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-xl border border-white/[0.07] bg-[#080d18] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div><p className="text-xs font-semibold text-slate-200">Build activity</p><p className="mt-1 text-[10px] text-slate-500">A calm place to make progress</p></div>
                      <span className="text-[10px] text-cyan-300">WORKFLOW</span>
                    </div>
                    <div className="mt-5 flex h-24 items-end gap-2">
                      {[30, 44, 38, 64, 47, 77, 58, 91, 67, 78, 55, 86].map((height, index) => <div key={index} className="flex-1 rounded-t-sm" style={{ height: height + "%", background: index > 8 ? "linear-gradient(180deg,#9b8cff,#4f46e5)" : "linear-gradient(180deg,#62e5f5,#2676d9)", opacity: 0.55 + index * 0.035 }} />)}
                    </div>
                    <div className="mt-3 flex justify-between text-[9px] text-slate-600"><span>PLAN</span><span>BUILD</span><span>REVIEW</span><span>SHIP</span></div>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-[#080d18] p-3.5">
                    <p className="text-xs font-semibold text-slate-200">Copilot modes</p>
                    <p className="mt-1 text-[10px] text-slate-500">Choose the right kind of help</p>
                    <div className="mt-4 space-y-2.5">
                      {[
                        { label: "Copilot", detail: "Solve a problem", tone: "bg-cyan-300" },
                        { label: "Plan", detail: "Structure the work", tone: "bg-blue-400" },
                        { label: "Debug", detail: "Find the cause", tone: "bg-violet-400" },
                        { label: "Learn", detail: "Understand code", tone: "bg-fuchsia-400" },
                      ].map((item) => <div key={item.label} className="flex items-center gap-2.5"><span className={`size-2 rounded-sm ${item.tone}`} /><div className="min-w-0"><p className="text-[10px] font-medium text-slate-200">{item.label}</p><p className="text-[9px] text-slate-600">{item.detail}</p></div><span className="ml-auto text-[10px] text-slate-700">↗</span></div>)}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-[9px] text-slate-600">Concept preview · Sample data · Not a live analytics dashboard</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-cyan-100/10 bg-[#0a1220]/95 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block">
            <p className="text-[10px] text-slate-500">Engineering stack</p>
            <p className="mt-1 text-xs font-semibold text-slate-100">Next.js <span className="text-slate-600">·</span> TypeScript <span className="text-slate-600">·</span> Supabase</p>
          </div>
        </div>
      </div>
    </section>
  );
}
