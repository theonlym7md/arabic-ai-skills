# Arabic Intelligence Framework

A structured reasoning framework for Arabic UX writing, product copy, and AI agents.

## Overview
Arabic Intelligence provides a structured 10-stage decision graph for generating natural, culturally localized Arabic UX microcopy and digital user experiences.

## Capability Matrix

| Capability Category | Status | Supported Framework Features |
| :--- | :---: | :--- |
| **GovTech & Official** | `Production / Stable` | Full Saudi & Gulf GovTech tone, empty states, compliance checks |
| **FinTech & Payments** | `Production / Stable` | Payment retry friction removal, trust anchors, checkout microcopy |
| **SaaS & Landing Pages** | `Production / Stable` | Hero value propositions, action CTAs, feature cards |
| **E-Commerce** | `Production / Stable` | Cart recovery, transactional alerts, product descriptions |
| **Healthcare & Medical** | `Experimental` | Patient onboarding, appointment booking microcopy |
| **Legal & Compliance** | `Experimental` | Terms of service framing, consent dialogs |

## Core Features
- **10-Stage Decision Graph Topology:** Graph execution with explicit feedback loops (`Evaluation <-> Repair <-> Reasoning`).
- **Decoupled Memory Contexts:** Clear separation between `PlanningContext`, `ReasoningContext`, `KnowledgeContext`, and `EvaluationContext`.
- **Extensible Plugin System:** Add custom domain packs in `plugins/` without modifying core logic.
- **Categorized Rule Weights:** Machine-parseable weightings (`quality`, `style`, `optimization`) in `knowledge/relations/domain_weights/`.
- **Anti-Examples Enforcement:** Explicit negative pattern filtering (`anti_examples`) in entity schemas.
- **18 Metric Rubric:** Arabic-specific metrics including `SentenceRhythm`, `InformationDensity`, and `LexicalDiversity`.

## Directory Structure
```text
arabic-intelligence/
├── SKILL.md                  # Core instructions (< 100 lines)
├── reasoning/                # Modular 10-stage reasoning definitions
├── knowledge/
│   ├── entities/             # YAML entity definitions with anti-examples
│   └── relations/
│       └── domain_weights/   # Domain-specific rule weights
├── plugins/                  # Community extensibility packages
├── benchmarks/               # Structured test cases & regression suite
└── examples/                 # Full execution trace walkthroughs
```
