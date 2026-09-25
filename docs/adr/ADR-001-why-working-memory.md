# ADR-001: Decoupled WorkingMemory Architecture

Historical design proposal, not an implemented runtime or a tested isolation guarantee. See [the current execution contract](../../SPEC.md).

## Context
Initial versions stored all execution state in a single monolithic object. This caused context pollution during evaluation and repair loops.

## Decision
Decouple working state into 4 independent context namespaces:
- `PlanningContext`
- `ReasoningContext`
- `KnowledgeContext`
- `EvaluationContext`

## Consequences
- **Intended benefit:** Clearer separation of planning and evaluation concepts; no zero-leak guarantee is established.
- **Negative:** Slightly increased state serialization verbosity.
