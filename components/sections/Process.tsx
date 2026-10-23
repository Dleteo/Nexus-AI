const steps = [
  { number: "01", title: "Create your workspace", description: "Sign up and keep your project ideas together." },
  { number: "02", title: "Choose how AI helps", description: "Pick a mode for planning, debugging, learning or interviews." },
  { number: "03", title: "Make steady progress", description: "Return to your saved projects and conversations." },
];

export default function Process() {
  return (
    <section id="how-it-works" className="scroll-mt-24 px-5 py-20 text-white sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl"><p className="nexus-kicker mb-4">Simple workflow</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A clear place to start.</h2><p className="mt-4 text-base leading-7 text-slate-400">No complicated setup on the screen. Just a straightforward path from idea to action.</p></div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">{steps.map((item) => <li key={item.number} className="rounded-2xl border border-white/[0.09] bg-[#0d1421] p-6"><span className="text-sm font-semibold text-cyan-200">{item.number}</span><h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p></li>)}</ol>
      </div>
    </section>
  );
}
