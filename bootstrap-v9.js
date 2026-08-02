(async()=>{
  'use strict';
  const status=document.querySelector('#runtime-status');
  const fail=error=>{console.error(error);status.className='error';status.textContent='Не удалось запустить Aquarium V9.\n\n'+(error?.message||error)};
  try{
    if(!Array.isArray(window.__AQ_PAYLOAD)||window.__AQ_PAYLOAD.length!==11)throw new Error('Повреждён комплект runtime-данных V6.');
    if(typeof DecompressionStream==='undefined')throw new Error('Нужен актуальный Chrome, Edge или Firefox.');
    const binary=atob(window.__AQ_PAYLOAD.join('')),packed=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)packed[i]=binary.charCodeAt(i);
    const stream=new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'));
    const tar=new Uint8Array(await new Response(stream).arrayBuffer()),files=new Map(),decoder=new TextDecoder();
    for(let offset=0;offset+512<=tar.length;){const header=tar.subarray(offset,offset+512);if(header.every(v=>v===0))break;const name=decoder.decode(header.subarray(0,100)).replace(/\0.*$/s,'').replace(/^\.\//,'');const size=parseInt(decoder.decode(header.subarray(124,136)).replace(/\0.*$/s,'').trim()||'0',8);offset+=512;if(name&&!name.endsWith('/'))files.set(name,tar.slice(offset,offset+size));offset+=Math.ceil(size/512)*512}
    const text=name=>{const value=files.get(name);if(!value)throw new Error('В payload отсутствует '+name);return decoder.decode(value)};
    const css=text('styles.css').replace(/<\/style/gi,'<\\/style'),app=text('app.js').replace(/<\/script/gi,'<\\/script');let html=text('index.html');
    html=html.replace(/<title>[^<]*<\/title>/,'<title>Living Aquarium V9 Reef Restoration Center</title>');
    html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>');
    html=html.replace('<script src="app.js"></script>','<script>'+app+'</script><script src="v7-expedition.js"></script><script src="v8-genetics.js"></script><script src="v9-restoration.js"></script>');
    document.open();document.write(html);document.close();
  }catch(error){fail(error)}
})();
