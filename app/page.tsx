import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import Features from "../components/sections/Features";
import FinalCTA from "../components/sections/FinalCTA";
import Hero from "../components/sections/Hero";
import Process from "../components/sections/Process";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="top" className="min-h-screen">
        <Hero />
        <Features />
        <Process />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
