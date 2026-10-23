import Link from "next/link";

const items = [
  { number: "01", icon: "▦", title: "Projects that stay organized", description: "Create, update, archive and manage project ideas in your private workspace.", href: "/dashboard", action: "Open workspace" },
  { number: "02", icon: "✦", title: "An AI copilot for real tasks", description: "Plan work, debug problems, learn concepts and practice interviews, with saved conversations.", href: "/assistant", action: "Meet the assistant" },
  { number: "03", icon: "◇", title: "Your account, your progress", description: "Sign in to keep your own projects and conversation history together in one place.", href: "/register", action: "Create an account" },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-y border-[#E9D9CC] bg-[#FFF8F2] px-5 py-20 text-[#302923] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="nexus-kicker mb-4">What you can do</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything in its place.</h2>
          <p className="mt-4 text-base leading-7 text-[#756155]">Three connected parts, designed to help you make progress without a crowded interface.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item) => <article key={item.number} className="nexus-panel flex h-full flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl border border-[#E6BDA7] bg-[#FBE3D3] text-xl text-[#AD5637]">{item.icon}</span><span className="text-xs tabular-nums text-[#816B5E]">{item.number}</span></div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#40342E]">{item.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-7 text-[#756155]">{item.description}</p>
            <Link href={item.href} className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#AD5637] transition hover:text-[#302923]">{item.action} <span aria-hidden="true">↗</span></Link>
          </article>)}
        </div>
      </div>
    </section>
  );
}
