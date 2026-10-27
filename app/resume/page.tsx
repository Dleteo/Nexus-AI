import type { Metadata } from "next";
import Link from "next/link";
import { certifications,totalTrainingHours } from "../../data/certifications";
import { professionalProfile as profile } from "../../data/profile";
import { resumeCopy, type ResumeLang } from "../../data/resume-copy";

export const metadata: Metadata={title:"Joshua Vallejo Sanchez | CV Junior Web Developer",description:"CV bilingüe con proyectos verificables y formación documentada."};

export default async function ResumePage({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const {lang}=await searchParams;const language:ResumeLang=lang==="en"?"en":"es";const copy=resumeCopy[language];
 return <main className="min-h-screen bg-[#0a111b] px-4 py-8 text-slate-100 print:min-h-0 print:bg-white print:p-0">
 <div className="mx-auto max-w-4xl">
 <nav aria-label="Acciones del currículum" className="mb-6 flex flex-wrap gap-3 print:hidden">
 <Link href="/" className="rounded-lg border border-slate-600 px-4 py-3 text-sm">← Portafolio</Link>
 <Link href="/interview" className="rounded-lg border border-slate-600 px-4 py-3 text-sm">Preparar entrevista</Link>
 <Link href={"/resume?lang="+(language==="es"?"en":"es")} className="rounded-lg border border-slate-600 px-4 py-3 text-sm">{language==="es"?"English version":"Versión en español"}</Link>
 <a className="rounded-lg bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-950" href={"/api/resume/pdf?lang="+language} download={"Joshua-Vallejo-Sanchez-CV-"+language+".pdf"}>Descargar CV (PDF) ↓</a>
 </nav>
 <article id="resume-print-sheet" lang={language} className="rounded-2xl bg-white px-6 py-9 text-slate-900 shadow-xl sm:px-12 sm:py-12 print:rounded-none print:px-0 print:py-0 print:shadow-none">
 <header className="border-b-2 border-slate-900 pb-5">
 <p className="text-xs font-bold uppercase tracking-widest text-sky-800">{copy.role}</p><h1 className="mt-3 text-3xl font-bold">{profile.name}</h1><p className="mt-2 text-base">{copy.headline}</p><p className="mt-2 text-sm text-slate-700">{profile.location} · <a href={profile.github} className="underline">github.com/Dleteo</a>{profile.linkedin&&<> · <a className="underline" href={profile.linkedin}>LinkedIn</a></>}</p>
 </header>
 <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-widest text-sky-800">{copy.headings.profile}</h2><p className="mt-2 text-sm leading-6">{copy.summary}</p></section>
 <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-widest text-sky-800">{copy.headings.projects}</h2><div className="mt-3 space-y-3">{copy.projects.map(x=><div key={x.name}><p className="text-sm font-semibold">{x.name} · <a href={x.url} className="underline">{x.stack}</a></p><p className="text-sm leading-6">{x.summary}</p></div>)}</div></section>
 <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-widest text-sky-800">{copy.headings.skills}</h2><div className="mt-2 space-y-1">{copy.skillGroups.map(x=><p key={x.title} className="text-sm leading-6"><strong>{x.title}:</strong> {x.items}</p>)}</div></section>
 <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-widest text-sky-800">{copy.headings.experience}</h2><p className="mt-2 text-sm leading-6">{copy.experience}</p></section>
 <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-widest text-sky-800">{copy.headings.training} · {totalTrainingHours} h</h2><p className="mt-1 text-xs text-slate-600">{copy.trainingNote}</p><ul className="mt-2 space-y-1 text-xs leading-5">{certifications.map(x=><li key={x.id}><strong>{x.title}</strong> — {x.issuer}, {x.hours} h ({x.credentialType==="Course completion"?copy.completedLabel:copy.attendanceLabel})</li>)}</ul></section>
 <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-widest text-sky-800">{copy.headings.research}</h2><p className="mt-2 text-sm leading-6">{copy.research}</p></section>
 <section className="mt-6"><h2 className="text-sm font-bold uppercase tracking-widest text-sky-800">{copy.headings.languages}</h2><p className="mt-2 text-sm">{copy.languages}</p></section>
 <footer className="mt-6 border-t border-slate-300 pt-3 text-xs text-slate-600">{copy.footnote}</footer>
 </article></div></main>;
}