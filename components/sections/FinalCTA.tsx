import Button from "../ui/Button";

export default function FinalCTA() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center md:p-16">
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-400">
          Explore the work
        </p>

        <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
          Code you can explore.
          <br />
          Progress you can verify.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          Nexus AI is an evolving portfolio project. Review the source code,
          explore the learning record, and see the engineering work as it is
          built and tested.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="https://github.com/Dleteo/Nexus-AI">
            View source on GitHub
          </Button>
          <Button variant="secondary" href="#certifications">
            View certifications
          </Button>
        </div>
      </div>
    </section>
  );
}
