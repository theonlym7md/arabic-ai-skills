const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const casesDir = path.join(__dirname, "../benchmarks/cases");
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

function validateTranslationVariables(promptText, goldenOutput) {
  const jsonStart = promptText.indexOf("{");
  if (jsonStart === -1) {
    return "translation_variables prompt lacks embedded JSON";
  }

  let source;
  let parsedGolden;
  try {
    source = JSON.parse(promptText.slice(jsonStart));
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

  const combinedGolden = Object.values(parsedGolden).join("\n");
  for (const requiredToken of [
    "{name}",
    "{{amount}}",
    "SAR",
    'href="https://example.com/help"',
    "</a>",
  ]) {
    if (!combinedGolden.includes(requiredToken)) {
      return `golden output dropped required token ${requiredToken}`;
    }
  }

  return null;
}

function validateArabicPlural(goldenOutput) {
  let depth = 0;
  for (const ch of goldenOutput) {
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
    if (!new RegExp(`\\b${category}\\s*\\{`).test(goldenOutput)) {
      return `missing Arabic CLDR plural category "${category}"`;
    }
  }

  return null;
}

const suitePath = path.join(__dirname, "../benchmarks/regression_suite.yaml");
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
  typeof regressionSuite.version !== "string" ||
  !regressionSuite.version.trim() ||
  !regressionSuite.threshold_rules ||
  typeof regressionSuite.threshold_rules !== "object" ||
  Array.isArray(regressionSuite.threshold_rules) ||
  typeof regressionSuite.measurement_status !== "string" ||
  !regressionSuite.measurement_status.trim()
) {
  throw new Error(
    "benchmarks/regression_suite.yaml must define suite_name, version, threshold_rules object, and measurement_status.",
  );
}

const weightsPath = path.join(__dirname, "../skills/arabicskill/knowledge/relations/weights.yaml");
const routingPath = path.join(__dirname, "../skills/arabicskill/knowledge/relations/routing.yaml");
const weightsData = YAML.parse(fs.readFileSync(weightsPath, "utf8"));
const routingData = YAML.parse(fs.readFileSync(routingPath, "utf8"));
const validMetricKeys = new Set([
  ...Object.values(weightsData?.weights ?? {}).flatMap((group) =>
    group && typeof group === "object" ? Object.keys(group) : [],
  ),
  "HumanScore",
  "AISmell",
]);
const allowedDomains = new Set([
  ...Object.keys(routingData?.domains ?? {}),
  ...Object.keys(weightsData?.domain_overrides ?? {}),
  "Consumer Finance",
  "Investment",
  "Culture",
  "Location",
  "Account",
  "Payments",
  "Security",
  "UIUX_RTL",
]);
const shortLabelLinePattern =
  /^(?:العنوان|عنوان الشاشة|الزر|الإجراء(?:\s+(?:الأساسي|الثانوي))?|الشارة|شارة الحالة|بطاقة الخيار|الحالة|عنوان الحقل):\s*(.+)$/u;
const shortTableComponentPattern =
  /^(?:العنوان|عنوان الشاشة الرئيسي|عنوان الحقل|الشارة|شارة الحالة|الزر الأساسي|الإجراء الأساسي|الإجراء الثانوي|بطاقة خطة الدفع \(العنوان\)|شارة التوفير|زر الاشتراك)$/u;
const trailingPeriodPattern = /[.\u06D4\u2026](?=[\p{Cf}\s»"”'’)\]}*_`~]*$)/u;

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

  if (!expected || typeof expected !== "object" || Array.isArray(expected)) {
    failed = true;
    console.error(`${benchmarkCase}: expected.yaml must be a YAML mapping`);
    continue;
  }

  const metrics = expected.target_metrics;
  if (
    !expected.case_id ||
    typeof expected.domain !== "string" ||
    !expected.domain.trim() ||
    !metrics ||
    typeof metrics !== "object"
  ) {
    failed = true;
    console.error(
      `${benchmarkCase}: expected.yaml lacks case_id, non-empty domain, or target_metrics`,
    );
    continue;
  }

  const unknownMetricKeys = Object.keys(metrics).filter((key) => !validMetricKeys.has(key));
  if (unknownMetricKeys.length > 0) {
    failed = true;
    console.error(
      `${benchmarkCase}: unknown target_metrics key(s): ${unknownMetricKeys.join(", ")}`,
    );
    continue;
  }

  if (expected.case_id !== benchmarkCase) {
    failed = true;
    console.error(`${benchmarkCase}: case_id "${expected.case_id}" must match folder name`);
    continue;
  }

  if (!allowedDomains.has(expected.domain.trim())) {
    failed = true;
    console.error(`${benchmarkCase}: unknown domain "${expected.domain}"`);
    continue;
  }

  const metricValues = Object.values(metrics);
  if (
    metricValues.length === 0 ||
    metricValues.some(
      (value) => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100,
    )
  ) {
    failed = true;
    console.error(
      `${benchmarkCase}: target metrics must be non-empty finite numbers between 0 and 100`,
    );
    continue;
  }

  if (
    !Array.isArray(expected.review_criteria) ||
    expected.review_criteria.length === 0 ||
    expected.review_criteria.some((item) => typeof item !== "string" || !item.trim())
  ) {
    failed = true;
    console.error(`${benchmarkCase}: expected.yaml requires non-empty review_criteria array`);
    continue;
  }

  if (
    expected.forbidden_phrases !== undefined &&
    (!Array.isArray(expected.forbidden_phrases) ||
      expected.forbidden_phrases.some((item) => typeof item !== "string" || !item.trim()))
  ) {
    failed = true;
    console.error(
      `${benchmarkCase}: expected.yaml forbidden_phrases must be an array of non-empty strings`,
    );
    continue;
  }

  const promptText = fs.readFileSync(path.join(caseDir, "prompt.md"), "utf8").trim();
  const goldenOutput = fs.readFileSync(path.join(caseDir, "golden_output.md"), "utf8").trim();
  if (!promptText || !goldenOutput) {
    failed = true;
    console.error(`${benchmarkCase}: prompt.md and golden_output.md must not be empty`);
    continue;
  }

  const forbiddenPhrases = expected.forbidden_phrases ?? [];
  const violations = forbiddenPhrases.filter((phrase) => goldenOutput.includes(phrase));
  if (violations.length > 0) {
    failed = true;
    console.error(
      `${benchmarkCase}: golden output contains forbidden phrases: ${violations.join(", ")}`,
    );
    continue;
  }

  if (benchmarkCase === "short_cta" && trailingPeriodPattern.test(goldenOutput)) {
    failed = true;
    console.error(`${benchmarkCase}: short CTA golden output must not end with a period`);
    continue;
  }

  let lineError = false;
  for (const line of goldenOutput.split(/\r?\n/u)) {
    const labelMatch = line.match(shortLabelLinePattern);
    if (labelMatch && trailingPeriodPattern.test(labelMatch[1])) {
      failed = true;
      lineError = true;
      console.error(`${benchmarkCase}: short UI label ends with trailing period: ${line}`);
      break;
    }
    const tableMatch = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (
      tableMatch &&
      shortTableComponentPattern.test(tableMatch[1].trim()) &&
      trailingPeriodPattern.test(tableMatch[2].trim())
    ) {
      failed = true;
      lineError = true;
      console.error(
        `${benchmarkCase}: short table component "${tableMatch[1]}" ends with trailing period: ${tableMatch[2]}`,
      );
      break;
    }
  }
  if (lineError) {
    continue;
  }

  if (
    benchmarkCase === "media_podcast_bdi" &&
    !/<bdi dir="ltr">\d+<\/bdi>\s*دقيقة/u.test(goldenOutput)
  ) {
    failed = true;
    console.error(`${benchmarkCase}: missing <bdi dir="ltr"> around numeric minute duration`);
    continue;
  }

  if (benchmarkCase === "translation_variables") {
    const issue = validateTranslationVariables(promptText, goldenOutput);
    if (issue) {
      failed = true;
      console.error(`${benchmarkCase}: ${issue}`);
      continue;
    }
  }

  if (benchmarkCase === "arabic_plural") {
    const issue = validateArabicPlural(goldenOutput);
    if (issue) {
      failed = true;
      console.error(`${benchmarkCase}: ${issue}`);
      continue;
    }
  }

  console.log(`${benchmarkCase}: valid`);
}

if (failed) {
  process.exit(1);
}

console.log(`${cases.length} benchmark fixture(s) validated.`);
