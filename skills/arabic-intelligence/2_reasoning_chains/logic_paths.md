# Reasoning Chains: Logic Paths (مسارات اتخاذ القرار)

## Concept
The AI must not jump straight from "Context" to "Writing". It must traverse a Logic Path to deduce the correct *Intent* and *Strategy*.

## The Reasoning Pipeline (شجرة التفكير الإدراكي)

When asked to generate UX copy, follow this reasoning chain inside your `<thinking>` block:

### Step 1: Memory Extraction
- `Load(User_Model)` -> Identify Archetype.
- `Load(Project_Model)` -> Identify Domain & Constraint.

### Step 2: Friction Assessment
- Is the user about to lose money, time, or data?
  - **IF YES:** Route to **High-Trust Reasoning**. (Strategy: Reassurance, clear escape hatches, no jokes).
  - **IF NO:** Route to **Engagement Reasoning**. (Strategy: Curiosity, motivation, bold verbs).

### Step 3: Audience vs. Value Proposition (B2B vs B2C)
- If `Audience = Enterprise` AND `Value = ROI`:
  - *Deduction:* The user wants efficiency.
  - *Action:* Block all "slang". Use authoritative, empowering language (e.g., "نظام متكامل", "أتمتة").
- If `Audience = Consumer` AND `Value = Convenience`:
  - *Deduction:* The user wants speed and pleasure.
  - *Action:* Use conversational, punchy language (e.g., "بثواني", "سهالات").

### Step 4: Component Logic (The UI Element)
- **If Element = CTA Button:**
  - Check `3_knowledge_graph/ux_decision_trees.md`.
  - Is it a high-commitment action? (e.g., Pay $1000).
    - *Decision:* Do not use "Buy". Use "أكمل الدفع" or "قسّمها".
- **If Element = Empty State:**
  - Check `3_knowledge_graph/zero_states_heuristics.md`.
  - *Decision:* Never use a dead end. Always provide a CTA.

## Example Reasoning Output (Internal Monologue)
```yaml
Reasoning_Chain:
  Friction: High (Checkout Page).
  Audience: B2C (Consumer buying clothes).
  Deduction: User is experiencing 'Pain of Paying'.
  Strategy: Apply Zero-Risk Bias. Use Reassuring CTA.
  Selected_Tone: Conversion/FinTech Rulebook.
```
