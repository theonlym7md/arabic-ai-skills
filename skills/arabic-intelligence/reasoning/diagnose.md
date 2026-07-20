---
name: diagnose
description: "Initializes the State Object and populates State.diagnostics based on user input."
dependencies: []
audience: "Internal_Pipeline"
---

# `Diagnose(State)`

## Input
`State.user_prompt`: The raw user request.

## Action
Analyze the `State.user_prompt` and populate `State.diagnostics`. Do NOT attempt to generate the final copy. 

## Mutates
Returns a new `State` object with populated fields:
```json
{
  "diagnostics": {
    "intent": "string (e.g. error_message, cta, onboarding)",
    "audience": "string (e.g. B2B, B2C, Gen-Z)",
    "friction_level": "High|Medium|Low",
    "required_domains": ["saudi_intelligence", "fintech_arabic"]
  }
}
```
