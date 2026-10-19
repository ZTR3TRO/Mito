// Service worker: registro y actualización segura. Solo en producción.
//
// Cuando hay un build nuevo, su SW queda en espera y esta página decide cuándo activarlo: nunca con una ronda
// del quiz a medias ni mientras se ve el resultado de la ronda; en cuanto se puede, le pide activarse. Al
// activarse, el SW avisa con su id de build y, si no coincide con el de esta página, se recarga una sola vez para
// no seguir corriendo con archivos de dos versiones. La partida (localStorage) no se toca en ningún momento.

import { on } from '../../core/bus.js';

const UPDATE_CHECK_MS = 30 * 60 * 1000;

// id del build de esta página (lo inyecta vite.config.js; en dev y en los tests no existe)
const BUILD = import.meta.env?.MITO_BUILD || 'dev';

let roundActive = false;
let waiting = null;
let reloadPending = false;
let reloaded = false;

// Buen momento para cambiar de versión: sin ronda en curso y sin el resultado de una ronda en pantalla.
function canSwitch(){
  if(roundActive) return false;
  const result = document.getElementById('quizResult');
  const onResult = document.body.dataset.view === 'quiz' && result?.style.display === 'block';
  return !onResult;
}

function trySwitch(){
  if(!canSwitch()) return;
  if(reloadPending && !reloaded){
    reloaded = true;
    location.reload();
    return;
  }
  if(waiting){
    waiting.postMessage({ type:'SKIP_WAITING' });
    waiting = null;
  }
}

function onWaiting(worker){
  // Sin controlador es la primera instalación: no hay nada viejo que mezclar, el SW se activa solo.
  if(!navigator.serviceWorker.controller) return;
  waiting = worker;
  trySwitch();
}

function watch(reg){
  if(reg.waiting) onWaiting(reg.waiting);
  reg.addEventListener('updatefound', ()=>{
    const worker = reg.installing;
    worker?.addEventListener('statechange', ()=>{
      if(worker.state === 'installed') onWaiting(worker);
    });
  });
  // Una pestaña que se queda abierta también se entera de los despliegues nuevos.
  setInterval(()=>reg.update().catch(()=>{}), UPDATE_CHECK_MS);
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) reg.update().catch(()=>{});
  });
}

export function init(){
  const env = import.meta.env;
  if(!env?.PROD || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
  document.documentElement.dataset.build = BUILD;

  on('quiz:started', ()=>{ roundActive = true; });
  on('quiz:finished', ()=>{ roundActive = false; });
  on('quiz:ended', ()=>{ roundActive = false; trySwitch(); });
  on('nav:after', trySwitch);

  navigator.serviceWorker.addEventListener('message', e=>{
    if(e.data?.type !== 'ACTIVATED' || e.data.build === BUILD) return;
    reloadPending = true;
    trySwitch();
  });

  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register(env.BASE_URL + 'sw.js').then(watch).catch(()=>{});
  });
}
