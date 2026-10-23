import { redirect } from "next/navigation";
import { hasSessionCookie } from "../../lib/session";
import AssistantApp from "../../components/assistant/AssistantApp";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  if (!(await hasSessionCookie())) redirect("/login?next=%2Fassistant");
  return <AssistantApp />;
}
