# End-to-End Execution Trace Example

This document demonstrates an explicit end-to-end execution of a user prompt through the 10-stage decision loop.

## 1. Input Request
> "اكتب نص حالة فارغة لصفحة المخالفات المرورية في تطبيق حكومي سعودي."

---

## 2. Decision Graph Trace

```json
{
  "PlanningContext": {
    "TaskType": "Microcopy / UX",
    "goals": ["Reassure user of clean record", "Provide clear status confirmation"],
    "constraints": ["Max 15 words total", "No passive voice", "No panicky red banners"],
    "risks": ["User assumes system failed to load fines"],
    "success_criteria": ["HumanScore > 90", "AISmell < 5", "Trust > 95"],
    "required_knowledge": ["saudi_govtech", "empty_state_heuristics"],
    "execution_strategy": "Use calm, authoritative language asserting clean record."
  },
  "ReasoningContext": {
    "diagnostics": {
      "Domain": "GovTech",
      "Audience": "Saudi Citizens & Residents",
      "Intent": "Check Fines Status",
      "EmotionalGoal": "Reassured / Relieved",
      "ProductType": "Mobile App Empty State",
      "TrustLevel": "Critical",
      "ReadingLevel": "Simple",
      "Region": "KSA",
      "Constraints": ["Max 15 words"],
      "MissingContextKeys": []
    },
    "current_draft": "سجلك خالي من المخالفات. لا توجد أي مخالفات مرورية مسجلة بحقك حالياً."
  },
  "KnowledgeContext": {
    "entities_loaded": [
      {
        "entity": "saudi_govtech",
        "confidence": 0.98,
        "priority": 100,
        "reason": "Matches Domain == GovTech and Region == KSA",
        "dependencies": ["saudi_terminology_standard"]
      }
    ]
  },
  "EvaluationContext": {
    "metrics": {
      "HumanScore": 96,
      "Trust": 98,
      "CognitiveLoad": 95,
      "Clarity": 98,
      "Tone": 95,
      "Brand": 95,
      "ReadingFlow": 94,
      "Terminology": 98,
      "Persuasiveness": 85,
      "Naturalness": 96,
      "Localization": 98,
      "AISmell": 2,
      "Accessibility": 95,
      "SentenceRhythm": 92,
      "InformationDensity": 90,
      "LexicalDiversity": 88,
      "Actionability": 90,
      "EmotionalPrecision": 95
    },
    "confidence": {
      "planner": 0.98,
      "diagnosis": 0.98,
      "knowledge": 0.98,
      "generation": 0.95,
      "evaluation": 0.96,
      "overall": 0.97
    }
  },
  "trace": [
    {
      "stage": "Stage 0 — Planning",
      "decision": "Formulated GovTech Empty State Strategy",
      "why": "Empty state requires immediate reassurance without ambiguity.",
      "knowledge_used": ["saudi_govtech"],
      "alternatives_rejected": ["Marketing promotion strategy"],
      "confidence": 0.98,
      "duration_ms": 10
    },
    {
      "stage": "Stage 1 — Diagnose",
      "decision": "Extracted 10 dimensions. MissingContextKeys count (0) <= 2.",
      "why": "Context is complete.",
      "knowledge_used": [],
      "alternatives_rejected": [],
      "confidence": 0.98,
      "duration_ms": 12
    },
    {
      "stage": "Stage 5 — Knowledge Selection",
      "decision": "Loaded 'saudi_govtech' entity node",
      "why": "Highest priority match for Domain == GovTech.",
      "knowledge_used": ["saudi_govtech"],
      "alternatives_rejected": ["generic_ecommerce_empty_state"],
      "confidence": 0.98,
      "duration_ms": 18
    },
    {
      "stage": "Stage 8 — Evaluation",
      "decision": "Passed all evaluation metrics. AISmell score (2) < Dynamic Threshold (5).",
      "why": "Text is natural, concise, and direct.",
      "knowledge_used": [],
      "alternatives_rejected": [],
      "confidence": 0.96,
      "duration_ms": 15
    }
  ]
}
```

---

## 3. Final Output
- **العنوان:** "سجلك خالي من المخالفات"
- **الوصف:** "لا توجد أي مخالفات مرورية مسجلة بحقك حالياً. نتمنى لك قيادة آمنة."
