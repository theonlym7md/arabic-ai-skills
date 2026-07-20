---
skill_id: "cta_reward"
type: "heuristic"
priority: 9
semantic_tags: ["cta", "buttons", "conversion"]
---
# TEXTUAL ALGORITHM: CTA REWARD FRAMING

EVALUATION_RULES:
1. IF generating a Call-to-Action (Button text):
   -> SET STATE: CTA_Generation

EXECUTION_HEURISTICS:
- IF STATE == CTA_Generation:
  ACTION_PROTOCOL:
    1. VALIDATE: Does the text answer the user's internal thought "I want to..."?
    2. RULE: Never use TASK-based verbs (سجل, إرسال, تأكيد). Tasks cause friction.
    3. RULE: Only use REWARD-based verbs (أنشئ, ابدأ, اكتشف, استمع). Rewards trigger dopamine.
    4. CONSTRAINT: Maximum 2 words.
