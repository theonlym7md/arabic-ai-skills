import OpenAI from "openai";
import { buildSystemPrompt } from "./prompt.js";
import { type ArabicCopyResult, ArabicSkillError, type GenerateArabicCopyParams } from "./types.js";
import { validateInputs, validateResult } from "./validate.js";

const resultSchema = {
  type: "object",
  additionalProperties: false,
  required: ["options"],
  properties: {
    options: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "style"],
        properties: {
          text: { type: "string" },
          style: { type: "string" },
        },
      },
    },
  },
} as const;

function sanitizeErrorMessage(raw: string): string {
  const withoutSecrets = raw
    .replace(/\bsk-[A-Za-z0-9_*-]{6,}\b/gu, "[REDACTED_KEY]")
    .replace(/Bearer\s+\S+/giu, "Bearer [REDACTED]");
  if (/<html[\s>]|<!doctype\s+html/iu.test(withoutSecrets)) {
    return "Upstream provider returned an HTML error page.";
  }
  return withoutSecrets.slice(0, 300);
}

function inspectResponseOutput(
  output: unknown,
  fallbackOutputText: unknown,
): {
  refusal?: string | undefined;
  texts: string[];
} {
  const texts: string[] = [];
  let refusal: string | undefined;

  if (Array.isArray(output)) {
    for (const item of output) {
      if (
        !item ||
        typeof item !== "object" ||
        !Array.isArray((item as { content?: unknown }).content)
      ) {
        continue;
      }
      for (const part of (item as { content: unknown[] }).content) {
        if (!part || typeof part !== "object") {
          continue;
        }
        const typed = part as { type?: unknown; refusal?: unknown; text?: unknown };
        if (typed.type === "refusal" && typeof typed.refusal === "string") {
          refusal = typed.refusal.trim() || "Model refused the request.";
        } else if (typed.type === "output_text" && typeof typed.text === "string") {
          const trimmed = typed.text.trim();
          if (trimmed) {
            texts.push(trimmed);
          }
        }
      }
    }
  }

  if (texts.length === 0 && typeof fallbackOutputText === "string" && fallbackOutputText.trim()) {
    texts.push(fallbackOutputText.trim());
  }

  return { refusal, texts };
}

function parseCandidateJson(texts: readonly string[]): unknown {
  const first = texts[0];
  if (texts.length === 1 && first !== undefined) {
    return JSON.parse(first);
  }
  // When multiple output_text parts exist, parse the last valid JSON payload instead of concatenating.
  for (let i = texts.length - 1; i >= 0; i -= 1) {
    const candidate = texts[i];
    if (candidate === undefined) {
      continue;
    }
    try {
      return JSON.parse(candidate);
    } catch {
      // Try earlier part
    }
  }
  const fallback = texts[texts.length - 1] ?? "";
  return JSON.parse(fallback);
}

function toArabicSkillError(error: unknown): ArabicSkillError {
  if (error instanceof ArabicSkillError) {
    return error;
  }

  const candidate = error as {
    status?: unknown;
    code?: unknown;
    name?: unknown;
    message?: unknown;
  };
  const status = typeof candidate?.status === "number" ? candidate.status : undefined;
  const rawMessage = error instanceof Error ? error.message : String(error);
  const safeMessage = sanitizeErrorMessage(rawMessage);

  if (
    candidate?.name === "AbortError" ||
    candidate?.name === "APIConnectionTimeoutError" ||
    /timed?\s*out|abort/iu.test(rawMessage)
  ) {
    return new ArabicSkillError("TIMEOUT", `Failed to generate Arabic copy: ${safeMessage}`, {
      status,
      retryable: true,
      cause: error,
    });
  }

  if (status === 429) {
    return new ArabicSkillError("RATE_LIMIT", `Failed to generate Arabic copy: ${safeMessage}`, {
      status,
      retryable: true,
      cause: error,
    });
  }

  return new ArabicSkillError("PROVIDER_ERROR", `Failed to generate Arabic copy: ${safeMessage}`, {
    status,
    retryable: status !== undefined && status >= 500,
    cause: error,
  });
}

function escapeXmlData(value: string): string {
  return value.replace(/<\/product_data>/giu, "<\\/product_data>");
}

/**
 * Generates natural, context-aware Arabic UI/UX copy using the OpenAI Responses API
 * structured with the ArabicSkill methodology.
 */
export async function generateArabicCopy(
  params: GenerateArabicCopyParams,
): Promise<ArabicCopyResult> {
  const validated = validateInputs(params);

  let client: Pick<OpenAI, "responses">;
  if (params.client) {
    client = params.client;
  } else {
    const resolvedApiKey = validated.apiKey || process.env.OPENAI_API_KEY?.trim();
    if (!resolvedApiKey) {
      throw new ArabicSkillError(
        "CONFIGURATION_ERROR",
        "apiKey must be provided or set via the OPENAI_API_KEY environment variable.",
      );
    }

    client = new OpenAI({
      apiKey: resolvedApiKey,
      ...(validated.baseURL ? { baseURL: validated.baseURL } : {}),
      ...(params.organization ? { organization: params.organization } : {}),
      ...(params.project ? { project: params.project } : {}),
      timeout: validated.timeoutMs,
      maxRetries: validated.maxRetries,
      fetch: (url, init) => globalThis.fetch(url, init),
    });
  }

  const systemPrompt = await buildSystemPrompt({
    fields: {
      primary: [validated.projectNiche, validated.textType].filter(Boolean).join(" "),
      secondary: [validated.targetAudience, validated.region, validated.dialect]
        .filter(Boolean)
        .join(" "),
      context: validated.context,
    },
    region: validated.region,
    dialect: validated.dialect,
    maxLength: validated.maxLength,
    textType: validated.textType,
  });

  const taskData = escapeXmlData(
    JSON.stringify({
      projectNiche: validated.projectNiche,
      targetAudience: validated.targetAudience,
      textType: validated.textType,
      toneOfVoice: validated.toneOfVoice,
      region: validated.region ?? "Unspecified (use clear Modern Standard Arabic)",
      dialect: validated.dialect ?? "Unspecified (use clear Modern Standard Arabic)",
      maxLengthWords: validated.maxLength,
      context: validated.context,
    }),
  );

  const userMessage = `<product_data>\n${taskData}\n</product_data>`;

  const deadlineController = new AbortController();
  const timer = setTimeout(() => {
    deadlineController.abort(
      new Error(`Request exceeded wall-clock timeout (${validated.timeoutMs}ms).`),
    );
  }, validated.timeoutMs);

  const onCallerAbort = () => {
    deadlineController.abort(params.signal?.reason ?? new Error("Request aborted by caller."));
  };

  if (params.signal) {
    if (params.signal.aborted) {
      clearTimeout(timer);
      throw new ArabicSkillError(
        "TIMEOUT",
        "Failed to generate Arabic copy: Request aborted by caller.",
        {
          retryable: false,
          cause: params.signal.reason,
        },
      );
    }
    params.signal.addEventListener("abort", onCallerAbort, { once: true });
  }

  try {
    const response = await client.responses.create(
      {
        model: validated.model,
        instructions: systemPrompt,
        input: userMessage,
        store: validated.store,
        ...(validated.maxOutputTokens !== undefined
          ? { max_output_tokens: validated.maxOutputTokens }
          : {}),
        text: {
          format: {
            type: "json_schema",
            name: "arabic_copy_result",
            strict: true,
            schema: resultSchema,
          },
        },
      },
      { signal: deadlineController.signal },
    );

    if (response.status && response.status !== "completed") {
      const detailParts: string[] = [];
      const incompleteReason = (response as { incomplete_details?: { reason?: unknown } })
        .incomplete_details?.reason;
      const errorCode = (response as { error?: { code?: unknown } }).error?.code;
      if (typeof incompleteReason === "string" && incompleteReason.trim()) {
        detailParts.push(`reason=${incompleteReason.trim()}`);
      }
      if (typeof errorCode === "string" && errorCode.trim()) {
        detailParts.push(`error=${errorCode.trim()}`);
      }
      const suffix = detailParts.length > 0 ? ` (${detailParts.join(", ")})` : "";
      throw new ArabicSkillError(
        "INCOMPLETE_RESPONSE",
        `Failed to generate Arabic copy: The OpenAI response was not completed (${response.status})${suffix}.`,
        { retryable: response.status === "incomplete" },
      );
    }

    const { refusal, texts } = inspectResponseOutput(response.output, response.output_text);
    if (refusal) {
      throw new ArabicSkillError(
        "REFUSAL",
        `Failed to generate Arabic copy: The model refused the request: ${sanitizeErrorMessage(refusal)}`,
        { retryable: false },
      );
    }

    if (texts.length === 0) {
      throw new ArabicSkillError(
        "PROVIDER_ERROR",
        "Failed to generate Arabic copy: The OpenAI API returned no output text.",
        { retryable: true },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseCandidateJson(texts);
    } catch (error) {
      throw new ArabicSkillError(
        "VALIDATION_ERROR",
        `Failed to generate Arabic copy: Malformed JSON output (${sanitizeErrorMessage(
          error instanceof Error ? error.message : String(error),
        )}).`,
        { cause: error },
      );
    }

    try {
      return validateResult(parsed, validated.maxLength, validated.textType, {
        componentKind: validated.componentKind,
        requireArabicScript: validated.requireArabicScript,
      });
    } catch (error) {
      if (error instanceof ArabicSkillError) {
        throw new ArabicSkillError(error.code, `Failed to generate Arabic copy: ${error.message}`, {
          cause: error,
        });
      }
      throw error;
    }
  } catch (error) {
    throw toArabicSkillError(error);
  } finally {
    clearTimeout(timer);
    if (params.signal) {
      params.signal.removeEventListener("abort", onCallerAbort);
    }
  }
}
