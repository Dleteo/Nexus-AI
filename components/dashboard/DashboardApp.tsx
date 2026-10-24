"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

type User = { id: string; email?: string; name?: string | null };
type Project = { id: string; name: string; description: string; status: "active" | "archived"; created_at: string };

export default function DashboardApp() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [projectQuery, setProjectQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [sessionResponse, projectsResponse] = await Promise.all([
        fetch("/api/auth/session", { cache: "no-store" }),
        fetch("/api/projects", { cache: "no-store" }),
      ]);
      const sessionData = await sessionResponse.json() as { user: User | null };
      const projectData = await projectsResponse.json() as { projects?: Project[]; error?: string };
      if (!sessionData.user) {
        window.location.replace("/login?next=%2Fdashboard");
        return;
      }
      setUser(sessionData.user);
      if (!projectsResponse.ok) throw new Error(projectData.error ?? "Could not load your projects.");
      setProjects(projectData.projects ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  // This effect starts an asynchronous request; state updates happen only after network responses.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json() as { project?: Project; error?: string };
      if (!response.ok || !data.project) throw new Error(data.error ?? "Could not create the project.");
      setProjects((current) => [data.project!, ...current]);
      setName("");
      setDescription("");
      setNotice("Project created successfully.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the project.");
    } finally {
      setSaving(false);
    }
  }

  async function updateProject(id: string, updates: { name?: string; description?: string; status?: "active" | "archived" }) {
    if (pendingProjectId) return;
    setPendingProjectId(id);
    setError("");
    setNotice("");
    try {
    const response = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await response.json() as { project?: Project; error?: string };
    if (!response.ok || !data.project) throw new Error(data.error ?? "Could not update project.");
    setProjects((current) => current.map((project) => project.id === id ? data.project! : project));
    setEditingId(null);
    setNotice("Project updated and saved.");
    } finally { setPendingProjectId(null); }
  }

  async function deleteProject(id: string) {
    if (pendingProjectId) return;
    if (!window.confirm("Delete this project permanently? This cannot be undone.")) return;
    setPendingProjectId(id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not delete the project.");
      setProjects((current) => current.filter((project) => project.id !== id));
      setNotice("Project deleted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the project.");
    } finally { setPendingProjectId(null); }
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      window.location.replace("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
      setSigningOut(false);
    }
  }

  const visibleProjects = projects.filter((project) =>
    (showArchived || project.status !== "archived") &&
    `${project.name} ${project.description}`.toLowerCase().includes(projectQuery.trim().toLowerCase()),
  );
  const activeProjects = projects.filter((project) => project.status === "active");
  const archivedProjects = projects.filter((project) => project.status === "archived");
  const displayName = user?.name?.trim().split(/\s+/)[0] || "Developer";
  const activePercentage = projects.length ? Math.round((activeProjects.length / projects.length) * 100) : 0;

  if (loading) return <main className="min-h-screen px-5 py-16 text-[#F4F1EB] sm:px-8"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-8 w-48 rounded-lg bg-[#34322F]" /><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-[#34322F]" /><div className="h-28 rounded-2xl bg-[#34322F]" /><div className="h-28 rounded-2xl bg-[#34322F]" /></div><div className="mt-5 h-80 rounded-2xl bg-[#34322F]" /></div></main>;

  return (
    <main className="nexus-workspace-shell min-h-screen px-4 pb-10 pt-24 text-[#F4F1EB] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="nexus-panel flex h-fit flex-col p-4 lg:sticky lg:top-24">
          <Link href="/" className="flex items-center gap-3 px-2 py-2">
            <span className="grid size-10 place-items-center rounded-xl border border-[#4B463D] bg-gradient-to-br from-[#34322F] to-[#34322F] text-xl text-[#D9B77B]">✦</span>
            <span><span className="block text-sm font-bold tracking-tight">Nexus<span className="text-[#D9B77B]">AI</span></span><span className="mt-0.5 block text-[10px] tracking-[0.12em] text-[#BDB6AB]">YOUR WORKSPACE</span></span>
          </Link>
          <div className="my-5 border-t border-[#34322F]" />
          <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.17em] text-[#AFA89E]">WORKSPACE</p>
          <nav aria-label="Workspace navigation" className="space-y-1">
            <Link href="/dashboard" aria-current="page" className="nexus-sidebar-link"><span className="text-base">⌂</span> Overview</Link>
            <a href="#projects" className="nexus-sidebar-link"><span className="text-base">▦</span> Projects</a>
            <Link href="/assistant" className="nexus-sidebar-link"><span className="text-base">✦</span> AI Assistant</Link>
          </nav>
          <div className="my-5 border-t border-[#34322F]" />
          <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.17em] text-[#AFA89E]">ACCOUNT</p>
          <button type="button" onClick={() => void signOut()} disabled={signingOut} className="nexus-sidebar-link w-full text-left disabled:opacity-50"><span className="text-base">↪</span> {signingOut ? "Signing out…" : "Sign out"}</button>
          <div className="mt-8 rounded-xl border border-[#4B463D] bg-gradient-to-br from-[#34322F] to-[#34322F] p-4">
            <span className="text-lg text-[#D9B77B]">✧</span>
            <p className="mt-2 text-xs font-semibold text-[#E6E1D8]">Keep the momentum</p>
            <p className="mt-1 text-xs leading-5 text-[#BDB6AB]">Break a big idea into one clear next step.</p>
            <Link href="/assistant" className="mt-3 inline-flex text-xs font-semibold text-[#D9B77B] hover:text-[#F4F1EB]">Ask the copilot ↗</Link>
          </div>
          <p className="mt-6 px-2 text-[10px] text-[#AFA89E]">NEXUS AI · PRIVATE WORKSPACE</p>
        </aside>

        <div className="min-w-0">
          <header className="nexus-workspace-heading mb-6 flex flex-col justify-between gap-4 rounded-2xl px-5 py-6 sm:flex-row sm:items-end sm:px-7">
            <div>
              <p className="nexus-kicker mb-3">Workspace overview</p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Good to see you, {displayName}.</h1>
              <p className="mt-2 text-sm leading-6 text-[#BDB6AB]">A clear view of your ideas, your projects, and what to work on next.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-[#34322F] bg-[#34322F] px-3 py-2 text-xs text-[#BDB6AB]">{user?.email}</span>
              <Link href="/assistant" className="nexus-primary-button">✦ Open AI copilot <span aria-hidden="true">↗</span></Link>
            </div>
          </header>

          {error && <p role="alert" className="mb-5 rounded-xl border border-[#8D5456] bg-[#3C2628] px-4 py-3 text-sm text-[#FFB0A9]">{error}</p>}
          {notice && <p role="status" className="mb-5 rounded-xl border border-[#496F55] bg-[#1B3828] px-4 py-3 text-sm text-[#A7D8B2]">{notice}</p>}

          <section aria-label="Workspace summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total projects", value: projects.length, detail: "Saved to your workspace", tone: "text-[#D9B77B]", icon: "▦" },
              { label: "Active projects", value: activeProjects.length, detail: "Ready for your next step", tone: "text-[#A7D8B2]", icon: "↗" },
              { label: "Archived", value: archivedProjects.length, detail: "Stored for later", tone: "text-[#D9B77B]", icon: "◷" },
              { label: "Workspace", value: "Private", detail: "Account-linked project data", tone: "text-[#D9B77B]", icon: "◇" },
            ].map((stat) => <article key={stat.label} className="nexus-panel p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-medium text-[#BDB6AB]">{stat.label}</p><span className={`grid size-9 place-items-center rounded-xl border border-[#34322F] bg-[#34322F] text-lg ${stat.tone}`}>{stat.icon}</span></div><p className={`mt-4 text-3xl font-semibold tracking-tight ${stat.tone}`}>{stat.value}</p><p className="mt-1.5 text-xs text-[#BDB6AB]">{stat.detail}</p></article>)}
          </section>

          <section aria-label="Project overview" className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
            <div className="nexus-panel relative overflow-hidden p-5 sm:p-6">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[#34322F] blur-[80px]" />
              <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="nexus-kicker mb-3">Project activity</p>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Your work at a glance.</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#BDB6AB]">Only your saved projects are counted here. The overview updates when you create, archive, restore or delete a project.</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="nexus-status-chip"><span className="size-1.5 rounded-full bg-[#D9B77B]" /> {activeProjects.length} active</span>
                    <span className="nexus-status-chip"><span className="size-1.5 rounded-full bg-[#D9B77B]" /> {archivedProjects.length} archived</span>
                  </div>
                </div>
                <a href="#projects" className="nexus-ghost-button shrink-0 text-xs">Manage projects <span aria-hidden="true">↗</span></a>
              </div>
              <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-[#34322F]" role="img" aria-label={`${activePercentage}% of saved projects are active`}>
                <div className="rounded-full bg-gradient-to-r from-[#4B463D] to-[#D9B77B] transition-[width] duration-300" style={{ width: `${activePercentage}%` }} />
              </div>
            </div>
            <div className="nexus-panel flex items-center justify-between gap-5 p-5 sm:p-6">
              <div className="min-w-0">
                <p className="nexus-kicker mb-3">Status mix</p>
                <p className="text-3xl font-semibold tabular-nums text-[#F4F1EB]">{activePercentage}<span className="text-base font-medium text-[#BDB6AB]">%</span></p>
                <p className="mt-2 text-xs text-[#BDB6AB]">Projects currently active</p>
                <p className="mt-3 text-[11px] text-[#BDB6AB]">{projects.length === 0 ? "Create a project to start tracking." : `${projects.length} saved project${projects.length === 1 ? "" : "s"}`}</p>
              </div>
              <div className="relative grid size-28 shrink-0 place-items-center rounded-full sm:size-32" role="img" aria-label={`${activeProjects.length} active and ${archivedProjects.length} archived projects`} style={{ background: projects.length ? `conic-gradient(#D9B77B 0% ${activePercentage}%, #4B463D ${activePercentage}% 100%)` : "conic-gradient(#34322F 0% 100%)" }}>
                <div className="grid size-[78%] place-items-center rounded-full border border-[#34322F] bg-[#222326]">
                  <span className="text-xl font-semibold tabular-nums text-[#E6E1D8]">{projects.length}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(290px,0.75fr)]">
            <div id="projects" className="nexus-panel min-w-0 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="nexus-kicker mb-2">Project space</p><h2 className="text-xl font-semibold">Your projects <span className="ml-1 text-sm font-normal text-[#BDB6AB]">({visibleProjects.length})</span></h2></div>
                <button type="button" aria-pressed={showArchived} onClick={() => setShowArchived((value) => !value)} className="nexus-ghost-button text-xs">{showArchived ? "Hide archived" : "Show archived"} <span aria-hidden="true">⌄</span></button>
              </div>
              <label className="mt-5 block">
                <span className="sr-only">Search projects by name or description</span>
                <input
                  type="search"
                  value={projectQuery}
                  onChange={(event) => setProjectQuery(event.target.value)}
                  placeholder="Search your projects..."
                  className="nexus-field w-full"
                />
              </label>
              {visibleProjects.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-white/[0.12] bg-[#34322F] px-5 py-12 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-xl border border-[#4B463D] bg-[#34322F] text-xl text-[#D9B77B]">▦</div>
                  <h3 className="mt-4 text-base font-semibold">{projectQuery.trim() ? "No matching projects" : showArchived ? "No saved projects yet" : "Start with one idea"}</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#BDB6AB]">{projectQuery.trim() ? "Try a different project name or description." : showArchived ? "Your saved projects will appear here." : "Create your first project using the form. It will be saved to your personal account."}</p>
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {visibleProjects.map((project) => (
                    <li key={project.id} className="nexus-project-row rounded-xl border border-[#34322F] bg-[#1D1E20] p-4 transition hover:border-[#4B463D]">
                      {editingId === project.id ? (
                        <form onSubmit={(event) => { event.preventDefault(); void updateProject(project.id, { name: editName, description: editDescription }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not update project.")); }} className="space-y-3">
                          <label className="block text-xs font-medium text-[#BDB6AB]">Project name<input value={editName} onChange={(event) => setEditName(event.target.value)} required minLength={2} maxLength={80} className="nexus-field mt-2" /></label>
                          <label className="block text-xs font-medium text-[#BDB6AB]">Description<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} rows={3} className="nexus-field mt-2" /></label>
                          <div className="flex flex-wrap gap-2"><button disabled={pendingProjectId !== null} className="nexus-primary-button disabled:opacity-50">{pendingProjectId === project.id ? "Saving…" : "Save changes"}</button><button type="button" disabled={pendingProjectId !== null} onClick={() => setEditingId(null)} className="nexus-ghost-button disabled:opacity-50">Cancel</button></div>
                        </form>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#4B463D] bg-[#34322F] text-lg text-[#D9B77B]">▦</span>
                              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold text-[#E6E1D8]">{project.name}</h3><span className={project.status === "archived" ? "rounded-full border border-[#34322F] px-2 py-1 text-[10px] text-[#BDB6AB]" : "rounded-full border border-[#496F55] bg-[#1B3828] px-2 py-1 text-[10px] text-[#A7D8B2]"}>{project.status}</span></div>{project.description && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#BDB6AB]">{project.description}</p>}<p className="mt-3 text-[11px] text-[#AFA89E]">Created {new Date(project.created_at).toLocaleDateString()}</p></div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#34322F] pt-3">
                            <button disabled={pendingProjectId !== null} onClick={() => { setEditingId(project.id); setEditName(project.name); setEditDescription(project.description); }} className="nexus-ghost-button min-h-9 px-3 py-1.5 text-xs disabled:opacity-50">Edit</button>
                            <button onClick={() => void updateProject(project.id, { status: project.status === "archived" ? "active" : "archived" }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not update project."))} disabled={pendingProjectId !== null} className="nexus-ghost-button min-h-9 px-3 py-1.5 text-xs disabled:opacity-50">{pendingProjectId === project.id ? "Saving…" : project.status === "archived" ? "Restore" : "Archive"}</button>
                            <button onClick={() => void deleteProject(project.id)} disabled={pendingProjectId !== null} className="inline-flex min-h-9 items-center rounded-xl border border-[#8D5456] px-3 py-1.5 text-xs text-[#FFB0A9] transition hover:bg-[#3C2628] disabled:opacity-50">Delete</button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-5">
              <form onSubmit={createProject} className="nexus-panel h-fit p-5 sm:p-6">
                <p className="nexus-kicker mb-3">Make it real</p><h2 className="text-xl font-semibold">Create a project</h2><p className="mt-2 text-sm leading-6 text-[#BDB6AB]">Capture an idea while it is fresh. You can edit it later.</p>
                <label htmlFor="project-name" className="mb-2 mt-5 block text-xs font-medium text-[#BDB6AB]">Project name</label>
                <input id="project-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} placeholder="e.g. Portfolio v2" className="nexus-field" />
                <label htmlFor="project-description" className="mb-2 mt-4 block text-xs font-medium text-[#BDB6AB]">What is it about? <span className="text-[#AFA89E]">(optional)</span></label>
                <textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={4} placeholder="The problem, idea, or next milestone…" className="nexus-field resize-y" />
                <p className="mt-2 text-right text-[10px] text-[#AFA89E]">{description.length}/500 characters</p>
                <button disabled={saving} type="submit" className="nexus-primary-button mt-4 w-full">{saving ? "Saving…" : "Create project"} <span aria-hidden="true">↗</span></button>
              </form>

              <article className="relative overflow-hidden rounded-2xl border border-[#4B463D] bg-gradient-to-br from-[#34322F] to-[#171819] p-5">
                <div aria-hidden="true" className="absolute -right-8 -top-10 size-36 rounded-full bg-[#34322F] blur-3xl" />
                <div className="relative"><p className="nexus-kicker mb-3">Next step</p><h3 className="text-lg font-semibold">Think it through with AI.</h3><p className="mt-2 text-sm leading-6 text-[#BDB6AB]">Turn a vague idea into a plan, or ask the copilot to help untangle a bug.</p><Link href="/assistant" className="mt-4 inline-flex text-sm font-semibold text-[#D9B77B] hover:text-[#F4F1EB]">Open assistant <span className="ml-2">↗</span></Link></div>
              </article>
            </div>
          </section>
          <footer className="mt-7 flex flex-wrap justify-between gap-3 border-t border-[#34322F] pt-4 text-[11px] text-[#AFA89E]"><span>Private by design · Your projects are linked to your account.</span><Link href="/" className="hover:text-[#E6E1D8]">Nexus AI home ↗</Link></footer>
        </div>
      </div>
    </main>
  );
}
