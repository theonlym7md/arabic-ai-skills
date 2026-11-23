const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const { normalizeArabic } = require("./shared_rules.js");

const root = path.resolve(__dirname, "..");

// Patterns run against normalized Arabic (diacritics/tatweel stripped, hamza/ta-marbuta folded).
const slopRules = [
  { pattern: /(?<![\p{L}])(?:قم|قومي|قوموا)\s+ب[\p{L}]/u, label: "قم بـ / قم بفعل..." },
  {
    pattern: /(?<![\p{L}])تمت?\s+(?:[\p{L}]+\s+){0,4}بنجاح(?![\p{L}])/u,
    label: "تم/تمت (...) بنجاح",
  },
  { pattern: /(?<![\p{L}])الرجاء(?![\p{L}])/u, label: "الرجاء" },
  { pattern: /(?<![\p{L}])يرجي\s+التكرم(?![\p{L}])/u, label: "يرجى التكرم" },
  { pattern: /(?<![\p{L}])في\s+اطار\s+حرصنا(?![\p{L}])/u, label: "في إطار حرصنا" },
  { pattern: /(?<![\p{L}])يسعدنا\s+ويشرفنا(?![\p{L}])/u, label: "يسعدنا ويشرفنا" },
  { pattern: /(?<![\p{L}])يسعدنا\s+خدمتكم(?![\p{L}])/u, label: "يسعدنا خدمتكم" },
  { pattern: /(?<![\p{L}])حدث\s+خطا\s+غير\s+متوقع(?![\p{L}])/u, label: "حدث خطأ غير متوقع" },
  {
    pattern: /(?<![\p{L}])جاري\s+(?:ال)?[\p{L}]{3,}(?![\p{L}])/u,
    label: "جاري + مصدر/اسم (الصواب: جارٍ أو فعل مباشر)",
  },
  {
    pattern: /(?<![\p{L}])(?:سجلك|حسابك|بريدك|صندوقك)\s+خالي(?![\p{L}])/u,
    label: "خالي (يُحذف الياء في النكرة المرفوعة: خالٍ)",
  },
  {
    pattern: /(?<![\p{L}])عزيزي\s+(?:المستخدم|العميل)(?![\p{L}])/u,
    label: "عزيزي المستخدم/العميل",
  },
  { pattern: /(?<![\p{L}])(?:اضغط|انقر)\s+هنا(?![\p{L}])/u, label: "اضغط/انقر هنا" },
  {
    pattern:
      /(?<![\p{L}])(?:[وف])?(?:إنضم|إستبدل|إتصل|إكسب|إحجز|إشترك|إستكشف|إضغط|إبدأ)(?:وا|ي|ن)?(?![\p{L}])/u,
    rawOnly: true,
    label:
      "همزة قطع خاطئة في فعل الأمر (الصواب همزة وصل: انضم/استبدل/اتصل/اكسب/احجز/اشترك/استكشف/اضغط/ابدأ)",
  },
];

const codeExtensions = new Set([
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
  ".json",
]);

const targetExtensions = new Set([...codeExtensions, ".md", ".txt", ".yaml", ".yml"]);

function parseArgs(argv) {
  let targetDir = null;
  let customTarget = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--target") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("--target requires a directory or file path.");
      }
      targetDir = path.resolve(process.cwd(), next);
      customTarget = true;
      i += 1;
    } else if (arg.startsWith("--target=")) {
      targetDir = path.resolve(process.cwd(), arg.slice("--target=".length));
      customTarget = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node scripts/sweep.js [--target <dir-or-file>]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return { targetDir: targetDir ?? root, customTarget };
}

function shouldScanDefaultRepoFile(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (
    normalized === "scripts/sweep.js" ||
    normalized === "scripts/shared_rules.js" ||
    normalized.startsWith("tests/") ||
    normalized.startsWith("coverage/") ||
    normalized.startsWith("docs/demos/") ||
    normalized === "src/routing.generated.ts"
  ) {
    return false;
  }

  if (codeExtensions.has(path.extname(normalized))) {
    return true;
  }

  return (
    normalized === "README.md" ||
    /^benchmarks\/cases\/[^/]+\/golden_output\.md$/u.test(normalized) ||
    /^skills\/[^/]+\/SKILL\.md$/u.test(normalized) ||
    /^skills\/[^/]+\/README\.md$/u.test(normalized) ||
    /^skills\/[^/]+\/agents\/openai\.yaml$/u.test(normalized) ||
    /^skills\/[^/]+\/plugins\/[^/]+\/plugin\.yaml$/u.test(normalized) ||
    /^skills\/[^/]+\/(?:examples|references|reasoning)\/.+\.md$/u.test(normalized) ||
    /^skills\/[^/]+\/knowledge\/entities\/[^/]+\.yaml$/u.test(normalized)
  );
}

function collectFiles(entryPath, customTarget) {
  const stats = fs.statSync(entryPath);
  if (stats.isFile()) {
    return [entryPath];
  }

  const results = [];
  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if ([".git", "node_modules", "dist", "coverage"].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (customTarget) {
        if (targetExtensions.has(ext)) {
          results.push(fullPath);
        }
      } else {
        const relative = path.relative(root, fullPath);
        if (shouldScanDefaultRepoFile(relative)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(entryPath);
  return results;
}

const negativeHeadingPattern =
  /^\s{0,3}(#{1,6})\s+.*(?:❌|Before(?!\s*(?:vs\.?|and|&|\/)\s*After)|قبل التحرير|صياغة خاطئة|الخطأ الشائع|مرفوض)/iu;
const headingPattern = /^\s{0,3}(#{1,6})\s+/u;
const negativeInlineClausePattern =
  /(?:بدلًا?\s+من|بدل|تجنّ?ب|اجتنب|تخلو\s+من|لا\s+تستخدم|لا\s+تقل|صياغة\s+ركيكة|صياغة\s+خاطئة|قبل\s+التحرير|Before:)[^.;؛\n]*(?:[«"`*][^»"`*]*[»"`*](?:\s*(?:و|أو|،|,)\s*[«"`*][^»"`*]*[»"`*])*|\S+(?:\s+\S+){0,5})/giu;
const negativeCellMarker = /(?:❌|قبل التحرير|Before:|صياغة خاطئة|صياغة ركيكة)/iu;

function stripNegativeDocSegments(line) {
  const trimmed = line.trim();
  // In Markdown tables, inspect each cell individually so a negative cell never hides slop in the positive cell.
  if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
    const cells = trimmed.slice(1, -1).split("|");
    return cells
      .filter((cell) => !negativeCellMarker.test(cell))
      .map((cell) => cell.replace(negativeInlineClausePattern, " "))
      .join(" | ");
  }

  if (/^\s*(?:[-*>]\s*)?(?:❌|Before:|قبل التحرير:?)/iu.test(line)) {
    return "";
  }

  return line.replace(negativeInlineClausePattern, " ");
}

function scanText(text) {
  const raw = String(text);
  const normalized = normalizeArabic(raw);
  const matches = [];
  for (const rule of slopRules) {
    const target = rule.rawOnly ? raw : normalized;
    if (rule.pattern.test(target)) {
      matches.push(rule.label);
    }
  }
  return matches;
}

function scanEntityYaml(content, relative) {
  const hits = [];
  let parsed;
  try {
    parsed = YAML.parse(content);
  } catch {
    return hits;
  }
  if (!parsed || typeof parsed !== "object") {
    return hits;
  }

  const positiveFields = [
    ...(Array.isArray(parsed.directives) ? parsed.directives : []),
    ...(Array.isArray(parsed.examples) ? parsed.examples : []),
    ...(Array.isArray(parsed.aliases) ? parsed.aliases : []),
    ...(typeof parsed.source === "string" ? [parsed.source] : []),
  ];

  for (const entry of positiveFields) {
    if (typeof entry !== "string") {
      continue;
    }
    for (const label of scanText(entry)) {
      hits.push({
        file: relative,
        line: 1,
        label,
        text: entry.trim(),
      });
    }
  }
  return hits;
}

function scanFile(filePath, baseRoot, options = {}) {
  const content = fs.readFileSync(filePath, "utf8");
  const relative = (path.relative(baseRoot, filePath) || path.basename(filePath)).replace(
    /\\/g,
    "/",
  );
  const repoRelative = path.relative(root, filePath).replace(/\\/g, "/");
  const isEntityYaml =
    options.isEntityYaml ??
    /^skills\/[^/]+\/knowledge\/entities\/(?!_schema\.yaml)[^/]+\.yaml$/u.test(repoRelative);

  if (isEntityYaml) {
    return scanEntityYaml(content, relative);
  }

  const isSkillDoc =
    options.isSkillDoc ??
    (repoRelative === "README.md" ||
      /^skills\/[^/]+\/(?:SKILL\.md|README\.md|(?:examples|references|reasoning)\/.+\.md)$/u.test(
        repoRelative,
      ));

  const lines = content.split(/\r?\n/u);
  const hits = [];
  let negativeHeadingLevel = 0;
  let openFenceChar = null;
  let openFenceLen = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (isSkillDoc) {
      if (openFenceChar) {
        const closeMatch = line.match(/^\s{0,3}(`{3,}|~{3,})\s*$/u);
        if (
          closeMatch &&
          closeMatch[1][0] === openFenceChar &&
          closeMatch[1].length >= openFenceLen
        ) {
          openFenceChar = null;
          openFenceLen = 0;
        }
      } else {
        const openMatch = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/u);
        if (openMatch && !(openMatch[1][0] === "`" && openMatch[2].includes("`"))) {
          openFenceChar = openMatch[1][0];
          openFenceLen = openMatch[1].length;
        }
      }

      if (!openFenceChar) {
        if (/^\s*---\s*$/u.test(line)) {
          negativeHeadingLevel = 0;
        }
        const negMatch = line.match(negativeHeadingPattern);
        if (negMatch) {
          negativeHeadingLevel = negMatch[1].length;
          continue;
        }
        const headingMatch = line.match(headingPattern);
        if (
          headingMatch &&
          negativeHeadingLevel > 0 &&
          headingMatch[1].length <= negativeHeadingLevel
        ) {
          negativeHeadingLevel = 0;
        }
      }

      if (negativeHeadingLevel > 0) {
        continue;
      }
    }

    const inspectLine = isSkillDoc ? stripNegativeDocSegments(line) : line;
    if (!inspectLine.trim()) {
      continue;
    }

    for (const label of scanText(inspectLine)) {
      hits.push({
        file: relative,
        line: i + 1,
        label,
        text: line.trim(),
      });
    }
  }

  return hits;
}

function main() {
  const { targetDir, customTarget } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(targetDir)) {
    console.error(`Sweep target does not exist: ${targetDir}`);
    process.exit(1);
  }

  const files = collectFiles(targetDir, customTarget);
  const baseRoot = fs.statSync(targetDir).isDirectory() ? targetDir : path.dirname(targetDir);
  const findings = files.flatMap((file) => scanFile(file, baseRoot));

  if (findings.length > 0) {
    console.error(`Found ${findings.length} Arabic slop match(es):`);
    for (const finding of findings) {
      console.error(`- ${finding.file}:${finding.line} [${finding.label}]: ${finding.text}`);
    }
    process.exit(1);
  }

  console.log(`Sweep clean: checked ${files.length} file(s) with 0 slop matches.`);
}

if (require.main === module) {
  main();
}

module.exports = { slopRules, scanText, scanFile };
