// La Casa de Mito: el cuarto a pantalla completa con Mito y su mascota, los gestos para jugar con él y la
// barra de acciones. Se compone de: room.js (la escena), gestures.js (dedo y ratón) y motion.js (arrastrar y
// lanzar). Lo único que guarda es cuántas veces mostró la pista.
//
// Avisa por el bus lo que pasa (house:grab, house:drop, house:land) para que las fases siguientes puedan
// reaccionar sin tocar los gestos.

import { byId } from '../../core/dom.js';
import { on, emit } from '../../core/bus.js';
import { getHouseHintCount, markHouseHintShown } from '../../state/store.js';
import { buildRoom, layoutRoom } from './room.js';
import { bindGestures } from './gestures.js';
import { createMotion } from './motion.js';

const HINT_VISITS = 3;       // la pista sale en las primeras visitas
const HINT_MS = 7000;        // y se va sola a los 7 s (o al primer gesto)
const HINT_FADE_MS = 500;

export function init(){
  const room = byId('houseRoom'), mascot = byId('mascotHouse'), hint = byId('houseHint');
  if(!room || !mascot) return;
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

  const motion = createMotion(room, mascot, {
    onSettle: bounced=> emit('house:land', { bounced }),
  });

  const cancelGesture = bindGestures(mascot, {
    onPetTap: hideHint,
    onGesture: g=>{
      hideHint();
      switch(g.type){
        case 'grab': motion.grab(g.x, g.y); emit('house:grab'); break;
        case 'drag': motion.drag(g.x, g.y); break;
        case 'drop': emit('house:drop', { speed: motion.drop(g.vx, g.vy) }); break;
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

  on('nav:after', view=>{
    if(view === 'house'){
      measureNav();
      requestFrame(relight);
      maybeShowHint();
    } else {
      cancelGesture();
      motion.reset();
      if(hint){ clearTimeout(hintTimer); hint.classList.remove('show'); hint.hidden = true; }
    }
  });
}

function requestFrame(fn){
  if(window.requestAnimationFrame) window.requestAnimationFrame(()=> fn());
  else fn();
}
