# Changelog

All notable changes are documented here. This project follows Semantic Versioning.

## [Unreleased]

## [2.3.0] - 2026-11-23

### Security

- Validated `baseURL` and `OPENAI_BASE_URL` in the Node.js SDK against cleartext HTTP, embedded credentials, and link-local/cloud metadata SSRF addresses (requiring explicit `allowInsecureBaseURL: true` for local `http://localhost` testing).
- Hardened `scripts/validate_schema.js` and `scripts/validate_plugin.js` against path-traversal slugs (`../weights`, `_schema`) and added strict key allowlists and calendar-date checks.
- Rejected invisible-only options, BiDi override characters (`\u202A`–`\u202E`, `\u2066`–`\u2069`), C0 control characters, non-Arabic outputs (by default), and leaked API keys in SDK error messages.

### Added

- Added `references/design-decisions.md` in both `arabicskill` and standalone `arabic-uiux-master` to compare page layouts by user intent, content, and mobile constraints, backed by the `2026-11-23` public website review (`docs/research/site-review-2026-11-23.md`).
- Added B2B SaaS, Healthcare, Error Recovery & Resilience, Notifications & Onboarding, and a Voice Spectrum Matrix to `arabicskill`, plus B2B SaaS, Healthcare, Arabic typography (`letter-spacing: 0`, `line-height`, numeral consistency), logical CSS, and WCAG 2.2 component anatomy guidance to `arabic-uiux-master`.
- Populated multi-domain ontology entities (`general_civic`, `fintech_disclosures`, `saas_b2b`, `healthcare_clinical`) alongside region-scoped `saudi_govtech` (`inherits: ["general_civic"]`, `region_scope`).
- Added dual CommonJS + native ESM SDK builds (`dist/index.js` + `dist/esm/index.js`), typed `ArabicSkillError`, `AbortSignal` cancellation, injectable `client`, `baseURL`, `timeoutMs`, `maxRetries`, `maxOutputTokens`, and `componentKind` options.
- Expanded the benchmark suite to 25 synthetic cases (adding `luxury_hospitality`, `healthcare_triage`, `media_podcast_bdi`, and `screen_rtl_table`) with explicit `runner_mode` (`sdk` vs `agent`) and structured `sdk_input` metadata.

### Improved

- Decomposed `src/index.ts` into focused modules (`types`, `normalize`, `markdown`, `routing`, `prompt`, `validate`, `client`) driven from a single compiled `routing.yaml` source of truth (`scripts/build_routing.js`).
- Slimmed SDK system prompts by gating `dialects.md`, `localization.md`, and `sensitive-states.md` on actual input signals, replacing brittle prose `.replace()` sanitization with explicit `<!-- agent-only -->` markers, and preventing cross-domain routing false positives with `exclude_phrases`.
- Consolidated `reasoning/` into three sequential stages (`stage_1`–`stage_3`) and collapsed duplicated `domain_weights/*.yaml` and orphaned `rule_weights.md` into one canonical `weights.yaml` aligned with the evaluation rubric.
- Unified Arabic normalization and short-label trailing-period checks across `scripts/shared_rules.js`, `sweep.js`, `validate_benchmarks.js`, `run_benchmark.js`, and `tests/`.
- Improved CI (`windows-latest` matrix, `package:zip`, `sweep.sh` executable bit and checks, Python syntax check, Dependabot `pip` updates) and prefixed release ZIP extraction (`ArabicSkill-v2.3.0/`).

### Fixed

- Fixed Arabic linguistic and UX terminology errors inside skill references (`مفاتيح المرور`, `توجد رسوم`/`برسوم`, `موظف الدفع`, `مسار التنقل`, `الدقائق والثواني`, WCAG 2.5.3 `aria-label`, gender-neutral examples, plain-text `placeholder`, and dialect accuracy for Egyptian/Saudi/Levantine/Jordanian/Moroccan).
- Fixed SDK `validateResult` normalization on Arabic diacritics/hamza/ta-marbuta, English `CTA copy`/`Headline`/`Login button`, mixed `refusal` + `output_text` handling, multi-message output parsing, proxy responses omitting `object: "response"`, and bounded wall-clock timeout enforcement.
- Fixed `scripts/video/build_demo.py` harakat preservation (`delete_harakat=False`), `ImageFont.Layout.BASIC`, `base_dir="R"`, alpha-composited grid, persistent chrome without cross-fade ghosting, and regenerated demo video/poster/GIF assets.
- Fixed WCAG 1.4.11 contrast, logical CSS, `<bdi dir="ltr" lang="en">`, heading semantics, and Playwright install hints in `docs/demos/`.

## [2.2.0] - 2026-11-14

### Improved

- Added `skills/arabicskill/references/experience-patterns.md` and `skills/arabic-uiux-master/references/flow-patterns.md` synthesizing cross-domain UI/UX, auth gateways (6 variants), payment/checkout/pricing flows (6 variants), intent-routed forms, and visual/editorial styles from the `2026-11-13` multi-page audit alongside the `2026-10-04` initial baseline.
- Enforced no-trailing-period punctuation on main headings, card titles, badges, and CTA buttons across skills, SDK instructions, and automated tests.
- Expanded selective bundling and semantic routing, added optional region and dialect settings, and expanded the benchmark suite to 21 synthetic cases.
- Redesigned the main README, including a repository-hosted cover, quick install, before/after examples, and links to both skills and their references.

### Fixed

- The SDK now filters options ending in a period for recognized heading, badge and button types, without removing punctuation from body copy.
- Corrected RTL form guidance to distinguish numeric verification codes, telephone input and alphanumeric identifiers such as IBAN.

## [2.1.0] - 2026-10-04

### Improved

- Added conditional sector-writing guidance from a dated, scope-limited review of 13 public Saudi product websites; original examples, not copied campaigns or model training.
- Added a self-contained sector screen reference to the UI/UX companion, distinguishing marketing from task states and protecting booking, civic and financial facts.
- Bundled the main sector rules (not the source register) into the optional tool-free SDK and extended its request contract test.
- Expanded synthetic review fixtures from nine to sixteen; fixture validation is not a measured model-quality comparison.
- Tightened media summaries after a limited forward test added an unsupported editorial angle.

### Security

- Updated the development-only transitive `fast-uri` dependency from 3.1.6 to 3.1.8 to address [authority injection](https://github.com/advisories/GHSA-qw65-cvwx-89v3), [host confusion](https://github.com/advisories/GHSA-58mr-gqgx-xq4g), and [host normalization](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj) advisories. No change to the public SDK API.

## [2.0.2] - 2026-09-25

### Improved

- Clarified and shortened both skill descriptions for more precise discovery.
- Linked directly to the indexed skills.sh pages from the repository guide.

## [2.0.1] - 2026-09-25

### Improved

- Added concrete input-to-output examples and concise final checks inside both skill entrypoints.
- Added an opt-in, country-specific dialect guide and bundled it in the optional SDK instructions.
- Documented the human workflow, the earlier E005 scan context, and decisions from the external assessment without claiming unmeasured model gains.

## [2.0.0] - 2026-09-25

### Breaking

- Renamed the primary skill from `arabic-intelligence` to `arabicskill` and moved its folder. The public brand is now ArabicSkill. See [migration instructions](docs/MIGRATION.md).

### Improved

- Added localization rules for placeholders, ICU plural categories, regional neutrality, and bidirectional identifiers.
- Added explicit safety gates for uncertain payments, deletion effects, and permission/privacy claims.
- Expanded synthetic review fixtures from one to nine; these are not measured model-quality results.
- Replaced invented confidence/latency guidance and unimplemented runtime claims with evidence-based review criteria and an accurate SDK contract.
- Added mocked SDK request/response tests, rejecting incomplete or extra-field responses, bundling safety resources, and bounding timeout/retries.
- Removed missing knowledge dependencies, fixed contributor paths, and made repository checks usable from a source archive without Git metadata.
- Updated project onboarding and documented remaining evaluation milestones.

## [1.2.3] - 2026-08-24

### Security

- Treated supplied product copy and interface artifacts as untrusted data in both skills and the optional SDK.
- Added bounded SDK input validation and disabled OpenAI response storage by default.

### Changed

- Replaced the duplicated CI workflow example with durable documentation linked to the canonical workflow.
- Clarified SDK privacy and model-snapshot guidance and tightened unverified marketing language.
- Made distribution ZIP names and contents derive from the same committed revision.

## [1.2.2] - 2026-08-24

### Fixed

- Removed redundant self-install commands from packaged skill documentation so security scanners do not mistake the repository source for an untrusted runtime download.

## [1.2.1] - 2026-08-24

### Fixed

- Moved skill versions into standards-compatible `metadata.version` frontmatter.
- Added the missing MIT license and corrected the local SDK usage instructions.
- Replaced the end-of-life Node.js 20 CI job with Node.js 22 and 24 LTS coverage.
- Hardened SDK input and model-output validation.
- Excluded large marketing videos from the downloadable distribution archive.

### Added

- CodeQL analysis, Dependabot updates, security policy, ownership rules, and issue templates.
- Reproducible local-link, repository-trust, and invalid-input tests.
- Codex UI metadata for both skills.

## [1.2.0] - 2026-08-24

- Published `arabic-intelligence` and `arabic-uiux-master` with deterministic validators.
- Added skills.sh metadata, benchmarks, documentation, and the before/after demo video.

[Unreleased]: https://github.com/theonlym7md/arabic-ai-skills/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/theonlym7md/arabic-ai-skills/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/theonlym7md/arabic-ai-skills/compare/3bb721b...v2.2.0
[2.1.0]: https://github.com/theonlym7md/arabic-ai-skills/compare/v2.0.2...3bb721b
[2.0.2]: https://github.com/theonlym7md/arabic-ai-skills/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/theonlym7md/arabic-ai-skills/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/theonlym7md/arabic-ai-skills/compare/v1.2.3...v2.0.0
[1.2.3]: https://github.com/theonlym7md/arabic-ai-skills/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/theonlym7md/arabic-ai-skills/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/theonlym7md/arabic-ai-skills/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/theonlym7md/arabic-ai-skills/tree/v1.2.0
