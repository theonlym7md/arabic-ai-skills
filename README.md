# Arabic Intelligence Framework

A structured reasoning framework for Arabic UX writing, product copy, and AI agents.

## Quick Read (60 Seconds)

Arabic Intelligence provides a structured 10-stage decision graph for generating natural, culturally localized Arabic UX microcopy and digital product experiences.

- **Architecture:** Decoupled memory contexts (`PlanningContext`, `ReasoningContext`, `KnowledgeContext`, `EvaluationContext`).
- **Ontology Engine:** YAML entity definitions with strict anti-example clichés filtering.
- **Rule Weights:** Machine-parseable priority weightings per domain.
- **Plugins:** Community domain packs in `plugins/` without modifying core logic.

## Capability Matrix

| Category | Status | Details |
| :--- | :---: | :--- |
| **GovTech & Official** | `Production` | Saudi & Gulf GovTech tone, empty states, official notices |
| **FinTech & Payments** | `Production` | Payment friction removal, checkout retry, trust anchors |
| **SaaS & Landing Pages** | `Production` | Hero value propositions, CTAs, feature cards |
| **E-Commerce** | `Production` | Cart recovery, transactional alerts, product copy |
| **Healthcare** | `Experimental` | Patient onboarding, appointment booking |
| **Legal Binding Contracts** | `Unsupported` | *Not supported. Requires specialized legal counsel.* |
| **Medical Diagnosis Copy** | `Unsupported` | *Not supported. Requires licensed medical evaluation.* |
| **Automated Marketing Spam** | `Unsupported` | *Forbidden by framework ethical rules.* |

## Ecosystem Links
- [Skill Instructions](skills/arabic-intelligence/SKILL.md)
- [Architecture Decision Records (ADRs)](docs/adr/)
- [Plugin Development Guide](skills/arabic-intelligence/plugins/README.md)
- [Benchmarks & Performance Trend](skills/arabic-intelligence/benchmarks/README.md)
- [Good vs. Bad Copy Examples](skills/arabic-intelligence/examples/bad_vs_good_copy.md)
- [Contributing Guide](CONTRIBUTING.md) | [Governance](GOVERNANCE.md) | [Roadmap](ROADMAP.md)
