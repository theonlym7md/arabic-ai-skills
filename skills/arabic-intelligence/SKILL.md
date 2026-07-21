---
name: arabic-intelligence
description: "A 9-Stage Ontology-Driven Engine for Arabic UX and Product Writing."
version: 4.0.0
---

# Arabic Intelligence Decision Graph

For every request:
1. Maintain a CognitiveStateObject.
2. Execute the Decision Graph.
3. Every stage is mandatory unless explicitly marked optional.

## 1. The CognitiveStateObject Schema
Maintain this JSON state internally throughout your execution.
```json
{
  "diagnostics": {
    "Domain": "", "Audience": "", "Intent": "", "EmotionalGoal": "",
    "ProductType": "", "TrustLevel": "", "ReadingLevel": "",
    "Region": "", "Constraints": [], "MissingContext": []
  },
  "knowledge_loaded": [],
  "trace": [],
  "current_draft": "",
  "evaluation_metrics": {
    "HumanScore": 0, "Trust": 0, "CognitiveLoad": 0, "Clarity": 0,
    "Tone": 0, "Brand": 0, "ReadingFlow": 0, "Terminology": 0,
    "Persuasiveness": 0, "Naturalness": 0, "Localization": 0,
    "AISmell": 0, "Accessibility": 0
  },
  "confidence": {
    "diagnosis": 0,
    "knowledge": 0,
    "generation": 0,
    "evaluation": 0,
    "overall": 0
  }
}
```

## 2. The Decision Graph

### Stage 1 — Diagnose
**Goal:** Extract the 10-dimensional context.
**Action:** Execute Diagnose logic to populate `State.diagnostics`. Record decisions in `State.trace`.

### Stage 2 — Intent Mapping
**Goal:** Map the core goal and emotional target.
**Action:** Define `Intent` and `EmotionalGoal`.

### Stage 3 — Audience & Domain Profiling
**Goal:** Profile the demographic and industry.
**Action:** Define `Audience`, `ReadingLevel`, `Region`, `Domain`, and `ProductType`.

### Stage 4 — Risk Assessment
**Goal:** Establish boundaries and compliance.
**Action:** Determine `TrustLevel` and extract strictly enforced `Constraints`.

### Stage 5 — Knowledge Selection
**Goal:** Retrieve, score, and filter domain knowledge from the Ontology.
**Action:** Execute Knowledge Selection logic. Load Top N entities into `State.knowledge_loaded`. Append reasoning to `State.trace`.

### Stage 6 — Reasoning & Generation
**Goal:** Synthesize the State Object to generate the primary output.
**Action:** Draft the copy in `State.current_draft`.

### Stage 7 — Rule Weights Application
**Goal:** Resolve conflicts using predefined rule weights.
**Action:** Execute Rule Weights logic (e.g., Trust > Brand). 

### Stage 8 — Evaluation
**Goal:** Score the generated artifact comprehensively.
**Action:** Execute Evaluation logic. Populate the 13 `evaluation_metrics` and the `confidence` object.

### Stage 9 — Repair
**Goal:** Iterative self-correction based on dynamic thresholds.
**Action:** Execute Repair logic. If metrics violate domain-specific thresholds, trigger an internal rewrite loop back to Stage 6.

### Stage 10 — Output
Print the final optimized `current_draft` to the user. Do not expose internal State Objects unless requested.
