#!/usr/bin/env bash
set -euo pipefail

node --check bootstrap.js
node --check service-worker.js
node --check assets/manifest.js
node tests/payload-test.js
test "$(cat VERSION)" = '6.0.0'

if ! git ls-remote --exit-code --tags origin refs/tags/v6.0.0 >/dev/null 2>&1; then
  git config user.name 'github-actions[bot]'
  git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
  git tag -a v6.0.0 -m 'Living Aquarium V6 Ocean Lab'
  git push origin v6.0.0
fi

python3 - <<'PY'
import base64, gzip, io, re, shutil, tarfile
from pathlib import Path

root = Path('.')
names = ['chunk-00.js','chunk-01a.js','chunk-01b.js','chunk-01c.js','chunk-01d.js','chunk-01e.js','chunk-01f.js','chunk-01g.js','chunk-01h.js','chunk-02.js','chunk-03.js']
payload = ''.join(re.search(r"push\('([A-Za-z0-9+/=]+)'\)", (root / 'runtime' / name).read_text()).group(1) for name in names)
stage = Path('dist/stage')
stage.mkdir(parents=True, exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(gzip.decompress(base64.b64decode(payload)))) as archive:
    archive.extractall(stage, filter='data')
for folder in ['assets', 'media']:
    source = root / folder
    if source.exists():
        shutil.copytree(source, stage / folder, dirs_exist_ok=True)
shutil.copy2(root / 'tests/integrity-test.js', stage / 'tests/integrity-test.js')
PY

mkdir -p dist/portable dist/source
cp -a dist/stage/. dist/portable/
cp -a dist/stage/. dist/source/
rm -rf dist/portable/.github dist/portable/tests
(cd dist/portable && zip -qr ../Aquarium-V6.0.0-Ocean-Lab-Portable.zip .)
(cd dist/source && zip -qr ../Aquarium-V6.0.0-Ocean-Lab-Source.zip .)
(
  cd dist
  sha256sum Aquarium-V6.0.0-Ocean-Lab-Portable.zip Aquarium-V6.0.0-Ocean-Lab-Source.zip > Aquarium-V6.0.0-SHA256SUMS.txt
)

assets=(
  dist/Aquarium-V6.0.0-Ocean-Lab-Portable.zip
  dist/Aquarium-V6.0.0-Ocean-Lab-Source.zip
  dist/Aquarium-V6.0.0-SHA256SUMS.txt
)
if gh release view v6.0.0 >/dev/null 2>&1; then
  gh release upload v6.0.0 "${assets[@]}" --clobber
else
  gh release create v6.0.0 "${assets[@]}" --title 'Living Aquarium V6 Ocean Lab' --notes-file RELEASE_NOTES.md --verify-tag
fi
