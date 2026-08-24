const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const casesDir = path.join(__dirname, "../skills/arabic-intelligence/benchmarks/cases");
const requiredFiles = ["prompt.md", "golden_output.md", "expected.yaml"];

if (!fs.existsSync(casesDir)) {
  throw new Error("Benchmark cases directory does not exist.");
}

const cases = fs
  .readdirSync(casesDir)
  .filter((entry) => fs.statSync(path.join(casesDir, entry)).isDirectory());

if (cases.length === 0) {
  throw new Error("No benchmark cases were found.");
}

let failed = false;
for (const benchmarkCase of cases) {
  const caseDir = path.join(casesDir, benchmarkCase);
  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(caseDir, file)));
  if (missing.length > 0) {
    failed = true;
    console.error(`${benchmarkCase}: missing ${missing.join(", ")}`);
    continue;
  }

  let expected;
  try {
    expected = YAML.parse(fs.readFileSync(path.join(caseDir, "expected.yaml"), "utf8"));
  } catch (error) {
    failed = true;
    console.error(`${benchmarkCase}: invalid expected.yaml (${error.message})`);
    continue;
  }

  const metrics = expected.target_metrics;
  if (!expected.case_id || !expected.domain || !metrics || typeof metrics !== "object") {
    failed = true;
    console.error(`${benchmarkCase}: expected.yaml lacks case_id, domain, or target_metrics`);
    continue;
  }

  if (
    Object.values(metrics).some((value) => typeof value !== "number" || value < 0 || value > 100)
  ) {
    failed = true;
    console.error(`${benchmarkCase}: target metrics must be numbers between 0 and 100`);
    continue;
  }

  const goldenOutput = fs.readFileSync(path.join(caseDir, "golden_output.md"), "utf8");
  const forbiddenPhrases = expected.forbidden_phrases ?? [];
  const violations = forbiddenPhrases.filter((phrase) => goldenOutput.includes(phrase));
  if (violations.length > 0) {
    failed = true;
    console.error(
      `${benchmarkCase}: golden output contains forbidden phrases: ${violations.join(", ")}`,
    );
    continue;
  }

  console.log(`${benchmarkCase}: valid`);
}

if (failed) {
  process.exit(1);
}

console.log(`${cases.length} benchmark fixture(s) validated.`);
