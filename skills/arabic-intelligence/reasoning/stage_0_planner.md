---
name: stage_0_planner
description: "Generates a structured execution plan including goals, risks, and strategy."
---

# `Stage 0 — Task Planning`

## Planning Pipeline

Do not just classify the prompt. Build a concrete plan object inside `PlanningContext`:

1. **`goals`:** List explicit user goals (e.g., "Reduce payment friction", "Communicate violation error clearly").
2. **`constraints`:** Technical and linguistic boundaries (e.g., "Max 8 words", "No passive voice").
3. **`risks`:** Potential points of failure (e.g., "User panics due to fine wording", "Ambiguous action button").
4. **`success_criteria`:** Verifiable outcomes (e.g., "HumanScore > 90", "AISmell < 5").
5. **`required_knowledge`:** Needed entity nodes (e.g., `saudi_govtech`, `traffic_fine_terms`).
6. **`execution_strategy`:** The operational path for the remaining stages.

Record structured decision in `trace`:
```json
{
  "stage": "Planning",
  "decision": "Generated execution strategy for GovTech Traffic Violation Notice",
  "why": "High risk of user alarm requires calm, authoritative, actionable wording.",
  "knowledge_used": ["saudi_govtech"],
  "alternatives_rejected": ["Marketing tone execution plan"],
  "confidence": 0.98,
  "duration_ms": 12
}
```
