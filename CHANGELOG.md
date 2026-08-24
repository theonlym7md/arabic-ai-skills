# Changelog

All notable changes are documented here. This project follows Semantic Versioning.

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
