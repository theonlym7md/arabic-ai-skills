# Arabic Intelligence Protocol Specification (SPEC.md)

`Specification Version: 1.1.0-STABLE`

This document defines the formal, zero-marketing technical protocol for the Arabic Intelligence Guided Reasoning Engine.

---

## 1. Execution Context Schemas

The framework operates on 4 decoupled context objects passed down the decision graph:

1. **`PlanningContext`:** Contains goals, constraints, assumptions, risks, success criteria, required knowledge, and execution strategy.
2. **`ReasoningContext`:** Holds 10-dimensional diagnostics (`Domain`, `Audience`, `Intent`, `EmotionalGoal`, `ProductType`, `TrustLevel`, `ReadingLevel`, `Region`, `Constraints`, `MissingContextKeys`) and `current_draft`.
3. **`KnowledgeContext`:** Contains array of `entities_loaded` with priority and confidence metadata.
4. **`EvaluationContext`:** Holds 18 quantitative rubric metrics (0 - 100) and multi-stage confidence scores.

---

## 2. Stage Protocol Contracts

| Stage | Consumes | Produces | Mutates | Side Effects | Idempotent |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **0. Planning** | Prompt | `PlanningContext` | None | None | `true` |
| **1. Diagnose** | `PlanningContext` | `diagnostics` | `ReasoningContext` | Prompts user if MissingKeys > 2 | `true` |
| **2. Intent** | `diagnostics` | `Intent`, `EmotionalGoal` | `ReasoningContext` | None | `true` |
| **3. Audience** | `diagnostics` | `Audience`, `ReadingLevel` | `ReasoningContext` | None | `true` |
| **4. Risk** | `diagnostics` | `TrustLevel`, `Constraints` | `ReasoningContext` | None | `true` |
| **5. Knowledge** | `diagnostics` | `KnowledgeContext` | `KnowledgeContext` | Queries `knowledge/entities/` & `plugins/` | `true` |
| **6. Reasoning** | Contexts | `current_draft` | `ReasoningContext` | None | `false` |
| **7. Weights** | `current_draft` | Conflict Resolutions | `ReasoningContext` | Reads `domain_weights/` | `true` |
| **8. Evaluation** | `current_draft` | `EvaluationContext` | `EvaluationContext` | None | `true` |
| **9. Repair** | `EvaluationContext` | Revised Draft | `current_draft` | Rewinds to Stage 6 (Max 2) | `false` |
| **10. Output** | `current_draft` | Final User Copy | None | Emits Output | `true` |

---

## 3. Protocol Error Codes

Runtimes implementing this specification MUST emit standard error codes on failure:

| Error Code | Description | Resolution Trigger |
| :--- | :--- | :--- |
| `ERR_MISSING_CONTEXT_CRITICAL` | `MissingContextKeys` count exceeds 2 threshold | Halt & prompt user for clarification |
| `ERR_PLUGIN_INCOMPATIBLE` | Plugin `framework_version` does not satisfy runtime | Skip plugin load & log fallback warning |
| `ERR_ENTITY_CONFLICT` | Two entity directives directly contradict | Resolve via `weights.yaml` priority score |
| `ERR_REPAIR_LIMIT_EXCEEDED` | Stage 9 repair loop reached maximum 2 iterations | Fallback to highest confidence candidate draft |
| `ERR_METRIC_FAIL` | Evaluation metric falls below dynamic domain threshold | Trigger Stage 9 dynamic repair intervention |

---

## 4. Plugin API & Deprecation Specification

Plugins MUST declare `plugin.yaml` containing:
- `api_version: 1`
- `framework_version: ">=1.0.0"`
- `min_framework_version: "1.0.0"`
- `max_framework_version: "2.0.0"`
- `deprecated_after: ""` (optional deprecation date)
- `replacement: ""` (optional replacement module)
- `name`, `version`, `triggers`, `capabilities`, `entities`

---

## 5. Multi-Language Runtime SDK Specification

Runtimes (Node.js, Python, Go) consuming this specification MUST implement the state machine interface:
```typescript
interface ArabicIntelligenceRuntime {
  executePlanning(prompt: string): PlanningContext;
  executeDiagnose(plan: PlanningContext): ReasoningContext;
  executeKnowledge(diag: ReasoningContext): KnowledgeContext;
  executeEvaluation(draft: string): EvaluationContext;
  executeRepair(evalCtx: EvaluationContext): string;
}
```
