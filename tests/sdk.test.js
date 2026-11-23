const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const {
  ArabicSkillError,
  EXPERIENCE_RULES,
  SECTOR_RULES,
  UI_FLOW_RULES,
  classifyTextType,
  generateArabicCopy,
  hasTerminalShortLabelPeriod,
  validateBaseUrl,
} = require("../dist/index.js");

const input = {
  apiKey: "synthetic-test-key",
  model: "test-model",
  projectNiche: "Payments",
  targetAudience: "Arabic readers",
  toneOfVoice: "Clear",
  textType: "Status",
  context: "The payment status is unknown. A status check is available.",
};

function responseBody(value, status = "completed") {
  return {
    id: "resp_test",
    object: "response",
    status,
    output: [
      {
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: JSON.stringify(value), annotations: [] }],
      },
    ],
  };
}

function intercept(t, body, inspect = () => {}) {
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    inspect(JSON.parse(options.body));
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

test("SDK filters terminal periods from the candidate set for titles and buttons", async (t) => {
  const valid = { text: "أدر متجرك", style: "واضح" };
  intercept(t, responseBody({ options: [{ text: "أدر متجرك.\u200F", style: "مباشر" }, valid] }));
  for (const textType of ["Heading", "CTA button", "شارة"]) {
    assert.deepEqual(await generateArabicCopy({ ...input, textType }), { options: [valid] });
  }
});

test("SDK rejects a heading when every option ends in a period", async (t) => {
  intercept(t, responseBody({ options: [{ text: "أدر متجرك.", style: "مباشر" }] }));
  await assert.rejects(
    generateArabicCopy({ ...input, textType: "عنوان رئيسي" }),
    /terminal period/i,
  );
});

test("SDK preserves sentence punctuation outside short UI labels", async (t) => {
  const expected = { options: [{ text: "تحقّق من الحالة أولًا.", style: "واضح" }] };
  intercept(t, responseBody(expected));
  assert.deepEqual(await generateArabicCopy({ ...input, textType: "Body description" }), expected);
});

test("SDK rejects extra properties instead of silently dropping them", async (t) => {
  intercept(
    t,
    responseBody({ options: [{ text: "راجع الطلب", style: "واضح", claim: "unverified" }] }),
  );
  await assert.rejects(generateArabicCopy(input), /unexpected properties/i);
});

test("SDK rejects incomplete responses even if their partial JSON is valid", async (t) => {
  intercept(
    t,
    responseBody({ options: [{ text: "تحقّق من الحالة", style: "واضح" }] }, "incomplete"),
  );
  await assert.rejects(generateArabicCopy(input), /incomplete/i);
});

test("SDK selectively includes matching sector rules and safety guidance", async (t) => {
  const expected = { options: [{ text: "تحقّق من الحالة", style: "واضح" }] };
  let request;
  intercept(t, responseBody(expected), (body) => {
    request = body;
  });
  assert.deepEqual(await generateArabicCopy(input), expected);
  assert.match(request.instructions, /# حالات تحتاج حقائق المنتج/);
  assert.doesNotMatch(request.instructions, /# سلامة التوطين/);
  assert.doesNotMatch(request.instructions, /# اللهجات عند الطلب الصريح/);
  assert.ok(
    request.instructions.includes("## اختيار النمط وحدوده"),
    "SDK must include shared sector selection bounds",
  );
  assert.ok(
    request.instructions.includes("## 6. التقسيط والتمويل والاستثمار"),
    "SDK must include the matched FinTech/Payments sector section",
  );
  assert.ok(
    !request.instructions.includes("## 2. الألعاب والتجارب الاجتماعية"),
    "SDK must omit unrelated sector sections when a sector matches",
  );
  assert.ok(
    !request.instructions.includes("## 1. واجهات الذكاء الاصطناعي والمحادثة"),
    "SDK must omit unmatched UI flow sections",
  );
  assert.ok(
    request.instructions.includes("## 1. العناوين، التنوع البصري، ومنع التكرار"),
    "SDK must include core heading punctuation and variety guidance",
  );
  assert.ok(
    request.instructions.includes("## 3. أنماط الدفع، السلة، التقسيط، والتسعير"),
    "SDK must include matched checkout and payment experience patterns",
  );
  assert.ok(
    !request.instructions.includes("## 2. أنماط تسجيل الدخول والمصادقة"),
    "SDK must omit unmatched auth experience patterns",
  );
  assert.match(request.instructions, /Omit terminal periods/);
  const referenceDir = path.join(__dirname, "../skills/arabicskill/references");
  const sourceRegister = fs.readFileSync(path.join(referenceDir, "saudi-sources.md"), "utf8");
  assert.ok(
    !request.instructions.includes(sourceRegister),
    "SDK must not bundle the source register",
  );
  assert.match(request.instructions, /SDK mode/);
  assert.equal(request.model, "test-model");
  assert.equal(request.store, false);
  assert.equal(request.text.format.strict, true);
  assert.ok(request.input.includes(JSON.stringify(input.context)));
});

test("SDK falls back to all sectors when unmatched, selects UI flows, and passes region/dialect", async (t) => {
  const expected = { options: [{ text: "نجهّز الملخص الآن", style: "مباشر" }] };
  let request;
  intercept(t, responseBody(expected), (body) => {
    request = body;
  });
  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    textType: "AI Assistant Status",
    context: "The AI assistant is summarizing uploaded notes.",
    region: "Saudi Arabia",
    dialect: "Modern Standard Arabic",
  });
  assert.ok(request.instructions.includes("## 2. الألعاب والتجارب الاجتماعية"));
  assert.ok(request.instructions.includes("## 1. واجهات الذكاء الاصطناعي والمحادثة"));
  assert.match(request.instructions, /# اللهجات عند الطلب الصريح/);
  assert.ok(request.input.includes('"region":"Saudi Arabia"'));
  assert.ok(request.input.includes('"dialect":"Modern Standard Arabic"'));
});

test("SDK selectively includes auth gateway variants only for auth contexts", async (t) => {
  const expected = { options: [{ text: "أرسل رمز التحقق", style: "مباشر" }] };
  let request;
  intercept(t, responseBody(expected), (body) => {
    request = body;
  });
  await generateArabicCopy({
    ...input,
    projectNiche: "Events",
    textType: "Login Screen",
    context: "Flexible phone OTP login modal with guest browsing and Nafath SSO.",
  });
  assert.ok(request.instructions.includes("## 1. العناوين، التنوع البصري، ومنع التكرار"));
  assert.ok(request.instructions.includes("## 2. أنماط تسجيل الدخول والمصادقة"));
  assert.ok(!request.instructions.includes("## 3. أنماط الدفع، السلة، التقسيط، والتسعير"));
});

test("SDK honors active fetch mocks across requests with the same settings", async (t) => {
  const first = { options: [{ text: "تحقّق من الطلب", style: "واضح" }] };
  const second = { options: [{ text: "راجع الحالة", style: "مختصر" }] };
  let activeResponse = first;

  t.mock.method(globalThis, "fetch", async () => {
    return new Response(JSON.stringify(responseBody(activeResponse)), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  assert.deepEqual(await generateArabicCopy(input), first);
  activeResponse = second;
  assert.deepEqual(await generateArabicCopy(input), second);
});

test("SDK uses the current OpenAI connection settings when the API key stays the same", async (t) => {
  const settings = {
    OPENAI_BASE_URL: "https://first.example.test/v1",
    OPENAI_ORG_ID: "org-first",
    OPENAI_PROJECT_ID: "project-first",
  };
  for (const [name, value] of Object.entries(settings)) {
    const previous = process.env[name];
    t.after(() => {
      if (previous === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = previous;
      }
    });
    process.env[name] = value;
  }

  const requests = [];
  const body = responseBody({ options: [{ text: "راجع الطلب", style: "واضح" }] });
  t.mock.method(globalThis, "fetch", async (url, { headers }) => {
    const requestHeaders = new Headers(headers);
    requests.push([
      String(url),
      requestHeaders.get("OpenAI-Organization"),
      requestHeaders.get("OpenAI-Project"),
      requestHeaders.get("Authorization"),
    ]);
    return Response.json(body);
  });

  const apiKey = "synthetic-connection-settings-key";
  await generateArabicCopy({ ...input, apiKey });
  process.env.OPENAI_BASE_URL = " https://second.example.test/v1 ";
  await generateArabicCopy({ ...input, apiKey });
  process.env.OPENAI_ORG_ID = " org-second ";
  await generateArabicCopy({ ...input, apiKey });
  process.env.OPENAI_PROJECT_ID = " project-second ";
  await generateArabicCopy({ ...input, apiKey });
  delete process.env.OPENAI_BASE_URL;
  delete process.env.OPENAI_ORG_ID;
  delete process.env.OPENAI_PROJECT_ID;
  await generateArabicCopy({ ...input, apiKey });

  const authorization = `Bearer ${apiKey}`;
  assert.deepEqual(requests, [
    ["https://first.example.test/v1/responses", "org-first", "project-first", authorization],
    ["https://second.example.test/v1/responses", "org-first", "project-first", authorization],
    ["https://second.example.test/v1/responses", "org-second", "project-first", authorization],
    ["https://second.example.test/v1/responses", "org-second", "project-second", authorization],
    ["https://api.openai.com/v1/responses", null, null, authorization],
  ]);
});

test("SDK falls back to gpt-5.4 when OPENAI_MODEL is empty or whitespace", async (t) => {
  const previous = process.env.OPENAI_MODEL;
  process.env.OPENAI_MODEL = "   ";
  t.after(() => {
    if (previous === undefined) {
      delete process.env.OPENAI_MODEL;
    } else {
      process.env.OPENAI_MODEL = previous;
    }
  });

  let request;
  intercept(t, responseBody({ options: [{ text: "راجع الطلب", style: "واضح" }] }), (body) => {
    request = body;
  });

  const { model: _omitted, ...withoutModel } = input;
  await generateArabicCopy(withoutModel);
  assert.equal(request.model, "gpt-5.4");
});

test("SDK filters individual overlong options when at least one option fits maxLength", async (t) => {
  intercept(
    t,
    responseBody({
      options: [
        { text: "أعد المحاولة", style: "مباشر" },
        { text: "كلمة ".repeat(11).trim(), style: "طويل" },
      ],
    }),
  );

  const result = await generateArabicCopy({ ...input, maxLength: 5 });
  assert.deepEqual(result, {
    options: [{ text: "أعد المحاولة", style: "مباشر" }],
  });
});

test("SDK makes at most one retry on a transient server failure", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls += 1;
    return new Response(JSON.stringify({ error: { message: "Synthetic failure" } }), {
      status: 503,
      headers: { "content-type": "application/json", "retry-after-ms": "1" },
    });
  });
  await assert.rejects(generateArabicCopy(input), /Failed to generate Arabic copy/);
  assert.equal(calls, 2);
});

for (const [label, value, message] of [
  ["empty options", { options: [] }, /between one and three/],
  [
    "too many options",
    { options: Array(4).fill({ text: "راجع", style: "واضح" }) },
    /between one and three/,
  ],
  ["empty copy", { options: [{ text: " ", style: "واضح" }] }, /must not be empty/],
  ["invisible-only copy", { options: [{ text: "\u200F", style: "\u200B" }] }, /must not be empty/],
  ["BiDi override copy", { options: [{ text: "\u202Eتأكيد الدفع", style: "واضح" }] }, /BiDi/],
  ["non-Arabic copy", { options: [{ text: "Click here", style: "Direct" }] }, /Arabic script/],
  [
    "single giant token",
    { options: [{ text: "أ".repeat(500), style: "واضح" }] },
    /maximum character ceiling/,
  ],
  ["non-string copy", { options: [{ text: 12, style: "واضح" }] }, /text and style/],
  [
    "overlong copy",
    { options: [{ text: "كلمة ".repeat(11).trim(), style: "واضح" }] },
    /word limit/,
  ],
  [
    "unknown root key",
    { options: [{ text: "راجع", style: "واضح" }], extra: true },
    /unexpected properties/,
  ],
]) {
  test(`SDK rejects ${label}`, async (t) => {
    intercept(t, responseBody(value));
    await assert.rejects(generateArabicCopy(input), message);
  });
}

test("SDK rejects a refusal with no output text and surfaces the refusal reason", async (t) => {
  intercept(t, {
    status: "completed",
    output: [
      {
        type: "message",
        role: "assistant",
        content: [{ type: "refusal", refusal: "Synthetic refusal" }],
      },
    ],
  });
  await assert.rejects(
    generateArabicCopy(input),
    (error) =>
      error instanceof ArabicSkillError &&
      error.code === "REFUSAL" &&
      /Synthetic refusal/.test(error.message),
  );
});

test("SDK rejects malformed JSON", async (t) => {
  const body = responseBody({});
  body.output[0].content[0].text = "not JSON";
  intercept(t, body);
  await assert.rejects(generateArabicCopy(input), /Failed to generate Arabic copy/);
});

test("SDK configures a 30-second request timeout", async (t) => {
  const timeouts = [];
  const originalSetTimeout = globalThis.setTimeout;
  t.mock.method(globalThis, "setTimeout", (callback, delay, ...args) => {
    timeouts.push(delay);
    return originalSetTimeout(callback, delay, ...args);
  });
  intercept(t, responseBody({ options: [{ text: "راجع الطلب", style: "واضح" }] }));
  await generateArabicCopy(input);
  assert.ok(timeouts.includes(30_000), `Unexpected timeouts: ${timeouts}`);
});

test("SDK routes sector guidance based on targetAudience", async (t) => {
  let lastPayload = null;
  intercept(
    t,
    responseBody({ options: [{ text: "افتح متجرك الآن", style: "مباشر" }] }),
    (payload) => {
      lastPayload = payload;
    },
  );

  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "تاجر",
    context: "صفحة ترحيب",
  });
  assert.match(lastPayload.instructions, /4\. منصات التجار والتجارة الإلكترونية/);

  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "Gamers",
    context: "بداية سريعة",
  });
  assert.match(lastPayload.instructions, /2\. الألعاب والتجارب الاجتماعية/);
});

test("SDK Arabic boundary matching prevents substring false positives", async (t) => {
  const seen = [];
  intercept(
    t,
    responseBody({ options: [{ text: "متابعة العملية", style: "واضح" }] }),
    (payload) => {
      seen.push(payload.instructions);
    },
  );

  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "Users",
    context: "مرحلة الدفع",
  });
  assert.doesNotMatch(seen.at(-1), /5\. السفر والسياحة والثقافة والضيافة/);

  await generateArabicCopy({
    ...input,
    projectNiche: "Media",
    targetAudience: "Listeners",
    context: "مراسلة الدعم",
  });
  assert.doesNotMatch(seen.at(-1), /4\. منصات التجار والتجارة الإلكترونية/);

  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "Users",
    context: "وصول الرمز عبر موقع إلكتروني",
  });
  assert.doesNotMatch(seen.at(-1), /4\. إتاحة الاستخدام في النصوص/);
  assert.doesNotMatch(seen.at(-1), /4\. أنماط الاكتشاف، الحجز، وبناء النماذج/);
});

test("SDK rejects extended shortLabel variants and periods inside guillemets", async (t) => {
  const valid = { text: "ابدأ التجربة", style: "واضح" };
  intercept(t, responseBody({ options: [{ text: "«أدر متجرك.»", style: "مباشر" }, valid] }));
  for (const textType of [
    "Hero H1",
    "Subheading",
    "Tag",
    "Primary button",
    "العنوان الرئيسي",
    "وسم",
  ]) {
    assert.deepEqual(await generateArabicCopy({ ...input, textType }), { options: [valid] });
  }
});

test("SDK rejects missing API key before calling fetch when env key is unset", async (t) => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("fetch should not be called without an API key");
  });

  try {
    const { apiKey: _omitted, ...inputWithoutKey } = input;
    await assert.rejects(
      generateArabicCopy(inputWithoutKey),
      /apiKey must be provided or set via the OPENAI_API_KEY environment variable/i,
    );
    assert.equal(fetchMock.mock.callCount(), 0);
  } finally {
    if (previousKey !== undefined) {
      process.env.OPENAI_API_KEY = previousKey;
    }
  }
});

test("SDK normalizes Arabic hamza variants and second-word al- prefixes in rule matching", async (t) => {
  let request;
  intercept(
    t,
    responseBody({ options: [{ text: "نراجع الإجابة الآن", style: "واضح" }] }),
    (body) => {
      request = body;
    },
  );

  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "Arabic users",
    textType: "Status banner",
    context: "واجهة تعتمد على الذكاء الاصطناعي ومشغل الصوت",
  });

  assert.match(request.instructions, /1\. واجهات الذكاء الاصطناعي والمحادثة/);
  assert.match(request.instructions, /5\. أنماط الإعلام والمحتوى العميق وإتاحة الوصول/);
});

test("SDK routes product card queries to E-Commerce instead of FinTech and avoids English false positives", async (t) => {
  const seen = [];
  intercept(t, responseBody({ options: [{ text: "اعرض التفاصيل", style: "مباشر" }] }), (body) => {
    seen.push(body.instructions);
  });

  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "Buyers",
    textType: "Card label",
    context: "بطاقة منتج لإضافة عنصر إلى السلة",
  });
  assert.match(seen.at(-1), /4\. منصات التجار والتجارة الإلكترونية/);
  assert.doesNotMatch(seen.at(-1), /6\. التقسيط والتمويل والاستثمار/);

  await generateArabicCopy({
    ...input,
    projectNiche: "Government",
    targetAudience: "Residents",
    textType: "Login",
    context: "Sign in via social login in order to continue",
  });
  assert.match(seen.at(-1), /3\. الخدمات الحكومية والمدنية/);
  assert.match(seen.at(-1), /2\. المصادقة والأمان ورموز التحقق/);
  assert.doesNotMatch(seen.at(-1), /4\. منصات التجار والتجارة الإلكترونية/);
  assert.doesNotMatch(seen.at(-1), /2\. الألعاب والتجارب الاجتماعية/);
});

test("SDK enforces no-period discipline across extended short labels and Markdown/ellipsis formatting while preserving compound body types", async (t) => {
  const valid = { text: "أدر متجرك", style: "مباشر" };
  intercept(
    t,
    responseBody({
      options: [
        { text: "**أدر متجرك.**", style: "خطأ 1" },
        { text: "`أدر متجرك.`", style: "خطأ 2" },
        valid,
      ],
    }),
  );

  for (const textType of [
    "Status badge",
    "Input label",
    "Field label",
    "Tab",
    "Button text",
    "Call-to-Action",
    "Error title",
    "تسمية حقل",
    "عنوان حقل",
    "نص الزر",
    "تبويبات",
    "عناصر التنقل",
    "رابط إجراء",
  ]) {
    assert.deepEqual(await generateArabicCopy({ ...input, textType }), { options: [valid] });
  }

  intercept(
    t,
    responseBody({
      options: [{ text: "أدر متجرك…", style: "خطأ 3" }, valid],
    }),
  );
  assert.deepEqual(await generateArabicCopy({ ...input, textType: "Heading" }), {
    options: [valid],
  });

  const compound = {
    options: [{ text: "أدر متجرك\nتحكّم بكل الطلبات من مكان واحد.", style: "واضح" }],
  };
  intercept(t, responseBody(compound));
  assert.deepEqual(
    await generateArabicCopy({ ...input, textType: "عنوان ووصف", maxLength: 20 }),
    compound,
  );
  assert.deepEqual(
    await generateArabicCopy({ ...input, textType: "Card title and description", maxLength: 20 }),
    compound,
  );
});

test("SDK sanitizes agent-only blocks from system prompt, keeps rule arrays frozen, and aligns headings", async (t) => {
  let request;
  intercept(t, responseBody({ options: [{ text: "استكشف الخطة", style: "هادئ" }] }), (body) => {
    request = body;
  });

  await generateArabicCopy({
    ...input,
    projectNiche: "Travel",
    context: "صفحة رحلة وتقسيط",
  });

  assert.doesNotMatch(request.instructions, /اختيار الشخصية البصرية والمعمارية/);
  assert.doesNotMatch(request.instructions, /ملاحظة للمحرّر/);
  assert.doesNotMatch(request.instructions, /agent-only:/);
  assert.doesNotMatch(request.instructions, /reasoning\/stage_/);
  // Minimal prompt without dialect or localization triggers omits dialects.md and localization.md
  assert.doesNotMatch(request.instructions, /اللهجات عند الطلب الصريح/);
  assert.doesNotMatch(request.instructions, /ملفات الترجمة/);

  assert.equal(Object.isFrozen(SECTOR_RULES), true);
  assert.equal(Object.isFrozen(UI_FLOW_RULES), true);
  assert.equal(Object.isFrozen(EXPERIENCE_RULES), true);

  const referenceDir = path.join(__dirname, "../skills/arabicskill/references");
  const getHeadings = (file) =>
    fs
      .readFileSync(path.join(referenceDir, file), "utf8")
      .split(/\r?\n/u)
      .filter((line) => line.startsWith("## "))
      .map((line) => line.slice(3).trim());

  const checks = [
    ["sector-patterns.md", SECTOR_RULES],
    ["ui-flows.md", UI_FLOW_RULES],
    ["experience-patterns.md", EXPERIENCE_RULES],
  ];
  for (const [file, rules] of checks) {
    const headings = getHeadings(file);
    for (const rule of rules) {
      assert.ok(
        headings.some((heading) => heading.startsWith(rule.headingPrefix)),
        `${file} is missing heading prefix "${rule.headingPrefix}"`,
      );
    }
  }
});

test("SDK blocks SSRF/insecure baseURLs and supports explicit baseURL and injectable client", async (t) => {
  assert.throws(
    () => validateBaseUrl("http://169.254.169.254/latest/meta-data"),
    (error) => error instanceof ArabicSkillError && error.code === "CONFIGURATION_ERROR",
  );
  assert.throws(() => validateBaseUrl("http://api.example.com/v1"), /https:\/\//);
  assert.throws(() => validateBaseUrl("https://user:pass@api.example.com/v1"), /credentials/);
  assert.equal(validateBaseUrl("http://127.0.0.1:8080/v1", true), "http://127.0.0.1:8080/v1");

  const previousBase = process.env.OPENAI_BASE_URL;
  process.env.OPENAI_BASE_URL = "http://169.254.169.254/latest/meta-data";
  t.after(() => {
    if (previousBase === undefined) delete process.env.OPENAI_BASE_URL;
    else process.env.OPENAI_BASE_URL = previousBase;
  });
  await assert.rejects(generateArabicCopy(input), /link-local or cloud metadata/);
  delete process.env.OPENAI_BASE_URL;

  const injectedCalls = [];
  const fakeClient = {
    responses: {
      create: async (payload) => {
        injectedCalls.push(payload);
        return responseBody({
          options: [
            { text: "أكمل الطلب", style: "مباشر" },
            { text: "أكمل الطلب", style: "مكرر" },
          ],
        });
      },
    },
  };
  const { apiKey: _unused, ...noKeyInput } = input;
  const result = await generateArabicCopy({
    ...noKeyInput,
    client: fakeClient,
    maxOutputTokens: 256,
  });
  // Deduplicates identical option texts cleanly
  assert.deepEqual(result, { options: [{ text: "أكمل الطلب", style: "مباشر" }] });
  assert.equal(injectedCalls[0].max_output_tokens, 256);
});

test("SDK classifies normalized Arabic/English short labels vs compound body types accurately", () => {
  for (const shortType of [
    "عُنوان رئيسي",
    "ازرار",
    "دعوة الى الاجراء",
    "CTA copy",
    "Button copy",
    "Login button",
    "Headline",
    "Toast title",
    "Call-to-action button",
    "Heading (H1)",
  ]) {
    assert.equal(classifyTextType(shortType), "short_label", shortType);
  }

  for (const compoundOrBody of [
    "عنوان وافصاح",
    "عنوان ورساله",
    "عنوان وملاحظة",
    "عنوان ونص تعريفي",
    "بطاقة خطأ دفع",
    "عنوان ووصف",
    "Card title and description",
  ]) {
    assert.notEqual(classifyTextType(compoundOrBody), "short_label", compoundOrBody);
  }

  for (const badShort of [
    "»أدر متجرك.«",
    "أدر متجرك. ✨",
    "أدر متجرك．",
    "أدر متجرك.\nابدأ الآن",
  ]) {
    assert.equal(hasTerminalShortLabelPeriod(badShort), true, badShort);
  }
  assert.equal(hasTerminalShortLabelPeriod("أدر متجرك"), false);
});

test("SDK handles mixed refusal+output_text, multi-message output, proxy responses without object field, and secret redaction", async (t) => {
  // Refusal paired with output_text must STILL reject as REFUSAL
  intercept(t, {
    status: "completed",
    output: [
      {
        type: "message",
        role: "assistant",
        content: [
          { type: "refusal", refusal: "Policy refusal" },
          {
            type: "output_text",
            text: JSON.stringify({ options: [{ text: "تأكيد", style: "مباشر" }] }),
          },
        ],
      },
    ],
  });
  await assert.rejects(
    generateArabicCopy(input),
    (err) => err instanceof ArabicSkillError && err.code === "REFUSAL",
  );

  // Proxy omitting object: "response" and returning two output_text parts succeeds cleanly
  intercept(t, {
    id: "resp_proxy",
    status: "completed",
    output: [
      {
        type: "message",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: JSON.stringify({ options: [{ text: "تحقّق من الحالة", style: "واضح" }] }),
          },
          {
            type: "output_text",
            text: JSON.stringify({ options: [{ text: "راجع حالة الدفع", style: "مباشر" }] }),
          },
        ],
      },
    ],
  });
  const proxyResult = await generateArabicCopy(input);
  assert.deepEqual(proxyResult, { options: [{ text: "راجع حالة الدفع", style: "مباشر" }] });

  // Non-completed response preserves incomplete_details.reason
  intercept(t, {
    id: "resp_inc",
    object: "response",
    status: "incomplete",
    incomplete_details: { reason: "max_output_tokens" },
    output: [],
  });
  await assert.rejects(
    generateArabicCopy(input),
    (err) =>
      err instanceof ArabicSkillError &&
      err.code === "INCOMPLETE_RESPONSE" &&
      /max_output_tokens/.test(err.message),
  );

  // API key leaked in upstream 401 message is redacted
  t.mock.method(globalThis, "fetch", async () => {
    return new Response(
      JSON.stringify({
        error: { message: "Incorrect API key provided: sk-proj-secret1234567890" },
      }),
      { status: 401, headers: { "content-type": "application/json" } },
    );
  });
  await assert.rejects(
    generateArabicCopy(input),
    (err) =>
      err instanceof ArabicSkillError &&
      err.status === 401 &&
      !err.message.includes("sk-proj-secret") &&
      err.message.includes("[REDACTED_KEY]"),
  );
});

test("SDK enforces AbortSignal cancellation and prevents cross-domain routing false positives", async (t) => {
  const controller = new AbortController();
  controller.abort(new Error("user cancelled"));
  await assert.rejects(
    generateArabicCopy({ ...input, signal: controller.signal }),
    (err) => err instanceof ArabicSkillError && err.code === "TIMEOUT",
  );

  const seen = [];
  intercept(t, responseBody({ options: [{ text: "راجع التفاصيل", style: "واضح" }] }), (body) => {
    seen.push(body.instructions);
  });

  // Excluded phrases prevent false positives while Arabic suffixes route cleanly
  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "Users",
    textType: "Notice",
    context: "عرض الرسوم البيانية على مدى 3 سنوات لتوفير الوقت في أعراض التهاب الحلق",
  });
  assert.doesNotMatch(seen.at(-1), /6\. التقسيط والتمويل والاستثمار/);
  assert.doesNotMatch(seen.at(-1), /1\. الإعلام والمحتوى/);
  assert.doesNotMatch(seen.at(-1), /3\. أنماط الدفع، السلة، التقسيط، والتسعير/);

  await generateArabicCopy({
    ...input,
    projectNiche: "General",
    targetAudience: "Shoppers",
    textType: "CTA",
    context: "أدر متجرك واعرض الطلبات المتأخرة",
  });
  assert.match(seen.at(-1), /4\. منصات التجار والتجارة الإلكترونية/);
});

test("SDK works natively via ESM import()", async () => {
  const esm = await import("arabicskill");
  assert.equal(typeof esm.generateArabicCopy, "function");
  assert.equal(typeof esm.ArabicSkillError, "function");
  assert.equal(esm.classifyTextType("CTA copy"), "short_label");
});
