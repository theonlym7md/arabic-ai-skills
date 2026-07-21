# Arabic Intelligence Plugin System

The Plugin Architecture allows community contributors to extend domain knowledge without modifying core framework files.

## Plugin Structure

```text
plugins/
└── <plugin_name>/
    ├── plugin.yaml           # Manifest defining plugin metadata & triggers
    └── entities/             # Custom YAML entities extending core ontology
```

## Manifest Specification (`plugin.yaml`)

```yaml
name: "govtech-saudi"
version: "1.0.0"
author: "Community"
description: "Saudi Arabia GovTech specific rules and entities."
triggers:
  domain: ["Government", "GovTech"]
  region: ["KSA"]
entities:
  - "entities/saudi_govtech.yaml"
```
