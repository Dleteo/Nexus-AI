import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

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
            <h3 className="mt-3 text-2xl font-semibold">Working features, verified in CI.</h3>
            <ul className="mt-6 space-y-4 text-gray-300">
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>Responsive landing page and reusable, typed UI components</span></li>
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>Supabase sign-up, sign-in, sessions, and tested password recovery</span></li>
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>User-owned projects stored with database access controls</span></li>
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>Gemini-powered assistant with five modes and saved conversations</span></li>
              <li className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span><span>Automated dependency audit, ESLint, TypeScript, and production build checks</span></li>
              <li className="flex gap-3"><span className="text-cyan-300" aria-hidden="true">→</span><span>Public production deployment and release configuration remain future milestones</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
