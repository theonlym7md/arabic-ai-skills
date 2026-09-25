const assert = require("node:assert/strict");
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

test("SDK includes supporting safety rules in a tool-free request", async (t) => {
  const expected = { options: [{ text: "تحقّق من الحالة", style: "واضح" }] };
  let request;
  intercept(t, responseBody(expected), (body) => {
    request = body;
  });
  assert.deepEqual(await generateArabicCopy(input), expected);
  assert.match(request.instructions, /# حالات تحتاج حقائق المنتج/);
  assert.match(request.instructions, /# سلامة التوطين/);
  assert.match(request.instructions, /# اللهجات عند الطلب الصريح/);
  assert.match(request.instructions, /SDK mode/);
  assert.equal(request.model, "test-model");
  assert.equal(request.store, false);
  assert.equal(request.text.format.strict, true);
  assert.ok(request.input.includes(JSON.stringify(input.context)));
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

test("SDK rejects a refusal with no output text", async (t) => {
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
  await assert.rejects(generateArabicCopy(input), /no output text/);
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
