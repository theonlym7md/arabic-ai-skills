---
name: stage_8_evaluation
description: "Evaluates draft against 18 comprehensive metrics and multi-stage confidence scoring."
---

# `Stage 8 — Evaluation`

## 18-Metric Rubric (0 - 100)

1. `HumanScore`: Overall naturalness and human feel.
2. `Trust`: Safety, compliance, and reliability.
3. `CognitiveLoad`: Ease of comprehension (higher score = lower load).
4. `Clarity`: Directness and lack of ambiguity.
5. `Tone`: Alignment with intended brand tone.
6. `Brand`: Adherence to domain archetype.
7. `ReadingFlow`: Smoothness of sentence transitions.
8. `Terminology`: Precision of industry terms.
9. `Persuasiveness`: Conversion and motivation power.
10. `Naturalness`: Lack of awkward translation syntax.
11. `Localization`: Regional Arabic authenticity.
12. `AISmell`: Degree of AI cliché markers (0 = Pure Human, 100 = Robotic).
13. `Accessibility`: Readability and screen reader friendliness.
14. `SentenceRhythm`: Cadence and length variation of Arabic phrasing.
15. `InformationDensity`: High signal-to-noise ratio without fluff.
16. `LexicalDiversity`: Variety in vocabulary without repetition.
17. `Actionability`: Clear, unambiguous call-to-action direction.
18. `EmotionalPrecision`: Exact alignment with target emotional state.

## Multi-Stage Confidence Object Calculation
Compute individual confidence scores:
- `planner`: Certainty of task classification.
- `diagnosis`: Completeness of 10-dimensional context.
- `knowledge`: Match rate of loaded ontology nodes.
- `generation`: Alignment of draft with prompt constraints.
- `evaluation`: Statistical confidence in rubric scores.
- `overall`: Weighted average of all stages.

Update `WorkingMemory.evaluation_metrics` and `WorkingMemory.confidence`.
