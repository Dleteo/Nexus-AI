import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function Portfolio() {
  return (
    <section id="portfolio" className="bg-black px-6 py-24 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <SectionHeader
            label="Developer Portfolio"
            title="Built by Joshua Vallejo Sanchez."
            description="I am a Junior Full Stack Developer focused on building modern, clean and scalable web applications. Nexus AI is my flagship project designed to demonstrate real-world skills in frontend, backend, databases, artificial intelligence and deployment."
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300">
              Full Stack Development
            </span>

            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300">
              Artificial Intelligence
            </span>

            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300">
              Software Engineering
            </span>
          </div>
        </div>

        <Card>
          <h3 className="text-2xl font-semibold">Project Goals</h3>

          <ul className="mt-6 space-y-4 text-gray-400">
            <li>✓ Build a professional full stack application</li>
            <li>✓ Create a clean portfolio for job applications</li>
            <li>✓ Prepare for technical interviews</li>
            <li>✓ Learn modern AI development tools</li>
            <li>✓ Deploy a real production-ready project</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}