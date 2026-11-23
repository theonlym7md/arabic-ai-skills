# Model Compatibility Specification

Compatibility is capability-based. This repository does not claim identical quality across model providers unless a reproducible evaluation result is checked in.

## Runtime requirements

- Node.js `>=22.0.0` (verified on Node.js 22 and 24 LTS) for the optional repository SDK, supporting both CommonJS and ESM imports
- UTF-8 Markdown skill instructions
- Relative file reads for progressive-disclosure resources
- YAML parsing (`yaml`) and JSON Schema validation (`ajv`) in development/CI validation scripts
- Structured JSON output support for the optional Node.js SDK

The included Node.js SDK uses the OpenAI Responses API (`gpt-5.4` by default) and strict JSON Schema output. See the [official Responses API reference](https://developers.openai.com/api/reference/typescript/resources/responses/methods/create).
It validates and bounds product-context inputs before making a request, supports `baseURL`, `signal`, and custom client injection, and sets `store: false` by default. Set a dated model snapshot explicitly when output stability across deployments matters.

Other models and runners may use the Markdown skills directly, but should be evaluated with the fixtures in `benchmarks/cases/` before production use.

## Supported Skill CLIs
- `npx skills add theonlym7md/arabic-ai-skills --skill arabicskill`
- `npx skills add theonlym7md/arabic-ai-skills --skill arabic-uiux-master`
