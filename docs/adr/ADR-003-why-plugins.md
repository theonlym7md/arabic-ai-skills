# ADR-003: Modular Plugin Extensibility Architecture

Historical design proposal. Domain packs are declarative guidance, not executable plugins or evidence of production readiness. See [the current execution contract](../../SPEC.md).

## Context
Core framework modifications to support new domains (e.g. Healthcare, Legal) risk breaking existing production domains like GovTech and FinTech.

## Decision
Adopt declarative domain pack manifests under `skills/arabicskill/plugins/` where domain modules declare triggers, capabilities, regional scope, and entity dependencies independently.

## Consequences
- **Intended benefit (declarative packs only; no runtime plugin loader):** Keeps core guidance isolated from domain-specific packs so contributors can add domain manifests without modifying core contracts.
- **Current cost:** Requires strict plugin manifest, capability, and compatibility validation (`scripts/validate_plugin.js`).
