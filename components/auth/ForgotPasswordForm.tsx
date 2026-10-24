"use client";

import { useState, type FormEvent } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);
    setBusy(true);
    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "We could not process that request. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not connect to the account service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div>
        <label htmlFor="recovery-email" className="mb-2 block text-sm text-[#E6E1D8]">Email</label>
        <input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="nexus-field" />
      </div>

      {error && <p role="alert" className="rounded-xl border border-[#8D5456] bg-[#3C2628] px-4 py-3 text-sm text-[#FFB0A9]">{error}</p>}
      {sent && <p role="status" className="rounded-xl border border-[#496F55] bg-[#1B3828] px-4 py-3 text-sm leading-6 text-[#A7D8B2]">If an account matches that email, a recovery link will be sent. Check your inbox and spam folder.</p>}

      <button type="submit" disabled={busy} className="nexus-primary-button w-full disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Sending…" : "Send recovery link"}</button>
    </form>
  );
}
