# Internal Benchmarks & Methodology

This directory stores review fixtures and target thresholds for preventing regressions.

## Evaluation Methodology & Scoring Rubric

`npm run benchmark` validates fixture structure, required files, numeric target ranges, and forbidden-phrase violations. It does not call a model or invent quality scores.

The target metrics describe the rubric a human or an external evaluator should apply to generated output:
- **HumanScore (0-100%):** Evaluates linguistic naturalness, active voice usage, and lack of awkward translation syntax.
- **Trust Score (0-100%):** Evaluates compliance, clarity, and safety anchors for sensitive domains (GovTech, FinTech).
- **AISmell Score (0-100):** Measures presence of AI clichés (*"في إطار حرصنا"*, *"يرجى التكرم"*). Lower is better (0 = Zero Cliché).

## Recording a model evaluation

Record the model identifier, prompt, output, evaluator, rubric version, raw scores, and date. Do not publish aggregate claims without the underlying run artifacts.
