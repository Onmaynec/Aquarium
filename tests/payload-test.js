'use strict';
const fs=require('fs'),zlib=require('zlib'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const chunks=[0,1,2,3].map(n=>fs.readFileSync(path.join(root,'runtime',`chunk-0${n}.js`),'utf8'));
const payload=chunks.map(text=>{const match=text.match(/push\('([A-Za-z0-9+/=]+)'\)/);if(!match)throw new Error('Invalid runtime chunk');return match[1]}).join('');
const tar=zlib.gunzipSync(Buffer.from(payload,'base64'));
function filesFromTar(buffer){const files=new Map();for(let offset=0;offset+512<=buffer.length;){const header=buffer.subarray(offset,offset+512);if(header.every(v=>v===0))break;const name=header.subarray(0,100).toString().replace(/\0.*$/s,'').replace(/^\.\//,'');const size=parseInt(header.subarray(124,136).toString().replace(/\0.*$/s,'').trim()||'0',8);offset+=512;if(name&&!name.endsWith('/'))files.set(name,buffer.subarray(offset,offset+size));offset+=Math.ceil(size/512)*512}return files}
const files=filesFromTar(tar);
for(const name of ['app.js','index.html','styles.css','tests/smoke-test.js','tests/integrity-test.js'])if(!files.has(name))throw new Error(`Missing ${name}`);
new vm.Script(files.get('app.js').toString(),{filename:'app.js'});
if(!files.get('index.html').toString().includes('Living Aquarium V5'))throw new Error('V5 marker missing');
console.log(JSON.stringify({ok:true,payloadBytes:tar.length,files:files.size},null,2));
