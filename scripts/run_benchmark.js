const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const validator = path.join(__dirname, "validate_benchmarks.js");
execFileSync(process.execPath, [validator], { stdio: "inherit" });

const casesDir = path.join(__dirname, "../skills/arabicskill/benchmarks/cases");
const caseFolders = fs
  .readdirSync(casesDir)
  .filter((entry) => fs.statSync(path.join(casesDir, entry)).isDirectory());

console.log(`Verified ${caseFolders.length} benchmark fixture(s): ${caseFolders.join(", ")}`);
console.log("This command validates fixtures only; it does not claim model quality scores.");
