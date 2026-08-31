import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [
  componentsJson,
  packageJson,
  tokens,
  specimenCss,
  specimenFixes,
  specimenApp,
  button,
  tooltip,
  menu,
  portableJson,
  vectorsJson,
  fixture,
  fixtureScript,
  portableDocs,
] = await Promise.all([
  read("components.json"),
  read("packages/ui/package.json"),
  read("packages/ui/src/styles/globals.css"),
  read("apps/specimens/src/specimens.css"),
  read("apps/specimens/src/specimens-fixes.css"),
  read("apps/specimens/src/app.tsx"),
  read("packages/ui/src/components/ui/button.tsx"),
  read("packages/ui/src/components/ui/tooltip.tsx"),
  read("packages/ui/src/components/ui/dropdown-menu.tsx"),
  read("contracts/web-interactions.v1.json"),
  read("contracts/test-vectors.v1.json"),
  read("contracts/fixtures/reference.html"),
  read("contracts/fixtures/reference.js"),
  read("contracts/README.md"),
]);

const config = JSON.parse(componentsJson);
const manifest = JSON.parse(packageJson);
const portable = JSON.parse(portableJson);
const vectors = JSON.parse(vectorsJson);
const specimenStyles = `${specimenCss}\n${specimenFixes}`;
const assertions = [
  ["style is base-nova", config.style === "base-nova"],
  ["base color is zinc", config.tailwind.baseColor === "zinc"],
  ["CSS variables are enabled", config.tailwind.cssVariables === true],
  ["Base UI is installed", "@base-ui/react" in manifest.dependencies],
  [
    "Radix is not introduced",
    !Object.keys(manifest.dependencies).some((name) =>
      name.startsWith("@radix-ui/"),
    ),
  ],
  [
    "React Aria is not introduced",
    !Object.keys(manifest.dependencies).some((name) =>
      name.startsWith("react-aria"),
    ),
  ],
  [
    "tool classes are canonical",
    ["read", "write", "exec", "net"].every(
      (name) =>
        (tokens.match(new RegExp(`--tool-${name}:`, "g")) ?? []).length === 2,
    ),
  ],
  [
    "presence is independent from primary",
    tokens.includes("--presence: #9386d0") &&
      tokens.includes("--primary: #e4e4e7"),
  ],
  [
    "one exact radius scale is defined",
    ["4px", "8px", "12px", "16px"].every((value, index) =>
      tokens.includes(`--radius-${index + 1}: ${value}`),
    ),
  ],
  [
    "numeric utility is tabular",
    tokens.includes("font-variant-numeric: tabular-nums"),
  ],
  [
    "default and compact density exist",
    tokens.includes('[data-density="compact"]') &&
      tokens.includes("--density-control: 2rem"),
  ],
  [
    "reduced motion is explicit",
    tokens.includes("@media (prefers-reduced-motion: reduce)") &&
      tokens.includes("animation-duration: 0.01ms"),
  ],
  [
    "overlays use portals and positioners",
    [tooltip, menu].every(
      (source) =>
        source.includes("Primitive.Portal") &&
        source.includes("Primitive.Positioner"),
    ),
  ],
  [
    "specimen shell has stable landmarks",
    specimenApp.includes('className="specimen-topbar"') &&
      specimenApp.includes('className="specimen-rail"') &&
      specimenApp.includes('id="specimen-main"') &&
      specimenApp.includes('className="skip-link"'),
  ],
  [
    "catalog restores task hierarchy",
    ["group-composer", "group-run-rail", "group-blocks"].every((id) =>
      specimenApp.includes(id),
    ),
  ],
  [
    "density control is explicit",
    specimenApp.includes('aria-label="Display density"') &&
      !specimenApp.includes("nth-child(2)"),
  ],
  [
    "mobile layout covers 390px",
    specimenFixes.includes("@media (max-width: 24.375rem)") &&
      specimenFixes.includes(
        "grid-template-columns: repeat(5, minmax(0, 1fr))",
      ),
  ],
  [
    "minimum viewport floor does not scale with text",
    /html\s*\{[^}]*min-width:\s*320px/.test(specimenFixes),
  ],
  [
    "responsive rail becomes compact navigation",
    specimenCss.includes("@media (max-width: 68rem)") &&
      /@media \(max-width: 68rem\)[\s\S]*?\.specimen-shell\s*\{[^}]*grid-template-columns:\s*1fr;/.test(
        specimenCss,
      ) &&
      /@media \(max-width: 68rem\)[\s\S]*?\.specimen-rail__nav\s*\{[^}]*display:\s*flex;/.test(
        specimenCss,
      ),
  ],
  [
    "responsive grids remove intrinsic sizing floors",
    specimenFixes.includes(
      ".specimen-shell {\n    grid-template-columns: minmax(0, 1fr);",
    ) &&
      specimenFixes.includes(
        ".specimen-grid {\n    grid-template-columns: minmax(0, 1fr);",
      ),
  ],
  [
    "text resize keeps shell chrome and hero contained",
    specimenFixes.includes(
      ".specimen-topbar__inner {\n    display: flex;\n    flex-wrap: wrap;",
    ) &&
      specimenFixes.includes(
        ".specimen-topbar__actions {\n    flex: 1 0 100%;",
      ) &&
      specimenFixes.includes(
        ".specimen-main__inner {\n    box-sizing: border-box;",
      ) &&
      specimenFixes.includes(
        ".specimen-stats {\n    grid-template-columns: repeat(3, minmax(0, 1fr));",
      ),
  ],
  [
    "specimen chrome avoids decorative gradients",
    !specimenCss.includes("gradient("),
  ],
  [
    "filled action variants are explicit",
    button.includes("primary:") && button.includes("presence:"),
  ],
];

const specimenSelectorPairs = [
  [
    "topbar actions",
    'className="specimen-topbar__actions"',
    ".specimen-topbar__actions",
  ],
  ["density control", 'className="density-control"', ".density-control"],
  ["scheme control", 'className="scheme-control"', ".scheme-control"],
  [
    "rail context",
    'className="specimen-rail__context"',
    ".specimen-rail__context",
  ],
  ["rail kicker", 'className="specimen-kicker numeric"', ".specimen-kicker"],
  [
    "rail package",
    'className="specimen-rail__package"',
    ".specimen-rail__package",
  ],
  ["hero", 'className="specimen-hero"', ".specimen-hero"],
  ["hero copy", 'className="specimen-hero__copy"', ".specimen-hero__copy"],
  ["hero stats", 'className="specimen-stats"', ".specimen-stats"],
  [
    "catalog eyebrow",
    'className="catalog-group__eyebrow numeric"',
    ".catalog-group__eyebrow",
  ],
  ["specimen grid", 'className="specimen-grid"', ".specimen-grid"],
];

for (const [name, markup, selector] of specimenSelectorPairs) {
  assertions.push([
    `${name} markup and CSS stay paired`,
    specimenApp.includes(markup) && specimenStyles.includes(selector),
  ]);
}

const obsoleteSpecimenSelectors = [
  ".specimen-topbar__tools",
  ".specimen-density",
  ".specimen-topbar__icon",
  ".specimen-rail__intro",
  ".specimen-eyebrow",
  ".catalog-group__grid",
];

for (const selector of obsoleteSpecimenSelectors) {
  assertions.push([
    `obsolete specimen selector is absent: ${selector}`,
    !specimenStyles.includes(selector),
  ]);
}

const requiredPrimitives = [
  "action",
  "disclosure",
  "global-navigation",
  "mobile-navigation",
  "tabs",
  "tooltip",
  "status-indicator",
  "progress",
  "copy-control",
  "download-chooser",
  "theme-control",
  "dialog",
  "guided-proof",
  "error-surface",
];
const portableFailures = [];
const requirePortable = (condition, message) => {
  if (!condition) portableFailures.push(message);
};

requirePortable(
  portable.schemaVersion === "opencoven.ui-web-interactions/v1",
  "portable schemaVersion must be v1",
);
requirePortable(
  vectors.schemaVersion === "opencoven.ui-test-vectors/v1",
  "vector schemaVersion must be v1",
);
requirePortable(
  portable.contractVersion === vectors.contractVersion &&
    /^\d+\.\d+\.\d+$/.test(portable.contractVersion),
  "portable contract and vector semver must match",
);
requirePortable(
  portable.owner === "OpenCoven/ui",
  "portable owner must be OpenCoven/ui",
);
for (const law of [
  "nativeFirst",
  "staticFirst",
  "oneFilledAction",
  "visibleFocus",
  "nonColorState",
  "modalOnlyFocusTrap",
  "unsupportedIsNotPass",
]) {
  requirePortable(
    portable.global?.[law] === true,
    `missing global law: ${law}`,
  );
}
requirePortable(
  portable.global?.targetMinimumCssPx?.every((value) => value >= 44),
  "target minimum must be 44×44 CSS px",
);

const allowedStates = new Set(portable.global?.states ?? []);
for (const id of requiredPrimitives) {
  const primitive = portable.primitives?.[id];
  requirePortable(Boolean(primitive), `missing primitive: ${id}`);
  if (!primitive) continue;
  requirePortable(
    primitive.selector === `[data-oc-primitive="${id}"]`,
    `${id} selector drifted`,
  );
  for (const field of [
    "semantics",
    "parts",
    "states",
    "keyboard",
    "focus",
    "noJavaScript",
    "failure",
    "forbidden",
  ]) {
    requirePortable(primitive[field] !== undefined, `${id} missing ${field}`);
  }
  for (const state of primitive.states ?? []) {
    requirePortable(
      allowedStates.has(state),
      `${id} has unknown state ${state}`,
    );
  }
}

const vectorIds = new Set();
const covered = new Set();
for (const vector of vectors.vectors ?? []) {
  requirePortable(!vectorIds.has(vector.id), `duplicate vector ${vector.id}`);
  vectorIds.add(vector.id);
  covered.add(vector.primitive);
  requirePortable(
    Boolean(portable.primitives?.[vector.primitive]),
    `${vector.id} has unknown primitive`,
  );
  for (const field of ["modes", "steps", "assertions", "mutationGuard"]) {
    requirePortable(
      vector[field] !== undefined,
      `${vector.id} missing ${field}`,
    );
  }
}
requirePortable(
  vectorIds.size >= 24,
  "at least 24 shared vectors are required",
);
for (const id of requiredPrimitives.filter((id) => id !== "disclosure")) {
  requirePortable(covered.has(id), `no vector covers ${id}`);
}
for (const mode of [
  "no-js",
  "reduced-motion",
  "forced-colors",
  "320px",
  "200%-zoom",
]) {
  requirePortable(
    vectors.vectors.some((vector) => vector.modes.includes(mode)),
    `no vector covers ${mode}`,
  );
}

for (const id of requiredPrimitives.filter((id) => id !== "disclosure")) {
  requirePortable(
    fixture.includes(`data-oc-primitive="${id}"`),
    `reference fixture is missing ${id}`,
  );
}
requirePortable(
  fixture.includes("<details") && fixture.includes("<summary"),
  "mobile reference must be static-first",
);
requirePortable(
  fixture.includes('aria-live="polite"') &&
    fixture.includes('aria-atomic="true"'),
  "async reference status must be polite and atomic",
);
requirePortable(
  fixture.includes('href="/download/mac"') &&
    fixture.includes("releases/latest"),
  "download reference must retain links and fallback",
);
requirePortable(
  fixtureScript.includes("navigator.clipboard.writeText") &&
    fixtureScript.includes("Could not copy"),
  "copy reference must include success/failure behavior",
);
requirePortable(
  fixtureScript.includes('event.key==="Escape"') &&
    fixtureScript.includes("trigger?.focus()"),
  "mobile reference must restore focus on Escape",
);
requirePortable(
  fixtureScript.includes("dialog.showModal()") &&
    fixtureScript.includes("opener?.focus()"),
  "dialog reference must be modal and restore focus",
);
requirePortable(
  portableDocs.includes("unsupported is never counted as pass") &&
    portableDocs.includes("page JavaScript never owns installer bytes"),
  "portable docs must preserve failure and download boundaries",
);

const failed = [
  ...assertions.filter(([, passed]) => !passed).map(([name]) => name),
  ...portableFailures,
];
if (failed.length > 0) {
  throw new Error(
    `Contract verification failed:\n${failed.map((name) => `- ${name}`).join("\n")}`,
  );
}

console.log(
  `Verified ${assertions.length} architecture contracts and ${requiredPrimitives.length} portable primitives across ${vectorIds.size} shared vectors.`,
);
