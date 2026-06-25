import { roadmap } from "../../data/roadmap";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function Roadmap() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="Roadmap"
          title="A professional development plan."
          description="Nexus AI is being built step by step with a clear roadmap focused on real full stack development skills."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {roadmap.map((item) => (
            <Card key={item.phase}>
              <p className="mb-4 text-sm font-semibold text-cyan-400">
                {item.phase}
              </p>

              <h3 className="text-2xl font-semibold">{item.title}</h3>

              <p className="mt-4 text-gray-400">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}