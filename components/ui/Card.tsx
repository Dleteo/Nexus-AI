import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#101a2b]/95 via-[#0c1321]/95 to-[#090e18] shadow-[0_24px_80px_-60px_rgba(67,145,255,.28)] transition duration-300 hover:border-cyan-200/20",
      className || ""
    )}>
      {children}
    </div>
  );
}
