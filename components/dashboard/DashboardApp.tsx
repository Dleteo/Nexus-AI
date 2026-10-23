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
    setError("");
    setNotice("");
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
  }

  async function deleteProject(id: string) {
    if (!window.confirm("Delete this project permanently? This cannot be undone.")) return;
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
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/");
  }

  const visibleProjects = projects.filter((project) =>
    (showArchived || project.status !== "archived") &&
    `${project.name} ${project.description}`.toLowerCase().includes(projectQuery.trim().toLowerCase()),
  );
  const activeProjects = projects.filter((project) => project.status === "active");
  const archivedProjects = projects.filter((project) => project.status === "archived");
  const displayName = user?.name?.trim().split(/\s+/)[0] || "Developer";
  const activePercentage = projects.length ? Math.round((activeProjects.length / projects.length) * 100) : 0;

  if (loading) return <main className="min-h-screen px-5 py-16 text-white sm:px-8"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-8 w-48 rounded-lg bg-white/5" /><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-white/5" /><div className="h-28 rounded-2xl bg-white/5" /><div className="h-28 rounded-2xl bg-white/5" /></div><div className="mt-5 h-80 rounded-2xl bg-white/5" /></div></main>;

  return (
    <main className="nexus-workspace-shell min-h-screen px-4 pb-10 pt-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="nexus-panel flex h-fit flex-col p-4 lg:sticky lg:top-24">
          <Link href="/" className="flex items-center gap-3 px-2 py-2">
            <span className="grid size-10 place-items-center rounded-xl border border-cyan-200/15 bg-gradient-to-br from-blue-500/30 to-violet-500/20 text-xl text-cyan-100">✦</span>
            <span><span className="block text-sm font-bold tracking-tight">Nexus<span className="text-cyan-300">AI</span></span><span className="mt-0.5 block text-[10px] tracking-[0.12em] text-slate-500">YOUR WORKSPACE</span></span>
          </Link>
          <div className="my-5 border-t border-white/[0.07]" />
          <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.17em] text-slate-600">WORKSPACE</p>
          <nav aria-label="Workspace navigation" className="space-y-1">
            <Link href="/dashboard" aria-current="page" className="nexus-sidebar-link"><span className="text-base">⌂</span> Overview</Link>
            <a href="#projects" className="nexus-sidebar-link"><span className="text-base">▦</span> Projects</a>
            <Link href="/assistant" className="nexus-sidebar-link"><span className="text-base">✦</span> AI Assistant</Link>
          </nav>
          <div className="my-5 border-t border-white/[0.07]" />
          <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.17em] text-slate-600">ACCOUNT</p>
          <button type="button" onClick={() => void signOut()} className="nexus-sidebar-link w-full text-left"><span className="text-base">↪</span> Sign out</button>
          <div className="mt-8 rounded-xl border border-cyan-100/10 bg-gradient-to-br from-blue-500/[0.10] to-violet-500/[0.08] p-4">
            <span className="text-lg text-cyan-200">✧</span>
            <p className="mt-2 text-xs font-semibold text-slate-200">Keep the momentum</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Break a big idea into one clear next step.</p>
            <Link href="/assistant" className="mt-3 inline-flex text-xs font-semibold text-cyan-200 hover:text-white">Ask the copilot ↗</Link>
          </div>
          <p className="mt-6 px-2 text-[10px] text-slate-600">NEXUS AI · PRIVATE WORKSPACE</p>
        </aside>

        <div className="min-w-0">
          <header className="nexus-workspace-heading mb-6 flex flex-col justify-between gap-4 rounded-2xl px-5 py-6 sm:flex-row sm:items-end sm:px-7">
            <div>
              <p className="nexus-kicker mb-3">Workspace overview</p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Good to see you, {displayName}.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">A clear view of your ideas, your projects, and what to work on next.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-slate-400">{user?.email}</span>
              <Link href="/assistant" className="nexus-primary-button">✦ Open AI copilot <span aria-hidden="true">↗</span></Link>
            </div>
          </header>

          {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200">{error}</p>}
          {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-200">{notice}</p>}

          <section aria-label="Workspace summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total projects", value: projects.length, detail: "Saved to your workspace", tone: "text-cyan-200", icon: "▦" },
              { label: "Active projects", value: activeProjects.length, detail: "Ready for your next step", tone: "text-emerald-200", icon: "↗" },
              { label: "Archived", value: archivedProjects.length, detail: "Stored for later", tone: "text-violet-200", icon: "◷" },
              { label: "Workspace", value: "Private", detail: "Account-linked project data", tone: "text-blue-200", icon: "◇" },
            ].map((stat) => <article key={stat.label} className="nexus-panel p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-medium text-slate-500">{stat.label}</p><span className={`grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-lg ${stat.tone}`}>{stat.icon}</span></div><p className={`mt-4 text-3xl font-semibold tracking-tight ${stat.tone}`}>{stat.value}</p><p className="mt-1.5 text-xs text-slate-500">{stat.detail}</p></article>)}
          </section>

          <section aria-label="Project overview" className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
            <div className="nexus-panel relative overflow-hidden p-5 sm:p-6">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-blue-500/10 blur-[80px]" />
              <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="nexus-kicker mb-3">Project activity</p>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Your work at a glance.</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Only your saved projects are counted here. The overview updates when you create, archive, restore or delete a project.</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="nexus-status-chip"><span className="size-1.5 rounded-full bg-cyan-300" /> {activeProjects.length} active</span>
                    <span className="nexus-status-chip"><span className="size-1.5 rounded-full bg-violet-400" /> {archivedProjects.length} archived</span>
                  </div>
                </div>
                <a href="#projects" className="nexus-ghost-button shrink-0 text-xs">Manage projects <span aria-hidden="true">↗</span></a>
              </div>
              <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-white/[0.05]" role="img" aria-label={`${activePercentage}% of saved projects are active`}>
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-[width] duration-300" style={{ width: `${activePercentage}%` }} />
              </div>
            </div>
            <div className="nexus-panel flex items-center justify-between gap-5 p-5 sm:p-6">
              <div className="min-w-0">
                <p className="nexus-kicker mb-3">Status mix</p>
                <p className="text-3xl font-semibold tabular-nums text-white">{activePercentage}<span className="text-base font-medium text-slate-500">%</span></p>
                <p className="mt-2 text-xs text-slate-400">Projects currently active</p>
                <p className="mt-3 text-[11px] text-slate-500">{projects.length === 0 ? "Create a project to start tracking." : `${projects.length} saved project${projects.length === 1 ? "" : "s"}`}</p>
              </div>
              <div className="relative grid size-28 shrink-0 place-items-center rounded-full sm:size-32" role="img" aria-label={`${activeProjects.length} active and ${archivedProjects.length} archived projects`} style={{ background: projects.length ? `conic-gradient(#38bdf8 0% ${activePercentage}%, #9274ee ${activePercentage}% 100%)` : "conic-gradient(#263245 0% 100%)" }}>
                <div className="grid size-[78%] place-items-center rounded-full border border-white/10 bg-[#0b1220]">
                  <span className="text-xl font-semibold tabular-nums text-slate-100">{projects.length}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(290px,0.75fr)]">
            <div id="projects" className="nexus-panel min-w-0 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="nexus-kicker mb-2">Project space</p><h2 className="text-xl font-semibold">Your projects <span className="ml-1 text-sm font-normal text-slate-500">({visibleProjects.length})</span></h2></div>
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
                <div className="mt-6 rounded-xl border border-dashed border-white/[0.12] bg-black/10 px-5 py-12 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-200/[0.05] text-xl text-cyan-200">▦</div>
                  <h3 className="mt-4 text-base font-semibold">{projectQuery.trim() ? "No matching projects" : showArchived ? "No saved projects yet" : "Start with one idea"}</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{projectQuery.trim() ? "Try a different project name or description." : showArchived ? "Your saved projects will appear here." : "Create your first project using the form. It will be saved to your personal account."}</p>
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {visibleProjects.map((project) => (
                    <li key={project.id} className="nexus-project-row rounded-xl border border-white/[0.07] bg-[#080d17]/80 p-4 transition hover:border-cyan-200/30">
                      {editingId === project.id ? (
                        <form onSubmit={(event) => { event.preventDefault(); void updateProject(project.id, { name: editName, description: editDescription }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not update project.")); }} className="space-y-3">
                          <label className="block text-xs font-medium text-slate-400">Project name<input value={editName} onChange={(event) => setEditName(event.target.value)} required minLength={2} maxLength={80} className="nexus-field mt-2" /></label>
                          <label className="block text-xs font-medium text-slate-400">Description<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} rows={3} className="nexus-field mt-2" /></label>
                          <div className="flex flex-wrap gap-2"><button className="nexus-primary-button">Save changes</button><button type="button" onClick={() => setEditingId(null)} className="nexus-ghost-button">Cancel</button></div>
                        </form>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-200/10 bg-blue-300/[0.06] text-lg text-blue-200">▦</span>
                              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold text-slate-100">{project.name}</h3><span className={project.status === "archived" ? "rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-500" : "rounded-full border border-emerald-200/15 bg-emerald-200/[0.05] px-2 py-1 text-[10px] text-emerald-200"}>{project.status}</span></div>{project.description && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">{project.description}</p>}<p className="mt-3 text-[11px] text-slate-600">Created {new Date(project.created_at).toLocaleDateString()}</p></div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                            <button onClick={() => { setEditingId(project.id); setEditName(project.name); setEditDescription(project.description); }} className="nexus-ghost-button min-h-9 px-3 py-1.5 text-xs">Edit</button>
                            <button onClick={() => void updateProject(project.id, { status: project.status === "archived" ? "active" : "archived" }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not update project."))} className="nexus-ghost-button min-h-9 px-3 py-1.5 text-xs">{project.status === "archived" ? "Restore" : "Archive"}</button>
                            <button onClick={() => void deleteProject(project.id)} className="inline-flex min-h-9 items-center rounded-xl border border-red-300/15 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-300/[0.06]">Delete</button>
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
                <p className="nexus-kicker mb-3">Make it real</p><h2 className="text-xl font-semibold">Create a project</h2><p className="mt-2 text-sm leading-6 text-slate-500">Capture an idea while it is fresh. You can edit it later.</p>
                <label htmlFor="project-name" className="mb-2 mt-5 block text-xs font-medium text-slate-400">Project name</label>
                <input id="project-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} placeholder="e.g. Portfolio v2" className="nexus-field" />
                <label htmlFor="project-description" className="mb-2 mt-4 block text-xs font-medium text-slate-400">What is it about? <span className="text-slate-600">(optional)</span></label>
                <textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={4} placeholder="The problem, idea, or next milestone…" className="nexus-field resize-y" />
                <p className="mt-2 text-right text-[10px] text-slate-600">{description.length}/500 characters</p>
                <button disabled={saving} type="submit" className="nexus-primary-button mt-4 w-full">{saving ? "Saving…" : "Create project"} <span aria-hidden="true">↗</span></button>
              </form>

              <article className="relative overflow-hidden rounded-2xl border border-cyan-100/10 bg-gradient-to-br from-[#111d32] to-[#0b101d] p-5">
                <div aria-hidden="true" className="absolute -right-8 -top-10 size-36 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="relative"><p className="nexus-kicker mb-3">Next step</p><h3 className="text-lg font-semibold">Think it through with AI.</h3><p className="mt-2 text-sm leading-6 text-slate-400">Turn a vague idea into a plan, or ask the copilot to help untangle a bug.</p><Link href="/assistant" className="mt-4 inline-flex text-sm font-semibold text-cyan-200 hover:text-white">Open assistant <span className="ml-2">↗</span></Link></div>
              </article>
            </div>
          </section>
          <footer className="mt-7 flex flex-wrap justify-between gap-3 border-t border-white/[0.06] pt-4 text-[11px] text-slate-600"><span>Private by design · Your projects are linked to your account.</span><Link href="/" className="hover:text-slate-300">Nexus AI home ↗</Link></footer>
        </div>
      </div>
    </main>
  );
}
