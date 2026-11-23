// Script to generate pristine lightweight ZIP distribution archive from committed HEAD.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

let version;
try {
  const committedPackage = JSON.parse(
    execFileSync("git", ["show", "HEAD:package.json"], {
      cwd: rootDir,
      encoding: "utf8",
    }),
  );
  version = committedPackage?.version;
} catch (error) {
  console.error("✗ Failed to read committed HEAD:package.json:", error.message);
  process.exit(1);
}

if (typeof version !== "string" || !SEMVER_RE.test(version)) {
  console.error(`✗ Invalid package version for archive naming: "${version}"`);
  process.exit(1);
}

const prefix = `ArabicSkill-v${version}/`;
const zipPath = path.join(distDir, `ArabicSkill-v${version}.zip`);

fs.mkdirSync(distDir, { recursive: true });

try {
  const dirtyStatus = execFileSync("git", ["status", "--porcelain"], {
    cwd: rootDir,
    encoding: "utf8",
  }).trim();
  if (dirtyStatus) {
    console.warn(
      "Warning: working tree has uncommitted changes; git archive packages committed HEAD only.",
    );
  }

  console.log(`Generating pristine distribution archive from committed HEAD (v${version})...`);
  execFileSync("git", ["archive", "--format=zip", `--prefix=${prefix}`, "HEAD", "-o", zipPath], {
    cwd: rootDir,
  });
  const stats = fs.statSync(zipPath);
  console.log("✓ Clean Archive Generated Successfully!");
  console.log(`  Path: ${zipPath}`);
  console.log(`  Prefix: ${prefix}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
} catch (err) {
  console.error("✗ Failed to package clean archive:", err.message);
  process.exit(1);
}
