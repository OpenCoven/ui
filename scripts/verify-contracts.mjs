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
  specimenCards,
  specimenDefinitions,
  specimenHome,
  siteCss,
  specimenMain,
  registryJson,
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
  read("apps/specimens/src/specimens.tsx"),
  read("apps/specimens/src/use-specimens.tsx"),
  read("apps/specimens/src/home.tsx"),
  read("apps/specimens/src/site.css"),
  read("apps/specimens/src/main.tsx"),
  read("registry.json"),
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
const specimenStyles = `${specimenCss}\n${specimenFixes}\n${siteCss}`;
const siteSources = `${specimenApp}\n${specimenCards}\n${specimenHome}`;
const registry = JSON.parse(registryJson);
const componentIds = [
  "mode-switch",
  "send-control",
  "completion-palette",
  "attachment-chip",
  "metric-display",
  "plan-row",
  "activity-item",
  "resource-row",
  "tool-mix",
  "failure-surface",
  "context-meter",
  "budget-pill",
  "composer",
  "run-rail",
  "transcript-turn",
  "session-header",
];
const featuredIds = [
  "composer",
  "mode-switch",
  "budget-pill",
  "activity-item",
  "run-rail",
  "context-meter",
  "transcript-turn",
];
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
    "site shell has stable landmarks and a focusable skip target",
    specimenApp.includes('className="site-header"') &&
      specimenApp.includes('className="docs-sidebar"') &&
      specimenApp.includes('id="site-navigation"') &&
      specimenApp.includes('id="specimen-main"') &&
      specimenApp.includes('className="skip-link"') &&
      specimenApp.includes('href="#specimen-main"') &&
      specimenApp.includes("tabIndex={-1}") &&
      specimenHome.includes("tabIndex={-1}"),
  ],
  [
    "home is a distinct curated entry point",
    specimenApp.includes('const isHome = path === "/"') &&
      specimenApp.includes("<Home specimens={specimens} />") &&
      specimenHome.includes('className="home-hero"') &&
      featuredIds.every((id) => specimenHome.includes(`"${id}"`)) &&
      specimenHome.includes("specimen.preview") &&
      specimenHome.includes("href={`/docs/${id}`}") &&
      specimenHome.includes('href="/docs/introduction"') &&
      specimenHome.includes('href="/docs/components"') &&
      specimenApp.includes("<SiteFooter />"),
  ],
  [
    "docs, individual specimens and assembled lab have real routes",
    specimenApp.includes('path.startsWith("/docs/")') &&
      specimenApp.includes('id: "introduction"') &&
      specimenApp.includes('id: "installation"') &&
      specimenApp.includes('pageId === "components"') &&
      specimenApp.includes("<SpecimenCard specimen={specimen} detail />") &&
      specimenApp.includes('<nav className="docs-toc"') &&
      specimenApp.includes('const isLab = path === "/lab"') &&
      specimenApp.includes("<Lab density={density} />"),
  ],
  [
    "search and mobile navigation expose keyboard and expanded state",
    specimenApp.includes("event.metaKey || event.ctrlKey") &&
      specimenApp.includes('event.key.toLowerCase() === "k"') &&
      specimenApp.includes('event.key === "Escape"') &&
      specimenApp.includes("menuButtonRef.current.focus()") &&
      specimenApp.includes('aria-controls="site-navigation"') &&
      specimenApp.includes("aria-expanded={menuOpen}") &&
      specimenApp.includes("data-menu-open={menuOpen}") &&
      specimenApp.includes("href={`/docs/${item.id}`}"),
  ],
  [
    "catalog restores task hierarchy",
    ["group-composer", "group-run-rail", "group-blocks"].every((id) =>
      specimenDefinitions.includes(id),
    ) &&
      specimenCards.includes('className="catalog-group__summary"') &&
      specimenCards.includes("<h2>{group}</h2>"),
  ],
  [
    "install tab separates CLI from package API",
    specimenCards.includes(
      '<TabsTrigger value="install">Install</TabsTrigger>',
    ) &&
      specimenCards.includes(
        '<TabsTrigger value="react-api">React API</TabsTrigger>',
      ) &&
      /<TabsContent value="install"[\s\S]*?<span>CLI<\/span>[\s\S]*?<\/TabsContent>/.test(
        specimenCards,
      ) &&
      !/<TabsContent value="install"(?:(?!<\/TabsContent>)[\s\S])*package API/.test(
        specimenCards,
      ) &&
      /<TabsContent value="react-api"[\s\S]*?<span>TypeScript<\/span>[\s\S]*?<small>package API<\/small>/.test(
        specimenCards,
      ),
  ],
  [
    "install snippets derive valid registry and package paths",
    specimenCards.includes(
      'specimen.group === "Blocks" ? "blocks" : "components"',
    ) &&
      specimenCards.includes(
        "const registryUrl = `https://ui.opencoven.ai/r/${specimen.id}.json`;",
      ) &&
      specimenCards.includes(
        "const packagePath = `@opencoven/ui/${sourceKind}/${specimen.id}`;",
      ) &&
      specimenCards.includes('.split("-")') &&
      specimenCards.includes(".toUpperCase()") &&
      specimenCards.includes("<CopyCodeButton"),
  ],
  [
    "install snippets use visible syntax roles",
    [
      "syntax-command",
      "syntax-keyword",
      "syntax-package",
      "syntax-string",
      "syntax-symbol",
      "syntax-punctuation",
    ].every(
      (className) =>
        specimenCards.includes(`className="${className}"`) &&
        specimenCss.includes(`.${className}`),
    ),
  ],
  [
    "density control is explicit and outside the home/header",
    specimenCards.includes('aria-label="Display density"') &&
      !specimenHome.includes("<DensityControl") &&
      !specimenApp
        .slice(
          specimenApp.indexOf('<header className="site-header"'),
          specimenApp.indexOf(
            "</header>",
            specimenApp.indexOf('<header className="site-header"'),
          ),
        )
        .includes("<DensityControl") &&
      specimenApp.includes('className="docs-preview-toolbar"'),
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
    "responsive sidebar is explicitly disclosed rather than clipped",
    siteCss.includes("@media (max-width: 48rem)") &&
      /\.site-menu-toggle\s*\{[^}]*display:\s*inline-flex;/.test(siteCss) &&
      /\.docs-sidebar\s*\{[^}]*display:\s*none;/.test(siteCss) &&
      /\.site-layout\[data-menu-open="true"\] \.docs-sidebar\s*\{[^}]*display:\s*block;/.test(
        siteCss,
      ),
  ],
  [
    "responsive grids remove intrinsic sizing floors",
    siteCss.includes("grid-template-columns: 15rem minmax(0, 1fr)") &&
      siteCss.includes(".home-showcase") &&
      specimenFixes.includes(
        ".specimen-grid {\n    grid-template-columns: minmax(0, 1fr);",
      ),
  ],
  [
    "mobile documentation navigation retains all groups and routes",
    specimenApp.includes("groupOrder.map((group)") &&
      specimenApp.includes("guides.map((item)") &&
      specimenApp.includes('aria-label="Documentation navigation"') &&
      /\.docs-nav-group a\s*\{[^}]*min-width:\s*0;/.test(siteCss),
  ],
  [
    "mobile card tabs preserve enlarged labels",
    /\.specimen-card > \[data-slot="tabs"\] > \[data-slot="tabs-list"\]\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(5\.25rem,\s*1fr\)\);[^}]*overflow-x:\s*auto;/.test(
      specimenFixes,
    ),
  ],
  [
    "mobile tab selection and focus stay inside scrollport",
    /\[data-slot="tabs-trigger"\]\[data-active\]::after\s*\{[^}]*inset-block-end:\s*0 !important;/.test(
      specimenFixes,
    ) &&
      /\[data-slot="tabs-trigger"\]:focus-visible\s*\{[^}]*outline-offset:\s*-3px;/.test(
        specimenFixes,
      ),
  ],
  [
    "text resize allows header and hero actions to wrap",
    /\.site-header__inner\s*\{[^}]*flex-wrap:\s*wrap;/.test(siteCss) &&
      /\.site-actions\s*\{[^}]*flex-wrap:\s*wrap;/.test(siteCss) &&
      /\.site-search\s*\{[^}]*flex:\s*1 1 12rem;[^}]*width:\s*auto;/.test(
        siteCss,
      ) &&
      /\.home-actions\s*\{[^}]*flex-wrap:\s*wrap;/.test(siteCss),
  ],
  [
    "site styles load after component regression guards",
    specimenMain.indexOf('import "./site.css"') >
      specimenMain.indexOf('import "./specimens-fixes.css"') &&
      specimenMain.includes('import "@opencoven/ui/globals.css"'),
  ],
  [
    "previews use public package modules",
    specimenDefinitions.includes('from "@opencoven/ui"') &&
      specimenCards.includes('from "@opencoven/ui"') &&
      !siteSources.includes("packages/ui/src"),
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
  ["header actions", 'className="site-actions"', ".site-actions"],
  ["density control", 'className="density-control"', ".density-control"],
  ["brand", 'className="site-brand"', ".site-brand"],
  ["sidebar", 'className="docs-sidebar"', ".docs-sidebar"],
  ["home hero", 'className="home-hero"', ".home-hero"],
  ["home showcase", 'className="home-showcase"', ".home-showcase"],
  ["footer", 'className="site-footer"', ".site-footer"],
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
    siteSources.includes(markup) && specimenStyles.includes(selector),
  ]);
}

for (const id of componentIds) {
  const kind = [
    "composer",
    "run-rail",
    "transcript-turn",
    "session-header",
  ].includes(id)
    ? "blocks"
    : "components";
  const sourcePath = `packages/ui/src/${kind}/${id}.tsx`;
  const exportName = id
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  const source = await read(sourcePath);
  const published = JSON.parse(await read(`public/r/${id}.json`));
  assertions.push([
    `${id} has an installable registry artifact and public React export`,
    specimenDefinitions.includes(`id: "${id}"`) &&
      registry.items.some(
        (item) =>
          item.name === id &&
          item.files.some((file) => file.path === sourcePath),
      ) &&
      published.name === id &&
      published.files.some(
        (file) =>
          file.path === sourcePath && file.content?.includes(exportName),
      ) &&
      Boolean(manifest.exports[`./${kind}/*`]) &&
      source.includes(exportName),
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
