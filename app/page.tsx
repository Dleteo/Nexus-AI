import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import Features from "../components/sections/Features";
import FinalCTA from "../components/sections/FinalCTA";
import Hero from "../components/sections/Hero";
import Portfolio from "../components/sections/Portfolio";
import Process from "../components/sections/Process";
import Roadmap from "../components/sections/Roadmap";
import StatsSection from "../components/sections/StatsSection";
import TechStack from "../components/sections/TechStack";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <StatsSection />
      <Features />
      <TechStack />
      <Roadmap />
      <Process />
      <Portfolio />
      <FinalCTA />
      <Footer />
    </main>
  );
}