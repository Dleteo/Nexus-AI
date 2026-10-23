"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/portfolio", label: "My portfolio" },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign-out failed");
      router.push("/");
      router.refresh();
    } catch {
      window.alert("Could not sign out. Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#090d16]/95 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Nexus AI home">
          <span className="grid size-9 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-lg text-cyan-200">✦</span>
          <span className="text-base font-semibold tracking-tight text-white">Nexus<span className="text-cyan-300">AI</span></span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((item) => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white">{item.label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          {!checking && user ? (
            <>
              <Link href="/dashboard" className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white sm:inline-flex">Workspace</Link>
              <button type="button" onClick={() => void signOut()} className="hidden rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white sm:inline-flex">Sign out</button>
            </>
          ) : !checking ? (
            <>
              <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white sm:inline-flex">Sign in</Link>
              <Link href="/register" className="nexus-primary-button min-h-9 px-3 py-2 text-xs sm:px-4">Get started ↗</Link>
            </>
          ) : <span className="text-xs text-slate-500" aria-live="polite">Checking session…</span>}
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-lg border border-white/15 text-slate-200 md:hidden" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-controls="mobile-navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((value) => !value)}>
            <span aria-hidden="true" className="text-xl">{mobileMenuOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </nav>
      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-white/10 bg-[#090d16] px-5 py-3 md:hidden">
          <div className="mx-auto grid max-w-6xl gap-1">
            {links.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.05]">{item.label}</Link>)}
            {!checking && user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm text-cyan-200">Workspace</Link>
                <button type="button" onClick={() => void signOut()} className="rounded-lg px-4 py-3 text-left text-sm text-slate-300">Sign out</button>
              </>
            ) : !checking ? <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm text-cyan-200">Sign in</Link> : null}
          </div>
        </nav>
      )}
    </header>
  );
}
