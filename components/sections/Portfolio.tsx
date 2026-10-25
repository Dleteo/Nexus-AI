import Link from "next/link";
import GithubProjects from "./GithubProjects";
import { professionalProfile as profile } from "../../data/profile";
import { evidenceGroups, foundationResearch, nexusCaseStudy, professionalExperience } from "../../data/portfolio-evidence";

const work = [
  { number: "01", title: "Responsive application", description: "A clean multi-page interface with mobile navigation, reusable components and a cohesive design system.", tag: "Frontend" },
  { number: "02", title: "Accounts and project management", description: "Authentication, user-owned projects, project search and create, update, archive, restore and delete flows.", tag: "Full-stack features" },
  { number: "03", title: "AI workspace", description: "An assistant with focused modes for planning, debugging, learning and interview preparation, including saved conversations.", tag: "AI integration" },
  { number: "04", title: "Verification and quality", description: "Automated lint, TypeScript checks, production builds, HTTP smoke tests and Chromium browser tests.", tag: "Quality" },
];
const socials = [
  { name: "GitHub", href: profile.github, icon: "⌘" },
  ...(profile.linkedin ? [{ name: "LinkedIn", href: profile.linkedin, icon: "in" }] : []),
  ...(profile.instagram ? [{ name: "Instagram", href: profile.instagram, icon: "◎" }] : []),
];

export default function Portfolio() {
  return (
    <>
      <section id="about" className="scroll-mt-24 relative overflow-hidden px-5 pb-16 pt-14 text-[#F4F1EB] sm:px-8 sm:pb-20 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-44 size-[35rem] rounded-full bg-[#4B463D]/30 blur-[95px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-3 border-b border-[#34322F] pb-5">
            <p className="nexus-kicker">Portfolio / About me</p>
            <nav aria-label="Portfolio sections" className="flex flex-wrap items-center gap-4 text-xs font-semibold sm:text-sm">
              <a href="#work" className="text-[#BDB6AB] hover:text-[#D9B77B]">Project</a>
              <a href="#other-projects" className="text-[#BDB6AB] hover:text-[#D9B77B]">More projects</a>
              <a href="#case-study" className="text-[#BDB6AB] hover:text-[#D9B77B]">Decisions</a>
              <a href="#skills" className="text-[#BDB6AB] hover:text-[#D9B77B]">Skills</a>
              <a href="#experience" className="text-[#BDB6AB] hover:text-[#D9B77B]">Experience</a>
              <a href="#certifications" className="text-[#BDB6AB] hover:text-[#D9B77B]">Certificates</a>
              <a href="#contact" className="text-[#BDB6AB] hover:text-[#D9B77B]">Contact</a>
            </nav>
          </div>
          <div className="grid gap-9 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-[#4B463D] bg-[#34322F] px-4 py-2 text-xs font-semibold text-[#D9B77B]">Junior Web Developer · Pennsylvania</p>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-[-0.05em] sm:text-5xl lg:text-[3.6rem]">Hi, I’m Joshua. <span className="nexus-gradient-text">I turn ideas into working web apps.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#D9B77B]">I’m building my career in web development through practical projects. I enjoy creating understandable interfaces, connecting real application features and learning how to make software more reliable.</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#BDB6AB]">My main project is Nexus AI: a full-stack learning and project workspace with account management, an AI copilot and automated tests. I use AI as a development tool, then review the implementation and test user flows.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/resume" className="nexus-primary-button">View / save my CV <span aria-hidden="true">↗</span></Link>
                <a href="#contact" className="nexus-ghost-button">Contact & socials <span aria-hidden="true">↓</span></a>
              </div>
              <div className="mt-7 flex items-center gap-3">
                {socials.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#34322F] bg-[#1D1E20] px-3 text-sm font-semibold text-[#D9B77B] transition hover:border-[#D9B77B] hover:bg-[#34322F]"><span aria-hidden="true" className="font-bold text-[#D9B77B]">{social.icon}</span>{social.name}</a>)}
              </div>
            </div>
            <aside className="relative overflow-hidden rounded-[1.75rem] border border-[#34322F] bg-[#1D1E20] p-6 shadow-[0_25px_60px_-40px_rgba(100,54,31,.28)] sm:p-8">
              <div aria-hidden="true" className="absolute -right-16 -top-14 size-52 rounded-full bg-[#4B463D]/50 blur-[50px]" />
              <div className="relative">
                <div className="flex items-center gap-4">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#34322F] to-[#D9B77B] text-2xl font-bold text-[#D9B77B]" aria-hidden="true">JV</span>
                  <div><p className="text-lg font-semibold">{profile.name}</p><p className="mt-1 text-xs text-[#D9B77B]">{profile.role}</p></div>
                </div>
                <div className="mt-7 border-t border-[#34322F] pt-6">
                  <p className="nexus-kicker">Current focus</p>
                  <h2 className="mt-3 text-xl font-semibold">One substantial project. Real engineering practice.</h2>
                  <p className="mt-3 text-sm leading-7 text-[#BDB6AB]">Nexus AI combines responsive design, authentication, private project data, AI-powered interactions and quality checks into a single evolving product.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["React", "Next.js", "TypeScript", "Supabase", "AI workflows"].map((item) => <span key={item} className="rounded-full border border-[#34322F] bg-[#222326] px-3 py-1.5 text-xs font-medium text-[#D9B77B]">{item}</span>)}
                </div>
                <Link href="#work" className="mt-7 inline-flex text-sm font-semibold text-[#D9B77B] hover:text-[#D9B77B]">See what I built →</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section id="work" className="scroll-mt-24 border-y border-[#34322F] bg-[#171819] px-5 py-16 text-[#F4F1EB] sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-2xl"><p className="nexus-kicker mb-4">Featured case study</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nexus AI, built from the ground up.</h2><p className="mt-4 text-base leading-7 text-[#BDB6AB]">My primary portfolio project, demonstrating product structure, design, full-stack features and a repeatable testing workflow—not invented client outcomes.</p></div>
            <a href={profile.repository} target="_blank" rel="noopener noreferrer" className="nexus-ghost-button w-fit">Explore the source on GitHub ↗</a>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {work.map((item) => <article key={item.number} className="nexus-royal-card nexus-panel group p-6 transition hover:-translate-y-1 hover:border-[#4B463D]">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#D9B77B]">NEXUS AI / {item.number}</span><span className="rounded-full bg-[#34322F] px-3 py-1 text-[11px] font-medium text-[#D9B77B]">{item.tag}</span></div>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#BDB6AB]">{item.description}</p>
            </article>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="nexus-ghost-button">Explore Nexus AI ↗</Link><a href="https://github.com/Dleteo/Nexus-AI/actions" target="_blank" rel="noopener noreferrer" className="nexus-ghost-button">See automated checks ↗</a></div>
        </div>
      </section>
      <GithubProjects />
      <section id="case-study" className="scroll-mt-24 border-b border-[#34322F] bg-[#171819] px-5 py-16 text-[#F4F1EB] sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="nexus-kicker mb-4">Nexus AI / Engineering decisions</p>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">The problem, the architecture, the tradeoffs.</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#BDB6AB]">{nexusCaseStudy.problem}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {nexusCaseStudy.choices.map((choice, index) => (
              <div key={choice} className="nexus-panel p-6">
                <p className="text-xs font-semibold tracking-widest text-[#D9B77B]">DECISION 0{index + 1}</p>
                <p className="mt-3 text-sm leading-7 text-[#F4F1EB]">{choice}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl border-l-2 border-[#D9B77B] pl-4 text-sm leading-7 text-[#BDB6AB]">{nexusCaseStudy.scope} I work with AI coding tools and verify the generated changes through code review and automated tests.</p>
        </div>
      </section>
      <section id="skills" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="nexus-kicker mb-4">Skills with evidence</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What I have practiced and implemented.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#BDB6AB]">I distinguish skills practiced in smaller projects from technologies integrated into Nexus AI with AI assistance. These are not claims of independent mastery or years of professional developer experience.</p>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {evidenceGroups.map((group) => (
              <article key={group.title} className="nexus-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D9B77B]">{group.status}</p>
                <h3 className="mt-3 text-lg font-semibold">{group.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#BDB6AB]">{group.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.items.map(item => <span key={item} className="rounded-lg border border-[#34322F] bg-[#34322F] px-3 py-2 text-xs font-medium text-[#D9B77B]">{item}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="experience" className="scroll-mt-24 border-t border-[#34322F] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <article className="nexus-panel p-7">
            <p className="nexus-kicker">Professional experience</p>
            <h2 className="mt-4 text-2xl font-semibold">{professionalExperience.title}</h2>
            <p className="mt-2 text-xs font-semibold text-[#D9B77B]">{professionalExperience.type}</p>
            <p className="mt-4 text-sm leading-7 text-[#BDB6AB]">{professionalExperience.summary}</p>
            <p className="mt-4 text-sm leading-7 text-[#D9B77B]">{professionalExperience.note}</p>
          </article>
          <article className="nexus-panel p-7">
            <p className="nexus-kicker">Independent technical research</p>
            <h2 className="mt-4 text-2xl font-semibold">{foundationResearch.title}</h2>
            <p className="mt-2 text-xs font-semibold text-[#D9B77B]">{foundationResearch.status}</p>
            <p className="mt-4 text-sm leading-7 text-[#BDB6AB]">{foundationResearch.summary}</p>
            <p className="mt-4 text-sm leading-7 text-[#D9B77B]">{foundationResearch.limitation}</p>
          </article>
        </div>
      </section>
      <section id="contact" className="scroll-mt-24 border-y border-[#34322F] bg-[#171819] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl rounded-[1.65rem] border border-[#4B463D] bg-gradient-to-br from-[#34322F] via-[#1D1E20] to-[#34322F] p-7 shadow-[0_20px_50px_-42px_rgba(93,50,31,.35)] sm:p-11">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><p className="nexus-kicker mb-4">Let’s connect</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Interested in my work?</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#D9B77B]">I’m interested in learning opportunities and Junior Web Developer roles. Browse my code, explore the project or open my CV. Direct email contact will be added once a professional address is confirmed.</p></div>
            <div className="flex flex-wrap gap-3">
              {profile.email ? <a className="nexus-primary-button" href={`mailto:${profile.email}?subject=Nexus%20AI%20portfolio%20inquiry`}>Send an email ↗</a> : <a href={profile.github} className="nexus-primary-button" target="_blank" rel="noopener noreferrer">Visit my GitHub ↗</a>}
              <Link href="/resume" className="nexus-ghost-button">My CV / résumé ↗</Link>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 border-t border-[#34322F] pt-6">
            {socials.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#4B463D] bg-[#1D1E20] px-4 py-2.5 text-sm font-semibold text-[#D9B77B] transition hover:bg-[#34322F]">{social.name} ↗</a>)}
            {!profile.linkedin && !profile.instagram && <p className="self-center text-xs text-[#D9B77B]">LinkedIn and Instagram links can be enabled when you provide your profiles.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
