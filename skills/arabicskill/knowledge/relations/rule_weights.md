---
name: rule_weights
description: "Numerical weight system for resolving ontological conflicts."
---

# `Rule Weights Matrix`

These are editorial priorities, not measured probabilities. Factual accuracy, user safety, privacy and preservation of variables are mandatory gates; brand, persuasion and creativity can never outweigh them. Use the illustrative weights only to choose among already-safe wordings. `weights.yaml` is the canonical numeric reference when an old example here differs.

## Base Weights
- **Trust (Safety & Compliance):** 100
- **Clarity (Friction Reduction):** 95
- **Localization (Cultural Fit):** 95
- **Accessibility:** 90
- **Brand (Archetype Tone):** 85
- **Tone:** 85
- **InformationDensity:** 85
- **SentenceRhythm:** 80
- **Humanization (Conversational):** 75
- **Persuasiveness:** 70
- **Creativity (Aesthetics):** 60

## Conflict Resolution Example
If `Humanization (75)` dictates using slang to sound friendly, but `Trust (100)` and `Brand (85)` / `Government` override (`Trust: 100, Brand: 90, Creativity: 10`) dictate a formal institutional voice:
**Decision:** Trust and Brand win. The tone remains formal, direct, and clear, overriding casual humanization.

## Dynamic Weight Adjustments
- If `Domain == Startup` or `Luxury`: Boost `Creativity` (up to 85–90), keeping mandatory safety gates unchanged.
- If `Intent == Error Message`: Prioritize `Clarity` (100) and `Trust` (100), drop `Creativity` (0–10).
