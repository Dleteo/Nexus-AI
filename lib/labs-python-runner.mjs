import path from "node:path";
import { lstat, realpath } from "node:fs/promises";
import { runTrustedPythonScript } from "./labs-python-process.mjs";

const labs = Object.freeze({
  commerce: { flag: "NEXUS_LABS_SQLITE", db: "NEXUS_COMMERCE_DB", timeoutMs: 5000 },
  studio: { flag: "NEXUS_LABS_STUDIO_SQLITE", db: "NEXUS_STUDIO_DB", timeoutMs: 5000 },
  monitor: { flag: "NEXUS_LABS_MONITOR_SQLITE", db: "NEXUS_MONITOR_DB", timeoutMs: 6500 },
  factory: { flag: "NEXUS_LABS_FACTORY", db: "NEXUS_FACTORY_DB", timeoutMs: 5000 },
});
let active = 0;

/** Only the selected DB path and OS locale/path survive; no provider/Git/proxy credentials. */
export function labsPythonEnvironment(dbVariable, source = process.env) {
  const env = {};
  for (const key of ["PATH", "LANG", "LC_ALL", "TMPDIR", dbVariable]) {
    if (source[key] !== undefined) env[key] = source[key];
  }
  return env;
}

/** Never accepts source, executable, arguments or paths from an HTTP request. */
export async function runLabsPython(lab, command, { signal } = {}) {
  if (!Object.hasOwn(labs, lab)) throw new Error("unknown-local-lab");
  const config = labs[lab];
  if (process.env.NODE_ENV !== "development" || process.env[config.flag] !== "1") {
    throw new Error("local-backend-disabled");
  }
  if (active >= 8) throw new Error("local-backend-busy");
  active++;
  try {
    const root = await realpath(process.cwd());
    const script = path.join(root, "labs", lab, "backend.py");
    const helper = path.join(root, "labs", "sqlite_storage.py");
    const files = [script, helper];
    if (lab === "factory") {
      files.push(path.join(root, "labs", "factory", "__init__.py"), path.join(root, "labs", "factory", "sandbox_snapshot.py"));
    }
    for (const target of [path.join(root, "labs"), path.dirname(script), ...files]) {
      const info = await lstat(target);
      if (info.isSymbolicLink()) throw new Error("local-script-symlink");
      if (files.includes(target) && !info.isFile()) throw new Error("local-script-path-denied");
      if (await realpath(target) !== target) throw new Error("local-script-path-denied");
    }
    return await runTrustedPythonScript(script, JSON.stringify(command), {
      env: labsPythonEnvironment(config.db), signal, timeoutMs: config.timeoutMs,
    });
  } finally {
    active--;
  }
}
