// La Casa de Mito: la casa a pantalla completa (varios cuartos, uno al lado del otro) con Mito y su mascota, los
// gestos para jugar con él y la barra de acciones. Se compone de: room.js (la escena de cada cuarto), nav.js (la
// cámara: flechas, indicadores y la orilla), gestures.js (dedo y ratón), motion.js (dónde está Mito: arrastrarlo,
// lanzarlo y que se quede donde cae, en el piso o sobre un mueble), seek.js (su silueta si un mueble lo tapa y
// "Traer a Mito"), reactions.js (cara, frases y mascota), needs.js (cómo se notan sus necesidades), sleep.js (dormir),
// bath.js (bañar), food.js (comer) y decor.js (los muebles y el modo Decorar). Guarda cuántas veces mostró las
// pistas, las necesidades de Mito (state/house.js), la comida de la charola (state/pantry.js) y los muebles
// (state/decor.js).
//
// Avisa por el bus lo que pasa (house:poke, house:tickle, house:pet, house:grab, house:drop, house:land) para que
// las fases siguientes (necesidades, decoración) puedan reaccionar sin tocar los gestos. La Tienda pide abrir
// Decorar al llegar con house:focus ('decor').

import { byId } from '../../core/dom.js';
import { on, emit } from '../../core/bus.js';
import { getHouseHintCount, markHouseHintShown, getMito, setMito, getNeeds, getPantry, NEEDS } from '../../state/store.js';
import { roomForNeed } from '../../content/rooms.js';
import { buildPanes, layoutRoom, roomLayout } from './room.js';
import { createNav, ROOM_ICONS } from './nav.js';
import { bindGestures } from './gestures.js';
import { createMotion } from './motion.js';
import { createReactions } from './reactions.js';
import { createNeeds } from './needs.js';
import { createSleep } from './sleep.js';
import { createBath } from './bath.js';
import { createFood } from './food.js';
import { createDecor } from './decor.js';
import { createSeek, COVERED } from './seek.js';
import { mitoBody, coverage, inFront, scaleAt, clearSpot } from './furniture-layout.js';

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
  // al dormir o despertar, la mascota se sube a la cama con Mito o baja de ella (motion.js)
  const sleep = createSleep(room, mascot, reactions, { button: act('sleep'), onChange: ()=>{ refresh(); motion?.petFollow(); } });
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
      seek.hide();
      if(how !== 'carry'){ motion?.reset(); reactions.clear(); }
    },
    onArrive: to=>{
      // Mito llegó contigo: entra al lugar de siempre del cuarto (con la orilla, se guarda donde lo sueltes)
      if(nav.mitoRoom === to && getMito().room !== to && !motion.busy){ save({ room: to }); motion.place(getMito()); }
      // la primera vez en este cuarto: su regalo, ya puesto (y Mito lo dice si está aquí y despierto)
      if(decor.gift(to)) setTimeout(()=>{ if(!away()) decor.thank(to); }, 500);
      decor?.render();
      needs?.render();
      look();
    },
  });
  // Mito está en otro cuarto (se quedó dormido allá): las acciones primero llevan con él.
  const away = ()=> nav.mitoRoom !== nav.room;
  const toMito = ()=> away() && nav.go(nav.mitoRoom, 'dot');
  // Decorar no despierta a Mito: no es jugar con él. Si duerme o no está aquí, no comenta los muebles.
  // Los muebles de su cuarto que quedan más al frente que él se dibujan delante (en la mano o en el aire, ninguno).
  decor = createDecor(room, reactions, {
    button: act('decor'), here: ()=> nav.room, canTalk: ()=> !sleep.asleep && !away(), onChange: refresh,
    mito: ()=> ({ room: nav.mitoRoom, y: motion?.busy || !motion?.rest ? Infinity : motion.rest.depth, on: motion?.busy ? null : motion?.rest?.on }),
  });
  // Si lo que necesita está en otro cuarto, un botón en la barra los lleva a los dos ("Cocina", "Baño", "Cuarto").
  const goChip = document.createElement('button');
  goChip.type = 'button';
  goChip.className = 'house-act go-chip';
  goChip.hidden = true;
  room.querySelector('.house-bar:not(.decor-tray)')?.prepend(goChip);
  let goTo = null;
  let goShop = false;
  function chip(need){
    goShop = need === 'hungry' && !Object.keys(getPantry()).length && !away() && !sleep.asleep;
    const there = roomForNeed(need);
    goTo = there && there.id !== nav.room && !away() && !sleep.asleep ? there : null;
    goChip.hidden = !goTo && !goShop;
    if(goShop){
      goChip.innerHTML = '<span>Comprar comida →</span>';
      goChip.setAttribute('aria-label', 'Ir a la Tienda: Comida para Mito');
    } else if(goTo){
      goChip.innerHTML = `${ROOM_ICONS[goTo.id]}<span>${goTo.name}</span>`;
      goChip.setAttribute('aria-label', `Ir con Mito: ${goTo.name}`);
    }
  }
  goChip.addEventListener('click', ()=>{
    hideHint();
    if(goShop){ emit('shop:focus', 'food'); emit('nav:request', 'shop'); }
    else if(goTo) nav.go(goTo.id, 'dot');
  });
  needs = createNeeds(room, mascot, reactions, {
    busy: ()=> sleep.asleep || bath.bathing || food.eating || decor.active || away(),
    here: ()=> nav.room, onNeed: chip,
  });

  // Las acciones aprovechan el lugar: a dormir, a la cama (si hay en el Cuarto); a comer, a una silla de la mesa.
  const HOP_WAIT = ()=> reducedMotion() ? 420 : 620;
  function hopTo(kinds, ids){
    const seat = decor.surfaces(nav.mitoRoom).filter(st => kinds.includes(st.kind) && (!ids || ids.includes(st.id)))
      .sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - (motion.rest?.x ?? 0)) - Math.abs((b.x0 + b.x1) / 2 - (motion.rest?.x ?? 0)))[0];
    if(!seat || motion.busy || motion.rest?.on === seat.id) return false;
    motion.hop((seat.x0 + seat.x1) / 2, seat.y, seat);
    return true;
  }
  // Los botones nunca se deshabilitan: cada uno responde. "Dormir" o "Comer" durante el baño lo terminan primero;
  // "Bañar" o "Comer" mientras duerme lo despiertan con ternura (y luego ya se puede).
  act('eat')?.addEventListener('click', ()=>{
    hideHint();
    if(toMito()) return;
    if(sleep.asleep){ sleep.touch(); return; }
    if(bath.bathing){ bath.finish(); return; }
    // al abrir la charola, si hay mesa, se sienta en una de sus sillas
    if(!food.open && hopTo(['sit'], ['m-table'])){ setTimeout(()=> food.toggle(), HOP_WAIT()); return; }
    food.toggle();
  });
  act('sleep')?.addEventListener('click', ()=>{
    hideHint();
    if(toMito()) return;
    if(bath.bathing){ bath.finish(); return; }
    // con sueño y una cama aquí, se acuesta en ella y luego se duerme (sin sueño, lo dice desde donde está)
    if(!sleep.asleep && getNeeds().energy < NEEDS.sleepBelow && hopTo(['lie'])){ setTimeout(()=> sleep.toggle(), HOP_WAIT()); return; }
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
  // Dónde está Mito: lo que se guarda (state/house.js) y lo que se ve (motion.js) siempre coinciden. Se vuelve a
  // poner en su lugar con cada cambio (p. ej. si mueves en Decorar el mueble donde está sentado, va con él). `saved`
  // es lo último que se guardó: si no cambió, la mascota no salta, lo alcanza con calma.
  let saved = '';
  function save(pos){ saved = JSON.stringify(setMito({ room: nav.mitoRoom, ...pos })); }
  let syncing = false;
  function sync(){
    if(syncing) return;
    let pos = getMito();
    // el mueble donde estaba sentado se guardó o se fue a otro cuarto: baja al piso, frente a donde estaba (primero
    // se mueve y después se guarda, porque guardar vuelve a avisar del cambio)
    const was = motion.rest;
    if(was?.on && !pos.on && pos.room === nav.mitoRoom && !motion.busy){
      const floor = motion.saved({ x: was.x, y: was.depth, on: null, depth: was.depth });
      motion.place({ room: pos.room, ...floor }, { petInstant: false });
      syncing = true;
      try{ save(floor); } finally { syncing = false; }
      pos = getMito();
    }
    const same = JSON.stringify(pos) === saved;
    saved = JSON.stringify(pos);
    if(!motion.busy) motion.place(pos, { petInstant: !same });
  }
  motion = createMotion(room, mascot, {
    geometry: ()=>{ const L = roomLayout(room); return L ? { L, seats: decor.surfaces(nav.mitoRoom) } : null; },
    onPaint: reactions.place,
    asleep: ()=> sleep.asleep,
    onHit: (kind, impact)=> reactions.hit(kind, impact),
    onSettle: (rest, bounced)=>{
      save(motion.saved(rest));
      decor.render();   // los muebles que quedan delante de él, delante
      look();
      reactions.settle(bounced);
      emit('house:land', { bounced });
    },
  });

  // ¿Se ve? Si un mueble lo tapa en su mayoría, su silueta y "Traer a Mito"; si está en otro cuarto, "Ir con Mito".
  const seek = createSeek(room, mascot, {
    onBring: ()=>{
      if(away()){ nav.go(nav.mitoRoom, 'dot'); return; }
      const L = roomLayout(room);
      if(!L || motion.busy) return;
      const to = clearSpot(L, decor.placed(nav.mitoRoom), motion.rest?.x);
      seek.hide();
      motion.hop(to.x, to.y);
    },
  });
  function look(){
    const L = roomLayout(room), r = motion.rest;
    if(!L || !r || motion.busy || !inHouse || nav.moving){ seek.hide(); return; }
    if(away()){ seek.update({ away: true }); return; }
    const cov = coverage(mitoBody(L, r.x, r.y, scaleAt(L, r.depth)), inFront(L, decor.placed(nav.mitoRoom), r.depth));
    seek.update({ covered: cov >= COVERED });
  }

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
        case 'grab': motion.grab(g.x, g.y); decor.render(); seek.hide(); reactions.grab(); emit('house:grab'); break;
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
  // Al cambiar de tamaño, Mito se vuelve a poner donde está guardado (sus px cambian).
  const relight = ()=>{ layoutRoom(room); if(!motion.busy) motion.place(getMito()); decor.render(); look(); };
  if(typeof ResizeObserver !== 'undefined') new ResizeObserver(()=> relight()).observe(room);
  on('theme:changed', ()=> requestFrame(relight));
  // Si la partida cambia por fuera (importar, reiniciar, el panel de depuración, guardar un mueble donde estaba
  // sentado…), la Casa se repinta con el estado nuevo.
  let inHouse = false;
  on('state:changed', ()=>{ if(inHouse){ sleep.sync(); needs.render(); food.render(); sync(); decor.render(); look(); } });
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
  window.addEventListener('orientationchange', measureNav);
  window.visualViewport?.addEventListener('resize', measureNav);   // la barra de direcciones de Safari sube y baja

  // Candado de scroll (con el CSS de la Casa): en el iPhone el rebote de Safari solo se detiene con un touchmove no
  // pasivo. Las bandejas (.ft-list) se siguen deslizando de lado.
  document.addEventListener('touchmove', e=>{
    if(inHouse && e.cancelable && !e.target.closest?.('.ft-list, [role="alertdialog"], [role="dialog"]')) e.preventDefault();
  }, { passive: false });

  let welcomeTimer = 0;
  on('nav:after', view=>{
    clearTimeout(welcomeTimer);
    inHouse = view === 'house';
    if(view === 'house'){
      measureNav();
      nav.show(getMito().room);   // la cámara aparece en el cuarto donde está Mito
      saved = '';
      requestFrame(relight);
      maybeShowHint();
      const asleep = sleep.enter();
      if(asleep) motion.petFollow(true);   // ya dormido: la mascota está en la cama desde el principio
      needs.enter();
      decor.enter();
      const gifted = decor.gift(nav.room);
      if(openDecor){ openDecor = false; decor.open(); }
      // un momento después: agradece el regalo, o si necesita algo lo pide; si no (y está despierto), saluda
      welcomeTimer = setTimeout(()=>{
        if(asleep) return;
        if(gifted) decor.thank(nav.room);
        else if(!decor.active && !needs.ask(true)) reactions.welcome();
      }, WELCOME_MS);
    } else {
      cancelGesture();
      nav.edge(null);
      nav.leave();
      motion.reset();
      seek.hide();
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
