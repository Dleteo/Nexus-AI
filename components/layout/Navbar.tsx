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
      .then((data: { user: { email?: string } | null }) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-white" aria-label="Nexus AI home">
          Nexus<span className="text-cyan-400">AI</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-gray-400 lg:flex">
          <a className="transition hover:text-white" href="/#features">Features</a>
          <a className="transition hover:text-white" href="/#tech">Tech Stack</a>
          <a className="transition hover:text-white" href="/#portfolio">Portfolio</a>
          <a className="transition hover:text-white" href="/#certifications">Certifications</a>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!checking && user ? (
            <>
              <Link href="/dashboard" className="rounded-full px-3 py-2 text-sm font-medium text-gray-300 transition hover:text-white">Dashboard</Link>
              <Link href="/assistant" className="hidden rounded-full px-3 py-2 text-sm font-medium text-cyan-300 transition hover:text-white sm:inline-flex">AI Assistant</Link>
              <button type="button" onClick={() => void signOut()} className="rounded-full border border-white/15 px-3 py-2 text-sm text-gray-300 hover:bg-white/10">Sign out</button>
            </>
          ) : !checking ? (
            <>
              <Link href="/login" className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-300 transition hover:text-white sm:inline-flex">Sign in</Link>
              <Button className="px-4 py-2 text-sm font-medium sm:px-5" href="/register">Get started</Button>
            </>
          ) : (
            <span className="text-sm text-gray-500" aria-live="polite">Loading…</span>
          )}
        </div>
      </nav>
    </header>
  );
}
