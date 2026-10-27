import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "../../../data/case-studies";

export function generateStaticParams() { return caseStudies.map(({slug}) => ({slug})); }
export async function generateMetadata({params}: {params: Promise<{slug:string}>}): Promise<Metadata> {
 const {slug}=await params; const project=getCaseStudy(slug);
 return {title: project ? project.title+" | Caso de estudio | Nexus AI" : "Proyecto no encontrado", description:project?.lead};
}
export default async function CaseStudyPage({params}: {params:Promise<{slug:string}>}) {
 const {slug}=await params; const project=getCaseStudy(slug); if(!project) notFound();
 const section="mt-12 border-t border-slate-700/60 pt-8";
 return <main className="min-h-screen bg-[#09111c] px-5 py-9 text-slate-100 sm:px-9 sm:py-16">
  <div className="mx-auto max-w-4xl">
   <nav aria-label="Ruta de navegación" className="mb-16 flex flex-wrap items-center gap-3 text-sm text-sky-300">
    <Link className="hover:underline" href="/">Portafolio</Link><span className="text-slate-500">/</span><Link className="hover:underline" href="/#proyectos">Proyectos</Link><span className="text-slate-500">/</span><span className="text-slate-200">{project.title}</span>
   </nav>
   <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{project.eyebrow}</p>
   <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">{project.title}</h1>
   <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-300">{project.lead}</p>
   <div className="mt-8 flex flex-wrap gap-2">{project.tech.map(x=><span key={x} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-sky-200">{x}</span>)}</div>
   <dl className="mt-12 grid gap-5 border-y border-slate-700/60 py-7 sm:grid-cols-2">
    <div><dt className="text-xs uppercase tracking-widest text-sky-300">Participación</dt><dd className="mt-2 text-sm leading-6 text-slate-200">{project.role}</dd></div>
    <div><dt className="text-xs uppercase tracking-widest text-sky-300">Estado real</dt><dd className="mt-2 text-sm leading-6 text-slate-200">{project.status}</dd></div>
   </dl>
   <section className={section}><h2 className="text-2xl font-semibold">El problema</h2><p className="mt-4 leading-8 text-slate-300">{project.problem}</p></section>
   <section className={section}><h2 className="text-2xl font-semibold">Decisiones e implementación</h2><ol className="mt-5 space-y-5">{project.approach.map((x,i)=><li key={x} className="flex gap-5 text-slate-300 leading-7"><span className="font-mono text-sky-300">{String(i+1).padStart(2,"0")}</span>{x}</li>)}</ol></section>
   {project.evidence.length>0&&<section className={section}><h2 className="text-2xl font-semibold">Evidencia en el código</h2><div className="mt-5 grid gap-3">{project.evidence.map(x=><a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-700 bg-[#111e2c] p-5 hover:border-sky-500 focus-visible:outline-2 focus-visible:outline-sky-300"><strong className="text-sky-200">{x.label} ↗</strong><p className="mt-2 text-sm text-slate-300">{x.detail}</p></a>)}</div></section>}
   <section className={section}><h2 className="text-2xl font-semibold">Lo que aprendí</h2><ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-slate-300">{project.lessons.map(x=><li key={x}>{x}</li>)}</ul></section>
   <section className={section}><h2 className="text-2xl font-semibold">Límites y trabajo pendiente</h2><ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-slate-300">{project.limitations.map(x=><li key={x}>{x}</li>)}</ul><p className="mt-5 text-sky-200"><strong>Próximo paso:</strong> {project.next}</p></section>
   <div className="mt-12 flex flex-wrap gap-4">{project.repository&&<a href={project.repository} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-sky-300 px-5 py-3 font-semibold text-slate-950">Código en GitHub ↗</a>}{project.demo&&(project.demo.startsWith("/")?<Link href={project.demo} className="rounded-lg border border-slate-600 px-5 py-3">Abrir asistente →</Link>:<a href={project.demo} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-600 px-5 py-3">Ver demo ↗</a>)}<Link href="/#proyectos" className="rounded-lg border border-slate-600 px-5 py-3">Volver a proyectos</Link></div>
  </div>
 </main>;
}
