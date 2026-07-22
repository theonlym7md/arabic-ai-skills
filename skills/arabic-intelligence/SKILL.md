---
name: arabic-intelligence
description: "Arabic reasoning framework for UX writing, product communication and localization."
version: 1.2.0
---

# Arabic Intelligence Framework

A structured reasoning framework for generating natural, culturally localized Arabic UX microcopy and digital product experiences.

## Execution Rules & Formal Stage Contracts

Every stage in the 10-Stage Decision Graph adheres to a formal protocol interface contract:

- **Stage 0 (Planning):** `Consumes: Prompt` | `Produces: PlanningContext` | `Mutates: None` | `SideEffects: None` | `Idempotent: true`
- **Stage 1 (Diagnose):** `Consumes: PlanningContext` | `Produces: ReasoningContext.diagnostics` | `Mutates: ReasoningContext` | `SideEffects: Ask user if MissingKeys > 2` | `Idempotent: true`
- **Stage 2 (Intent):** `Consumes: diagnostics` | `Produces: Intent & EmotionalGoal` | `Mutates: ReasoningContext` | `SideEffects: None` | `Idempotent: true`
- **Stage 3 (Audience):** `Consumes: diagnostics` | `Produces: Audience & ReadingLevel` | `Mutates: ReasoningContext` | `SideEffects: None` | `Idempotent: true`
- **Stage 4 (Risk):** `Consumes: diagnostics` | `Produces: TrustLevel & Hard Constraints` | `Mutates: ReasoningContext` | `SideEffects: None` | `Idempotent: true`
- **Stage 5 (Knowledge):** `Consumes: diagnostics` | `Produces: KnowledgeContext` | `Mutates: KnowledgeContext` | `SideEffects: Reads knowledge/entities & plugins/` | `Idempotent: true`
- **Stage 6 (Reasoning):** `Consumes: ReasoningContext, KnowledgeContext` | `Produces: ReasoningContext.current_draft` | `Mutates: ReasoningContext` | `SideEffects: None` | `Idempotent: false`
- **Stage 7 (Weights):** `Consumes: ReasoningContext.current_draft` | `Produces: Conflict Resolutions` | `Mutates: ReasoningContext` | `SideEffects: Reads domain_weights/` | `Idempotent: true`
- **Stage 8 (Evaluation):** `Consumes: ReasoningContext.current_draft` | `Produces: EvaluationContext` | `Mutates: EvaluationContext` | `SideEffects: None` | `Idempotent: true`
- **Stage 9 (Repair):** `Consumes: EvaluationContext` | `Produces: Revised Draft` | `Mutates: ReasoningContext.current_draft` | `SideEffects: Rewinds to Stage 6 (Max 2 Loops)` | `Idempotent: false`
- **Stage 10 (Output):** `Consumes: ReasoningContext.current_draft` | `Produces: Final User Copy` | `Mutates: None` | `SideEffects: Emits text` | `Idempotent: true`

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
