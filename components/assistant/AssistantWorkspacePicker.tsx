"use client";

import type { AssistantScope } from "../../lib/assistant-scopes";

type Props = {
  active: AssistantScope;
  disabled?: boolean;
  onSelect: (scope: AssistantScope) => void;
};

const options = [
  {
    id: "portfolio",
    label: "Mi portafolio",
    short: "Proyectos, CV y entrevistas",
    symbol: "P",
  },
  {
    id: "technical",
    label: "Asistente técnico",
    short: "Hardware, software y seguridad",
    symbol: "T",
  },
] as const;

/** One shared navigation, two clearly separated responsibilities. */
export default function AssistantWorkspacePicker({ active, disabled = false, onSelect }: Props) {
  return (
    <div role="group" aria-label="Choose AI workspace" className="mt-5 grid grid-cols-2 gap-2">
      {options.map((option) => {
        const selected = active === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(option.id)}
            className={[
              "group min-w-0 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2",
              "focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "border-sky-400/80 bg-sky-400/10 text-sky-100"
                : "border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70",
            ].join(" ")}
          >
            <span
              className={[
                "mb-2 grid size-8 place-items-center rounded-lg text-sm font-bold",
                selected ? "bg-sky-400 text-slate-950" : "bg-slate-800 text-slate-300",
              ].join(" ")}
              aria-hidden="true"
            >
              {option.symbol}
            </span>
            <span className="block text-xs font-semibold leading-5">{option.label}</span>
            <span className="mt-1 block text-[10px] leading-4 text-slate-400">{option.short}</span>
            {selected && <span className="mt-2 block text-[10px] font-semibold text-sky-300">● Activo</span>}
          </button>
        );
      })}
    </div>
  );
}
