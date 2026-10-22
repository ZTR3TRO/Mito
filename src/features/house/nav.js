// La cámara de la casa: qué cuarto se ve y cómo se cambia. La casa es horizontal (content/rooms.js, de izquierda a
// derecha) y hay tres formas de moverse:
//   - las flechas a los lados (al cuarto de al lado);
//   - los indicadores de abajo (un botón por cuarto: salta directo; el actual lleva su nombre y un puntito marca
//     dónde está Mito si no es aquí);
//   - llevar a Mito a la orilla: con Mito en la mano junto al borde, un anillo se llena y la cámara avanza con él.
//     Soltarlo antes lo deja ahí; lanzarlo contra la pared no cambia de cuarto (solo cuenta en la mano).
// Deslizar el dedo por el cuarto no mueve la cámara: así nunca se confunde con acariciar a Mito.
//
// El parallax es CSS (style.css): aquí solo se escribe --cam (el cuarto que se ve, con decimales mientras se mueve),
// --lag (cuánto se queda atrás lo lejano: 0 con la cámara quieta, lo más a medio camino) y --mito-at (el cuarto de
// Mito menos la cámara: Mito va con su cuarto). Con las flechas o los indicadores Mito te
// sigue (sale con su cuarto y entra por la puerta del nuevo), salvo si duerme: entonces se queda y el cuarto donde
// está se ve sin él. Con movimiento reducido no hay deslizamiento: el cuarto cambia de golpe.

import { ROOMS, findRoom } from '../../content/rooms.js';

const MOVE_MS = 650;     // lo que tarda la cámara en pasar de un cuarto al de al lado (más lejos, un poco más)
const ENTER_MS = 420;    // Mito entrando por la puerta
const TOAST_MS = 1400;   // el nombre del cuarto al llegar
const EDGE = { share: .14, min: 56, holdMs: 700 };   // la orilla: franja del borde y cuánto hay que mantenerlo ahí
const LAG = .1;          // lo lejano (pared, ventana) se queda atrás hasta este tanto del ancho, a medio camino

const reduced = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const raf = cb => (window.requestAnimationFrame ? window.requestAnimationFrame(cb) : setTimeout(()=> cb(Date.now()), 16));
const caf = id => (window.cancelAnimationFrame ? window.cancelAnimationFrame(id) : clearTimeout(id));
const now = ()=> (typeof performance !== 'undefined' ? performance.now() : Date.now());
const ease = k => k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2;

const SVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ROOM_ICONS = {
  bedroom: SVG('<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10.5" r="1.6"/>'),
  bath: SVG('<path d="M4 12h16v1.5A5.5 5.5 0 0 1 14.5 19h-5A5.5 5.5 0 0 1 4 13.5Z"/><path d="M6 12V6.5a2.2 2.2 0 0 1 4-1.3"/><path d="M7.5 19l-1 2M16.5 19l1 2"/>'),
  living: SVG('<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2.5 13a2 2 0 0 1 4 0v1.5h11V13a2 2 0 0 1 4 0v5H2.5Z"/><path d="M5 18v2M19 18v2"/>'),
  kitchen: SVG('<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/>'),
};
const ARROW = { left: SVG('<path d="m15 5-7 7 7 7"/>').replace('stroke-width="2"', 'stroke-width="3"'), right: SVG('<path d="m9 5 7 7-7 7"/>').replace('stroke-width="2"', 'stroke-width="3"') };

// onLeave(from, to, how) antes de moverse; onArrive(to, how) al llegar. how: 'arrow' | 'dot' | 'carry'.
// follows(): si Mito te sigue (no, si duerme). canMove(): si se puede cambiar de cuarto ahora.
// onEdge(): la orilla apareció o se fue (para que el globo de Mito se acomode sin encimarse con ella).
export function createNav(room, { onLeave = ()=>{}, onArrive = ()=>{}, onEdge = ()=>{}, follows = ()=> true, canMove = ()=> true } = {}){
  const el = (tag, cls, html = '') => { const e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; };
  const arrows = {
    left: el('button', 'room-arrow left', ARROW.left + '<span></span>'),
    right: el('button', 'room-arrow right', ARROW.right + '<span></span>'),
  };
  Object.values(arrows).forEach(b => { b.type = 'button'; });
  const dots = el('nav', 'room-dots', ROOMS.map(r => `<button type="button" class="rd" data-room="${r.id}" aria-label="${r.name}">${ROOM_ICONS[r.id]}<span>${r.name}</span></button>`).join(''));
  dots.setAttribute('aria-label', 'Cuartos de la casa');
  const toast = el('p', 'room-toast');
  toast.setAttribute('role', 'status');
  const edgeEl = el('div', 'edge-go', '<i></i><span class="eg-arrow"></span><b></b>');
  edgeEl.setAttribute('aria-hidden', 'true');
  const frames = ROOMS.slice(1).map((r, j) => { const f = el('div', 'door-frame'); f.style.setProperty('--j', j + 1); f.setAttribute('aria-hidden', 'true'); return f; });
  room.append(...frames, arrows.left, arrows.right, dots, toast, edgeEl);
  const stage = room.querySelector('.stage-scene');

  let index = 0, cam = 0, mito = 0, frame = 0, moving = false, carrying = false, toastTimer = 0, enterFrame = 0;
  let edge = { side: null, start: 0, armed: true, frame: 0 };

  // lag: el desfase del parallax en px (0 con la cámara quieta).
  function setCam(v, lag = 0){
    cam = v;
    room.style.setProperty('--cam', v.toFixed(4));
    room.style.setProperty('--lag', lag.toFixed(1) + 'px');
    if(carrying) mito = v;
    const at = mito - v;
    room.style.setProperty('--mito-at', at.toFixed(4));
    room.classList.toggle('mito-away', Math.abs(at) > .999);
  }
  function paint(){
    const prev = ROOMS[index - 1], next = ROOMS[index + 1];
    arrows.left.hidden = !prev; arrows.right.hidden = !next;
    if(prev){ arrows.left.setAttribute('aria-label', `Ir a ${prev.name}`); arrows.left.querySelector('span').textContent = prev.name; }
    if(next){ arrows.right.setAttribute('aria-label', `Ir a ${next.name}`); arrows.right.querySelector('span').textContent = next.name; }
    const mitoRoom = ROOMS[Math.round(mito)]?.id;
    dots.querySelectorAll('.rd').forEach((b, i)=>{
      b.setAttribute('aria-current', i === index ? 'true' : 'false');
      b.classList.toggle('has-mito', i !== index && ROOMS[i].id === mitoRoom);
      b.setAttribute('aria-label', ROOMS[i].name + (i !== index && ROOMS[i].id === mitoRoom ? ' (Mito está aquí)' : ''));
    });
    room.querySelectorAll('.pane').forEach((p, i)=> p.classList.toggle('has-mito', i === Math.round(mito)));
    room.dataset.cam = ROOMS[index].id;
  }
  function showToast(){
    const r = ROOMS[index];
    toast.innerHTML = `${ROOM_ICONS[r.id]}<span>${r.name}</span>`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), TOAST_MS);
  }

  // Mito entra por la puerta del lado de donde viene (dir = 1 si la cámara fue a la derecha).
  function enter(dir){
    caf(enterFrame);
    if(!stage) return;
    if(reduced()){ stage.style.removeProperty('opacity'); room.style.removeProperty('--enter'); return; }
    const from = -dir * room.clientWidth * .4, start = now();
    const step = t=>{
      const k = Math.min(1, (t - start) / ENTER_MS), e = 1 - (1 - k) ** 3;
      room.style.setProperty('--enter', (from * (1 - e)).toFixed(1) + 'px');
      stage.style.opacity = Math.min(1, k * 1.6).toFixed(2);
      if(k < 1) enterFrame = raf(step);
      else { room.style.removeProperty('--enter'); stage.style.removeProperty('opacity'); }
    };
    enterFrame = raf(step);
  }

  // Ir a un cuarto. how: 'arrow' | 'dot' | 'carry' (Mito en la mano, por la orilla).
  function go(id, how = 'dot'){
    const to = ROOMS.findIndex(r => r.id === id);
    if(to < 0 || to === index || moving || !canMove(how)) return false;
    const from = index, dir = Math.sign(to - from);
    const follow = how === 'carry' ? false : follows();
    onLeave(ROOMS[from].id, ROOMS[to].id, how);
    carrying = how === 'carry';
    moving = true;
    index = to;
    paint();
    room.classList.add('is-moving');
    const arrive = ()=>{
      moving = false;
      room.classList.remove('is-moving');
      if(carrying){ carrying = false; mito = to; }
      if(follow){ mito = to; setCam(to); enter(dir); }
      else setCam(to);
      paint();
      showToast();
      onArrive(ROOMS[to].id, how);
    };
    caf(frame);
    if(reduced()){ setCam(to); arrive(); return true; }
    const start = now(), c0 = cam, ms = MOVE_MS * (1 + .25 * (Math.abs(to - from) - 1)), W = room.clientWidth;
    const step = t=>{
      const k = Math.min(1, (t - start) / ms);
      setCam(c0 + (to - c0) * ease(k), dir * LAG * W * Math.sin(Math.PI * ease(k)));
      if(k < 1) frame = raf(step); else arrive();
    };
    frame = raf(step);
    return true;
  }

  /* ---------- la orilla ---------- */
  function edgeOff(){
    caf(edge.frame);
    const was = edge.side;
    edge.side = null;
    edgeEl.classList.remove('show', 'left', 'right');
    if(was) onEdge();
  }
  // Mientras Mito va en la mano: x = posición del dedo (px de la pantalla), o null al soltarlo.
  function edgeAt(x){
    if(x == null){ edgeOff(); edge.armed = true; return; }
    const r = room.getBoundingClientRect(), zone = Math.max(EDGE.min, r.width * EDGE.share);
    const side = x <= r.left + zone ? 'left' : x >= r.right - zone ? 'right' : null;
    const target = side && ROOMS[index + (side === 'right' ? 1 : -1)];
    if(!side || !target || moving || !canMove('carry')){ edgeOff(); if(!side) edge.armed = true; return; }
    if(!edge.armed || edge.side === side) return;
    // empieza a llenarse el anillo
    edge.side = side;
    edge.start = now();
    edgeEl.classList.add('show', side);
    edgeEl.classList.remove(side === 'right' ? 'left' : 'right');
    edgeEl.querySelector('.eg-arrow').innerHTML = ARROW[side];
    edgeEl.querySelector('b').textContent = target.name;
    onEdge();
    const tick = t=>{
      if(edge.side !== side) return;
      const k = Math.min(1, (t - edge.start) / EDGE.holdMs);
      edgeEl.style.setProperty('--p', k.toFixed(3));
      if(k < 1){ edge.frame = raf(tick); return; }
      edgeOff();
      edge.armed = false;   // para seguir al siguiente hay que salir de la orilla y volver
      go(target.id, 'carry');
    };
    edge.frame = raf(tick);
  }

  arrows.left.addEventListener('click', ()=>{ const r = ROOMS[index - 1]; if(r) go(r.id, 'arrow'); });
  arrows.right.addEventListener('click', ()=>{ const r = ROOMS[index + 1]; if(r) go(r.id, 'arrow'); });
  dots.addEventListener('click', e=>{ const b = e.target.closest('.rd'); if(b) go(b.dataset.room, 'dot'); });

  setCam(0);
  paint();

  return {
    get room(){ return ROOMS[index].id; },
    get mitoRoom(){ return ROOMS[Math.round(mito)].id; },
    get moving(){ return moving; },
    go,
    edge: edgeAt,
    // Al entrar a la Casa: la cámara aparece (sin moverse) en el cuarto donde está Mito.
    show(id){
      const i = Math.max(0, ROOMS.findIndex(r => r.id === (findRoom(id) ? id : ROOMS[0].id)));
      caf(frame); caf(enterFrame);
      moving = false; carrying = false;
      index = i; mito = i;
      room.classList.remove('is-moving');
      room.style.removeProperty('--enter'); stage?.style.removeProperty('opacity');
      setCam(i);
      paint();
    },
    leave(){ caf(frame); caf(enterFrame); edgeOff(); clearTimeout(toastTimer); toast.classList.remove('show'); },
  };
}
