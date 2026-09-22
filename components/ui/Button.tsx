import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  href?: string;
};

export default function Button({
  children,
  variant = "primary",
  className,
  href,
}: ButtonProps) {
  const baseClasses = "rounded-full px-8 py-3 font-semibold transition";

  const variantClasses =
    variant === "primary"
      ? "bg-white text-black hover:bg-gray-200"
      : "border border-white/20 text-white hover:bg-white/10";

  const classes = cn(baseClasses, variantClasses, className || "");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}