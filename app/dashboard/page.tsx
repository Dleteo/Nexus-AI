import DashboardApp from "../../components/dashboard/DashboardApp";
import { readSession } from "../../lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await readSession();
  if (!session) redirect("/login?next=%2Fdashboard");
  return <DashboardApp />;
}
