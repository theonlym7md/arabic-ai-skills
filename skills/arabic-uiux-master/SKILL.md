---
name: arabic-uiux-master
description: "Arabic reasoning framework for UX writing, product communication, and microcopy masterclass."
version: 1.2.0
---

# 🎨 Arabic UI/UX Masterclass & Microcopy Engine

This skill package implements the Arabic Intelligence Guided Reasoning Specification to generate natural, localized Arabic UX microcopy, product interfaces, and digital content.

## Execution Rules & Formal Stage Contracts

Every stage in the 10-Stage Decision Graph adheres to a formal protocol interface contract:

- **Stage 0 (Planning):** `Consumes: Prompt` | `Produces: PlanningContext` | `Mutates: None` | `SideEffects: None` | `Idempotent: true`
- **Stage 1 (Diagnose):** `Consumes: PlanningContext` | `Produces: ReasoningContext.diagnostics` | `Mutates: ReasoningContext` | `SideEffects: Ask user if MissingKeys > 2` | `Idempotent: true`
- **Stage 5 (Knowledge):** `Consumes: diagnostics` | `Produces: KnowledgeContext` | `Mutates: KnowledgeContext` | `SideEffects: Reads knowledge/entities & plugins/` | `Idempotent: true`
- **Stage 8 (Evaluation):** `Consumes: ReasoningContext.current_draft` | `Produces: EvaluationContext` | `Mutates: EvaluationContext` | `SideEffects: None` | `Idempotent: true`
- **Stage 9 (Repair):** `Consumes: EvaluationContext` | `Produces: Revised Draft` | `Mutates: ReasoningContext.current_draft` | `SideEffects: Rewinds to Stage 6 (Max 2 Loops)` | `Idempotent: false`

## Decoupled Execution Contexts

```json
{
  "PlanningContext": {
    "TaskType": "", "goals": [], "constraints": [], "assumptions": [],
    "risks": [], "success_criteria": [], "required_knowledge": [], "execution_strategy": ""
  },
  "ReasoningContext": {
    "diagnostics": {
      "Domain": "", "Audience": "", "Intent": "", "EmotionalGoal": "",
      "ProductType": "", "TrustLevel": "", "ReadingLevel": "",
      "Region": "", "Constraints": [], "MissingContextKeys": []
    },
    "current_draft": ""
  },
  "KnowledgeContext": {
    "entities_loaded": [
      { "entity": "", "confidence": 0.0, "priority": 0, "reason": "", "dependencies": [] }
    ]
  },
  "EvaluationContext": {
    "metrics": {
      "HumanScore": 0, "Trust": 0, "CognitiveLoad": 0, "Clarity": 0,
      "Tone": 0, "Brand": 0, "ReadingFlow": 0, "Terminology": 0,
      "Persuasiveness": 0, "Naturalness": 0, "Localization": 0,
      "AISmell": 0, "Accessibility": 0,
      "SentenceRhythm": 0, "InformationDensity": 0,
      "LexicalDiversity": 0, "Actionability": 0, "EmotionalPrecision": 0
    },
    "confidence": { "planner": 0.0, "diagnosis": 0.0, "knowledge": 0.0, "generation": 0.0, "evaluation": 0.0, "overall": 0.0 }
  }
}
```

---

## 🚫 قائمة محظورات الذكاء الاصطناعي (AI Slop Blacklist)

```diff
- ❌ "في إطار حرصنا المستمر على تقديم أفضل الخدمات..."
+ ✅ "سجلك خالي من المخالفات" (مباشر، فعال)

- ❌ "يرجى التكرم بالعلم بأنه قد تم إتمام العملية بنجاح..."
+ ✅ "تم الدفع بنجاح" (كلمتان تؤديان المعنى)

- ❌ "يسعدنا ويشرفنا خدمتكم في هذه البوابة الإلكترونية..."
+ ✅ "مرحباً بك في المنصة"

- ❌ "يرجى التكرم بالانتظار لحين معالجة البيانات..."
+ ✅ "جاري جلب البيانات..."
```

---

## 📚 قاموس المصطلحات التفاعلية والنصوص الميكروية (Sector Microcopy Lexicon)

### أ) القطاع الحكومي (GovTech)
- **حالة المخالفات الفارغة:** "سجلك خالي من المخالفات"
- **زر إتمام الطلب:** "أتمم الطلب"
- **تأكيد الهوية الوطنية:** "أدخل رقم الهوية الوطنية"
- **حالة الانتظار:** "جاري مراجعة الطلب..."

### ب) التقنية المالية والتجارة (FinTech & Payments)
- **فشل الدفع (Payment Error):** "تعذر استكمال عملية الدفع — يرجى التأكد من توفر الرصيد أو استخدام بطاقة أخرى."
- **زر الدفع الفوري (CTA):** "ادفع الآن — 150 ر.س"
- **التقسيط والدفع اللاحق:** "قسمها على 4 دفعات بدون فوائد"

### ج) التجارة الإلكترونية والـ SaaS
- **زر البدء (Hero CTA):** "ابدأ تجربتك المجانية"
- **السلة الفارغة:** "سلتك تنتظر خياراتك المفضلة"
- **الاشتراك السنوي:** "وفر 20% عند الاختيار السنوي"

---

## 📐 قواعد التصميم البصري والـ RTL والـ Typography

1. **محاذاة النص:** المحاذاة الافتراضية للنصوص والعناوين تكون لليمين (`text-align: right`).
2. **الأيقونات والتنقل:** تعكيس أيقونات الاتجاه تلقائياً في الواجهات العربية.
3. **الخطوط المعتمدة:** `Inter`, `Cairo`, `Tajawal`, `Outfit`.
