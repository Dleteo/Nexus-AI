import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#E9D9CC] bg-[#FFF9F3] px-5 py-9 text-[#756155] sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-base font-semibold text-[#302923]">Nexus<span className="text-[#AD5637]">AI</span></Link>
          <p className="mt-1 text-xs text-[#756155]">AI-powered project workspace · Built by Joshua Vallejo Sanchez</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link href="/" className="hover:text-[#302923]">Home</Link>
          <Link href="/#features" className="hover:text-[#302923]">Features</Link>
          <Link href="/portfolio" className="hover:text-[#302923]">Portfolio</Link>
          <Link href="/portfolio#certifications" className="hover:text-[#302923]">Certificates</Link>
          <Link href="/login" className="hover:text-[#302923]">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
