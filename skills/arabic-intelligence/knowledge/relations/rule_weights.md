---
name: rule_weights
description: "Numerical weight system for resolving ontological conflicts."
---

# `Rule Weights Matrix`

When applying rules or generating copy, conflicts naturally arise. Do not use strict arbitrary blockades. Instead, use this mathematical weight system to resolve conflicts based on the `Domain`.

## Base Weights
- **Trust (Safety & Compliance):** 100
- **Localization (Cultural Fit):** 95
- **Brand (Archetype Tone):** 90
- **Clarity (Friction Reduction):** 85
- **Humanization (Conversational):** 75
- **Creativity (Aesthetics):** 60

## Conflict Resolution Example
If `Humanization (75)` dictates using slang to sound friendly, but `Brand (90)` dictates a Government archetype:
**Decision:** Brand wins. The tone remains formal and polite, overriding extreme humanization.

## Dynamic Weight Adjustments
- If `Domain == Startup`: Boost `Creativity` to 85.
- If `Intent == Error Message`: Boost `Clarity` to 95, drop `Creativity` to 0.
