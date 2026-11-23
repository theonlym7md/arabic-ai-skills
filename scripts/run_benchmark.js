const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const YAML = require("yaml");
const { scanText } = require("./sweep.js");
const { findForbiddenViolations, validateCaseStructure } = require("./validate_benchmarks.js");

const rootDir = path.join(__dirname, "..");
const validator = path.join(__dirname, "validate_benchmarks.js");
const casesDir = path.join(rootDir, "benchmarks/cases");
const suitePath = path.join(rootDir, "benchmarks/regression_suite.yaml");

function parseArgs(argv) {
  let live = false;
  let selectedCase = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--live") {
      live = true;
    } else if (arg === "--case") {
      selectedCase = argv[i + 1]?.trim();
      if (!selectedCase || selectedCase.startsWith("-")) {
        throw new Error("--case requires a case name.");
      }
      i += 1;
    } else if (arg.startsWith("--case=")) {
      selectedCase = arg.slice("--case=".length).trim();
      if (!selectedCase || selectedCase.startsWith("-")) {
        throw new Error("--case requires a case name.");
      }
    } else {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return { live, selectedCase };
}

function listCases(selectedCase) {
  const all = fs
    .readdirSync(casesDir)
    .filter((entry) => fs.statSync(path.join(casesDir, entry)).isDirectory())
    .sort();
  if (!selectedCase) {
    return all;
  }
  if (!all.includes(selectedCase)) {
    throw new Error(`Unknown benchmark case "${selectedCase}". Available: ${all.join(", ")}`);
  }
  return [selectedCase];
}

function newestSourceMtimeMs(srcDir) {
  let latest = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const full = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      latest = Math.max(latest, newestSourceMtimeMs(full));
    } else if (entry.name.endsWith(".ts")) {
      latest = Math.max(latest, fs.statSync(full).mtimeMs);
    }
  }
  return latest;
}

async function runLive(caseFolders) {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("Cannot run --live benchmark without OPENAI_API_KEY.");
    process.exit(1);
  }

  const srcDir = path.join(rootDir, "src");
  const distEntry = path.join(rootDir, "dist/index.js");
  if (!fs.existsSync(distEntry)) {
    console.error(
      "Missing dist/index.js. Run `npm run build` before `npm run benchmark -- --live`.",
    );
    process.exit(1);
  }
  if (newestSourceMtimeMs(srcDir) > fs.statSync(distEntry).mtimeMs) {
    console.error("dist/index.js is older than src/*.ts. Run `npm run build` first.");
    process.exit(1);
  }

  const suite = YAML.parse(fs.readFileSync(suitePath, "utf8"));
  const rules = suite?.threshold_rules ?? {};
  const { generateArabicCopy } = require(distEntry);
  let passed = 0;
  let skipped = 0;
  let failures = 0;

  for (const folder of caseFolders) {
    const caseDir = path.join(casesDir, folder);
    const prompt = fs.readFileSync(path.join(caseDir, "prompt.md"), "utf8").trim();
    const expected = YAML.parse(fs.readFileSync(path.join(caseDir, "expected.yaml"), "utf8"));

    if (expected.runner_mode === "agent") {
      skipped += 1;
      console.log(`[SKIP] ${folder}: agent-only (${expected.agent_reason})`);
      continue;
    }

    const sdkInput = expected.sdk_input;
    const started = Date.now();
    try {
      const result = await generateArabicCopy({
        projectNiche: expected.domain,
        targetAudience: sdkInput.targetAudience,
        toneOfVoice: sdkInput.toneOfVoice,
        textType: sdkInput.textType,
        context: prompt,
        maxLength: sdkInput.maxLength,
        ...(sdkInput.region ? { region: sdkInput.region } : {}),
        ...(sdkInput.dialect ? { dialect: sdkInput.dialect } : {}),
        ...(sdkInput.componentKind ? { componentKind: sdkInput.componentKind } : {}),
      });

      const forbiddenHits = new Set();
      const slopHits = new Set();
      const structureHits = new Set();

      for (const option of result.options) {
        if (rules.fail_on_forbidden_phrase !== false) {
          for (const phrase of findForbiddenViolations(option.text, expected.forbidden_phrases)) {
            forbiddenHits.add(phrase);
          }
        }
        if (rules.fail_on_slop_match !== false) {
          for (const slopLabel of scanText(option.text)) {
            slopHits.add(slopLabel);
          }
        }
        if (rules.fail_on_broken_structure !== false) {
          for (const issue of validateCaseStructure(folder, prompt, option.text)) {
            structureHits.add(issue);
          }
        }
      }

      const ms = Date.now() - started;
      const problems = [];
      if (forbiddenHits.size > 0) {
        problems.push(`forbidden: ${[...forbiddenHits].join(", ")}`);
      }
      if (slopHits.size > 0) {
        problems.push(`slop: ${[...slopHits].join(", ")}`);
      }
      if (structureHits.size > 0) {
        problems.push(`structure: ${[...structureHits].join("; ")}`);
      }

      if (problems.length > 0) {
        failures += 1;
        console.error(`[FAIL] ${folder} (${ms}ms): ${problems.join(" | ")}`);
      } else {
        passed += 1;
        console.log(`[PASS] ${folder} (${ms}ms): ${result.options[0].text}`);
      }
    } catch (error) {
      failures += 1;
      console.error(`[ERROR] ${folder}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(
    `Live SDK summary: passed=${passed}, skipped=${skipped} (agent-only), failed=${failures}.`,
  );
  if (failures > 0) {
    process.exit(1);
  }
}

async function main() {
  const { live, selectedCase } = parseArgs(process.argv.slice(2));
  execFileSync(process.execPath, [validator], { stdio: "inherit" });
  const caseFolders = listCases(selectedCase);

  console.log(`Verified ${caseFolders.length} benchmark fixture(s): ${caseFolders.join(", ")}`);
  if (!live) {
    console.log(
      "Fixture validation only; pass --live with OPENAI_API_KEY to execute live SDK checks.",
    );
    return;
  }

  await runLive(caseFolders);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
