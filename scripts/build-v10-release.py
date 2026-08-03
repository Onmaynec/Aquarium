#!/usr/bin/env python3
import base64,gzip,io,re,shutil,sys,tarfile
from pathlib import Path

root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1] if len(sys.argv)>1 else root/'dist/v10-stage').resolve()
names=['chunk-00.js','chunk-01a.js','chunk-01b.js','chunk-01c.js','chunk-01d.js','chunk-01e.js','chunk-01f.js','chunk-01g.js','chunk-01h.js','chunk-02.js','chunk-03.js']
payload=''.join(re.search(r"push\('([A-Za-z0-9+/=]+)'\)",(root/'runtime'/name).read_text()).group(1) for name in names)

shutil.rmtree(out,ignore_errors=True)
out.mkdir(parents=True)
with tarfile.open(fileobj=io.BytesIO(gzip.decompress(base64.b64decode(payload)))) as archive:
    archive.extractall(out,filter='data')

for directory in ['assets','media']:
    if (root/directory).exists():
        shutil.copytree(root/directory,out/directory,dirs_exist_ok=True)

def copy(source,destination=None):
    destination=destination or source
    target=out/destination
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(root/source,target)

files=[
    ('v7-expedition.js',None),('v8-genetics.js',None),('v9-restoration.js',None),('v10-command.js',None),
    ('scripts/build-v10-release.py',None),
    ('manifest-v10.webmanifest','manifest.webmanifest'),('service-worker-v10.js','service-worker.js'),
    ('README-V10.md','README.md'),('CHANGELOG-V10.md','CHANGELOG.md'),('RELEASE_NOTES-V10.md','RELEASE_NOTES.md'),('VERSION-V10','VERSION'),
    ('tests/deep-sea-overlay-test.js',None),('tests/genetics-lab-test.js',None),('tests/restoration-center-test.js',None),
    ('tests/command-center-test.js',None),('tests/v10-runtime-test.js',None)
]
for source,destination in files:
    copy(source,destination)
for test in ['smoke-test.js','integrity-test.js','ocean-lab-test.js']:
    if (root/'tests'/test).exists():
        copy('tests/'+test)

index=out/'index.html'
html=index.read_text()
html=re.sub(r'<title>[^<]*</title>','<title>Living Aquarium V10 Ocean Command Center</title>',html)
html=html.replace(
    '<script src="app.js"></script>',
    '<script src="app.js"></script>\n<script src="v7-expedition.js"></script>\n<script src="v8-genetics.js"></script>\n<script src="v9-restoration.js"></script>\n<script src="v10-command.js"></script>'
)
index.write_text(html)

integrity=out/'tests/integrity-test.js'
if integrity.exists():
    text=integrity.read_text()
    text=re.sub(r"webmanifest\.name\.includes\('V(?:6|8|9)'\)","webmanifest.name.includes('V10')",text)
    integrity.write_text(text)
ocean_lab=out/'tests/ocean-lab-test.js'
if ocean_lab.exists():
    text=ocean_lab.read_text()
    text=re.sub(r"manifest\.name==='Living Aquarium V(?:6 Ocean Lab|8 Marine Genetics Lab|9 Reef Restoration Center)'","manifest.name==='Living Aquarium V10 Ocean Command Center'",text)
    ocean_lab.write_text(text)

print({'ok':True,'out':str(out),'files':sum(1 for path in out.rglob('*') if path.is_file())})
