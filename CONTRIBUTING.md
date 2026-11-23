# Contributing to ArabicSkill

We welcome contributions from Arabic linguists, UX writers, product designers, and AI engineers.

## How to Contribute
1. **Add Ontology Entities:** Submit pull requests to `skills/arabicskill/knowledge/entities/` following `_schema.yaml`, and register routing entries in `skills/arabicskill/knowledge/relations/routing.yaml` (then run `npm run build:routing`) and optional domain/intent overrides in `skills/arabicskill/knowledge/relations/weights.yaml`.
2. **Develop Plugins:** Create declarative domain packs in `skills/arabicskill/plugins/` following `plugins/README.md`.
3. **Submit Benchmarks:** Add synthetic cases in `benchmarks/cases/` with canonical `domain`, `runner_mode` (`sdk` or `agent`), and review criteria — not invented model scores.

## Submitting a PR
- Create a focused branch and explain the user-facing outcome.
- Add or update a synthetic benchmark fixture when changing Arabic output behavior, and verify changes against both `skills/arabicskill` and `skills/arabic-uiux-master` references/examples when relevant.
- Never commit API keys, customer copy, personal data, or regulated content.
- Run `npm ci`, `npm run check`, and `npm run benchmark` before opening the PR.
- Update `CHANGELOG.md` for user-visible changes.

## Adding or updating a skill

- Keep skills under `skills/<skill-name>/` with `SKILL.md`, `README.md`, `package.json` (aligned with the root `version`, without a non-JS `main` entry), and `agents/openai.yaml`.
- Use standards-compatible YAML frontmatter with `name`, `description`, and `metadata.version`.
- Keep detailed domain material in focused supporting files and link it from `SKILL.md`.
- Register the skill in `skills.sh.json` and the root `README.md` table (repository tests discover `skills/*` dynamically).

## Security reports

Do not open public issues for vulnerabilities. Follow [SECURITY.md](SECURITY.md).
