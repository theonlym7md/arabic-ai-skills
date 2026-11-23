const TRAILING_PERIOD_RE =
  /[.\u06D4\u2026\uFF0E](?=(?:[\p{Cf}\s«»"”'’)\]}*_`~\p{Emoji_Presentation}\p{Extended_Pictographic}]|\uFE0F|\u200D)*$)/u;

const SHORT_LABEL_LINE_RE =
  /^\s*(?:[-*]\s*)?(?:\*\*)?(?:العنوان|عنوان الشاشة|عنوان الحقل|الزر|الأزرار|زر التشغيل|زر المتابعة|زر الاشتراك|الإجراء(?:\s+(?:الأساسي|الثانوي|البديل))?|الشارة|شارة الحالة|بطاقة الخيار|الحالة|تلميح الإدخال|خيار بديل)(?:\*\*)?:\s*(.+)$/u;

const SHORT_TABLE_COMPONENT_RE =
  /^(?:العنوان|عنوان الشاشة الرئيسي|عنوان الحقل|الشارة|شارة الحالة|الزر|الزر الأساسي|الإجراء الأساسي|الإجراء الثانوي|الإجراء البديل|بطاقة خطة الدفع \(العنوان\)|شارة التوفير|زر الاشتراك|زر التشغيل|زر المتابعة|خيار بديل)$/u;

function normalizeArabic(text) {
  return String(text)
    .normalize("NFC")
    .replace(/[\p{Mn}\p{Cf}\u0640]/gu, "")
    .replace(/[أإآٱ]/gu, "ا")
    .replace(/ة/gu, "ه")
    .replace(/ى/gu, "ي");
}

function hasTrailingShortLabelPeriod(text) {
  return String(text)
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .some((line) => TRAILING_PERIOD_RE.test(line));
}

function findShortLabelPeriodViolations(markdown) {
  const violations = [];
  for (const rawLine of String(markdown).split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const labelMatch = line.match(SHORT_LABEL_LINE_RE);
    if (labelMatch) {
      const value = labelMatch[1].trim();
      const segments = value.split(/\s*·\s*/u);
      if (segments.some((seg) => TRAILING_PERIOD_RE.test(seg.trim()))) {
        violations.push({ kind: "label", line, value });
      }
      continue;
    }

    const tableMatch = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/u);
    if (tableMatch) {
      const component = tableMatch[1].trim();
      const copy = tableMatch[2].trim();
      if (SHORT_TABLE_COMPONENT_RE.test(component) && TRAILING_PERIOD_RE.test(copy)) {
        violations.push({ kind: "table", component, line, value: copy });
      }
    }
  }
  return violations;
}

module.exports = {
  TRAILING_PERIOD_RE,
  SHORT_LABEL_LINE_RE,
  SHORT_TABLE_COMPONENT_RE,
  normalizeArabic,
  hasTrailingShortLabelPeriod,
  findShortLabelPeriodViolations,
};
