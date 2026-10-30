/*
 * Detail probe for the specimen shell's documentation frame and typography.
 *
 * visual-review.mjs captures whole pages at 1x, which is the right scale for
 * layout regressions. This grabs one card at 3x and records the canvas border,
 * heading typography, and background for closer visual inspection.
 *
 * The evaluate callbacks below run in the page, not in Node.
 */
/* global getComputedStyle, document */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4321";
const outDir = process.env.ZOOM_OUTPUT_DIR ?? "artifacts/visual-luxe";
const executablePath = process.env.CHROME_PATH;

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox"],
});
await mkdir(outDir, { recursive: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 3,
  colorScheme: "dark",
  reducedMotion: "reduce",
});

await page.goto(baseUrl, { waitUntil: "load" });
await page.waitForSelector("#specimen-main");
await page.waitForTimeout(600);

const card = page.locator(".specimen-card").first();
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await card.screenshot({ path: `${outDir}/zoom-card.png` });

const frame = await card
  .locator(".specimen-preview__canvas")
  .evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      borderWidth: style.borderTopWidth,
      borderColor: style.borderTopColor,
      borderRadius: style.borderRadius,
      background: style.backgroundColor,
    };
  });

const heading = await page
  .locator(".catalog-group h2")
  .first()
  .evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
    };
  });

const bodyLayers = await page.evaluate(() => {
  const style = getComputedStyle(document.body);
  return {
    layerCount: style.backgroundImage.split(/,(?![^(]*\))/).length,
    hasRepeating: style.backgroundImage.includes("repeating-linear-gradient"),
    hasRadial: style.backgroundImage.includes("radial-gradient"),
  };
});

const animations = await page.evaluate(() =>
  document
    .getAnimations()
    .filter((a) => a.playState === "running")
    .map((a) => a.animationName ?? "unnamed"),
);

console.log(
  JSON.stringify(
    { frame, heading, bodyLayers, runningAnimations: animations },
    null,
    2,
  ),
);

await browser.close();
