import { processSteps } from "../../data/process";

export default function Process() {
  return (
    <section className="nexus-section-alt px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl"><p className="nexus-kicker mb-4">How it comes together</p><h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Small steps. Reliable software.</h2><p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">A practical development loop: define the goal, shape the interface, implement behavior, verify the result, and release only when it is ready.</p></div>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((item, index) => <li key={item.step} className="nexus-panel relative p-5 sm:p-5">
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold tracking-[0.16em] text-cyan-200">STEP / {String(item.step).padStart(2, "0")}</span><span className="text-lg text-slate-600">{["⌘", "◇", "⌁", "✓", "↗"][index % 5]}</span></div>
            <h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{item.description}</p>
            <div className="mt-5 h-px bg-gradient-to-r from-cyan-200/25 via-blue-200/10 to-transparent" />
          </li>)}
        </ol>
      </div>
    </section>
  );
}
