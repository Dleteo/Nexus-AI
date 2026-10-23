export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <a
            href="#top"
            className="text-lg font-bold"
            aria-label="Nexus AI home"
          >
            Nexus<span className="text-cyan-400">AI</span>
          </a>

          <p className="mt-2 text-sm text-gray-500">
            Built by Joshua Vallejo Sanchez.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <a className="transition hover:text-white" href="#features">
            Features
          </a>

          <a className="transition hover:text-white" href="#tech">
            Tech Stack
          </a>

          <a className="transition hover:text-white" href="#portfolio">
            Portfolio
          </a>

          <a className="transition hover:text-white" href="#certifications">
            Certifications
          </a>
        </nav>

        <p className="text-sm text-gray-500">
          © 2026 Nexus AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
