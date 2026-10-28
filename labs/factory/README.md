# Nexus Software Factory — local deterministic pipeline

Nexus Software Factory is an **offline-first, local-only prototype** demonstrating a controlled software delivery process. It is **not a coding AI agent** and does **not** claim to use an LLM. It never modifies repositories, invokes shell commands, executes user-provided code or contacts an external provider.

## Real workflow

1. **Proposal:** Write a request (10–500 characters) and choose feature/bug/refactor. It creates an auditable job and a fixed static-page implementation plan.
2. **Review:** Inspect the plan and click an explicit approval checkbox. A separate action records approval before any artifact can be generated.
3. **Source review:** Click **Preview generated source** to inspect the fixed HTML/CSS/README and SHA-256 hashes before approving. The UI keeps the approval action disabled until the source preview is loaded. The API still requires explicit approval but does not maintain a server-side proof that a human inspected the source.
4. **Generation:** Click **Generate and run static QA**. The Python backend constructs a small `index.html` and `styles.css` from fixed templates, plus a README, QA results and SHA-256 manifest. Input is HTML-escaped.
5. **Quality checks:** Six deterministic assertions verify fixed filenames, heading content, local stylesheet, absence of script tags, bounded output and escaped text. These are **static validation checks**, not tests of generated executable code.
6. **Artifact:** Download a ZIP with `index.html`, `styles.css`, `README.md`, and `qa-results.json`, and `manifest.json`. A ZIP is verified against its manifest again before download. SHA-256 protects against accidental corruption but is **not** a signature or proof that the code is safe. Job status and ordered audit events persist in local SQLite.

SQLite enforces workflow transitions and ensures that concurrent requests cannot both complete the same build. Retains at most 40 jobs and lists the most recent 20.

The source preview also returns the digest, file count and byte size of an immutable in-memory snapshot of those three displayed files. It does not include QA/manifest files, write a workspace or run its contents. Jobs and previews report `execution.enabled=false` and `execution.status=not_run`, even after static QA passes. The interface discloses this distinction in ES/EN/DE/FR/PT. No execution action, runtime or provider has been enabled; see the [P1 preparation and remaining isolation requirements](../../docs/FACTORY_SANDBOX_P1.md).

## Local setup

Install Python 3, Node.js and the repository's NPM dependencies. In `.env.local` add:

```ini
NEXUS_LABS_FACTORY=1
```

Run `npm run dev -- --hostname 127.0.0.1`, open `http://127.0.0.1:3000/labs?lab=factory`, then choose **Use local Factory**. SQLite data lives under `.nexus-local/factory.sqlite3`, ignored by Git. Set `NEXUS_FACTORY_DB` to select another local file. The public/browser-only rule-based planning demo remains available without Python.

**Security:** `/api/labs/factory` is disabled in production and rejects non-loopback Host headers. The only allowed output files are fixed, with no path traversal. POST requires JSON and rejects foreign origins. The generated ZIP is never executed and is stored in a local SQLite BLOB, not in the repository. **Do not make this unauthenticated dev endpoint public.**

Host validation does not establish that the network peer is local. Bind Next.js to `127.0.0.1`; do not expose it through a public listener, port forward or reverse proxy.

ZIP download requires the exact ordered filename allowlist, regular files, supported stored/deflate compression, bounded compressed and uncompressed sizes, valid CRCs and an unambiguous SHA-256 manifest. Symlinks, special files, duplicate members and traversal paths are rejected. The backend also reproduces the fixed template from the stored job and compares every file before download, so rewriting a file **and** its manifest does not pass this check. This comparison is not a signature and cannot protect against an attacker who controls the process or the job database itself.

**Legacy ZIP policy:** old artifacts without `manifest.json` are deliberately rejected with `artifact-integrity-failed` (HTTP 422). No silent upgrade, extraction or execution occurs; the existing job and its audit history remain intact. Create a new proposal, review it and approve a fresh build to obtain a current ZIP. Template changes may likewise require a freshly reviewed build instead of accepting an obsolete artifact.

## Tests

```sh
python -m unittest discover -s labs/factory -p "test_*.py" -v
```

GitHub Actions also starts one Next.js dev server with disposable local databases for all four Labs, exercises the real HTTP endpoint, checks human approval, source preview, ZIP download, file integrity and input escaping, and verifies that the Factory route is locked out of production.

## Deliberate limitations / next stages

The workflow currently supports **one fixed static landing-page template** regardless of feature/bug/refactor label. No dynamic planning intelligence, agent orchestration, code-writing model, GitHub PRs, sandboxed execution of generated code, actual unit tests of generated apps, continuous integration on generated projects or external deployments. Possible future steps: patch/diff preview, a disposable worktree, allowlisted test commands in a strict subprocess sandbox, optional user-installed local Ollama and a human-approved GitHub PR integration.

## Security limitations for future Codex work

The local source preview and ZIP use a deterministic allowlisted template. No generated JavaScript runs. The manifest is not signed and should not be interpreted as supply-chain attestation. Production builds return HTTP 503 for all Factory routes. Before ever supporting autonomous patches, repository code, executable generators or third-party users, introduce a sandbox with filesystem and network isolation, resource limits, strict allowlisted commands, reviewable diffs and a separate approval boundary. See [`docs/CODEX_NEXT_PHASE.md`](../../docs/CODEX_NEXT_PHASE.md).
