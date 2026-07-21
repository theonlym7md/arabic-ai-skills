# ADR-002: Ontological Knowledge Graph over Markdown Files

## Context
Managing raw text guidance files scales poorly beyond ~20 files, causing instruction overlap and unresolvable rule conflicts.

## Decision
Represent domain knowledge as machine-parseable YAML entity graphs supporting `inherits`, `depends_on`, `conflicts_with`, and `anti_examples`.

## Consequences
- **Positive:** Deterministic query pipeline (`SELECT -> Expand -> Rank -> Resolve -> Return`), formal conflict resolution via rule weights.
- **Negative:** Requires YAML schema validation for new knowledge additions.
