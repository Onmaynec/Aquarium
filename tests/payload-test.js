'use strict';
const fs=require('fs'),zlib=require('zlib'),path=require('path'),vm=require('vm'),os=require('os'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const names=["chunk-00.js", "chunk-01a.js", "chunk-01b.js", "chunk-01c.js", "chunk-01d.js", "chunk-01e.js", "chunk-01f.js", "chunk-01g.js", "chunk-01h.js", "chunk-02.js", "chunk-03.js"];
const chunks=names.map(name=>fs.readFileSync(path.join(root,'runtime',name),'utf8'));
const payload=chunks.map(text=>{const match=text.match(/push\('([A-Za-z0-9+/=]+)'\)/);if(!match)throw new Error('Invalid runtime chunk');return match[1]}).join('');
const tar=zlib.gunzipSync(Buffer.from(payload,'base64'));
function filesFromTar(buffer){const files=new Map();for(let offset=0;offset+512<=buffer.length;){const header=buffer.subarray(offset,offset+512);if(header.every(v=>v===0))break;const name=header.subarray(0,100).toString().replace(/\0.*$/s,'').replace(/^\.\//,'');const size=parseInt(header.subarray(124,136).toString().replace(/\0.*$/s,'').trim()||'0',8);offset+=512;if(name&&!name.endsWith('/'))files.set(name,buffer.subarray(offset,offset+size));offset+=Math.ceil(size/512)*512}return files}
const files=filesFromTar(tar);
for(const name of ['app.js','index.html','styles.css','tests/smoke-test.js','tests/integrity-test.js','tests/ocean-lab-test.js'])if(!files.has(name))throw new Error(`Missing ${name}`);
new vm.Script(files.get('app.js').toString(),{filename:'app.js'});
if(!files.get('index.html').toString().includes('Living Aquarium V6 Ocean Lab'))throw new Error('V6 marker missing');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'aquarium-v6-'));
for(const [name,data] of files){const target=path.join(tmp,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data)}
fs.cpSync(path.join(root,'assets'),path.join(tmp,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'tests','integrity-test.js'),path.join(tmp,'tests','integrity-test.js'));
for(const test of ['smoke-test.js','integrity-test.js','ocean-lab-test.js'])cp.execFileSync(process.execPath,[path.join(tmp,'tests',test)],{stdio:'inherit'});
fs.rmSync(tmp,{recursive:true,force:true});
console.log(JSON.stringify({ok:true,payloadBytes:tar.length,files:files.size,chunks:names.length},null,2));
