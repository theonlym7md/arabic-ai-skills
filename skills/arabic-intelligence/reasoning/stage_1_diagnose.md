---
name: stage_1_diagnose
description: "Extracts 10 crucial dimensions from the user request."
---

# `Stage 1 — Diagnose`

## Algorithm: 10-Dimensional Context Extraction
Analyze the user prompt to extract the following dimensions.

1. **Domain:** The industry (e.g., GovTech, FinTech, E-commerce, EdTech).
2. **Emotional Goal:** What the user should feel (e.g., Reassured, Urgent, Delighted, Respected).
3. **Trust Level:** Required trust (Low, Medium, High, Critical).
4. **Target Audience:** Who is reading (e.g., Experts, Gen-Z, Citizens, B2B).
5. **Tone of Voice:** (e.g., Official, Friendly, Direct, Witty).
6. **Product Type:** (e.g., Dashboard, Landing Page, Error Message).
7. **Region:** Cultural targeting (e.g., KSA, Gulf, MENA).
8. **Reading Level:** (e.g., Grade 6, Academic).
9. **Constraints:** Hard rules (e.g., Max 10 words, No passive voice).
10. **Missing Context:** Any critical information needed before generation.

## Missing Context Resolution Rule
- **IF CRITICAL:** (e.g. Missing what the button actually does). Action: **Ask the user.**
- **ELSE:** (e.g. Missing specific tone preference). Action: **Continue with assumptions** based on the Domain.

## Output
Populate `State.diagnostics` and append reasoning to `State.trace`.
