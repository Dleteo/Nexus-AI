import Link from "next/link";

const skills = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "AI integration"];
const work = [
  { number: "01", title: "Frontend & responsive UI", description: "Reusable React components, readable layouts and responsive design for mobile and desktop." },
  { number: "02", title: "Authentication & project data", description: "Account flows, user-owned projects, database access policies and session handling." },
  { number: "03", title: "AI-powered workflows", description: "A multi-mode assistant with conversation history and project-focused guidance." },
  { number: "04", title: "Engineering quality", description: "GitHub Actions checks for lint, TypeScript, production builds and browser interactions." },
];

export default function Portfolio() {
  return (
    <>
      <section id="about" className="scroll-mt-24 px-5 pb-14 pt-16 text-white sm:px-8 sm:pb-20 sm:pt-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div>
            <p className="nexus-kicker mb-5">Developer portfolio</p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] sm:text-5xl">Hello, I’m Joshua. <span className="nexus-gradient-text">I build for the web.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">I’m an aspiring Junior Web Developer building practical experience with modern web technologies. I enjoy turning ideas into working interfaces, understanding how applications fit together, and improving projects through testing.</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">Nexus AI is my main portfolio project. It brings together interface design, authenticated project management, database-backed features and AI-assisted workflows. I use AI as part of my development process while reviewing and verifying the result.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#work" className="nexus-primary-button">Explore my work ↗</Link>
              <Link href="#certifications" className="nexus-ghost-button">View certificates ↓</Link>
            </div>
          </div>
          <aside className="nexus-panel p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">My focus</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Junior Web Development</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Building useful applications with clean interfaces, real data and reliable user flows.</p>
            <div className="mt-7 border-t border-white/[0.08] pt-6">
              <p className="mb-4 text-xs font-medium text-slate-400">Technology I’m working with</p>
              <div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-lg border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300">{skill}</span>)}</div>
            </div>
            <Link href="https://github.com/Dleteo/Nexus-AI" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex text-sm font-medium text-cyan-200 hover:text-white">View source on GitHub ↗</Link>
          </aside>
        </div>
      </section>
      <section id="work" className="scroll-mt-24 border-t border-white/[0.07] bg-[#0b101b] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl"><p className="nexus-kicker mb-4">Featured project</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nexus AI — a real product case study.</h2><p className="mt-4 text-base leading-7 text-slate-400">A personal project workspace with account access, saved projects, and an AI copilot with focused modes. This portfolio shows the implementation work rather than fabricated achievements or client results.</p></div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">{work.map((item) => <article key={item.number} className="nexus-panel p-6"><span className="text-xs font-semibold text-cyan-200">PROJECT / {item.number}</span><h3 className="mt-4 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p></article>)}</div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="nexus-ghost-button">Explore Nexus AI ↗</Link><Link href="https://github.com/Dleteo/Nexus-AI/actions" target="_blank" rel="noopener noreferrer" className="nexus-ghost-button">View automated checks ↗</Link></div>
        </div>
      </section>
    </>
  );
}
