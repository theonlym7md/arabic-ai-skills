const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const {
  findShortLabelPeriodViolations,
  hasTrailingShortLabelPeriod,
  normalizeArabic,
} = require("./shared_rules.js");

const rootDir = path.join(__dirname, "..");
const casesDir = path.join(rootDir, "benchmarks/cases");
const requiredFiles = ["prompt.md", "golden_output.md", "expected.yaml"];

const ALLOWED_EXPECTED_KEYS = new Set([
  "case_id",
  "domain",
  "runner_mode",
  "agent_reason",
  "sdk_input",
  "target_metrics",
  "forbidden_phrases",
  "review_criteria",
]);

const ALLOWED_SDK_INPUT_KEYS = new Set([
  "textType",
  "maxLength",
  "targetAudience",
  "toneOfVoice",
  "region",
  "dialect",
  "componentKind",
]);

function extractBalancedJsonObject(text) {
  const start = text.indexOf("{");
  if (start === -1) {
    return null;
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return null;
}

function validateTranslationVariables(promptText, goldenOutput) {
  const sourceJsonText = extractBalancedJsonObject(promptText);
  if (!sourceJsonText) {
    return "translation_variables prompt lacks balanced embedded JSON";
  }

  let source;
  let parsedGolden;
  try {
    source = JSON.parse(sourceJsonText);
    parsedGolden = JSON.parse(goldenOutput);
  } catch (error) {
    return `invalid JSON in translation_variables (${error.message})`;
  }

  const sourceKeys = Object.keys(source).sort();
  const goldenKeys = Object.keys(parsedGolden).sort();
  if (JSON.stringify(sourceKeys) !== JSON.stringify(goldenKeys)) {
    return `golden JSON keys mismatch (${goldenKeys.join(", ")} vs ${sourceKeys.join(", ")})`;
  }

  if (Object.values(parsedGolden).some((value) => typeof value !== "string" || !value.trim())) {
    return "translation_variables golden JSON values must be non-empty strings";
  }

  const perKeyChecks = [
    ["welcome", ["{name}"]],
    ["total", ["{{amount}}", "SAR"]],
    ["help", ['<a href="https://example.com/help">', "</a>"]],
  ];
  for (const [key, tokens] of perKeyChecks) {
    const value = parsedGolden[key] ?? "";
    for (const token of tokens) {
      if (!value.includes(token)) {
        return `key "${key}" dropped required token ${token}`;
      }
    }
  }

  return null;
}

function validateArabicPlural(goldenOutput) {
  const trimmed = goldenOutput.trim();
  if (!/^\{[a-zA-Z_][a-zA-Z0-9_]*,\s*plural,/u.test(trimmed) || !trimmed.endsWith("}")) {
    return "ICU plural message must follow {<var>, plural, ...} syntax";
  }

  let depth = 0;
  for (const ch of trimmed) {
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth < 0) {
      return "unbalanced closing brace in ICU plural message";
    }
  }
  if (depth !== 0) {
    return "unbalanced braces in ICU plural message";
  }

  for (const category of ["zero", "one", "two", "few", "many", "other"]) {
    const match = trimmed.match(new RegExp(`\\b${category}\\s*\\{([^{}]+)\\}`, "u"));
    if (!match?.[1].trim()) {
      return `missing or empty Arabic CLDR plural category "${category}"`;
    }
    if (["few", "many", "other"].includes(category) && !match[1].includes("#")) {
      return `Arabic CLDR plural category "${category}" must retain "#" count placeholder`;
    }
  }

  return null;
}

function validateCaseStructure(caseName, promptText, outputText) {
  const issues = [];

  if (caseName === "short_cta") {
    if (hasTrailingShortLabelPeriod(outputText)) {
      issues.push("short CTA output must not end with a period");
    }
    const words = outputText.trim().split(/\s+/u).filter(Boolean);
    if (words.length > 2) {
      issues.push(`short CTA must be at most 2 words (got ${words.length})`);
    }
  }

  const periodViolations = findShortLabelPeriodViolations(outputText);
  for (const violation of periodViolations) {
    issues.push(`short UI label ends with trailing period: ${violation.line}`);
  }

  if (caseName === "media_podcast_bdi" && !/<bdi dir="ltr">\d+<\/bdi>\s*دقيقة/u.test(outputText)) {
    issues.push('missing <bdi dir="ltr"> around numeric minute duration');
  }

  if (caseName === "screen_rtl_table") {
    const tableLines = outputText
      .split(/\r?\n/u)
      .filter((line) => /^\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|$/u.test(line.trim()));
    if (tableLines.length < 4) {
      issues.push("screen_rtl_table must render a 3-column Markdown table");
    }
    if (!/<bdi dir="ltr">[^<]+<\/bdi>/u.test(outputText)) {
      issues.push('screen_rtl_table must isolate Latin identifiers with <bdi dir="ltr">');
    }
  }

  if (caseName === "inline_form_validation" && !/dir="ltr"/u.test(outputText)) {
    issues.push('inline_form_validation must mention dir="ltr"');
  }

  if (caseName === "game_onboarding" && /\u0640/u.test(outputText)) {
    issues.push("game_onboarding must not use Arabic letter stretching (tatweel)");
  }

  if (caseName === "translation_variables") {
    const issue = validateTranslationVariables(promptText, outputText);
    if (issue) {
      issues.push(issue);
    }
  }

  if (caseName === "arabic_plural") {
    const issue = validateArabicPlural(outputText);
    if (issue) {
      issues.push(issue);
    }
  }

  return issues;
}

function findForbiddenViolations(outputText, forbiddenPhrases) {
  const normalizedOutput = normalizeArabic(outputText).toLowerCase();
  return (forbiddenPhrases ?? []).filter((phrase) =>
    normalizedOutput.includes(normalizeArabic(phrase).toLowerCase()),
  );
}

function runValidation() {
  if (!fs.existsSync(casesDir)) {
    throw new Error("Benchmark cases directory does not exist.");
  }

  const cases = fs
    .readdirSync(casesDir)
    .filter((entry) => fs.statSync(path.join(casesDir, entry)).isDirectory())
    .sort();

  if (cases.length === 0) {
    throw new Error("No benchmark cases were found.");
  }

  const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
  const suitePath = path.join(rootDir, "benchmarks/regression_suite.yaml");
  if (!fs.existsSync(suitePath)) {
    throw new Error("benchmarks/regression_suite.yaml does not exist.");
  }

  const regressionSuite = YAML.parse(fs.readFileSync(suitePath, "utf8"));
  if (
    !regressionSuite ||
    typeof regressionSuite !== "object" ||
    Array.isArray(regressionSuite) ||
    typeof regressionSuite.suite_name !== "string" ||
    !regressionSuite.suite_name.trim() ||
    regressionSuite.version !== rootPkg.version ||
    !regressionSuite.threshold_rules ||
    typeof regressionSuite.threshold_rules !== "object" ||
    Array.isArray(regressionSuite.threshold_rules) ||
    Object.keys(regressionSuite.threshold_rules).length === 0 ||
    !["not_recorded", "recorded"].includes(regressionSuite.measurement_status)
  ) {
    throw new Error(
      `benchmarks/regression_suite.yaml must define valid suite_name, version (${rootPkg.version}), non-empty threshold_rules, and measurement_status (not_recorded|recorded).`,
    );
  }

  for (const [ruleKey, ruleVal] of Object.entries(regressionSuite.threshold_rules)) {
    const isValidBool =
      typeof ruleVal === "boolean" &&
      ["fail_on_forbidden_phrase", "fail_on_broken_structure", "fail_on_slop_match"].includes(
        ruleKey,
      );
    const isValidNum =
      typeof ruleVal === "number" && Number.isFinite(ruleVal) && ruleVal >= 0 && ruleVal <= 100;
    if (!isValidBool && !isValidNum) {
      throw new Error(`regression_suite.yaml: invalid threshold rule ${ruleKey}=${ruleVal}`);
    }
  }

  const weightsPath = path.join(rootDir, "skills/arabicskill/knowledge/relations/weights.yaml");
  const routingPath = path.join(rootDir, "skills/arabicskill/knowledge/relations/routing.yaml");
  const weightsData = YAML.parse(fs.readFileSync(weightsPath, "utf8"));
  const routingData = YAML.parse(fs.readFileSync(routingPath, "utf8"));

  const validMetricKeys = new Set([
    ...Object.values(weightsData?.weights ?? {}).flatMap((group) =>
      group && typeof group === "object" ? Object.keys(group) : [],
    ),
    "HumanScore",
    "AISmell",
  ]);
  const allowedDomains = new Set(Object.keys(routingData?.domains ?? {}));

  let failed = false;
  for (const benchmarkCase of cases) {
    const caseDir = path.join(casesDir, benchmarkCase);
    const errors = [];
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

    if (!expected || typeof expected !== "object" || Array.isArray(expected)) {
      failed = true;
      console.error(`${benchmarkCase}: expected.yaml must be a YAML mapping`);
      continue;
    }

    const unknownKeys = Object.keys(expected).filter((key) => !ALLOWED_EXPECTED_KEYS.has(key));
    if (unknownKeys.length > 0) {
      errors.push(`unexpected expected.yaml key(s): ${unknownKeys.join(", ")}`);
    }

    if (expected.case_id !== benchmarkCase) {
      errors.push(`case_id "${expected.case_id}" must match folder name`);
    }

    if (typeof expected.domain !== "string" || !allowedDomains.has(expected.domain.trim())) {
      errors.push(`domain "${expected.domain}" must be a canonical domain from routing.yaml`);
    }

    if (expected.runner_mode !== "sdk" && expected.runner_mode !== "agent") {
      errors.push('runner_mode must be "sdk" or "agent"');
    } else if (expected.runner_mode === "agent") {
      if (typeof expected.agent_reason !== "string" || !expected.agent_reason.trim()) {
        errors.push('agent runner_mode requires non-empty "agent_reason"');
      }
    } else {
      const sdkInput = expected.sdk_input;
      if (!sdkInput || typeof sdkInput !== "object" || Array.isArray(sdkInput)) {
        errors.push('sdk runner_mode requires an "sdk_input" object');
      } else {
        const badSdkKeys = Object.keys(sdkInput).filter((k) => !ALLOWED_SDK_INPUT_KEYS.has(k));
        if (badSdkKeys.length > 0) {
          errors.push(`unexpected sdk_input key(s): ${badSdkKeys.join(", ")}`);
        }
        if (typeof sdkInput.textType !== "string" || !sdkInput.textType.trim()) {
          errors.push("sdk_input.textType must be a non-empty string");
        }
        if (
          !Number.isInteger(sdkInput.maxLength) ||
          sdkInput.maxLength < 1 ||
          sdkInput.maxLength > 100
        ) {
          errors.push("sdk_input.maxLength must be an integer 1..100");
        }
        if (typeof sdkInput.targetAudience !== "string" || !sdkInput.targetAudience.trim()) {
          errors.push("sdk_input.targetAudience must be a non-empty string");
        }
        if (typeof sdkInput.toneOfVoice !== "string" || !sdkInput.toneOfVoice.trim()) {
          errors.push("sdk_input.toneOfVoice must be a non-empty string");
        }
      }
    }

    const metrics = expected.target_metrics;
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
      errors.push("target_metrics must be a non-empty mapping");
    } else {
      const unknownMetricKeys = Object.keys(metrics).filter((key) => !validMetricKeys.has(key));
      if (unknownMetricKeys.length > 0) {
        errors.push(`unknown target_metrics key(s): ${unknownMetricKeys.join(", ")}`);
      }
      const entries = Object.entries(metrics);
      if (entries.length === 0) {
        errors.push("target_metrics must not be empty");
      }
      for (const [metricKey, value] of entries) {
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
          errors.push(`target_metrics.${metricKey} must be a finite number 0..100`);
        } else if (metricKey === "AISmell" && value > 20) {
          errors.push(`target_metrics.AISmell (${value}) must be <= 20`);
        } else if (metricKey === "Trust" && value < 80) {
          errors.push(`target_metrics.Trust (${value}) must be >= 80`);
        }
      }
    }

    if (
      !Array.isArray(expected.review_criteria) ||
      expected.review_criteria.length === 0 ||
      expected.review_criteria.some((item) => typeof item !== "string" || !item.trim())
    ) {
      errors.push("expected.yaml requires non-empty review_criteria array");
    }

    if (
      expected.forbidden_phrases !== undefined &&
      (!Array.isArray(expected.forbidden_phrases) ||
        expected.forbidden_phrases.some((item) => typeof item !== "string" || !item.trim()))
    ) {
      errors.push("expected.yaml forbidden_phrases must be an array of non-empty strings");
    }

    const promptText = fs.readFileSync(path.join(caseDir, "prompt.md"), "utf8").trim();
    const goldenOutput = fs.readFileSync(path.join(caseDir, "golden_output.md"), "utf8").trim();
    if (!promptText || !goldenOutput) {
      errors.push("prompt.md and golden_output.md must not be empty");
    } else {
      const forbiddenViolations = findForbiddenViolations(goldenOutput, expected.forbidden_phrases);
      if (forbiddenViolations.length > 0) {
        errors.push(`golden output contains forbidden phrases: ${forbiddenViolations.join(", ")}`);
      }
      errors.push(...validateCaseStructure(benchmarkCase, promptText, goldenOutput));
    }

    if (errors.length > 0) {
      failed = true;
      for (const err of errors) {
        console.error(`${benchmarkCase}: ${err}`);
      }
    } else {
      console.log(`${benchmarkCase}: valid`);
    }
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`${cases.length} benchmark fixture(s) validated.`);
}

if (require.main === module) {
  runValidation();
}

module.exports = {
  validateTranslationVariables,
  validateArabicPlural,
  validateCaseStructure,
  findForbiddenViolations,
};
