<div align="center">
  <h1>🌐 Arabic AI Skills</h1>
  <p><b>مستودع مفتوح المصدر لمهارات وكلاء الذكاء الاصطناعي باللغة العربية</b></p>

  <p>
    <a href="https://github.com/theonlym7md/arabic-ai-skills/actions"><img src="https://img.shields.io/github/actions/workflow/status/theonlym7md/arabic-ai-skills/ci.yml?branch=main" alt="CI Status" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  </p>
</div>

---

## 📚 عن المشروع

هذا المستودع يحتوي على مجموعة من المهارات (Skills) المصممة خصيصاً لوكلاء الذكاء الاصطناعي (AI Agents) لتأديتهم مهام محددة باللغة العربية بشكل احترافي وواقعي. تم تصميم المستودع بهيكلة Monorepo ليسهل إضافة وإدارة المهارات المتعددة.

### المهارات المتاحة

| المهارة | الوصف | التثبيت |
| :--- | :--- | :--- |
| **[Arabic UX Microcopy](./skills/arabic-ux-microcopy/README.md)** | توجيه الذكاء الاصطناعي لكتابة نصوص واجهات مستخدم متوافقة مع قطاعات محددة (حكومي، إعلامي، تجاري). | `npx skills add theonlym7md/arabic-ai-skills/skills/arabic-ux-microcopy` |

---

## 🏗️ هيكلية المستودع

يعتمد المشروع على هيكلة قياسية لتسهيل التطوير والاختبار:

```text
├── skills/                  # المجلد الأساسي للمهارات
│   └── arabic-ux-microcopy/ # ملفات المهارة (SKILL.md, README.md)
├── tests/                   # اختبارات الجودة
├── AGENTS.md                # قواعد عامة للذكاء الاصطناعي
└── package.json             # إعدادات المشروع و Workspaces
```

## 🤝 المساهمة

نرحب بمساهمات المطورين وكتاب المحتوى لتحسين المهارات الحالية أو إضافة مهارات جديدة.
يرجى قراءة ملف `AGENTS.md` قبل البدء لمعرفة المعايير المطلوبة.
