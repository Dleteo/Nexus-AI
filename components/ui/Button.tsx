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
  const baseClasses = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200";
  const variantClasses = variant === "primary"
    ? "border border-blue-300/25 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 text-white shadow-[0_8px_24px_-14px_rgba(70,128,255,.9)] hover:brightness-110 hover:-translate-y-px"
    : "border border-white/[0.12] bg-white/[0.025] text-slate-200 hover:border-cyan-200/25 hover:bg-cyan-200/[0.04]";
  const classes = cn(baseClasses, variantClasses, className || "");
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes}>{children}</button>;
}
