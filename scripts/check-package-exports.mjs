import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const packageRoot = path.join(root, "packages", "ui");
const manifest = JSON.parse(
  await readFile(path.join(packageRoot, "package.json"), "utf8"),
);

for (const [subpath, declaration] of Object.entries(manifest.exports)) {
  const sample = subpath.startsWith("./components/")
    ? "mode-switch"
    : subpath.startsWith("./blocks/")
      ? "composer"
      : "";
  if (typeof declaration === "string") {
    await access(path.join(packageRoot, declaration.replace("*", sample)));
    continue;
  }
  await access(path.join(packageRoot, declaration.types.replace("*", sample)));
  await access(path.join(packageRoot, declaration.import.replace("*", sample)));
  if (!subpath.startsWith(".")) {
    throw new Error(`Invalid package export key: ${subpath}`);
  }
}

const publicApi = await import(
  pathToFileURL(path.join(packageRoot, "dist", "index.js")).href
);
const requiredExports = [
  "Button",
  "Tabs",
  "Tooltip",
  "Composer",
  "RunRail",
  "TranscriptTurn",
  "SessionHeader",
  "ToolClassBadge",
  "ModeSwitch",
  "CompletionPalette",
];

const missing = requiredExports.filter((name) => !(name in publicApi));
if (missing.length > 0) {
  throw new Error(`Missing public package exports: ${missing.join(", ")}`);
}

console.log(
  `Verified ${requiredExports.length} public exports and all declared paths.`,
);
