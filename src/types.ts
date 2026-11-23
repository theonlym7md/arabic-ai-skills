import type OpenAI from "openai";

export type ComponentKind = "short_label" | "body" | "compound";

export type ArabicSkillErrorCode =
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR"
  | "REFUSAL"
  | "INCOMPLETE_RESPONSE"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "PROVIDER_ERROR";

export class ArabicSkillError extends Error {
  readonly code: ArabicSkillErrorCode;
  readonly status?: number | undefined;
  readonly retryable: boolean;

  constructor(
    code: ArabicSkillErrorCode,
    message: string,
    options?: { status?: number | undefined; retryable?: boolean | undefined; cause?: unknown },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "ArabicSkillError";
    this.code = code;
    this.status = options?.status;
    this.retryable = options?.retryable ?? false;
  }
}

export interface SectionRule {
  readonly domain: string;
  readonly headingPrefix: string;
  readonly keywords: RegExp;
  readonly excludePhrases: readonly string[];
}

export interface GenerateArabicCopyParams {
  /**
   * The niche or domain of the project (e.g., "FinTech", "E-Commerce", "SaaS", "GovTech").
   */
  projectNiche: string;
  /**
   * The target audience description (e.g., "Saudi tech-savvy youth", "Arab business executives").
   */
  targetAudience: string;
  /**
   * The type of UI copy needed (e.g., "CTA Button", "Empty State", "Error Message", "Landing Page Headline").
   */
  textType: string;
  /**
   * The desired tone of voice (e.g., "Friendly", "Formal & Official", "Modern & Direct").
   */
  toneOfVoice: string;
  /**
   * Additional context, constraints, or the English text to localize.
   */
  context: string;
  /**
   * Optional explicit component classification overriding heuristic textType detection.
   */
  componentKind?: ComponentKind;
  /**
   * Optional target region or market (e.g., "Saudi Arabia", "Egypt", "Levant", "Morocco").
   */
  region?: string;
  /**
   * Optional dialect preference when explicitly requested (default is clear Modern Standard Arabic).
   */
  dialect?: string;
  /**
   * Maximum word count allowed for the generated copy (defaults to 10 words, max 100).
   */
  maxLength?: number;
  /**
   * Optional OpenAI API key. If not provided, falls back to process.env.OPENAI_API_KEY.
   */
  apiKey?: string;
  /**
   * Optional OpenAI-compatible API base URL (HTTPS required by default).
   * Falls back to process.env.OPENAI_BASE_URL if set.
   */
  baseURL?: string;
  /**
   * Explicitly allow http://localhost or http://127.0.0.1 baseURL for local testing.
   */
  allowInsecureBaseURL?: boolean;
  /**
   * Optional OpenAI organization ID.
   */
  organization?: string;
  /**
   * Optional OpenAI project ID.
   */
  project?: string;
  /**
   * Optional OpenAI model override. Falls back to process.env.OPENAI_MODEL or "gpt-5.4".
   */
  model?: string;
  /**
   * Optional OpenAI Responses API storage toggle (defaults to false for privacy).
   */
  store?: boolean;
  /**
   * Optional AbortSignal for cancelling an in-flight request.
   */
  signal?: AbortSignal;
  /**
   * Total wall-clock timeout in milliseconds across attempts (default 30000, range 100..120000).
   */
  timeoutMs?: number;
  /**
   * Maximum retries on transient errors (default 1, range 0..3).
   */
  maxRetries?: number;
  /**
   * Optional cap on model output tokens (range 64..4096).
   */
  maxOutputTokens?: number;
  /**
   * Require generated options to contain Arabic script characters (defaults to true).
   */
  requireArabicScript?: boolean;
  /**
   * Optional pre-configured OpenAI client instance for dependency injection / multi-tenant pooling.
   */
  client?: Pick<OpenAI, "responses">;
}

export interface ArabicCopyOption {
  text: string;
  style: string;
}

export interface ArabicCopyResult {
  options: ArabicCopyOption[];
}
