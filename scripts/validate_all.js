const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const rootDir = path.join(__dirname, "..");

function verifyVersionSync() {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
  const expectedVersion = rootPkg.version;
  const checks = [];

  const skillsDir = path.join(rootDir, "skills");
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const skillName = entry.name;
    const skillPkg = JSON.parse(
      fs.readFileSync(path.join(skillsDir, skillName, "package.json"), "utf8"),
    );
    const skillMd = fs.readFileSync(path.join(skillsDir, skillName, "SKILL.md"), "utf8");
    const fmMatch = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = fmMatch ? YAML.parse(fmMatch[1]) : {};
    checks.push([`skills/${skillName}/package.json`, skillPkg.version]);
    checks.push([`skills/${skillName}/SKILL.md`, fm?.metadata?.version]);
  }

  const routing = YAML.parse(
    fs.readFileSync(
      path.join(rootDir, "skills/arabicskill/knowledge/relations/routing.yaml"),
      "utf8",
    ),
  );
  const suite = YAML.parse(
    fs.readFileSync(path.join(rootDir, "benchmarks/regression_suite.yaml"), "utf8"),
  );
  const spec = fs.readFileSync(path.join(rootDir, "SPEC.md"), "utf8");
  const specVersionMatch = spec.match(/Version\s+(\d+\.\d+\.\d+)/);

  const lockPkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package-lock.json"), "utf8"));
  checks.push(["package-lock.json", lockPkg?.version]);
  checks.push(["package-lock.json (root package)", lockPkg?.packages?.[""]?.version]);
  checks.push(["routing.yaml", routing?.version]);
  checks.push(["regression_suite.yaml", suite?.version]);
  checks.push(["SPEC.md", specVersionMatch?.[1]]);

  const mismatches = checks.filter(([, version]) => version !== expectedVersion);
  if (mismatches.length > 0) {
    for (const [label, version] of mismatches) {
      console.error(`Version drift: ${label} has "${version}", expected "${expectedVersion}"`);
    }
    process.exit(1);
  }
  console.log(`Version parity verified (${expectedVersion}) across ${checks.length + 1} files.`);
}

const validators = [
  ["Entity schemas & routing", "validate_schema.js"],
  ["Plugin manifests", "validate_plugin.js"],
  ["Benchmark fixtures", "validate_benchmarks.js"],
];

for (const [index, [label, file]] of validators.entries()) {
  console.log(`[${index + 1}/${validators.length + 1}] ${label}`);
  execFileSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });
}

console.log(`[${validators.length + 1}/${validators.length + 1}] Version parity`);
verifyVersionSync();
console.log(`All ${validators.length + 1} validators passed.`);
