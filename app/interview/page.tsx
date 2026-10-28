import type { Metadata } from "next";
import Link from "next/link";
import { professionalProfile } from "../../data/profile";
import { caseStudies } from "../../data/case-studies";

export const metadata: Metadata = {
 title: "Preparación de entrevista junior | Nexus AI",
 description: "Presentación profesional, preguntas de entrevista y demostraciones de proyectos verificables.",
};

const questions = [
 { question:"¿Cómo te presentarías?", answer:"Soy desarrollador web junior y he construido proyectos de JavaScript y una aplicación con Next.js, Supabase y un asistente de IA. Me interesa crear interfaces claras, entender cómo se guardan los datos y comprobar que lo que entrego funciona." },
 { question:"¿Qué hace Nexus AI?", answer:"Combina autenticación, proyectos privados y conversaciones guardadas con un asistente. Uso Next.js para las rutas y componentes, Supabase para cuentas y datos, y una API de IA del lado del servidor para no exponer claves." },
 { question:"¿Cuánto hiciste tú y cuánto hizo la IA?", answer:"Utilizo herramientas de IA para acelerar implementación y aprendizaje. Distingo la práctica directa de HTML, CSS y JavaScript de las partes modernas implementadas con asistencia. Mi responsabilidad es entender, revisar, probar, explicar limitaciones y corregir errores; nunca atribuyo experiencia profesional inexistente." },
 { question:"¿Cómo proteges la información?", answer:"Compruebo la sesión en rutas privadas, aplico RLS en PostgreSQL, no envío secretos al cliente y pruebo accesos sin autenticar. No afirmo que las pruebas garanticen seguridad absoluta; también reviso los controles de despliegue." },
 { question:"¿Qué error o riesgo detectaste?", answer:"En un proyecto antiguo de tareas, el texto se inserta mediante innerHTML. Eso puede permitir contenido peligroso cuando la entrada no está tratada correctamente. Antes de reutilizarlo cambiaría a textContent y probaría entradas adversarias." },
 { question:"¿Qué diferencia hay entre los cinco proyectos?", answer:"Nexus AI Workspace integra el portafolio y asistencia. Commerce demuestra transacciones e inventario; Studio, edición y control de revisiones; Monitor, mediciones HTTP y estados de alerta; Factory, planificación, revisión humana y QA estática. Cada módulo tiene su propia evidencia de código y límites." },
 { question:"¿Software Factory es una IA que programa sola?", answer:"No. Actualmente genera un proyecto HTML/CSS mediante plantillas fijas, valida archivos y exige revisión humana. No ejecuta código generado ni llama a un modelo autónomo: el sandbox todavía no está verificado y se muestra como not_run." },
 { question:"¿Cuál fue tu contribución cuando usaste Codex y otras herramientas de IA?", answer:"El desarrollo recibió asistencia de IA; las decisiones y el código deben poder auditarse. Mi objetivo es demostrar comprensión de los flujos, reproducir pruebas, analizar fallos y explicar límites sin adjudicarme manualmente código o experiencia que no pueda verificar." },
 { question:"¿Qué mejorarías a continuación?", answer:"Documentaría flujos reales, reforzaría accesibilidad y pruebas, actualizaría el CV descargable junto con la versión web y desplegaría una versión verificable antes de presentarla como producción." },
];
export default function InterviewPage() {
 return <main className="min-h-screen bg-[#120f13] px-5 py-10 text-slate-100 sm:px-9 sm:py-16">
  <div className="mx-auto max-w-4xl">
   <nav className="mb-12 flex flex-wrap gap-5 text-sm text-[#f4a3b6]"><Link href="/">← Portafolio</Link><Link href="/resume">Ver CV</Link></nav>
   <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4a3b6]">PREPARACIÓN / JUNIOR WEB DEVELOPER</p>
   <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Presentación profesional para entrevistas</h1>
   <p className="mt-6 text-lg leading-8 text-slate-300">Una guía de práctica basada en las evidencias de tus repositorios, sin inventar empleos, resultados ni experiencia comercial. Personaliza las respuestas hasta que puedas explicarlas con tus palabras.</p>
   <section className="mt-12 rounded-2xl border border-slate-700 bg-[#251a23] p-7 sm:p-9" aria-labelledby="pitch-title">
    <p className="text-xs uppercase tracking-widest text-[#f4a3b6]">Presentación inicial · 45–60 segundos aproximados</p><h2 id="pitch-title" className="mt-3 text-2xl font-semibold">“Cuéntame sobre ti”</h2>
    <blockquote className="mt-5 text-lg leading-8 text-slate-100">“Hola, soy {professionalProfile.name}. Estoy buscando mi primera oportunidad como desarrollador web junior. He desarrollado proyectos prácticos con JavaScript y trabajo en Nexus AI, una aplicación con Next.js, autenticación, proyectos privados y un asistente de IA. Utilizo herramientas de inteligencia artificial como apoyo, pero también reviso el código, verifico los flujos y documento lo que aprendo. Me interesa aportar a un equipo, seguir mejorando mis fundamentos y construir soluciones útiles y seguras.”</blockquote>
   </section>
   <section className="mt-14"><h2 className="text-2xl font-semibold">Demostración recomendada: 5 minutos</h2>
    <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
     <li><strong className="text-[#f3bccb]">Minuto 1:</strong> presenta el objetivo del proyecto y para quién lo construiste.</li>
     <li><strong className="text-[#f3bccb]">Minutos 2–3:</strong> muestra las funciones que sí puedes ejecutar; explica sesiones, proyectos y mensajes.</li>
     <li><strong className="text-[#f3bccb]">Minuto 4:</strong> abre un archivo de código o una política RLS y explica una decisión de seguridad.</li>
     <li><strong className="text-[#f3bccb]">Minuto 5:</strong> explica una limitación real, una prueba y la siguiente mejora.</li>
    </ol>
   </section>
   <section className="mt-14"><h2 className="text-2xl font-semibold">Preguntas para practicar</h2><div className="mt-5 space-y-3">{questions.map((item,index)=><details key={item.question} className="group rounded-xl border border-slate-700 bg-[#201821] p-5"><summary className="cursor-pointer list-item pl-1 text-base font-semibold text-slate-100"><span className="mr-3 text-[#f4a3b6]">{String(index+1).padStart(2,"0")}.</span>{item.question}</summary><p className="mt-4 text-sm leading-7 text-slate-300">{item.answer}</p></details>)}</div></section>
   <section className="mt-14"><h2 className="text-2xl font-semibold">Cinco proyectos para explicar ante entrevistadores</h2><p className="mt-3 text-sm leading-7 text-slate-300">Abre cada caso de estudio y prepara una demostración de su flujo, una decisión de arquitectura, una prueba concreta y una limitación real.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{caseStudies.filter(x=>["nexus-ai","nexus-commerce","nexus-studio","nexus-monitor","nexus-software-factory"].includes(x.slug)).map((study,index)=><article key={study.slug} className="rounded-xl border border-[#773849] bg-[#211821] p-5"><p className="text-xs font-bold tracking-widest text-[#efa4b6]">0{index+1} / CASO TÉCNICO</p><h3 className="mt-2 text-lg font-semibold">{study.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{study.lead}</p><p className="mt-3 text-xs leading-5 text-slate-400"><strong className="text-[#efa4b6]">Límite:</strong> {study.limitations[0]}</p><div className="mt-5 flex flex-wrap gap-3"><Link className="rounded-lg bg-[#ed8797] px-3 py-2 text-xs font-bold text-[#150e13]" href={"/projects/"+study.slug}>Ver caso de estudio</Link>{study.demo&&<Link className="rounded-lg border border-[#bc677c] px-3 py-2 text-xs font-semibold text-[#f8b9c9]" href={study.demo}>Abrir demo</Link>}</div></article>)}</div><p className="mt-5 text-sm text-slate-400">Los ejercicios previos (Task Tracker y Hangman) también están documentados, pero estos cinco concentran la demostración principal.</p></section>
   <section className="mt-14 rounded-xl border border-slate-700 p-6"><h2 className="text-xl font-semibold">Antes de una entrevista</h2><p className="mt-3 text-sm leading-7 text-slate-300">Comprueba que tus enlaces abren, que puedes explicar cada tecnología listada y que no muestras datos privados. Si una demo requiere autenticación o no está disponible, usa el código, las pruebas y capturas auténticas. No memorices una historia que no puedas defender.</p></section>
  </div>
 </main>;
}
