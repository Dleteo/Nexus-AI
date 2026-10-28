// These are trusted fixtures testing process bounds, never proof of a sandbox.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { runTrustedPythonScript } from "../lib/labs-python-process.mjs";
import { labsPythonEnvironment, runLabsPython } from "../lib/labs-python-runner.mjs";

if (process.platform === "win32") {
  await assert.rejects(runTrustedPythonScript("unused", "{}"), /local-process-tree-unverified/);
  console.log("PASS Windows execution fails closed; Job Objects unverified");
  process.exit(0);
}
if (process.platform !== "linux") {
  throw new Error("Runner cleanup QA requires Linux /proc; other POSIX platforms remain unverified");
}
const root = process.cwd();
await mkdir(path.join(root, "work"), { recursive: true });
const temporary = await mkdtemp(path.join(root, "work", "runner-qa-"));
const script = path.join(root, "scripts", "fixtures", "labs_runner_probe.py");
const originalEnv = { ...process.env };
const environment = labsPythonEnvironment("NEXUS_COMMERCE_DB", {
  PATH: process.env.PATH, NEXUS_COMMERCE_DB: "synthetic-db-path",
  NEXUS_TEST_SECRET: "synthetic-secret", PYTHONPATH: temporary,
  OPENAI_API_KEY: "synthetic-api-key", HTTPS_PROXY: "synthetic-proxy",
});
const probe = (command, options = {}) => runTrustedPythonScript(script, JSON.stringify(command), {
  env: environment, timeoutMs: 2000, ...options,
});
const until = async (check) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error("process-observation-timeout");
};
const stopped = async (pid) => {
  try {
    const status = await readFile(`/proc/${pid}/stat`, "utf8");
    return /\) [ZX] /.test(status); // zombies have terminated; PID1 owns reaping.
  } catch (error) {
    if (error.code === "ENOENT") return true;
    throw error;
  }
};
try {
  assert.deepEqual(Object.keys(environment).sort(), ["NEXUS_COMMERCE_DB", "PATH"]);
  const observed = JSON.parse(await probe({ action: "environment" }));
  assert.deepEqual(observed, { secret: null, pythonpath: null, db: "synthetic-db-path", isolated: 1 });
  await assert.rejects(probe({ action: "sleep" }, { timeoutMs: 100 }), /local-process-timeout/);
  await assert.rejects(probe({ action: "output" }, { maxOutputBytes: 1024 }), /local-output-too-large/);
  await assert.rejects(probe({ action: "stderr" }, { maxOutputBytes: 1024 }), /local-output-too-large/);
  await assert.rejects(runTrustedPythonScript(script, "x".repeat(20001)), /local-input-too-large/);
  for (const exitParent of [false, true]) {
    const pidFile = path.join(temporary, `child-${exitParent}.pid`);
    const controller = new AbortController();
    const running = probe({ action: "fork", pidFile, exitParent }, { signal: controller.signal });
    const result = exitParent ? running : assert.rejects(running, /local-process-cancelled/);
    await until(async () => { try { await readFile(pidFile); return true; } catch { return false; } });
    const pid = Number(await readFile(pidFile, "utf8"));
    if (!exitParent) controller.abort();
    await result;
    await until(() => stopped(pid));
  }
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(probe({ action: "sleep" }, { signal: controller.signal }), /local-process-cancelled/);
  process.env.NODE_ENV = "production";
  process.env.NEXUS_LABS_SQLITE = "1";
  await assert.rejects(runLabsPython("commerce", {}), /local-backend-disabled/);
  await assert.rejects(runLabsPython("../../outside", {}), /unknown-local-lab/);
  process.env.NODE_ENV = "development";
  const fakeRoot = path.join(temporary, "fake-root");
  await mkdir(fakeRoot);
  await symlink(path.join(root, "labs"), path.join(fakeRoot, "labs"), "dir");
  process.chdir(fakeRoot);
  await assert.rejects(runLabsPython("commerce", { action: "list" }), /local-script-symlink/);
  process.chdir(root);
  await rm(path.join(fakeRoot, "labs"));
  await mkdir(path.join(fakeRoot, "labs", "commerce"), { recursive: true });
  await writeFile(path.join(fakeRoot, "labs", "commerce", "backend.py"), "raise RuntimeError('must-not-run')\n");
  await symlink(path.join(root, "labs", "sqlite_storage.py"), path.join(fakeRoot, "labs", "sqlite_storage.py"));
  process.chdir(fakeRoot);
  await assert.rejects(runLabsPython("commerce", { action: "list" }), /local-script-symlink/);
  process.chdir(root);
  await rm(path.join(fakeRoot, "labs", "sqlite_storage.py"));
  await writeFile(path.join(fakeRoot, "labs", "sqlite_storage.py"), "raise RuntimeError('must-not-import')\n");
  const fakeFactory = path.join(fakeRoot, "labs", "factory");
  await mkdir(fakeFactory);
  await writeFile(path.join(fakeFactory, "backend.py"), "raise RuntimeError('must-not-run')\n");
  process.env.NEXUS_LABS_FACTORY = "1";
  for (const linked of ["__init__.py", "sandbox_snapshot.py"]) {
    for (const file of ["__init__.py", "sandbox_snapshot.py"]) {
      if (file === linked) await symlink(path.join(root, "labs", "factory", file), path.join(fakeFactory, file));
      else await writeFile(path.join(fakeFactory, file), "raise RuntimeError('must-not-import')\n");
    }
    process.chdir(fakeRoot);
    await assert.rejects(runLabsPython("factory", { action: "list" }), /local-script-symlink/);
    process.chdir(root);
    for (const file of ["__init__.py", "sandbox_snapshot.py"]) await rm(path.join(fakeFactory, file));
  }
  // Python -I must ignore a malicious import shadow in the working directory.
  await writeFile(path.join(temporary, "json.py"), "raise RuntimeError('shadow-import')\n");
  process.chdir(temporary);
  assert.equal(JSON.parse(await probe({ action: "environment" })).isolated, 1);
  console.log("PASS trusted Python: isolated imports/env, bounded I/O/time, abort/tree cleanup, fixed paths and production gate");
} finally {
  process.chdir(root);
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
  await rm(temporary, { recursive: true, force: true });
}
