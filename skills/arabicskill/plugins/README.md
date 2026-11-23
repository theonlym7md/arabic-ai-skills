# ArabicSkill Plugin Specification

`api_version: 1`

Plugins extend the knowledge graph with regional or domain-specific entities without altering the core skill contract.

## Manifest Schema (`plugin.yaml`)

```yaml
api_version: 1
framework_version: ">=2.0.0 <3.0.0"
min_framework_version: "2.0.0"
max_framework_version: "2.9.9"
plugin_version: "1.0.0"
deprecated_after: ""      # Optional ISO date string if plugin is deprecated (e.g. "2027-01-01")
replacement: ""           # Optional recommended replacement plugin slug
migration_guide: ""       # Optional URL or repo path to migration instructions
name: "plugin-name"
description: "Plugin purpose"
triggers:
  domain: ["TargetDomain"]
  region: ["TargetRegion"]
capabilities:
  - "Generate"
  - "Rewrite"
  - "Audit"
dependencies: []
entities:
  - "entity_name"
```
