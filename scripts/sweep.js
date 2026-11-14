const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const slopRules = [
  { pattern: /(?<![\p{L}])(?:قم|قومي|قوموا)\s+ب(?:ـ|[\p{L}])/u, label: "قم بـ / قم بفعل..." },
  { pattern: /(?<![\p{L}])تم\s+(?:[\p{L}]+\s+){0,2}بنجاح(?![\p{L}])/u, label: "تم (...) بنجاح" },
  { pattern: /الرجاء/u, label: "الرجاء" },
  { pattern: /يرجى\s+التكرم/u, label: "يرجى التكرم" },
  { pattern: /في\s+إطار\s+حرصنا/u, label: "في إطار حرصنا" },
  { pattern: /يسعدنا\s+ويشرفنا/u, label: "يسعدنا ويشرفنا" },
  { pattern: /حدث\s+خطأ\s+غير\s+متوقع/u, label: "حدث خطأ غير متوقع" },
  {
    pattern:
      /(?<![\p{L}])جاري\s+(?:التحميل|المراجعة|جلب|معالجة|الإرسال|التحقق|الحفظ|التحديث|البحث|إعداد|تجهيز)(?![\p{L}])/u,
    label: "جاري + مصدر/اسم",
  },
  { pattern: /سجلك\s+خالي/u, label: "سجلك خالي (يُحذف الياء: خالٍ)" },
  { pattern: /عزيزي\s+المستخدم/u, label: "عزيزي المستخدم" },
  {
    pattern:
      /(?<![\p{L}])(?:[وف])?(?:إنضم|إستبدل|إتصل|إكسب|إحجز|إشترك|إستكشف)(?:وا|ي|ن)?(?![\p{L}])/u,
    label: "همزة قطع خاطئة في فعل الأمر (الصواب همزة وصل: انضم/استبدل/اتصل/اكسب/احجز/اشترك/استكشف)",
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
]);

const targetExtensions = new Set([...codeExtensions, ".json", ".md"]);

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
    normalized.startsWith("tests/") ||
    normalized.startsWith("coverage/")
  ) {
    return false;
  }

  if (codeExtensions.has(path.extname(normalized))) {
    return true;
  }

  return (
    /^benchmarks\/cases\/[^/]+\/golden_output\.md$/u.test(normalized) ||
    /^skills\/[^/]+\/SKILL\.md$/u.test(normalized) ||
    /^skills\/[^/]+\/README\.md$/u.test(normalized) ||
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
  /^\s{0,3}(#{1,6})\s+.*(?:❌|Before|قبل التحرير|صياغة خاطئة|الخطأ الشائع|مرفوض)/iu;
const headingPattern = /^\s{0,3}(#{1,6})\s+/u;
const negativeLinePattern =
  /(?:بدلًا?\s+من|بدل\s*(?::|[«:`*])|تجنّ?ب\s*(?::|[«:`*])|لا\s+تستخدم|لا\s+تقل|صياغة\s+ركيكة|صياغة\s+خاطئة|قبل\s+التحرير|Before:|❌)/iu;

function scanText(text) {
  const matches = [];
  for (const rule of slopRules) {
    if (rule.pattern.test(text)) {
      matches.push(rule.label);
    }
  }
  return matches;
}

function scanFile(filePath, baseRoot, options = {}) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const hits = [];
  const relative = (path.relative(baseRoot, filePath) || path.basename(filePath)).replace(
    /\\/g,
    "/",
  );
  const repoRelative = path.relative(root, filePath).replace(/\\/g, "/");
  const isSkillDoc =
    options.isSkillDoc ??
    /^skills\/[^/]+\/(?:SKILL\.md|README\.md|(?:examples|references|reasoning)\/.+\.md)$/u.test(
      repoRelative,
    );
  const isEntityYaml = /^skills\/[^/]+\/knowledge\/entities\/[^/]+\.yaml$/u.test(repoRelative);
  let negativeHeadingLevel = 0;
  let inNegativeYaml = false;
  let inFence = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (isSkillDoc) {
      if (/^\s*(?:```|~~~)/u.test(line)) {
        inFence = !inFence;
      }
      if (!inFence) {
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
      if (negativeHeadingLevel > 0 || negativeLinePattern.test(line)) {
        continue;
      }
    } else if (isEntityYaml) {
      if (/^\s*negative_examples:\s*$/u.test(line)) {
        inNegativeYaml = true;
        continue;
      }
      if (/^[a-zA-Z0-9_]+:/u.test(line)) {
        inNegativeYaml = false;
      }
      if (inNegativeYaml) {
        continue;
      }
    }

    for (const rule of slopRules) {
      if (rule.pattern.test(line)) {
        hits.push({
          file: relative,
          line: i + 1,
          label: rule.label,
          text: line.trim(),
        });
      }
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
