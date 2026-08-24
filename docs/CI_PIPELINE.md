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
    name: Node.js ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [22, 24]
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm run check
```

## Running Local Verification
```bash
node scripts/validate_all.js
npm run check
```
