// easter.js
//
// Dos easter eggs de toques sobre Mito. Los dos comparten el mismo contador y el mismo diálogo de premio:
//
//   1) 'tap10'   · En la portada, 10 toques seguidos a Mito → aura Panal + mascota Abejita.
//   2) 'perfect' · Termina una ronda SIN fallar ninguna pregunta y, en la pantalla de resultado,
//                  toca a Mito tantas veces como preguntas tuvo la ronda → mascota Ajolote.
//                  (8 preguntas = 8 toques, 50 preguntas = 50 toques.)

import { claimSparkClickEgg, SPARK_CLICK_EGG_REWARD, unlockSecrets } from '../state/store.js';
import { categoryOf, findItemById } from '../content/wardrobe.js';
import { itemThumb } from './mascot/avatar.js';
import { sparkAt } from './mascot/effects.js';

const TAPS = 10;
const SPARK_TAPS = 50;
const GAP_MS = 2500; // si pasas más de esto sin tocar, la cuenta vuelve a cero

// Cuenta toques seguidos sobre el <svg> de Mito dentro de `target`.
//   goal()      → toques necesarios ahora mismo (0 = apagado)
//   enabled()   → ¿se puede contar ahora?
//   hit(e)      → qué clicks cuentan
//   hints       → [{ at: 0.5, text }]: avisos cuando llevas esa fracción del camino
function tapCounter({ target, goal, enabled = ()=> true, hit = e=> e.target.closest('svg.mito'), hints = [], onHint, onGoal }){
  if(!target) return { reset(){} };
  let count = 0, timer;

  target.addEventListener('click', e=>{
    if(!hit(e) || !enabled()) return;
    const n = goal();
    if(!n) return;

    target.classList.remove('tickle');
    void target.offsetWidth;
    target.classList.add('tickle');

    clearTimeout(timer);
    count++;
    timer = setTimeout(()=>{ count = 0; }, GAP_MS);

    if(count >= n){
      count = 0;
      clearTimeout(timer);
      onGoal();
      return;
    }
    const hint = hints.find(h => count === Math.round(n * h.at));
    if(hint) onHint(hint.text);
  });

  return { reset(){ count = 0; clearTimeout(timer); } };
}

/* ---------- 1) Portada: 10 toques ---------- */
export function initEasterEgg({ target, say, onUnlock, onOpenWardrobe }){
  tapCounter({
    target,
    goal: ()=> TAPS,
    hints: [{ at: 0.5, text: '¡Jaja, me haces cosquillas! 😆' }, { at: 0.8, text: '¿Qué estás tramando…? 👀' }],
    onHint: say,
    onGoal: ()=>{
      const fresh = unlockSecrets('tap10');
      if(!fresh.length){
        say('¡Ya me sacaste todos mis secretos! 🐝');
        return;
      }
      onUnlock(fresh);
      showUnlockAlert(fresh, onOpenWardrobe, {
        kicker: '🐝 Secreto desbloqueado',
        title: '¡Encontraste el secreto de Mito!',
        text: 'Tocarme 10 veces tenía premio: ya tienes un aura oculta y una mascota nueva. Las encuentras en tu armario.',
      });
    },
  });
}

/* ---------- 2) Ronda perfecta: tantos toques como preguntas ---------- */
// Devuelve { arm(total) }: main.js lo arma al terminar una ronda perfecta (total = nº de preguntas)
// y lo apaga (arm(0)) en cualquier otra ronda.
export function initPerfectEgg({ target, enabled, onUnlock, onOpenWardrobe }){
  let armed = 0;

  const counter = tapCounter({
    target,
    goal: ()=> armed,
    enabled,
    hints: [{ at: 0.5, text: 'Mito se ríe bajito… 👀' }, { at: 0.8, text: '¡Sigue! Algo está despertando ✨' }],
    onHint: text => whisper(target, text),
    onGoal: ()=>{
      const total = armed;
      const fresh = unlockSecrets('perfect');
      if(!fresh.length){
        whisper(target, 'Ya tienes mi secreto de ronda perfecta 🌸');
        return;
      }
      onUnlock(fresh);
      showUnlockAlert(fresh, onOpenWardrobe, {
        kicker: '✨ Secreto desbloqueado',
        title: '¡Ronda perfecta, de verdad!',
        text: `Acertaste las ${total} y me tocaste ${total} veces. Por eso una mascota oculta quiere acompañarte. La encuentras en tu armario.`,
      });
    },
  });

  return { arm(total){ armed = total > 0 ? total : 0; counter.reset(); } };
}

/* ---------- 3) Chispas: 50 toques al saldo ---------- */
export function initSparkEgg({ targets, say }){
  const nodes = [...(targets || [])].filter(Boolean);
  let count = 0, timer;

  nodes.forEach(target=>{
    target.addEventListener('click', ()=>{
      clearTimeout(timer);
      count++;
      timer = setTimeout(()=>{ count = 0; }, GAP_MS);

      if(count < SPARK_TAPS) return;
      count = 0;
      clearTimeout(timer);

      if(claimSparkClickEgg()){
        sparkAt(target, `+${SPARK_CLICK_EGG_REWARD} ⚡`);
        say(`¡Encontraste una reserva secreta de chispas! +${SPARK_CLICK_EGG_REWARD} ⚡`);
        return;
      }
      say('Ya encontraste ese escondite de chispas ⚡');
    });
  });
}

// Globito breve sobre Mito (se reutiliza el mismo nodo).
const whisperTimers = new WeakMap();
function whisper(mascot, text){
  let bub = mascot.querySelector(':scope > .egg-whisper');
  if(!bub){
    bub = document.createElement('div');
    bub.className = 'egg-whisper';
    bub.setAttribute('role', 'status');
    mascot.appendChild(bub);
  }
  bub.textContent = text;
  bub.classList.add('show');
  clearTimeout(whisperTimers.get(mascot));
  whisperTimers.set(mascot, setTimeout(()=> bub.classList.remove('show'), 2200));
}

/* ---------- Diálogo de premio (compartido) ---------- */
function showUnlockAlert(ids, onOpenWardrobe, copy){
  const prev = document.activeElement;
  const prizes = ids.map(id=>{
    const cat = categoryOf(id);
    const item = findItemById(id);
    const isAura = cat === 'aura';
    return `<div class="egg-prize">
      <div class="ep-visual">${isAura ? `<span class="ep-aura" style="background:${item.swatch}"></span>` : itemThumb(cat, item)}</div>
      <div class="ep-name">${item.name}</div>
      <div class="ep-kind">${isAura ? 'Aura oculta' : 'Mascota'}</div>
    </div>`;
  }).join('');

  const back = document.createElement('div');
  back.className = 'egg-backdrop';
  back.innerHTML = `
    <div class="egg-card" role="alertdialog" aria-modal="true" aria-labelledby="eggTitle" aria-describedby="eggText">
      <span class="egg-kicker">${copy.kicker}</span>
      <h2 id="eggTitle">${copy.title}</h2>
      <p id="eggText">${copy.text}</p>
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
