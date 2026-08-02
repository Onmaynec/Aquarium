#!/usr/bin/env bash
set -euo pipefail
TARGET='214f7852204b8e542155a2371242383f6eeeed3d'
WORK='/tmp/aquarium-v9-release'
OUT="$GITHUB_WORKSPACE/dist/v9-release"
rm -rf "$WORK" "$OUT"
git cat-file -e "${TARGET}^{commit}"
git worktree add --detach "$WORK" "$TARGET"
cd "$WORK"
test "$(cat VERSION-V9)" = '9.0.0'
node --check bootstrap-v9.js
node --check v9-restoration.js
node --check service-worker-v9.js
node tests/deep-sea-overlay-test.js
node tests/genetics-lab-test.js
node tests/restoration-center-test.js
node tests/v9-runtime-test.js
python3 scripts/build-v9-release.py dist/stage
cd dist/stage
node tests/smoke-test.js
node tests/integrity-test.js
node tests/ocean-lab-test.js
node tests/deep-sea-overlay-test.js
node tests/genetics-lab-test.js
node tests/restoration-center-test.js
cd ..
mkdir -p portable source
cp -a stage/. portable/
cp -a stage/. source/
rm -rf portable/tests portable/scripts
(cd portable && zip -Xqr ../Aquarium-V9.0.0-Reef-Restoration-Center-Portable.zip .)
(cd source && zip -Xqr ../Aquarium-V9.0.0-Reef-Restoration-Center-Source.zip .)
sha256sum Aquarium-V9.0.0-Reef-Restoration-Center-Portable.zip Aquarium-V9.0.0-Reef-Restoration-Center-Source.zip > Aquarium-V9.0.0-SHA256SUMS.txt
sha256sum -c Aquarium-V9.0.0-SHA256SUMS.txt
unzip -tq Aquarium-V9.0.0-Reef-Restoration-Center-Portable.zip
unzip -tq Aquarium-V9.0.0-Reef-Restoration-Center-Source.zip
cd "$GITHUB_WORKSPACE"
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git tag -d v9.0.0 >/dev/null 2>&1 || true
git tag -a v9.0.0 "$TARGET" -m 'Living Aquarium V9 Reef Restoration Center'
git push --force origin refs/tags/v9.0.0
assets=(
  "$WORK/dist/Aquarium-V9.0.0-Reef-Restoration-Center-Portable.zip"
  "$WORK/dist/Aquarium-V9.0.0-Reef-Restoration-Center-Source.zip"
  "$WORK/dist/Aquarium-V9.0.0-SHA256SUMS.txt"
)
if gh release view v9.0.0 >/dev/null 2>&1; then
  gh release upload v9.0.0 "${assets[@]}" --clobber
  gh release edit v9.0.0 --title 'Living Aquarium V9 Reef Restoration Center' --notes-file "$WORK/RELEASE_NOTES-V9.md"
else
  gh release create v9.0.0 "${assets[@]}" --title 'Living Aquarium V9 Reef Restoration Center' --notes-file "$WORK/RELEASE_NOTES-V9.md" --verify-tag
fi
mkdir -p "$OUT"
cp "${assets[@]}" "$OUT/"
git worktree remove --force "$WORK"
