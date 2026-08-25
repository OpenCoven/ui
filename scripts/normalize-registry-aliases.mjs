import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.join(process.cwd(), "public", "r");
const replacements = [
  ["@opencoven/ui/components/ui/", "@/components/ui/"],
  ["@opencoven/ui/components/", "@/components/"],
  ["@opencoven/ui/blocks/", "@/components/blocks/"],
  ["@opencoven/ui/lib/", "@/lib/"],
  ["@opencoven/ui/hooks/", "@/hooks/"],
];

let normalized = 0;

for (const name of await readdir(output)) {
  if (!name.endsWith(".json")) continue;
  const file = path.join(output, name);
  const item = JSON.parse(await readFile(file, "utf8"));
  let changed = false;

  if (Array.isArray(item.files)) {
    for (const registryFile of item.files) {
      if (typeof registryFile.content !== "string") continue;
      let content = registryFile.content;
      for (const [from, to] of replacements) {
        content = content.replaceAll(from, to);
      }
      if (content !== registryFile.content) {
        registryFile.content = content;
        changed = true;
      }
    }
  }

  if (changed) {
    await writeFile(file, `${JSON.stringify(item, null, 2)}\n`);
    normalized += 1;
  }
}

console.log(`Normalized aliases in ${normalized} registry artifacts.`);
