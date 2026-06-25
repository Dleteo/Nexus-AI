import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-cyan-400/40 hover:bg-white/[0.06]",
        className || ""
      )}
    >
      {children}
    </div>
  );
}