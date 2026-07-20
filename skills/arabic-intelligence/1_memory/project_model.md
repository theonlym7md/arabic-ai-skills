# Memory: Project Model (نموذج المشروع)

## The Core Principle
The Arabic Intelligence OS cannot write blindly. It must understand the structural constraints, the domain, and the brand guidelines of the project it is operating within.

## Project Vectors (متجهات المشروع)

When the Reasoning Engine starts, it must extract the following vectors from the prompt or the codebase:

### 1. Industry Domain (القطاع)
Is the project:
- FinTech / DeFi
- Mega-Project / Government (GovTech)
- E-commerce / Retail
- Media / Creator Economy
- Hospitality / Travel

*Action:* This vector determines which files in `3_knowledge_graph/domain_rules/` will be queried.

### 2. Brand Archetype (شخصية العلامة التجارية)
- **The Disruptor (المتمرد):** Uses slang, breaks rules (e.g., Thmanyah, Telfaz11).
- **The Ruler (الحاكم):** Authoritative, visionary, structured (e.g., SDAIA, Vision 2030).
- **The Caregiver (الراعي):** Trustworthy, secure, helpful (e.g., STC Pay, Banks).
- **The Lover (المحب):** Passionate, luxurious, welcoming (e.g., Riyadh Air, Diriyah).

### 3. Technical Constraints (القيود التقنية)
- Is this a mobile app? (Requires ultra-short microcopy).
- Is this a dense dashboard? (Requires tooltips and progressive disclosure).
- Is this an empty state? (Requires the zero-state heuristic).

## Prompting the Memory
The Agent must populate this model internally before proceeding:
```yaml
Current_Project_Model:
  Domain: [Industry]
  Brand_Archetype: [Archetype]
  Constraint: [Technical Limitation]
```
