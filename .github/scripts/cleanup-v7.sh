#!/usr/bin/env bash
set -euo pipefail

git ls-remote --exit-code --tags origin refs/tags/v7.0.0 >/dev/null
gh release view v7.0.0 >/dev/null
node tests/v7-runtime-test.js

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git rm .github/scripts/finalize-v7.sh .github/workflows/finalize-v7.yml .github/scripts/cleanup-v7.sh .github/workflows/cleanup-v7.yml
git commit -m 'Remove one-time V7 release automation'
git push origin HEAD:main
