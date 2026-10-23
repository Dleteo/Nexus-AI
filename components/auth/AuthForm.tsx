"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = { mode: "login" | "register"; showPasswordResetNotice?: boolean };

export default function AuthForm({ mode, showPasswordResetNotice = false }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const params = new URLSearchParams(window.location.search);
      const requestedPath = params.get("next");
      const destination =
        requestedPath?.startsWith("/") &&
        !requestedPath.startsWith("//") &&
        !requestedPath.includes("\\")
          ? requestedPath
          : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Could not connect to the account service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isRegister && (
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-[#40342E]">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className="nexus-field" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-[#40342E]">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="nexus-field" />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="password" className="block text-sm text-[#40342E]">Password</label>
          {!isRegister && (
            <Link href="/forgot-password" className="text-xs text-[#AD5637] transition hover:text-[#302923]">
              Forgot password?
            </Link>
          )}
        </div>
        <div className="flex rounded-xl border border-[#E9D9CC] bg-[#FFFCF9] transition focus-within:border-[#CE8F70]">
          <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 10 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? "At least 10 characters" : "Your password"} className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-[#302923] outline-none placeholder:text-[#756155]" />
          <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="shrink-0 px-4 text-xs font-semibold text-[#756155] transition hover:text-[#AD5637] focus-visible:outline-2 focus-visible:outline-[#9D4E35]">
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {isRegister && <p className="mt-2 text-xs text-[#756155]">Use at least 10 characters.</p>}
      </div>

      {showPasswordResetNotice && !isRegister && <p role="status" className="rounded-xl border border-[#B6D7BD] bg-[#E6F3E8] px-4 py-3 text-sm text-[#3D7654]">Password updated successfully. Sign in with your new password.</p>}
      {error && <p role="alert" className="rounded-xl border border-[#EEB8B0] bg-[#FCE8E6] px-4 py-3 text-sm text-[#A93636]">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-[#B6D7BD] bg-[#E6F3E8] px-4 py-3 text-sm text-[#3D7654]">{notice}</p>}

      <button type="submit" disabled={busy} className="nexus-primary-button w-full disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
