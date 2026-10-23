import DashboardApp from "../../components/dashboard/DashboardApp";
import { hasSessionCookie } from "../../lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Only inspect cookie presence during server rendering. Token refresh writes cookies,
  // which are only permitted in Route Handlers, and the client validates the session.
  if (!(await hasSessionCookie())) redirect("/login?next=%2Fdashboard");
  return <DashboardApp />;
}
