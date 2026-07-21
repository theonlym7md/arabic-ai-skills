---
name: stage_5_knowledge_selection
description: "Algorithmic selection, filtering, and conflict resolution for ontological knowledge nodes."
---

# `Stage 5 — Knowledge Selection`

## Algorithm: The Ontological Knowledge Filter

Execute these steps strictly in order:

1. **Rank:**
   Score all available entities in the knowledge ontology based on semantic match with `State.diagnostics`.
2. **Prune:**
   Discard any entity with a score below the dynamic threshold (0.65).
3. **Resolve Dependencies:**
   Check `knowledge/dependencies/`. If Entity A requires Entity B, ensure Entity B is loaded. If Entity B is unavailable, drop Entity A.
4. **Resolve Conflicts:**
   Check `knowledge/relations/`. If two entities conflict, keep the one with the higher rank or use `Rule Weights` to decide.
5. **Load:**
   Inject the finalized top nodes into `State.knowledge_loaded`. Add a record to `State.trace` (e.g., `[Action]: Loaded 'authority_gov', [Reason]: Domain == Government`).
