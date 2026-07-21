---
name: stage_0_planner
description: "Generates a structured execution plan including goals, assumptions, risks, and strategy."
---

# `Stage 0 — Task Planning`

## Planning Pipeline

Construct a concrete plan object inside `PlanningContext`:

1. **`goals`:** Explicit user targets.
2. **`constraints`:** Technical and linguistic boundaries.
3. **`assumptions`:** Contextual assumptions (e.g., "User is authenticated", "First interaction", "Payment card already added").
4. **`risks`:** Failure modes to mitigate.
5. **`success_criteria`:** Quantifiable targets (e.g., "HumanScore > 90", "AISmell < 5").
6. **`required_knowledge`:** Target entity nodes and plugins.
7. **`execution_strategy`:** Operational strategy.

Record structured decision in `trace`:
```json
{
  "stage": "Planning",
  "decision": "Generated execution strategy with 3 explicit context assumptions",
  "why": "Context requires assuming authenticated session.",
  "knowledge_used": ["saudi_govtech"],
  "alternatives_rejected": ["Unauthenticated visitor assumption"],
  "confidence": 0.98,
  "token_estimate": 120,
  "latency_ms": 14
}
```
