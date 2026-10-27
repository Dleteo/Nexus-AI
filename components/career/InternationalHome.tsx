import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import {certifications,totalTrainingHours} from "../../data/certifications";
import {internationalCopy} from "../../data/international-copy";
import {type SiteLanguage,cvDownloadPath,cvFileName,cvDownloadLabels} from "../../data/site-languages";
import {professionalProfile} from "../../data/profile";

const work=[
 {slug:"nexus-ai",name:"Nexus AI",key:"nexus",tech:"Next.js · React · TypeScript · Supabase",source:"https://github.com/Dleteo/Nexus-AI"},
 {slug:"task-tracker",name:"Task Tracker",key:"tracker",tech:"HTML · CSS · JavaScript · localStorage",source:"https://github.com/Dleteo/-To-Do-App-whit-JavaScript",demo:"https://dleteo.github.io/-To-Do-App-whit-JavaScript/"},
 {slug:"hangman",name:"Hangman Game",key:"hangman",tech:"JavaScript · HTML · CSS",source:"https://github.com/Dleteo/hangman-game",demo:"https://dleteo.github.io/hangman-game/"},
 {slug:"nexus-foundation",name:"Nexus Foundation",key:"foundation",tech:"Python · PyTorch · BPE · Transformers"},
] as const;
export default function InternationalHome({language}:{language:Exclude<SiteLanguage,"es">}){
 const c=internationalCopy[language];
 const sections=["start","projects","skills","certificates","experience","assistant","contact"];
 return <div className="min-h-screen bg-[#080d14] text-slate-100" lang={language}>
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-black">Skip to content</a>
  <header className="sticky top-0 z-40 border-b border-[#273a50] bg-[#0d1724]/95 px-5 py-4 backdrop-blur-lg sm:px-9">
   <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
    <Link href={"/"+language} className="text-xl font-extrabold tracking-[.12em] text-sky-200">NEXUS <span className="text-xs font-medium tracking-normal text-slate-400">/ Developer</span></Link>
    <LanguageSwitcher language={language}/>
   </div>
  </header>
  <main id="main-content" className="mx-auto max-w-6xl px-5 pb-8 sm:px-9">
   <nav className="flex flex-wrap gap-x-5 gap-y-3 border-b border-[#273a50] py-5 text-xs text-slate-300" aria-label="Portfolio navigation">{c.nav.map((x,i)=><a href={"#"+sections[i]} className="hover:text-sky-300" key={sections[i]}>{x}</a>)}</nav>
   <section className="grid min-h-[520px] items-center gap-12 py-24 lg:grid-cols-[1.3fr_0.7fr]" id="start">
    <div><p className="text-xs font-bold tracking-[.19em] text-sky-300">{c.eyebrow}</p>
    <p className="mt-8 text-lg text-slate-300">{c.nameIntro} {professionalProfile.name}.</p>
    <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">{c.title} <span className="text-sky-300">{c.highlight}</span></h1>
    <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300">{c.intro}</p>
    <div className="mt-8 flex flex-wrap gap-3"><a href="#projects" className="rounded-lg bg-sky-300 px-5 py-3 font-semibold text-slate-950">{c.viewProjects} →</a><Link href={"/resume?lang="+language} className="rounded-lg border border-slate-500 px-5 py-3 text-sky-100">{c.viewResume} →</Link><a href={cvDownloadPath(language)} download={cvFileName(language)} className="rounded-lg border border-sky-500 px-5 py-3 font-semibold text-sky-200">{cvDownloadLabels[language]} ↓</a></div></div>
    <div className="rounded-2xl border border-[#345270] bg-gradient-to-br from-[#152c4a] to-[#0a121e] p-7 shadow-2xl">
     <p className="font-mono text-xs text-sky-300">NEXUS / AI WORKSPACE</p><div className="my-10 rounded-xl border border-slate-600/60 bg-[#0a192a] p-7"><p className="text-lg font-semibold">Nexus AI</p><div className="mt-6 h-2 w-4/5 rounded bg-[#294362]"/><div className="mt-3 h-2 w-3/5 rounded bg-[#294362]"/><div className="mt-8 flex flex-wrap gap-2 text-xs text-sky-200"><span className="rounded bg-[#203b5b] px-3 py-2">React</span><span className="rounded bg-[#203b5b] px-3 py-2">Supabase</span><span className="rounded bg-[#203b5b] px-3 py-2">AI</span></div></div><p className="text-xs text-slate-400">Verified source code · Public repository</p></div>
   </section>
   <section className="grid gap-px overflow-hidden rounded-xl border border-[#273a50] bg-[#273a50] sm:grid-cols-2 lg:grid-cols-4" aria-label="Documented portfolio metrics">{[[totalTrainingHours+" h",c.training],[String(certifications.length),c.certificates],["11",c.repositories],["01",c.app]].map(([n,l])=><div key={l} className="bg-[#111b28] p-6"><strong className="text-3xl">{n}</strong><p className="mt-2 text-xs text-slate-400">{l}</p></div>)}</section>
   <p className="mt-3 text-xs text-slate-400">{c.trainingNote}</p>
   <section className="scroll-mt-24 py-24" id="projects"><h2 className="text-3xl font-semibold sm:text-4xl">{c.projectsTitle}</h2><p className="mt-3 text-slate-300">{c.projectsIntro}</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2">{work.map(item=><article key={item.slug} className="rounded-xl border border-[#30455e] bg-[#111b28] p-7"><p className="font-mono text-xs text-sky-300">{item.tech}</p><h3 className="mt-5 text-2xl font-semibold">{item.name}</h3><p className="mt-4 min-h-20 text-sm leading-7 text-slate-300">{c.projectTexts[item.key]}</p><div className="mt-6 flex flex-wrap gap-5 text-sm text-sky-300"><Link href={"/projects/"+item.slug+"?lang="+language}>{c.caseStudy} ↗</Link>{"source" in item&&item.source&&<a href={item.source} target="_blank" rel="noopener noreferrer">{c.source} ↗</a>}{"demo" in item&&item.demo&&<a href={item.demo} target="_blank" rel="noopener noreferrer">{c.demo} ↗</a>}</div></article>)}</div>
    
   </section>
   <section className="scroll-mt-24 border-t border-[#273a50] py-20" id="skills"><h2 className="text-3xl font-semibold">{c.skillsTitle}</h2><p className="mt-4 text-slate-300">{c.skillsIntro}</p><div className="mt-7 flex flex-wrap gap-3">{["JavaScript","HTML5","CSS3","DOM","React","Next.js","TypeScript","Supabase","PostgreSQL","GitHub Actions"].map(x=><span key={x} className="rounded-lg border border-slate-700 bg-[#15243a] px-4 py-3 text-sm">{x}</span>)}</div></section>
   <section className="scroll-mt-24 border-t border-[#273a50] py-20" id="certificates"><h2 className="text-3xl font-semibold">{c.trainingTitle}</h2><p className="mt-4 text-slate-300">{c.trainingIntro}</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{certifications.map(x=><article key={x.id} className="rounded-xl border border-[#30455e] bg-[#111b28] p-5"><p className="text-xs text-sky-300">{x.issuer} · {x.hours} h</p><h3 className="mt-3 text-base font-semibold">{x.title}</h3><a className="mt-4 inline-block text-xs text-sky-300" href={x.credentialUrl||x.image} target="_blank" rel="noopener noreferrer">{c.certificates} ↗</a></article>)}</div></section>
   <section className="scroll-mt-24 border-t border-[#273a50] py-20" id="experience"><h2 className="text-3xl font-semibold">{c.experienceTitle}</h2><p className="mt-5 max-w-3xl leading-8 text-slate-300">{c.experience}</p></section>
   <section className="scroll-mt-24 rounded-2xl border border-sky-700/40 bg-[#14243b] p-8 sm:p-12" id="assistant"><h2 className="text-3xl font-semibold">{c.aiTitle}</h2><p className="mt-4 max-w-3xl leading-8 text-slate-300">{c.aiDesc}</p><div className="mt-7 flex flex-wrap gap-4"><Link href="/assistant" className="rounded-lg bg-sky-300 px-5 py-3 font-semibold text-slate-950">{c.aiTitle} →</Link><Link href="/interview" className="rounded-lg border border-slate-500 px-5 py-3">{c.interview} →</Link></div></section>
   <section className="scroll-mt-24 py-24 text-center" id="contact"><h2 className="text-4xl font-semibold">{c.contact}</h2><p className="mt-5 text-sm text-slate-400">{c.cvNotice}</p><a className="mt-7 inline-block rounded-lg bg-sky-300 px-7 py-3 font-semibold text-slate-950" href={professionalProfile.github} target="_blank" rel="noopener noreferrer">{c.github} ↗</a></section>
   <footer className="border-t border-[#273a50] py-7 text-xs text-slate-400">NEXUS · {c.copyright} · {new Date().getFullYear()}</footer>
  </main>
 </div>;
}
