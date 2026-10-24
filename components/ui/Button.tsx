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
  const baseClasses = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9B77B]";
  const variantClasses = variant === "primary"
    ? "border border-[#D9B77B] bg-[#D9B77B] text-[#191713] shadow-[0_8px_22px_-14px_rgba(23,23,23,.5)] hover:bg-[#D9B77B] hover:-translate-y-px"
    : "border border-[#4B463D] bg-[#1D1E20] text-[#F4F1EB] hover:border-[#4B463D] hover:bg-[#34322F]";
  const classes = cn(baseClasses, variantClasses, className || "");
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes}>{children}</button>;
}
