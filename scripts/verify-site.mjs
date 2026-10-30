/* global document, window */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const { chromium } = await import(process.argv[2] ?? "playwright");
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 937, height: 795 },
  colorScheme: "dark",
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const origin = process.env.BASE_URL ?? "http://127.0.0.1:5173";
await mkdir("/tmp/agent-browser", { recursive: true });
try {
  await page.goto(origin);
  await page
    .getByRole("heading", { name: "Built for agents. Made for humans." })
    .waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({
    path: "/tmp/agent-browser/coven-verified-desktop.png",
  });
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByText("Received locally. No model connected.").waitFor();
  await page.getByRole("button", { name: "Reset showcase" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "/tmp/agent-browser/coven-verified-mobile.png",
    animations: "disabled",
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    "Mobile home must not overflow",
  );
  await page.goto(`${origin}/docs/components/composer`);
  await page.getByRole("heading", { name: "Composer", exact: true }).waitFor();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  assert.match(
    await page.locator("pre").first().innerText(),
    /import \{ useState \} from "react"/,
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: "Copy Terminal", exact: true })
    .click();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /\/r\/composer.json/,
  );
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  await page.getByLabel("Preview density").selectOption("compact");
  await page.reload();
  assert.equal(
    await page.getByLabel("Preview density").inputValue(),
    "compact",
  );
  await page.getByRole("button", { name: "Documentation menu" }).click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("button", { name: "Changes saved" }).waitFor();
  await page.keyboard.press("Control+k");
  await page.getByLabel("Search documentation").fill("no-such-component");
  await page.getByText("No matching pages. Try “composer”.").waitFor();
  await page.getByLabel("Search documentation").fill("context");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page
    .getByRole("heading", { name: "Context meter", exact: true })
    .waitFor();
  await page.setViewportSize({ width: 937, height: 795 });
  await page.screenshot({ path: "/tmp/agent-browser/coven-docs-desktop.png" });
  await page.getByRole("button", { name: "Use light scheme" }).click();
  await page.screenshot({ path: "/tmp/agent-browser/coven-docs-light.png" });
  await page.goto(`${origin}/lab`);
  for (const name of ["Messages", "Context", "Actions", "Cards", "Composer"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    assert.equal(
      await page
        .getByRole("tab", { name, exact: true })
        .getAttribute("aria-selected"),
      "true",
    );
  }
  await page.goto(`${origin}/docs/components`);
  const links = await page
    .locator(".catalog-tile")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const link of links) {
    await page.goto(`${origin}${link}`);
    await page.locator(".component-stage").waitFor();
    assert.ok(
      await page.locator(".component-stage").innerHTML(),
      `${link} needs a preview`,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
      `${link} must not overflow on mobile`,
    );
  }
  await page.goto(`${origin}/docs/components/completion-palette`);
  await page.getByRole("button", { name: "Open slash commands" }).click();
  await page.getByRole("menuitem", { name: /\/plan/ }).click();
  assert.equal(
    await page.locator(".component-stage [role=status]").innerText(),
    "/plan",
  );
  await page.goto(`${origin}/docs/components/dropdown-menu`);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Duplicate" }).click();
  await page.getByText("Duplicate selected").waitFor();
  await page.screenshot({
    path: "/tmp/agent-browser/coven-docs-mobile-final.png",
    animations: "disabled",
  });
  await page.goto(origin);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 700 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    "320px homepage must not overflow",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "/tmp/agent-browser/coven-home-light-full.png",
    fullPage: true,
    animations: "disabled",
  });
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    `Verified home, docs search, code tabs, density, themes, lab, and ${links.length} component routes.`,
  );
} catch (error) {
  console.error(errors);
  console.error(await page.locator("body").ariaSnapshot());
  await page.screenshot({ path: "/tmp/agent-browser/coven-test-failure.png" });
  throw error;
} finally {
  await browser.close();
}
