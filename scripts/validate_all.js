// Runs every deterministic repository validator and fails on the first error.
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const validators = [
  ["Entity schemas", "validate_schema.js"],
  ["Plugin manifests", "validate_plugin.js"],
  ["Benchmark fixtures", "validate_benchmarks.js"],
];

try {
  for (const [index, [label, file]] of validators.entries()) {
    console.log(`[${index + 1}/${validators.length}] ${label}`);
    execFileSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });
  }

  console.log(`All ${validators.length} validators passed.`);
} catch (err) {
  console.error("Validation failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
}
