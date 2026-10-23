import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function Portfolio() {
  return (
    <section id="portfolio" className="scroll-mt-20 bg-black px-6 py-24 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <SectionHeader
            label="Developer Portfolio"
            title="Built by Joshua Vallejo Sanchez."
            description="I am pursuing a Junior Web Developer role and building Nexus AI as a portfolio project. My focus is modern frontend development, reusable components, TypeScript, accessible interfaces, and learning to connect UI to secure APIs and persistent data."
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {["HTML & CSS", "JavaScript & TypeScript", "React & Next.js", "Responsive UI", "API integration"].map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://github.com/Dleteo/Nexus-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              Explore the repository <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://github.com/Dleteo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            >
              GitHub profile <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Project status
          </p>
          <h3 className="mt-3 text-2xl font-semibold">Built in public, verified in CI.</h3>

          <ul className="mt-6 space-y-4 text-gray-300">
            <li className="flex gap-3">
              <span className="text-emerald-400" aria-hidden="true">✓</span>
              <span>Responsive landing page and reusable typed UI components</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400" aria-hidden="true">✓</span>
              <span>Certificate previews and credential links</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400" aria-hidden="true">✓</span>
              <span>CI checks for ESLint, TypeScript, and production build</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-300" aria-hidden="true">→</span>
              <span>Authentication and user-owned projects, enabled after Supabase configuration</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-500" aria-hidden="true">○</span>
              <span>Live deployment and production monitoring — future milestone</span>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
