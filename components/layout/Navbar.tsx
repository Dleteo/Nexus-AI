import Button from "../ui/Button";

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4"
      >
        <a
          href="#top"
          className="shrink-0 text-lg font-bold tracking-tight text-white"
          aria-label="Nexus AI home"
        >
          Nexus<span className="text-cyan-400">AI</span>
        </a>

        <div className="hidden items-center gap-6 text-sm text-gray-400 lg:flex">
          <a className="transition hover:text-white" href="#features">Features</a>
          <a className="transition hover:text-white" href="#tech">Tech Stack</a>
          <a className="transition hover:text-white" href="#portfolio">Portfolio</a>
          <a className="transition hover:text-white" href="#certifications">Certifications</a>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-300 transition hover:text-white sm:inline-flex"
          >
            Sign in
          </a>
          <Button
            className="px-4 py-2 text-sm font-medium sm:px-5"
            href="/register"
          >
            Get started
          </Button>
        </div>
      </nav>
    </header>
  );
}
