# Ontological Knowledge Engine

These are declarative resources for an agent, not an implemented query engine. The pipeline below is a historical design sketch. Follow `reasoning/stage_5_knowledge_selection.md` for current guidance; do not invent relevance scores or nonexistent dependencies. The `confidence` field is editorial metadata, not a measured probability or regulatory endorsement.

The Ontological Knowledge Engine structures domain rules, Arabic product terminology, and UX heuristics into machine-parseable YAML entity graphs.

## Ontological Query Pipeline

When `Stage 5 (Knowledge Selection)` executes, it runs the following 5-step query pipeline:

```text
[SELECT Candidates] ──> [Expand Dependencies] ──> [Rank Relevance] ──> [Resolve Conflicts] ──> [Return Load Set]
```

1. **`SELECT Candidates`:** Match candidate entities in `knowledge/entities/` and loaded `plugins/` against `ReasoningContext.diagnostics`.
2. **`Expand Dependencies`:** Recursively read `depends_on` and `requires` fields from entity manifest schemas.
3. **`Rank Relevance`:** Calculate candidate score (0.0 to 1.0) based on priority and semantic match.
4. **`Resolve Conflicts`:** Cross-reference `conflicts_with` and apply domain weights from `knowledge/relations/domain_weights/`.
5. **`Return Load Set`:** Inject the finalized nodes into `KnowledgeContext.entities_loaded`.
