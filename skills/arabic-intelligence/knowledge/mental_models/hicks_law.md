---
node_id: mental_model_hicks_law
name: Hick's Law Algorithm
category: Decision Making
description: "Applies Hick's Law to reduce cognitive load by aggressively limiting choices in the State.current_draft."
dependencies: ["Diagnose"]
---

# `Apply_Hicks_Law(State)`

## Evaluation
IF `State.diagnostics.intent` == "onboarding" OR "checkout":
-> TRIGGER: Reduce_Choices

## Action (Reduce_Choices)
1. Read `State.current_draft`.
2. Count the number of Call-to-Actions (CTAs) or options presented.
3. If options > 2:
   - DELETE secondary options.
   - HIDE non-essential information behind progressive disclosure (e.g. "تفاصيل أكثر").
4. Update `State.current_draft` with the simplified version.
