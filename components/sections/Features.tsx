import { features } from "../../data/features";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function Features() {
  return (
    <section id="features" className="relative bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="Features"
          title="Everything you need to build smarter."
          description="Nexus AI combines modern full stack architecture with artificial intelligence features designed for real-world applications."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <h3 className="text-2xl font-semibold">{feature.title}</h3>

              <p className="mt-4 text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}