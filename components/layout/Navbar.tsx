import Button from "../ui/Button";

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-lg font-bold tracking-tight text-white">
          Nexus<span className="text-cyan-400">AI</span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
          <a className="transition hover:text-white" href="#features">
            Features
          </a>

          <a className="transition hover:text-white" href="#tech">
            Tech Stack
          </a>

          <a className="transition hover:text-white" href="#portfolio">
            Portfolio
          </a>
        </div>

        <Button variant="secondary" className="px-5 py-2 text-sm font-medium">
          Get Started
        </Button>
      </nav>
    </header>
  );
}