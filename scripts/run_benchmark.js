const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const YAML = require("yaml");

const validator = path.join(__dirname, "validate_benchmarks.js");
const casesDir = path.join(__dirname, "../benchmarks/cases");

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

async function runLive(caseFolders) {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("Cannot run --live benchmark without OPENAI_API_KEY.");
    process.exit(1);
  }

  const distEntry = path.join(__dirname, "../dist/index.js");
  if (!fs.existsSync(distEntry)) {
    console.error(
      "Missing dist/index.js. Run `npm run build` before `npm run benchmark -- --live`.",
    );
    process.exit(1);
  }

  const { generateArabicCopy } = require(distEntry);
  let failures = 0;

  for (const folder of caseFolders) {
    const caseDir = path.join(casesDir, folder);
    const prompt = fs.readFileSync(path.join(caseDir, "prompt.md"), "utf8").trim();
    const expected = YAML.parse(fs.readFileSync(path.join(caseDir, "expected.yaml"), "utf8"));
    const forbidden = expected.forbidden_phrases ?? [];

    const started = Date.now();
    try {
      const result = await generateArabicCopy({
        projectNiche: expected.domain || "General",
        targetAudience: "Arabic product users",
        toneOfVoice: "Clear and natural",
        textType: folder.replace(/_/g, " "),
        context: prompt,
        maxLength: 25,
      });

      const badHits = [];
      for (const option of result.options) {
        for (const phrase of forbidden) {
          if (option.text.includes(phrase)) {
            badHits.push(phrase);
          }
        }
      }

      const ms = Date.now() - started;
      if (badHits.length > 0) {
        failures += 1;
        console.error(`[FAIL] ${folder} (${ms}ms): forbidden phrase(s): ${badHits.join(", ")}`);
      } else {
        console.log(`[PASS] ${folder} (${ms}ms): ${result.options[0].text}`);
      }
    } catch (error) {
      failures += 1;
      console.error(`[ERROR] ${folder}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(
    "Live mode checks SDK execution and forbidden_phrases; it does not compute human evaluation scores.",
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
