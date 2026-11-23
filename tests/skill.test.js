const assert = require("node:assert/strict");
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { describe, test } = require("node:test");
const YAML = require("yaml");
const {
  findShortLabelPeriodViolations,
  hasTrailingShortLabelPeriod,
} = require("../scripts/shared_rules.js");
const {
  validateArabicPlural,
  validateTranslationVariables,
} = require("../scripts/validate_benchmarks.js");

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
  const skillNames = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const skillName of skillNames) {
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
      assert.equal(packageJson.main, undefined, "skill manifests must not use invalid JS main");
      assert.equal(frontmatter.version, undefined);
      assert.ok(frontmatter.description.length > 120);
      assert.ok(frontmatter.description.length <= 1024);
      assert.match(frontmatter.description, /Use (whenever|for)/);
      const agent = YAML.parse(fs.readFileSync(path.join(skillDir, "agents/openai.yaml"), "utf8"));
      assert.ok(agent.interface.default_prompt.includes(`$${skillName}`));
      assert.ok(agent.interface.short_description.length >= 25);
      assert.ok(agent.interface.short_description.length <= 64);
    });
  }

  test("skills.sh manifest and root README stay synchronized with skills/", () => {
    const manifest = JSON.parse(read("skills.sh.json"));
    const listedSkills = (manifest.groupings ?? []).flatMap((group) => group.skills ?? []);
    assert.deepEqual([...listedSkills].sort(), skillNames);

    const rootReadme = read("README.md");
    for (const skillName of skillNames) {
      assert.ok(rootReadme.includes(`[${skillName}]`), `README.md table is missing [${skillName}]`);
    }
  });

  test("all deterministic validators pass", () => {
    assert.doesNotThrow(() =>
      execFileSync(process.execPath, [path.join(root, "scripts", "validate_all.js")], {
        cwd: root,
        stdio: "pipe",
      }),
    );
  });

  for (const args of [["--case"], ["--case="], ["--case", "--live"]]) {
    test(`benchmark rejects ${args.join(" ")} before running fixtures`, () => {
      const { status, stdout, stderr, error } = spawnSync(
        process.execPath,
        [path.join(root, "scripts", "run_benchmark.js"), ...args],
        {
          cwd: root,
          encoding: "utf8",
          env: { ...process.env, OPENAI_API_KEY: "" },
        },
      );

      assert.equal(error, undefined);
      assert.equal(status, 1);
      assert.match(stderr, /--case requires a case name/i);
      assert.equal(stdout, "");
    });
  }

  test("positive examples avoid known grammar and terminology regressions", () => {
    const collectMd = (dir) =>
      fs
        .readdirSync(path.join(root, dir))
        .filter((name) => name.endsWith(".md"))
        .map((name) => path.join(dir, name).replace(/\\/g, "/"));
    const positiveFiles = [
      ...new Set([
        "README.md",
        "benchmarks/cases/govtech_empty_state/golden_output.md",
        "benchmarks/cases/heading_punctuation/golden_output.md",
        "benchmarks/cases/auth_gateway_variants/golden_output.md",
        "skills/arabicskill/examples/govtech_violation_empty_state.md",
        "skills/arabicskill/knowledge/entities/saudi_govtech.yaml",
        ...collectMd("skills/arabicskill/references"),
        "skills/arabic-uiux-master/SKILL.md",
        ...collectMd("skills/arabic-uiux-master/references"),
        ...collectMd("skills/arabic-uiux-master/examples"),
      ]),
    ];

    for (const file of positiveFiles) {
      for (const line of read(file).split(/\r?\n/)) {
        if (
          /(?:تجنّ?ب|اجتنب|تخلو\s+من|بدلًا?\s+من|بدل\s*:|لا تقل|قبل التحرير|صياغة خاطئة|Before:|❌)/u.test(
            line,
          )
        ) {
          continue;
        }
        assert.doesNotMatch(line, /سجلك خالي من المخالفات/u, file);
        assert.doesNotMatch(line, /جاري (?:مراجعة|جلب|معالجة)/u, file);
        assert.doesNotMatch(line, /تمرير مفاتيح/u, file);
        assert.doesNotMatch(line, /Unicode مهروبة/u, file);
        assert.doesNotMatch(line, /شريط التمرير والمسار/u, file);
        assert.doesNotMatch(line, /يوجد رسوم/u, file);
      }
    }
  });

  test("main titles and CTA labels in golden outputs omit trailing periods via shared validator", () => {
    const casesDir = path.join(root, "benchmarks", "cases");
    for (const folder of fs.readdirSync(casesDir)) {
      const goldenPath = path.join(casesDir, folder, "golden_output.md");
      if (!fs.existsSync(goldenPath)) continue;
      const content = fs.readFileSync(goldenPath, "utf8");
      if (folder === "short_cta") {
        assert.equal(
          hasTrailingShortLabelPeriod(content.trim()),
          false,
          `${folder}/golden_output.md CTA must not end with a period: ${content}`,
        );
      }
      const violations = findShortLabelPeriodViolations(content);
      assert.deepEqual(
        violations,
        [],
        `${folder}/golden_output.md violations: ${JSON.stringify(violations)}`,
      );
    }
  });

  test("the SDK uses Responses API structured output with configurable store and model", async () => {
    const { generateArabicCopy } = require(path.join(root, "dist", "index.js"));
    const requests = [];
    const fakeClient = {
      responses: {
        create: async (payload) => {
          requests.push(payload);
          return {
            id: "resp_contract",
            object: "response",
            status: "completed",
            output: [
              {
                type: "message",
                role: "assistant",
                content: [
                  {
                    type: "output_text",
                    text: JSON.stringify({ options: [{ text: "أرسل الطلب", style: "مباشر" }] }),
                  },
                ],
              },
            ],
          };
        },
      },
    };

    await generateArabicCopy({
      client: fakeClient,
      projectNiche: "SaaS",
      targetAudience: "Arabic teams",
      toneOfVoice: "Clear",
      textType: "CTA button",
      context: "Submit invoice",
      store: true,
    });

    assert.equal(requests.length, 1);
    assert.equal(requests[0].store, true);
    assert.equal(requests[0].text.format.type, "json_schema");
    assert.equal(requests[0].text.format.strict, true);
    assert.match(requests[0].input, /^<product_data>/);
    assert.match(requests[0].instructions, /untrusted product data/);
  });

  test("CI inputs are committed, dual exports exist, and npm ci is reproducible", () => {
    const packageJson = JSON.parse(read("package.json"));
    assert.equal(fs.existsSync(path.join(root, "package-lock.json")), true);
    assert.equal(fs.existsSync(path.join(root, ".github", "workflows", "ci.yml")), true);
    assert.ok(packageJson.scripts.check);
    assert.equal(packageJson.engines.node, ">=22.0.0");
    assert.ok(packageJson.exports["."].import);
    assert.ok(packageJson.exports["."].require);
    assert.equal(fs.existsSync(path.join(root, ".github", "dependabot.yml")), true);
    assert.equal(fs.existsSync(path.join(root, ".github", "workflows", "codeql.yml")), true);
  });

  test("release packaging uses committed HEAD with top-level prefix and export-ignore rules", () => {
    const packageSource = read("scripts/package_zip.js");
    assert.match(packageSource, /git", \["show", "HEAD:package\.json"\]/);
    assert.match(packageSource, /--prefix=\$\{prefix\}/);
    assert.doesNotMatch(packageSource, /require\("\.\.\/package\.json"\)/);

    const gitattributes = read(".gitattributes");
    for (const rule of [
      "docs/assets/*.mp4 export-ignore",
      "docs/assets/*.gif export-ignore",
      "docs/demos/** export-ignore",
      "docs/assets/ab/** export-ignore",
      "docs/research/** export-ignore",
    ]) {
      assert.ok(gitattributes.includes(rule), `.gitattributes missing "${rule}"`);
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
          if (
            [".git", "node_modules", "dist"].includes(entry.name) ||
            (entry.name.startsWith(".") && entry.name !== ".github")
          ) {
            return [];
          }
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
      const content = read(markdownFile).replace(/```[\s\S]*?```/gu, "");
      for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
        const rawHref = match[1].trim().split(/\s+/, 1)[0];
        const target = rawHref.split(/[?#]/, 1)[0];
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

    await assert.rejects(generateArabicCopy(null), /params must be an object/);
    await assert.rejects(generateArabicCopy([]), /params must be an object/);
    await assert.rejects(generateArabicCopy({ ...base, apiKey: "   " }), /apiKey/);
    await assert.rejects(generateArabicCopy({ ...base, projectNiche: " " }), /projectNiche/);
    await assert.rejects(generateArabicCopy({ ...base, targetAudience: " " }), /targetAudience/);
    await assert.rejects(generateArabicCopy({ ...base, toneOfVoice: " " }), /toneOfVoice/);
    await assert.rejects(generateArabicCopy({ ...base, textType: " " }), /textType/);
    await assert.rejects(generateArabicCopy({ ...base, context: " " }), /context/);
    await assert.rejects(
      generateArabicCopy({ ...base, context: null }),
      /context must be a string/,
    );
    await assert.rejects(
      generateArabicCopy({ ...base, context: "bad\u0000nul" }),
      /control or BiDi/,
    );
    await assert.rejects(generateArabicCopy({ ...base, maxLength: 0 }), /maxLength/);
    await assert.rejects(generateArabicCopy({ ...base, maxLength: 101 }), /maxLength/);
    await assert.rejects(generateArabicCopy({ ...base, maxLength: 1.5 }), /maxLength/);
    await assert.rejects(generateArabicCopy({ ...base, maxLength: Number.NaN }), /maxLength/);
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
      const dependencies = [
        ...(entity.inherits ?? []),
        ...(entity.depends_on ?? []),
        ...(entity.requires ?? []),
        ...(entity.optional ?? []),
        ...(entity.conflicts_with ?? []),
        ...(entity.fallback ? [entity.fallback] : []),
      ];
      for (const dependency of dependencies) {
        assert.equal(
          fs.existsSync(path.join(entityDir, `${dependency}.yaml`)),
          true,
          `${file}: missing ${dependency}`,
        );
      }
    }
  });

  test("package resolution points to compiled dist/index.js", () => {
    const resolved = require.resolve("arabicskill");
    assert.equal(resolved.endsWith(path.join("dist", "index.js")), true, resolved);
  });

  test("both skills unify visual archetypes, design-decisions parity, and README keeps archive links intact", () => {
    const expPatterns = read("skills/arabicskill/references/experience-patterns.md");
    const uiuxSkill = read("skills/arabic-uiux-master/SKILL.md");
    const uiuxFlows = read("skills/arabic-uiux-master/references/flow-patterns.md");
    assert.equal(
      fs.existsSync(path.join(skillsRoot, "arabic-uiux-master/references/design-decisions.md")),
      true,
    );

    for (const archetype of [
      "Clean Light Editorial",
      "Warm Cultural Archive",
      "Modular Bento Clarity",
      "Dark Editorial Cinema",
      "High-Contrast Utility",
    ]) {
      assert.ok(expPatterns.includes(archetype), `experience-patterns.md missing ${archetype}`);
      assert.ok(uiuxSkill.includes(archetype), `arabic-uiux-master/SKILL.md missing ${archetype}`);
      assert.ok(uiuxFlows.includes(archetype), `flow-patterns.md missing ${archetype}`);
    }

    const ignoredPrefixes = ["docs/demos/", "docs/assets/ab/", "docs/research/"];
    for (const match of read("README.md").matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].trim().split(/[?#\s]/, 1)[0];
      if (/^(?:https?:|mailto:)/i.test(target)) {
        continue;
      }
      for (const prefix of ignoredPrefixes) {
        assert.equal(
          target.startsWith(prefix),
          false,
          `README.md relative link "${target}" is excluded from release ZIP archives by .gitattributes`,
        );
      }
    }
  });

  test("sweep catches normalized Arabic slop, comparison-table positive slop, and YAML targets", () => {
    const { scanText, scanFile } = require(path.join(root, "scripts", "sweep.js"));
    for (const sample of [
      "قم بتأكيد الحساب",
      "قُم بتأكيد الطلب",
      "جاري التحقق من الرمز",
      "جاري التسجيل",
      "تم الحفظ بنجاح",
      "تمّ الحفظ بنجاح",
      "تمت العملية بنجاح",
      "حسابك خالي من المخالفات",
      "إضغط هنا للمتابعة",
      "يسعدنا خدمتكم",
      "عزيزي العميل",
    ]) {
      assert.ok(scanText(sample).length > 0, `Expected slop hit for: ${sample}`);
    }
    assert.equal(scanText("الحساب الجاري نشط").length, 0);

    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "arabicskill-sweep-"));
    try {
      const testMd = path.join(fixture, "sample.md");
      fs.writeFileSync(
        testMd,
        [
          "### Before",
          "قم بـتأكيد الطلب",
          "---",
          "- رسالة مباشرة: جاري التحقق الآن.",
          "| ❌ خطأ: قم بالحفظ | ✅ صحيح: تمت العملية بنجاح |",
        ].join("\n"),
      );
      const docHits = scanFile(testMd, fixture, { isSkillDoc: true });
      assert.equal(docHits.length, 2);
      assert.equal(docHits[0].line, 4);
      assert.equal(docHits[1].line, 5);

      const yamlFile = path.join(fixture, "entity.yaml");
      fs.writeFileSync(yamlFile, 'label: "تمت العملية بنجاح"\n');
      const cliResult = spawnSync(
        process.execPath,
        [path.join(root, "scripts", "sweep.js"), "--target", fixture],
        {
          cwd: root,
          encoding: "utf8",
        },
      );
      assert.notEqual(cliResult.status, 0);
      assert.match(cliResult.stderr, /entity\.yaml/);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  test("benchmark structural validators reject malformed ICU plurals and cross-key JSON shifts", () => {
    assert.notEqual(validateArabicPlural("zero{} one{} two{} few{} many{} other{}"), null);
    assert.notEqual(
      validateArabicPlural(
        "{count, plural, zero {لا ملفات} one {ملف} two {ملفان} few {ملفات} many {ملف} other {ملف}}",
      ),
      null,
    );
    assert.equal(
      validateArabicPlural(
        "{count, plural, zero {لا توجد ملفات} one {ملف واحد} two {ملفان} few {# ملفات} many {# ملفًا} other {# ملف}}",
      ),
      null,
    );

    const prompt =
      'ترجم: {"welcome":"Welcome, {name}","total":"Total: {{amount}} SAR","help":"Open <a href=\\"https://example.com/help\\">help</a>"}';
    const shifted = JSON.stringify({
      welcome: "مرحبًا",
      total: "الإجمالي {name} {{amount}} SAR",
      help: 'افتح <a href="https://example.com/help">المساعدة</a>',
    });
    assert.notEqual(validateTranslationVariables(prompt, shifted), null);
  });
});
