---
name: arabic-intelligence
description: "A structured reasoning framework for Arabic UX writing, product copy, and AI agents."
version: 7.0.0
---

# Arabic Intelligence Framework

A structured reasoning framework for generating natural, culturally localized Arabic UX microcopy and digital product experiences.

## Execution Principles
1. Maintain explicit state across the 4 decoupled context objects.
2. Execute the 10-stage Decision Graph.
3. Allow conditional feedback loops between Evaluation, Repair, and Reasoning.

## Decoupled Execution Contexts

```json
{
  "PlanningContext": {
    "TaskType": "",
    "goals": [],
    "constraints": [],
    "assumptions": [],
    "risks": [],
    "success_criteria": [],
    "required_knowledge": [],
    "execution_strategy": ""
  },
  "ReasoningContext": {
    "diagnostics": {
      "Domain": "", "Audience": "", "Intent": "", "EmotionalGoal": "",
      "ProductType": "", "TrustLevel": "", "ReadingLevel": "",
      "Region": "", "Constraints": [], "MissingContextKeys": []
    },
    "current_draft": ""
  },
  "KnowledgeContext": {
    "entities_loaded": [
      {
        "entity": "",
        "confidence": 0.0,
        "priority": 0,
        "reason": "",
        "dependencies": []
      }
    ]
  },
  "EvaluationContext": {
    "metrics": {
      "HumanScore": 0, "Trust": 0, "CognitiveLoad": 0, "Clarity": 0,
      "Tone": 0, "Brand": 0, "ReadingFlow": 0, "Terminology": 0,
      "Persuasiveness": 0, "Naturalness": 0, "Localization": 0,
      "AISmell": 0, "Accessibility": 0,
      "SentenceRhythm": 0, "InformationDensity": 0,
      "LexicalDiversity": 0, "Actionability": 0, "EmotionalPrecision": 0
    },
    "confidence": {
      "planner": 0.0, "diagnosis": 0.0, "knowledge": 0.0,
      "generation": 0.0, "evaluation": 0.0, "overall": 0.0
    }
  },
  "trace": [
    {
      "stage": "",
      "decision": "",
      "why": "",
      "knowledge_used": [],
      "alternatives_rejected": [],
      "confidence": 0.0,
      "token_estimate": 0,
      "latency_ms": 0
    }
  ]
}
```

## The 10-Stage Decision Graph Topology

```text
[Stage 0: Planning] -> [Stage 1: Diagnose] -> [Stage 2: Intent] -> [Stage 3: Audience] 
                                                                             │
[Stage 7: Weights] <- [Stage 6: Reasoning] <-> [Stage 5: Knowledge] <- [Stage 4: Risk]
       │                    │
       ▼                    ▼
[Stage 8: Evaluation] ──(Metrics Fail?)──> [Stage 9: Repair]
       │                                         │
 (Metrics Pass)                            (Loop back to Stage 6)
       ▼
[Stage 10: Output]
```

### Stage Summary
- **Stage 0 — Planning:** Formulate goals, assumptions, risks, criteria, and strategy.
- **Stage 1 — Diagnose:** Extract 10-dim context. (If MissingContextKeys > 2 -> Ask user; Else -> Assume).
- **Stage 2 — Intent:** Map primary goal and emotional target.
- **Stage 3 — Audience:** Profile demographics and reading expectations.
- **Stage 4 — Risk:** Define trust boundaries and hard constraints.
- **Stage 5 — Knowledge Selection:** Query `knowledge/entities/` & active `plugins/`.
- **Stage 6 — Reasoning & Generation:** Draft candidate text.
- **Stage 7 — Rule Weights:** Apply `knowledge/relations/domain_weights/`.
- **Stage 8 — Evaluation:** Measure against 18 rubric metrics.
- **Stage 9 — Repair:** Auto-correct if metrics fail dynamic threshold; loop back to Stage 6 (Max 2 cycles).
- **Stage 10 — Output:** Emit final Arabic copy.
