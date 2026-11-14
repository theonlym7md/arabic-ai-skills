# Getting started with ArabicSkill

Install the primary skill, or add `arabic-uiux-master` when you need full screen structure, RTL layout rules, and multi-variant auth or checkout flows (`experience-patterns.md` / `flow-patterns.md`):

```bash
npx skills add theonlym7md/arabic-ai-skills --skill arabicskill
npx skills add theonlym7md/arabic-ai-skills --skill arabic-uiux-master
```

Ask your agent: “Use $arabicskill to rewrite this Arabic empty state. The list is
empty because no invoices exist yet. The user can create an invoice. Use clear
Modern Standard Arabic, with a title, short description, and action.”

Supply the current state, available action, audience/region, and any real product
constraints. Do not include personal data, API keys, or private customer content.

Skills are Markdown instructions; installing them does not require an OpenAI key.
Only the optional repository SDK (`npm run build && node examples/sdk.cjs`) requires
a key and makes billable model requests. Hosts need relative-file access to use
supporting resources.

See [migration](MIGRATION.md), [the execution contract](../SPEC.md), and
[review fixtures](../benchmarks/README.md).
