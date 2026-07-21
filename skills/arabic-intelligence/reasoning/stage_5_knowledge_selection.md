---
name: stage_5_knowledge_selection
description: "6-Step Algorithmic Knowledge Selection Pipeline for Ontological Knowledge."
---

# `Stage 5 — Knowledge Selection`

## Algorithm: The 6-Step Pipeline

Execute strictly:

1. **Candidate Search:** Search the `knowledge/entities/` directory for candidate entities matching `WorkingMemory.diagnostics`.
2. **Ranking:** Calculate relevance score for each candidate (0.0 to 1.0).
3. **Dependency Expansion:** Read `depends_on` from candidate entity schemas (`_schema.yaml`). Recursively pull required parent entities.
4. **Conflict Detection:** Check `knowledge/relations/weights.yaml` and entity `priority` fields. If two entities provide conflicting directives, select the higher weighted entity.
5. **Pruning:** Discard candidates with final adjusted score < 0.70.
6. **Load:** Inject structured objects into `WorkingMemory.knowledge_loaded`:
   ```json
   {
     "entity": "saudi_govtech",
     "confidence": 0.95,
     "priority": 100,
     "reason": "Matches Domain == GovTech and Region == KSA",
     "dependencies": ["institutional_trust"]
   }
   ```
Append structured trace log to `WorkingMemory.trace`.
