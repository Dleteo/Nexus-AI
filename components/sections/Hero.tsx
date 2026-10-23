import Button from "../ui/Button";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen scroll-mt-20 items-center justify-center overflow-hidden bg-black px-6 pt-24 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e3a8a55,transparent_35%),radial-gradient(circle_at_bottom_right,#9333ea44,transparent_35%)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="relative z-10 max-w-5xl text-center">
        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur">
          Junior Web Developer Portfolio · AI-powered product concept
        </div>

        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-400">
          Nexus AI
        </p>

        <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
          Building the web,
          <br />
          <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            with purpose.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400 md:text-xl">
          A hands-on portfolio project focused on modern React and Next.js,
          reusable UI, secure authentication, and database-backed features.
          Built step by step and validated with automated checks.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/register">Explore the app</Button>
          <Button variant="secondary" href="#portfolio">
            Meet the developer
          </Button>
        </div>

        <p className="mt-5 text-xs leading-5 text-gray-500">
          Account features require the Supabase setup documented in the repository.
        </p>
      </div>
    </section>
  );
}
