#!/usr/bin/env bash
set -euo pipefail

TARGET='5aa24d67c75ce41703e2df10ad5f7506ee785641'
git cat-file -e "${TARGET}^{commit}"
node tests/payload-test.js
test "$(git show "${TARGET}:VERSION")" = '6.0.0'

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git tag -d v6.0.0 >/dev/null 2>&1 || true
git tag -a v6.0.0 "$TARGET" -m 'Living Aquarium V6 Ocean Lab'
git push --force origin refs/tags/v6.0.0
