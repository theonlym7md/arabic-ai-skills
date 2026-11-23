import { normalizeArabicText } from "./normalize.js";
import {
  RAW_ROUTING_ENTRIES,
  type RawRoutingEntry,
  type SdkRoutingGroup,
} from "./routing.generated.js";
import type { SectionRule } from "./types.js";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function buildArabicTokenPattern(rawKeyword: string): string {
  const normalized = normalizeArabicText(rawKeyword);
  const words = normalized.split(/\s+/u).filter(Boolean);
  if (words.length === 0) {
    return "";
  }

  if (words.length === 1) {
    const token = words[0];
    if (!token) {
      return "";
    }
    // Allow optional Arabic clitics (و/ب/ف/ل/ك + ال) and possessive suffixes on Arabic stems >= 3 chars.
    if (/^[\u0621-\u064A]{3,}$/u.test(token)) {
      const stem = token.startsWith("ال") && token.length >= 5 ? token.slice(2) : token;
      return `(?<![\\p{L}])(?:[وبفلك])?(?:ال)?${escapeRegExp(stem)}(?:ك|كم|نا|ي|ه|ها|هم)?(?![\\p{L}])`;
    }
    return `(?<![\\p{L}])(?:[وبفلك])?(?:ال)?${escapeRegExp(token)}(?![\\p{L}])`;
  }

  const parts = words.map((word) => {
    const stem = word.startsWith("ال") && word.length >= 5 ? word.slice(2) : word;
    if (/^[\u0621-\u064A]{2,}$/u.test(stem)) {
      return `(?:[وبفلك])?(?:ال)?${escapeRegExp(stem)}(?:ك|كم|نا|ي|ه|ها|هم)?`;
    }
    return escapeRegExp(word);
  });
  return `(?<![\\p{L}])${parts.join("\\s+")}(?![\\p{L}])`;
}

function buildEnglishTokenPattern(rawKeyword: string): string {
  const normalized = rawKeyword.trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  const escaped = escapeRegExp(normalized).replace(/\s+/gu, "\\s+");
  return `\\b${escaped}\\b`;
}

function compileEntryRule(entry: RawRoutingEntry): SectionRule {
  const patterns: string[] = [];
  for (const kw of entry.keywords) {
    const p = buildArabicTokenPattern(kw);
    if (p) {
      patterns.push(p);
    }
  }
  for (const kw of entry.englishKeywords) {
    const p = buildEnglishTokenPattern(kw);
    if (p) {
      patterns.push(p);
    }
  }

  const regex = patterns.length > 0 ? new RegExp(patterns.join("|"), "iu") : /$^/u;
  const normalizedExcludes = Object.freeze(
    entry.excludePhrases.map((phrase) => normalizeArabicText(phrase).toLowerCase()).filter(Boolean),
  );

  return Object.freeze({
    domain: entry.domain,
    headingPrefix: entry.section ?? entry.domain,
    keywords: regex,
    excludePhrases: normalizedExcludes,
  });
}

function rulesForGroup(group: SdkRoutingGroup): readonly SectionRule[] {
  return Object.freeze(
    RAW_ROUTING_ENTRIES.filter((entry) => entry.sdkGroup === group).map(compileEntryRule),
  );
}

export const SECTOR_RULES: readonly SectionRule[] = rulesForGroup("sector");
export const UI_FLOW_RULES: readonly SectionRule[] = rulesForGroup("ui_flow");
export const EXPERIENCE_RULES: readonly SectionRule[] = rulesForGroup("experience");
export const SENSITIVE_RULES: readonly SectionRule[] = rulesForGroup("sensitive");
export const LOCALIZATION_RULES: readonly SectionRule[] = rulesForGroup("localization");
export const DIALECT_RULES: readonly SectionRule[] = rulesForGroup("dialects");

export interface WeightedQueryFields {
  readonly primary: string;
  readonly secondary: string;
  readonly context: string;
}

export function stripExcludedPhrases(text: string, excludePhrases: readonly string[]): string {
  let cleaned = normalizeArabicText(text).toLowerCase();
  for (const phrase of excludePhrases) {
    if (cleaned.includes(phrase)) {
      cleaned = cleaned.split(phrase).join(" ");
    }
  }
  return cleaned.replace(/\s+/gu, " ").trim();
}

export function matchWeightedRules(
  rules: readonly SectionRule[],
  fields: WeightedQueryFields,
  maxMatches: number,
): SectionRule[] {
  const scored: { rule: SectionRule; score: number; order: number }[] = [];

  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    if (!rule) {
      continue;
    }
    let score = 0;

    const primaryText = stripExcludedPhrases(fields.primary, rule.excludePhrases);
    if (primaryText && rule.keywords.test(primaryText)) {
      score += 3;
    }

    const secondaryText = stripExcludedPhrases(fields.secondary, rule.excludePhrases);
    if (secondaryText && rule.keywords.test(secondaryText)) {
      score += 2;
    }

    const contextText = stripExcludedPhrases(fields.context, rule.excludePhrases);
    if (contextText && rule.keywords.test(contextText)) {
      score += 1;
    }

    if (score > 0) {
      scored.push({ rule, score, order: index });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.slice(0, maxMatches).map((item) => item.rule);
}
