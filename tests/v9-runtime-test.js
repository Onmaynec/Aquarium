'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const names=['chunk-00.js','chunk-01a.js','chunk-01b.js','chunk-01c.js','chunk-01d.js','chunk-01e.js','chunk-01f.js','chunk-01g.js','chunk-01h.js','chunk-02.js','chunk-03.js'];
const chunks=names.map(name=>fs.readFileSync(path.join(root,'runtime',name),'utf8'));
const payload=chunks.map(text=>{const match=text.match(/push\('([A-Za-z0-9+/=]+)'\)/);if(!match)throw new Error('Invalid runtime chunk');return match[1]}).join('');
const packed=Buffer.from(payload,'base64'),tar=zlib.gunzipSync(packed),files=new Map();
for(let offset=0;offset+512<=tar.length;){const header=tar.subarray(offset,offset+512);if(header.every(v=>v===0))break;const name=header.subarray(0,100).toString().replace(/\0.*$/s,'').replace(/^\.\//,'');const size=parseInt(header.subarray(124,136).toString().replace(/\0.*$/s,'').trim()||'0',8);const type=String.fromCharCode(header[156]||48);offset+=512;if(name&&type!=='5')files.set(name,tar.subarray(offset,offset+size));offset+=Math.ceil(size/512)*512}
for(const name of ['index.html','styles.css','app.js'])if(!files.has(name))throw new Error(`Missing ${name}`);
new vm.Script(files.get('app.js').toString(),{filename:'app.js'});
for(const name of ['v7-expedition.js','v8-genetics.js','v9-restoration.js','bootstrap-v9.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
const html=fs.readFileSync(path.join(root,'v9.html'),'utf8');
for(const marker of ['bootstrap-v9.js','runtime/chunk-00.js','Living Aquarium V9 Reef Restoration Center'])if(!html.includes(marker))throw new Error(`Missing HTML marker: ${marker}`);
console.log(JSON.stringify({ok:true,payloadBytes:packed.length,coreFiles:files.size,overlays:['v7','v8','v9']},null,2));
