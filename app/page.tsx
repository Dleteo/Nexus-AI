import type { Metadata } from "next";
import EditorialPortfolio from "../components/career/EditorialPortfolio";

export const metadata: Metadata = {
  title: "Joshua Vallejo Sanchez | Junior Web Developer & AI Projects",
  description: "Portafolio profesional con proyectos verificables, 94 horas de formación documentada, certificados, currículum y Nexus AI.",
};

export default function Home() {
  return <EditorialPortfolio />;
}
