import { spawn } from "node:child_process";

/** Trusted repository scripts only. This is a bounded subprocess, NOT a sandbox. */
export function runTrustedPythonScript(script, input, {
  env = {}, signal, timeoutMs = 5000, maxOutputBytes = 256 * 1024,
} = {}) {
  if (process.platform === "win32") return Promise.reject(new Error("local-process-tree-unverified"));
  if (signal?.aborted) return Promise.reject(new Error("local-process-cancelled"));
  if (Buffer.byteLength(input, "utf8") > 20000) return Promise.reject(new Error("local-input-too-large"));
  return new Promise((resolve, reject) => {
    let child;
    let timer;
    let settled = false;
    let outputBytes = 0;
    const output = [];
    const terminateTree = () => {
      if (child?.pid) {
        try { process.kill(-child.pid, "SIGKILL"); } catch { /* already reaped */ }
      }
    };
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      terminateTree();
      child?.stdin?.destroy();
      child?.stdout?.destroy();
      child?.stderr?.destroy();
      if (error) reject(error);
      else resolve(Buffer.concat(output).toString("utf8"));
    };
    const cancel = () => finish(new Error("local-process-cancelled"));
    try {
      child = spawn("python3", ["-I", "-X", "utf8", script], {
        env, detached: true, windowsHide: true, stdio: ["pipe", "pipe", "pipe"],
      });
    } catch {
      finish(new Error("local-process-unavailable"));
      return;
    }
    timer = setTimeout(() => finish(new Error("local-process-timeout")), timeoutMs);
    signal?.addEventListener("abort", cancel, { once: true });
    if (signal?.aborted) cancel();
    const collect = (chunk, stdout) => {
      outputBytes += chunk.length;
      if (outputBytes > maxOutputBytes) finish(new Error("local-output-too-large"));
      else if (stdout) output.push(chunk);
    };
    child.stdout.on("data", (chunk) => collect(chunk, true));
    child.stderr.on("data", (chunk) => collect(chunk, false));
    child.on("error", () => finish(new Error("local-process-unavailable")));
    // Kill remaining group members even if the direct child exits first.
    child.on("exit", () => terminateTree());
    child.on("close", (code) => finish(code === 0 ? undefined : new Error("local-process-failed")));
    child.stdin.on("error", () => finish(new Error("local-process-input-failed")));
    child.stdin.end(input);
  });
}
