import { spawn } from "node:child_process";

const outputLimit = 1_000_000;
const timeoutMs = 15_000;

function gitStatus() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "git",
      [
        "status",
        "--porcelain=v1",
        "--untracked-files=all",
        "--",
        "registry.json",
        "public/r",
      ],
      {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    const stdout = [];
    const stderr = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;

    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };

    const capture = (chunks, byteCount, chunk) => {
      if (byteCount >= outputLimit) return byteCount;
      const text = String(chunk);
      const remaining = outputLimit - byteCount;
      const bounded = Buffer.from(text).subarray(0, remaining).toString();
      chunks.push(bounded);
      return byteCount + Buffer.byteLength(bounded);
    };

    child.stdout.on("data", (chunk) => {
      stdoutBytes = capture(stdout, stdoutBytes, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderrBytes = capture(stderr, stderrBytes, chunk);
    });
    child.once("error", (error) => finish(() => reject(error)));
    child.once("exit", (code, signal) => {
      finish(() => {
        if (code === 0) {
          resolve(stdout.join(""));
          return;
        }

        reject(
          new Error(
            `git status failed (${signal ?? code}): ${stderr.join("").trim() || "no stderr"}`,
          ),
        );
      });
    });

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      finish(() => reject(new Error("git status timed out")));
    }, timeoutMs);
  });
}

const status = await gitStatus();
const changed = status.trim();

if (changed) {
  throw new Error(
    `Generated registry output is not committed:\n${changed}\nRun pnpm registry:build and commit registry.json plus public/r.`,
  );
}

console.log("Generated registry output is committed and clean.");
