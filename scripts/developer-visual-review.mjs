import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const chromePath = process.env.CHROME_PATH;
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const outputDir = path.resolve(
  process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual-review",
);

if (!chromePath) {
  throw new Error("CHROME_PATH is required");
}

await mkdir(outputDir, { recursive: true });

function runChrome(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(chromePath, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(String(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(String(chunk)));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Chrome exited ${code}: ${stderr.join("").trim() || "no stderr"}`,
          ),
        );
        return;
      }
      resolve({ stdout: stdout.join(""), stderr: stderr.join("") });
    });
  });
}

const commonArgs = [
  "--headless=new",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-prefers-reduced-motion",
  "--virtual-time-budget=1500",
];
const developerUrl = new URL("/developer", baseUrl).href;

const dom = await runChrome([...commonArgs, "--dump-dom", developerUrl]);

for (const requiredText of [
  "OpenCoven development context",
  "Coven daemon",
  "OpenCoven SDK",
  "Coven CLI",
  "coven-code runtime",
  "Read only",
  "Local authority",
  "Recent invocations",
]) {
  if (!dom.stdout.includes(requiredText)) {
    throw new Error(
      `Developer surface is missing rendered text: ${requiredText}`,
    );
  }
}

if (dom.stdout.includes("Open CLI") || dom.stdout.includes("Inspect project")) {
  throw new Error(
    "Developer showcase rendered a control without a real host action contract",
  );
}

const scenarios = [
  { name: "developer-dark-desktop", width: 1440, height: 1000 },
  { name: "developer-dark-mobile", width: 390, height: 844 },
];

for (const scenario of scenarios) {
  const screenshot = path.join(outputDir, `${scenario.name}.png`);
  await runChrome([
    ...commonArgs,
    `--window-size=${scenario.width},${scenario.height}`,
    `--screenshot=${screenshot}`,
    developerUrl,
  ]);
}

await writeFile(
  path.join(outputDir, "developer-review.json"),
  `${JSON.stringify(
    {
      route: "/developer",
      result: "PASS",
      requiredText: [
        "OpenCoven development context",
        "Coven daemon",
        "OpenCoven SDK",
        "Coven CLI",
        "coven-code runtime",
        "Read only",
        "Local authority",
        "Recent invocations",
      ],
      scenarios,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Developer visual review passed with ${scenarios.length} viewport receipts.`,
);
