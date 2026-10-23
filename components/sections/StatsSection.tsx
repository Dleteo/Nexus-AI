const capabilities = [
  { value: "05", label: "Focused AI modes", detail: "Copilot to interview practice", accent: "text-cyan-200" },
  { value: "10/day", label: "AI request limit", detail: "Per signed-in user", accent: "text-blue-200" },
  { value: "RLS", label: "User-owned data", detail: "Postgres access policies", accent: "text-violet-200" },
  { value: "CI", label: "Verified changes", detail: "Audit, lint, types, build", accent: "text-emerald-200" },
];

export default function StatsSection() {
  return (
    <section className="relative px-5 py-5 sm:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a101b]/80 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((item, index) => (
          <div key={item.label} className={`relative flex items-center gap-4 px-5 py-5 sm:px-6 ${index > 0 ? "border-t border-white/[0.07] sm:border-l sm:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}>
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-sm font-bold tracking-tight ${item.accent}`}>{item.value}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </div>
            <span className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
