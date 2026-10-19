// La Casa de Mito: el cuarto a pantalla completa con Mito y su mascota, los gestos para jugar con él y la
// barra de acciones. Se compone de: room.js (la escena), gestures.js (dedo y ratón), motion.js (arrastrar y
// lanzar) y reactions.js (cara, frases y mascota). Lo único que guarda es cuántas veces mostró la pista.
//
// Avisa por el bus lo que pasa (house:poke, house:tickle, house:pet, house:grab, house:drop, house:land) para que
// las fases siguientes (necesidades, decoración) puedan reaccionar sin tocar los gestos.

import { byId } from '../../core/dom.js';
import { on, emit } from '../../core/bus.js';
import { getHouseHintCount, markHouseHintShown } from '../../state/store.js';
import { buildRoom, layoutRoom } from './room.js';
import { bindGestures } from './gestures.js';
import { createMotion } from './motion.js';
import { createReactions } from './reactions.js';

const reducedMotion = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const WELCOME_MS = 450;
const HINT_VISITS = 3;       // la pista sale en las primeras visitas
const HINT_MS = 7000;        // y se va sola a los 7 s (o al primer gesto)
const HINT_FADE_MS = 500;

export function init(){
  const room = byId('houseRoom'), mascot = byId('mascotHouse'), speech = byId('houseSpeech'), hint = byId('houseHint');
  if(!room || !mascot || !speech) return;
  buildRoom(room);

  // Pista de las primeras visitas.
  let hintTimer = 0;
  function hideHint(){
    if(!hint || hint.hidden) return;
    clearTimeout(hintTimer);
    hint.classList.remove('show');
    hintTimer = setTimeout(()=>{ hint.hidden = true; }, HINT_FADE_MS);
  }
  function maybeShowHint(){
    if(!hint || getHouseHintCount() >= HINT_VISITS) return;
    markHouseHintShown();
    clearTimeout(hintTimer);
    hint.hidden = false;
    requestFrame(()=> hint.classList.add('show'));
    hintTimer = setTimeout(hideHint, HINT_MS);
  }

  const reactions = createReactions(room, mascot, speech);
  const motion = createMotion(room, mascot, {
    onPaint: reactions.place,
    onHit: (kind, impact)=> reactions.hit(kind, impact),
    onSettle: bounced=>{ reactions.settle(bounced); emit('house:land', { bounced }); },
  });

  const cancelGesture = bindGestures(mascot, {
    onPetTap: ()=>{ hideHint(); reactions.petTap(); },
    onGesture: g=>{
      hideHint();
      // Mientras vuela o vuelve a su lugar, solo se le puede volver a agarrar.
      if(motion.busy && g.type !== 'grab' && g.type !== 'drag' && g.type !== 'drop') return;
      switch(g.type){
        case 'poke': reactions.poke(g.x, g.y); emit('house:poke'); break;
        case 'tickle': reactions.tickle(); emit('house:tickle'); break;
        case 'pet': reactions.stroke(); emit('house:pet'); break;
        case 'grab': motion.grab(g.x, g.y); reactions.grab(); emit('house:grab'); break;
        case 'drag': motion.drag(g.x, g.y); break;
        case 'drop': {
          const speed = motion.drop(g.vx, g.vy);
          reactions.release(speed, reducedMotion());
          emit('house:drop', { speed });
          break;
        }
      }
    },
  });

  // La escena se compone para el tamaño del cuarto; la luz además depende del modo (de día es más suave).
  const relight = ()=> layoutRoom(room);
  if(typeof ResizeObserver !== 'undefined') new ResizeObserver(()=>{ relight(); motion.repaint(); }).observe(room);
  on('theme:changed', ()=> requestFrame(relight));

  // En móvil el cuarto llega justo hasta la barra de navegación fija: se mide su alto real (cambia con la zona segura).
  const measureNav = ()=>{
    const nav = document.querySelector('.navgroup');
    const fixed = nav && window.getComputedStyle?.(nav).position === 'fixed';
    if(fixed && nav.offsetHeight) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    else document.documentElement.style.removeProperty('--nav-h');
  };
  window.addEventListener('resize', measureNav);

  let welcomeTimer = 0;
  on('nav:after', view=>{
    clearTimeout(welcomeTimer);
    if(view === 'house'){
      measureNav();
      requestFrame(relight);
      maybeShowHint();
      welcomeTimer = setTimeout(()=> reactions.welcome(), WELCOME_MS);
    } else {
      cancelGesture();
      motion.reset();
      reactions.clear();
      if(hint){ clearTimeout(hintTimer); hint.classList.remove('show'); hint.hidden = true; }
    }
  });
}

function requestFrame(fn){
  if(window.requestAnimationFrame) window.requestAnimationFrame(()=> fn());
  else fn();
}
