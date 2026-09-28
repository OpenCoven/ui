import path from "node:path";
import { runReview } from "./visual-review.mjs";

await runReview({
  name: "mobile quality review",
  baseUrl: process.env.BASE_URL ?? "http://127.0.0.1:4173",
  chromePath: process.env.CHROME_PATH,
  outputDir: path.resolve(
    process.env.MOBILE_OUTPUT_DIR ?? "artifacts/mobile-quality",
  ),
  port: Number(process.env.MOBILE_CHROME_PORT ?? 9233),
  scenarios: [
    { name: "home-320-dark", pathname: "/", width: 320 },
    {
      name: "home-320-text-200",
      pathname: "/",
      width: 320,
      textScale: 2,
      captureMenu: true,
      captureHomeDetails: true,
    },
    {
      name: "home-390-text-200",
      pathname: "/",
      width: 390,
      textScale: 2,
      captureMenu: true,
    },
    {
      name: "home-430-light-rtl",
      pathname: "/",
      width: 430,
      scheme: "light",
      rtl: true,
    },
    {
      name: "docs-introduction-320-text-200",
      pathname: "/docs/introduction",
      width: 320,
      textScale: 2,
    },
    {
      name: "docs-installation-430-text-200",
      pathname: "/docs/installation",
      width: 430,
      textScale: 2,
    },
    { name: "catalog-320-dark", pathname: "/docs/components", width: 320 },
    {
      name: "catalog-375-light-compact",
      pathname: "/docs/components",
      width: 375,
      scheme: "light",
      density: "compact",
    },
    {
      name: "catalog-390-dark-rtl",
      pathname: "/docs/components",
      width: 390,
      density: "compact",
      rtl: true,
    },
    {
      name: "catalog-320-text-200",
      pathname: "/docs/components",
      width: 320,
      textScale: 2,
    },
    {
      name: "catalog-390-text-200",
      pathname: "/docs/components",
      width: 390,
      textScale: 2,
    },
    {
      name: "catalog-430-text-200",
      pathname: "/docs/components",
      width: 430,
      textScale: 2,
    },
    {
      name: "component-390-text-200",
      pathname: "/docs/session-header",
      width: 390,
      textScale: 2,
      captureCode: true,
    },
    { name: "lab-320-dark", pathname: "/lab", width: 320 },
    { name: "lab-430-text-200", pathname: "/lab", width: 430, textScale: 2 },
  ].map((scenario) => ({ ...scenario, mobile: true })),
});
