const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { generateArabicCopy } = require("../dist/index.js");

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
  assert.match(request.instructions, /# سلامة التوطين/);
  assert.match(request.instructions, /# اللهجات عند الطلب الصريح/);
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
  assert.match(request.instructions, /Never place a trailing period/);
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
        { text: "a ".repeat(11).trim(), style: "طويل" },
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
  ["non-string copy", { options: [{ text: 12, style: "واضح" }] }, /text and style/],
  ["overlong copy", { options: [{ text: "a ".repeat(11), style: "واضح" }] }, /word limit/],
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
  await assert.rejects(generateArabicCopy(input), /no output text \(refusal: Synthetic refusal\)/);
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
