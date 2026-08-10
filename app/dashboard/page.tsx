import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const dashboardCards = [
  {
    title: "AI Assistant",
    description: "Chat interface for future AI-powered support and productivity tools.",
  },
  {
    title: "Smart Summaries",
    description: "Generate clean summaries from documents, notes and long content.",
  },
  {
    title: "Semantic Search",
    description: "Search information by meaning instead of only matching exact words.",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
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

        <div className="grid gap-6 md:grid-cols-3">
          {dashboardCards.map((card) => (
            <Card key={card.title}>
              <h2 className="text-xl font-semibold">{card.title}</h2>

              <p className="mt-3 text-gray-400">{card.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}