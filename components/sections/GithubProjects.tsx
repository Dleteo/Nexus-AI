import Image from "next/image";
import { selectedGithubProjects } from "../../data/github-projects";

export default function GithubProjects() {
  return (
    <section id="other-projects" className="scroll-mt-24 border-b border-[#E9D9CC] bg-[#FFF6EE] px-5 py-16 text-[#302923] sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="nexus-kicker mb-4">More work from GitHub</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Small projects. Real practice.</h2>
            <p className="mt-4 text-base leading-7 text-[#756155]">Before Nexus AI, I worked on smaller browser projects to practice JavaScript, logic and interface development. Each card links to its source code and published demo.</p>
          </div>
          <a href="https://github.com/Dleteo?tab=repositories" target="_blank" rel="noopener noreferrer" className="nexus-ghost-button w-fit">All GitHub repositories ↗</a>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {selectedGithubProjects.map((project, index) => (
            <article key={project.id} className="group flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-[#E5D1C2] bg-[#FFFCF8] shadow-[0_12px_36px_-28px_rgba(71,39,24,.24)] transition duration-200 hover:-translate-y-1 hover:border-[#DBA98D] hover:shadow-[0_20px_40px_-30px_rgba(94,49,29,.35)]">
              <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#FCE9DC] via-[#FFF5EC] to-[#F1D8C6] px-6 py-7">
                <span className="absolute left-5 top-4 rounded-full border border-[#E8C3AE] bg-[#FFFBF7]/90 px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#9E6044]">0{index + 1} / PROJECT</span>
                <a href={project.previewImage} target="_blank" rel="noopener noreferrer" aria-label={`View original project image: ${project.title}`} className="relative mt-3 block h-40 w-full overflow-hidden rounded-xl border border-[#E5CDBD] bg-[#FFFCF8] shadow-[0_12px_28px_-18px_rgba(67,36,22,.25)]">
                  <Image unoptimized src={project.previewImage} alt={project.previewDescription} fill sizes="(min-width: 768px) 33vw, 90vw" className="object-contain" />
                </a>
                <span className="absolute bottom-3 right-4 rounded-md border border-[#E6CBB9] bg-[#FFFBF7] px-2 py-1 text-[10px] font-semibold text-[#8D6048]">{project.previewKind === "artwork" ? "Original project artwork" : "Original screenshot"}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold text-[#A35B3D]">{project.subtitle}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{project.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[#756155]">{project.description}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">{project.technologies.map(tech => <span key={tech} className="rounded-md border border-[#EDDBCE] bg-[#FFF3E9] px-2.5 py-1.5 text-[11px] font-medium text-[#6B4F40]">{tech}</span>)}</div>
                <p className="mt-4 border-t border-[#EBDCD0] pt-4 text-xs leading-5 text-[#887266]">{project.detail}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open live demo: ${project.title}`} className="nexus-primary-button flex-1 whitespace-nowrap text-xs">Live demo ↗</a>
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`View source code: ${project.title}`} className="nexus-ghost-button flex-1 whitespace-nowrap text-xs">GitHub code ↗</a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs leading-6 text-[#8D7466]">Previews link to original image files in the public GitHub repositories. The Hangman Game preview shows project artwork rather than a gameplay screenshot. These are learning projects, not client commissions.</p>
      </div>
    </section>
  );
}
