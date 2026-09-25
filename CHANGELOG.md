# Changelog

All notable changes are documented here. This project follows Semantic Versioning.

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

[1.2.3]: https://github.com/theonlym7md/arabic-ai-skills/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/theonlym7md/arabic-ai-skills/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/theonlym7md/arabic-ai-skills/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/theonlym7md/arabic-ai-skills/tree/v1.2.0
