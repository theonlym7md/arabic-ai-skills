# Semantic Routing Index (خريطة التوجيه الدلالي)

## Concept
Do not read all 400 files in this system. That is a waste of context and tokens. Instead, use this Semantic Router to know exactly which files to fetch based on the Context and Intent.

## 1. Core Engine (Always Load)
Every session MUST load these files to build the Memory and Reasoning Pipeline:
- `1_memory/user_model.md`
- `1_memory/project_model.md`
- `2_reasoning_chains/logic_paths.md`
- `5_evaluation/scorecards.md`

## 2. Dynamic Domain Routing (التوجيه حسب القطاع)
Based on the `Project_Model`, load ONLY ONE of the following domain rules:
- IF `Domain = GovTech` -> Load `3_knowledge_graph/domain_rules/authority_gov.md`
- IF `Domain = FinTech/E-commerce` -> Load `3_knowledge_graph/domain_rules/conversion_fintech.md`
- IF `Domain = Media/GenZ` -> Load `3_knowledge_graph/domain_rules/disruptor_media.md`
- IF `Domain = Tourism/Luxury` -> Load `3_knowledge_graph/domain_rules/hospitality_tourism.md`

## 3. Dynamic Intent Routing (التوجيه حسب نية المستخدم)
Based on what the user is asking you to write, load the relevant UI heuristic:
- IF `Intent = Write a Button / CTA` -> Load `2_reasoning_chains/ux_decision_trees.md`
- IF `Intent = Write an Error Message or Empty State` -> Load `3_knowledge_graph/zero_states_heuristics.md`

## 4. Communication Layer (التوجيه اللغوي)
When it is time to write, ALWAYS load the purification laws to prevent AI-slop:
- `4_communication/anti_slop_laws.md`
- `4_communication/cognitive_pacing.md`

## The Execution Order
1. **Load Core Engine** -> Build mental model.
2. **Load Domain Rule** -> Understand the brand voice.
3. **Load Intent Rule** -> Understand the UI psychology.
4. **Load Communication Layer** -> Apply linguistic constraints.
5. **Evaluate** -> Run the scorecard.
