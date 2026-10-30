# Portfolio evidence and companion refresh

- Six original certificate images now have a visible gallery, topic filters, native modal enlargement, existing Udemy verification links and the localized CV link. No certificate or credential was invented.
- Training remains **94 hours**, calculated from the six certificate records. The owner reported **4 calendar days completed** and proposed **6 days for the stage**. The UI shows 4 completed + 2 planned, never 144 working hours and never added to accredited training.
- Twelve skill cards distinguish presence across the five featured projects from provisional familiarity inferred from AI-assisted work. The 1–5 familiarity scale is introductory exposure, guided practice, independent work, advanced, expert. Current provisional scores are 1–2; they are not a validated independent skills assessment. `data/professional-development.ts` records these assumptions.
- The process now covers discovery, scope, implementation, verification, review and documented handoff.
- Contact retains its real public email and profiles; includes copy feedback and validates an entered reply email before opening the visitor's email app. No messages are sent automatically.
- The floating concierge has a local guide and a separate AI mode using the existing authenticated portfolio conversation/chat APIs. It creates a conversation only after an authenticated user sends a question. No provider configuration or server permissions changed. No live inference is asserted by tests with simulated responses.
- The owner requested removal of the baby executive. Its SVG, pointer tracking, animation and controls have been removed. The floating chat now uses the portfolio’s black/red palette, outlined N mark and compact rectangular controls.

Checks: lint, TypeScript, production build, certificate/filter/modal/browser flows, guide replies, sign-in gate, simulated authenticated chat scope, responsive widths and reduced motion. Existing full CI remains the acceptance check for the final commit. No merge or deployment is part of this change.
