import { technologies } from "../../data/technologies";
import SectionHeader from "../ui/SectionHeader";

export default function TechStack() {
  return (
    <section id="tech" className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          centered
          label="Tech Stack"
          title="Built with modern technologies."
          description="Nexus AI is designed to show real full stack skills: frontend, backend, database, AI integration, security and deployment."
        />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {technologies.map((tech) => (
            <div
              key={tech}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center text-sm font-medium text-gray-300 transition hover:border-purple-400/50 hover:text-white"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}