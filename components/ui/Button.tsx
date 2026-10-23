import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  href?: string;
};

export default function Button({ children, variant = "primary", className, href }: ButtonProps) {
  const baseClasses = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9D4E35]";
  const variantClasses = variant === "primary"
    ? "border border-[#171717] bg-[#171717] text-white shadow-[0_8px_22px_-14px_rgba(23,23,23,.5)] hover:bg-[#39302C] hover:-translate-y-px"
    : "border border-[#E2CCBC] bg-[#FFFCF8] text-[#302923] hover:border-[#D8AC93] hover:bg-[#FCE7DA]";
  const classes = cn(baseClasses, variantClasses, className || "");
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes}>{children}</button>;
}
