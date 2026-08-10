import { dashboardCards } from "../../data/dashboard";
import Card from "../ui/Card";

export default function DashboardCardGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {dashboardCards.map((card) => (
        <Card key={card.title}>
          <h2 className="text-xl font-semibold">{card.title}</h2>

          <p className="mt-3 text-gray-400">{card.description}</p>
        </Card>
      ))}
    </div>
  );
}