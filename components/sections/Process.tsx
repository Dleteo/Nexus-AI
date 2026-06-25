import { processSteps } from "../../data/process";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function Process() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          centered
          label="Process"
          title="Built with a professional workflow."
          description="Nexus AI follows a clear software development process: plan, design, build, test and deploy."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((item) => (
            <Card key={item.step} className="text-center">
              <p className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40 text-sm font-bold text-cyan-400">
                {item.step}
              </p>

              <h3 className="text-xl font-semibold">{item.title}</h3>

              <p className="mt-4 text-sm leading-6 text-gray-400">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}