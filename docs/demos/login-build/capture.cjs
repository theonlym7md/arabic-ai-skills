const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const views = [
  { name: "desktop", viewport: { width: 1440, height: 960 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
];

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.DEMO_BROWSER_PATH || undefined,
  });
  try {
    for (const variant of ["baseline", "arabicskill"]) {
      const file = pathToFileURL(path.join(__dirname, variant, "index.html")).href;
      for (const { name, viewport } of views) {
        const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
        const errors = [];
        const network = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route(/^https?:/u, async (route) => {
          network.push(route.request().url());
          await route.abort();
        });
        try {
          await page.goto(file);
          await page.evaluate(() => document.fonts.ready);
          const layout = await page.evaluate(() => ({
            direction: getComputedStyle(document.documentElement).direction,
            width: document.documentElement.scrollWidth,
          }));
          assert.equal(layout.direction, "rtl");
          assert.equal(layout.width, viewport.width);
          assert.equal(await page.locator("input[type=email]").count(), 1);
          assert.deepEqual(errors, []);
          assert.deepEqual(network, []);
          await page.screenshot({
            path: path.join(__dirname, `${variant}-${name}.png`),
            animations: "disabled",
          });
          console.log(`${variant}: ${name}, RTL, no overflow or external requests`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
