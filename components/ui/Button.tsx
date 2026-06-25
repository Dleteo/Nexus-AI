import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  const baseClasses =
    "rounded-full px-8 py-3 font-semibold transition";

  const variantClasses =
    variant === "primary"
      ? "bg-white text-black hover:bg-gray-200"
      : "border border-white/20 text-white hover:bg-white/10";

  return (
    <button className={cn(baseClasses, variantClasses, className || "")}>
      {children}
    </button>
  );
}