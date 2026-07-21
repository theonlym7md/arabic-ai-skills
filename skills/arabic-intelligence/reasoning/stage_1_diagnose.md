---
name: stage_1_diagnose
description: "Extracts 10 crucial dimensions and resolves missing context."
---

# `Stage 1 — Diagnose`

## Algorithm: 10-Dimensional Context Extraction

Extract the following dimensions from prompt and planner context:
1. `Domain` (GovTech, FinTech, E-commerce, SaaS, Health).
2. `EmotionalGoal` (Reassured, Empowered, Urgency, Respect).
3. `TrustLevel` (Low, Medium, High, Critical).
4. `Audience` (Citizens, Executives, Gen-Z, Developers).
5. `Tone` (Official, Friendly, Direct, Witty).
6. `ProductType` (Dashboard, Mobile App, Web Landing).
7. `Region` (KSA, Gulf, Levant, General Arabic).
8. `ReadingLevel` (Simple, Moderate, Academic).
9. `Constraints` (Length, specific vocabulary, active voice).
10. `MissingContext` (Unspecified details).

## Missing Context Resolution Rule
- **IF CRITICAL MISSING:** (e.g. Unknown action goal of a payment button).
  `Action: Ask User`
- **ELSE (NON-CRITICAL):** (e.g. Preferred regional sub-dialect).
  `Action: Assume default best-practice for Domain -> Continue execution.`

Record structured log to `WorkingMemory.trace`.
