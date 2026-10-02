// easter.js

import { unlockSecrets } from '../state/store.js';
import { categoryOf, findItemById } from '../content/wardrobe.js';
import { itemThumb } from './mascot/avatar.js';

const TAPS = 10;
const GAP_MS = 2500;

export function initEasterEgg({ target, say, onUnlock, onOpenWardrobe }){
  if(!target) return;
  let count = 0, timer;

  target.addEventListener('click', e=>{
    if(!e.target.closest('svg.mito')) return;
    target.classList.remove('tickle');
    void target.offsetWidth;
    target.classList.add('tickle');

    clearTimeout(timer);
    count++;
    timer = setTimeout(()=>{ count = 0; }, GAP_MS);

    if(count === 5) say('¡Jaja, me haces cosquillas! 😆');
    else if(count === 8) say('¿Qué estás tramando…? 👀');
    else if(count >= TAPS){
      count = 0;
      clearTimeout(timer);
      reveal();
    }
  });

  function reveal(){
    const fresh = unlockSecrets();
    if(!fresh.length){
      say('¡Ya me sacaste todos mis secretos! 🐝');
      return;
    }
    onUnlock(fresh);
    showUnlockAlert(fresh, onOpenWardrobe);
  }
}

function showUnlockAlert(ids, onOpenWardrobe){
  const prev = document.activeElement;
  const prizes = ids.map(id=>{
    const isAura = categoryOf(id) === 'aura';
    const item = findItemById(id);
    return `<div class="egg-prize">
      <div class="ep-visual">${isAura ? `<span class="ep-aura" style="background:${item.swatch}"></span>` : itemThumb('pet', item)}</div>
      <div class="ep-name">${item.name}</div>
      <div class="ep-kind">${isAura ? 'Aura oculta' : 'Mascota'}</div>
    </div>`;
  }).join('');

  const back = document.createElement('div');
  back.className = 'egg-backdrop';
  back.innerHTML = `
    <div class="egg-card" role="alertdialog" aria-modal="true" aria-labelledby="eggTitle" aria-describedby="eggText">
      <span class="egg-kicker">🐝 Secreto desbloqueado</span>
      <h2 id="eggTitle">¡Encontraste el secreto de Mito!</h2>
      <p id="eggText">Tocarme 10 veces tenía premio: ya tienes un aura oculta y una mascota nueva. Las encuentras en tu armario.</p>
      <div class="egg-prizes">${prizes}</div>
      <div class="egg-actions">
        <button type="button" class="egg-btn primary" data-egg="wardrobe">Ir al armario</button>
        <button type="button" class="egg-btn ghost" data-egg="close">Seguir jugando</button>
      </div>
    </div>`;
  document.body.appendChild(back);

  const btns = [...back.querySelectorAll('.egg-btn')];
  const close = (goWardrobe)=>{
    document.removeEventListener('keydown', onKey, true);
    back.remove();
    if(goWardrobe) onOpenWardrobe();
    else if(prev && prev.focus) prev.focus({ preventScroll:true });
  };
  function onKey(e){
    if(e.key === 'Escape'){ e.preventDefault(); close(false); }
    else if(e.key === 'Tab'){
      e.preventDefault();
      const i = btns.indexOf(document.activeElement);
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  }
  document.addEventListener('keydown', onKey, true);
  back.addEventListener('click', e=>{
    if(e.target === back) close(false);
    const b = e.target.closest('[data-egg]');
    if(b) close(b.dataset.egg === 'wardrobe');
  });
  btns[0].focus();
}