# Benchmark Test Suite

This directory contains deterministic test prompts and golden reference outputs to benchmark framework revisions.

## Benchmark Test Cases

### 1. `benchmarks/govtech/traffic_violations_empty_state.md`
- **Prompt:** "اكتب نص حالة فارغة لصفحة المخالفات المرورية في تطبيق حكومي سعودي بدون أي مخالفات."
- **Target Metrics:**
  - `HumanScore`: > 90
  - `Trust`: > 95
  - `AISmell`: < 5
  - `Clarity`: > 95
- **Golden Reference:**
  - **العنوان:** "سجلك خالي من المخالفات"
  - **الوصف:** "لا توجد أي مخالفات مرورية مسجلة بحقك حالياً. نتمنى لك قيادة آمنة دائماً."
  - **الزر:** "عرض تفاصيل الخصر والقيادة"

### 2. `benchmarks/fintech/checkout_payment_retry.md`
- **Prompt:** "اكتب رسالة خطأ عند فشل عملية الدفع ببطاقة ائتمانية في تطبيق تقنية مالية سعودي مع زر المحاولة."
- **Target Metrics:**
  - `Trust`: > 98
  - `Clarity`: > 95
  - `CognitiveLoad`: > 90
  - `AISmell`: < 10
- **Golden Reference:**
  - **العنوان:** "تعذر استكمال عملية الدفع"
  - **الوصف:** "لم نتمكن من خصم المبلغ من بطاقتك. يرجى التأكد من توفر الرصيد أو استخدام بطاقة أخرى."
  - **الزر الرئيسي:** "إعادة المحاولة"
  - **الزر الفرعي:** "اختيار طريقة دفع أخرى"
