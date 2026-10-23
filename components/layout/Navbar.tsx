"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../ui/Button";

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user: { email?: string } | null }) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.07] bg-[#070b13]/85 backdrop-blur-2xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Nexus AI home">
          <span className="grid size-10 place-items-center rounded-xl border border-cyan-100/15 bg-gradient-to-br from-blue-500/25 to-violet-500/15 text-xl text-cyan-100 shadow-[0_0_25px_-14px_rgba(103,232,249,.65)]">✦</span>
          <span><span className="block text-base font-bold tracking-tight text-white">Nexus<span className="text-cyan-300">AI</span></span><span className="mt-0.5 hidden text-[9px] tracking-[0.17em] text-slate-600 sm:block">THINK · BUILD · GROW</span></span>
        </Link>
        <div className="hidden items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 text-xs text-slate-400 lg:flex">
          <Link className="rounded-lg px-3 py-2 transition hover:bg-white/[0.05] hover:text-white" href="/#features">Features</Link>
          <Link className="rounded-lg px-3 py-2 transition hover:bg-white/[0.05] hover:text-white" href="/#tech">Technology</Link>
          <Link className="rounded-lg px-3 py-2 transition hover:bg-white/[0.05] hover:text-white" href="/#portfolio">Portfolio</Link>
          <Link className="rounded-lg px-3 py-2 transition hover:bg-white/[0.05] hover:text-white" href="/#certifications">Certificates</Link>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!checking && user ? (
            <>
              <Link href="/dashboard" className="hidden rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white sm:inline-flex">Workspace</Link>
              <Link href="/assistant" className="hidden rounded-lg px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-200/[0.05] sm:inline-flex">✦ Copilot</Link>
              <button type="button" onClick={() => void signOut()} className="rounded-lg border border-white/[0.10] px-3 py-2 text-xs text-slate-400 transition hover:border-white/20 hover:text-white">Sign out</button>
            </>
          ) : !checking ? (
            <>
              <Link href="/login" className="hidden rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:text-white sm:inline-flex">Sign in</Link>
              <Button className="min-h-10 rounded-xl px-4 py-2 text-xs sm:px-5" href="/register">Get started <span aria-hidden="true">↗</span></Button>
            </>
          ) : <span className="text-xs text-slate-600" aria-live="polite">Checking session…</span>}
        </div>
      </nav>
    </header>
  );
}
