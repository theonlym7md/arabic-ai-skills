---
skill_id: "pain_of_paying"
type: "mental_model"
priority: 10
semantic_tags: ["payment", "checkout", "conversion"]
---
# TEXTUAL ALGORITHM: PAIN OF PAYING

MODEL: MENTAL_ACCOUNTING
INPUT_STATE: "Context (Checkout, Pricing, Cart)"

EVALUATION_RULES:
1. IF User is about to pay OR see a price:
   -> SET STATE: High_Friction

EXECUTION_HEURISTICS:
- IF STATE == High_Friction:
  ACTION_PROTOCOL:
    1. APPLY CHUNKING: Do not present the total sum if installments are available. (e.g. say "قسّمها" instead of "ادفع 400").
    2. INJECT ZERO-RISK BIAS: Explicitly state "بدون فوائد" or "بدون رسوم خفية".
    3. TRIGGER ENDOWMENT EFFECT: Refer to the item as already belonging to the user (e.g. "مشترياتك" instead of "المنتجات").
