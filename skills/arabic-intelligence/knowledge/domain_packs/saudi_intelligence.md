---
node_id: domain_saudi_intelligence
name: Saudi Cultural Context
description: "Injects deep Saudi cultural awareness, dialects, and modern business norms into the draft."
compatibility: ["GPT-4o", "Claude-3.5", "Gemini-1.5"]
---

# `Inject_Saudi_Intelligence(State)`

## Contextual Anchors
- **Modernity:** Saudi Arabia is driven by Vision 2030. Tone should be ambitious, clear, and technologically advanced.
- **Dialect Hybridization (White Arabic):** Avoid strict, archaic MSA (الفصحى المتكلفة). Blend MSA with widely understood Saudi business colloquialisms where appropriate (e.g., using "حياك" in informal onboarding instead of "أهلاً وسهلاً بك").
- **Respectful yet Direct:** Abolish overly submissive titles ("عزيزي المستفيد", "سعادة العميل"). Use empowering, direct pronouns ("طلبك", "رحلتك", "أنت").

## Action
When `State.diagnostics.required_domains` CONTAINS "saudi_intelligence":
1. Audit `State.current_draft`.
2. Replace generic Arabic templates with Saudi-specific linguistic markers.
