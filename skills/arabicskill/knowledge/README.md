# Knowledge Graph & Routing Resources

These are declarative resources for agents and build-time SDK routing synchronization. Follow [stage_2_knowledge_routing.md](../reasoning/stage_2_knowledge_routing.md) and [routing.yaml](relations/routing.yaml) for current guidance; do not invent relevance scores, probabilities, or regulatory endorsements.

- `relations/routing.yaml` is the single source of truth mapping domains and intents to `references/`, optional `entities/`, `weights.yaml` profiles, and `plugins/` (and is compiled into the SDK router at build time).
- `relations/weights.yaml` is the single canonical priority-weight configuration (base weights, domain overrides, intent overrides, and evaluation rubric mapping).
- `entities/*.yaml` store reusable domain and regional archetypes validated against `entities/_schema.yaml` (`review_status` is editorial metadata, not regulatory endorsement).

## Selection Flow

1. **Match Domain & Intent:** Look up matching entries in `relations/routing.yaml` (respecting `exclude_keywords` and `region_scope`).
2. **Load Primary Reference:** Read only the matched section(s) in `references/` first.
3. **Load Optional Entity / Plugin / Weight Profile:** If an `entity` or `plugin` matches the task and region, load it and resolve declared graph edges (`inherits`, `depends_on`, `requires`, `conflicts_with`, `fallback`).
4. **Apply Safety Gate:** Factual accuracy, user safety, privacy, and variable preservation always override brand tone or creativity weights.
