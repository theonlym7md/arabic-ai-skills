---
skill_id: "fintech_trust"
type: "cognitive_node"
priority: 8
operational_weights:
  confidence: 90
  clarity: 100
  creativity: 30
semantic_tags: 
  - "fintech"
  - "ecommerce"
  - "trust"
---
# TEXTUAL ALGORITHM: FINTECH TRUST (التقنية المالية والتجارة)

EVALUATION_RULES:
1. IF Audience == "B2B":
   -> APPLY_PROTOCOL: Institutional_Trust
2. IF Audience == "B2C":
   -> APPLY_PROTOCOL: Speed_And_Frictionless

EXECUTION_HEURISTICS:
- PROTOCOL: Institutional_Trust
  ACTIONS:
    1. INJECT keywords: "امتثال", "بنية تحتية", "أمان".
    2. SET tone to Authoritative (Partner).
    3. USE Low-Commitment CTAs (e.g., "اطلب عرضاً توضيحياً" NOT "اشتر الآن").

- PROTOCOL: Speed_And_Frictionless
  ACTIONS:
    1. INJECT keywords: "بثواني", "بدون رسوم خفية".
    2. SET tone to Helpful Friend.
    3. APPLY "Labor Illusion" in loading states (e.g., "نقوم بتشفير بياناتك...").
