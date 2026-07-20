---
name: arabic-intelligence
description: "A composable, state-driven reasoning engine for Arabic UX and Product writing."
version: 2.0.0
---

# Arabic Intelligence

## Overview
This skill operates as a State-Driven pipeline. For every request, you MUST mutate and pass a `State` object through independent functions. Do not generate raw text until the pipeline is complete.

## Pipeline Execution
Execute the following functions in strict order.

### 1. `Diagnose(State)`
- Load: `reasoning/diagnose.md`
- Action: Analyze user request. Output `State.diagnostics`.

### 2. `Load_Knowledge(State)`
- Load relevant nodes from `knowledge/domain_packs/` and `knowledge/mental_models/` based on `State.diagnostics`.
- Resolve dependencies as defined in the node's YAML metadata.

### 3. `Apply_Rules(State)`
- Generate `State.current_draft` by applying the loaded knowledge algorithms.

### 4. `Evaluate(State)`
- Load: `reasoning/evaluate.md` and `knowledge/validators/anti_patterns_engine.md`
- Action: Score the draft. Populate `State.metrics` (Human Score, Cognitive Load, Trust).

### 5. `Repair(State)`
- Condition: If `State.metrics.human_score` < 8.5 OR `State.flags` is not empty.
- Action: Fix the specific errors listed in `State.flags`. Update `State.current_draft`.

### 6. `Output()`
- Return `State.current_draft` directly to the user. Do not output the JSON State object to the user unless requested.

## State Object Schema (Internal Use Only)
Maintain this structure internally during execution:
```json
{
  "user_prompt": "",
  "diagnostics": {},
  "context": [],
  "current_draft": "",
  "metrics": {},
  "flags": []
}
```
