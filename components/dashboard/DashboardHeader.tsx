import Button from "../ui/Button";

export default function DashboardHeader() {
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div>
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-400">
          Dashboard
        </p>

        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Welcome to Nexus AI.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-gray-400">
          This is the private control center where Nexus AI will manage AI
          tools, user activity, smart summaries and future admin features.
        </p>
      </div>

      <Button>New Project</Button>
    </div>
  );
}