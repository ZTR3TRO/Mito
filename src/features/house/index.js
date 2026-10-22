// La Casa de Mito: la casa a pantalla completa (varios cuartos, uno al lado del otro) con Mito y su mascota, los
// gestos para jugar con él y la barra de acciones. Se compone de: room.js (la escena de cada cuarto), nav.js (la
// cámara: flechas, indicadores y la orilla), gestures.js (dedo y ratón), motion.js (arrastrar y lanzar), reactions.js (cara, frases y mascota), needs.js (cómo se notan sus necesidades), sleep.js (dormir),
// bath.js (bañar), food.js (comer) y decor.js (los muebles y el modo Decorar). Guarda cuántas veces mostró las
// pistas, las necesidades de Mito (state/house.js), la comida de la charola (state/pantry.js) y los muebles
// (state/decor.js).
//
// Avisa por el bus lo que pasa (house:poke, house:tickle, house:pet, house:grab, house:drop, house:land) para que
// las fases siguientes (necesidades, decoración) puedan reaccionar sin tocar los gestos. La Tienda pide abrir
// Decorar al llegar con house:focus ('decor').

import { byId } from '../../core/dom.js';
import { on, emit } from '../../core/bus.js';
import { getHouseHintCount, markHouseHintShown, getMito, setMito } from '../../state/store.js';
import { buildPanes, layoutRoom } from './room.js';
import { createNav } from './nav.js';
import { bindGestures } from './gestures.js';
import { createMotion } from './motion.js';
import { createReactions } from './reactions.js';
import { createNeeds } from './needs.js';
import { createSleep } from './sleep.js';
import { createBath } from './bath.js';
import { createFood } from './food.js';
import { createDecor } from './decor.js';

const reducedMotion = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const WELCOME_MS = 450;
const HINT_VISITS = 3;       // la pista sale en las primeras visitas
const HINT_MS = 7000;        // y se va sola a los 7 s (o al primer gesto)
const HINT_FADE_MS = 500;

export function init(){
  const room = byId('houseRoom'), mascot = byId('mascotHouse'), speech = byId('houseSpeech'), hint = byId('houseHint');
  if(!room || !mascot || !speech) return;
  buildPanes(room);

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
  const act = name => room.querySelector(`[data-house-act="${name}"]`);
  let needs = null;
  const refresh = ()=> needs?.render();
  const sleep = createSleep(room, mascot, reactions, { button: act('sleep'), onChange: refresh });
  const bath = createBath(room, mascot, reactions, { button: act('bath'), onChange: refresh });
  const food = createFood(room, mascot, reactions, { button: act('eat'), onChange: refresh });
  // La cámara. Con las flechas o los indicadores Mito te sigue, salvo si duerme; con la charola, el baño o Decorar
  // abiertos no se cambia de cuarto (style.css oculta flechas e indicadores con las mismas clases).
  let decor = null, motion = null;
  const nav = createNav(room, {
    follows: ()=> !sleep.asleep,
    onEdge: ()=> reactions.place(),
    canMove: ()=> !bath.bathing && !food.open && !decor?.active,
    onLeave: (from, to, how)=>{
      hideHint();
      if(how !== 'carry'){ motion?.reset(); reactions.clear(); }
    },
    onArrive: to=>{
      if(nav.mitoRoom === to && getMito().room !== to) setMito({ room: to });   // Mito llegó aquí: se guarda
      decor?.render();
    },
  });
  // Mito está en otro cuarto (se quedó dormido allá): las acciones primero llevan con él.
  const away = ()=> nav.mitoRoom !== nav.room;
  const toMito = ()=> away() && nav.go(nav.mitoRoom, 'dot');
  // Decorar no despierta a Mito: no es jugar con él. Si duerme o no está aquí, no comenta los muebles.
  decor = createDecor(room, reactions, { button: act('decor'), here: ()=> nav.room, canTalk: ()=> !sleep.asleep && !away(), onChange: refresh });
  needs = createNeeds(room, mascot, reactions, { busy: ()=> sleep.asleep || bath.bathing || food.eating || decor.active || away() });
  // Los botones nunca se deshabilitan: cada uno responde. "Dormir" o "Comer" durante el baño lo terminan primero;
  // "Bañar" o "Comer" mientras duerme lo despiertan con ternura (y luego ya se puede).
  act('eat')?.addEventListener('click', ()=>{
    hideHint();
    if(toMito()) return;
    if(sleep.asleep){ sleep.touch(); return; }
    if(bath.bathing){ bath.finish(); return; }
    food.toggle();
  });
  act('sleep')?.addEventListener('click', ()=>{
    hideHint();
    if(toMito()) return;
    if(bath.bathing){ bath.finish(); return; }
    sleep.toggle();
  });
  act('bath')?.addEventListener('click', ()=>{
    hideHint();
    if(toMito()) return;
    if(sleep.asleep){ sleep.touch(); return; }
    bath.toggle();
  });
  act('decor')?.addEventListener('click', ()=>{
    hideHint();
    if(bath.bathing){ bath.finish(); return; }
    food.close();
    decor.toggle();
  });
  motion = createMotion(room, mascot, {
    onPaint: reactions.place,
    onHit: (kind, impact)=> reactions.hit(kind, impact),
    onSettle: bounced=>{ reactions.settle(bounced); emit('house:land', { bounced }); },
  });

  const cancelGesture = bindGestures(mascot, {
    enabled: ()=> !bath.bathing && !food.eating && !decor.active,
    onPetTap: ()=>{ hideHint(); if(!sleep.asleep) reactions.petTap(); },
    onGesture: g=>{
      hideHint();
      needs.noteGesture();
      // Dormido: cualquier gesto lo despierta con ternura (abre un ojito) y no hace nada más.
      if(sleep.asleep){ if(g.type !== 'drag' && g.type !== 'drop') sleep.touch(); return; }
      // Mientras vuela o vuelve a su lugar, solo se le puede volver a agarrar.
      if(motion.busy && g.type !== 'grab' && g.type !== 'drag' && g.type !== 'drop') return;
      switch(g.type){
        case 'poke': reactions.poke(g.x, g.y); emit('house:poke'); break;
        case 'tickle': reactions.tickle(); emit('house:tickle'); break;
        case 'pet': reactions.stroke(); emit('house:pet'); break;
        case 'grab': motion.grab(g.x, g.y); reactions.grab(); emit('house:grab'); break;
        case 'drag': motion.drag(g.x, g.y); nav.edge(g.x); break;
        case 'drop': {
          nav.edge(null);
          const speed = motion.drop(g.vx, g.vy);
          reactions.release(speed, reducedMotion());
          emit('house:drop', { speed });
          break;
        }
      }
    },
  });

  // La escena se compone para el tamaño del cuarto; la luz además depende del modo (de día es más suave).
  const relight = ()=>{ layoutRoom(room); decor.render(); };
  if(typeof ResizeObserver !== 'undefined') new ResizeObserver(()=>{ relight(); motion.repaint(); }).observe(room);
  on('theme:changed', ()=> requestFrame(relight));
  // Si la partida cambia por fuera (importar, reiniciar, el panel de depuración), la Casa se repinta con el estado nuevo.
  let inHouse = false;
  on('state:changed', ()=>{ if(inHouse){ sleep.sync(); needs.render(); food.render(); decor.render(); } });
  // "Colocar en la Casa" en la Tienda: al llegar, Decorar ya está abierto.
  let openDecor = false;
  on('house:focus', what=>{
    if(what !== 'decor') return;
    if(inHouse) decor.open(); else openDecor = true;
  });

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
    inHouse = view === 'house';
    if(view === 'house'){
      measureNav();
      nav.show(getMito().room);   // la cámara aparece en el cuarto donde está Mito
      requestFrame(relight);
      maybeShowHint();
      const asleep = sleep.enter();
      needs.enter();
      const gifted = decor.enter();
      if(openDecor){ openDecor = false; decor.open(); }
      // un momento después: agradece el regalo, o si necesita algo lo pide; si no (y está despierto), saluda
      welcomeTimer = setTimeout(()=>{
        if(asleep) return;
        if(gifted) decor.thank();
        else if(!decor.active && !needs.ask(true)) reactions.welcome();
      }, WELCOME_MS);
    } else {
      cancelGesture();
      nav.edge(null);
      nav.leave();
      motion.reset();
      bath.leave();
      food.leave();
      decor.leave();
      sleep.leave();
      needs.leave();
      reactions.clear();
      if(hint){ clearTimeout(hintTimer); hint.classList.remove('show'); hint.hidden = true; }
    }
  });
}

function requestFrame(fn){
  if(window.requestAnimationFrame) window.requestAnimationFrame(()=> fn());
  else fn();
}
