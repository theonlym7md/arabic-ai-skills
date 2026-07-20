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
| **[Arabic UX Masterclass System (Knowledge Ecosystem)](./skills/arabic-ux-microcopy/README.md)** | أضخم نظام معرفي (Knowledge System) مبني على سيكولوجيا المستخدم، يحاكي عقل فريق كامل من كتاب الـ UX وعلماء اللغة لإنتاج نصوص واجهات لا تشوبها لغة الآلة، مع 4 محركات هوية (حكومي، إعلامي، تجارة، ضيافة). | `npx skills add theonlym7md/arabic-ai-skills/skills/arabic-ux-microcopy` |

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

## 🤝 سياسة المساهمة والحقوق (Contribution & Copyright)

هذا المشروع **مفتوح المصدر (Open Source) للاستخدام العام**؛ يحق لأي شخص أو جهة استخدام المهارة وتثبيتها في وكلائهم أو مشاريعهم الخاصة مجاناً.

**ولكن، يمنع التعديل على النواة الأساسية للنظام:**
للحفاظ على الجودة العالية، الدقة السيكولوجية، والهيكلية المعمارية لـ "Arabic UX Masterclass"، فإن **صلاحية التعديل، الإضافة، أو الحذف في ملفات المهارة محصورة حصرياً بمؤسس المشروع**.
*   لن يتم قبول أي طلبات سحب (Pull Requests) تقترح تغييرات على محركات الهوية (Brand Engines) أو محركات الكتابة (Writing Engines).
*   إذا كان لديك اقتراح مهم، يمكنك فتح تذكرة (Issue) للمناقشة، وسيقرر المؤسس إضافتها من عدمه.
