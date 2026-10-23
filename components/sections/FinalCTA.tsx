import Button from "../ui/Button";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="nexus-panel relative mx-auto max-w-7xl overflow-hidden rounded-[1.7rem] px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
        <div aria-hidden="true" className="nexus-grid absolute inset-0 opacity-50" />
        <div aria-hidden="true" className="absolute -right-10 -top-32 size-96 rounded-full bg-blue-500/10 blur-[100px]" />
        <div aria-hidden="true" className="absolute -bottom-40 left-1/4 size-80 rounded-full bg-violet-500/[0.08] blur-[100px]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-3xl"><p className="nexus-kicker mb-5">Keep exploring</p><h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">A real project. <span className="nexus-gradient-text">Built one decision at a time.</span></h2><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">Explore the working app, review the code, and follow the progress. Nexus AI is a portfolio project designed to demonstrate real frontend, backend, authentication, and AI integration work.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Button href="/register">Explore the workspace ↗</Button><Button variant="secondary" href="https://github.com/Dleteo/Nexus-AI">View source on GitHub ↗</Button><Button variant="secondary" href="#certifications">View certificates ↓</Button></div>
        </div>
      </div>
    </section>
  );
}
