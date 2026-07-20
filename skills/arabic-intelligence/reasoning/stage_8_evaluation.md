---
name: stage_8_evaluation
description: "13-metric evaluation schema for quantitative quality assessment."
---

# `Stage 8 — Evaluation`

## Metric Matrix (0-100)
Score the `State.current_draft` against these 13 metrics. Calculate an overall average for `confidence.Score`.

1. **HumanScore:** Does it sound like a real, empathetic human?
2. **Trust:** Is it free from hyperbole and false claims?
3. **CognitiveLoad:** Is it easy to read? (Higher score = easier to read).
4. **Clarity:** Is the message unambiguous?
5. **Tone:** Does it match `diagnostics.Tone of Voice`?
6. **Brand:** Does it match `diagnostics.Domain` archetype?
7. **ReadingFlow:** Are transitions smooth?
8. **Terminology:** Is industry jargon accurate?
9. **Persuasiveness:** Does it motivate the user to click the CTA?
10. **Naturalness:** Are idioms translated naturally?
11. **Localization:** Does it fit the `diagnostics.Region` (e.g. Saudi context)?
12. **AISmell:** (PENALTY METRIC) How robotic does it sound? (High AI smell = low confidence).
13. **Accessibility:** Is it readable by screen readers (clear link texts, no vague "Click here").
