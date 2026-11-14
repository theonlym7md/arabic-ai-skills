# Ontological Knowledge Engine

These are declarative resources for an agent, not an implemented query engine. Follow `reasoning/stage_5_knowledge_selection.md` and `knowledge/relations/routing.yaml` for current guidance; do not invent relevance scores or nonexistent dependencies. The `confidence` field is editorial metadata, not a measured probability or regulatory endorsement.

`knowledge/relations/routing.yaml` maps domains to their primary guide in `references/` and optional `entities/`, `domain_weights/`, and `plugins/` files.

## Conceptual Selection Flow

1. **Match Domain:** Look up the domain in `knowledge/relations/routing.yaml`.
2. **Load Primary Reference:** Read only the matched section in `references/` first.
3. **Load Optional Domain Pack:** If an `entity`, `weight_profile`, or `plugin` exists and applies to the region/context, load it and resolve any declared dependencies (`inherits`, `depends_on`, `requires`, `conflicts_with`).
4. **Apply Safety Gate:** Factual accuracy, user safety, privacy, and variable preservation always override brand tone or creativity weights.
