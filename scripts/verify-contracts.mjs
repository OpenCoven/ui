import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [
  componentsJson,
  packageJson,
  tokens,
  specimenCss,
  specimenApp,
  specimenMain,
  developerSurface,
  developerDocs,
  button,
  tooltip,
  menu,
] = await Promise.all([
  read("components.json"),
  read("packages/ui/package.json"),
  read("packages/ui/src/styles/globals.css"),
  read("apps/specimens/src/specimens.css"),
  read("apps/specimens/src/app.tsx"),
  read("apps/specimens/src/main.tsx"),
  read("packages/ui/src/blocks/developer-surface.tsx"),
  read("docs/developer-surface.md"),
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
    "developer UI does not depend on SDK or CLI runtimes",
    ![...Object.keys(manifest.dependencies), ...Object.keys(manifest.peerDependencies)].some(
      (name) =>
        name === "@opencoven/sdk" ||
        name === "@opencoven/sdk-core" ||
        name === "@opencoven/cave-client" ||
        name === "@opencoven/coven-client" ||
        name === "@opencoven/cli",
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
    specimenCss.includes("@media (max-width: 24.375rem)"),
  ],
  [
    "responsive rail becomes compact navigation",
    specimenCss.includes("@media (max-width: 68rem)") &&
      specimenCss.includes(".specimen-rail__context") &&
      specimenCss.includes(".specimen-rail__package"),
  ],
  [
    "specimen chrome avoids decorative gradients",
    !specimenCss.includes("gradient("),
  ],
  [
    "filled action variants are explicit",
    button.includes("primary:") && button.includes("presence:"),
  ],
  [
    "developer surface remains presentation only",
    developerSurface.includes("Presentation does not imply permission") &&
      developerSurface.includes("performs no discovery or mutation on its own") &&
      !developerSurface.includes("@opencoven/sdk") &&
      !developerSurface.includes("@opencoven/cli"),
  ],
  [
    "developer route is explicit",
    specimenMain.includes('normalizedPath === "/developer"') &&
      specimenMain.includes("<DeveloperShowcase />"),
  ],
  [
    "developer docs distinguish public CLI and experimental SDK",
    developerDocs.includes("@opencoven/cli") &&
      developerDocs.includes("private experimental `@opencoven/dev-cli`") &&
      developerDocs.includes("first public release is intentionally read-only"),
  ],
];

const failed = assertions.filter(([, passed]) => !passed);
if (failed.length > 0) {
  throw new Error(
    `Contract verification failed:\n${failed.map(([name]) => `- ${name}`).join("\n")}`,
  );
}

console.log(`Verified ${assertions.length} architecture and design contracts.`);
