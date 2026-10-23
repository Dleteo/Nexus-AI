import { certifications, totalTrainingHours } from "../../data/certifications";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

function formatHours(hours: number) {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${hours === 1 ? "hour" : "hours"}`;
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="scroll-mt-20 bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeader
              label="Developer Portfolio"
              title="Built by Joshua Vallejo Sanchez."
              description="I am pursuing a Junior Web Developer role and building Nexus AI as a portfolio project. My focus is modern frontend development, reusable components, TypeScript, accessible interfaces, and connecting UI to APIs and persistent data."
            />

            <div className="mt-8 flex flex-wrap gap-3">
              {["HTML & CSS", "JavaScript & TypeScript", "React & Next.js", "Responsive UI", "API integration"].map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://github.com/Dleteo/Nexus-AI" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                View the Project <span aria-hidden="true">↗</span>
              </a>
              <a href="https://github.com/Dleteo" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                Contact the Developer <span aria-hidden="true">↗</span>
              </a>
              <a href="#certifications" className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                View Certificates ↓
              </a>
            </div>
          </div>

          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Project status</p>
            <h3 className="mt-3 text-2xl font-semibold">Built in public, verified in CI.</h3>
            <ul className="mt-6 space-y-4 text-gray-300">
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>Responsive landing page and reusable typed UI components</span></li>
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>Certificate previews, course durations, and credential links</span></li>
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>CI checks for ESLint, TypeScript, and production build</span></li>
              <li className="flex gap-3"><span className="text-cyan-300" aria-hidden="true">→</span><span>Authentication and user-owned projects, after local Supabase configuration</span></li>
              <li className="flex gap-3"><span className="text-gray-500" aria-hidden="true">○</span><span>Live deployment and production monitoring — future milestone</span></li>
            </ul>
          </Card>
        </div>

        <div className="mt-24 scroll-mt-24" id="portfolio-certificates">
          <SectionHeader
            centered
            label="Learning record"
            title="Certificates & training hours"
            description="Course durations are shown per certificate. Course completion and attendance certificates are distinguished, and training hours are not counted as professional work experience."
          />

          <div className="mx-auto mb-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center">
              <p className="text-3xl font-semibold text-white">{certifications.length}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-gray-400">Certificates / completions</p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] px-6 py-5 text-center">
              <p className="text-3xl font-semibold text-cyan-300">{formatHours(totalTrainingHours)}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-gray-400">Total recorded training time</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {certifications.map((certification) => (
              <article key={certification.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/30">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400">{certification.issuer}</p>
                  <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">{formatHours(certification.hours)}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug">{certification.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{certification.description}</p>
                <div className="mt-auto pt-5">
                  <p className="text-xs text-gray-500">{certification.date} · {certification.credentialType}</p>
                  <a href={certification.credentialUrl || certification.image} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                    {certification.credentialUrl ? "Verify credential" : "Open certificate"} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-gray-500">Hours are based on the current certificate records and should be checked against each original credential.</p>
        </div>
      </div>
    </section>
  );
}
