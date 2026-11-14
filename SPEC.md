# ArabicSkill execution contract

Version 2.2.0.

## Agent skill

The Markdown skill guides context gathering, domain selection, drafting, review,
and at most two repair passes. These are instructions interpreted by the host
agent, not a deterministic runtime state machine. Supporting files are read only
when relevant and available. A single missing safety-critical fact can require
clarification; a count of missing fields is not a safety gate.

Context objects described in earlier architecture notes are conceptual design
aids. They are not exported TypeScript classes, telemetry, measured confidence,
or implemented cross-language interfaces.

## Included Node.js SDK

`generateArabicCopy(params)` is a one-request copy-generation helper using the
OpenAI Responses API. Required inputs: projectNiche, targetAudience, toneOfVoice,
textType, context. Optional inputs: apiKey, model, store, maxLength (1–100 words),
region, dialect.

It caches bundled guidance in memory and builds an SDK-focused system prompt
from core Arabic writing/safety rules plus bundled localization, sensitive-state,
UI-flow, dialect, and matched sector-pattern and experience-pattern rules (always
retaining core heading-punctuation and anti-repetition rules, falling back to all
sector patterns when no sector keyword matches, and excluding the website source
register). It requests 1–3 structured text/style options and validates the
returned shape and length, filtering out individual overlong options if at least
one option satisfies `maxLength`. For recognized heading, badge and button
`textType` labels, it drops options with a trailing ASCII period; if none remain,
the request rejects. Body copy retains its punctuation.

It has no file-reading tools, interactive clarification, plugin dispatch,
18-metric scoring, automatic repair, or guaranteed factuality.
If material facts are missing, its instructions require conservative copy that
acknowledges uncertainty; the calling application must decide whether to display it.

Words are whitespace-delimited tokens, not character count or rendered width.
Use the agent skill for ICU files or multi-component UI systems; the SDK is
intentionally limited to short independent strings.

Requests default to `store: false`, a 30-second timeout per attempt, and one retry.
Each SDK call resolves the current OpenAI connection settings, including the
API endpoint, organization, and project. Provider/network errors, refusals, incomplete
responses, malformed data, and requests where no option meets `maxLength` reject
the promise. Input errors are rejected before a request.
Product context is sent to the configured model provider; callers remain
responsible for privacy, costs, secrets, and human review.

## Domain resources

YAML entities and plugin manifests are declarative writing guidance. Current
validators check their structure and references; no executable plugin loader
is provided. Regional examples are not legal or regulatory sources.

## Quality claims

Fixture validation is not a model evaluation. Publish model identifiers, complete
sanitized prompts and outputs, a rubric version, date, and independent ratings
before reporting an improvement. Subjective scores are not statistical confidence.
