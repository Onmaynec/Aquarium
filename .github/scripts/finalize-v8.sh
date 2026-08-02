#!/usr/bin/env bash
set -euo pipefail
TARGET='2606ac0bd20b40ae4f8f20ee6d44fb94a8d17c59'
WORK='/tmp/aquarium-v8-release'
OUT="$GITHUB_WORKSPACE/dist/v8-release"
rm -rf "$WORK" "$OUT"
git cat-file -e "${TARGET}^{commit}"
git worktree add --detach "$WORK" "$TARGET"
cd "$WORK"
test "$(cat VERSION-V8)" = '8.0.0'
node --check bootstrap-v8.js
node --check v8-genetics.js
node tests/deep-sea-overlay-test.js
node tests/genetics-lab-test.js
node tests/v8-runtime-test.js
python3 scripts/build-v8-release.py dist/stage
cd dist/stage
node tests/smoke-test.js
node tests/integrity-test.js
node tests/ocean-lab-test.js
node tests/deep-sea-overlay-test.js
node tests/genetics-lab-test.js
cd ..
mkdir -p portable source
cp -a stage/. portable/
cp -a stage/. source/
rm -rf portable/tests portable/scripts
(cd portable && zip -Xqr ../Aquarium-V8.0.0-Marine-Genetics-Lab-Portable.zip .)
(cd source && zip -Xqr ../Aquarium-V8.0.0-Marine-Genetics-Lab-Source.zip .)
sha256sum Aquarium-V8.0.0-Marine-Genetics-Lab-Portable.zip Aquarium-V8.0.0-Marine-Genetics-Lab-Source.zip > Aquarium-V8.0.0-SHA256SUMS.txt
sha256sum -c Aquarium-V8.0.0-SHA256SUMS.txt
unzip -tq Aquarium-V8.0.0-Marine-Genetics-Lab-Portable.zip
unzip -tq Aquarium-V8.0.0-Marine-Genetics-Lab-Source.zip
cd "$GITHUB_WORKSPACE"
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git tag -d v8.0.0 >/dev/null 2>&1 || true
git tag -a v8.0.0 "$TARGET" -m 'Living Aquarium V8 Marine Genetics Lab'
git push --force origin refs/tags/v8.0.0
assets=(
  "$WORK/dist/Aquarium-V8.0.0-Marine-Genetics-Lab-Portable.zip"
  "$WORK/dist/Aquarium-V8.0.0-Marine-Genetics-Lab-Source.zip"
  "$WORK/dist/Aquarium-V8.0.0-SHA256SUMS.txt"
)
if gh release view v8.0.0 >/dev/null 2>&1; then
  gh release upload v8.0.0 "${assets[@]}" --clobber
  gh release edit v8.0.0 --title 'Living Aquarium V8 Marine Genetics Lab' --notes-file "$WORK/RELEASE_NOTES-V8.md"
else
  gh release create v8.0.0 "${assets[@]}" --title 'Living Aquarium V8 Marine Genetics Lab' --notes-file "$WORK/RELEASE_NOTES-V8.md" --verify-tag
fi
mkdir -p "$OUT"
cp "${assets[@]}" "$OUT/"
git worktree remove --force "$WORK"
