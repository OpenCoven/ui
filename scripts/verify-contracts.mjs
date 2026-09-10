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
  codeSnippet,
  componentPreview,
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
  read("apps/specimens/src/code-snippet.tsx"),
  read("apps/specimens/src/component-preview.tsx"),
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
const specimenAt880 = specimenCss.slice(
  specimenCss.indexOf("@media (max-width: 880px)"),
  specimenCss.indexOf("@media (max-width: 48rem)"),
);
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
    tokens.includes("--presence: var(--oc-presence)") &&
      tokens.includes("--primary: var(--oc-action)") &&
      tokens.includes("--oc-presence: #b991ff") &&
      tokens.includes("--oc-action: #8e3dff"),
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
    ) &&
      specimenApp.includes('className="catalog-group__summary"') &&
      specimenApp.includes("<h2>{group}</h2>"),
  ],
  [
    "CLI and React API tabs stay separate",
    specimenApp.includes('<TabsTrigger value="cli">CLI</TabsTrigger>') &&
      specimenApp.includes(
        '<TabsTrigger value="react-api">React API</TabsTrigger>',
      ) &&
      !specimenApp.includes('<TabsTrigger value="api">API</TabsTrigger>') &&
      specimenApp.includes('language="typescript"') &&
      specimenApp.includes("label={`Import ${specimen.title}`}"),
  ],
  [
    "source shares the live preview viewport without resetting it",
    componentPreview.includes('className="specimen-preview__canvas"') &&
      componentPreview.includes("keepMounted") &&
      componentPreview.includes("hidden={false}") &&
      componentPreview.includes('visibility: sourceOpen ? "hidden"') &&
      componentPreview.includes("inert={sourceOpen}") &&
      /\.specimen-source-overlay\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;/.test(
        specimenCss,
      ),
  ],
  [
    "supported states remain outside preview and source tabs",
    specimenApp.includes('className="specimen-states"') &&
      !specimenApp.includes('<TabsTrigger value="states">') &&
      componentPreview.includes('<TabsTrigger value="source">'),
  ],
  [
    "install snippets derive valid registry and package paths",
    specimenApp.includes(
      'specimen.group === "Blocks" ? "blocks" : "components"',
    ) &&
      specimenApp.includes(
        "const registryUrl = `https://ui.opencoven.ai/r/${specimen.id}.json`;",
      ) &&
      specimenApp.includes(
        "const packagePath = `@opencoven/ui/${sourceKind}/${specimen.id}`;",
      ) &&
      specimenApp.includes('.split("-")') &&
      specimenApp.includes(".toUpperCase()"),
  ],
  [
    "install snippets use visible syntax roles",
    ["hljs-built_in", "hljs-keyword", "hljs-title", "hljs-string"].every(
      (className) => specimenCss.includes(`.${className}`),
    ) &&
      codeSnippet.includes("hljs.highlight(") &&
      specimenApp.includes('language="bash"'),
  ],
  [
    "the app uses compact sizing without density controls or labels",
    specimenApp.includes('const density = "compact";') &&
      !specimenApp.includes("DensityControl") &&
      !specimenApp.includes("<dt>Densities</dt>") &&
      !specimenStyles.includes(".density-control"),
  ],
  [
    "mobile layout covers 390px",
    specimenStyles.includes("@media (max-width: 24.375rem)") &&
      /\.specimen-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/.test(
        specimenCss,
      ),
  ],
  [
    "minimum viewport floor does not scale with text",
    /html\s*\{[^}]*min-width:\s*320px/.test(specimenStyles),
  ],
  [
    "catalog matches the original desktop shell and reading gutters",
    /\.specimen-shell\s*\{[^}]*max-width:\s*1680px;[^}]*grid-template-columns:\s*248px minmax\(0,\s*1fr\) 216px;/.test(
      specimenCss,
    ) &&
      specimenCss.includes("clamp(24px, 5vw, 72px)") &&
      specimenCss.includes("grid-template-columns: 232px minmax(0, 1fr);"),
  ],
  [
    "responsive rail becomes a compact component picker at the original breakpoint",
    specimenAt880.startsWith("@media (max-width: 880px)") &&
      /\.specimen-shell\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/.test(
        specimenAt880,
      ) &&
      /\.specimen-mobile-nav\s*\{[^}]*display:\s*block;/.test(specimenAt880),
  ],
  [
    "responsive grids remove intrinsic sizing floors",
    /\.specimen-shell[^{}]*\{[^}]*min-width:\s*0;/.test(specimenFixes) &&
      /\.specimen-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/.test(
        specimenCss,
      ),
  ],
  [
    "mobile catalog navigation exposes the same grouped component inventory",
    specimenApp.includes("<optgroup label={group} key={group}>") &&
      specimenApp.includes("<option value={specimen.id} key={specimen.id}>") &&
      specimenApp.includes('aria-label="Component navigation"'),
  ],
  [
    "mobile card tabs preserve enlarged labels",
    /\.specimen-card > \[data-slot="tabs"\] > \[data-slot="tabs-list"\]\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(5\.25rem,\s*1fr\)\);[^}]*overflow-x:\s*auto;/.test(
      specimenFixes,
    ),
  ],
  [
    "mobile tab selection and focus stay inside scrollport",
    /\.specimen-code-tabs \[role="tab"\]\[data-active\]::after\s*\{[^}]*inset-block-end:\s*0;/.test(
      specimenFixes,
    ) &&
      /\.specimen-code-tabs \[role="tab"\]:focus-visible\s*\{[^}]*outline-offset:\s*-3px;/.test(
        specimenFixes,
      ),
  ],
  [
    "text resize keeps shell chrome and hero contained",
    specimenFixes.includes(
      ".specimen-topbar__inner {\n    display: flex;\n    flex-wrap: wrap;",
    ) &&
      /\.specimen-topbar__actions\s*\{[^}]*display:\s*flex;[^}]*flex:\s*1 0 100%;[^}]*flex-wrap:\s*wrap;/.test(
        specimenFixes,
      ) &&
      /\.specimen-search\s*\{[^}]*width:\s*auto;[^}]*min-width:\s*7rem;[^}]*flex:\s*1 1 10rem;/.test(
        specimenFixes,
      ) &&
      /\.specimen-main__inner[^{}]*\{[^}]*box-sizing:\s*border-box;/.test(
        specimenFixes,
      ) &&
      /\.specimen-stats\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/.test(
        specimenStyles,
      ),
  ],
  /*
   * Optional decoration must stay outside public surfaces and yield to
   * accessibility preferences. Flat canonical surfaces need no image reset.
   */
  [
    "decorative layers stay out of public component surfaces",
    !/\[data-slot="[^"]+"\][^{}]*\{[^}]*gradient\(/.test(specimenCss),
  ],
  [
    "decorative layers yield to contrast and forced-colors preferences",
    !/(?:gradient\(|background-image:)/.test(specimenCss) ||
      (/@media \(prefers-contrast: more\)\s*\{[^@]*background-image:\s*none;/.test(
        specimenCss,
      ) &&
        /@media \(forced-colors: active\)\s*\{[^@]*background-image:\s*none;/.test(
          specimenCss,
        )),
  ],
  [
    "specimen chrome never animates perpetually",
    // Comments are stripped first so prose describing the rule cannot satisfy
    // or violate it.
    (() => {
      const code = specimenCss.replace(/\/\*[\s\S]*?\*\//g, "");
      return (
        !code.includes("@keyframes") &&
        !/animation(-name)?:\s*(?!none)/.test(code)
      );
    })(),
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
  ["scheme control", 'className="scheme-control"', ".scheme-control"],
  ["rail groups", 'className="specimen-rail__group"', ".specimen-rail__group"],
  ["mobile picker", 'className="specimen-mobile-nav"', ".specimen-mobile-nav"],
  ["context rail", 'className="specimen-toc"', ".specimen-toc"],
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
  [
    "catalog summary",
    'className="catalog-group__summary"',
    ".catalog-group__summary",
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
