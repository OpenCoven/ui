import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [
  componentsJson,
  packageJson,
  rootPackageJson,
  tokens,
  specimenCss,
  specimenFixes,
  specimenApp,
  specimenMain,
  connectionStatus,
  commandReceipt,
  developerSurface,
  developerDocs,
  developerRegistryJson,
  registryCleanCheck,
  button,
  tooltip,
  menu,
] = await Promise.all([
  read("components.json"),
  read("packages/ui/package.json"),
  read("package.json"),
  read("packages/ui/src/styles/globals.css"),
  read("apps/specimens/src/specimens.css"),
  read("apps/specimens/src/specimens-fixes.css"),
  read("apps/specimens/src/app.tsx"),
  read("apps/specimens/src/main.tsx"),
  read("packages/ui/src/components/connection-status.tsx"),
  read("packages/ui/src/components/command-receipt.tsx"),
  read("packages/ui/src/blocks/developer-surface.tsx"),
  read("docs/developer-surface.md"),
  read("registry/developer/registry.fragment.json"),
  read("scripts/check-registry-clean.mjs"),
  read("packages/ui/src/components/ui/button.tsx"),
  read("packages/ui/src/components/ui/tooltip.tsx"),
  read("packages/ui/src/components/ui/dropdown-menu.tsx"),
]);

const config = JSON.parse(componentsJson);
const manifest = JSON.parse(packageJson);
const workspaceManifest = JSON.parse(rootPackageJson);
const developerRegistry = JSON.parse(developerRegistryJson);
const commandReceiptItem = developerRegistry.items.find(
  (item) => item.name === "command-receipt",
);
const normalizedDeveloperDocs = developerDocs.replace(/\s+/g, " ");
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
    ![
      ...Object.keys(manifest.dependencies),
      ...Object.keys(manifest.peerDependencies),
    ].some(
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
      specimenCss.includes(
        ".specimen-shell {\n    grid-template-columns: 1fr;",
      ) &&
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
  [
    "connection state is generic and accessible",
    connectionStatus.includes('label: "Pending"') &&
      !connectionStatus.includes('label: "Connecting"') &&
      connectionStatus.includes("aria-label={`${kind} ${name}"),
  ],
  [
    "command receipts use presentation-safe display data",
    commandReceipt.includes("displayCommand: string") &&
      !commandReceipt.includes("\n  command: string") &&
      commandReceipt.includes('"recovery-required"') &&
      commandReceipt.includes('label: "Unknown"'),
  ],
  [
    "developer surface uses stable item and heading identity",
    developerSurface.includes("useId") &&
      developerSurface.includes(
        "type DeveloperConnection = ConnectionStatusProps & { id: string }",
      ) &&
      developerSurface.includes(
        "type DeveloperReceipt = CommandReceiptProps & { id: string }",
      ) &&
      developerSurface.includes(
        "connections: readonly DeveloperConnection[]",
      ) &&
      developerSurface.includes("activity?: readonly DeveloperReceipt[]") &&
      developerSurface.includes("No integration state is available"),
  ],
  [
    "developer surface remains presentation only",
    developerSurface.includes("Presentation does not imply permission") &&
      developerSurface.includes(
        "performs no discovery or mutation on its own",
      ) &&
      !developerSurface.includes("@opencoven/sdk") &&
      !developerSurface.includes("@opencoven/cli"),
  ],
  [
    "developer route is explicit",
    specimenMain.includes('normalizedPath === "/developer"') &&
      specimenMain.includes("<DeveloperShowcase />"),
  ],
  [
    "developer docs preserve current SDK and CLI truth",
    normalizedDeveloperDocs.includes("@opencoven/cli") &&
      normalizedDeveloperDocs.includes(
        "private repository-development workspace",
      ) &&
      normalizedDeveloperDocs.includes("currently private and not published") &&
      normalizedDeveloperDocs.includes(
        "first public release is deliberately read-only",
      ),
  ],
  [
    "developer docs prohibit unreviewed protected data",
    developerDocs.includes("raw process arguments") &&
      developerDocs.includes("prompts, message bodies") &&
      developerDocs.includes("Renaming raw data to") &&
      developerDocs.includes("displayCommand"),
  ],
  [
    "developer registry advertises the bounded receipt contract",
    commandReceiptItem?.meta?.commandField === "displayCommand" &&
      commandReceiptItem?.meta?.protectedData === "pre-redacted-and-bounded" &&
      ["accepted", "unknown", "recovery-required"].every((status) =>
        commandReceiptItem?.meta?.states?.includes(status),
      ),
  ],
  [
    "registry drift check includes untracked generated output",
    workspaceManifest.scripts["registry:check"].includes(
      "check-registry-clean.mjs",
    ) && registryCleanCheck.includes('"--untracked-files=all"'),
  ],
];

const failed = assertions.filter(([, passed]) => !passed);
if (failed.length > 0) {
  throw new Error(
    `Contract verification failed:\n${failed.map(([name]) => `- ${name}`).join("\n")}`,
  );
}

console.log(`Verified ${assertions.length} architecture and design contracts.`);
