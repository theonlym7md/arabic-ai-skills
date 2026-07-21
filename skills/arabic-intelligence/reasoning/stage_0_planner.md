---
name: stage_0_planner
description: "Classifies task types and generates customized execution plans prior to context diagnosis."
---

# `Stage 0 — Task Planning`

## Algorithm: Task Taxonomy Classification

1. Analyze prompt to classify `TaskType`:
   - `Microcopy / UX`: Button text, tooltips, toast notifications, error messages.
   - `Landing Page`: Hero sections, value propositions, feature grids, CTAs.
   - `Brand Strategy`: Tone of voice guides, archetype definitions, brand identity.
   - `Email / Communication`: Onboarding flows, transactional emails, newsletters.
   - `Research / Audit`: Evaluating existing copy, auditing Arabic UX.

2. Generate `ExecutionPlan`:
   - Define custom sub-steps tailored to the `TaskType`.

3. Populate `WorkingMemory.planner` and add a structured log to `WorkingMemory.trace`:
   ```json
   {
     "stage": "Task Planning",
     "action": "Classified TaskType as Landing Page",
     "reason": "Prompt requested a complete landing page hero and features section.",
     "confidence": 0.98
   }
   ```
