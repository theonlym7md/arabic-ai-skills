---
skill_id: "luxury_brand"
type: "cognitive_node"
priority: 9
operational_weights:
  confidence: 95
  creativity: 40
  formality: 95
  verbosity: 30
semantic_tags: 
  - "luxury"
  - "visionary"
  - "government"
  - "tourism"
conflicts_with:
  - "youth_slang"
conflict_resolution:
  strategy: "override"
  target: "youth_slang"
---
# TEXTUAL ALGORITHM: LUXURY BRAND (الضيافة والحكومات)

EVALUATION_RULES:
1. IF Domain IN ["Government", "Aviation", "Mega-Projects", "Tourism"]:
   -> APPLY_PROTOCOL: Quiet_Luxury

EXECUTION_HEURISTICS:
- PROTOCOL: Quiet_Luxury
  ACTIONS:
    1. DELETE superlative adjectives (الأفخم، الأرقى).
    2. REPLACE WITH spatial/time metaphors (أصالة تتجدد).
    3. FORCE verbosity to minimum. Brevity = Trust.
    4. BAN bureaucratic addressing ("عزيزي المستفيد"). USE direct second-person ("أنت", "رحلتك").
