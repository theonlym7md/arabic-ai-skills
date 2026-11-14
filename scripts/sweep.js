const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const slopRules = [
  { pattern: /قم بـ/u, label: "قم بـ" },
  { pattern: /تم بنجاح/u, label: "تم بنجاح" },
  { pattern: /الرجاء/u, label: "الرجاء" },
  { pattern: /يرجى\s+التكرم/u, label: "يرجى التكرم" },
  { pattern: /في\s+إطار\s+حرصنا/u, label: "في إطار حرصنا" },
  { pattern: /يسعدنا\s+ويشرفنا/u, label: "يسعدنا ويشرفنا" },
  { pattern: /حدث\s+خطأ\s+غير\s+متوقع/u, label: "حدث خطأ غير متوقع" },
  { pattern: /جاري\s+(?:التحميل|المراجعة|جلب|معالجة)/u, label: "جاري + مصدر/اسم" },
  { pattern: /سجلك\s+خالي/u, label: "سجلك خالي (يُحذف الياء: خالٍ)" },
  { pattern: /عزيزي\s+المستخدم/u, label: "عزيزي المستخدم" },
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
    normalized === "skills/arabicskill/examples/govtech_violation_empty_state.md"
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

function scanFile(filePath, baseRoot) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const hits = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const rule of slopRules) {
      if (rule.pattern.test(line)) {
        hits.push({
          file: path.relative(baseRoot, filePath).replace(/\\/g, "/") || path.basename(filePath),
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

main();
