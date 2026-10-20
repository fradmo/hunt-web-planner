const CACHE='hunt-planner-network-v2';
const OFFLINE=['./index.html','./i18n.js','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  await Promise.all(OFFLINE.map(async path=>{try{const r=await fetch(path,{cache:'reload'});if(r.ok)await c.put(path,r)}catch(e){}}));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('hunt-planner-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const c=await caches.open(CACHE);
    try{
      const r=await fetch(req,{cache:'no-store'});
      if(r.ok)await c.put(req,r.clone());
      return r;
    }catch(e){
      return (await c.match(req))||(req.mode==='navigate'?await c.match('./index.html'):undefined)||Response.error();
    }
  })());
});
