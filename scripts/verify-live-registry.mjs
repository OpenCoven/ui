// Post-deploy smoke test: confirms the deployed site serves every registry
// item as JSON. Network-dependent, so it is deliberately not part of `pnpm
// check` — run it after a deploy.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(
  await readFile(path.join(root, "registry.json"), "utf8"),
);
const base = (process.argv[2] ?? registry.homepage).replace(/\/$/, "");
const registrySource = path.join(root, "public", "r");

const names = (await readdir(registrySource))
  .filter((name) => name.endsWith(".json"))
  .sort();

const failures = [];

for (const name of names) {
  const url = `${base}/r/${name}`;
  let response;
  try {
    response = await fetch(url, { redirect: "follow" });
  } catch (error) {
    failures.push(`${url} :: request failed :: ${error.message}`);
    continue;
  }
  const body = await response.text();
  if (!response.ok) {
    failures.push(`${url} :: HTTP ${response.status}`);
    continue;
  }
  if (body.trimStart().startsWith("<")) {
    failures.push(`${url} :: served HTML, not JSON (SPA rewrite captured it)`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (error) {
    failures.push(`${url} :: invalid JSON :: ${error.message}`);
    continue;
  }
  const expected = await readFile(path.join(registrySource, name), "utf8");
  if (body !== expected) {
    failures.push(`${url} :: differs from public/r/${name}`);
    continue;
  }
  if (
    name !== "registry.json" &&
    parsed.name !== path.basename(name, ".json")
  ) {
    failures.push(`${url} :: item name is "${parsed.name}"`);
  }
}

// A missing item must 404 rather than resolve to the SPA shell, or `shadcn
// add` reports a JSON parse error instead of "not found".
const missingUrl = `${base}/r/__does_not_exist__.json`;
const missing = await fetch(missingUrl, { redirect: "follow" });
if (missing.status !== 404) {
  failures.push(
    `${missingUrl} :: expected HTTP 404, got ${missing.status} (SPA rewrite is masking missing items)`,
  );
}

if (failures.length > 0) {
  console.error(`Live registry check failed against ${base}:`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Live registry check passed: ${names.length} items served as JSON from ${base}/r, missing items return 404`,
);
