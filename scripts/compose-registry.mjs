import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const fragments = [
  "registry/lib/registry.fragment.json",
  "registry/styles/registry.fragment.json",
  "registry/components/registry.fragment.json",
  "registry/blocks/registry.fragment.json",
];

const rawItems = [];
const names = new Set();

for (const relativePath of fragments) {
  const source = JSON.parse(
    await readFile(path.join(root, relativePath), "utf8"),
  );

  for (const item of source.items ?? []) {
    if (names.has(item.name)) {
      throw new Error(`Duplicate registry item: ${item.name}`);
    }
    names.add(item.name);
    rawItems.push(item);
  }
}

const items = rawItems.map((item) => ({
  ...item,
  registryDependencies: item.registryDependencies?.map((dependency) =>
    names.has(dependency) ? `@opencoven/${dependency}` : dependency,
  ),
  files: item.files?.map((file) => ({
    ...file,
    path: file.path.replace(/^\.\.\/\.\.\//, ""),
  })),
}));

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "opencoven",
  homepage: "https://ui.opencoven.ai",
  items,
};

await writeFile(
  path.join(root, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`,
);

console.log(
  `Composed ${items.length} registry items from ${fragments.length} fragments.`,
);
