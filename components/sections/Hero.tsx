import Link from "next/link";
import CrownMark from "../ui/CrownMark";

const modes = [
  { name: "Plan", detail: "Break down a project", mark: "01" },
  { name: "Debug", detail: "Investigate an issue", mark: "02" },
  { name: "Learn", detail: "Understand a concept", mark: "03" },
  { name: "Interview", detail: "Practice for a role", mark: "04" },
];

export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden px-5 pb-20 pt-20 text-[#F7F0E4] sm:px-8 sm:pb-24 sm:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[650px] bg-[radial-gradient(ellipse_at_76%_31%,rgba(195,133,45,.20),transparent_58%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <div className="min-w-0">
          <p className="mb-6 inline-flex rounded-full border border-[#4B463D] bg-[#34322F] px-3 py-1.5 text-xs font-medium text-[#D9B77B]">♛ Your AI workspace</p>
          <h1 className="nexus-royal-title max-w-2xl text-5xl sm:text-6xl lg:text-7xl">Build your next project with <span className="nexus-gradient-text nexus-royal-text-glow">more clarity.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#BDB6AB]">One organized place to manage projects, ask an AI copilot for help, understand code and prepare for developer interviews.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="nexus-primary-button">Get started <span aria-hidden="true">↗</span></Link>
            <Link href="/#features" className="nexus-ghost-button">Explore features <span aria-hidden="true">↓</span></Link>
          </div>
          <p className="mt-7 text-xs leading-6 text-[#BDB6AB]">Project workspace · Saved conversations · Five assistant modes</p>
        </div>
        <div className="nexus-royal-shell relative min-w-0 overflow-hidden rounded-[1.75rem] p-3 sm:p-4">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-32 flex justify-center opacity-40">
            <div className="nexus-royal-orbit relative" />
          </div>
          <div className="relative mx-auto mb-3 grid h-36 place-items-center sm:h-44">
            <div aria-hidden="true" className="absolute size-32 rounded-full bg-[#B7853C]/20 blur-3xl" />
            <CrownMark crownedLetter size={82} className="nexus-crown-float relative drop-shadow-[0_0_16px_rgba(230,178,89,.55)]" />
          </div>
          <div className="flex items-center justify-between border-b border-[#34322F] px-3 pb-4 pt-2">
            <div><p className="text-sm font-semibold text-[#E6E1D8]">Nexus AI Copilot</p><p className="mt-1 text-xs text-[#BDB6AB]">Interface preview · Illustrative content</p></div>
            <span className="rounded-lg border border-[#4B463D] bg-[#34322F] px-2.5 py-1.5 text-xs text-[#D9B77B]">✦</span>
          </div>
          <div className="space-y-4 px-2 py-6 sm:px-3">
            <div className="ml-auto max-w-[84%] rounded-2xl rounded-br-md border border-[#4B463D] bg-[#34322F] px-4 py-3 text-sm leading-6 text-[#E6E1D8]">Help me turn my app idea into a clear development plan.</div>
            <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[#34322F] bg-[#111214] px-4 py-4">
              <p className="mb-2 text-xs font-semibold text-[#D9B77B]">✦ Nexus AI</p>
              <p className="text-sm leading-7 text-[#E6E1D8]">Start with a goal, then divide the work into small milestones you can implement and verify.</p>
              <div className="mt-4 space-y-2 border-t border-[#34322F] pt-4">
                {["Define the project", "Build the first feature", "Test and improve"].map((step, index) => <div key={step} className="flex items-center gap-3 text-xs text-[#BDB6AB]"><span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#34322F] text-[#D9B77B]">{index+1}</span>{step}</div>)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-[#34322F] px-2 pb-2 pt-4 sm:px-3">
            {modes.map((item) => <div key={item.name} className="rounded-xl border border-[#34322F] bg-[#34322F] px-3 py-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#E6E1D8]">{item.name}</p><span className="text-[10px] text-[#AFA89E]">{item.mark}</span></div><p className="mt-1 text-xs text-[#BDB6AB]">{item.detail}</p></div>)}
          </div>
          <p className="px-3 pb-2 pt-2 text-center text-[11px] text-[#AFA89E]">Sample conversation · Not real user data</p>
        </div>
      </div>
    </section>
  );
}
