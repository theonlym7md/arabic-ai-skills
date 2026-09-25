# Contributing to ArabicSkill

We welcome contributions from Arabic linguists, UX writers, product designers, and AI engineers!

## How to Contribute
1. **Add Ontology Entities:** Submit pull requests to `skills/arabicskill/knowledge/entities/` following `_schema.yaml`.
2. **Develop Plugins:** Create declarative domain packs in `skills/arabicskill/plugins/`.
3. **Submit Benchmarks:** Add synthetic cases in `skills/arabicskill/benchmarks/cases/`; include review criteria, not invented model scores.

## Submitting a PR
- Create a focused branch and explain the user-facing outcome.
- Add or update a synthetic benchmark fixture when changing Arabic output behavior.
- Never commit API keys, customer copy, personal data, or regulated content.
- Run `npm ci` and `npm run check` before opening the PR.
- Update `CHANGELOG.md` for user-visible changes.

## Adding or updating a skill

- Keep skills under `skills/<skill-name>/` with a `SKILL.md` and `README.md`.
- Use standards-compatible YAML frontmatter with `name`, `description`, and optional `metadata`.
- Keep detailed domain material in focused supporting files and link it from `SKILL.md`.
- Add the skill to the root README table and deterministic repository tests.

## Security reports

Do not open public issues for vulnerabilities. Follow [SECURITY.md](SECURITY.md).
