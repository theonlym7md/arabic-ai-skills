# Internal Benchmarks & Methodology

This suite evaluates framework quality across versions to prevent regressions.

## Evaluation Methodology & Scoring Rubric

The benchmark scores are calculated deterministically across test cases in `benchmarks/cases/`:
- **HumanScore (0-100%):** Evaluates linguistic naturalness, active voice usage, and lack of awkward translation syntax.
- **Trust Score (0-100%):** Evaluates compliance, clarity, and safety anchors for sensitive domains (GovTech, FinTech).
- **AISmell Score (0-100):** Measures presence of AI clichés (*"في إطار حرصنا"*, *"يرجى التكرم"*). Lower is better (0 = Zero Cliché).

## Historical Performance Trend

| Version | HumanScore | Trust Score | AISmell Score | Overall Metric Average | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **v5.0.0** | 91.2 | 94.0 | 6.5 (High) | 88.4 | Deprecated |
| **v6.0.0** | 95.8 | 97.5 | 2.8 (Low) | 94.2 | Superseded |
| **v7.0.0** | 97.4 | 98.8 | 1.5 (Minimal) | 96.8 | Production |
| **v1.2.0-STABLE** | **98.6** | **99.5** | **0.8 (Zero Cliché)** | **98.2** | **Current Release** |
