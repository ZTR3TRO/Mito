// Movimiento de Mito en la Casa: está donde lo dejaste (Fase 5: Mito libre). Sigue al dedo, se lanza con física y,
// al caer, se queda en el piso o sobre un mueble con superficie (cama, sillón, cojín, silla…) si cae encima; si se
// pasa de la orilla del mueble, cae al piso. La física es pura (core/physics.js, en "altos de cuarto"); aquí se
// mide el cuarto, se avanza la simulación en cada cuadro y se pinta en variables CSS del cuarto.
//
// Profundidad: en el piso, Mito apoya en una "línea de piso" (más al frente = más abajo en la pantalla) y se ve más
// grande o más chico con la misma perspectiva que los muebles (furniture-layout.js, scaleAt). Mientras está en la
// mano, su sombra marca dónde va a caer: si los pies están sobre el piso, ahí (esa es su profundidad nueva); si lo
// levantas sobre la pared, la sombra se queda en la fila donde estaba; sobre un mueble con superficie, en ella.
//
// Variables que escribe (style.css): --fly-x, --fly-y (dónde están sus pies respecto a su lugar de siempre),
// --mito-k (su escala), --ground-y y --lift (la sombra), y las de la mascota: --pet-x, --pet-y, --pet-k. La mascota
// lo sigue un momento después y se queda en el piso, cerca de él (si Mito está sobre un mueble, frente al mueble).
//
// Con prefers-reduced-motion no hay vuelo ni rebote: al soltarlo se desvanece y aparece donde cae.

import { advance, clampToRoom } from '../../core/physics.js';
import { mitoBand, scaleAt, petSurfaceX } from './furniture-layout.js';

const FADE_MS = 180;        // desvanecido con movimiento reducido (cada mitad)
const HOP_MS = 560;         // un salto a otro lugar ("Traer a Mito")
const PET_MS = 520, PET_DELAY = 260;   // la mascota lo alcanza
const SEAT_GRAB = .14;      // con los pies hasta este tanto (× su alto) debajo de una superficie, se sienta en ella…
const SEAT_NEAR = .35;      // …o hasta este tanto encima, aunque el mueble esté más al frente que su sombra
// Medidas del dibujo de Mito (viewBox 150): pies en y 131, antenas arriba en y −5, cuerpo de x 23 a 127; el dibujo
// va a −88 % de su alto respecto a su lugar (style.css).
const FEET = 131 / 150, TOP = (131 + 5) / 150, HALF_W = 52 / 150, ANCHOR = .88;

const reducedMotion = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const raf = cb => (window.requestAnimationFrame ? window.requestAnimationFrame(cb) : setTimeout(()=>cb(now()), 16));
const caf = id => (window.cancelAnimationFrame ? window.cancelAnimationFrame(id) : clearTimeout(id));
const now = ()=> (typeof performance !== 'undefined' ? performance.now() : Date.now());
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// geometry(): { L, seats } del cuarto de Mito — L de sceneLayout (px del cuarto) y seats las superficies de sus
// muebles: [{ id, x0, x1, y, base }] (furniture-layout.js, seatSurfaces). null si el cuarto no se ve.
// onSettle(rest) cuando queda quieto: rest = { x, y, on, depth } (pies en px; on = id del mueble o null; depth = la
// línea de piso que le toca: la suya o la base del mueble).
export function createMotion(room, mascot, { geometry = ()=> null, onHit = ()=>{}, onSettle = ()=>{}, onPaint = ()=>{}, asleep = ()=> false } = {}){
  let state = 'rest';        // rest | held | flying | fading | hop
  let rest = null;           // dónde está quieto: { x, y, on, depth } (px)
  let body = null;           // en la mano o en vuelo: { x, y, vx, vy } en altos de cuarto
  let depth = 0;             // la línea de piso mientras está en la mano o en vuelo (px)
  let grabOffset = { x: 0, y: 0 };
  let frame = 0, lastT = 0, bounced = false, petFrame = 0, petTimer = 0;
  let seats = [], petAt = null;

  // Su lugar de siempre (donde está la caja .mascot), en px del cuarto: los pies.
  const homeOf = L => ({ x: L.home.x, y: L.home.y - L.mito * (ANCHOR - FEET) });
  const set = (k, v) => room.style.setProperty(k, v);
  const pxv = n => n.toFixed(1) + 'px';
  const roomRect = ()=> room.getBoundingClientRect();

  // Lo que hay debajo de unos pies en (x, y): la superficie de un mueble o el piso. Con los pies a la altura de una
  // superficie (un poco arriba o casi encima), es esa, aunque el mueble esté más al frente que su sombra: la usuaria
  // lo puso ahí. Si no, la primera superficie debajo de él que esté detrás de su línea de piso.
  function groundUnder(x, y, floorY){
    const m = geometry()?.L.mito || 0;
    const across = seats.filter(s => x >= s.x0 && x <= s.x1);
    const near = across.filter(s => y >= s.y - m * SEAT_NEAR && y <= s.y + m * SEAT_GRAB).sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))[0];
    const hit = near || across.filter(s => y <= s.y + m * SEAT_GRAB && s.y < floorY).sort((a, b) => a.y - b.y)[0];
    return hit ? { y: hit.y, depth: hit.base, seat: hit } : { y: floorY, depth: floorY, seat: null };
  }

  // Pinta a Mito con los pies en (x, y), su sombra en groundY y la escala de la profundidad `d`.
  function paint(x, y, groundY, d){
    const g = geometry();
    if(!g) return;
    const { L } = g, home = homeOf(L), k = scaleAt(L, d);
    set('--fly-x', pxv(x - home.x)); set('--fly-y', pxv(y - home.y));
    set('--ground-y', pxv(groundY - home.y));
    set('--mito-k', k.toFixed(3));
    set('--lift', clamp((groundY - y) / (L.H * .5), 0, 1).toFixed(3));
    onPaint();
  }
  // Quieto: en su lugar; on-lie si está en una superficie para acostarse (la cama: al dormir, se acurruca).
  function paintRest(){
    if(!rest) return;
    paint(rest.x, rest.y, rest.y, rest.depth);
    room.classList.toggle('on-lie', !!rest.on && seats.find(st => st.id === rest.on)?.kind === 'lie');
  }

  /* ---------- la mascota: se queda en el piso, cerca de Mito ---------- */
  function petTarget(){
    const g = geometry();
    if(!g || !rest) return null;
    const { L } = g, home = homeOf(L), [, b1] = mitoBand(L);
    const k = scaleAt(L, rest.depth), m = L.mito;
    // dormido en una cama: la mascota se sube y se acuesta a su lado, a su misma escala y sobre la superficie
    const bed = asleep() && rest.on ? seats.find(st => st.id === rest.on && st.kind === 'lie' && rest.x >= st.x0 - 1 && rest.x <= st.x1 + 1) : null;
    if(bed){
      const x = petSurfaceX(bed, rest.x, m * .63 * k, m * .2 * k), y = bed.y + m * k * .02;
      return { dx: x - (home.x - m * .63), dy: y - (home.y + m * .1), k, bed: true };
    }
    // en el piso, a su lado y un poco al frente; sobre un mueble, frente al mueble
    const y = Math.min(b1, rest.depth + m * (rest.on ? .1 : .06));
    const kp = scaleAt(L, y);
    let x = rest.x - m * .63 * k;
    if(x < m * .25) x = rest.x + m * .63 * k;                   // pegado a la pared izquierda: del otro lado
    x = clamp(x, m * .2, L.W - m * .2);
    // posición por omisión de la mascota (a la izquierda de su lugar de siempre, style.css)
    return { dx: x - (home.x - m * .63), dy: y - (home.y + m * .1), k: kp };
  }
  // En la cama el platillo no flota alto: queda pegado a la superficie (--pet-lift) y sin rayo (clase del cuarto).
  function petPaint(t){
    set('--pet-x', pxv(t.dx)); set('--pet-y', pxv(t.dy)); set('--pet-k', t.k.toFixed(3));
    const L = geometry()?.L;
    set('--pet-lift', t.bed && L ? pxv(L.mito * t.k * .05) : '0px');
    room.classList.toggle('pet-on-bed', !!t.bed);
    petAt = t;
  }
  function petFollow(instant = false){
    clearTimeout(petTimer); caf(petFrame);
    const to = petTarget();
    if(!to) return;
    if(instant || reducedMotion() || !petAt){ petPaint(to); return; }
    const from = petAt;
    petTimer = setTimeout(()=>{
      const start = now();
      const step = t=>{
        const k = Math.min(1, (t - start) / PET_MS), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        const hop = Math.sin(Math.PI * k) * -10;   // da saltitos al caminar
        petPaint({ dx: from.dx + (to.dx - from.dx) * e, dy: from.dy + (to.dy - from.dy) * e + hop * (k < 1 ? Math.abs(Math.sin(k * Math.PI * 3)) : 0), k: from.k + (to.k - from.k) * e });
        if(k < 1) petFrame = raf(step); else petPaint(to);
      };
      petFrame = raf(step);
    }, PET_DELAY);
  }

  /* ---------- dónde está ---------- */
  // Un mueble puede tener varias superficies (las dos sillas de la mesa): `s` va de la orilla izquierda de la primera
  // a la derecha de la última, y la que cuenta es la que tiene debajo (o la más cercana).
  function seatSpan(id){
    const list = seats.filter(st => st.id === id);
    return list.length ? { list, x0: Math.min(...list.map(st => st.x0)), x1: Math.max(...list.map(st => st.x1)) } : null;
  }
  function seatAt(id, s){
    const span = seatSpan(id);
    if(!span) return null;
    const x = span.x0 + (span.x1 - span.x0) * (Number.isFinite(s) ? s : .5);
    const st = span.list.find(q => x >= q.x0 && x <= q.x1) || span.list.slice().sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - x) - Math.abs((b.x0 + b.x1) / 2 - x))[0];
    return { st, x: clamp(x, st.x0, st.x1) };
  }
  // Lo pone quieto en una posición guardada (state/house.js, getMito): { home } | { u, v } | { on, s }.
  // petInstant: la mascota aparece a su lado de una vez (al entrar, al cambiar de cuarto); si no, lo alcanza.
  function place(pos, { petInstant = true } = {}){
    caf(frame); frame = 0;
    const g = geometry();
    seats = g?.seats || [];
    if(!g) return;
    const { L } = g, home = homeOf(L), [b0, b1] = mitoBand(L);
    let r = { x: home.x, y: home.y, on: null, depth: home.y };
    if(pos?.on){
      const at = seatAt(pos.on, pos.s);
      if(at) r = { x: at.x, y: at.st.y, on: pos.on, depth: at.st.base };
    } else if(Number.isFinite(pos?.u) && Number.isFinite(pos?.v)){
      const y = b0 + pos.v * (b1 - b0);
      r = { x: pos.u * L.W, y, on: null, depth: y };
    }
    const m = L.mito * scaleAt(L, r.depth) * HALF_W;
    r.x = clamp(r.x, m, L.W - m);
    rest = r; body = null; state = 'rest';
    room.classList.remove('is-held');
    room.style.removeProperty('--mito-fade');
    paintRest();
    petFollow(petInstant);
  }
  // Lo que se guarda (state/house.js, setMito) de una posición quieta.
  function saved(r = rest){
    const g = geometry();
    if(!g || !r) return null;
    const { L } = g, [b0, b1] = mitoBand(L);
    if(r.on){
      const span = seatSpan(r.on);
      if(span) return { on: r.on, s: clamp((r.x - span.x0) / Math.max(1, span.x1 - span.x0), 0, 1) };
    }
    return { u: r.x / L.W, v: clamp((r.y - b0) / Math.max(1, b1 - b0), 0, 1) };
  }

  /* ---------- en la mano ---------- */
  function measure(){
    const g = geometry(), r = roomRect();
    const H = r.height || 1;
    return { g, r, H };
  }
  const toPx = (px, py) => { const r = roomRect(); return { x: px - r.left, y: py - r.top }; };

  function grab(px, py){
    caf(frame); frame = 0;
    const { g } = measure();
    if(!g) return;
    seats = g.seats;
    if(!rest) place(null);
    const p = toPx(px, py);
    const at = body ? { x: body.x * roomRect().height, y: body.y * roomRect().height } : { x: rest.x, y: rest.y };
    grabOffset = { x: p.x - at.x, y: p.y - at.y };
    depth = rest.depth;
    body = { x: at.x, y: at.y };
    state = 'held';
    room.classList.add('is-held');
    room.classList.remove('on-lie');
    room.style.removeProperty('--mito-fade');
  }

  function drag(px, py){
    if(state !== 'held') return;
    const { g } = measure();
    if(!g) return;
    const { L } = g, [b0, b1] = mitoBand(L);
    const k = scaleAt(L, depth), m = L.mito * k;
    const p = toPx(px, py);
    const x = clamp(p.x - grabOffset.x, m * HALF_W, L.W - m * HALF_W);
    const y = clamp(p.y - grabOffset.y, m * TOP, b1);
    if(y >= b0) depth = y;   // con los pies sobre el piso, esa es su profundidad
    body = { x, y };
    const gnd = groundUnder(x, y, depth);
    paint(x, y, gnd.y, gnd.seat ? gnd.depth : depth);
  }

  // vx, vy en px/ms (del clasificador de gestos). Devuelve la rapidez en altos de cuarto por segundo.
  function drop(vx = 0, vy = 0){
    if(state !== 'held') return 0;
    room.classList.remove('is-held');
    const { g, H } = measure();
    const speed = Math.hypot(vx, vy) * 1000 / H;
    if(!g){ state = 'rest'; return speed; }
    let { x, y } = body;
    // con los pies a la altura de una superficie, se sienta en ella: su línea de piso pasa a ser la del mueble (para
    // que la superficie quede por encima del piso) y, si estaba un poco abajo, se ajusta a ella
    const gnd = groundUnder(x, y, depth);
    if(gnd.seat){
      depth = Math.max(depth, gnd.seat.base);
      if(y > gnd.seat.y) y = gnd.seat.y - .01;
    }
    const w = world(g, depth);
    const start = { x: x / H, y: y / H, vx: vx * 1000 / H, vy: vy * 1000 / H, t: 0, resting: false, on: null };
    if(reducedMotion()){ fadeTo(settle(start, w, H)); return speed; }
    body = start;
    state = 'flying'; bounced = false;
    lastT = now();
    frame = raf(loop);
    return speed;
  }

  // El mundo de la física (en altos de cuarto): el piso es su línea de piso; las superficies, las de sus muebles.
  function world(g, floorY){
    const { L } = g, H = L.H, k = scaleAt(L, floorY), m = L.mito * k;
    const plats = seats.filter(s => s.y < floorY - 1).map(s => ({ x0: s.x0 / H, x1: s.x1 / H, y: s.y / H, seat: s }));
    return { width: L.W / H, floor: floorY / H, r: m * HALF_W / H, h: m * TOP / H, platforms: plats };
  }
  // Dónde queda quieto un cuerpo (en px), con su superficie si cayó en una.
  function restOf(b, w, H){
    const pl = Number.isInteger(b.on) ? w.platforms[b.on] : null;
    return pl ? { x: b.x * H, y: pl.y * H, on: pl.seat.id, depth: pl.seat.base } : { x: b.x * H, y: w.floor * H, on: null, depth: w.floor * H };
  }
  // Sin animación: simula hasta que se detiene (movimiento reducido).
  function settle(b, w, H){
    let cur = b;
    for(let i = 0; i < 400 && !cur.stopped; i++) cur = advance(cur, w, .05).body;
    return restOf(cur, w, H);
  }

  function loop(t){
    const dt = Math.max(0, (t - lastT) / 1000);
    lastT = t;
    const g = geometry();
    if(!g){ state = 'rest'; return; }
    const H = g.L.H, w = world(g, depth);
    const r = advance(body, w, dt);
    body = r.body;
    for(const h of r.hits){
      if(h.hit === 'floor' && h.impact > 1) bounced = true;
      onHit(h.hit, h.impact);
    }
    const pl = Number.isInteger(body.on) ? w.platforms[body.on] : null;
    paint(body.x * H, body.y * H, pl ? pl.y * H : depth, pl ? pl.seat.base : depth);
    if(body.stopped){ arrive(restOf(body, w, H), bounced); return; }
    frame = raf(loop);
  }

  function arrive(r, hadBounce = false){
    rest = r; body = null; state = 'rest';
    paintRest();
    petFollow();
    onSettle(r, hadBounce);
  }

  // Movimiento reducido: se desvanece, aparece donde cae y vuelve a verse. Nada salta.
  function fadeTo(r){
    state = 'fading';
    const start = now();
    let moved = false;
    const step = t=>{
      const k = (t - start) / FADE_MS;
      if(k < 1){ set('--mito-fade', (1 - k).toFixed(2)); frame = raf(step); return; }
      if(!moved){ moved = true; rest = r; paintRest(); }   // a la mitad, ya invisible: aparece en su lugar nuevo
      if(k < 2){ set('--mito-fade', (k - 1).toFixed(2)); frame = raf(step); return; }
      room.style.removeProperty('--mito-fade');
      arrive(r, false);
    };
    frame = raf(step);
  }

  // Un salto a un lugar (x, y en px: sus pies): al piso ("Traer a Mito") o a la superficie de un mueble (seat:
  // { id, base }; acostarse en la cama al dormir, sentarse a la mesa al comer).
  function hop(x, y, seat = null){
    caf(frame);
    const g = geometry();
    if(!g || !rest) return;
    seats = g.seats;
    const to = { x, y, on: seat ? seat.id : null, depth: seat ? seat.base : y };
    if(reducedMotion()){ fadeTo(to); return; }
    const from = { ...rest }, start = now(), arc = g.L.mito * .45;
    state = 'hop';
    const step = t=>{
      const k = Math.min(1, (t - start) / HOP_MS), e = 1 - (1 - k) ** 2;
      const cx = from.x + (to.x - from.x) * e, cy = from.y + (to.y - from.y) * e - Math.sin(Math.PI * k) * arc;
      const d = from.depth + (to.depth - from.depth) * e;
      paint(cx, cy, Math.max(cy, from.y + (to.y - from.y) * e), d);
      if(k < 1) frame = raf(step); else arrive(to, false);
    };
    frame = raf(step);
  }

  return {
    get state(){ return state; },
    get busy(){ return state !== 'rest'; },
    get rest(){ return rest; },
    place, saved, grab, drag, drop, hop, petFollow,
    // Al salir de la vista o al cambiar de cuarto: se cancela lo que estuviera a medias y queda quieto donde estaba.
    reset(){
      caf(frame); frame = 0; clearTimeout(petTimer); caf(petFrame);
      body = null; state = 'rest';
      room.classList.remove('is-held');
      room.style.removeProperty('--mito-fade');
      if(rest) paintRest();
    },
    // Se volvió a componer el cuarto (tamaño, muebles): se vuelve a poner donde está guardado.
    repaint: ()=>{ if(state === 'rest' && rest) paintRest(); },
  };
}
