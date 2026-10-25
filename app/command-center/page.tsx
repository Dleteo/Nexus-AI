import type { Metadata } from "next";
import CommandCenter from "../../components/holographic/CommandCenter";

export const metadata: Metadata = {
  title: "Nexus Command Center | Interactive AI Portfolio",
  description: "Explore Nexus AI, the developer portfolio, verified projects, and experimental AI research in an interactive holographic command center.",
};

export default function CommandCenterPage() {
  return <CommandCenter />;
}
