# Nexus AI — anime avatar: production art and integration contract

**Target:** a high-fidelity adult-proportioned anime heroine (not chibi), acting as the visual host for the existing Nexus AI application.

## Approved art direction

- Distinctive **original** female character, anime facial design and anatomy, adult proportions (roughly 7–8 heads tall); no oversized chibi head, baby proportions, or low-poly toy silhouette.
- Premium game-character finish: clean hair silhouette, expressive detailed eyes, layered futuristic clothing, deliberate materials and restrained cyan/violet accents.
- The face is the storytelling focus. Keep features legible at mobile resolutions. No copied character likeness, franchise costume or unlicensed textures.
- Clear neutral idle pose, readable full/three-quarter body and sufficient separation from interactive UI.
- Deliver separate desktop/tablet/mobile camera compositions; prioritize face and upper torso on mobile.

## 3D asset acceptance gate

The current hand-built WebGL geometric mannequin **does not meet** this brief and must not be described as the final anime model.

Production avatar must be a **genuine rigged VRM or glTF/GLB file** with:
1. Mesh, textures, materials, humanoid skeleton and documented redistribution/commercial rights.
2. Expression or morph targets for blinking, happy/neutral, speaking mouth (at least jawOpen or equivalent visemes).
3. Eye/head look-at and arms/hand bones accessible via runtime.
4. Optimized texture sizes and LOD, predictable memory use; browser performance tests at desktop, tablet and phone widths.
5. Original attribution/licensing notes and the model's own embedded VRM restrictions checked before being added to **public** assets.

No third-party model should be committed without confirming commercial permission, avatar performance permission and redistribution rights. See official [VRoid use guidelines](https://vroid.com/en/studio/guidelines) and [VRM license metadata](https://vrm.dev/en/vrm/meta/license/).

## Runtime behavior and truthful UX

1. **Idle:** breathing, natural blinking, subtle body-weight shift and gentle hand movement. Pause continuous animation for reduced-motion users.
2. **Pointer:** damped neck/eye orientation and a gesture when a panel is focused; don't require hover for tablet/mobile.
3. **Navigation:** holographic skill portals independent of background textures; they can be operated by keyboard and touch.
4. **Speech:** TTS with start/end events already used by Nexus Companion; mouth opens while narration plays. True phoneme-accurate synchronization requires time-aligned visemes, not the current speaking boolean.
5. **Language:** greeting respects saved language preference, consent for microphone, and available on-device/browser voices.
6. **Fallback:** if model fails, keep actions usable and show an accessible static/no-WebGL alternative instead of a broken page.
7. **Security:** do not expose API keys or server prompts to client, preserve authentication, quotas, and the existing protected API.

## Delivery milestones

- **Gate A:** obtain or author a correctly licensed adult-anime rigged model and verify its embedded meta/licence and facial rigs.
- **Gate B:** load it in a separately tested viewer; eyes, breathing, head movement, arms, mouth and first-visit language selection working with the existing app.
- **Gate C:** replace the temporary geometric mannequin; responsive camera compositions and stable interaction on desktop/tablet/mobile.
- **Gate D:** assess premium voice engines and prices only after user approval; never activate paid inference or voice service by default.
- **Gate E:** lint, typecheck, production build, functional browser QA, mobile GPU fallback, performance audit, security review; merge only when green.

The Nexus AI assistant, CV, public creator info, interview coach, news feed, authenticated chats and their access controls remain in place. Nexus Foundation research remains separate.


## Chosen visual identity — reference #8 (25 October 2026)

The user selected **the last of the eight original generated illustrations** as the official **visual reference**, not a 3D deliverable. Working title: **Nexus — Guardiana AI**.

- Adult-proportioned, high-fidelity anime heroine; **never chibi**.
- Long flowing pale-silver hair, expressive eyes and a gentle confident expression.
- Elegant futuristic white/navy attire with gold filigree, luminous blue accents and layered translucent fabrics; refined and non-revealing game-character presentation.
- Blue/gold holographic interfaces around her with floating globe/data and subtle energy ornaments, celestial science-fiction chamber.
- Target visual standard: premium stylized anime game character; polished face, hairstyle and garments are higher priority than crowded surrounding UI.
- On production pages: clean readable holographic controls independent of the model, not baked into an image.
- Motion concept: soft idle breathing, blinking and eye tracking, flowing hair and fabric simulation subject to mobile performance budget, hand-cast panel activation, clear facial speaking expressions, warm feminine voice in selected language.

**Critical distinction:** The original reference is 2D artwork generated during the chat. It is not an existing commercial-ready VRM mesh or a working animation file. No exact identical 3D reconstruction or rig can be claimed until a model has been created, inspected and actually loaded. Do not substitute the earlier rudimentary procedural robot.

### Acceptance test before swapping homepage
A licensed/custom-created VRM/GLB must visually match this art direction and demonstrate on video or in browser: 3/4 body, face close-up, natural blink, look-at, conversational gesture, voice-synchronized mouth movement and touchscreen-compatible controls. Keep a visual approval gate before activating publicly.
