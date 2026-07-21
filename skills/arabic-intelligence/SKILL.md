---
name: arabic-intelligence
description: "A 10-stage structured reasoning framework for Arabic UX writing, product copy, digital microcopy, localized Arabic interfaces, and Arabic content strategy. Make sure to use this skill whenever the user asks to write, refine, translate, analyze, or generate Arabic copy, Arabic UI buttons, Arabic empty states, error messages, landing pages, SaaS messaging, GovTech/FinTech Arabic copy, or Arabic product interfaces, even if they don't explicitly mention 'arabic-intelligence'."
version: 8.0.0
---

# Arabic Intelligence Framework

A structured reasoning framework for generating natural, culturally localized Arabic UX microcopy and digital product experiences.

## Execution Rules & Stage Contracts

Every stage in the 10-Stage Decision Graph adheres to an explicit Stage Contract:
- **`Input`:** Required context objects.
- **`Output`:** Modified context objects.
- **`FailureCondition`:** Metrics or missing keys that break execution.
- **`RetryPolicy`:** Permitted re-execution loops.

## Decoupled Execution Contexts

```json
{
  "PlanningContext": {
    "TaskType": "", "goals": [], "constraints": [], "assumptions": [],
    "risks": [], "success_criteria": [], "required_knowledge": [], "execution_strategy": ""
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
      { "entity": "", "confidence": 0.0, "priority": 0, "reason": "", "dependencies": [] }
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
      "planner": 0.0, "diagnosis": 0.0, "knowledge": 0.0, "generation": 0.0, "evaluation": 0.0, "overall": 0.0
    }
  },
  "trace": [
    {
      "stage": "", "decision": "", "why": "", "knowledge_used": [], "alternatives_rejected": [],
      "confidence": 0.0, "token_estimate": 0, "latency_ms": 0, "cache_hit": false, "cache_miss": true
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

### Stage Contracts Reference
- **Stage 0 (Planning):** `Input: Prompt` -> `Output: PlanningContext` | `Failure: Empty Intent`.
- **Stage 1 (Diagnose):** `Input: PlanningContext` -> `Output: ReasoningContext.diagnostics` | `Failure: MissingContextKeys > 2`.
- **Stage 5 (Knowledge):** `Input: diagnostics` -> `Output: KnowledgeContext` | `Failure: Entity Load Failure`.
- **Stage 8 (Evaluation):** `Input: current_draft` -> `Output: EvaluationContext` | `Failure: Metric Below Threshold`.
- **Stage 9 (Repair):** `Input: EvaluationContext` -> `Output: Revised Draft` | `Retry: Max 2 Loops`.
