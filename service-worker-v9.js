'use strict';
const CACHE='living-aquarium-v9-restoration-v1';
const CORE=['./v9.html','./bootstrap-v9.js','./v7-expedition.js','./v8-genetics.js','./v9-restoration.js','./manifest-v9.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./runtime/chunk-00.js','./runtime/chunk-01a.js','./runtime/chunk-01b.js','./runtime/chunk-01c.js','./runtime/chunk-01d.js','./runtime/chunk-01e.js','./runtime/chunk-01f.js','./runtime/chunk-01g.js','./runtime/chunk-01h.js','./runtime/chunk-02.js','./runtime/chunk-03.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match('./v9.html'))))});
