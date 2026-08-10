import DashboardCardGrid from "../../components/dashboard/DashboardCardGrid";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />
        <DashboardCardGrid />
      </div>
    </main>
  );
}