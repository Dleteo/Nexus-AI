import type { Metadata } from "next";
import CareerHome from "../components/career/CareerHome";

export const metadata: Metadata = {
  title: "Joshua Vallejo Sanchez | Junior Web Developer & AI Projects",
  description: "Portafolio profesional con proyectos verificables, 94 horas de formación documentada, certificados, currículum y Nexus AI.",
};

export default function Home() {
  return <CareerHome />;
}
