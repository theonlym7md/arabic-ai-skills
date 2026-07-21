---
name: stage_9_repair_matrix
description: "Iterative auto-repair matrix with Dynamic Thresholds based on domain."
---

# `Stage 9 — Repair Matrix`

## Algorithm: The Dynamic Intervention Engine
Examine `State.evaluation_metrics`. Apply repairs based on dynamically calculated thresholds for the specific `Domain`.

### Dynamic Thresholds (Example)
- **Government:** `AISmell` MUST be < 5. `Trust` MUST be > 95.
- **FinTech:** `AISmell` MUST be < 10. `Trust` MUST be > 98.
- **Landing Page / SaaS:** `AISmell` MUST be < 15. `Persuasiveness` MUST be > 90.

### Interventions
1. **IF `AISmell` > Dynamic Threshold:**
   - **Action:** Remove transition clichés ("علاوة على ذلك", "في الختام").
   - **Action:** Replace passive voice with active voice.
   - **Action:** Vary sentence lengths to inject human-like variance.

2. **IF `CognitiveLoad` < 70 (meaning load is high):**
   - **Action:** Split sentences exceeding 15 words.
   - **Action:** Convert comma-separated lists to bullet points.

3. **IF `Trust` < Dynamic Threshold:**
   - **Action:** Inject social proof or data.
   - **Action:** Remove hyperbole ("ثوري", "سحري").

*Rewrite `State.current_draft` and loop back to Stage 8. Max iterations: 2.*
