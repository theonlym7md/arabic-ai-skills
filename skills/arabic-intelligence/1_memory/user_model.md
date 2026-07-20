# Memory: User Model (نموذج المستخدم)

## The Core Principle
Before generating any Arabic text, the Reasoning Engine must construct a mental model of the end-user. The user is not a blank slate; they have goals, fears, and cognitive biases.

## Cognitive Archetypes (الأنماط الإدراكية)

When analyzing the context, classify the user into one of the following archetypes:

### 1. The Anxious Spender (المستخدم المتردد)
*   **Context:** E-commerce checkout, FinTech payments, Subscriptions.
*   **Psychological State:** High Friction. Fear of hidden fees. System 2 is trying to stop System 1.
*   **Memory Requirement:** The engine must remember to use *Friction Removal* heuristics and *Reassurance* vocabulary.

### 2. The Task-Oriented Professional (المحترف العملي)
*   **Context:** B2B SaaS dashboards, Developer APIs, Government portals (G2B).
*   **Psychological State:** Low patience. Value-driven.
*   **Memory Requirement:** The engine must remember to use *Empowerment* verbs, absolute clarity, and zero fluff. No emotional manipulation.

### 3. The Explorer (المستكشف)
*   **Context:** Tourism platforms, Media content, Gaming.
*   **Psychological State:** High curiosity. Seeking pleasure or entertainment.
*   **Memory Requirement:** The engine must use *Experiential* verbs, invoke wonder, and rely on the *Hospitality* domain rules.

## Prompting the Memory
The Agent must populate this model internally before proceeding:
```yaml
Current_User_Model:
  Archetype: [Select from above]
  Primary_Fear: [What are they afraid of?]
  Primary_Goal: [What do they want to achieve?]
```
