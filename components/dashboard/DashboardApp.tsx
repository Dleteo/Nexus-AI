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

  const visibleProjects = projects.filter((project) => showArchived || project.status !== "archived");

  if (loading) return <main className="min-h-screen bg-black px-6 py-16 text-white"><p className="mx-auto max-w-5xl text-gray-400">Loading your dashboard…</p></main>;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link href="/" className="text-sm text-cyan-300 hover:text-white">← Back to Nexus AI</Link>
            <p className="mb-3 mt-6 text-sm uppercase tracking-[0.35em] text-cyan-400">Private dashboard</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Your projects.</h1>
            <p className="mt-4 max-w-2xl text-gray-400">{user?.name ? `Welcome, ${user.name}.` : "Welcome to Nexus AI."} Create and manage projects saved to your account.</p>
            {user?.email && <p className="mt-2 text-sm text-gray-500">{user.email}</p>}
          </div>
          <button onClick={() => void signOut()} className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">Sign out</button>
        </header>

        {error && <p role="alert" className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        {notice && <p role="status" className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">Your projects <span className="text-base font-normal text-gray-500">({visibleProjects.length})</span></h2>
              <button type="button" onClick={() => setShowArchived((value) => !value)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">{showArchived ? "Hide archived" : "Show archived"}</button>
            </div>
            {visibleProjects.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
                <h3 className="text-lg font-semibold">{showArchived ? "No projects here yet." : "A clean slate."}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{showArchived ? "Archived projects will appear here." : "Create your first project with the form. It will be saved to your account."}</p>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {visibleProjects.map((project) => (
                  <li key={project.id} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    {editingId === project.id ? (
                      <form onSubmit={(event) => { event.preventDefault(); void updateProject(project.id, { name: editName, description: editDescription }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not update project.")); }} className="space-y-3">
                        <label className="block text-sm text-gray-300">Project name<input value={editName} onChange={(event) => setEditName(event.target.value)} required minLength={2} maxLength={80} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white" /></label>
                        <label className="block text-sm text-gray-300">Description<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white" /></label>
                        <div className="flex flex-wrap gap-2"><button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Save changes</button><button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-white/20 px-4 py-2 text-sm">Cancel</button></div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-lg font-semibold">{project.name}</h3><span className={project.status === "archived" ? "rounded-full bg-gray-500/15 px-2 py-1 text-xs text-gray-400" : "rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300"}>{project.status}</span></div>
                            {project.description && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-400">{project.description}</p>}
                            <p className="mt-3 text-xs text-gray-500">Created {new Date(project.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button onClick={() => { setEditingId(project.id); setEditName(project.name); setEditDescription(project.description); }} className="rounded-full border border-white/20 px-3 py-2 text-xs hover:bg-white/10">Edit</button>
                          <button onClick={() => void updateProject(project.id, { status: project.status === "archived" ? "active" : "archived" }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not update project."))} className="rounded-full border border-cyan-400/30 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-400/10">{project.status === "archived" ? "Restore" : "Archive"}</button>
                          <button onClick={() => void deleteProject(project.id)} className="rounded-full border border-red-400/30 px-3 py-2 text-xs text-red-200 hover:bg-red-400/10">Delete</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={createProject} className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="text-2xl font-semibold">New project</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">Add a project to your personal workspace.</p>
            <label htmlFor="project-name" className="mb-2 mt-6 block text-sm text-gray-300">Project name</label>
            <input id="project-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} placeholder="My next idea" className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-cyan-400" />
            <label htmlFor="project-description" className="mb-2 mt-5 block text-sm text-gray-300">Description <span className="text-gray-500">(optional)</span></label>
            <textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={4} placeholder="What are you planning to build?" className="w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-cyan-400" />
            <p className="mt-2 text-right text-xs text-gray-500">{description.length}/500</p>
            <button disabled={saving} type="submit" className="mt-5 w-full rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : "Create project"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
