import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { professionalProfile as profile } from "../../data/profile";
import { certifications } from "../../data/certifications";

export const metadata: Metadata = {
  title: "Joshua Vallejo Sanchez | CV",
  description: "Professional résumé for Joshua Vallejo Sanchez, aspiring Junior Web Developer and creator of Nexus AI.",
};

export default function ResumePage() {
  return (
    <>
      <div className="print:hidden"><Navbar /></div>
      <main className="flex-1 px-5 py-12 text-[#302923] sm:px-8 sm:py-16 print:p-0 print:text-black">
        <div className="mx-auto max-w-4xl">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Link href="/portfolio" className="text-sm font-semibold text-[#9F5237] hover:underline">← Back to portfolio</Link>
            <a href="/Joshua-Vallejo-Sanchez-Resume.pdf" download="Joshua-Vallejo-Sanchez-Resume.pdf" className="nexus-primary-button">Download CV (PDF) ↓</a>
          </div>
          <article className="rounded-2xl border border-[#E8D4C6] bg-[#FFFCF8] p-7 shadow-[0_15px_50px_-38px_rgba(95,52,31,.25)] sm:p-12 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
            <header className="border-b-2 border-[#DDA78B] pb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A4563C]">Developer résumé</p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{profile.name}</h1>
              <p className="mt-2 text-lg font-medium">{profile.role}</p>
              <p className="mt-3 text-sm text-[#69594E]">{profile.location} · <a className="underline" href={profile.github}>github.com/Dleteo</a></p>
            </header>
            <section className="mt-7"><h2 className="text-lg font-bold">Professional summary</h2>
              <p className="mt-2 text-sm leading-7 text-[#5F4E43]">Aspiring Junior Web Developer building practical experience with React, Next.js, TypeScript, responsive UI, authentication and database-backed features. Creator of Nexus AI, an evolving application that brings project management and an AI copilot together. Comfortable using AI-assisted development tools while reviewing code and verifying user flows.</p>
            </section>
            <section className="mt-7"><h2 className="text-lg font-bold">Featured project: Nexus AI</h2>
              <p className="mt-1 text-sm text-[#8B604A]"><a href={profile.repository} className="underline">github.com/Dleteo/Nexus-AI</a> · Portfolio project</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#5F4E43]">
                <li>Built a responsive Next.js and TypeScript interface with separate product, portfolio and account pages.</li>
                <li>Implemented account and project-management workflows backed by Supabase and Next.js API routes.</li>
                <li>Integrated a multi-mode AI assistant with saved conversations for planning, debugging, learning and interview preparation.</li>
                <li>Added automated ESLint, TypeScript, production-build, HTTP and browser tests through GitHub Actions.</li>
              </ul>
            </section>
            <section className="mt-7"><h2 className="text-lg font-bold">Technical toolkit</h2>
              <p className="mt-2 text-sm leading-7 text-[#5F4E43]"><strong>Frontend:</strong> HTML, CSS, JavaScript, React, Next.js, TypeScript, Tailwind CSS</p>
              <p className="text-sm leading-7 text-[#5F4E43]"><strong>App and tools:</strong> Supabase, Git, GitHub, GitHub Actions, Next.js API routes, browser testing, AI-assisted development</p>
            </section>
            <section className="mt-7"><h2 className="text-lg font-bold">Education and professional learning</h2>
              <p className="mt-2 text-sm text-[#69594E]">Selected certificates and training records, not professional employment experience:</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5F4E43]">
                {certifications.map((item) => <li key={item.id}><strong>{item.title}</strong> — {item.issuer}, {item.hours} training hours ({item.credentialType.toLowerCase()})</li>)}
              </ul>
            </section>
            <div className="mt-8 border-t border-[#EAD9CD] pt-5 text-xs text-[#8A7060]">
              Contact email and additional social profiles can be added once verified. No unverified employment or academic degree is listed.
            </div>
          </article>
        </div>
      </main>
      <div className="print:hidden"><Footer /></div>
    </>
  );
}
