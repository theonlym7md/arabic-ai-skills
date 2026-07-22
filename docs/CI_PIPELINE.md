# GitHub Actions CI Pipeline Specification

`Specification Version: 1.2.0-STABLE`

This document defines the Continuous Integration pipeline setup for the Arabic Intelligence Framework.

## Workflow Definition (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-and-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: node scripts/validate_all.js
      - run: npx jest --ci
```

## Running Local Verification
```bash
node scripts/validate_all.js
npx jest
```
