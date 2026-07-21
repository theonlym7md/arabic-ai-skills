# Arabic Intelligence Framework

A modular reasoning framework for Arabic UX writing and AI agents.

## Overview
Arabic Intelligence provides a deterministic 10-stage decision loop for generating natural, culturally localized, and human-grade Arabic product copy, microcopy, and digital user experiences.

## Core Features
- **10-Stage Decision Graph:** Sequential reasoning pipeline from planning to repair.
- **Decoupled Memory Contexts:** Clear separation between Planning, Reasoning, Knowledge, and Evaluation states.
- **Ontology Knowledge Graph:** Machine-parseable YAML entity schema supporting inheritance, dependencies, and conflict detection.
- **Categorized Rule Weights:** Structured weightings (`quality`, `style`, `optimization`) for mathematical conflict resolution.
- **18 Metric Rubric:** Comprehensive scoring system including Arabic-specific metrics (`SentenceRhythm`, `InformationDensity`, `LexicalDiversity`).
- **Dynamic Repair Engine:** Automated threshold-based intervention for eliminating AI clichés.

## Directory Structure
```text
arabic-intelligence/
├── SKILL.md                  # Lean core instructions (< 300 lines)
├── reasoning/                # Modular reasoning stage definitions
├── knowledge/
│   ├── entities/             # YAML ontology entity definitions
│   └── relations/            # Categorized rule weights (weights.yaml)
├── benchmarks/               # Fixed test suite & golden references
└── examples/                 # Full end-to-end execution traces
```

## Quick Start
To use this framework with any LLM or AI Agent:
1. Initialize the 4 `Context` objects.
2. Follow the 10 stages in `SKILL.md`.
3. Query `knowledge/entities/` for domain-specific directives.
