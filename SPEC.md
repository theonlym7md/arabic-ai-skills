# ArabicSkill execution contract

Version 2.3.0.

## Agent skill

The Markdown skill guides context gathering, domain selection, drafting, review,
and at most two repair passes (`reasoning/stage_1_context_and_plan.md` through
`stage_3_evaluate_and_repair.md`). These are instructions interpreted by the host
agent, not a deterministic runtime state machine. Supporting files are read only
when relevant and available. A single missing safety-critical fact can require
clarification; a count of missing fields is not a safety gate.

Context objects described in earlier architecture notes are conceptual design
aids. They are not exported TypeScript classes, telemetry, measured confidence,
or implemented cross-language interfaces.

## Included Node.js SDK

`generateArabicCopy(params)` is a one-request copy-generation helper using the
OpenAI Responses API with dual CommonJS (`dist/index.js`) and native ESM
(`dist/esm/index.js`) builds.

- **Required inputs:** `projectNiche`, `targetAudience`, `toneOfVoice`, `textType`, `context`.
- **Optional inputs:** `componentKind` (`"short_label" | "body" | "compound"`), `region`, `dialect`, `maxLength` (integer `1..100` words, default `10`), `apiKey`, `baseURL` (HTTPS required by default; localhost HTTP requires `allowInsecureBaseURL: true`), `organization`, `project`, `model` (defaults to `OPENAI_MODEL` env var or `"gpt-5.4"`), `store` (default `false`), `signal` (`AbortSignal`), `timeoutMs` (default `30000`, range `100..120000`), `maxRetries` (default `1`, range `0..3`), `maxOutputTokens` (`64..4096`), `requireArabicScript` (default `true`), and `client` (injectable OpenAI responses client).

It loads bundled guidance asynchronously (cached in memory) and builds a slim
SDK-focused system prompt from core Arabic writing/safety rules plus matched
sections compiled from the canonical `knowledge/relations/routing.yaml` table
(using `<!-- agent-only:start/end -->` markers rather than brittle prose string
replacement, excluding `references/saudi-sources.md` and `references/design-decisions.md`,
gating `references/dialects.md` on region/dialect signals and `references/localization.md`
on placeholder/plural/HTML/RTL signals, capping matched sections per group, and
falling back to all sector patterns only when no sector keyword matches).

Product context is passed inside `<product_data>...</product_data>` delimiters as
untrusted data. Requests enforce structured JSON output (`1..3` text/style options),
inspect `response.output` directly for refusals before accepting text, validate
against invisible-only text, BiDi overrides, excessive character length, Arabic
script presence, duplicate options, and `maxLength`. For recognized `short_label`
types (normalized across Arabic diacritics/hamza/ta-marbuta and English variants,
excluding `body`/`compound` types), options ending in `.`, `۔`, `…`, or `．`
(including inside quotes, Markdown, or trailing emoji) are filtered out; if none
remain, the request rejects with a typed `ArabicSkillError`.

Words are whitespace-delimited tokens, not character count or rendered width.
Use the agent skill for ICU files or multi-component UI systems; the SDK is
intentionally limited to short independent strings.

Requests enforce a bounded wall-clock timeout via `AbortController`, validate
`baseURL` against SSRF/link-local metadata addresses and embedded credentials,
redact leaked keys from provider errors, and surface typed `ArabicSkillError`
codes (`VALIDATION_ERROR`, `CONFIGURATION_ERROR`, `REFUSAL`, `INCOMPLETE_RESPONSE`,
`TIMEOUT`, `RATE_LIMIT`, `PROVIDER_ERROR`). Product context is sent to the
configured model provider; callers remain responsible for privacy, costs,
secrets, and human review.

## Domain resources

YAML entities (`knowledge/entities/*.yaml`), canonical weights (`knowledge/relations/weights.yaml`),
routing (`knowledge/relations/routing.yaml`), and plugin manifests (`plugins/*/plugin.yaml`)
are declarative writing guidance validated by deterministic checks. Regional
entities and plugins are scoped via `region_scope` and are never legal or
regulatory endorsements.

## Quality claims

Fixture validation is not a model evaluation. Publish model identifiers, complete
sanitized prompts and outputs, a rubric version, date, and independent ratings
before reporting an improvement. Subjective scores are not statistical confidence.
