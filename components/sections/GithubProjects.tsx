import { selectedGithubProjects } from "../../data/github-projects";

function ProjectPreview({ id }: { id: string }) {
  if (id === "todo") {
    return (
      <div className="mx-auto w-full max-w-[290px] rounded-xl border border-[#E7D4C6] bg-[#FFFCF9] p-4 shadow-[0_12px_24px_-20px_rgba(67,36,22,.35)]" aria-hidden="true">
        <div className="mb-4 flex items-center justify-between"><span className="text-sm font-bold text-[#38291F]">Today’s tasks</span><span className="rounded-full bg-[#FFE4D5] px-2 py-1 text-[10px] text-[#9D5137]">2 of 3</span></div>
        {["Plan the page layout", "Build a task list", "Review final details"].map((task, index) => (
          <div key={task} className="mb-2 flex items-center gap-3 rounded-lg bg-[#FFF5ED] px-3 py-2">
            <span className={index < 2 ? "grid size-4 shrink-0 place-items-center rounded border border-[#C78360] bg-[#E5AB89] text-[10px] text-white" : "size-4 shrink-0 rounded border border-[#DABBA6]"}>{index < 2 ? "✓" : ""}</span>
            <span className={index < 2 ? "truncate text-[11px] text-[#8D7A6D] line-through" : "truncate text-[11px] text-[#4A362B]"}>{task}</span>
          </div>
        ))}
      </div>
    );
  }
  if (id === "hangman") {
    return (
      <div className="flex flex-col items-center gap-4" aria-hidden="true">
        <div className="flex items-center justify-center gap-2">{["C", "O", "D", "E"].map((letter, index) => <span key={index} className="grid size-10 place-items-center rounded-lg border border-[#E7CBB8] bg-[#FFFCF8] text-lg font-bold text-[#8D5138]">{letter}</span>)}</div>
        <div className="flex flex-wrap justify-center gap-1.5">{["A", "B", "C", "D", "E", "F"].map(letter => <span key={letter} className="grid size-7 place-items-center rounded-md border border-[#E8D5C7] bg-[#FFF7F0] text-[11px] font-semibold text-[#6B5143]">{letter}</span>)}</div>
        <span className="text-[11px] font-medium text-[#9D6046]">Guess the word</span>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[290px] space-y-3" aria-hidden="true">
      <div className="rounded-xl border border-[#E5CDBD] bg-[#FFFCF9] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AD725A]">Input text</p>
        <p className="mt-2 text-sm font-semibold text-[#493025]">gato</p>
      </div>
      <div className="flex items-center justify-center text-lg text-[#AD674A]">↓</div>
      <div className="rounded-xl border border-[#E7C6B2] bg-[#FCE5D6] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AD725A]">Transformed text</p>
        <p className="mt-2 text-sm font-semibold text-[#7A402D]">gaitober</p>
      </div>
    </div>
  );
}

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
                <ProjectPreview id={project.id} />
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
        <p className="mt-6 text-xs leading-6 text-[#8D7466]">Visual previews are illustrative. Open the demos to interact with the original projects. These are learning projects, not client commissions.</p>
      </div>
    </section>
  );
}
