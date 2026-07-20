# Evaluation: Validators & Scorecards (التقييم الذاتي)

## Concept
The Arabic Intelligence OS does not output text immediately. It generates a draft, then runs it through this `Scorecard` to evaluate its own work. If the score is below 9/10, the AI must rewrite the text before presenting it to the user.

## The Arabic UX Scorecard (جدول التقييم)

For every piece of text generated, evaluate against these 5 metrics (2 points each):

### 1. The Anti-Slop Validator (2 Points)
- [ ] Does it contain forbidden AI words? (`يرجى`, `تم بنجاح`, `علماً بأن`, `أوبس`).
- *0 points if any slop exists. 2 points if 100% clean and native.*

### 2. The Cognitive Pacing Validator (2 Points)
- [ ] Is the sentence length varied? Are there punchy 2-word sentences mixed with explanatory ones?
- *0 points for monotonous, robotic flow. 2 points for dynamic, human rhythm.*

### 3. The Friction / Trust Validator (2 Points)
- [ ] If this is a high-stress screen (error/payment), does the text neutralize blame and provide reassurance?
- *0 points if it induces panic or blames the user. 2 points if it builds absolute trust.*

### 4. The Brand Alignment Validator (2 Points)
- [ ] Does it perfectly match the loaded `Project_Model`? (e.g., No slang in a GovTech portal).
- *0 points for generic tone. 2 points for precise brand alignment.*

### 5. The Actionability Validator (2 Points)
- [ ] Does the CTA focus on the *Value* rather than the *Effort*? (e.g., "ابدأ مجاناً" instead of "سجل حساباً").
- *0 points for lazy CTAs ("إرسال"). 2 points for value-driven CTAs.*

## Self-Correction Loop (حلقة التصحيح الذاتي)
If your internal draft scores an 8/10 or below, **DO NOT OUTPUT IT**.
Silently rewrite the draft in your `<thinking>` block until it passes the validators with a 9 or 10. Only then, present the final output.
