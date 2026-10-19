import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Id de este build. Va en el service worker (cada despliegue estrena caché y borra las anteriores) y en la página
// (para saber si el SW que se activa es de otra versión y hay que recargar una vez). Ver public/sw.js y
// src/features/pwa/update.js.
const BUILD_ID = Date.now().toString(36);

// Escribe el id del build en dist/sw.js (public/ se copia tal cual, con el marcador __MITO_BUILD__).
function swBuildId(){
  let outDir;
  return {
    name: 'mito-sw-build-id',
    apply: 'build',
    configResolved(config){ outDir = resolve(config.root, config.build.outDir); },
    closeBundle(){
      const file = resolve(outDir, 'sw.js');
      const src = readFileSync(file, 'utf8');
      const out = src.replace("const BUILD = '__MITO_BUILD__';", `const BUILD = '${BUILD_ID}';`);
      if(out === src) throw new Error('sw.js: no se encontró el marcador __MITO_BUILD__');
      writeFileSync(file, out);
    },
  };
}

// En dev no debe haber service worker: si quedó uno de antes (el commit inicial lo registraba también en dev),
// sirve módulos viejos de su caché y rompe imports (p. ej. "does not provide an export named initPerfectEgg").
// Este script va en el HTML y no en main.js porque main.js podría llegar viejo desde esa misma caché. Solo toca
// el registro del SW y las cachés de Mito; localStorage (la partida) no.
const DEV_SW_CLEANUP = `
if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(function(regs){
    var had = !!navigator.serviceWorker.controller;
    return Promise.all(regs.map(function(r){ return r.unregister(); }))
      .then(function(){ return window.caches ? caches.keys() : []; })
      .then(function(keys){ return Promise.all(keys.filter(function(k){ return k.indexOf('chispa-atp-') === 0; }).map(function(k){ return caches.delete(k); })); })
      .then(function(){
        // la página actual aún la controla el SW viejo: se recarga una sola vez para quedar libre
        if(had && !sessionStorage.getItem('mito-sw-cleanup')){ sessionStorage.setItem('mito-sw-cleanup', '1'); location.reload(); }
      });
  });
}`;
function devSwCleanup(){
  return {
    name: 'mito-dev-sw-cleanup',
    apply: 'serve',
    transformIndexHtml: () => [{ tag: 'script', children: DEV_SW_CLEANUP, injectTo: 'head-prepend' }],
  };
}

export default defineConfig({
  // Rutas relativas: el build funciona en GitHub Pages / subcarpetas
  base: './',
  plugins: [swBuildId(), devSwCleanup()],
  define: {
    'import.meta.env.MITO_BUILD': JSON.stringify(BUILD_ID),
  },
  server: {
    // Escucha en todas las interfaces, no solo en localhost.
    // Esto suele arreglar el error de WebSocket cuando el proyecto
    // corre dentro de una VM, contenedor, sandbox o se accede
    // desde otro dispositivo en la misma red.
    host: true,
    port: 5173,
    strictPort: true,

    // Si accedes al proyecto a través de un túnel/proxy HTTPS
    // (por ejemplo un enlace de vista previa con "?token=...",
    // Codespaces, StackBlitz, ngrok, etc.), el navegador intenta
    // abrir el WebSocket de HMR directo a localhost:5173, que no
    // existe desde tu punto de vista externo. Descomenta y ajusta
    // estas líneas con el dominio/puerto público que te da esa
    // herramienta:
    //
    // hmr: {
    //   protocol: 'wss',
    //   host: 'tu-dominio-publico.ejemplo.com',
    //   clientPort: 443,
    // },
  },
});
