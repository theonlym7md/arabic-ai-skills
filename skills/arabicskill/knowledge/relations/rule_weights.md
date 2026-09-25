---
name: rule_weights
description: "Numerical weight system for resolving ontological conflicts."
---

# `Rule Weights Matrix`

These are editorial priorities, not measured probabilities. Factual accuracy, user safety, privacy and preservation of variables are mandatory gates; brand, persuasion and creativity can never outweigh them. Use the illustrative weights only to choose among already-safe wordings. `weights.yaml` is the canonical numeric reference when an old example here differs.

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
