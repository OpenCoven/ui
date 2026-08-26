import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const vercel = JSON.parse(
  await readFile(path.join(root, "vercel.json"), "utf8"),
);
const outputDir = path.join(root, vercel.outputDirectory);
const registrySource = path.join(root, "public", "r");

const failures = [];

const names = (await readdir(registrySource)).filter((name) =>
  name.endsWith(".json"),
);

if (names.length === 0) {
  failures.push(
    "public/r contains no registry items — run `pnpm registry:build`",
  );
}

for (const name of names) {
  const relative = path.join("r", name);
  let deployed;
  try {
    deployed = await readFile(path.join(outputDir, relative), "utf8");
  } catch {
    failures.push(`${relative} is missing from ${vercel.outputDirectory}`);
    continue;
  }
  const source = await readFile(path.join(registrySource, name), "utf8");
  if (deployed !== source) {
    failures.push(`${relative} differs from public/${relative}`);
  }
}

try {
  await readFile(path.join(outputDir, "index.html"), "utf8");
} catch {
  failures.push(`index.html is missing from ${vercel.outputDirectory}`);
}

// The SPA rewrite must not swallow registry paths, or a missing item resolves
// to 200 HTML and `shadcn add` fails on a JSON parse error instead of a 404.
const rewrites = vercel.rewrites ?? [];
const swallowsRegistry = rewrites.some(
  (rewrite) =>
    rewrite.destination === "/index.html" && !rewrite.source.includes("?!r/"),
);
if (swallowsRegistry) {
  failures.push(
    "vercel.json rewrite captures /r/* — exclude it so missing registry items return 404",
  );
}

if (failures.length > 0) {
  console.error("Deploy output check failed:");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Deploy output check passed: ${names.length} registry items published to ${vercel.outputDirectory}/r`,
);
