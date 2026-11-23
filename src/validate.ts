import {
  classifyTextType,
  containsDangerousControlOrBidi,
  hasTerminalShortLabelPeriod,
  stripInvisibleAndFormat,
} from "./normalize.js";
import {
  type ArabicCopyOption,
  type ArabicCopyResult,
  ArabicSkillError,
  type ComponentKind,
  type GenerateArabicCopyParams,
} from "./types.js";

const ARABIC_SCRIPT_RE = /\p{Script=Arabic}/u;

export function countWords(text: string): number {
  return text.split(/\s+/u).filter(Boolean).length;
}

export function requireText(
  value: unknown,
  field: string,
  maxCharacters: number,
  allowNewlines = false,
): string {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }
  if (normalized.length > maxCharacters) {
    throw new RangeError(`${field} must be at most ${maxCharacters} characters.`);
  }
  if (containsDangerousControlOrBidi(normalized, allowNewlines)) {
    throw new ArabicSkillError(
      "VALIDATION_ERROR",
      `${field} contains disallowed control or BiDi override characters.`,
    );
  }
  return normalized;
}

function isLocalhostHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return lower === "localhost" || lower === "127.0.0.1" || lower === "::1" || lower === "[::1]";
}

function isBlockedMetadataHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/^\[|\]$/gu, "");
  if (
    lower === "metadata.google.internal" ||
    lower === "metadata" ||
    lower === "fd00:ec2::254" ||
    lower.startsWith("fe80:") ||
    lower.startsWith("169.254.") ||
    lower.startsWith("::ffff:169.254.") ||
    lower.startsWith("::ffff:a9fe:")
  ) {
    return true;
  }
  return false;
}

export function validateBaseUrl(
  rawUrl: string | undefined,
  allowInsecureBaseURL = false,
): string | undefined {
  if (rawUrl === undefined) {
    return undefined;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return undefined;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (error) {
    throw new ArabicSkillError("CONFIGURATION_ERROR", "baseURL must be a valid URL.", {
      cause: error,
    });
  }

  if (parsed.username || parsed.password) {
    throw new ArabicSkillError(
      "CONFIGURATION_ERROR",
      "baseURL must not contain embedded credentials.",
    );
  }

  if (isBlockedMetadataHost(parsed.hostname)) {
    throw new ArabicSkillError(
      "CONFIGURATION_ERROR",
      "baseURL points to a blocked link-local or cloud metadata address.",
    );
  }

  if (parsed.protocol === "https:") {
    return trimmed;
  }

  if (parsed.protocol === "http:" && allowInsecureBaseURL && isLocalhostHost(parsed.hostname)) {
    return trimmed;
  }

  throw new ArabicSkillError(
    "CONFIGURATION_ERROR",
    "baseURL must use https:// (or localhost http:// with allowInsecureBaseURL: true).",
  );
}

export interface ValidatedInputs {
  readonly projectNiche: string;
  readonly targetAudience: string;
  readonly textType: string;
  readonly toneOfVoice: string;
  readonly context: string;
  readonly region?: string | undefined;
  readonly dialect?: string | undefined;
  readonly componentKind?: ComponentKind | undefined;
  readonly maxLength: number;
  readonly store: boolean;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly maxOutputTokens?: number | undefined;
  readonly requireArabicScript: boolean;
  readonly model: string;
  readonly apiKey?: string | undefined;
  readonly baseURL?: string | undefined;
}

export function validateInputs(params: GenerateArabicCopyParams): ValidatedInputs {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    throw new TypeError("params must be an object.");
  }

  if (params.store !== undefined && typeof params.store !== "boolean") {
    throw new TypeError("store must be a boolean.");
  }

  let explicitApiKey: string | undefined;
  if (params.apiKey !== undefined) {
    if (typeof params.apiKey !== "string" || !params.apiKey.trim()) {
      throw new TypeError("apiKey must be a non-empty string.");
    }
    explicitApiKey = params.apiKey.trim();
  }

  const maxLength = params.maxLength ?? 10;
  if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 100) {
    throw new RangeError("maxLength must be an integer between 1 and 100.");
  }

  const timeoutMs = params.timeoutMs ?? 30_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 120_000) {
    throw new RangeError("timeoutMs must be an integer between 100 and 120000.");
  }

  const maxRetries = params.maxRetries ?? 1;
  if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 3) {
    throw new RangeError("maxRetries must be an integer between 0 and 3.");
  }

  let maxOutputTokens: number | undefined;
  if (params.maxOutputTokens !== undefined) {
    if (
      !Number.isInteger(params.maxOutputTokens) ||
      params.maxOutputTokens < 64 ||
      params.maxOutputTokens > 4096
    ) {
      throw new RangeError("maxOutputTokens must be an integer between 64 and 4096.");
    }
    maxOutputTokens = params.maxOutputTokens;
  }

  if (
    params.componentKind !== undefined &&
    params.componentKind !== "short_label" &&
    params.componentKind !== "body" &&
    params.componentKind !== "compound"
  ) {
    throw new TypeError('componentKind must be "short_label", "body", or "compound".');
  }

  const projectNiche = requireText(params.projectNiche, "projectNiche", 200);
  const targetAudience = requireText(params.targetAudience, "targetAudience", 300);
  const textType = requireText(params.textType, "textType", 200);
  const toneOfVoice = requireText(params.toneOfVoice, "toneOfVoice", 200);
  const context = requireText(params.context, "context", 4000, true);
  const region =
    params.region !== undefined ? requireText(params.region, "region", 100) : undefined;
  const dialect =
    params.dialect !== undefined ? requireText(params.dialect, "dialect", 100) : undefined;

  const envModel = process.env.OPENAI_MODEL?.trim();
  const model =
    params.model !== undefined ? requireText(params.model, "model", 100) : envModel || "gpt-5.4";

  const resolvedBaseUrl = validateBaseUrl(
    params.baseURL ?? process.env.OPENAI_BASE_URL,
    params.allowInsecureBaseURL ?? false,
  );

  return {
    projectNiche,
    targetAudience,
    textType,
    toneOfVoice,
    context,
    region,
    dialect,
    componentKind: params.componentKind,
    maxLength,
    store: params.store ?? false,
    timeoutMs,
    maxRetries,
    maxOutputTokens,
    requireArabicScript: params.requireArabicScript ?? true,
    model,
    apiKey: explicitApiKey,
    baseURL: resolvedBaseUrl,
  };
}

export function validateResult(
  value: unknown,
  maxLength: number,
  textType: string,
  options?: {
    componentKind?: ComponentKind | undefined;
    requireArabicScript?: boolean | undefined;
  },
): ArabicCopyResult {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !Array.isArray((value as ArabicCopyResult).options)
  ) {
    throw new ArabicSkillError(
      "VALIDATION_ERROR",
      "The model returned an invalid ArabicCopyResult.",
    );
  }

  if (Object.keys(value).some((key) => key !== "options")) {
    throw new ArabicSkillError("VALIDATION_ERROR", "The model returned unexpected properties.");
  }

  const rawOptions = (value as ArabicCopyResult).options;
  if (rawOptions.length < 1 || rawOptions.length > 3) {
    throw new ArabicSkillError(
      "VALIDATION_ERROR",
      "The model must return between one and three options.",
    );
  }

  const kind = classifyTextType(textType, options?.componentKind);
  const maxTextChars = Math.max(160, maxLength * 24);
  const requireArabic = options?.requireArabicScript ?? true;

  const seenText = new Set<string>();
  const normalizedOptions: ArabicCopyOption[] = [];

  for (const option of rawOptions) {
    if (
      !option ||
      typeof option !== "object" ||
      typeof option.text !== "string" ||
      typeof option.style !== "string"
    ) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        "Each generated option must contain text and style strings.",
      );
    }
    if (Object.keys(option).some((key) => key !== "text" && key !== "style")) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        "A generated option contains unexpected properties.",
      );
    }

    const text = option.text.trim();
    const style = option.style.trim();
    if (!stripInvisibleAndFormat(text) || !stripInvisibleAndFormat(style)) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        "Generated option text and style must not be empty.",
      );
    }

    if (
      containsDangerousControlOrBidi(text, kind !== "short_label") ||
      containsDangerousControlOrBidi(style, false)
    ) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        "Generated option contains disallowed control or BiDi override characters.",
      );
    }

    if (text.length > maxTextChars) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        `Generated option text exceeded maximum character ceiling (${maxTextChars} characters).`,
      );
    }

    if (style.length > 100) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        "Generated option style exceeded 100 characters.",
      );
    }

    if (requireArabic && !ARABIC_SCRIPT_RE.test(text)) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        "Generated option text must contain Arabic script.",
      );
    }

    if (!seenText.has(text)) {
      seenText.add(text);
      normalizedOptions.push({ text, style });
    }
  }

  const withinLimit = normalizedOptions.filter((option) => countWords(option.text) <= maxLength);
  if (withinLimit.length === 0) {
    throw new ArabicSkillError(
      "VALIDATION_ERROR",
      `Every generated option exceeded the maximum word limit (${maxLength} words).`,
    );
  }

  const validOptions =
    kind === "short_label"
      ? withinLimit.filter((option) => !hasTerminalShortLabelPeriod(option.text))
      : withinLimit;

  if (validOptions.length === 0) {
    throw new ArabicSkillError(
      "VALIDATION_ERROR",
      normalizedOptions.length > withinLimit.length
        ? `No generated option both met the ${maxLength}-word limit and omitted a terminal period.`
        : "Every generated option for this UI label ends in a terminal period.",
    );
  }

  return { options: validOptions };
}
