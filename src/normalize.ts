import type { ComponentKind } from "./types.js";

const DANGEROUS_BIDI_RE = /[\u202A-\u202E\u2066-\u2069]/u;

function hasDisallowedC0Control(text: string, allowNewlines: boolean): boolean {
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code === 0x7f) {
      return true;
    }
    if (code <= 0x1f) {
      if (allowNewlines && (code === 0x09 || code === 0x0a || code === 0x0d)) {
        continue;
      }
      return true;
    }
  }
  return false;
}

export function normalizeArabicText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\p{Mn}\p{Cf}\u0640]/gu, "")
    .replace(/[أإآٱ]/gu, "ا")
    .replace(/ة/gu, "ه")
    .replace(/ى/gu, "ي")
    .replace(/\s+/gu, " ")
    .trim();
}

export function stripInvisibleAndFormat(text: string): string {
  return text.replace(/[\s\p{Cf}\u200B\uFEFF]/gu, "");
}

export function containsDangerousControlOrBidi(text: string, allowNewlines = false): boolean {
  if (DANGEROUS_BIDI_RE.test(text)) {
    return true;
  }
  return hasDisallowedC0Control(text, allowNewlines);
}

const ENGLISH_BODY_RE =
  /\b(?:description|body|paragraphs?|explanation|details?|message|disclaimer|disclosure|subcopy|subtitle\s+paragraph|notice|instructions?|summary|note|terms)\b/iu;

const ENGLISH_SHORT_LABEL_HEAD_RE =
  /^(?:(?:page|hero|section|card|main|screen|modal|dialog|empty[- ]state|form|nav|navigation|tab|list|short|item|primary|secondary|submit|action|header|footer|status|input|field|error|step|menu|banner|pricing|checkout|login|signup|sign[- ]in|auth|toast|alert|badge|button|cta|modal|chip|pill)\s+)*(?:h[1-6]|headings?|headlines?|subheadings?|titles?|subtitles?|headers?|badges?|tags?|chips?|pills?|labels?|tabs?|cta(?:\s+(?:buttons?|labels?|text|copy))?|buttons?(?:\s+(?:labels?|text|copy))?|calls?[- ]to[- ]action(?:\s+(?:buttons?|labels?|text|copy))?|links?(?:\s+(?:labels?|text|copy))?|status(?:es)?(?:\s+(?:badges?|labels?|titles?))?|nav(?:igation)?\s+(?:items?|labels?|titles?)|tab\s+(?:labels?|titles?)|list\s+titles?)(?:\s*\(h[1-6]\))?$/iu;

const ARABIC_BODY_MARKER_RE =
  /(?<![\p{L}])(?:و)?(?:ال)?(?:وصف|وصفي[\p{L}]*|تفاصيل|تفصيلي[\p{L}]*|توضيح|توضيحي[\p{L}]*|شرح|فقره|فقرات|محتوي|رساله|افصاح|تنبيه|ملاحظه|ملاحظات|نص\s+(?:تعريفي|توضيحي|فرعي|وصفي|طويل|كامل)|تعليمات|شروط|شرط|ملخص|اشعار|جمله|جمل|خطا\s+دفع)(?![\p{L}])/u;

const ARABIC_SHORT_LABEL_RE =
  /^(?:(?:ال)?(?:عنوان|عناوين|عنوان\s+فرعي|عنوان\s+رئيسي|عنوان\s+قسم|عنوان\s+بطاقه|عنوان\s+حقل|عنوان\s+شاشه|عنوان\s+صفحه|عنوان\s+خطا|عنوان\s+قائمه|تسميه|تسميه\s+حقل|تسميه\s+زر|تسميات|ترويسه|زر|زر\s+اجراء|زر\s+رئيسي|زر\s+ثانوي|زر\s+اساسي|زر\s+دخول|زر\s+دفع|زر\s+اشتراك|زر\s+تشغيل|زر\s+متابعه|ازرار|شاره|شاره\s+حاله|شاره\s+توفير|شارات|وسم|وسوم|بطاقه\s+(?:حاله|تصنيف|ميزه|عنوان|باقه)|تبويب|تبويبات|عنصر\s+تنقل|عناصر\s+(?:ال)?تنقل|رابط\s+(?:اجراء|تنقل)|نص\s+(?:ال)?(?:زر|رابط|شاره|تبويب)|دعوه\s+(?:الي|ل|لاتخاذ)\s+(?:ال)?اجراء))(?:\s+(?:ال)?(?:رئيسي|فرعي|اساسي|ثانوي|حقل|زر|بطاقه|قسم|شاشه|صفحه|اجراء|حاله|توفير|تنقل|خطا|قائمه|قصير|قصيره|دخول|دفع|اشتراك|متجر|باقه|عرض|موقع|حساب|تطبيق|منتج|خدمه|h[1-6]))*$/iu;

const ARABIC_STANDALONE_HEAD_RE = /^(?:ال)?(?:عنوان|زر|ازرار|شاره|شارات|وسم|تسميه|تبويب|ترويسه)$/u;

export function classifyTextType(textType: string, explicitKind?: ComponentKind): ComponentKind {
  if (explicitKind) {
    return explicitKind;
  }

  const trimmed = textType.trim().replace(/\s+/gu, " ");
  const normalizedAr = normalizeArabicText(trimmed);

  const hasEnglishBody = ENGLISH_BODY_RE.test(trimmed);
  const hasArabicBody = ARABIC_BODY_MARKER_RE.test(normalizedAr);
  const isBareEnglishCopy =
    /\bcopy\b/iu.test(trimmed) &&
    !/\b(?:cta|button|call[- ]to[- ]action|heading|headline|title|label|badge|tab|link)\s+copy\b/iu.test(
      trimmed,
    );

  const hasBody = hasEnglishBody || hasArabicBody || isBareEnglishCopy;

  const isEnglishShort = ENGLISH_SHORT_LABEL_HEAD_RE.test(trimmed);
  const isArabicShort =
    ARABIC_SHORT_LABEL_RE.test(normalizedAr) || ARABIC_STANDALONE_HEAD_RE.test(normalizedAr);

  if (
    hasBody &&
    (isEnglishShort || isArabicShort || /(?:^|\s)(?:عنوان|title|heading)/iu.test(normalizedAr))
  ) {
    return "compound";
  }
  if (hasBody) {
    return "body";
  }
  if (isEnglishShort || isArabicShort) {
    return "short_label";
  }
  return "body";
}

const TERMINAL_PERIOD_LINE_RE =
  /[.\u06D4\u2026\uFF0E](?=(?:[\p{Cf}\s«»"”'’)\]}*_`~\p{Emoji_Presentation}\p{Extended_Pictographic}]|\uFE0F|\u200D)*$)/u;

export function hasTerminalShortLabelPeriod(text: string): boolean {
  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.some((line) => TERMINAL_PERIOD_LINE_RE.test(line));
}
