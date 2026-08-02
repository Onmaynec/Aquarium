'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),vm=require('vm'),os=require('os'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const names=['chunk-00.js','chunk-01a.js','chunk-01b.js','chunk-01c.js','chunk-01d.js','chunk-01e.js','chunk-01f.js','chunk-01g.js','chunk-01h.js','chunk-02.js','chunk-03.js'];
const payload=names.map(name=>{const text=fs.readFileSync(path.join(root,'runtime',name),'utf8'),match=text.match(/push\('([A-Za-z0-9+/=]+)'\)/);if(!match)throw new Error(`Invalid ${name}`);return match[1]}).join('');
const tar=zlib.gunzipSync(Buffer.from(payload,'base64'));
const files=new Map();
for(let offset=0;offset+512<=tar.length;){const header=tar.subarray(offset,offset+512);if(header.every(v=>v===0))break;const name=header.subarray(0,100).toString().replace(/\0.*$/s,'').replace(/^\.\//,'');const size=parseInt(header.subarray(124,136).toString().replace(/\0.*$/s,'').trim()||'0',8);offset+=512;if(name&&!name.endsWith('/'))files.set(name,tar.subarray(offset,offset+size));offset+=Math.ceil(size/512)*512}
for(const name of ['app.js','index.html','styles.css','tests/smoke-test.js','tests/integrity-test.js','tests/ocean-lab-test.js'])if(!files.has(name))throw new Error(`Missing V6 payload file: ${name}`);
new vm.Script(files.get('app.js').toString(),{filename:'app.js'});new vm.Script(fs.readFileSync(path.join(root,'v7-expedition.js'),'utf8'),{filename:'v7-expedition.js'});new vm.Script(fs.readFileSync(path.join(root,'bootstrap-v7.js'),'utf8'),{filename:'bootstrap-v7.js'});
const page=fs.readFileSync(path.join(root,'v7.html'),'utf8');if(!page.includes('Living Aquarium V7 Deep Sea Expedition')||!page.includes('bootstrap-v7.js'))throw new Error('V7 entrypoint markers missing');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'aquarium-v7-overlay-'));for(const [name,data] of files){const target=path.join(tmp,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data)}fs.cpSync(path.join(root,'assets'),path.join(tmp,'assets'),{recursive:true});
for(const test of ['smoke-test.js','integrity-test.js','ocean-lab-test.js'])cp.execFileSync(process.execPath,[path.join(tmp,'tests',test)],{stdio:'inherit'});
cp.execFileSync(process.execPath,[path.join(root,'tests','deep-sea-overlay-test.js')],{stdio:'inherit'});fs.rmSync(tmp,{recursive:true,force:true});
console.log(JSON.stringify({ok:true,base:'6.0.0',overlay:'7.0.0',chunks:names.length,payloadFiles:files.size},null,2));
