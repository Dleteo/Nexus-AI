import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="px-5 pb-20 pt-4 text-white sm:px-8 sm:pb-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 rounded-[1.5rem] border border-blue-300/15 bg-gradient-to-br from-[#13243d] to-[#0d1423] p-7 sm:p-10 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to make something?</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">Try the workspace, or explore the developer portfolio behind Nexus AI.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="nexus-primary-button">Get started ↗</Link>
          <Link href="/portfolio" className="nexus-ghost-button">View my portfolio ↗</Link>
        </div>
      </div>
    </section>
  );
}
