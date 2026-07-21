# Arabic Intelligence Plugin Specification

`api_version: 1`

Plugins extend the ontology graph with domain-specific rules without altering the core framework logic.

## Manifest Schema (`plugin.yaml`)

```yaml
api_version: 1
framework_version: ">=7.0.0"
plugin_version: "1.0.0"
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
