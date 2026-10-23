import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#090d16] px-5 py-9 text-slate-400 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-base font-semibold text-white">Nexus<span className="text-cyan-300">AI</span></Link>
          <p className="mt-1 text-xs text-slate-500">AI-powered project workspace · Built by Joshua Vallejo Sanchez</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/#features" className="hover:text-white">Features</Link>
          <Link href="/portfolio" className="hover:text-white">Portfolio</Link>
          <Link href="/portfolio#certifications" className="hover:text-white">Certificates</Link>
          <Link href="/login" className="hover:text-white">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
