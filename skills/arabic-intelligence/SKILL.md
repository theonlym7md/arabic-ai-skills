---
name: arabic-intelligence
description: "A modular reasoning framework for Arabic UX writing and AI agents."
version: 6.0.0
---

# Arabic Intelligence Framework

A deterministic reasoning framework for generating high-quality Arabic UX microcopy, product interfaces, and digital content.

## Execution Rules
1. Maintain explicit state across the 4 decoupled context objects.
2. Execute the 10-stage decision graph sequentially.
3. Record a structured trace for every stage execution.

## Decoupled Execution Contexts

```json
{
  "PlanningContext": {
    "TaskType": "",
    "goals": [],
    "constraints": [],
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
      "duration_ms": 0
    }
  ]
}
```

## The 10-Stage Decision Loop

- **Stage 0 — Planning:** Formulate goals, risks, criteria, and strategy.
- **Stage 1 — Diagnose:** Extract 10-dim context. (If MissingContextKeys > 2 -> Ask user; Else -> Assume defaults).
- **Stage 2 — Intent Mapping:** Establish primary goal and emotional target.
- **Stage 3 — Audience & Domain Profiling:** Profile demographic and reading expectations.
- **Stage 4 — Risk Assessment:** Define compliance boundaries and hard constraints.
- **Stage 5 — Knowledge Selection:** Execute 6-step filter against `knowledge/entities/`.
- **Stage 6 — Reasoning & Generation:** Draft candidate text.
- **Stage 7 — Rule Weights Application:** Resolve conflicts via `knowledge/relations/weights.yaml`.
- **Stage 8 — Evaluation:** Measure against 18 rubric metrics.
- **Stage 9 — Repair:** Trigger dynamic threshold auto-correction if metrics fail.
- **Stage 10 — Output:** Emit final Arabic UX text cleanly.
