# ADR-003: Modular Plugin Extensibility Architecture

Historical design proposal. Domain packs are declarative guidance, not executable plugins or evidence of production readiness. See [the current execution contract](../../SPEC.md).

## Context
Core framework modifications to support new domains (e.g. Healthcare, Legal) risk breaking existing production domains like GovTech and FinTech.

## Decision
Adopt an isolated Plugin Architecture in `plugins/` where external domain modules declare triggers, capabilities, and entity dependencies independently.

## Consequences
- **Positive:** Core reasoning engine remains frozen and stable; community can contribute domain packs without merge conflicts.
- **Negative:** Requires strict plugin manifest version checking (`api_version`).
