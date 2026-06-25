import { stats } from "../../data/Stats";
import Card from "../ui/Card";

export default function StatsSection() {
  return (
    <section className="bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <p className="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent">
                {stat.value}
              </p>

              <p className="mt-3 text-sm uppercase tracking-[0.25em] text-gray-400">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}