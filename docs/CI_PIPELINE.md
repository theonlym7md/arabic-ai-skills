# GitHub Actions CI Pipeline

The canonical workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). This document describes its guarantees without duplicating action revisions that Dependabot may update.

## Pull-request and push checks

CI runs on pushes and pull requests targeting `main`. It uses read-only repository permissions and cancels superseded runs for the same branch or pull request.

The verification matrix covers Node.js 22 and 24 LTS. Each job:

1. Checks out the repository with a commit-pinned action.
2. Installs the selected Node.js runtime with a commit-pinned action.
3. Runs `npm ci` from the committed lockfile.
4. Runs `npm run check` for validators, type checking, tests, and linting.

Code scanning is defined separately in [`.github/workflows/codeql.yml`](../.github/workflows/codeql.yml) and covers JavaScript/TypeScript and Python.

## Local verification

```bash
npm ci
npm run check
npm audit
```

After committing release changes, run `npm run package:zip`. The command packages committed `HEAD` and derives the ZIP version from that same commit. Export rules in [`.gitattributes`](../.gitattributes) exclude large demo media and repository-only files from the distribution ZIP.
