# Internal Benchmarks & Methodology

This directory stores review fixtures and target thresholds for preventing regressions.

There are twenty-one synthetic cases: the original nine (government empty state, uncertain payment, deletion effects, location permission, translation variables, Arabic plurals, a short CTA, source injection, regional neutrality), seven sector cases (media actions, game onboarding, civic request status, merchant benefits, event availability, installment terms, investment disclosure), three modern UI-flow cases (AI uncertainty disclosure, OTP verification error, and inline form validation), and two cross-domain experience cases (heading/button punctuation discipline and flexible auth gateway variants). Golden outputs are authored examples, not a single mandatory phrasing or copied website content.

## What the checks prove

The validation command checks files, metadata ranges, case ID alignment, review criteria, JSON/ICU structural integrity where applicable, and prohibited phrases in the authored reference output. With `OPENAI_API_KEY` set, `npm run benchmark -- --live` runs the SDK and checks generated options for prohibited phrases. Quality scores require a separate evaluation using the rubric below. The 0–100 targets describe review goals.

## Reproducible comparison

1. Keep some prompts held out from skill editing. Use only synthetic or carefully sanitized data.
2. Run the same model snapshot, settings and prompts with and without the skill; record the exact loaded files and raw outputs.
3. Randomize output order and ask at least two Arabic-speaking reviewers to apply the [evidence rubric](../skills/arabicskill/reasoning/stage_8_evaluation.md).
4. Reject unsafe claims and broken variables independently of style scores. Record disagreements and failed cases.
5. Publish model/date, prompt, output, settings, rubric version, reviewers, and limitations together. Do not claim statistical significance from this small fixture set.

No with/without model experiment is recorded in this release. Local contract tests use mocked API responses and incur no model usage.

## Evaluation Methodology & Scoring Rubric

`npm run benchmark` validates fixture structure, required files, numeric target ranges, and forbidden-phrase violations. It does not call a model or invent quality scores.

The target metrics describe the rubric a human or an external evaluator should apply to generated output:
- **HumanScore (0-100%):** Evaluates linguistic naturalness, active voice usage, and lack of awkward translation syntax.
- **Trust Score (0-100%):** Evaluates compliance, clarity, and safety anchors for sensitive domains (GovTech, FinTech).
- **AISmell Score (0-100):** Measures presence of AI clichés (*"في إطار حرصنا"*, *"يرجى التكرم"*). Lower is better (0 = Zero Cliché).

## Recording a model evaluation

Record the model identifier, prompt, output, evaluator, rubric version, raw scores, and date. Do not publish aggregate claims without the underlying run artifacts.
