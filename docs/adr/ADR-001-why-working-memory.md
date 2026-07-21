# ADR-001: Decoupled WorkingMemory Architecture

## Context
Initial versions stored all execution state in a single monolithic object. This caused context pollution during evaluation and repair loops.

## Decision
Decouple working state into 4 independent context namespaces:
- `PlanningContext`
- `ReasoningContext`
- `KnowledgeContext`
- `EvaluationContext`

## Consequences
- **Positive:** Cleaner state isolation, easier debugging, zero context leak between planning and evaluation.
- **Negative:** Slightly increased state serialization verbosity.
