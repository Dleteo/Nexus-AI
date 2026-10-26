"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import { nexusOnePaths, nexusOneProjects, type NexusOneProject } from "../../data/nexus-one";
import { certifications, totalTrainingHours } from "../../data/certifications";
import { professionalProfile } from "../../data/profile";

type Destination = "work" | "certifications" | "resume" | "research";
const destinations: { id: Destination; number: string; title: string; label: string; detail: string }[] = [
  { id: "work", number: "01", title: "PROJECT CORE", label: "Real code", detail: "Nexus AI and seven public learning projects." },
  { id: "certifications", number: "02", title: "CREDENTIAL VAULT", label: "Verified documents", detail: "Original course and attendance certificates." },
  { id: "resume", number: "03", title: "CAREER DOSSIER", label: "Professional profile", detail: "Resume, evidenced skills and contact." },
  { id: "research", number: "04", title: "FOUNDATION LAB", label: "Experimental research", detail: "Independent research, not the assistant deployed here." },
];
const guidePrompts = [
  { title: "Show the projects", query: "projects" },
  { title: "Check my certificates", query: "certificates" },
  { title: "Open the resume", query: "resume" },
  { title: "Explain Nexus Foundation", query: "foundation" },
] as const;
const classify = (input: string): Destination | null => {
  const value = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/certific|credential|course|curso|diploma|horas|hours/.test(value)) return "certifications";
  if (/curricul|resume|cv|recruit|trabaj|career|empleo|contact/.test(value)) return "resume";
  if (/foundation|model|investig|research|transformer|pytorch/.test(value)) return "research";
  if (/project|proyecto|javascript|github|source|codigo|code|nexus|web/.test(value)) return "work";
  return null;
};

export default function NexusOne() {
  const [destination, setDestination] = useState<Destination>("work");
  const [currentProject, setCurrentProject] = useState("nexus-ai");
  const [query, setQuery] = useState("");
  const [guide, setGuide] = useState("Ask about work, certificates, the resume or Foundation. The public navigator opens verified sections; the separate AI workspace handles general questions.");
  const [recruiter, setRecruiter] = useState(false);
  const coreRef = useRef<HTMLDivElement>(null);
  const activeProject: NexusOneProject = nexusOneProjects.find((item) => item.id === currentProject) ?? nexusOneProjects[0];

  function selectDestination(value: Destination, scroll = false) {
    setDestination(value);
    if (scroll) document.getElementById(value)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submitNavigator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = classify(query);
    if (result === null) {
      setGuide("I can take you to real projects, certificates, the CV, or the experimental Foundation research. For general technical questions, open the authenticated AI workspace.");
    } else {
      selectDestination(result, true);
      setGuide({
        work: "Project Core selected. Browse original public repositories, live demos where documented, and the Nexus AI case study.",
        certifications: "Credential Vault selected. Six documented credentials and their original certificate images are available in the portfolio.",
        resume: "Career Dossier selected. View the existing professional resume or download the PDF.",
        research: "Foundation Lab selected. This is independent experimental research; it is not the model answering in the public AI assistant.",
      }[result]);
    }
  }

  function moveCore(event: PointerEvent<HTMLDivElement>) {
    const node = coreRef.current;
    if (!node || event.pointerType === "touch") return;
    const rect = node.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    node.style.setProperty("--nx-tilt-y", String(x * 7) + "deg");
    node.style.setProperty("--nx-tilt-x", String(-y * 6) + "deg");
  }

  return (
    <div className="nxone">
      <a href="#main-content" className="nx-skip">Skip to content</a>
      <div className="nx-frame">
        <header className="nx-topbar">
          <Link href="/" className="nx-brand" aria-label="Nexus AI home"><span className="nx-mark">N</span><span>NEXUS<span className="nx-accent">/ONE</span></span></Link>
          <nav aria-label="Nexus One" className="nx-topnav">
            <a href="#work">Work</a><a href="#certifications">Credentials</a><a href="#resume">Resume</a><a href="#research">Research</a>
          </nav>
          <Link className="nx-top-cta" href={nexusOnePaths.assistant}>OPEN AI <span aria-hidden="true">↗</span></Link>
        </header>

        <main id="main-content">
          <section className="nx-hero" aria-labelledby="nx-heading">
            <div className="nx-noise" aria-hidden="true" />
            <div className="nx-hero-copy">
              <p className="nx-eyebrow"><span className="nx-dot" /> SYSTEM ONLINE <span className="nx-slash">/</span> PORTFOLIO 2026</p>
              <h1 id="nx-heading">ONE MIND.<br /><em>EVERY PROJECT.</em></h1>
              <p className="nx-lead">A living index of real projects, professional evidence and an AI-powered application. Built as one connected experience.</p>
              <p className="nx-byline">Built by <strong>{professionalProfile.name}</strong> · {professionalProfile.role}</p>
              <div className="nx-hero-actions">
                <a className="nx-button nx-button-primary" href="#work">ENTER THE ARCHIVE <span aria-hidden="true">↗</span></a>
                <Link className="nx-button nx-button-outline" href={nexusOnePaths.assistant}>EXPLORE AI WORKSPACE</Link>
              </div>
              <div className="nx-vitals" aria-label="Portfolio summary">
                <div><strong>{nexusOneProjects.length.toString().padStart(2, "0")}</strong><span>Public repositories indexed</span></div>
                <div><strong>{certifications.length.toString().padStart(2, "0")}</strong><span>Documented certificates</span></div>
                <div><strong>{totalTrainingHours}</strong><span>Recorded training hours</span></div>
              </div>
            </div>
            <div className="nx-hero-art" ref={coreRef} onPointerMove={moveCore} onPointerLeave={()=>{coreRef.current?.style.setProperty("--nx-tilt-x","0deg");coreRef.current?.style.setProperty("--nx-tilt-y","0deg");}} aria-label="Decorative animated Nexus core sculpture">
              <div className="nx-art-aura" aria-hidden="true"/>
              <div className="nx-art-plane" aria-hidden="true">
                <span className="nx-art-orbit nx-art-orbit-one"/>
                <span className="nx-art-orbit nx-art-orbit-two"/>
                <span className="nx-art-orbit nx-art-orbit-three"/>
                <span className="nx-art-letter">N</span>
                <span className="nx-art-target nx-art-target-one"/>
                <span className="nx-art-target nx-art-target-two"/>
              </div>
              <span className="nx-art-caption">NEXUS / CORE — VISUAL INTERFACE</span>
              <span className="nx-art-index">001 / PUBLIC INDEX</span>
            </div>
          </section>

          <section className="nx-bridge" aria-label="Navigation overview">
            <span className="nx-bridge-title">EXPLORE THE SYSTEM</span><span className="nx-bridge-line" aria-hidden="true" /><span>SCROLL TO DISCOVER <span aria-hidden="true">↓</span></span>
          </section>

          <section className="nx-missions" id="work" aria-labelledby="nx-work-title">
            <div className="nx-section-head"><span>01 / SELECTED SYSTEMS</span><p>NOT CONCEPTS. ACTUAL SOURCE.</p></div>
            <div className="nx-heading-line"><h2 id="nx-work-title">THE PROJECT <em>ARCHIVE.</em></h2><p>Everything in one place, from small JavaScript experiments to a full application with authentication and AI assistance.</p></div>
            <div className="nx-mission-layout">
              <div className="nx-mission-list" role="group" aria-label="Choose a project">
                {nexusOneProjects.map((item, index) => (
                  <button type="button" key={item.id} className={"nx-mission" + (item.id === currentProject ? " is-selected":"")} aria-pressed={item.id === currentProject} onClick={()=>setCurrentProject(item.id)}>
                    <span className="nx-mission-num">{String(index+1).padStart(2,"0")}</span>
                    <span className="nx-mission-name">{item.title}<small>{item.subtitle}</small></span>
                    <span className="nx-mission-arrow" aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
              <article className="nx-mission-detail" aria-live="polite" aria-atomic="true">
                <span className="nx-detail-eyebrow">{activeProject.kind === "flagship"?"FLAGSHIP APPLICATION":"LEARNING PROJECT"} / SOURCE VERIFIED</span>
                <div className="nx-detail-symbol" aria-hidden="true"><span>{activeProject.title.slice(0,1)}</span></div>
                <h3>{activeProject.title}</h3>
                <p>{activeProject.summary}</p>
                <div className="nx-tags">{activeProject.technologies.map(t=><span key={t}>{t}</span>)}</div>
                <div className="nx-detail-evidence"><strong>WHAT IT SHOWS</strong><span>{activeProject.evidence}</span></div>
                <div className="nx-detail-links">
                  <a href={activeProject.source} target="_blank" rel="noopener noreferrer">GITHUB SOURCE ↗</a>
                  {activeProject.demo?<a href={activeProject.demo} target="_blank" rel="noopener noreferrer">OPEN ORIGINAL DEMO ↗</a>:null}
                  {activeProject.kind==="flagship"?<Link href="/portfolio#case-study">READ CASE STUDY ↗</Link>:null}
                </div>
              </article>
            </div>
          </section>

          <section id="certifications" className="nx-evidence" aria-labelledby="nx-evidence-title">
            <div className="nx-section-head"><span>02 / CREDENTIAL VAULT</span><p>NO INVENTED ACCOMPLISHMENTS</p></div>
            <div className="nx-evidence-layout">
              <div><p className="nx-mini-label">PROFESSIONAL EVIDENCE / 2026</p><h2 id="nx-evidence-title">LEARNING,<br/><em>DOCUMENTED.</em></h2><p>Original certificates and records, with their credential types and dates. Course completion and attendance are never presented as professional employment.</p><Link className="nx-button nx-button-primary" href={nexusOnePaths.certificates}>OPEN CERTIFICATE GALLERY ↗</Link></div>
              <div className="nx-credential-ledger">
                {certifications.map((item,index)=><div className="nx-credential-row" key={item.id}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{item.title}</strong><small>{item.issuer} · {item.credentialType}</small></div><b>{item.hours}h</b></div>)}
                <div className="nx-credential-total"><span>TOTAL DOCUMENTED</span><strong>{totalTrainingHours} HOURS</strong></div>
              </div>
            </div>
          </section>

          <section id="resume" className="nx-resume" aria-labelledby="nx-resume-title">
            <div className="nx-section-head"><span>03 / CAREER DOSSIER</span><p>READABLE IN UNDER A MINUTE</p></div>
            <div className="nx-resume-content">
              <div><p className="nx-mini-label">PROFILE / VERIFIED WORK</p><h2 id="nx-resume-title">BEYOND<br/><em>THE VISUALS.</em></h2><p>The strongest evidence is not a flashy effect. It is the projects, code, decisions, tests and documented learning behind the interface.</p></div>
              <div className="nx-resume-card"><span>PROFESSIONAL ID / 001</span><h3>{professionalProfile.name}</h3><p>{professionalProfile.role}</p><div className="nx-resume-skills"><span>Direct practice</span><strong>HTML · CSS · JavaScript · DOM</strong><span>AI-assisted integrations</span><strong>React · Next.js · TypeScript · Supabase</strong></div><Link href={nexusOnePaths.resume}>VIEW FULL CV ↗</Link><a href={nexusOnePaths.resumePdf} download>DOWNLOAD PDF ↧</a></div>
            </div>
          </section>

          <section id="research" className="nx-research" aria-labelledby="nx-research-title">
            <div className="nx-section-head"><span>04 / RESEARCH & DELIVERY</span><p>TRANSPARENT PROJECT STATUS</p></div>
            <div className="nx-research-grid">
              <article><span>RESEARCH / PRIVATE</span><h2 id="nx-research-title">Nexus Foundation</h2><p>Independent experimental research on an original Transformer and tokenization. It is not production-ready and does not power the assistant in Nexus AI. Private data, checkpoints and source stay isolated.</p><span className="nx-project-status">EXPERIMENTAL · NOT DEPLOYED AS A MODEL</span></article>
              <article><span>PUBLIC-FACING EXPERIMENT / EXTERNAL</span><h2>Nexus Preview</h2><p>A separate lightweight preview deployment for a limited public demo. Its hosted state may differ from the main application. The backup archive is private and is intentionally not linked here.</p><a href={nexusOnePaths.preview} target="_blank" rel="noopener noreferrer">OPEN EXTERNAL PREVIEW ↗</a></article>
            </div>
          </section>

          <section className="nx-navigator" aria-labelledby="nx-navigator-title">
            <div className="nx-navigator-heading"><span>05 / NAVIGATION INTELLIGENCE</span><h2 id="nx-navigator-title">ASK THE <em>ARCHIVE.</em></h2><p>Use the public navigator to jump to evidence. For general technical help, enter the authenticated Nexus AI assistant.</p></div>
            <div className="nx-navigator-window">
              <div className="nx-terminal-head"><span className="nx-dot"/> NEXUS / PUBLIC NAVIGATOR <small>RULE-BASED · NO MODEL CLAIMED</small></div>
              <p className="nx-guide-response" role="status" aria-live="polite"><span aria-hidden="true">✦</span> {guide}</p>
              <div className="nx-suggestions">{guidePrompts.map(p=><button type="button" key={p.query} onClick={()=>{setQuery(p.query);const result=classify(p.query);if(result){selectDestination(result,true);setGuide("Opening "+destinations.find(d=>d.id===result)?.title+". See the linked evidence below.");}}}>{p.title} ↗</button>)}</div>
              <form onSubmit={submitNavigator} className="nx-prompt-form"><label htmlFor="nx-prompt" className="nx-sr-only">Ask the portfolio navigator</label><input id="nx-prompt" maxLength={200} value={query} onChange={event=>setQuery(event.target.value)} placeholder="e.g. Show my JavaScript projects" /><button type="submit" disabled={!query.trim()}>GO ↗</button></form>
              <Link href={nexusOnePaths.assistant} className="nx-open-assistant">OPEN REAL AI WORKSPACE (SIGN-IN REQUIRED) ↗</Link>
            </div>
          </section>

          <section className="nx-recruiter" aria-labelledby="nx-recruiter-title">
            <div><p className="nx-mini-label">QUICK ACCESS / RECRUITER MODE</p><h2 id="nx-recruiter-title">LESS SHOW.<br/><em>MORE PROOF.</em></h2><p>Skip the visual experience and open the professional material directly.</p></div>
            <button type="button" className="nx-button nx-button-outline" aria-expanded={recruiter} aria-controls="nx-recruiter-links" onClick={()=>setRecruiter(v=>!v)}>{recruiter?"HIDE QUICK LINKS":"ENABLE RECRUITER MODE"} ↗</button>
            {recruiter&&<div className="nx-recruiter-links" id="nx-recruiter-links"><Link href="/portfolio#work">Nexus AI case study ↗</Link><Link href="/portfolio#skills">Evidenced skills ↗</Link><Link href={nexusOnePaths.certificates}>Certificates ↗</Link><Link href={nexusOnePaths.resume}>CV ↗</Link><a href={professionalProfile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>}
          </section>
        </main>
        <footer className="nx-footer"><span>◈ NEXUS / ONE · 2026</span><span>Real work. Real evidence. A single experience.</span><Link href="/portfolio">FULL PORTFOLIO ↗</Link></footer>
      </div>
    </div>
  );
}
