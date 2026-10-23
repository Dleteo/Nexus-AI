"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token") ?? "";
    const tokenType = params.get("type");
    if (!accessToken || tokenType !== "recovery") {
      setError("This recovery link is invalid or expired. Request a new password reset email.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not update the password. Request a new recovery link.");
        return;
      }
      // Remove the temporary recovery token from the visible URL.
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace("/login?passwordReset=success");
    } catch {
      setError("Could not connect to the account service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div>
        <label htmlFor="new-password" className="mb-2 block text-sm text-[#40342E]">New password</label>
        <input id="new-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={10} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 10 characters" className="nexus-field" />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-2 block text-sm text-[#40342E]">Confirm new password</label>
        <input id="confirm-password" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={10} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repeat your new password" className="nexus-field" />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#756155]">
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} className="accent-cyan-400" />
        Show passwords
      </label>

      {error && <p role="alert" className="rounded-xl border border-[#EEB8B0] bg-[#FCE8E6] px-4 py-3 text-sm leading-6 text-[#A93636]">{error}</p>}

      <button type="submit" disabled={busy} className="nexus-primary-button w-full disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button>
    </form>
  );
}
