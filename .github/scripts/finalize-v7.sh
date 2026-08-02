#!/usr/bin/env bash
set -euo pipefail

TARGET="$(git log -1 --format=%H -- README-V7.md)"
test -n "$TARGET"
test "$(git show "$TARGET:VERSION-V7")" = '7.0.0'

WORK=/tmp/aquarium-v7-release
rm -rf "$WORK"
git worktree add --detach "$WORK" "$TARGET"
cd "$WORK"
node --check bootstrap-v7.js
node --check v7-expedition.js
node tests/deep-sea-overlay-test.js
node tests/v7-runtime-test.js

existing="$(git rev-list -n1 v7.0.0 2>/dev/null || true)"
if [ "$existing" != "$TARGET" ]; then
  git tag -d v7.0.0 >/dev/null 2>&1 || true
  git push origin :refs/tags/v7.0.0 >/dev/null 2>&1 || true
  git config user.name 'github-actions[bot]'
  git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
  git tag -a v7.0.0 "$TARGET" -m 'Living Aquarium V7 Deep Sea Expedition'
  git push origin v7.0.0
fi

python3 - <<'PY'
import base64,gzip,io,re,shutil,tarfile
from pathlib import Path
root=Path('.')
names=['chunk-00.js','chunk-01a.js','chunk-01b.js','chunk-01c.js','chunk-01d.js','chunk-01e.js','chunk-01f.js','chunk-01g.js','chunk-01h.js','chunk-02.js','chunk-03.js']
payload=''.join(re.search(r"push\('([A-Za-z0-9+/=]+)'\)",(root/'runtime'/name).read_text()).group(1) for name in names)
stage=Path('dist/stage');stage.mkdir(parents=True,exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(gzip.decompress(base64.b64decode(payload)))) as archive:
    archive.extractall(stage,filter='data')
for folder in ['assets','media']:
    source=root/folder
    if source.exists():shutil.copytree(source,stage/folder,dirs_exist_ok=True)
shutil.copy2(root/'v7-expedition.js',stage/'v7-expedition.js')
shutil.copy2(root/'manifest-v7.webmanifest',stage/'manifest.webmanifest')
shutil.copy2(root/'service-worker-v7.js',stage/'service-worker.js')
for name in ['README-V7.md','CHANGELOG-V7.md','RELEASE_NOTES_V7.md','VERSION-V7']:
    shutil.copy2(root/name,stage/name)
html=(stage/'index.html').read_text()
html=re.sub(r'<title>[^<]*</title>','<title>Living Aquarium V7 Deep Sea Expedition</title>',html)
html=html.replace('<script src="app.js"></script>','<script src="app.js"></script>\n  <script src="v7-expedition.js"></script>')
(stage/'index.html').write_text(html)
PY
mkdir -p dist/portable dist/source
cp -a dist/stage/. dist/portable/
cp -a dist/stage/. dist/source/
cp tests/deep-sea-overlay-test.js tests/v7-runtime-test.js dist/source/tests/
rm -rf dist/portable/.github dist/portable/tests
(cd dist/portable && zip -qr ../Aquarium-V7.0.0-Deep-Sea-Expedition-Portable.zip .)
(cd dist/source && zip -qr ../Aquarium-V7.0.0-Deep-Sea-Expedition-Source.zip .)
(
  cd dist
  sha256sum Aquarium-V7.0.0-Deep-Sea-Expedition-Portable.zip Aquarium-V7.0.0-Deep-Sea-Expedition-Source.zip > Aquarium-V7.0.0-SHA256SUMS.txt
)
assets=(dist/Aquarium-V7.0.0-Deep-Sea-Expedition-Portable.zip dist/Aquarium-V7.0.0-Deep-Sea-Expedition-Source.zip dist/Aquarium-V7.0.0-SHA256SUMS.txt)
if gh release view v7.0.0 >/dev/null 2>&1; then
  gh release upload v7.0.0 "${assets[@]}" --clobber
else
  gh release create v7.0.0 "${assets[@]}" --title 'Living Aquarium V7 Deep Sea Expedition' --notes-file RELEASE_NOTES_V7.md --verify-tag
fi
