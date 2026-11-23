# ADR-002: Ontological Knowledge Graph over Markdown Files

Historical design rationale. The repository provides declarative YAML resources and validators, not the deterministic query engine proposed below. See [the current execution contract](../../SPEC.md).

## Context
Managing raw text guidance files scales poorly beyond ~20 files, causing instruction overlap and unresolvable rule conflicts.

## Decision
Represent domain knowledge as machine-parseable YAML entity graphs supporting `inherits`, `depends_on`, `conflicts_with`, and `anti_examples`.

## Consequences
- **Intended benefit (not implemented as a runtime query engine):** A declarative entity graph and weight spec (`knowledge/relations/weights.yaml`) that could back a deterministic pipeline (`SELECT -> Expand -> Rank -> Resolve -> Return`) if a runtime query engine is ever built.
- **Current cost:** Requires YAML schema and reference validation (`scripts/validate_schema.js`) for every knowledge addition.
