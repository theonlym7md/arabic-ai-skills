---
name: stage_9_repair_matrix
description: "Iterative auto-repair matrix based on Stage 8 metrics."
---

# `Stage 9 — Repair Matrix`

## Algorithm: The Intervention Engine
If `State.confidence.Score` < 85, examine `State.evaluation_metrics` and apply these rules:

1. **IF `AISmell` > 20:**
   - **Action:** Remove transition clichés ("في الختام", "من الجدير بالذكر").
   - **Action:** Replace passive voice with active voice.
   - **Action:** Vary sentence lengths to inject human-like variance.

2. **IF `CognitiveLoad` < 70 (meaning load is high):**
   - **Action:** Split sentences exceeding 15 words.
   - **Action:** Convert comma-separated lists to bullet points.
   - **Action:** Simplify jargon unless `diagnostics.Audience` == 'Experts'.

3. **IF `Trust` < 80:**
   - **Action:** Inject social proof or data.
   - **Action:** Remove hyperbole ("100% مضمون", "سحري").

4. **IF `Clarity` < 85:**
   - **Action:** Make the Call-To-Action (CTA) explicit.

*Rewrite `State.current_draft` and loop back to Stage 8. Max iterations: 2.*
