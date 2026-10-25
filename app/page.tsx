import type { Metadata } from "next";
import CommandCenter from "../components/holographic/CommandCenter";

export const metadata: Metadata = {
  title: "Nexus AI | Interactive Intelligence Command Center",
  description: "Explore Josh's developer portfolio, study programming, solve technical problems, prepare interviews and read verified tech news with Nexus AI.",
};

export default function Home() {
  return <CommandCenter />;
}
