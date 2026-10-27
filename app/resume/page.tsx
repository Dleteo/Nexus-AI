import type { Metadata } from "next";
import Link from "next/link";
import { professionalProfile as profile } from "../../data/profile";
import { certifications, totalTrainingHours } from "../../data/certifications";

export const metadata: Metadata = {
 title: "Joshua Vallejo Sanchez | Junior Web Developer CV",
 description: "Professional junior web developer résumé with real projects, skills, transferable experience and documented training.",
};
const heading="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-sky-800 print:text-black";
export default function ResumePage() {
 return <main className="min-h-screen bg-[#0a111b] px-4 py-8 text-slate-100 print:min-h-0 print:bg-white print:p-0 print:text-black">
  <div className="mx-auto max-w-4xl">
   <nav aria-label="Acciones del currículum" className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
    <Link className="rounded-lg border border-slate-600 px-4 py-3 text-sm hover:border-sky-400" href="/">← Portafolio</Link>
    <Link className="rounded-lg border border-slate-600 px-4 py-3 text-sm hover:border-sky-400" href="/interview">Preparar entrevista</Link>
    <button className="rounded-lg bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-950" type="button" onClick={undefined} hidden aria-hidden="true">Imprimir</button>
    <a className="rounded-lg bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-950" href="/Joshua-Vallejo-Sanchez-Resume.pdf" download>Descargar CV (PDF) ↓</a>
   </nav>
   <article id="resume-print-sheet" className="rounded-2xl bg-white px-6 py-9 text-slate-900 shadow-xl sm:px-12 sm:py-12 print:rounded-none print:px-0 print:py-0 print:shadow-none">
    <header className="border-b-2 border-slate-900 pb-5">
     <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">Junior Web Developer · CV profesional</p>
     <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{profile.name}</h1>
     <p className="mt-2 text-base font-medium">Desarrollo web · JavaScript · React/Next.js · Proyectos asistidos por IA</p>
     <p className="mt-2 text-sm text-slate-700">{profile.location} · <a className="underline" href={profile.github}>github.com/Dleteo</a></p>
    </header>
    <section><h2 className={heading}>Perfil</h2><p className="mt-2 text-sm leading-6">Desarrollador web junior en formación práctica, con proyectos de JavaScript y una aplicación Next.js que integra cuentas de usuario, gestión de proyectos y asistencia con IA. He trabajado en interfaces responsive, persistencia de datos y comprobaciones automáticas. Busco mi primera oportunidad profesional como Junior Web Developer o Junior Frontend Developer, dispuesto a aprender en equipo y documentar mis decisiones técnicas.</p></section>
    <section><h2 className={heading}>Proyectos seleccionados</h2>
     <div className="mt-2 space-y-3 text-sm leading-6">
      <div><p><strong>Nexus AI</strong> · <a href="https://github.com/Dleteo/Nexus-AI" className="underline">Código en GitHub</a> · Next.js, React, TypeScript, Supabase</p><p>Aplicación personal de gestión de proyectos y asistencia de IA, con autenticación, acceso a datos por usuario, conversaciones persistentes, claves del proveedor en servidor y CI. Desarrollo asistido por IA con revisión y verificaciones.</p></div>
      <div><p><strong>Task Tracker</strong> · <a href="https://github.com/Dleteo/-To-Do-App-whit-JavaScript" className="underline">Código en GitHub</a> · JavaScript, DOM, localStorage</p><p>Interfaz para crear, marcar y eliminar tareas, con persistencia en el navegador. Proyecto educativo; su renderizado original requiere refactor de seguridad antes de usos productivos.</p></div>
      <div><p><strong>Hangman Game</strong> · <a href="https://github.com/Dleteo/hangman-game" className="underline">Código en GitHub</a> · JavaScript, HTML, CSS</p><p>Juego interactivo con estados de victoria/derrota, control de letras repetidas y validación de palabras personalizadas.</p></div>
     </div>
    </section>
    <section><h2 className={heading}>Competencias técnicas</h2><p className="mt-2 text-sm leading-6"><strong>Práctica directa:</strong> HTML5, CSS3, diseño responsive, JavaScript ES6, DOM, localStorage, Git y GitHub.<br/><strong>Implementadas con asistencia de IA:</strong> React, Next.js, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL/RLS, API routes.<br/><strong>Comprobaciones y flujo:</strong> ESLint, revisión de tipos, build de producción, pruebas HTTP y navegador, GitHub Actions.</p></section>
    <section><h2 className={heading}>Experiencia laboral transferible</h2><p className="mt-2 text-sm leading-6"><strong>Operaciones de cocina y hostelería (fuera del sector tecnológico):</strong> trabajo con procedimientos, coordinación, resolución de incidencias operativas y cumplimiento de tareas en entornos con tiempos exigentes. Busco mi primer puesto remunerado en desarrollo de software.</p></section>
    <section><h2 className={heading}>Formación y certificados · {totalTrainingHours} horas registradas</h2><p className="mt-1 text-xs text-slate-600">Horas de cursos y asistencias; no equivalen a horas programando ni experiencia laboral.</p>
     <ul className="mt-2 space-y-1 text-xs leading-5">{certifications.map(x=><li key={x.id}><strong>{x.title}</strong> — {x.issuer}, {x.hours} h ({x.credentialType==="Course completion"?"curso completado":"constancia de asistencia"})</li>)}</ul>
    </section>
    <section><h2 className={heading}>Investigación adicional</h2><p className="mt-2 text-sm leading-6"><strong>Nexus Foundation:</strong> laboratorio privado y experimental en Python/PyTorch para explorar tokenización BPE y Transformers pequeños; sin afirmar capacidad conversacional fiable ni experiencia comercial de ML.</p></section>
    <section><h2 className={heading}>Idiomas</h2><p className="mt-2 text-sm">Español nativo · Inglés intermedio (autodescripción pendiente de evaluación formal).</p></section>
    <footer className="mt-6 border-t border-slate-300 pt-3 text-xs text-slate-600">El contacto por email y LinkedIn se añadirá al verificar sus enlaces. Información respaldada por proyectos y certificados documentados.</footer>
   </article>
  </div>
 </main>;
}
