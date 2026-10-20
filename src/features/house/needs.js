// Cómo se notan las necesidades de Mito en la Casa: su cara, su aspecto y lo que dice. Nada más: no hay barras
// ni números, y fuera de la Casa Mito siempre se ve normal (todo esto son clases y variables del cuarto).
//
//   data-need="sleepy|dirty|sad" en el cuarto: la necesidad baja más importante (state/house.js, topNeed)
//   --dirt (0 a 1): cuánto polvito se ve (aparece debajo de NEEDS.low de limpieza)
//   is-asleep: dormido (lo maneja sleep.js con el mismo estado)
//
// Frases: como mucho una por minuto, solo si no hubo gestos en los últimos 10 s, nunca durmiendo ni bañándose.
// Los cariños (del bus) suben el ánimo; si eso lo saca de "triste", lo agradece.

import { on } from '../../core/bus.js';
import { getNeeds, topNeed, careMood, NEEDS } from '../../state/store.js';
import { MITO_NEEDS, MITO_THANKS } from '../../content/house.js';
import { DIRT } from '../../content/art/house.js';

const PHRASE_GAP_MS = 60e3;      // una frase de necesidad por minuto, como mucho
const QUIET_AFTER_GESTURE_MS = 10e3;
const TICK_MS = 5e3;

export function createNeeds(room, mascot, reactions, { busy }){
  mascot.insertAdjacentHTML('beforeend', DIRT);
  let active = false, timer = 0, lastGesture = 0, lastPhrase = 0;

  function render(){
    const n = getNeeds();
    const need = n.asleep ? '' : topNeed(n);
    // el hambre todavía no se ve (llega con la comida, en la Fase 3)
    room.dataset.need = need && need !== 'hungry' ? need : '';
    const dirt = Math.max(0, Math.min(1, (NEEDS.low - n.clean) / (NEEDS.low - NEEDS.floor)));
    room.style.setProperty('--dirt', dirt.toFixed(2));
    reactions.setBase(need === 'sad' ? 'sad' : 'normal');
    return { n, need };
  }

  // Pide lo que necesita (si toca). Devuelve true si dijo algo.
  function ask(force = false){
    const now = Date.now();
    if(!active || busy()) return false;
    if(!force && (now - lastGesture < QUIET_AFTER_GESTURE_MS || now - lastPhrase < PHRASE_GAP_MS)) return false;
    const { need } = render();
    if(!need || !MITO_NEEDS[need]) return false;
    lastPhrase = now;
    reactions.sayFrom(MITO_NEEDS[need], 'need-' + need);
    return true;
  }

  // Los cariños de la Fase 1 suben el ánimo (con tope por minuto: state/house.js).
  const care = ()=>{
    const before = getNeeds().mood;
    if(careMood() > 0){
      const after = render().n.mood;
      if(before < NEEDS.low && after >= NEEDS.low) setTimeout(()=> reactions.sayFrom(MITO_THANKS.mood, 'thanks-mood'), 900);
    }
  };
  ['house:poke', 'house:tickle', 'house:pet', 'house:land'].forEach(ev => on(ev, care));

  return {
    render,
    noteGesture(){ lastGesture = Date.now(); },
    // Al entrar se aplica el estado; un momento después, si necesita algo, lo pide (en vez del saludo).
    enter(){
      active = true;
      clearInterval(timer);
      timer = setInterval(()=>{ render(); ask(); }, TICK_MS);
      render();
    },
    ask,
    leave(){ active = false; clearInterval(timer); },
  };
}
