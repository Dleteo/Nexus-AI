import type { Metadata } from "next";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import Portfolio from "../../components/sections/Portfolio";
import Certifications from "../../components/sections/Certifications";

export const metadata: Metadata = {
  title: "Developer Portfolio | Nexus AI",
  description:
    "Meet the developer behind Nexus AI. Explore the project case study, technical work and learning certificates in one dedicated portfolio.",
};

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Portfolio />
        <Certifications />
      </main>
      <Footer />
    </>
  );
}
