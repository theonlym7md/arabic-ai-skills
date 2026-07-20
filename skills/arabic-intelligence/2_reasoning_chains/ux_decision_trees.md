# UI Psychology: CTA Decision Tree (هندسة أزرار الإجراء)

## Concept
A CTA (Call to Action) is not just a button; it is the culmination of the user's decision-making process. The words on the CTA must match the user's intent and lower their anxiety about clicking.

## The CTA Decision Tree

```mermaid
graph TD
    A[Determine Context & User Need] --> B{What is the platform sector?}
    
    B -->|Tourism & Hospitality| C[Focus on Emotion & Discovery]
    B -->|GovTech & Official| D[Focus on Empowerment & Reliability]
    B -->|FinTech & E-commerce| E[Focus on Value & Friction Removal]

    C --> C1{Requires Financial Commitment?}
    C1 -->|Yes| C2[Reassuring words: احجز الآن, أكمل الدفع]
    C1 -->|No| C3[Motivating words: اكتشف الوجهات, ابدأ التخطيط]

    D --> D1{Is it Registration or Information?}
    D1 -->|Registration| D2[Empowering words: بادر بالتسجيل, انضم للبرنامج]
    D1 -->|Information| D3[استعرض التقرير, اكتشف مبادراتنا]

    E --> E1{What is the core action?}
    E1 -->|Adding to Cart| E2[أضف للسلة - Simple, non-committal]
    E1 -->|Final Payment| E3[ادفع الآن - Direct, clear expectation]
    E1 -->|Subscription/SaaS| E4[ابدأ مجاناً, أنشئ متجرك - Focus on value, not the 'Sign Up' effort]
```

## Anti-Patterns (The "Never Use" List)
Do NOT use these words on buttons. They are translated, boring, and increase friction:
*   ❌ **إرسال (Submit):** Too technical. Sounds like a database operation. Use "تأكيد" or "انضم الآن".
*   ❌ **تقديم (Submit/Apply):** Ambiguous. Use "قدم طلبك" or "أرسل الطلب".
*   ❌ **دفع (Pay):** Naked and scary. Frame it contextually (e.g., "أكمل الدفع", "ادفع بأمان").

## The "Value vs. Effort" Rule
Always write CTAs that highlight the **Value** the user gets, not the **Effort** they have to put in.
*   *Effort (Bad):* "سجل حساباً جديداً" (Requires work).
*   *Value (Good):* "ابدأ رحلتك معنا" or "أنشئ متجرك مجاناً" (Promises a result).
