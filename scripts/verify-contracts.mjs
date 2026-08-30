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
]);

const config = JSON.parse(componentsJson);
const manifest = JSON.parse(packageJson);
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
      specimenFixes.includes("grid-template-columns: repeat(5, minmax(0, 1fr))"),
  ],
  [
    "minimum viewport floor does not scale with text",
    /html\s*\{[^}]*min-width:\s*320px/.test(specimenFixes),
  ],
  [
    "responsive rail becomes compact navigation",
    specimenCss.includes("@media (max-width: 68rem)") &&
      specimenCss.includes(".specimen-shell {\n    grid-template-columns: 1fr;") &&
      specimenCss.includes("@media (max-width: 48rem)") &&
      specimenCss.includes(
        ".specimen-rail__nav {\n    grid-template-columns: repeat(3, minmax(0, 1fr));",
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

const failed = assertions.filter(([, passed]) => !passed);
if (failed.length > 0) {
  throw new Error(
    `Contract verification failed:\n${failed.map(([name]) => `- ${name}`).join("\n")}`,
  );
}

console.log(`Verified ${assertions.length} architecture and design contracts.`);
