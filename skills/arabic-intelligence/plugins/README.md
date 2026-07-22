# Arabic Intelligence Plugin Specification

`api_version: 1`

Plugins extend the ontology graph with domain-specific rules without altering the core framework logic.

## Manifest Schema (`plugin.yaml`)

```yaml
api_version: 1
framework_version: ">=1.0.0"
min_framework_version: "1.0.0"
max_framework_version: "2.0.0"
plugin_version: "1.0.0"
deprecated_after: ""      # ISO date string if plugin is deprecated (e.g. "2027-01-01")
replacement: ""           # Recommended replacement plugin name
migration_guide: ""       # URL or path to migration instructions
name: "plugin-name"
description: "Plugin purpose"
triggers:
  domain: ["TargetDomain"]
  region: ["TargetRegion"]
capabilities:
  - "capability_1"
dependencies: []
entities:
  - "entity_name"
```
