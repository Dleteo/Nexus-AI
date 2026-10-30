export type LocalLab = "commerce" | "studio" | "monitor" | "factory";
export function runLabsPython(lab: LocalLab, command: object, options?: { signal?: AbortSignal }): Promise<string>;
export function labsPythonEnvironment(dbVariable: string, source?: Record<string, string | undefined>): Record<string, string>;
