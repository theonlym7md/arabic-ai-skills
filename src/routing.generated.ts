// AUTO-GENERATED from skills/arabicskill/knowledge/relations/routing.yaml
// Do not edit directly; run `node scripts/build_routing.js`.

export type SdkRoutingGroup =
  | "sector"
  | "ui_flow"
  | "experience"
  | "sensitive"
  | "localization"
  | "dialects"
  | "agent_only";

export interface RawRoutingEntry {
  readonly domain: string;
  readonly reference: string;
  readonly section: string | null;
  readonly sdkGroup: SdkRoutingGroup;
  readonly regionScope: readonly string[];
  readonly keywords: readonly string[];
  readonly englishKeywords: readonly string[];
  readonly excludePhrases: readonly string[];
}

export const RAW_ROUTING_ENTRIES: readonly RawRoutingEntry[] = Object.freeze(
  ([
  {
    "domain": "Media",
    "reference": "references/sector-patterns.md",
    "section": "1. الإعلام والمحتوى",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "بودكاست",
      "حلقة",
      "حلقات",
      "مقال",
      "مقالات",
      "نشرة",
      "فيديو",
      "مكتبة محتوى",
      "برنامج صوتي",
      "تشغيل الحلقة",
      "اعلام",
      "إعلامي",
      "صحفي",
      "توثيقي"
    ],
    "englishKeywords": [
      "podcast",
      "episode",
      "article",
      "newsletter",
      "media",
      "editorial",
      "audio",
      "video"
    ],
    "excludePhrases": [
      "التهاب الحلق",
      "الم الحلق",
      "اعلام المستخدم",
      "إعلام المستخدم"
    ]
  },
  {
    "domain": "Gaming",
    "reference": "references/sector-patterns.md",
    "section": "2. الألعاب والتجارب الاجتماعية",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "لعبة",
      "العاب",
      "جولة",
      "جولات",
      "لاعب",
      "لاعبون",
      "غرفة لعب",
      "تحدي",
      "بطولة",
      "نقاط اللعبة",
      "جماعي"
    ],
    "englishKeywords": [
      "game",
      "gaming",
      "player",
      "match",
      "multiplayer",
      "tournament",
      "leaderboard"
    ],
    "excludePhrases": [
      "جولات سياحية",
      "جولة خاصة",
      "جولة إرشادية",
      "نقاط الولاء",
      "نقاط البيع"
    ]
  },
  {
    "domain": "GovTech",
    "reference": "references/sector-patterns.md",
    "section": "3. الخدمات الحكومية والمدنية",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "حكومي",
      "حكومية",
      "مخالفات",
      "مخالفة",
      "رخصة",
      "ترخيص",
      "تصريح",
      "معاملة",
      "سجل تجاري",
      "استحقاق",
      "مدني",
      "وزاري",
      "بلدية"
    ],
    "englishKeywords": [
      "govtech",
      "government",
      "civic",
      "permit",
      "license",
      "municipality",
      "ministry",
      "violation"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Saudi_GovTech",
    "reference": "references/sector-patterns.md",
    "section": "3. الخدمات الحكومية والمدنية",
    "sdkGroup": "agent_only",
    "regionScope": [
      "SA",
      "KSA",
      "Saudi Arabia",
      "السعودية"
    ],
    "keywords": [
      "بلدي",
      "ناجز",
      "نفاذ",
      "سدايا",
      "أبشر",
      "صحتي",
      "بوابة حكومية سعودية"
    ],
    "englishKeywords": [
      "saudi govtech",
      "balady",
      "najiz",
      "nafath",
      "absher",
      "sdaia"
    ],
    "excludePhrases": []
  },
  {
    "domain": "E-Commerce",
    "reference": "references/sector-patterns.md",
    "section": "4. منصات التجار والتجارة الإلكترونية",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "متجر",
      "تاجر",
      "تجار",
      "تجارة إلكترونية",
      "بطاقة منتج",
      "منتجات",
      "سلة",
      "شحن",
      "إرجاع",
      "تخفيض",
      "مشتريات",
      "طلبات متأخرة",
      "طلبات العملاء",
      "نقطة بيع",
      "مخزون"
    ],
    "englishKeywords": [
      "ecommerce",
      "e-commerce",
      "merchant",
      "shop",
      "cart",
      "checkout",
      "shipping",
      "product card",
      "retail"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Travel",
    "reference": "references/sector-patterns.md",
    "section": "5. السفر والسياحة والثقافة والضيافة",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "سفر",
      "سياحة",
      "وجهة",
      "فندق",
      "فنادق",
      "إقامة فندقية",
      "فعالية",
      "فعاليات",
      "ورشة",
      "معرض",
      "تذكرة سفر",
      "تذاكر",
      "طيران",
      "رحلة جوية",
      "حجز تذاكر",
      "متحف"
    ],
    "englishKeywords": [
      "travel",
      "tourism",
      "hotel",
      "flight",
      "airline",
      "hospitality",
      "booking",
      "event",
      "museum",
      "itinerary"
    ],
    "excludePhrases": [
      "رحلة المستخدم",
      "تذكرة دعم",
      "تجديد الإقامة",
      "إقامة سارية",
      "بطاقة الإقامة"
    ]
  },
  {
    "domain": "FinTech",
    "reference": "references/sector-patterns.md",
    "section": "6. التقسيط والتمويل والاستثمار",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "دفع",
      "تمويل",
      "تقسيط",
      "أقساط",
      "استثمار",
      "عائد",
      "دفعات",
      "خطة دفعات",
      "بوابة مدفوعات",
      "مدفوعات",
      "رسوم",
      "بطاقة ائتمانية",
      "محفظة رقمية",
      "تحويل بنكي",
      "بنك",
      "مصرفي",
      "فاتورة"
    ],
    "englishKeywords": [
      "fintech",
      "finance",
      "payment",
      "payments",
      "installment",
      "bnpl",
      "investment",
      "loan",
      "banking",
      "wallet",
      "billing"
    ],
    "excludePhrases": [
      "الرسوم البيانية",
      "رسوم بيانية",
      "رسوم توضيحية",
      "رسوم متحركة",
      "رسوم كاريكاتيرية",
      "بطاقة منتج",
      "بطاقة تعريف"
    ]
  },
  {
    "domain": "Luxury",
    "reference": "references/sector-patterns.md",
    "section": "7. العلامات الفاخرة والضيافة الراقية والتجارب الحصرية",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "فاخر",
      "فاخرة",
      "فخامة",
      "حصري",
      "حصرية",
      "كونسيرج",
      "ضيافة راقية",
      "منتجع",
      "أجنحة خاصة",
      "دعوة خاصة",
      "مجوهرات",
      "عطور فاخرة",
      "نخبة"
    ],
    "englishKeywords": [
      "luxury",
      "concierge",
      "private suite",
      "bespoke",
      "exclusive",
      "resort",
      "boutique"
    ],
    "excludePhrases": []
  },
  {
    "domain": "SaaS",
    "reference": "references/sector-patterns.md",
    "section": "8. البرمجيات السحابية ومنصات الأعمال (B2B SaaS)",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "مساحة عمل",
      "لوحة تحكم",
      "مقاعد",
      "صلاحيات الفريق",
      "أدوار",
      "مدير الفوترة",
      "فترة تجريبية",
      "سجل تدقيق",
      "مفاتيح API",
      "دعوة أعضاء",
      "مهام الفريق",
      "إعدادات الحساب"
    ],
    "englishKeywords": [
      "saas",
      "b2b",
      "workspace",
      "dashboard",
      "rbac",
      "seats",
      "quota",
      "webhook",
      "api key",
      "audit log",
      "team invite",
      "trial"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Healthcare",
    "reference": "references/sector-patterns.md",
    "section": "9. الرعاية الصحية والتطبيقات الطبية (Healthcare)",
    "sdkGroup": "sector",
    "regionScope": [],
    "keywords": [
      "صحي",
      "صحية",
      "طبي",
      "طبية",
      "عيادة",
      "مستشفى",
      "تشخيص",
      "دواء",
      "وصفة طبية",
      "موعد طبي",
      "نتيجة الفحص",
      "تحاليل",
      "أعراض",
      "استشارة طبية",
      "مريض"
    ],
    "englishKeywords": [
      "healthcare",
      "medical",
      "clinic",
      "patient",
      "diagnosis",
      "lab result",
      "triage",
      "prescription",
      "telehealth"
    ],
    "excludePhrases": []
  },
  {
    "domain": "AI_Chat",
    "reference": "references/ui-flows.md",
    "section": "1. واجهات الذكاء الاصطناعي والمحادثة",
    "sdkGroup": "ui_flow",
    "regionScope": [],
    "keywords": [
      "ذكاء اصطناعي",
      "مساعد ذكي",
      "محادثة ذكية",
      "توليد نص",
      "إعادة التوليد",
      "تلخيص ذكي",
      "بحث دلالي",
      "تدفق الرد",
      "هلوسة"
    ],
    "englishKeywords": [
      "ai assistant",
      "chatbot",
      "llm",
      "generative",
      "streaming response",
      "hallucination",
      "copilot",
      "ai uncertainty"
    ],
    "excludePhrases": [
      "نص مساعد",
      "ملخص الطلب",
      "order summary"
    ]
  },
  {
    "domain": "Auth_Security",
    "reference": "references/ui-flows.md",
    "section": "2. المصادقة والأمان ورموز التحقق (OTP / 2FA)",
    "sdkGroup": "ui_flow",
    "regionScope": [],
    "keywords": [
      "رمز تحقق",
      "رمز التحقق",
      "تسجيل دخول",
      "مصادقة",
      "مفاتيح المرور",
      "كلمة مرور",
      "قفل مؤقت",
      "تجاوز المحاولات",
      "تحقق ثنائي"
    ],
    "englishKeywords": [
      "otp",
      "2fa",
      "mfa",
      "passkey",
      "passkeys",
      "login",
      "sign in",
      "authentication",
      "verification code",
      "password"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Form_Validation",
    "reference": "references/ui-flows.md",
    "section": "3. تحقق النماذج المضمن (Inline Form Validation)",
    "sdkGroup": "ui_flow",
    "regionScope": [],
    "keywords": [
      "تحقق مضمن",
      "تحقق سطري",
      "حقل نموذج",
      "صيغة الرقم",
      "آيبان",
      "رقم آيبان",
      "إدخال غير صحيح",
      "حقل اختياري",
      "بريد إلكتروني غير صالح"
    ],
    "englishKeywords": [
      "inline validation",
      "form validation",
      "field error",
      "iban",
      "input format",
      "optional field"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Accessibility_Microcopy",
    "reference": "references/ui-flows.md",
    "section": "4. إتاحة الوصول في النصوص (Accessibility Microcopy)",
    "sdkGroup": "ui_flow",
    "regionScope": [],
    "keywords": [
      "إتاحة الوصول",
      "قارئ الشاشة",
      "نص بديل",
      "صورة بديلة",
      "وصف بديل",
      "لوحة المفاتيح",
      "تباين لوني"
    ],
    "englishKeywords": [
      "accessibility",
      "a11y",
      "wcag",
      "aria-label",
      "screen reader",
      "alt text",
      "keyboard focus"
    ],
    "excludePhrases": [
      "إتاحة الخدمة",
      "إتاحة المنتج",
      "إتاحة الموعد",
      "اتاحة الخدمة"
    ]
  },
  {
    "domain": "Error_Recovery",
    "reference": "references/ui-flows.md",
    "section": "5. استرداد الأخطاء ومرونة النظام (Error Recovery & Resilience)",
    "sdkGroup": "ui_flow",
    "regionScope": [],
    "keywords": [
      "انقطاع الاتصال",
      "بدون إنترنت",
      "فشل الشبكة",
      "انتهاء الجلسة",
      "تجاوز الحد",
      "فشل جزئي",
      "تراجع",
      "خدمة غير متوفرة"
    ],
    "englishKeywords": [
      "offline",
      "network error",
      "session expired",
      "rate limit",
      "403",
      "404",
      "429",
      "503",
      "partial failure",
      "undo"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Notifications_Onboarding",
    "reference": "references/ui-flows.md",
    "section": "6. الإشعارات والتهيئة التمهيدية (Notifications & Onboarding)",
    "sdkGroup": "ui_flow",
    "regionScope": [],
    "keywords": [
      "إشعار فوري",
      "شاشة القفل",
      "رسالة نصية",
      "إشعارات",
      "تهيئة المستخدم",
      "شاشة الترحيب",
      "خطوات البداية"
    ],
    "englishKeywords": [
      "push notification",
      "lock screen",
      "sms notification",
      "whatsapp notification",
      "onboarding checklist",
      "welcome flow"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Account_Deletion",
    "reference": "references/sensitive-states.md",
    "section": "الحذف",
    "sdkGroup": "sensitive",
    "regionScope": [],
    "keywords": [
      "حذف الحساب",
      "إلغاء الحساب",
      "حذف نهائي",
      "حذف المشروع",
      "أرشفة",
      "إزالة الحساب"
    ],
    "englishKeywords": [
      "delete account",
      "deletion",
      "permanent delete",
      "archive",
      "deactivate account"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Payments_Uncertain",
    "reference": "references/sensitive-states.md",
    "section": "الدفع والاشتراكات",
    "sdkGroup": "sensitive",
    "regionScope": [],
    "keywords": [
      "حالة الدفع",
      "انتهت مهلة",
      "مهلة الاتصال",
      "خصم المبلغ",
      "استرداد",
      "إلغاء الاشتراك",
      "معاملة معلقة"
    ],
    "englishKeywords": [
      "payment status",
      "uncertain payment",
      "payment timeout",
      "charge status",
      "refund",
      "cancel subscription",
      "pending payment"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Permissions_Privacy",
    "reference": "references/sensitive-states.md",
    "section": "الأذونات والخصوصية",
    "sdkGroup": "sensitive",
    "regionScope": [],
    "keywords": [
      "طلب إذن",
      "إذن الموقع",
      "أذونات",
      "خصوصية",
      "تتبع",
      "صلاحية الوصول",
      "الكاميرا",
      "ملفات الارتباط"
    ],
    "englishKeywords": [
      "permission",
      "location permission",
      "privacy",
      "tracking",
      "consent",
      "cookies"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Localization",
    "reference": "references/localization.md",
    "section": null,
    "sdkGroup": "localization",
    "regionScope": [],
    "keywords": [
      "توطين",
      "ملف ترجمة",
      "صيغ الجمع",
      "متغيرات",
      "عزل الاتجاه",
      "ثنائي الاتجاه",
      "تقويم هجري"
    ],
    "englishKeywords": [
      "json",
      "icu",
      "plural",
      "plurals",
      "cldr",
      "placeholder",
      "variables",
      "rtl",
      "bidi",
      "bdi",
      "localization",
      "i18n"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Dialects",
    "reference": "references/dialects.md",
    "section": null,
    "sdkGroup": "dialects",
    "regionScope": [],
    "keywords": [
      "لهجة",
      "عامية",
      "سعودية",
      "مصرية",
      "شامية",
      "لبنانية",
      "أردنية",
      "مغربية",
      "دارجة",
      "خليجية"
    ],
    "englishKeywords": [
      "dialect",
      "colloquial",
      "egyptian",
      "saudi",
      "levantine",
      "moroccan",
      "gulf",
      "regional tone"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Page_Design",
    "reference": "references/design-decisions.md",
    "section": null,
    "sdkGroup": "agent_only",
    "regionScope": [],
    "keywords": [
      "تصميم صفحة",
      "بنية الشاشة",
      "تكوين الصفحة",
      "صفحة هبوط",
      "مقارنة بديلين",
      "تخطيط الشاشة"
    ],
    "englishKeywords": [
      "page layout",
      "screen structure",
      "landing page",
      "information architecture",
      "layout alternatives"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Headings_Identity",
    "reference": "references/experience-patterns.md",
    "section": "1. العناوين، التنوع البصري، ومنع التكرار",
    "sdkGroup": "experience",
    "regionScope": [],
    "keywords": [
      "عنوان رئيسي",
      "عنوان بطاقة",
      "نقطة ختامية",
      "ترقيم العناوين",
      "شخصية بصرية",
      "ترويسة"
    ],
    "englishKeywords": [
      "hero heading",
      "card title",
      "terminal period",
      "heading punctuation",
      "visual archetype"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Auth_Gateways",
    "reference": "references/experience-patterns.md",
    "section": "2. أنماط تسجيل الدخول والمصادقة (6 أشكال قابلة للاختيار)",
    "sdkGroup": "experience",
    "regionScope": [],
    "keywords": [
      "بوابة دخول",
      "تسجيل دخول",
      "تصفح كضيف",
      "دخول برمز QR",
      "بوابة الفئات",
      "هوية وطنية"
    ],
    "englishKeywords": [
      "auth gateway",
      "login screen",
      "sign-in flow",
      "guest checkout",
      "qr login",
      "sso"
    ],
    "excludePhrases": []
  },
  {
    "domain": "Checkout_Pricing",
    "reference": "references/experience-patterns.md",
    "section": "3. أنماط الدفع، السلة، التقسيط، والتسعير (6 أشكال قابلة للاختيار)",
    "sdkGroup": "experience",
    "regionScope": [],
    "keywords": [
      "بوابة دفع",
      "إتمام الدفع",
      "تقسيط",
      "سلة التسوق",
      "شحن مجاني",
      "إهداء",
      "مقارنة الباقات",
      "تسعير",
      "باقة سنوية",
      "ضمان وسيط"
    ],
    "englishKeywords": [
      "checkout",
      "payments",
      "pricing table",
      "split-pay",
      "installments",
      "cart progress",
      "gift delegation",
      "escrow",
      "annual plan"
    ],
    "excludePhrases": [
      "على مدى",
      "مدى الحياة",
      "توفير الوقت",
      "توفير الجهد"
    ]
  },
  {
    "domain": "Discovery_Forms",
    "reference": "references/experience-patterns.md",
    "section": "4. أنماط الاكتشاف، الحجز، وبناء النماذج",
    "sdkGroup": "experience",
    "regionScope": [],
    "keywords": [
      "توجيه الطلب",
      "استمارة متعددة",
      "خريطة تفاعلية",
      "محدد الموقع",
      "وصّل هنا",
      "تصفية النتائج",
      "قائمة انتظار",
      "خلايا التقويم"
    ],
    "englishKeywords": [
      "intent router",
      "multi-step form",
      "map view",
      "location picker",
      "waitlist",
      "filter drawer",
      "calendar availability"
    ],
    "excludePhrases": [
      "موقعك الإلكتروني",
      "موقع الويب",
      "الموقع الإلكتروني"
    ]
  },
  {
    "domain": "Media_Accessibility",
    "reference": "references/experience-patterns.md",
    "section": "5. أنماط الإعلام والمحتوى العميق وإتاحة الوصول",
    "sdkGroup": "experience",
    "regionScope": [],
    "keywords": [
      "مدة القراءة",
      "مشغل الصوت",
      "تبويبات الصفحة",
      "استمع للمقال",
      "الشفافية التحريرية"
    ],
    "englishKeywords": [
      "reading time",
      "audio player",
      "sticky player",
      "editorial transparency"
    ],
    "excludePhrases": []
  },
  {
    "domain": "UX_Pitfalls",
    "reference": "references/experience-patterns.md",
    "section": "6. أخطاء تجربة حقيقية مرصودة يجب تجنّبها",
    "sdkGroup": "experience",
    "regionScope": [],
    "keywords": [
      "انقلاب الترقيم",
      "نافذة الكوكيز",
      "اتجاه الأسهم",
      "مفاتيح خام",
      "بقايا برمجية"
    ],
    "englishKeywords": [
      "bidi punctuation",
      "cookie banner",
      "rtl arrows",
      "raw translation keys"
    ],
    "excludePhrases": [
      "نقاط الولاء",
      "نقاط البيع"
    ]
  }
] as RawRoutingEntry[]).map((entry) =>
    Object.freeze({
      ...entry,
      regionScope: Object.freeze([...entry.regionScope]),
      keywords: Object.freeze([...entry.keywords]),
      englishKeywords: Object.freeze([...entry.englishKeywords]),
      excludePhrases: Object.freeze([...entry.excludePhrases]),
    }),
  ),
);
