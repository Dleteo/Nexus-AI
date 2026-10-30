# Portfolio assistant improvements — 2026-10-30

The public Guide and authenticated generative AI remain distinct. The Guide answers locally from public repository data and returns controlled evidence links. It now covers five featured projects, contextual questions about tests/limitations, CV, verified contact, experience, certificates and skills. It distinguishes 94 documented course hours from the owner's estimated 100 programming hours. Guide answers are not model inference.

The floating chat checks the existing authenticated readiness endpoint before creating an AI conversation. Configuration readiness does not verify live inference. Unavailable engines retain a usable Guide. Guide and AI transcripts are displayed separately, and New chat clears this panel without deleting saved account history.

Session identity is revalidated on opening and browser focus. AI history remains hidden during failed or pending identity checks, and account changes/session expiry clear the thread and local history. Requests use the portfolio scope and selected supported language. A pending response does not erase the next draft; failures retain the draft and show localized errors.

The portfolio model's system prompt now uses current public profile, project limits, certificates, estimated practice and provisional skills. No private repository contents, provider credentials, schema changes, new provider connections or live inference were introduced. Technical assistant grounding remains separate.

Validation: guide unit regressions; mocked floating-chat availability, draft and identity tests; actual Next.js chat API integration against isolated synthetic database/provider services; existing mobile, multilingual and browser checks. A synthetic provider response does not establish live model quality or connectivity.
