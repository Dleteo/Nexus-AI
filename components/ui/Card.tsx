import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-[#EADBD0] bg-[#FFFCF8] shadow-[0_12px_36px_-25px_rgba(73,45,30,.25)] transition duration-300 hover:border-[#D8AC93]",
      className || ""
    )}>
      {children}
    </div>
  );
}
