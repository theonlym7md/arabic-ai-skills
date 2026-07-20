---
name: evaluate
description: "Evaluates State.current_draft against anti-patterns and rubrics to generate quantitative scores."
dependencies: ["apply_rules"]
audience: "Internal_Pipeline"
---

# `Evaluate(State)`

## Input
`State.current_draft`: The proposed copy.
`State.diagnostics`: Original context.

## Action
1. Run `validators/anti_patterns_engine.md` against `State.current_draft`.
2. Generate quantitative scores (1-10) based on `benchmarks/metrics/rubrics.json`.

## Mutates
Returns a new `State` object with:
```json
{
  "metrics": {
    "human_score": 9.2,
    "cognitive_load": 2.5,
    "trust_score": 9.0
  },
  "flags": ["list of identified structural errors or forbidden words"]
}
```

## Post-Condition
If `metrics.human_score` < 8.5 OR `flags` is not empty:
Trigger `Repair(State)`.
Else:
Trigger `Output(State)`.
