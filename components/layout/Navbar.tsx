"use client";

import Link from "next/link";
import CrownMark from "../ui/CrownMark";
import { useEffect, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/command-center", label: "Command Center" },
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/portfolio", label: "My portfolio" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setMobileMenuOpen(false);
    // Next's same-route <Link> navigation can preserve scroll position.
    // Explicitly handle Home and the logo so they always return to the top.
    if (href === "/" && pathname === "/" && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      window.history.replaceState(null, "", "/");
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }

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
    <header className="sticky top-0 z-50 w-full border-b border-[#6B4B22]/50 bg-[#090909]/95 shadow-[0_8px_36px_-25px_rgba(215,151,53,.24)] backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" onClick={(event) => handleNavigation(event, "/")} className="flex shrink-0 items-center gap-2.5" aria-label="Nexus AI home">
          <span className="grid size-10 place-items-center rounded-xl border border-[#73552B] bg-[#211B13] shadow-[0_0_22px_-12px_rgba(227,174,75,.75)]"><CrownMark size={28}/></span>
          <span className="text-base font-semibold tracking-tight text-[#F4F1EB]">Nexus<span className="text-[#D9B77B]">AI</span></span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((item) => <Link key={item.href} href={item.href} onClick={(event) => handleNavigation(event, item.href)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#BDB6AB] transition hover:bg-[#34322F] hover:text-[#F4F1EB]">{item.label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          {!checking && user ? (
            <>
              <Link href="/dashboard" className="hidden rounded-lg px-3 py-2 text-sm text-[#E6E1D8] hover:text-[#F4F1EB] sm:inline-flex">Workspace</Link>
              <button type="button" onClick={() => void signOut()} className="hidden rounded-lg px-3 py-2 text-sm text-[#BDB6AB] hover:text-[#F4F1EB] sm:inline-flex">Sign out</button>
            </>
          ) : !checking ? (
            <>
              <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm text-[#E6E1D8] hover:text-[#F4F1EB] sm:inline-flex">Sign in</Link>
              <Link href="/register" className="nexus-primary-button min-h-9 px-3 py-2 text-xs sm:px-4">Get started ↗</Link>
            </>
          ) : <span className="text-xs text-[#BDB6AB]" aria-live="polite">Checking session…</span>}
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-lg border border-[#34322F] text-[#E6E1D8] md:hidden" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-controls="mobile-navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((value) => !value)}>
            <span aria-hidden="true" className="text-xl">{mobileMenuOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </nav>
      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-[#34322F] bg-[#171819] px-5 py-3 md:hidden">
          <div className="mx-auto grid max-w-6xl gap-1">
            {links.map((item) => <Link key={item.href} href={item.href} onClick={(event) => handleNavigation(event, item.href)} className="rounded-lg px-4 py-3 text-sm text-[#E6E1D8] hover:bg-[#34322F]">{item.label}</Link>)}
            {!checking && user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm text-[#D9B77B]">Workspace</Link>
                <button type="button" onClick={() => void signOut()} className="rounded-lg px-4 py-3 text-left text-sm text-[#E6E1D8]">Sign out</button>
              </>
            ) : !checking ? <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm text-[#D9B77B]">Sign in</Link> : null}
          </div>
        </nav>
      )}
    </header>
  );
}
