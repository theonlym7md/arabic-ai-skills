# GitHub Actions CI Pipeline

The canonical workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). This document describes its guarantees without duplicating action revisions that Dependabot may update.

## Pull-request and push checks

CI runs on pushes and pull requests targeting `main`. It uses read-only repository permissions and cancels superseded runs scoped per pull request (or ref on pushes) without interrupting unrelated branches.

The verification matrix covers:
- `ubuntu-latest` on Node.js 22 and 24 LTS
- `windows-latest` on Node.js 22 LTS

Each matrix job:

1. Checks out the repository with a commit-pinned action.
2. Installs the selected Node.js runtime with a commit-pinned action.
3. Runs `npm ci` from the committed lockfile.
4. Runs `npm run check` (`validate`, `sweep`, dual CJS+ESM `build`, `test`, and `lint`), `npm run typecheck`, `npm run benchmark`, and `npm run package:zip`.
5. On Linux jobs, also verifies the POSIX shell helper (`scripts/sweep.sh`) and compiles `scripts/video/build_demo.py` with `python3 -m py_compile`.

Code scanning is defined separately in [`.github/workflows/codeql.yml`](../.github/workflows/codeql.yml) and covers JavaScript/TypeScript and Python.

## Local verification

```bash
npm ci
npm run check
npm run typecheck
npm run benchmark
npm audit
```

After committing release changes, run `npm run package:zip`. The command packages committed `HEAD` and derives the ZIP version from that same commit. Export rules in [`.gitattributes`](../.gitattributes) exclude large demo media and repository-only files from the distribution ZIP.
