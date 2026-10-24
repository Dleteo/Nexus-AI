import Link from "next/link";
import RoyalArtwork from "./RoyalArtwork";

const highlights = [
  { icon: "✦", title: "AI Copilot", detail: "Plan, debug and learn with your assistant.", href: "/assistant" },
  { icon: "▱", title: "Your Projects", detail: "Keep ideas and active work in one place.", href: "/dashboard" },
  { icon: "⌘", title: "Developer Portfolio", detail: "Explore the work and the code behind it.", href: "/portfolio" },
  { icon: "◇", title: "Built to learn", detail: "Build skills through real project work.", href: "/portfolio#certifications" },
];

export default function Hero() {
  return (
    <section id="top" className="royal-home-hero relative isolate overflow-hidden px-3 pb-4 pt-5 text-[#F7F0E4] sm:px-6 sm:pt-7 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_22%,rgba(190,120,40,.13),transparent_49%)]" />
      <div className="royal-stage-frame relative mx-auto max-w-[1520px] overflow-hidden rounded-[24px] border border-[#B18A50]/70 bg-[#060606]">
        <div className="royal-stage-rays pointer-events-none absolute -right-24 -top-56 h-[830px] w-[1000px] opacity-80" aria-hidden="true"/>
        <div className="relative grid min-h-[565px] items-center gap-0 px-5 pb-8 pt-10 sm:px-10 lg:min-h-[570px] lg:grid-cols-[.94fr_1.06fr] lg:px-14 lg:pb-7 lg:pt-9">
          <div className="relative z-10 max-w-[590px] pb-2 lg:pb-10">
            <p className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.28em] text-[#E7BF77] sm:text-xs"><span className="h-px w-7 bg-[#E7BF77]"/>The next era of intelligence<span className="h-px w-7 bg-[#E7BF77]"/></p>
            <h1 className="nexus-royal-title max-w-[650px] text-[clamp(3.5rem,5.2vw,6.2rem)] leading-[.98] text-[#F8F1E6]">
              Build with <span className="nexus-gradient-text nexus-royal-text-glow block pb-2">confidence.</span>
            </h1>
            <p className="mt-6 max-w-[460px] text-[15px] leading-7 text-[#D1C9BE] sm:text-base">
              Your space to organize ideas, build projects and grow as a developer—with an AI copilot by your side.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className="nexus-primary-button min-w-[155px] rounded-full px-7 py-3.5">Get started <span aria-hidden="true">↗</span></Link>
              <Link href="/#features" className="nexus-ghost-button rounded-full border-[#A78049]/60 bg-black/50 px-6 py-3.5">Explore the workspace <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#6C542F]/40 pt-6 text-xs text-[#D7CEBE]">
              <span className="flex items-center gap-2"><span className="text-[#E9C17C]">◈</span>Private projects</span>
              <span className="flex items-center gap-2"><span className="text-[#E9C17C]">✧</span>AI assistance</span>
              <span className="flex items-center gap-2"><span className="text-[#E9C17C]">▣</span>Saved conversations</span>
            </div>
          </div>
          <div className="relative z-0 -mx-4 flex min-w-0 items-center justify-center sm:mx-0 lg:-ml-10">
            <RoyalArtwork/>
            <span className="absolute right-[1%] top-[28%] hidden rotate-[-8deg] font-serif text-lg italic leading-6 text-[#F5D393]/90 xl:block">Ideas<br/>to impact</span>
          </div>
        </div>
        <div className="royal-showcase-landscape relative border-t border-[#72572E]/55 px-5 pb-9 pt-12 sm:px-10 lg:px-14">
          <div aria-hidden="true" className="royal-mountain-backdrop pointer-events-none absolute inset-0" />
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-[#E2B76C]">A workspace with purpose</p>
              <h2 className="nexus-royal-title max-w-md text-3xl sm:text-4xl">Your AI workspace for bigger possibilities.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#CFC5B5]">From quick questions to complete applications, turn ideas into meaningful progress.</p>
            </div>
            <Link href="/#features" className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-[.13em] text-[#F4CF8A] underline decoration-[#BB8D46] underline-offset-8 hover:text-white">Explore features <span className="transition-transform group-hover:translate-x-1">↗</span></Link>
          </div>
          <div className="relative z-10 mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <Link key={item.title} href={item.href} className="nexus-royal-card royal-feature-tile group flex min-h-44 flex-col rounded-2xl p-5 backdrop-blur-md">
                <span className="grid size-11 place-items-center rounded-xl border border-[#826036]/50 bg-[#382919]/80 text-2xl text-[#F4CB7A] shadow-[0_0_19px_-12px_rgba(224,168,73,.8)]">{item.icon}</span>
                <h3 className="mt-4 text-base font-semibold text-[#FAF4EA]">{item.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-[#CEC4B8]">{item.detail}</p>
                <span className="mt-3 text-xs font-semibold text-[#F2CC81] transition-transform group-hover:translate-x-1">Explore ↗</span>
              </Link>
            ))}
          </div>
          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#80603B]/25 bg-black/40 px-5 py-4 text-xs text-[#C9BDAB]">
            <p className="font-serif text-lg text-[#F2E6D1]">A more capable you starts here.</p>
            <div className="flex flex-wrap gap-5 sm:gap-9">
              <span><strong className="block text-base text-[#EBC47E]">5</strong>Copilot modes</span>
              <span><strong className="block text-base text-[#EBC47E]">6</strong>Training records</span>
              <span><strong className="block text-base text-[#EBC47E]">GitHub</strong>Real project code</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
