// Service worker de Mito. Nunca toca localStorage (la partida): solo Cache Storage.
//
// - Cada build tiene su propia caché: vite.config.js reemplaza __MITO_BUILD__ por el id del build. Al activarse,
//   este SW borra las cachés de builds anteriores (incluida la vieja 'chispa-atp-v3').
// - Archivos con hash (/assets/): primero la caché; nunca cambian de contenido.
// - Todo lo demás (index.html, manifest, íconos): primero la red y la caché solo como respaldo sin conexión.
// - Un SW nuevo no toma el control por su cuenta: espera a que la página le diga que es buen momento
//   (sin una ronda del quiz a medias), para que una pestaña abierta no mezcle archivos de dos versiones.
// - En dev no se registra; aun así ignora las rutas de Vite por si quedó uno instalado de antes.

const BUILD = '__MITO_BUILD__';
const PREFIX = 'chispa-atp-';
const CACHE = PREFIX + BUILD;
const CORE = ['./', './index.html', './manifest.webmanifest'];
const DEV_PATHS = ['/src/', '/@vite/', '/@id/', '/@fs/', '/node_modules/'];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
});

self.addEventListener('message', (e)=>{
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX) && k !== CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
      .then(()=>self.clients.matchAll({ type:'window' }))
      .then(clients=>clients.forEach(c=>c.postMessage({ type:'ACTIVATED', build:BUILD })))
  );
});

function networkFirst(req, key = req){
  return fetch(req)
    .then(res=>{
      if(res && res.ok){
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(key, copy));
      }
      return res;
    })
    .catch(()=>caches.match(key).then(hit=>hit || Response.error()));
}

function cacheFirst(req){
  return caches.match(req).then(hit=>hit || fetch(req).then(res=>{
    if(res && res.ok){
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(req, copy));
    }
    return res;
  }));
}

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  const url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;
  if(DEV_PATHS.some(p=>url.pathname.includes(p))) return;

  if(req.mode === 'navigate'){
    e.respondWith(networkFirst(req, './index.html'));
    return;
  }
  e.respondWith(url.pathname.includes('/assets/') ? cacheFirst(req) : networkFirst(req));
});
