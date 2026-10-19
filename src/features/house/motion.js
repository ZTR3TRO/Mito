// Movimiento de Mito en la Casa: seguir al dedo, lanzarlo con física y devolverlo a su lugar.
// La física es pura (core/physics.js) y trabaja en "altos de cuarto"; aquí se mide el cuarto, se avanza
// la simulación en cada cuadro y se pinta el resultado en variables CSS del cuarto (--fly-x, --fly-y, --lift).
// Solo se mueven Mito, su aura y su rubor; la mascota se queda en el piso (ver .room .mascot en style.css).
//
// Con prefers-reduced-motion no hay rebote: al soltarlo se desvanece y reaparece en su lugar.

import { advance, clampToRoom } from '../../core/physics.js';

const REST_MS = 300;        // quieto en el piso este tiempo antes de volver a su lugar
const RETURN_MS = 600;      // lo que tarda en volver a su lugar
const FADE_MS = 180;        // desvanecido con movimiento reducido (cada mitad)
// Medidas del dibujo de Mito (viewBox 150): pies en y 131, antenas arriba en y −5, cuerpo de x 23 a 127.
const FEET = 131 / 150, TOP = (131 + 5) / 150, HALF_W = 52 / 150;

const reducedMotion = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const raf = cb => (window.requestAnimationFrame ? window.requestAnimationFrame(cb) : setTimeout(()=>cb(performance.now()), 16));
const caf = id => (window.cancelAnimationFrame ? window.cancelAnimationFrame(id) : clearTimeout(id));
const now = ()=> (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function createMotion(room, mascot, { onHit = ()=>{}, onSettle = ()=>{}, onPaint = ()=>{} } = {}){
  let state = 'home';        // home | held | flying | resting | returning | fading
  let body = null;           // { x, y, vx, vy } en altos de cuarto; null = en su lugar
  let grabOffset = { x: 0, y: 0 };
  let frame = 0, lastT = 0, restSince = 0, bounced = false;
  let tween = null;          // { from, start } para volver a su lugar

  // Medidas actuales. El contenedor .mascot no se mueve (solo Mito dentro), así que su caja marca el lugar de casa.
  function measure(){
    const r = room.getBoundingClientRect(), m = mascot.getBoundingClientRect();
    const H = r.height || 1, box = m.width;
    const home = { x: (m.left + m.width / 2 - r.left) / H, y: (m.top + box * FEET - r.top) / H };
    const world = { width: r.width / H, floor: home.y, r: box * HALF_W / H, h: box * TOP / H };
    return { r, H, home, world };
  }

  function paint(){
    const { H, home, world } = measure();
    const b = body || home;
    room.style.setProperty('--fly-x', ((b.x - home.x) * H).toFixed(1) + 'px');
    room.style.setProperty('--fly-y', ((b.y - home.y) * H).toFixed(1) + 'px');
    const lift = Math.max(0, Math.min(1, (world.floor - b.y) / .5));
    room.style.setProperty('--lift', lift.toFixed(3));
    onPaint();
  }

  function reset(){
    caf(frame); frame = 0;
    body = null; tween = null; state = 'home';
    room.classList.remove('is-held');
    room.style.setProperty('--fly-x', '0px');
    room.style.setProperty('--fly-y', '0px');
    room.style.setProperty('--lift', '0');
    room.style.removeProperty('--mito-fade');
  }

  // Punto de la pantalla (px de cliente) → altos de cuarto.
  function toUnits(px, py){
    const { r, H } = measure();
    return { x: (px - r.left) / H, y: (py - r.top) / H };
  }

  function grab(px, py){
    caf(frame); frame = 0; tween = null;
    const { home } = measure();
    const p = toUnits(px, py);
    const b = body || { ...home };
    grabOffset = { x: p.x - b.x, y: p.y - b.y };
    body = { x: b.x, y: b.y, vx: 0, vy: 0 };
    state = 'held';
    room.classList.add('is-held');
    room.style.removeProperty('--mito-fade');
  }

  function drag(px, py){
    if(state !== 'held') return;
    const { world } = measure();
    const p = toUnits(px, py);
    body = clampToRoom({ x: p.x - grabOffset.x, y: p.y - grabOffset.y, vx: 0, vy: 0 }, world);
    paint();
  }

  // vx, vy en px/ms (del clasificador de gestos). Devuelve la rapidez en altos de cuarto por segundo.
  function drop(vx = 0, vy = 0){
    if(state !== 'held') return 0;
    room.classList.remove('is-held');
    const { H } = measure();
    const speed = Math.hypot(vx, vy) * 1000 / H;
    if(reducedMotion()){ fadeHome(); return speed; }
    body = { ...body, vx: vx * 1000 / H, vy: vy * 1000 / H, t: 0, resting: false };
    state = 'flying'; bounced = false; restSince = 0;
    lastT = now();
    frame = raf(loop);
    return speed;
  }

  function loop(t){
    const dt = Math.max(0, (t - lastT) / 1000);
    lastT = t;
    const { world, home } = measure();
    if(state === 'flying'){
      const r = advance(body, world, dt);
      body = r.body;
      for(const h of r.hits){
        if(h.hit === 'floor' && h.impact > 1) bounced = true;
        onHit(h.hit, h.impact);
      }
      if(body.stopped){ state = 'resting'; restSince = t; }
    } else if(state === 'resting'){
      if(t - restSince >= REST_MS){ state = 'returning'; tween = { from: { ...body }, start: t }; }
    } else if(state === 'returning'){
      const k = Math.min(1, (t - tween.start) / RETURN_MS);
      const e = 1 - (1 - k) ** 3;
      body = { ...body, x: tween.from.x + (home.x - tween.from.x) * e, y: tween.from.y + (home.y - tween.from.y) * e };
      if(k >= 1){ const hadBounce = bounced; reset(); onSettle(hadBounce); return; }
    }
    paint();
    frame = raf(loop);
  }

  // Movimiento reducido: se desvanece, aparece en su lugar y vuelve a verse. Nada salta.
  function fadeHome(){
    state = 'fading';
    const start = now();
    const step = t => {
      const k = (t - start) / FADE_MS;
      if(k < 1){ room.style.setProperty('--mito-fade', (1 - k).toFixed(2)); frame = raf(step); return; }
      if(body){ body = null; paint(); }
      if(k < 2){ room.style.setProperty('--mito-fade', (k - 1).toFixed(2)); frame = raf(step); return; }
      reset();
      onSettle(false);
    };
    frame = raf(step);
  }

  return {
    get state(){ return state; },
    get busy(){ return state !== 'home'; },
    grab, drag, drop, reset,
    repaint: ()=>{ if(body) paint(); },
  };
}
