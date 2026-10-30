"use client";

import {useState} from "react";
import Link from "next/link";
import type {CaseStudy} from "../../data/case-studies";

/** Local comparison of the five documented architectures, no generated claims. */
export default function ProjectArchitectureCompare({studies}:{studies:CaseStudy[]}){
  const [left,setLeft]=useState("nexus-ai");
  const [right,setRight]=useState("nexus-factory");
  const first=studies.find(x=>x.slug===left);
  const second=studies.find(x=>x.slug===right);
  const options=studies.filter(x=>["nexus-ai","nexus-commerce","nexus-studio","nexus-monitor","nexus-factory"].includes(x.slug));
  if(!first||!second)return null;
  return <section aria-labelledby="compare-project-title" className="mt-14 rounded-2xl border border-[#844457] bg-[#1b161c] p-5 sm:p-8">
    <h2 id="compare-project-title" className="text-2xl font-bold">Compara las cinco arquitecturas</h2>
    <p className="mt-3 text-sm leading-7 text-slate-300">Elige dos proyectos y explica qué problema resuelven, cómo están construidos y qué límites conservan. Los datos vienen de los casos de estudio, no de una evaluación automática.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {[{id:"compare-left",label:"Primer proyecto",value:left,change:setLeft},
        {id:"compare-right",label:"Segundo proyecto",value:right,change:setRight}].map(control=>
        <label key={control.id} className="text-sm text-slate-200" htmlFor={control.id}>{control.label}
          <select id={control.id} className="mt-2 block w-full rounded-xl border border-[#925266] bg-[#171217] px-4 py-3 text-white" value={control.value} onChange={event=>control.change(event.target.value)}>
            {options.map(study=><option value={study.slug} key={study.slug}>{study.title}</option>)}
          </select>
        </label>)}
    </div>
    {left===right&&<p className="mt-4 text-sm text-amber-200" role="status">Has elegido el mismo proyecto. Selecciona otro para comparar decisiones diferentes.</p>}
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {[first,second].map((study,index)=><article aria-label={"Arquitectura "+study.title+" "+(index+1)} key={index} className="rounded-xl border border-white/10 bg-[#241b24] p-5">
        <h3 className="text-xl font-semibold text-white">{study.title}</h3>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#f2acbc]">Tecnologías</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{study.tech.join(" · ")}</p>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#f2acbc]">Problema</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{study.problem}</p>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#f2acbc]">Decisión técnica</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{study.approach[0]||"Sin decisión documentada."}</p>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#f2acbc]">Limitación demostrable</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{study.limitations[0]||"No documentada."}</p>
        <Link href={"/projects/"+study.slug} className="mt-5 inline-block rounded-lg border border-[#ba7083] px-3 py-2 text-sm text-[#ffc2cf] hover:border-white">Revisar evidencia y pruebas</Link>
      </article>)}
    </div>
    <p className="mt-5 text-xs leading-6 text-slate-400">Comparación de arquitectura documentada. No implica rendimiento superior, aprobación de seguridad o experiencia laboral.</p>
  </section>;
}
