import type { ReactNode } from "react";

type AuthCardProps = {
  label: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthCard({
  label,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-400">
          {label}
        </p>

        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>

        <p className="mt-4 text-gray-400">{description}</p>

        <div className="mt-8">{children}</div>

        <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
      </div>
    </main>
  );
}