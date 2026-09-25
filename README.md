# ArabicSkill
مهارة مفتوحة المصدر لكتابة نصوص منتجات عربية طبيعية، وتوطين الواجهات بأمان.

Arabic product writing, localization, and RTL guidance for AI agents.

[![CI](https://github.com/theonlym7md/arabic-ai-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/theonlym7md/arabic-ai-skills/actions/workflows/ci.yml)
[MIT license](LICENSE) · [English guide](docs/GETTING_STARTED.en.md) · [Migration to 2.0](docs/MIGRATION.md)

## ابدأ هنا

```bash
npx skills add theonlym7md/arabic-ai-skills --skill arabicskill
```

ثم اطلب من وكيلك:

> استخدم $arabicskill لتحسين رسالة خطأ دفع. انتهت مهلة الاتصال، ولا نعرف هل خُصم المبلغ. أريد عنوانًا ووصفًا وزرًا للتحقق من الحالة، بفصحى واضحة.

مثال تحريري توضيحي، وليس نتيجة مقارنة تجريبية:

| قبل | بعد |
| --- | --- |
| فشل الدفع. حاول مجددًا. | **لم نتأكد من حالة الدفع بعد.** تحقّق من حالة العملية قبل الدفع مرة أخرى. **الزر: تحقّق من الحالة** |

النص المقترح يفترض وجود إجراء للتحقق من الحالة. لا تختلق المهارة حالة خصم أو سياسة استرداد.

## اختر المهارة

| المهارة | الاستخدام |
| --- | --- |
| [arabicskill](skills/arabicskill/README.md) | كتابة وتدقيق وتوطين نصوص المنتج؛ المتغيرات والجمع وحالات الخطأ الحساسة |
| [arabic-uiux-master](skills/arabic-uiux-master/README.md) | نصوص شاشة كاملة مع إرشادات RTL والمحتوى ثنائي الاتجاه والوصول |

لتثبيت المهارة المرافقة:

```bash
npx skills add theonlym7md/arabic-ai-skills --skill arabic-uiux-master
```

اسم العلامة **ArabicSkill** ومعرّف التثبيت **arabicskill**. استُبدل `arabic-intelligence` في الإصدار 2.0؛ اتبع [دليل الانتقال](docs/MIGRATION.md) لتفادي تشغيل نسختين متعارضتين.

## ما الذي تقدمه؟

- نص عربي مباشر يناسب الجمهور والمنطقة، دون افتراض أن كل جمهور عربي خليجي.
- الحفاظ على مفاتيح الترجمة والمتغيرات ووسوم الرسائل.
- التمييز بين الحالة المؤكدة والمعلقة، خصوصًا في الدفع والحذف.
- أسئلة عند نقص معلومة تغيّر القرار، لا استجواب قبل كل تعديل صغير.
- قواعد مراجعة واضحة وأمثلة مرجعية قابلة للنقد والتحسين.

هي تعليمات لوكيل ذكاء اصطناعي، وليست محركًا يضمن صحة كل ناتج. جودة النتائج تعتمد على النموذج والسياق. لا تقدّم استشارة قانونية أو طبية، ولا تثبت امتثال واجهة أو تفوقًا على مهارات أخرى.

## الجودة والتقييم

```bash
npm ci
npm run check
npm run benchmark
```

الفحوص المحلية تتحقق من البنية والروابط والعقود البرمجية والأمثلة؛ لا تقيس جودة نموذج حي. تشمل حالات المراجعة الدفع المعلق، الأذونات، الحذف، المتغيرات، الجمع، حدود الطول، والمحتوى غير الموثوق. اقرأ [منهجية التقييم](skills/arabicskill/benchmarks/README.md) قبل نشر أي نسبة تحسن.

## التكامل البرمجي الاختياري

للمطورين: Node.js 22 أو 24، ومفتاح `OPENAI_API_KEY` عند تنفيذ طلب حي فقط.

```bash
git clone https://github.com/theonlym7md/arabic-ai-skills.git
cd arabic-ai-skills
npm ci
npm run build
node examples/sdk.cjs
```

راجع [مثال SDK](examples/sdk.cjs) و[حدود التنفيذ](SPEC.md). يرسل التكامل سياق المنتج إلى OpenAI وقد تترتب تكلفة. لا ترسل بيانات شخصية أو سرية. يضبط `store: false` افتراضيًا؛ هذا ليس ضمانًا شاملًا لعدم الاحتفاظ بأي بيانات لدى المزود.

## العرض والمساهمة

[الفيديو التوضيحي السابق — 54 ثانية](https://github.com/theonlym7md/arabic-ai-skills/blob/main/docs/assets/arabic-ai-skills-demo.mp4) يحمل الهوية السابقة ويعرض أمثلة تحريرية، لا اختبار تفوق للنماذج.

- [المساهمة](CONTRIBUTING.md): مثال واقعي منزوع البيانات الحساسة + النتيجة المتوقعة + سبب التحسين.
- [الإبلاغ عن مشكلة](https://github.com/theonlym7md/arabic-ai-skills/issues): أرفق النموذج والمنطقة والسياق والمخرجات بعد تنقيحها.
- [الأمان](SECURITY.md) · [التغييرات](CHANGELOG.md) · [خطة التطوير](ROADMAP.md).

هدفنا أن تستحق ArabicSkill ثقة المستخدمين العرب بنتائج قابلة للمراجعة، لا بادعاء المركز الأول.
