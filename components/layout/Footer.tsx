import Link from "next/link";
import CrownMark from "../ui/CrownMark";

export default function Footer() {
  return (
    <footer className="border-t border-[#34322F] bg-[#171819] px-5 py-9 text-[#BDB6AB] sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-base font-semibold text-[#F7F0E4]"><CrownMark size={27}/>Nexus<span className="text-[#D6AA62]">AI</span></Link>
          <p className="mt-1 text-xs text-[#BDB6AB]">AI-powered project workspace · Built by Joshua Vallejo Sanchez</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link href="/" className="hover:text-[#F4F1EB]">Home</Link>
          <Link href="/#proyectos" className="hover:text-[#F4F1EB]">Projects</Link>
          <Link href="/#habilidades" className="hover:text-[#F4F1EB]">Skills</Link>
          <Link href="/#certificados" className="hover:text-[#F4F1EB]">Certificates</Link>
          <Link href="/login" className="hover:text-[#F4F1EB]">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
