// Requires Playwright with Chromium; pass DEMO_BROWSER_PATH to use an existing Chrome.
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const expected = require("./copy.js");

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.DEMO_BROWSER_PATH || undefined,
  });
  try {
    const screenshotDir = path.join(__dirname, "../../assets/ab");
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(/^https?:/u, (route) => route.abort());
    await page.goto(pathToFileURL(path.join(__dirname, "index.html")).href);
    await page.evaluate(() => document.fonts.ready);
    const scenarios = ["landing", "payment", "login"];
    for (const scenario of scenarios) {
      const board = page.locator(`#${scenario}`);
      const screens = board.locator(".screen");
      assert.equal(await screens.count(), 2);
      for (const [index, mode] of ["without", "with"].entries()) {
        const screen = screens.nth(index);
        const copy = expected[mode][scenario];
        for (const [selector, field] of [
          [".eyebrow", "eyebrow"],
          [".screen-title", "title"],
          [".body-copy", "body"],
          [".primary", "primary"],
          [".secondary", "secondary"],
        ]) {
          assert.equal(await screen.locator(selector).textContent(), copy[field]);
        }
      }
      const [first, second] = await Promise.all([
        screens.nth(0).boundingBox(),
        screens.nth(1).boundingBox(),
      ]);
      assert.ok(first && second);
      assert.ok(Math.abs(first.width - second.width) < 1);
      assert.equal(first.height, second.height);
      await board.screenshot({ path: path.join(screenshotDir, `${scenario}.png`) });
    }
    await page.setViewportSize({ width: 375, height: 812 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375);
    for (const scenario of scenarios) {
      const panes = page.locator(`#${scenario} .pane`);
      const [first, second] = await Promise.all([
        panes.nth(0).boundingBox(),
        panes.nth(1).boundingBox(),
      ]);
      assert.ok(first && second && second.y >= first.y + first.height);
      assert.ok(first.x >= 0 && first.x + first.width <= 375);
    }
    assert.deepEqual(errors, []);
    console.log("Captured 3 equal-size desktop pairs; verified all copy and 375px layout.");
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
