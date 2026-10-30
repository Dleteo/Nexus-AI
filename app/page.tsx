import type { Metadata } from "next";
import EditorialPortfolio from "../components/career/EditorialPortfolio";

export const metadata: Metadata = {
  title: "Joshua Vallejo Sanchez | Junior Web Developer & AI Projects",
  description: "Developer portfolio featuring documented projects, 94 hours of training, certificates, a resume and Nexus AI.",
};

export default function Home() {
  return <EditorialPortfolio language="en" />;
}
