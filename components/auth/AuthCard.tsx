import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  label: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthCard({ label, title, description, children, footer }: AuthCardProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24 text-[#302923] sm:px-6">
      <div aria-hidden="true" className="nexus-grid pointer-events-none absolute inset-0 opacity-45" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-24 size-80 rounded-full bg-[#FBE0D0] blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 size-96 rounded-full bg-[#FBE4D5] blur-[130px]" />
      <div className="nexus-panel relative grid w-full max-w-5xl overflow-hidden rounded-[1.7rem] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[#E9D9CC] bg-gradient-to-br from-[#FBE1D1] via-[#FFF6EE] to-[#FFFCF8] p-10 lg:flex">
          <div aria-hidden="true" className="nexus-grid absolute inset-0 opacity-60" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl border border-[#E9C5B0] bg-gradient-to-br from-[#F9D8C5] to-[#FFF2E9] text-xl text-[#AD5637]">✦</span>
              <span className="text-lg font-bold">Nexus<span className="text-[#AD5637]">AI</span></span>
            </Link>
            <p className="nexus-kicker mt-16">A calmer way to build</p>
            <h2 className="mt-5 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.04em]">Your next good idea deserves a <span className="nexus-gradient-text">workspace.</span></h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#756155]">Plan the work, understand the code, and keep your projects and AI conversations together.</p>
          </div>
          <div className="relative rounded-2xl border border-[#E9D9CC] bg-[#FFF2E8] p-5">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl border border-[#E9C5B0] bg-[#FBE7D9] text-[#AD5637]">✦</span><div><p className="text-sm font-semibold">Nexus AI Copilot</p><p className="mt-1 text-xs text-[#756155]">Five focused ways to make progress</p></div></div>
            <div className="mt-4 flex flex-wrap gap-2">{["Copilot", "Plan", "Debug", "Learn", "Interview"].map((mode) => <span key={mode} className="rounded-lg border border-[#E9D9CC] bg-[#FFF2E8] px-2.5 py-1.5 text-[10px] text-[#756155]">{mode}</span>)}</div>
          </div>
        </aside>
        <div className="p-6 sm:p-10 lg:p-12">
          <Link href="/" className="mb-9 inline-flex items-center gap-2 text-xs text-[#756155] transition hover:text-[#AD5637] lg:hidden"><span>←</span> Back to Nexus AI</Link>
          <p className="nexus-kicker mb-4">{label}</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#756155]">{description}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-7 border-t border-[#E9D9CC] pt-5 text-center text-xs text-[#756155]">{footer}</div>
          <p className="mt-6 text-center text-[10px] tracking-wide text-[#756155]">NEXUS AI · YOUR WORKSPACE, YOUR PACE</p>
        </div>
      </div>
    </main>
  );
}
