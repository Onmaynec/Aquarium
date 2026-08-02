#!/usr/bin/env python3
import base64,gzip,io,re,shutil,sys,tarfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1] if len(sys.argv)>1 else root/'dist/v9-stage').resolve()
names=['chunk-00.js','chunk-01a.js','chunk-01b.js','chunk-01c.js','chunk-01d.js','chunk-01e.js','chunk-01f.js','chunk-01g.js','chunk-01h.js','chunk-02.js','chunk-03.js']
payload=''.join(re.search(r"push\('([A-Za-z0-9+/=]+)'\)",(root/'runtime'/n).read_text()).group(1) for n in names)
shutil.rmtree(out,ignore_errors=True);out.mkdir(parents=True)
with tarfile.open(fileobj=io.BytesIO(gzip.decompress(base64.b64decode(payload)))) as tf: tf.extractall(out,filter='data')
for d in ['assets','media']:
    if (root/d).exists(): shutil.copytree(root/d,out/d,dirs_exist_ok=True)
def cp(src,dst=None):
    dst=dst or src;p=out/dst;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/src,p)
for src,dst in [('v7-expedition.js',None),('v8-genetics.js',None),('v9-restoration.js',None),('scripts/build-v9-release.py',None),('manifest-v9.webmanifest','manifest.webmanifest'),('service-worker-v9.js','service-worker.js'),('README-V9.md','README.md'),('CHANGELOG-V9.md','CHANGELOG.md'),('RELEASE_NOTES-V9.md','RELEASE_NOTES.md'),('VERSION-V9','VERSION'),('tests/deep-sea-overlay-test.js',None),('tests/genetics-lab-test.js',None),('tests/restoration-center-test.js',None),('tests/v9-runtime-test.js',None)]: cp(src,dst)
for test in ['smoke-test.js','integrity-test.js','ocean-lab-test.js']:
    if (root/'tests'/test).exists(): cp('tests/'+test)
p=out/'index.html';s=p.read_text();s=re.sub(r'<title>[^<]*</title>','<title>Living Aquarium V9 Reef Restoration Center</title>',s);s=s.replace('<script src="app.js"></script>','<script src="app.js"></script>\n<script src="v7-expedition.js"></script>\n<script src="v8-genetics.js"></script>\n<script src="v9-restoration.js"></script>');p.write_text(s)
p=out/'tests/integrity-test.js';p.write_text(p.read_text().replace("webmanifest.name.includes('V6')","webmanifest.name.includes('V9')").replace("webmanifest.name.includes('V8')","webmanifest.name.includes('V9')"))
p=out/'tests/ocean-lab-test.js';p.write_text(p.read_text().replace("manifest.name==='Living Aquarium V6 Ocean Lab'","manifest.name==='Living Aquarium V9 Reef Restoration Center'").replace("manifest.name==='Living Aquarium V8 Marine Genetics Lab'","manifest.name==='Living Aquarium V9 Reef Restoration Center'"))
print({'ok':True,'out':str(out),'files':sum(1 for p in out.rglob('*') if p.is_file())})
