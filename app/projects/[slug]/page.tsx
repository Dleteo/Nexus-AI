import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "../../../data/case-studies";
import { translatedCaseStudy,caseLabels } from "../../../data/localized-case-studies";
import { isSiteLanguage,siteLanguages,type SiteLanguage,portfolioPath } from "../../../data/site-languages";

export function generateStaticParams() { return caseStudies.map(({slug}) => ({slug})); }
export async function generateMetadata({params,searchParams}: {params: Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}): Promise<Metadata> {
 const {slug}=await params; const {lang}=await searchParams;const locale:SiteLanguage=lang&&isSiteLanguage(lang)?lang:"es";const base=getCaseStudy(slug);const project=base?translatedCaseStudy(base,locale):undefined;
 return {title: project ? project.title+" | Nexus AI" : "Proyecto no encontrado", description:project?.lead};
}
export default async function CaseStudyPage({params,searchParams}: {params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}) {
 const {slug}=await params;const {lang}=await searchParams;const locale:SiteLanguage=lang&&isSiteLanguage(lang)?lang:"es";const base=getCaseStudy(slug);if(!base)notFound();const project=translatedCaseStudy(base,locale);const label=caseLabels[locale];const back=portfolioPath(locale);
 const section="mt-12 border-t border-slate-700/60 pt-8";
 return <main lang={locale} className="min-h-screen bg-[#120f13] px-5 py-9 text-slate-100 sm:px-9 sm:py-16">
  <div className="mx-auto max-w-4xl">
   <nav aria-label="Ruta de navegación" className="mb-16 flex flex-wrap items-center gap-3 text-sm text-[#f4a3b6]">
    <Link className="hover:underline" href={back}>{label.back}</Link><span className="text-slate-500">/</span><Link className="hover:underline" href={back+"#proyectos"}>{label.project}</Link><span className="text-slate-500">/</span><span className="text-slate-200">{project.title}</span>
   </nav>
   <div className="mb-7 flex flex-wrap gap-2" role="group" aria-label="Case study language">{siteLanguages.map(item=><Link key={item.code} href={"/projects/"+slug+"?lang="+item.code} lang={item.code} aria-current={locale===item.code?"page":undefined} className={locale===item.code?"rounded-lg border border-[#eb819b] bg-[#4b2531] px-3 py-2 text-xs":"rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300"}>{item.nativeName}</Link>)}</div>
   <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4a3b6]">{project.title} / {project.tech.join(" · ")}</p>
   <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">{project.title}</h1>
   <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-300">{project.lead}</p>
   <div className="mt-8 flex flex-wrap gap-2">{project.tech.map(x=><span key={x} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-[#f3bccb]">{x}</span>)}</div>
   <dl className="mt-12 grid gap-5 border-y border-slate-700/60 py-7 sm:grid-cols-2">
    <div><dt className="text-xs uppercase tracking-widest text-[#f4a3b6]">{label.role}</dt><dd className="mt-2 text-sm leading-6 text-slate-200">{project.role}</dd></div>
    <div><dt className="text-xs uppercase tracking-widest text-[#f4a3b6]">{label.status}</dt><dd className="mt-2 text-sm leading-6 text-slate-200">{project.status}</dd></div>
   </dl>
   <section className={section}><h2 className="text-2xl font-semibold">{label.problem}</h2><p className="mt-4 leading-8 text-slate-300">{project.problem}</p></section>
   <section className={section}><h2 className="text-2xl font-semibold">{label.approach}</h2><ol className="mt-5 space-y-5">{project.approach.map((x,i)=><li key={x} className="flex gap-5 text-slate-300 leading-7"><span className="font-mono text-[#f4a3b6]">{String(i+1).padStart(2,"0")}</span>{x}</li>)}</ol></section>
   {project.evidence.length>0&&<section className={section}><h2 className="text-2xl font-semibold">{label.evidence}</h2><div className="mt-5 grid gap-3">{project.evidence.map(x=><a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-700 bg-[#211920] p-5 hover:border-[#e56b85] focus-visible:outline-2 focus-visible:outline-[#eb819b]"><strong className="text-[#f3bccb]">{locale==="es"?x.label:x.url.split("/").slice(-2).join("/")} ↗</strong>{locale==="es"&&<p className="mt-2 text-sm text-slate-300">{x.detail}</p>}</a>)}</div></section>}
   <section className={section}><h2 className="text-2xl font-semibold">{label.lessons}</h2><ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-slate-300">{project.lessons.map(x=><li key={x}>{x}</li>)}</ul></section>
   <section className={section}><h2 className="text-2xl font-semibold">{label.limits}</h2><ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-slate-300">{project.limitations.map(x=><li key={x}>{x}</li>)}</ul><p className="mt-5 text-[#f3bccb]"><strong>{label.next}:</strong> {project.next}</p></section>
   <div className="mt-12 flex flex-wrap gap-4">{project.repository&&<a href={project.repository} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#ed8797] px-5 py-3 font-semibold text-[#180c11]">{label.code} ↗</a>}{project.demo&&(project.demo.startsWith("/")?<Link href={project.demo} className="rounded-lg border border-slate-600 px-5 py-3">{project.slug==="nexus-ai"?label.assistant:label.demo} →</Link>:<a href={project.demo} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-600 px-5 py-3">{label.demo} ↗</a>)}<Link href={back+"#proyectos"} className="rounded-lg border border-slate-600 px-5 py-3">{label.project}</Link></div>
  </div>
 </main>;
}
