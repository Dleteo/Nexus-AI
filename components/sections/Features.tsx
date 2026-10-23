import { features } from "../../data/features";
import SectionHeader from "../ui/SectionHeader";

const accents = [
  { icon: "▦", label: "WORKSPACE", tone: "from-blue-400/20 to-cyan-300/5 text-cyan-200" },
  { icon: "◈", label: "IDENTITY", tone: "from-violet-400/20 to-blue-300/5 text-violet-200" },
  { icon: "✦", label: "INTELLIGENCE", tone: "from-cyan-400/20 to-blue-300/5 text-cyan-100" },
  { icon: "⌘", label: "ENGINEERING", tone: "from-emerald-400/15 to-cyan-300/5 text-emerald-200" },
];

export default function Features() {
  return (
    <section id="features" className="nexus-section scroll-mt-20 px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="nexus-kicker mb-4">The workspace</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">One place for the work behind the work.</h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-slate-400 sm:text-base">From the first project note to a debugging session, Nexus brings the essential pieces into one focused interface.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {features.map((feature, index) => {
            const accent = accents[index % accents.length];
            return (
              <article key={feature.title} className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#101a2b]/95 via-[#0b1220]/95 to-[#090e18] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/20 hover:shadow-[0_24px_70px_-44px_rgba(75,173,255,.35)] sm:p-8">
                <div aria-hidden="true" className={`absolute -right-12 -top-14 size-48 rounded-full bg-gradient-to-br ${accent.tone.split(" ").slice(0,2).join(" ")} opacity-40 blur-3xl transition duration-500 group-hover:opacity-70`} />
                <div className="relative flex items-start gap-4">
                  <div className={`grid size-12 shrink-0 place-items-center rounded-2xl border border-white/[0.09] bg-gradient-to-br ${accent.tone} text-xl`}>{accent.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.19em] text-slate-500">{accent.label}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">{feature.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">{feature.description}</p>
                  </div>
                </div>
                <div className="relative mt-7 flex items-center justify-between border-t border-white/[0.07] pt-4">
                  <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-slate-600">NEXUS MODULE · {String(index + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true" className="text-sm text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200">↗</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
