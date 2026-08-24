# Model Compatibility Specification

Compatibility is capability-based. This repository does not claim identical quality across model providers unless a reproducible evaluation result is checked in.

## Runtime requirements

- Node.js 22 or 24 LTS for the optional repository SDK
- UTF-8 Markdown skill instructions
- Relative file reads for progressive-disclosure resources
- YAML parsing when ontology or plugin files are loaded programmatically
- Structured JSON output support for the optional Node.js SDK

The included Node.js SDK uses the OpenAI Responses API and strict JSON Schema output. See the [official Responses API reference](https://developers.openai.com/api/reference/typescript/resources/responses/methods/create).

Other models and runners may use the Markdown skills directly, but should be evaluated with the fixtures in `skills/arabic-intelligence/benchmarks/cases/` before production use.

## Supported Skill CLIs
- `npx skills add theonlym7md/arabic-ai-skills --skill arabic-uiux-master`
- `npx skills add theonlym7md/arabic-ai-skills --skill arabic-intelligence`
