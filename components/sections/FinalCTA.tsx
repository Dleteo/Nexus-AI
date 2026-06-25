import Button from "../ui/Button";

export default function FinalCTA() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center md:p-16">
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-400">
          Ready to build
        </p>

        <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
          Nexus AI is more than a project.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          It is a professional full stack portfolio designed to demonstrate
          real-world skills, clean architecture, AI integration and job-ready
          development experience.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button>View Project</Button>

          <Button variant="secondary">Contact Developer</Button>
        </div>
      </div>
    </section>
  );
}