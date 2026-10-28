# Nexus Software Factory — local deterministic pipeline

Nexus Software Factory is an **offline-first, local-only prototype** demonstrating a controlled software delivery process. It is **not a coding AI agent** and does **not** claim to use an LLM. It never modifies repositories, invokes shell commands, executes user-provided code or contacts an external provider.

## Real workflow

1. **Proposal:** Write a request (10–500 characters) and choose feature/bug/refactor. It creates an auditable job and a fixed static-page implementation plan.
2. **Review:** Inspect the plan and click an explicit approval checkbox. A separate action records approval before any artifact can be generated.
3. **Generation:** Click **Generate and run static QA**. The Python backend constructs a small `index.html` and `styles.css` from fixed templates, plus a README and QA results. Input is HTML-escaped.
4. **Quality checks:** Six deterministic assertions verify fixed filenames, heading content, local stylesheet, absence of script tags, bounded output and escaped text. These are **static validation checks**, not tests of generated executable code.
5. **Artifact:** Download a ZIP with `index.html`, `styles.css`, `README.md`, and `qa-results.json`. Job status and ordered audit events persist in local SQLite.

SQLite enforces workflow transitions and ensures that concurrent requests cannot both complete the same build. Retains at most 40 jobs and lists the most recent 20.

## Local setup

Install Python 3, Node.js and the repository's NPM dependencies. In `.env.local` add:

```ini
NEXUS_LABS_FACTORY=1
```

Run `npm run dev`, open `http://localhost:3000/labs?lab=factory`, then choose **Use local Factory**. SQLite data lives under `.nexus-local/factory.sqlite3`, ignored by Git. Set `NEXUS_FACTORY_DB` to select another local file. The public/browser-only rule-based planning demo remains available without Python.

**Security:** `/api/labs/factory` is disabled in production and rejects non-loopback Host headers. The only allowed output files are fixed, with no path traversal. POST requires JSON and rejects foreign origins. The generated ZIP is never executed and is stored in a local SQLite BLOB, not in the repository. **Do not make this unauthenticated dev endpoint public.**

## Tests

```sh
python -m unittest discover -s labs/factory -p "test_*.py" -v
```

GitHub Actions also starts one Next.js dev server with disposable local databases for all four Labs, exercises the real HTTP endpoint, checks human approval, ZIP download and input escaping, and verifies that the Factory route is locked out of production.

## Deliberate limitations / next stages

The workflow currently supports **one fixed static landing-page template** regardless of feature/bug/refactor label. No dynamic planning intelligence, agent orchestration, code-writing model, GitHub PRs, sandboxed execution of generated code, actual unit tests of generated apps, continuous integration on generated projects or external deployments. Possible future steps: patch/diff preview, a disposable worktree, allowlisted test commands in a strict subprocess sandbox, optional user-installed local Ollama and a human-approved GitHub PR integration.
