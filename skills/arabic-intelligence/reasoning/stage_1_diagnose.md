---
name: stage_1_diagnose
description: "Extracts 10-dimensional context and applies threshold logic for missing context."
---

# `Stage 1 — Diagnose`

## Algorithm: 10-Dimensional Context Extraction

Extract the 10 context dimensions into `ReasoningContext.diagnostics`:
`Domain`, `Audience`, `Intent`, `EmotionalGoal`, `ProductType`, `TrustLevel`, `ReadingLevel`, `Region`, `Constraints`, `MissingContextKeys`.

## Missing Context Decision Rule

```text
IF count(MissingContextKeys) <= 2:
    Action: Log assumptions in ReasoningContext.diagnostics.
    Action: Proceed to Stage 2.
ELSE IF count(MissingContextKeys) > 2:
    Action: PAUSE execution.
    Action: Ask user to clarify missing critical keys.
```

Record structured decision in `trace`:
```json
{
  "stage": "Diagnose",
  "decision": "Extracted 10 dimensions. 1 missing key assumed (Region=KSA).",
  "why": "MissingContextKeys count (1) <= 2 threshold.",
  "knowledge_used": [],
  "alternatives_rejected": ["Prompting user for Region clarification"],
  "confidence": 0.95,
  "duration_ms": 15
}
```
