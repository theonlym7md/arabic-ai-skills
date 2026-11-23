# ArabicSkill roadmap

## Delivered in 2.0

- Canonical ArabicSkill identity and `arabicskill` skill identifier.
- Localization safeguards for placeholders, plural forms, and mixed-direction content.
- Explicit handling of uncertain payment, deletion and permission states.
- Expanded synthetic review cases and mocked SDK contract tests.
- Documentation separating agent guidance, the SDK, and unmeasured quality claims.

## Delivered in 2.1–2.2

- Conditional sector patterns across 7 domains (including Luxury hospitality) and cross-domain UI/UX experience & flow patterns synthesized from the 2026-11-13 multi-page audit (`71` live portals audited out of `81` unique candidate domains from `115` raw URLs: `69` Arabic-surface + `2` English-only agency references).
- Strict punctuation discipline banning trailing periods on main headings, card titles, buttons, badges, tags, and table labels while preserving periods for body copy.
- Expanded Node.js SDK selective routing (`targetAudience`, `region`, `dialect`), word-boundary guards, and short-label terminal-period filtering.
- Upgraded `arabic-uiux-master` companion skill with 5 architectural archetypes, 6 auth gateways, 6 payment/pricing flows, AI streaming/uncertainty states, and a 3-column RTL screen review table example.
- Expanded synthetic benchmark suite to 21 review cases at tag `v2.2.0`.

## Delivered in 2.3

- Modular TypeScript SDK with dual CJS + native ESM outputs, SSRF-validated `baseURL`, `AbortSignal` wall-clock timeout enforcement, typed `ArabicSkillError`, injectable `client`, and single-source compiled routing from `routing.yaml`.
- Page design decision reference in both skills (`design-decisions.md`), backed by the `2026-11-23` public website review, plus B2B SaaS, Healthcare, Error Recovery, Notifications/Onboarding, Voice Spectrum Matrix, and comprehensive Arabic typography & WCAG 2.2 guidance.
- Multi-domain knowledge entities with `region_scope` isolation, single canonical `weights.yaml`, sequential 3-stage `reasoning/`, and 25 synthetic benchmark cases with explicit `sdk` / `agent` runner classification.
- Hardened validators (`sweep.js`, `validate_schema.js`, `validate_plugin.js`, `validate_benchmarks.js`), cross-platform CI (`ubuntu-latest` + `windows-latest`), and fixed RTL/harakat demo video and accessible A/B demo harness.

## Next evidence milestones

- Run blinded with/without-skill comparisons on several model snapshots.
- Have native Arabic UX writers independently rate held-out examples.
- Publish disagreement, failures, latency and cost alongside quality results.
- Add Egyptian, Maghrebi, Levantine and Gulf fixtures with local reviewers.
- Test RTL guidance in real interfaces with keyboard and screen-reader users.

These milestones are planned, not completed. Directory indexing, adoption and
ranking are external outcomes, not guaranteed by this roadmap.
