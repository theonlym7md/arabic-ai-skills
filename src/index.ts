import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

export interface GenerateArabicCopyParams {
  /**
   * Your OpenAI API key. When omitted, the SDK reads OPENAI_API_KEY.
   */
  apiKey?: string;

  /**
   * Model used by the Responses API. Defaults to OPENAI_MODEL, then gpt-5.4.
   */
  model?: string;

  /**
   * The type of website or platform (e.g. "Ecommerce", "Government", "Creative Studio").
   */
  projectNiche: string;

  /**
   * The target audience (e.g. "Gamers", "Business Owners", "General Public").
   */
  targetAudience: string;

  /**
   * The tone of voice (e.g. "Formal", "Friendly", "Motivational").
   */
  toneOfVoice: string;

  /**
   * The type of text you need (e.g. "Call to Action", "Error Message", "Hero Title").
   */
  textType: string;

  /**
   * The context or intended meaning of the text.
   */
  context: string;

  /**
   * Maximum length of the generated copy in words.
   */
  maxLength?: number;
}

export interface GeneratedOption {
  text: string;
  style: string;
}

export interface ArabicCopyResult {
  options: GeneratedOption[];
}

const resultSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    options: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string", minLength: 1 },
          style: { type: "string", minLength: 1 },
        },
        required: ["text", "style"],
      },
    },
  },
  required: ["options"],
} as const;

function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }
  return normalized;
}

function validateResult(value: unknown, maxLength: number): ArabicCopyResult {
  if (!value || typeof value !== "object" || !Array.isArray((value as ArabicCopyResult).options)) {
    throw new Error("The model returned an invalid ArabicCopyResult.");
  }

  const options = (value as ArabicCopyResult).options;
  if (options.length < 1 || options.length > 3) {
    throw new Error("The model must return between one and three options.");
  }

  for (const option of options) {
    if (!option || typeof option.text !== "string" || typeof option.style !== "string") {
      throw new Error("Each generated option must contain text and style strings.");
    }

    const wordCount = option.text.trim().split(/\s+/u).filter(Boolean).length;
    if (wordCount > maxLength) {
      throw new Error(`A generated option exceeded the ${maxLength}-word limit.`);
    }
  }

  return { options };
}

/**
 * Generates humanized Arabic UX Microcopy based on the given parameters.
 */
export async function generateArabicCopy(
  params: GenerateArabicCopyParams,
): Promise<ArabicCopyResult> {
  const {
    apiKey,
    model = process.env.OPENAI_MODEL ?? "gpt-5.4",
    projectNiche,
    targetAudience,
    toneOfVoice,
    textType,
    context,
    maxLength = 10,
  } = params;

  if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 100) {
    throw new RangeError("maxLength must be an integer between 1 and 100.");
  }

  const normalizedModel = requireText(model, "model");
  const normalizedProjectNiche = requireText(projectNiche, "projectNiche");
  const normalizedTargetAudience = requireText(targetAudience, "targetAudience");
  const normalizedToneOfVoice = requireText(toneOfVoice, "toneOfVoice");
  const normalizedTextType = requireText(textType, "textType");
  const normalizedContext = requireText(context, "context");

  const openai = new OpenAI(apiKey ? { apiKey } : undefined);

  // Load the core system prompt
  let systemPrompt = "";
  try {
    const promptPath = path.join(__dirname, "../skills/arabic-intelligence/SKILL.md");
    systemPrompt = fs.readFileSync(promptPath, "utf-8");
  } catch (error) {
    throw new Error("Failed to load skills/arabic-intelligence/SKILL.md.", { cause: error });
  }

  const userMessage = `
الرجاء صياغة نص واجهة مستخدم (UX Microcopy) بناءً على المعطيات التالية:
- مجال المشروع: ${normalizedProjectNiche}
- الجمهور المستهدف: ${normalizedTargetAudience}
- نبرة الصوت: ${normalizedToneOfVoice}
- نوع النص: ${normalizedTextType}
- السياق والمعنى المطلوب: ${normalizedContext}
- الحد الأقصى للكلمات (Max Length): ${maxLength} كلمات

اكتب من خيار واحد إلى ثلاثة خيارات. اجعل كل خيار مستقلاً ومناسباً للسياق، ولا تتجاوز الحد الأقصى للكلمات.
`;

  try {
    const response = await openai.responses.create({
      model: normalizedModel,
      instructions: systemPrompt,
      input: userMessage,
      text: {
        format: {
          type: "json_schema",
          name: "arabic_copy_result",
          strict: true,
          schema: resultSchema,
        },
      },
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("The OpenAI API returned no output text.");
    }

    return validateResult(JSON.parse(content), maxLength);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate Arabic copy: ${message}`, { cause: error });
  }
}
