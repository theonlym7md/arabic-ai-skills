import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export interface GenerateArabicCopyParams {
  /**
   * Your OpenAI API Key.
   */
  apiKey: string;

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

/**
 * Generates humanized Arabic UX Microcopy based on the given parameters.
 */
export async function generateArabicCopy(params: GenerateArabicCopyParams): Promise<ArabicCopyResult> {
  const {
    apiKey,
    projectNiche,
    targetAudience,
    toneOfVoice,
    textType,
    context,
    maxLength = 10,
  } = params;

  const openai = new OpenAI({ apiKey });

  // Load the core system prompt
  let systemPrompt = '';
  try {
    const promptPath = path.join(__dirname, '..', 'SKILL.md');
    systemPrompt = fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    throw new Error('Failed to load SKILL.md. Make sure it is located in the root of the package.');
  }

  const userMessage = `
الرجاء صياغة نص واجهة مستخدم (UX Microcopy) بناءً على المعطيات التالية:
- مجال المشروع (Project Niche): ${projectNiche}
- الجمهور المستهدف (Target Audience): ${targetAudience}
- نبرة الصوت (Tone of Voice): ${toneOfVoice}
- نوع النص (Text Type): ${textType}
- السياق/المعنى المطلوب (Context): ${context}
- الحد الأقصى للكلمات (Max Length): ${maxLength} كلمات

أعد النتيجة كـ JSON يحتوي على مصفوفة options كما هو موضح في القواعد.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Can be customized
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content) as ArabicCopyResult;
    return parsed;
  } catch (error) {
    throw new Error(`Failed to generate Arabic copy: ${error}`);
  }
}
