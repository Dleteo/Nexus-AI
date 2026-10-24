import Image from "next/image";
import { selectedGithubProjects } from "../../data/github-projects";

export default function GithubProjects() {
  return (
    <section id="other-projects" className="scroll-mt-24 border-b border-[#34322F] bg-[#111214] px-5 py-16 text-[#F4F1EB] sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="nexus-kicker mb-4">More work from GitHub</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Small projects. Real practice.</h2>
            <p className="mt-4 text-base leading-7 text-[#BDB6AB]">Before Nexus AI, I worked on smaller browser projects to practice JavaScript, logic and interface development. Each card links to its source code and published demo.</p>
          </div>
          <a href="https://github.com/Dleteo?tab=repositories" target="_blank" rel="noopener noreferrer" className="nexus-ghost-button w-fit">All GitHub repositories ↗</a>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {selectedGithubProjects.map((project, index) => (
            <article key={project.id} className="nexus-royal-card group flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-[#34322F] bg-[#1D1E20] shadow-[0_12px_36px_-28px_rgba(71,39,24,.24)] transition duration-200 hover:-translate-y-1 hover:border-[#D9B77B] hover:shadow-[0_20px_40px_-30px_rgba(94,49,29,.35)]">
              <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#34322F] via-[#222326] to-[#34322F] px-6 py-7">
                <span className="absolute left-5 top-4 rounded-full border border-[#4B463D] bg-[#222326]/90 px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#D9B77B]">0{index + 1} / PROJECT</span>
                <a href={project.previewImage} target="_blank" rel="noopener noreferrer" aria-label={`View original project image: ${project.title}`} className="relative mt-3 block h-40 w-full overflow-hidden rounded-xl border border-[#4B463D] bg-[#1D1E20] shadow-[0_12px_28px_-18px_rgba(67,36,22,.25)]">
                  <Image unoptimized src={project.previewImage} alt={project.previewDescription} fill sizes="(min-width: 768px) 33vw, 90vw" className="object-contain" />
                </a>
                <span className="absolute bottom-3 right-4 rounded-md border border-[#4B463D] bg-[#222326] px-2 py-1 text-[10px] font-semibold text-[#D9B77B]">{project.previewKind === "artwork" ? "Original project artwork" : "Original screenshot"}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold text-[#D9B77B]">{project.subtitle}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{project.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[#BDB6AB]">{project.description}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">{project.technologies.map(tech => <span key={tech} className="rounded-md border border-[#34322F] bg-[#34322F] px-2.5 py-1.5 text-[11px] font-medium text-[#D9B77B]">{tech}</span>)}</div>
                <p className="mt-4 border-t border-[#34322F] pt-4 text-xs leading-5 text-[#D9B77B]">{project.detail}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open live demo: ${project.title}`} className="nexus-primary-button flex-1 whitespace-nowrap text-xs">Live demo ↗</a>
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`View source code: ${project.title}`} className="nexus-ghost-button flex-1 whitespace-nowrap text-xs">GitHub code ↗</a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs leading-6 text-[#D9B77B]">Previews link to original image files in the public GitHub repositories. The Hangman Game preview shows project artwork rather than a gameplay screenshot. These are learning projects, not client commissions.</p>
      </div>
    </section>
  );
}
