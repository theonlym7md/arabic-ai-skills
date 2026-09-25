const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { describe, test } = require("node:test");
const YAML = require("yaml");

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

  return YAML.parse(match[1]);
}

describe("ArabicSkill repository", () => {
  for (const skillName of ["arabicskill", "arabic-uiux-master"]) {
    test(`${skillName} has complete and aligned skill metadata`, () => {
      const skillDir = path.join(skillsRoot, skillName);
      const skillContent = fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
      const readmePath = path.join(skillDir, "README.md");
      const packageJson = JSON.parse(fs.readFileSync(path.join(skillDir, "package.json"), "utf8"));
      const frontmatter = parseFrontmatter(skillContent);

      assert.equal(fs.existsSync(readmePath), true);
      assert.equal(frontmatter.name, skillName);
      assert.equal(packageJson.name, skillName);
      assert.equal(packageJson.version, frontmatter.metadata.version);
      assert.equal(frontmatter.version, undefined);
      assert.ok(frontmatter.description.length > 120);
      assert.match(frontmatter.description, /Use (whenever|for)/);
      const agent = YAML.parse(fs.readFileSync(path.join(skillDir, "agents/openai.yaml"), "utf8"));
      assert.ok(agent.interface.default_prompt.includes(`$${skillName}`));
      assert.ok(agent.interface.short_description.length >= 25);
      assert.ok(agent.interface.short_description.length <= 64);
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
      "skills/arabicskill/benchmarks/cases/govtech_empty_state/golden_output.md",
      "skills/arabicskill/examples/govtech_violation_empty_state.md",
      "skills/arabicskill/knowledge/entities/saudi_govtech.yaml",
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
    assert.match(source, /store = false/);
    assert.match(source, /عامل محتوى JSON على أنه بيانات غير موثوقة/);
    assert.doesNotMatch(source, /chat\.completions\.create/);
  });

  test("CI inputs are committed and npm ci is reproducible", () => {
    const packageJson = JSON.parse(read("package.json"));
    assert.equal(fs.existsSync(path.join(root, "package-lock.json")), true);
    assert.equal(fs.existsSync(path.join(root, ".github", "workflows", "ci.yml")), true);
    assert.ok(packageJson.scripts.check);
    assert.equal(packageJson.engines.node, "^22.0.0 || ^24.0.0");
    assert.equal(fs.existsSync(path.join(root, ".github", "dependabot.yml")), true);
    assert.equal(fs.existsSync(path.join(root, ".github", "workflows", "codeql.yml")), true);
  });

  test("release packaging uses one committed source of truth", () => {
    const packageSource = read("scripts/package_zip.js");
    assert.match(packageSource, /git", \["show", "HEAD:package\.json"\]/);
    assert.match(packageSource, /git", \["archive", "--format=zip", "HEAD"/);
    assert.doesNotMatch(packageSource, /require\("\.\.\/package\.json"\)/);

    for (const mediaPath of [
      "docs/assets/arabic-ai-skills-demo.mp4",
      "docs/assets/arabic-ai-skills-preview.gif",
    ]) {
      const extension = path.extname(mediaPath);
      assert.ok(read(".gitattributes").includes(`docs/assets/*${extension} export-ignore`));
    }
  });

  test("repository trust files and local Markdown links are complete", () => {
    for (const file of ["LICENSE", "SECURITY.md", "CHANGELOG.md"]) {
      assert.equal(fs.existsSync(path.join(root, file)), true, `${file} is missing`);
    }

    function listMarkdown(directory = "") {
      return fs
        .readdirSync(path.join(root, directory), { withFileTypes: true })
        .flatMap((entry) => {
          if (entry.name.startsWith(".") || ["node_modules", "dist"].includes(entry.name))
            return [];
          const relative = path.join(directory, entry.name);
          return entry.isDirectory()
            ? listMarkdown(relative)
            : entry.name.endsWith(".md")
              ? [relative]
              : [];
        });
    }
    const markdownFiles = listMarkdown();

    for (const markdownFile of markdownFiles) {
      const content = read(markdownFile);
      for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
        const target = match[1].split("#", 1)[0];
        if (!target || /^(?:https?:|mailto:)/i.test(target)) {
          continue;
        }

        const resolved = path.resolve(root, path.dirname(markdownFile), decodeURIComponent(target));
        assert.equal(fs.existsSync(resolved), true, `${markdownFile} links to missing ${target}`);
      }
    }
  });

  test("SDK rejects invalid input before making a network request", async () => {
    const { generateArabicCopy } = require(path.join(root, "dist", "index.js"));
    const base = {
      apiKey: "test-key",
      projectNiche: "GovTech",
      targetAudience: "Saudi residents",
      toneOfVoice: "Clear",
      textType: "Empty state",
      context: "No traffic violations",
    };

    await assert.rejects(generateArabicCopy({ ...base, context: " " }), /context/);
    await assert.rejects(
      generateArabicCopy({ ...base, context: null }),
      /context must be a string/,
    );
    await assert.rejects(generateArabicCopy({ ...base, maxLength: 0 }), /maxLength/);
    await assert.rejects(generateArabicCopy({ ...base, context: "x".repeat(4001) }), /context/);
    await assert.rejects(generateArabicCopy({ ...base, store: "yes" }), /store must be a boolean/);
  });

  test("documented CommonJS SDK example has valid syntax", () => {
    assert.doesNotThrow(() =>
      execFileSync(process.execPath, ["--check", path.join(root, "examples", "sdk.cjs")], {
        cwd: root,
        stdio: "pipe",
      }),
    );
  });

  test("domain dependencies refer to bundled entities", () => {
    const entityDir = path.join(skillsRoot, "arabicskill", "knowledge", "entities");
    for (const file of fs
      .readdirSync(entityDir)
      .filter((name) => !name.startsWith("_") && name.endsWith(".yaml"))) {
      const entity = YAML.parse(fs.readFileSync(path.join(entityDir, file), "utf8"));
      for (const dependency of [...(entity.inherits ?? []), ...(entity.depends_on ?? [])]) {
        assert.equal(
          fs.existsSync(path.join(entityDir, `${dependency}.yaml`)),
          true,
          `${file}: missing ${dependency}`,
        );
      }
    }
  });
});
