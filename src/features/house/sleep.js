// Dormir: el botón "Dormir" apaga la luz (el cuarto se oscurece y las cortinas se cierran), Mito cierra los ojos
// y salen zzz. La energía sube con el tiempo real, también con la app cerrada (state/house.js); al llenarse
// despierta solo, o cuando se enciende la luz ("Despertar"). Si tiene mucha energía (NEEDS.sleepBelow o más), no tiene
// sueño: lo dice y no se duerme. Si se sale de la Casa sigue durmiendo, y al volver se
// ve dormido o despierto según el tiempo que pasó. Un gesto lo despierta con ternura: abre un ojito primero.

import { getNeeds, startSleep, wakeUp, NEEDS } from '../../state/store.js';
import { MITO_SLEEP } from '../../content/house.js';
import { setFace } from '../mascot/face.js';

const CHECK_MS = 15e3;          // cada cuánto se mira si ya se llenó la energía (con la Casa abierta)
const PEEK_MS = 1300;           // el ojito entreabierto antes de despertar por un gesto

const ICONS = {
  sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  wake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
};

export function createSleep(room, mascot, reactions, { button, onChange = ()=>{} }){
  let asleep = false, active = false, timer = 0, peeking = false;

  function paint(){
    room.classList.toggle('is-asleep', asleep);
    if(asleep) setFace(mascot, 'normal');   // ojos cerrados (los párpados van sobre la cara normal)
    if(button){
      button.innerHTML = (asleep ? ICONS.wake : ICONS.sleep) + (asleep ? 'Despertar' : 'Dormir');
      button.classList.toggle('is-on', asleep);
      button.setAttribute('aria-pressed', asleep ? 'true' : 'false');
    }
  }

  // Lee el estado guardado. Si se despertó solo (energía llena), lo celebra.
  function sync(){
    const was = asleep;
    asleep = getNeeds().asleep;
    paint();
    if(was && !asleep && active){ reactions.sayFrom(MITO_SLEEP.woke, 'woke'); onChange(); }
    return asleep;
  }

  function sleep(){
    startSleep();
    asleep = true;
    reactions.clear();
    paint();
    onChange();
    reactions.sayFrom(MITO_SLEEP.goodnight, 'goodnight');
  }

  function wake(){
    peeking = false;
    mascot.classList.remove('peek');
    wakeUp();
    asleep = false;
    paint();
    onChange();
    reactions.sayFrom(MITO_SLEEP.woke, 'woke');
  }

  paint();

  return {
    get asleep(){ return asleep; },
    sync,
    toggle(){
      if(peeking) return;
      if(asleep) return wake();
      if(getNeeds().energy >= NEEDS.sleepBelow){
        mascot.style.setProperty('--poke-dir', 1);
        mascot.classList.remove('hr-side'); void mascot.offsetWidth; mascot.classList.add('hr-side');
        setTimeout(()=> mascot.classList.remove('hr-side'), 550);
        return reactions.sayFrom(MITO_SLEEP.notSleepy, 'not-sleepy');
      }
      sleep();
    },
    // Un gesto mientras duerme: abre un ojito, dice algo tierno y despierta.
    touch(){
      if(!asleep || peeking) return;
      peeking = true;
      mascot.classList.add('peek');
      reactions.sayFrom(MITO_SLEEP.peek, 'peek');
      setTimeout(()=>{ if(peeking) wake(); }, PEEK_MS);
    },
    enter(){
      active = true;
      clearInterval(timer);
      timer = setInterval(sync, CHECK_MS);
      return sync();
    },
    leave(){ active = false; clearInterval(timer); peeking = false; mascot.classList.remove('peek'); },
  };
}
