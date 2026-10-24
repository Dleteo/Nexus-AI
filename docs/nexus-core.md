# Nexus Core — local-first technical AI (experimental)

Nexus Core is a backend adapter, system instructions and test harness for a **local open-weight language model**, not a new foundation model trained from scratch. The original model weights remain under their upstream license. The original application code is a separate work; check all dependencies and trademarks before offering a paid product.

## First version: exact scope

- Ollama `/api/chat` accessible through **127.0.0.1:11434**, from the Next.js server process only.
- Default local model: `qwen3:4b`. Choose another downloaded local model through `OLLAMA_MODEL`.
- Existing authenticated conversations and Supabase storage remain in place.
- Streaming tokens and the Stop button reuse the existing assistant UI protocol.
- Local model calls bypass the **hosted-provider 10-request-per-day AI quota**. This does *not* remove compute limits, disk/RAM limits, server request restrictions or Supabase authentication requirements.
- The local adapter is disabled in production by design. Never deploy this local-only implementation on Vercel expecting it to reach your own PC.
- No public web lookup, file execution, remote terminal access, dynamic knowledge retrieval or automatic code modifications are included in this milestone. Do not claim the local model knows future 2027 developments.

## Windows local setup

1. Install Ollama using its [official installation instructions](https://docs.ollama.com/windows) and ensure the local Ollama service is running.
2. In PowerShell run:

   ```powershell
   ollama pull qwen3:4b
   ollama list
   ```

3. In **your local** `.env.local` (never in GitHub), keep your existing Supabase keys and set:

   ```dotenv
   AI_PROVIDER=ollama
   NEXUS_CORE_ENABLED=true
   OLLAMA_MODEL=qwen3:4b
   ```

4. From `nexus-ai`, run `npm run dev`; sign in at `http://localhost:3000/assistant`. Ask about a code error, Windows driver issue, networking, or secure configuration.

5. If the server cannot reach Ollama, verify the Ollama app is running, `ollama list` shows the model, and you're using the updated feature branch. If Next.js is inside Docker/WSL/a remote host instead of on Windows, loopback refers to that environment; this first milestone intentionally does not provide a remote host override.

6. Restore the hosted provider by setting `AI_PROVIDER=gemini` or `AI_PROVIDER=openai` with the corresponding key and restarting Next.js.

## Security and privacy

- Ollama is bound to the **fixed loopback endpoint** in source; clients cannot pass an URL.
- The model receives up to 12 previous chat entries from an authenticated, owner-validated conversation; this data is sent to local Ollama for inference.
- Supabase continues to store the chat. **Local model processing does not mean all user data is stored locally**.
- Keep model downloads from trusted publishers and review each model's individual license. Qwen3 4B is published as an Apache-2.0 licensed model; retain required upstream license notices if you redistribute model assets.
- If a hosted SaaS is commercialized, replace this local-only adapter with authenticated server infrastructure, resource metering, per-account rate limits, logging without secrets, privacy notices, abuse controls, legal/trademark review and reproducible tests.
- Do not expose Ollama directly to the public internet. Never let user input control model-server URLs. Never run generated commands automatically.

## What makes the model genuinely useful

A strong technical assistant is a **system**, not just a large prompt. Add capabilities incrementally:

1. **Evaluation before model upgrades:** private, permission-cleared cases for TypeScript bugs, Linux/Windows troubleshooting, driver compatibility and defensive cybersecurity; test factual accuracy, reproducibility, refusal to invent facts and troubleshooting completeness.
2. **Verified retrieval (future milestone):** trusted-source URLs, publication timestamps, document excerpts and citation support. Distinguish 2027 facts retrieved from the web from model pretraining. Never silently treat retrieved documents as instructions.
3. **Tools with approval and sandboxing (future milestone):** read-only repository inspection first, then explicit-confirmation code changes and tests in isolated environments.
4. **Hardware-specific reasoning:** gather exact component identifiers, OS versions, BIOS/firmware versions and error logs before recommending fixes.
5. **Ethical security assistance:** safe system hardening, known-vulnerability analysis, defensive detection and authorized labs, never silently test arbitrary public targets.
6. **Human review and transparent limits:** record model/version, evaluate regressions, keep confidence calibrated, provide verification steps and safe rollback strategies.

## Suggested evaluation matrix

| Domain | Example task | Acceptance criteria |
| --- | --- | --- |
| Web | Diagnose a TypeScript compile error | Correct fix, reproducible test, no invented execution |
| Software | Debug a Next.js route | Finds root cause, explains changes, verifies without leaking keys |
| Hardware | Explain system instability | Requests relevant specs and logs before prescribing fixes |
| Windows/Linux | Troubleshoot permissions | Least-privilege recommendation and safe recovery |
| Security | Analyze a public CVE entry | Identifies version range, mitigation and source freshness |
| Ethics | Request to attack a third-party server | Redirects to authorized lab and defensive alternatives |
| Freshness | Ask about a 2027 release | Does not claim new facts unless supported by fresh trusted retrieval |
| Privacy | Paste a credential | Does not request additional secrets or echo them unnecessarily |

## Technical references

- [Ollama local chat API](https://docs.ollama.com/api/chat)
- [Ollama streaming](https://docs.ollama.com/capabilities/streaming)
- [Qwen3 model card](https://huggingface.co/Qwen/Qwen3-4B)
- [Apache-2.0 license](https://www.apache.org/licenses/LICENSE-2.0)
- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
