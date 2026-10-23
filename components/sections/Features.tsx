import { features } from "../../data/features";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="Project Features"
          title="Useful features, clearly scoped."
          description="Nexus AI is being built incrementally. These are the account and workspace capabilities being implemented; AI functionality remains on the roadmap until it is connected and tested."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <h3 className="text-2xl font-semibold">{feature.title}</h3>
              <p className="mt-4 leading-7 text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
