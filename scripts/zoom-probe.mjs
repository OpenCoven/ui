/*
 * Detail probe for the specimen shell's ritual-tech finish.
 *
 * visual-review.mjs captures whole pages at 1x, which is the right scale for
 * layout regressions but too coarse to confirm a 1px circuitry trace actually
 * paints. This grabs one card at 3x and asserts the decorative layers resolve
 * to real colours rather than to an unresolved custom property.
 *
 * The evaluate callbacks below run in the page, not in Node.
 */
/* global getComputedStyle, document */
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4321";
const outDir = process.env.ZOOM_OUTPUT_DIR ?? "artifacts/visual-luxe";
const executablePath = process.env.CHROME_PATH;

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox"],
});
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

// Prove the circuitry trace is painted, not merely declared.
const trace = await card.evaluate((node) => {
  const style = getComputedStyle(node, "::before");
  return {
    content: style.content,
    height: style.height,
    backgroundImage: style.backgroundImage.slice(0, 160),
    display: style.display,
  };
});

const eyebrow = await page
  .locator(".catalog-group__eyebrow")
  .first()
  .evaluate((node) => {
    const style = getComputedStyle(node, "::before");
    return {
      width: style.width,
      backgroundImage: style.backgroundImage.slice(0, 120),
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
    { trace, eyebrow, bodyLayers, runningAnimations: animations },
    null,
    2,
  ),
);

await browser.close();
