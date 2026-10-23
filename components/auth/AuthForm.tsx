"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = { mode: "login" | "register" };

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json() as { error?: string; ok?: boolean; requiresEmailConfirmation?: boolean };
      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (isRegister && result.requiresEmailConfirmation) {
        setNotice("Account created. Check your email for the confirmation link, then sign in.");
        setPassword("");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect to the account service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {isRegister && (
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-gray-300">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-gray-300">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-gray-300">Password</label>
        <input id="password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 10 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? "At least 10 characters" : "Your password"} className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400" />
        {isRegister && <p className="mt-2 text-xs text-gray-500">Use at least 10 characters.</p>}
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

      <button type="submit" disabled={busy} className="w-full rounded-full bg-white px-8 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
