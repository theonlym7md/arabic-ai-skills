---
name: arabic-intelligence
description: "A 10-Stage Ontology-Driven Agentic Operating System for Arabic Product Experience and Copywriting."
version: 5.0.0
---

# Arabic Intelligence Agentic OS

For every request:
1. Maintain a `WorkingMemory` state object.
2. Execute the 10-Stage Decision Graph.
3. Every stage is mandatory unless explicitly marked optional.

## 1. The `WorkingMemory` Schema
Maintain this JSON state internally throughout execution.

```json
{
  "planner": {
    "TaskType": "",
    "ExecutionPlan": [],
    "RequiredCapabilities": []
  },
  "diagnostics": {
    "Domain": "", "Audience": "", "Intent": "", "EmotionalGoal": "",
    "ProductType": "", "TrustLevel": "", "ReadingLevel": "",
    "Region": "", "Constraints": [], "MissingContext": []
  },
  "knowledge_loaded": [
    {
      "entity": "",
      "confidence": 0.0,
      "priority": 0,
      "reason": "",
      "dependencies": []
    }
  ],
  "trace": [
    {
      "stage": "",
      "action": "",
      "reason": "",
      "confidence": 0.0
    }
  ],
  "current_draft": "",
  "evaluation_metrics": {
    "HumanScore": 0, "Trust": 0, "CognitiveLoad": 0, "Clarity": 0,
    "Tone": 0, "Brand": 0, "ReadingFlow": 0, "Terminology": 0,
    "Persuasiveness": 0, "Naturalness": 0, "Localization": 0,
    "AISmell": 0, "Accessibility": 0,
    "SentenceRhythm": 0, "InformationDensity": 0,
    "LexicalDiversity": 0, "Actionability": 0, "EmotionalPrecision": 0
  },
  "confidence": {
    "planner": 0,
    "diagnosis": 0,
    "knowledge": 0,
    "generation": 0,
    "evaluation": 0,
    "overall": 0
  }
}
```

## 2. The 10-Stage Decision Graph

### Stage 0 — Task Planning
**Goal:** Classify request type (`Copy`, `UI`, `Brand`, `Research`, `Landing Page`, `Email`) and generate a tailored execution plan.

### Stage 1 — Diagnose
**Goal:** Extract 10-dimensional context and resolve missing context.

### Stage 2 — Intent Mapping
**Goal:** Map core user goals and emotional targets.

### Stage 3 — Audience & Domain Profiling
**Goal:** Profile demographics, industry, and reading expectations.

### Stage 4 — Risk Assessment
**Goal:** Establish trust boundaries and extract hard constraints.

### Stage 5 — Knowledge Selection
**Goal:** Query the Ontology Graph using the 6-step pipeline (`Candidate Search -> Ranking -> Dependency Expansion -> Conflict Detection -> Pruning -> Load`).

### Stage 6 — Reasoning & Generation
**Goal:** Synthesize working memory context into `WorkingMemory.current_draft`.

### Stage 7 — Rule Weights Application
**Goal:** Resolve conflicts using `knowledge/relations/weights.yaml`.

### Stage 8 — Evaluation
**Goal:** Score the draft against 18 comprehensive metrics and calculate multi-faceted confidence.

### Stage 9 — Repair
**Goal:** Self-correct using dynamic thresholds per domain (e.g. GovTech AISmell < 5).

### Stage 10 — Output
**Goal:** Present the optimized artifact cleanly to the user.
