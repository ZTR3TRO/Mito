// Ventana de temporada (Halloween). Vigila si la tienda está abierta para poder
// avisar al usuario cuando la ventana se abra o se cierre, incluso si la app
// estuvo en segundo plano durante el cambio.

import { isSeasonalOpen } from '../../content/wardrobe.js';
import { byId } from '../../core/dom.js';
import { applyAvatar } from '../mascot/avatar.js';
import { renderShop } from './index.js';

const OPENED = 'La tienda de Halloween ya está abierta.';

let lastOpen = isSeasonalOpen();
let timer;

export function checkSeason(){
  const open = isSeasonalOpen();
  if(lastOpen === open) return;
  lastOpen = open;
  applyAvatar();
  renderShop();
  const notice = byId('shopNotice');
  if(notice) notice.textContent = lastOpen ? OPENED : 'La temporada ha terminado. Tus compras siguen disponibles en el armario.';
}

// Programa el siguiente chequeo justo a la medianoche, que es cuando la ventana
// puede cambiar. Se recalcula al volver a la app por si el dispositivo durmió.
function scheduleCheck(){
  clearTimeout(timer);
  checkSeason();
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  timer = setTimeout(scheduleCheck, Math.max(1, midnight - now));
}

export function init(){
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) scheduleCheck();
  });
  window.addEventListener('focus', scheduleCheck);
  scheduleCheck();
}