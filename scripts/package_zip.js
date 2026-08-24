// Script to generate pristine lightweight ZIP distribution archive excluding .git & node_modules
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const committedPackage = JSON.parse(
  execFileSync("git", ["show", "HEAD:package.json"], {
    cwd: rootDir,
    encoding: "utf8",
  }),
);
const { version } = committedPackage;
const zipPath = path.join(distDir, `arabic-ai-skills-v${version}.zip`);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log(`Generating pristine distribution archive from committed HEAD (v${version})...`);

try {
  // Use git archive for 100% clean distribution without .git internals
  execFileSync("git", ["archive", "--format=zip", "HEAD", "-o", zipPath], { cwd: rootDir });
  const stats = fs.statSync(zipPath);
  console.log(`✓ Clean Archive Generated Successfully!`);
  console.log(`  Path: ${zipPath}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
} catch (err) {
  console.error("✗ Failed to package clean archive:", err.message);
  process.exit(1);
}
