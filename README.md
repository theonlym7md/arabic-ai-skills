<div align="center">
  <img src="https://via.placeholder.com/150x150/111111/ffffff?text=AI+Skills" alt="Arabic AI Skills Repository" width="150" height="150" />
  <h1>🌐 Arabic AI Skills Monorepo</h1>
  <p><b>The Enterprise-Grade Repository for World-Class Arabic AI Agent Skills</b></p>

  <p>
    <a href="https://github.com/theonlym7md/arabic-ai-skills/actions"><img src="https://img.shields.io/github/actions/workflow/status/theonlym7md/arabic-ai-skills/ci.yml?branch=main" alt="CI Status" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
    <img src="https://img.shields.io/badge/Architecture-Monorepo-blueviolet" alt="Monorepo Architecture" />
  </p>
</div>

---

## 📚 مرحباً بك في الدستور (The Catalog)

هذا المستودع ليس مهارة واحدة، بل هو **مكتبة متكاملة (Monorepo)** مصممة لتزويد وكلاء الذكاء الاصطناعي (AI Agents) بأقوى المهارات العربية المتخصصة. نحن نبني المهارات هنا وفقاً لمعايير Enterprise لضمان أقصى جودة.

### المهارات المتاحة حالياً (Available Skills)

| المهارة | الوصف | القطاعات المدعومة | التثبيت السريع |
| :--- | :--- | :--- | :--- |
| **[Arabic UX Microcopy](./skills/arabic-ux-microcopy/README.md)** | أول محرك UX عربي مزود بآلة حالة ذكية. | حكومي، إعلامي، تجارة | `npx skills add theonlym7md/arabic-ai-skills/skills/arabic-ux-microcopy` |
| *(قريباً)* **Arabic FinTech UX** | متخصص في تجربة البنوك والتقنية المالية. | بنوك، مدفوعات | - |

---

## 🏗️ هيكلية المستودع (Repository Structure)

صُمم هذا المستودع ليطابق أعلى معايير الجودة المتبعة في مستودعات `vercel-labs` و `anthropics`:

```text
├── .github/workflows/       # مسارات عمل الفحص الآلي (CI/CD)
├── skills/                  # المجلد الأساسي للمهارات المستقلة
│   └── arabic-ux-microcopy/ # كل مهارة تمتلك SKILL.md و README.md الخاص بها
├── tests/                   # اختبارات الجودة الأوتوماتيكية
├── scripts/                 # سكريبتات مساعدة للنشر والتغليف
├── AGENTS.md                # إرشادات التعامل مع الذكاء الاصطناعي (Agent Rules)
└── package.json             # نظام الـ Workspaces
```

## 🤝 كيف تساهم؟ (Contributing)
نحن نبحث عن عباقرة الـ UX والمطورين لإضافة مهارات جديدة!
1. أنشئ مجلداً جديداً داخل `skills/`.
2. التزم بكتابة `SKILL.md` مفصل يحتوي على آلة حالة (State Machine).
3. اقرأ دليل `AGENTS.md` لفهم كيفية برمجة الذكاء الاصطناعي.
