# Nexus Avatar Studio — realistic-proportioned anime 3D audition

This is an isolated **working model viewer**, not the shipped character and not an image-generation substitute. The main Nexus AI page and backend are not modified by this lab.

## Run on Windows PowerShell

```powershell
cd "C:\Users\gamej\OneDrive\Escritorio\nexus-ai"
git pull --ff-only
cd tools/avatar-studio
npm install
npm run dev
```

Open the **local URL printed by Vite** (normally http://127.0.0.1:5173).

### Load a licensed VRM anime character

1. Prepare a high-quality VRM avatar exported from VRoid Studio or a third-party creator whose **commercial use and redistribution rights** you have verified. Do not download an arbitrary avatar from the internet.
2. Check the checkbox acknowledging rights, then load the `.vrm` file using the local file picker. The file is loaded into browser memory (not uploaded to Nexus).
3. Test blinking, waving, gaze-following and browser voice in Spanish/English. Confirm facial expression support, full-body silhouette and reasonable performance.
4. If the character or mouth looks incorrect, fix/replace the rigged asset, not a screenshot.

> Some glTF/GLB files without VRM humanoid and facial metadata will be rejected. This is intentional.

## Boundaries and next stage

- Current mouth animation is an approximation while text-to-speech plays, **not phoneme-level lip synchronization**.
- Browser voices depend on the installed system voices; a production-quality expressive voice is a separate quality/cost decision.
- VRM loader, Three.js renderer, lighting, avatar rig state and gesture controls are ready for asset evaluation. A verified licensed **actual avatar file has not been added**.
- The current existing Nexus AI application, Supabase/Gemini endpoints, quotas and user flows remain untouched.
- For production integration, optimize material/texture quality and GPU usage, add a no-WebGL fallback, ensure keyboard/touch controls, and separately verify all CI and browser QA before replacing the homepage avatar.
