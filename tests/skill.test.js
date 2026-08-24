const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { describe, test } = require("node:test");

const root = path.join(__dirname, "..");
const skillsRoot = path.join(root, "skills");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error("Missing YAML frontmatter");
  }

  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([a-z_]+):\s*["']?(.*?)["']?$/))
      .filter(Boolean)
      .map((parts) => [parts[1], parts[2]]),
  );
}

describe("Arabic AI skills repository", () => {
  for (const skillName of ["arabic-intelligence", "arabic-uiux-master"]) {
    test(`${skillName} has complete and aligned skill metadata`, () => {
      const skillDir = path.join(skillsRoot, skillName);
      const skillContent = fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
      const readmePath = path.join(skillDir, "README.md");
      const packageJson = JSON.parse(fs.readFileSync(path.join(skillDir, "package.json"), "utf8"));
      const frontmatter = parseFrontmatter(skillContent);

      assert.equal(fs.existsSync(readmePath), true);
      assert.equal(frontmatter.name, skillName);
      assert.equal(packageJson.name, skillName);
      assert.equal(packageJson.version, frontmatter.version);
      assert.ok(frontmatter.description.length > 120);
      assert.match(frontmatter.description, /Use (whenever|for)/);
    });
  }

  test("all deterministic validators pass", () => {
    assert.doesNotThrow(() =>
      execFileSync(process.execPath, [path.join(root, "scripts", "validate_all.js")], {
        cwd: root,
        stdio: "pipe",
      }),
    );
  });

  test("positive examples avoid known grammar regressions", () => {
    const positiveFiles = [
      "README.md",
      "skills/arabic-intelligence/benchmarks/cases/govtech_empty_state/golden_output.md",
      "skills/arabic-intelligence/examples/govtech_violation_empty_state.md",
      "skills/arabic-intelligence/knowledge/entities/saudi_govtech.yaml",
      "skills/arabic-uiux-master/SKILL.md",
    ];

    for (const file of positiveFiles) {
      const content = read(file);
      assert.doesNotMatch(content, /سجلك خالي من المخالفات/);
      assert.doesNotMatch(content, /جاري (مراجعة|جلب|معالجة)/);
    }
  });

  test("the SDK uses configurable Responses API structured output", () => {
    const source = read("src/index.ts");
    assert.match(source, /openai\.responses\.create/);
    assert.match(source, /type: "json_schema"/);
    assert.match(source, /process\.env\.OPENAI_MODEL \?\? "gpt-5\.4"/);
    assert.doesNotMatch(source, /chat\.completions\.create/);
  });

  test("CI inputs are committed and npm ci is reproducible", () => {
    const packageJson = JSON.parse(read("package.json"));
    assert.equal(fs.existsSync(path.join(root, "package-lock.json")), true);
    assert.equal(fs.existsSync(path.join(root, ".github", "workflows", "ci.yml")), true);
    assert.ok(packageJson.scripts.check);
  });
});
