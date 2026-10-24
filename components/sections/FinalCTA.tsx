import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="px-5 pb-20 pt-4 text-[#F4F1EB] sm:px-8 sm:pb-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 rounded-[1.5rem] border border-[#4B463D] bg-gradient-to-br from-[#34322F] to-[#171819] p-7 sm:p-10 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to make something?</h2>
          <p className="mt-3 text-sm leading-7 text-[#BDB6AB]">Try the workspace, or explore the developer portfolio behind Nexus AI.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="nexus-primary-button">Get started ↗</Link>
          <Link href="/portfolio" className="nexus-ghost-button">View my portfolio ↗</Link>
        </div>
      </div>
    </section>
  );
}
