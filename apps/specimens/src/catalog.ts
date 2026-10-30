import type { ComponentType } from "react";
import registryText from "../../../registry.json?raw";
import exampleSource from "./examples.tsx?raw";
import * as examples from "./examples";

export type Density = "default" | "compact";
export type Group =
  "Foundations" | "Composer controls" | "Run & evidence" | "Blocks";
export const groups: Group[] = [
  "Foundations",
  "Composer controls",
  "Run & evidence",
  "Blocks",
];
export const repository = "https://github.com/OpenCoven/ui";
export const registryOrigin = "https://ui.opencoven.ai/r";
type RegistryItem = {
  name: string;
  title: string;
  type: string;
  description: string;
  files: { path: string; target?: string }[];
  meta?: { examples?: string[]; primitive?: string; density?: string[] };
};
const registry = JSON.parse(registryText) as { items: RegistryItem[] };
const sources = import.meta.glob("../../../packages/ui/src/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const inputs = [
  "mode-switch",
  "send-control",
  "completion-palette",
  "attachment-chip",
  "search-field",
];

export const catalog = registry.items
  .filter((item) =>
    ["registry:ui", "registry:component", "registry:block"].includes(item.type),
  )
  .map((item) => {
    const symbol = item.name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    const exampleName = `${symbol}Example` as keyof typeof examples;
    const file = item.files[0];
    if (!file || !examples[exampleName])
      throw new Error(`Missing documentation example: ${item.name}`);
    const sourcePath = file.path;
    const group: Group =
      item.type === "registry:block"
        ? "Blocks"
        : sourcePath.includes("/components/ui/")
          ? "Foundations"
          : inputs.includes(item.name)
            ? "Composer controls"
            : "Run & evidence";
    const source = sources[`../../../${sourcePath}`] ?? "";
    const api = source.match(/type \w+Props = [\s\S]*?\n};/)?.[0];
    return {
      ...item,
      group,
      symbol,
      exampleName,
      sourcePath,
      api,
      source,
      Component: examples[exampleName] as ComponentType<{ density?: Density }>,
      packagePath: sourcePath
        .replace("packages/ui/src/", "@opencoven/ui/")
        .replace(/\.tsx$/, ""),
      consumerPath: (file.target ?? "")
        .replace("@ui/", "@/components/ui/")
        .replace("@components/", "@/components/")
        .replace(/\.tsx$/, ""),
    };
  })
  .sort(
    (a, b) =>
      groups.indexOf(a.group) - groups.indexOf(b.group) ||
      a.title.localeCompare(b.title),
  );

export type CatalogEntry = (typeof catalog)[number];
export const guides = [
  { href: "/docs", title: "Introduction" },
  { href: "/docs/installation", title: "Installation" },
  { href: "/docs/theming", title: "Theming" },
];
export function componentHref(id: string) {
  return `/docs/components/${id}`;
}
export function installCommand(id: string) {
  return `pnpm dlx shadcn@latest add ${registryOrigin}/${id}.json`;
}
export function exampleCode(entry: CatalogEntry) {
  const body =
    exampleSource
      .split(`export function ${entry.exampleName}(`)[1]
      ?.split("\nexport function ")[0]
      ?.trim() ?? "";
  const code = `export function ${entry.exampleName}(${body}`;
  const imports =
    [
      ...exampleSource.matchAll(/import \{([^}]+)\} from "@opencoven\/ui";/g),
    ][0]?.[1] ?? "";
  const uiImports = imports
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name && new RegExp(`\\b${name}\\b`).test(code));
  return `${code.includes("useState") ? 'import { useState } from "react";\n' : ""}import { ${uiImports.join(", ")} } from "@opencoven/ui";\n\n${code}`;
}
