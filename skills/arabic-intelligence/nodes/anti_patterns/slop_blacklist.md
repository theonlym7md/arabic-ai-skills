---
skill_id: "slop_blacklist"
type: "anti_pattern"
priority: 100 # ABSOLUTE HIGHEST PRIORITY
conflicts_with: ["ALL"]
conflict_resolution:
  strategy: "override"
  target: "ALL"
---
# TEXTUAL ALGORITHM: THE ULTIMATE ANTI-SLOP GOVERNOR

EVALUATION_RULES:
1. ALWAYS scan the generated draft against the BANNED_TERMS list.

BANNED_TERMS:
- "تم" (When used for passive voice e.g. تم الحفظ) -> USE ACTIVE VERB (حفظنا).
- "يرجى" / "الرجاء" -> USE DIRECT IMPERATIVE (أدخل).
- "عزيزي المستفيد" / "العميل" -> USE DIRECT PRONOUN (أنت/طلبك).
- "أوبس" / "حدث خطأ ما" -> USE EMPATHETIC STATEMENT (عذراً، واجهتنا مشكلة).
- "مما لا شك فيه" / "في الختام" -> DELETE ENTIRELY (Plastic structures).

EXECUTION_HEURISTICS:
- IF Draft CONTAINS any BANNED_TERMS:
  ACTION_PROTOCOL:
    1. TRIGGER FATAL ERROR.
    2. ROUTE TO REPAIR PIPELINE.
    3. REWRITE DRAFT WITHOUT BANNED TERMS.
