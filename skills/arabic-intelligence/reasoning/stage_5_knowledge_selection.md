---
name: stage_5_knowledge_selection
description: "Algorithmic selection, filtering, and conflict resolution for knowledge nodes."
---

# `Stage 5 — Knowledge Selection`

## Algorithm: The Knowledge Filter

1. **Score All Candidate Nodes:**
   Iterate through available `mental_models` and `domain_packs`. Score them based on semantic match with `State.diagnostics`.
2. **Sort:**
   Sort candidates by relevance score descending.
3. **Discard:**
   Discard any node with a score below the threshold (0.65).
4. **Resolve Dependencies:**
   If Node A requires Node B, ensure Node B is loaded. If Node B is unavailable or conflicts heavily, drop Node A.
5. **Remove Conflicts:**
   If two nodes conflict (e.g., `Startup Slang` vs `GovTech Formal`), keep the one with the higher score or prioritize based on `Stage 7 — Priority Resolution`.
6. **Load Top N:**
   Inject the top 3-5 knowledge nodes into `State.knowledge_loaded`.
