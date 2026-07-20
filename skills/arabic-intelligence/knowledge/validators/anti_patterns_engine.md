---
name: anti_patterns_engine
description: "Structural parser and validator for detecting complex Arabic AI anti-patterns."
dependencies: []
audience: "Internal_Pipeline"
confidence_threshold: 1.0
---

# `Run_Anti_Patterns_Engine(State)`

## Input
`State.current_draft`

## Action
Instead of simple word matching, execute these structural checks on the text:
1. **Consecutive Adjectives Check:** If there are 3 or more adjectives in a row (e.g., "سريع وفعال وممتاز"), FAIL.
2. **Passive Voice Check:** If verbs use passive forms unnecessarily (e.g., "تم التنفيذ", "يُرجى"), FAIL.
3. **Paragraph Structure Check:** If the text uses the predictable AI sandwich structure (Intro -> 3 Bullet Points -> Conclusion), FAIL.
4. **Bureaucratic Distance Check:** If the text uses third-person distancing (e.g., "العميل", "المستفيد"), FAIL.

## Mutates
If any check FAILS, append the error to `State.flags` and drop `State.metrics.trust_score` to 0.
