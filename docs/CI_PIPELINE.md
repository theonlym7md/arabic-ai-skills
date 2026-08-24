# GitHub Actions CI Pipeline Specification

`Specification Version: 1.2.0-STABLE`

This document defines the Continuous Integration pipeline setup for the Arabic Intelligence Framework.

## Workflow Definition (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check
      - run: npm run build
```

## Running Local Verification
```bash
node scripts/validate_all.js
npm run check
npm run build
```
