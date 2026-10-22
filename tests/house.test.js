// Lógica de la Casa que no depende del navegador: clasificación de gestos (core/gesture.js),
// física del rebote (core/physics.js), frases y reacciones (content/house.js), y composición del
// cuarto y luz (features/house/layout.js).

import test from 'node:test';
import assert from 'node:assert/strict';
import { createGestureClassifier, GESTURE as G } from '../src/core/gesture.js';
import { PHYSICS as P, step, advance, clampToRoom } from '../src/core/physics.js';
import { MITO_HOUSE, PET_HOUSE } from '../src/content/house.js';
import { WARDROBE } from '../src/content/wardrobe.js';
import { sceneLayout, lightPlan, BLOCKS, FLOOR, floorRowY, floorX, GLASS } from '../src/features/house/layout.js';

/* ---------------- gestos ---------------- */

const types = events => events.map(e => e.type);

// Un toque en (x, y) que empieza en t y dura `ms`.
function tap(c, t, ms = 80, x = 100, y = 100){
  c.down(t, x, y);
  return c.up(t + ms, x, y);
}

test('gestos: un toque rápido es picar', ()=>{
  const c = createGestureClassifier();
  assert.deepEqual(types(tap(c, 0)), ['poke']);
});

test('gestos: un temblor del dedo menor al margen sigue siendo picar', ()=>{
  const c = createGestureClassifier();
  c.down(0, 100, 100);
  assert.deepEqual(c.move(40, 100 + G.slopPx * .6, 100 - G.slopPx * .6), []);
  assert.deepEqual(types(c.up(90, 104, 96)), ['poke']);
});

test('gestos: tres toques seguidos son cosquillas, y los siguientes también', ()=>{
  const c = createGestureClassifier();
  let t = 0;
  const out = [];
  for(let i = 0; i < 5; i++){ out.push(...tap(c, t)); t += 80 + G.tickleGapMs - 50; }
  assert.deepEqual(types(out), ['poke', 'poke', 'tickle', 'tickle', 'tickle']);
});

test('gestos: toques con pausa larga no son cosquillas', ()=>{
  const c = createGestureClassifier();
  let t = 0;
  const out = [];
  for(let i = 0; i < 4; i++){ out.push(...tap(c, t)); t += 80 + G.tickleGapMs + 100; }
  assert.deepEqual(types(out), ['poke', 'poke', 'poke', 'poke']);
});

test('gestos: un toque lento (más de tapMaxMs) pica pero rompe la cadena de cosquillas', ()=>{
  const c = createGestureClassifier();
  tap(c, 0); tap(c, 200);
  const slow = tap(c, 400, G.tapMaxMs + 20);
  assert.deepEqual(types(slow), ['poke']);
  assert.deepEqual(types(tap(c, 400 + G.tapMaxMs + 120)), ['poke']);
});

test('gestos: deslizar sobre el objeto es acariciar, una vez por cada strokePx', ()=>{
  const c = createGestureClassifier();
  c.down(0, 100, 100);
  const out = [];
  for(let i = 1; i <= 26; i++) out.push(...c.move(i * 16, 100 + i * 6, 100));   // 156 px en 416 ms
  assert.equal(c.state, 'stroking');
  const pets = out.filter(e => e.type === 'pet');
  assert.equal(pets.length, Math.floor(26 * 6 / G.strokePx));
  assert.deepEqual(types(c.up(430, 256, 100)), ['petEnd']);
});

test('gestos: ir y venir también suma recorrido (caricia de lado a lado)', ()=>{
  const c = createGestureClassifier();
  c.down(0, 100, 100);
  const out = [];
  let t = 0;
  for(let i = 0; i < 6; i++){ t += 50; out.push(...c.move(t, 100 + (i % 2 ? -20 : 20), 100)); }
  assert.ok(out.some(e => e.type === 'pet'));
});

test('gestos: si el dedo sale del objeto es un barrido y no cuenta', ()=>{
  const c = createGestureClassifier();
  c.down(0, 100, 100);
  c.move(20, 130, 100, true);
  const out = c.move(40, 220, 100, false);
  assert.equal(c.state, 'swipe');
  assert.deepEqual(out, []);
  assert.deepEqual(c.up(60, 260, 100), []);
});

test('gestos: mantener quieto longPressMs agarra; luego se arrastra y al soltar trae la velocidad', ()=>{
  const c = createGestureClassifier();
  c.down(0, 100, 100);
  assert.deepEqual(c.tick(G.longPressMs - 1), [], 'antes de tiempo no agarra');
  assert.deepEqual(types(c.tick(G.longPressMs)), ['grab']);
  assert.deepEqual(types(c.move(G.longPressMs + 20, 140, 100)), ['drag']);
  c.move(G.longPressMs + 40, 160, 90);
  c.move(G.longPressMs + 60, 180, 80);
  const [drop] = c.up(G.longPressMs + 70, 190, 75);
  assert.equal(drop.type, 'drop');
  assert.ok(drop.vx > 0 && drop.vy < 0, 'lanzado a la derecha y hacia arriba');
});

test('gestos: si no se llamó tick, moverse tras longPressMs también agarra', ()=>{
  const c = createGestureClassifier();
  c.down(0, 100, 100);
  assert.deepEqual(types(c.move(G.longPressMs + 5, 130, 100)), ['grab', 'drag']);
});

test('gestos: moverse antes de longPressMs nunca agarra', ()=>{
  const c = createGestureClassifier();
  c.down(0, 100, 100);
  c.move(G.longPressMs - 100, 100 + G.slopPx + 5, 100);
  assert.deepEqual(c.tick(G.longPressMs + 50), []);
  assert.notEqual(c.state, 'grabbing');
});

test('gestos: la velocidad de lanzamiento tiene tope', ()=>{
  const c = createGestureClassifier();
  c.down(0, 0, 0);
  c.tick(G.longPressMs);
  c.move(G.longPressMs + 5, 400, 0);
  const [drop] = c.up(G.longPressMs + 10, 800, 0);
  assert.ok(Math.hypot(drop.vx, drop.vy) <= G.maxThrowPxMs + 1e-9);
});

test('gestos: soltar sin moverse tras agarrar cae quieto; cancelar suelta', ()=>{
  const c = createGestureClassifier();
  c.down(0, 50, 50);
  c.tick(G.longPressMs);
  const [drop] = c.up(G.longPressMs + 200, 50, 50);
  assert.equal(drop.type, 'drop');
  assert.equal(Math.hypot(drop.vx, drop.vy), 0);

  c.down(1000, 50, 50);
  c.tick(1000 + G.longPressMs);
  assert.deepEqual(types(c.cancel()), ['drop']);
  assert.equal(c.state, 'idle');
});

test('gestos: tras arrastrar, el siguiente toque empieza una cadena nueva', ()=>{
  const c = createGestureClassifier();
  tap(c, 0); tap(c, 150);
  c.down(300, 0, 0); c.tick(300 + G.longPressMs); c.up(300 + G.longPressMs + 10, 0, 0);
  assert.deepEqual(types(tap(c, 300 + G.longPressMs + 100)), ['poke']);
});

/* ---------------- física ---------------- */

const WORLD = { width: 16 / 9, floor: .86, r: .09, h: .2 };
const inside = (b, w = WORLD) =>
  b.x >= w.r - 1e-9 && b.x <= w.width - w.r + 1e-9 && b.y >= w.h - 1e-9 && b.y <= w.floor + 1e-9;

// Simula hasta que se detiene; devuelve el cuerpo final y la traza.
function run(body, world = WORLD, frame = 1 / 60){
  const trace = [];
  let b = body, time = 0;
  while(!b.stopped && time < 20){
    const r = advance(b, world, frame);
    b = r.body; time += frame;
    trace.push({ ...b, hits: r.hits });
  }
  return { body: b, trace, time };
}

// Generador pseudoaleatorio con semilla: las pruebas fallan siempre igual.
function rng(seed){
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

test('física: soltado desde arriba cae, rebota y se detiene en el piso', ()=>{
  const { body, trace } = run({ x: .9, y: .3, vx: 0, vy: 0 });
  assert.ok(body.stopped && body.resting);
  assert.equal(body.y, WORLD.floor);
  assert.ok(trace.some(s => s.hits.some(h => h.hit === 'floor')), 'debió rebotar en el piso');
});

test('física: cada rebote sube menos que el anterior (pierde energía)', ()=>{
  const { trace } = run({ x: .9, y: .25, vx: 0, vy: 0 }, WORLD, 1 / 240);
  // alturas máximas entre rebotes = puntos donde vy cambia de negativo a positivo
  const peaks = [];
  for(let i = 1; i < trace.length; i++) if(trace[i - 1].vy < 0 && trace[i].vy >= 0) peaks.push(WORLD.floor - trace[i].y);
  assert.ok(peaks.length >= 2, 'esperaba varios rebotes');
  for(let i = 1; i < peaks.length; i++) assert.ok(peaks[i] < peaks[i - 1], `rebote ${i} no bajó`);
});

test('física: lanzamientos al azar nunca salen del cuarto y siempre se detienen', ()=>{
  const r = rng(42);
  for(let i = 0; i < 300; i++){
    const world = { width: .6 + r() * 1.4, floor: .7 + r() * .25, r: .05 + r() * .12, h: .1 + r() * .25 };
    const start = { x: r() * world.width, y: r() * world.floor, vx: (r() - .5) * 12, vy: (r() - .5) * 12 };
    const { body, trace, time } = run(start, world);
    assert.ok(trace.every(b => inside(b, world)), `lanzamiento ${i} salió del cuarto`);
    assert.ok(body.stopped, `lanzamiento ${i} no se detuvo`);
    assert.ok(time <= P.maxSim + .1, `lanzamiento ${i} tardó demasiado`);
  }
});

test('física: rebota en las paredes con pérdida de energía', ()=>{
  const r = step({ x: WORLD.width - WORLD.r - .001, y: .5, vx: 3, vy: 0 }, WORLD, .01);
  assert.equal(r.hit, 'wall');
  assert.ok(r.body.vx < 0 && Math.abs(r.body.vx) < 3);
  assert.equal(r.body.x, WORLD.width - WORLD.r);
});

test('física: el techo también lo detiene', ()=>{
  const r = step({ x: .9, y: WORLD.h + .001, vx: 0, vy: -4 }, WORLD, .01);
  assert.equal(r.hit, 'ceiling');
  assert.ok(r.body.vy > 0);
  assert.ok(inside(r.body));
});

test('física: un tirón enorme de tiempo no lo saca ni lo dispara', ()=>{
  const { body } = advance({ x: .9, y: .4, vx: 2, vy: -2 }, WORLD, 30);
  assert.ok(inside(body));
  assert.ok(body.t <= P.maxFrame + 1e-9, 'solo procesa maxFrame de golpe');
});

test('física: valores no numéricos no lo rompen', ()=>{
  const { body } = advance({ x: NaN, y: undefined, vx: Infinity, vy: NaN }, WORLD, 1 / 60);
  assert.ok(Number.isFinite(body.x) && Number.isFinite(body.y));
  assert.ok(inside(body));
  assert.deepEqual(advance({ x: .5, y: .5, vx: 0, vy: 0 }, WORLD, NaN).body.t, 0);
});

test('física: clampToRoom sirve para arrastrar con el dedo', ()=>{
  const b = clampToRoom({ x: -5, y: 9, vx: 0, vy: 0 }, WORLD);
  assert.equal(b.x, WORLD.r);
  assert.equal(b.y, WORLD.floor);
  const c = clampToRoom({ x: 99, y: -3 }, WORLD);
  assert.equal(c.x, WORLD.width - WORLD.r);
  assert.equal(c.y, WORLD.h);
});

test('física: un cuarto más angosto que el cuerpo no lo atrapa ni da NaN', ()=>{
  const tiny = { width: .1, floor: .1, r: .2, h: .3 };
  const { body } = run({ x: 0, y: 0, vx: 1, vy: 1 }, tiny);
  assert.ok(Number.isFinite(body.x) && Number.isFinite(body.y));
  assert.ok(body.stopped);
});

test('física: si pasa maxSim se da por detenido', ()=>{
  let b = { x: .9, y: .5, vx: 0, vy: 0, t: P.maxSim - .01 };
  b = advance(b, WORLD, .02).body;
  assert.ok(b.stopped);
  assert.equal(b.y, WORLD.floor);
});

/* ---------------- contenido ---------------- */

test('contenido: cada mascota del catálogo reacciona a todo en la Casa', ()=>{
  const keys = WARDROBE.find(c => c.id === 'pet').items.map(i => i.k).filter(Boolean);
  for(const k of keys){
    assert.ok(PET_HOUSE[k], `falta la mascota ${k}`);
    for(const ev of ['poke', 'tickle', 'pet', 'grab', 'land']) assert.ok(PET_HOUSE[k].act[ev], `${k} no reacciona a ${ev}`);
    for(const ev of ['pet', 'land']) assert.ok(PET_HOUSE[k].say[ev]?.length >= 2, `${k} necesita frases para ${ev}`);
  }
});

test('contenido: las frases de la Casa son cortas (caben junto a Mito a 360 px)', ()=>{
  const all = [...Object.values(MITO_HOUSE).flat(), ...Object.values(PET_HOUSE).flatMap(p => Object.values(p.say).flat())];
  const long = all.filter(m => [...m].length > 34);
  assert.deepEqual(long, []);
});

/* ---------------- composición del cuarto ---------------- */

// Tamaños reales del cuarto: 1440 × 900 y 1440 × 800 junto al menú de 264 px; 390 × 844 y 360 × 740 entre el
// header y la barra inferior. Y los cuartos de la versión aprobada (la barra iba fuera: barSpace 0).
const SIZES = { desk900: [1176, 900, 84], desk800: [1176, 800, 84], m390: [390, 714, 76], m360: [360, 614, 76] };
const APPROVED = { wide: [908, 511, 0], tall: [362, 362 * 4 / 3, 0] };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));

test('composición: el cuarto aprobado es el bloque entero, sin extensión', ()=>{
  for(const [kind, size] of Object.entries(APPROVED)){
    const L = sceneLayout(...size);
    assert.equal(L.kind, kind);
    const px = (a, b) => Math.abs(a - b) <= .5;   // medio píxel: 908 × 511 es 16:9 redondeado
    assert.ok(px(L.block.x, 0) && px(L.block.y, 0) && px(L.block.w, size[0]) && px(L.block.h, size[1]), kind);
  }
});

test('composición: el bloque conserva la escena aprobada y cabe entero (contain), sobre la barra', ()=>{
  for(const [k, size] of Object.entries(SIZES)){
    const L = sceneLayout(...size), B = BLOCKS[L.kind], b = L.block;
    assert.ok(near(b.w / b.h, B.aspect), `${k}: el bloque se deformó`);
    assert.ok(near(L.mito, b.w * B.mito), `${k}: Mito no guarda su proporción con el bloque`);
    assert.ok(b.x >= -1e-9 && b.x + b.w <= L.W + 1e-6 && b.y >= -1e-9 && b.y + b.h <= L.H - L.barSpace + 1e-6, `${k}: el bloque no cabe`);
    // contain: toca los dos lados en al menos una dirección
    assert.ok(near(b.w, L.W) || near(b.h, L.H - L.barSpace), `${k}: el bloque no está escalado al máximo`);
    // la barra no tapa a Mito ni a la mascota (un poco más al frente)
    assert.ok(L.home.y + L.mito * .08 <= L.H - L.barSpace + 1e-6, `${k}: la barra tapa los pies`);
  }
});

test('composición: Mito nunca se ve más grande, en proporción al cuarto, que en la versión aprobada', ()=>{
  for(const [k, size] of Object.entries(SIZES)){
    const L = sceneLayout(...size), A = sceneLayout(...APPROVED[L.kind]);
    assert.ok(L.mito / L.W <= A.mito / A.W + 1e-9, `${k}: más grande a lo ancho`);
    assert.ok(L.mito / L.H <= A.mito / A.H + 1e-9, `${k}: más grande a lo alto`);
  }
});

test('composición: lo que sobra es más pared arriba y más piso abajo, y el zócalo queda en el bloque', ()=>{
  for(const [k, size] of Object.entries(SIZES)){
    const L = sceneLayout(...size), b = L.block;
    assert.ok(near(L.horizon, b.y + b.h * (1 - BLOCKS[L.kind].floor)), `${k}: el zócalo no está donde en el bloque`);
    assert.ok(b.y >= 0 && L.H - (b.y + b.h) >= L.barSpace - 1e-6, `${k}: falta espacio arriba o abajo`);
  }
});

test('piso: la misma ley de la versión aprobada, continua más allá del bloque', ()=>{
  assert.equal(floorRowY(0), 0);
  assert.ok(near(floorRowY(FLOOR.rows), 100), 'la fila 8 cierra el piso del bloque, como antes');
  for(let i = 1; i < 30; i++) assert.ok(floorRowY(i + 1) - floorRowY(i) > floorRowY(i) - floorRowY(i - 1), 'cada fila es más alta que la anterior');
  // en el zócalo no hay perspectiva; abajo se abre hacia los lados, también fuera del bloque
  assert.equal(floorX(0, 0), 0); assert.equal(floorX(100, 0), 100);
  assert.ok(floorX(-40, 150) < -40 && floorX(140, 150) > 140);
});

test('luz: la de la versión aprobada, ligada a la ventana y sin llegar al cuerpo de Mito', ()=>{
  for(const [k, size] of Object.entries({ ...SIZES, approvedWide: APPROVED.wide, approvedTall: APPROVED.tall })){
    const L = sceneLayout(...size), plan = lightPlan(L);
    // proporcional al bloque: el plan del bloque escalado es el del bloque aprobado escalado
    const A = sceneLayout(...APPROVED[L.kind]), pa = lightPlan(A), r = L.block.w / A.block.w;
    plan.floor.forEach((p, i) => assert.ok(near(p[0], pa.floor[i][0] * r, 1e-6) && near(p[1], pa.floor[i][1] * r, 1e-6), `${k}: la luz cambió respecto a la aprobada`));
    assert.ok(near(plan.kx, pa.kx), `${k}: cambió el ángulo`);
    // cae en el piso del bloque
    const yb = L.block.h - L.fb;
    for(const p of plan.floor) assert.ok(p[1] > yb && p[0] > 0 && p[0] < L.block.w, `${k}: el reflejo se sale del bloque`);
    // el reflejo queda del lado de la ventana respecto al cuerpo de Mito
    const mx = L.block.w / 2, xs = plan.floor.map(p => p[0]);
    const winLeft = L.win.x + L.win.w / 2 < mx;
    if(winLeft) assert.ok(Math.max(...xs) <= mx - L.mito / 2 + L.mito * .12 + 1e-6, `${k}: el reflejo llega a Mito`);
    else assert.ok(Math.min(...xs) >= mx + L.mito / 2 - L.mito * .12 - 1e-6, `${k}: el reflejo llega a Mito`);
    assert.equal(plan.panes.length, 4);
  }
});

test('luz: las líneas rectas de la ventana siguen rectas en el piso (parteluz en su sitio)', ()=>{
  const plan = lightPlan(sceneLayout(390, 714, 76));
  const mid = (GLASS.x0 + GLASS.x1) / 2;
  const [a, b, c] = [GLASS.y0, (GLASS.y0 + GLASS.y1) / 2, GLASS.y1].map(y => plan.P([mid, y]));
  const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  assert.ok(Math.abs(cross) < 1e-6 * Math.hypot(c[0] - a[0], c[1] - a[1]) ** 2 + 1e-6);
});

test('composición: tamaños raros no la rompen', ()=>{
  for(const [w, h] of [[0, 0], [100, 900], [2000, 300], [NaN, 500]]){
    const L = sceneLayout(w, h);
    const nums = [L.block.x, L.block.y, L.block.w, L.block.h, L.horizon, L.fb, L.mito, L.home.x, L.home.y, L.win.w];
    assert.ok(nums.every(Number.isFinite), `${w}×${h}`);
    assert.ok(L.block.w > 0 && L.block.h > 0);
  }
});

/* ---------------- necesidades (Fase 2) ---------------- */

import { NEEDS as N, needsAt, cleanHouse, topNeed, careMood, addClean, startSleep, wakeUp, getNeeds, isFull, feed } from '../src/state/house.js';
import { state } from '../src/state/core.js';
import { parseSave } from '../src/state/backup.js';
import { readFileSync } from 'node:fs';
import { MITO_NEEDS, MITO_THANKS, MITO_SLEEP, MITO_BATH } from '../src/content/house.js';

const HR = 3600e3;
const FULL = { hunger: 100, clean: 100, energy: 100, mood: 100 };
const house = (needs, extra = {}) => ({ at: 0, needs: { ...FULL, ...needs }, sleepSince: null, ...extra });

test('necesidades: de llena a la mitad en un día (también el hambre, desde la Fase 3)', ()=>{
  const n = needsAt(house({}), 24 * HR).needs;
  for(const k of ['hunger', 'clean', 'energy', 'mood']) assert.ok(Math.abs(n[k] - 50) < .01, `${k}: ${n[k]}`);
});

test('necesidades: nunca bajan del piso, y lo que ya estaba debajo no sube solo', ()=>{
  const n = needsAt(house({}), 30 * 24 * HR).needs;
  for(const k of ['hunger', 'clean', 'energy', 'mood']) assert.equal(n[k], N.floor);
  assert.equal(needsAt(house({ mood: 5 }), 10 * HR).needs.mood, 5);
});

test('necesidades: dormido con la app cerrada, la energía sube y despierta al llenarse', ()=>{
  // 30 min: sigue dormido; la energía subió 50; el ánimo no bajó; la limpieza sí
  const half = needsAt(house({ energy: 20, mood: 60 }, { sleepSince: 0 }), .5 * HR);
  assert.ok(half.sleepSince !== null, 'debería seguir dormido');
  assert.ok(Math.abs(half.needs.energy - 70) < .01);
  assert.equal(half.needs.mood, 60);
  assert.ok(half.needs.clean < 100);
  // de vacía a llena en ~1 hora
  assert.equal(needsAt(house({ energy: 0 }, { sleepSince: 0 }), HR).needs.energy, 100);
  // dormido ya lleno: hace una siesta corta antes de despertar solo
  assert.ok(needsAt(house({}, { sleepSince: 0 }), (N.minNapMinutes - 1) * 60e3).sleepSince !== null, 'siesta mínima');
  assert.equal(needsAt(house({}, { sleepSince: 0 }), (N.minNapMinutes + 1) * 60e3).sleepSince, null);
  // 2 h: despertó a los 48 min (de 20 a 100) y desde ahí todo baja normal
  const later = needsAt(house({ energy: 20, mood: 60 }, { sleepSince: 0 }), 2 * HR);
  assert.equal(later.sleepSince, null);
  const awake = 2 - .8;
  assert.ok(Math.abs(later.needs.energy - (100 - N.decayPerHour.energy * awake)) < .01);
  assert.ok(Math.abs(later.needs.mood - (60 - N.decayPerHour.mood * awake)) < .01);
});

test('necesidades: relojes raros y datos dañados no la rompen', ()=>{
  // una hora guardada en el futuro cuenta como ahora: no baja nada
  assert.deepEqual(needsAt({ at: 10 * HR, needs: FULL, sleepSince: null }, 1 * HR).needs, FULL);
  const c = cleanHouse({ at: 'x', needs: { hunger: 'mucha', clean: 250, energy: -40, mood: NaN }, sleepSince: 'ayer' }, 5);
  assert.deepEqual(c, { at: 5, needs: { hunger: 100, clean: 100, energy: 0, mood: 100 }, sleepSince: null });
  assert.deepEqual(cleanHouse(undefined, 7), { at: 7, needs: FULL, sleepSince: null });
  assert.deepEqual(cleanHouse(null, 7).needs, FULL);
});

test('necesidades: la prioridad decide cómo se ve (sueño > hambre > limpieza > ánimo)', ()=>{
  const low = N.low - 1;
  assert.equal(topNeed(FULL), null);
  assert.equal(topNeed({ ...FULL, mood: low, clean: low, energy: low }), 'sleepy');
  assert.equal(topNeed({ ...FULL, mood: low, clean: low, hunger: low }), 'hungry');
  assert.equal(topNeed({ ...FULL, mood: low, clean: low }), 'dirty');
  assert.equal(topNeed({ ...FULL, mood: low }), 'sad');
});

test('necesidades: los cariños suben el ánimo con tope por minuto; el baño y el sueño se guardan', ()=>{
  const t0 = 1e12;
  state.house = house({ mood: 30 }, { at: t0 });
  const gains = [0, 1, 2, 3, 4].map(i => careMood(t0 + i * 1000));
  assert.deepEqual(gains, [4, 4, 4, 0, 0], 'tope de 12 por minuto');
  assert.equal(careMood(t0 + 61e3), 4, 'al minuto siguiente vuelve a subir');
  assert.ok(Math.abs(getNeeds(t0 + 61e3).mood - 46) < .1);

  state.house = house({ clean: 30 }, { at: t0 });
  assert.equal(addClean(500, t0), 100, 'la limpieza no pasa de 100');
  assert.equal(addClean(-50, t0), 100, 'frotar nunca ensucia');

  state.house = house({ energy: 30 }, { at: t0 });
  startSleep(t0);
  assert.equal(getNeeds(t0 + 10 * 60e3).asleep, true);
  assert.ok(Math.abs(getNeeds(t0 + 30 * 60e3).energy - 80) < .01);
  wakeUp(t0 + 30 * 60e3);
  assert.equal(getNeeds(t0 + 31 * 60e3).asleep, false);
  delete state.house;
});

test('necesidades: compatibles con partidas sin el campo y con respaldos dañados', ()=>{
  const fixture = readFileSync(new URL('./fixtures/guardado-42c03de.json', import.meta.url), 'utf8');
  const parsed = parseSave(fixture);
  assert.equal('house' in parsed, false, 'una partida vieja no inventa el campo');
  assert.deepEqual(needsAt(parsed.house, Date.now()).needs, FULL, 'sin el campo, todo lleno');
  const withHouse = parseSave(JSON.stringify({ ...JSON.parse(fixture), house: { at: 'x', needs: { clean: 999 } } }));
  assert.equal(withHouse.house.needs.clean, 100);
  assert.ok(Number.isFinite(withHouse.house.at));
});

test('contenido: frases de necesidades, sueño y baño, cortas', ()=>{
  const all = [MITO_NEEDS, MITO_THANKS, MITO_SLEEP, MITO_BATH].flatMap(o => Object.values(o).flat());
  assert.ok(all.length > 20);
  assert.deepEqual(all.filter(m => [...m].length > 34), []);
  for(const need of ['sleepy', 'dirty', 'sad']) assert.ok(MITO_NEEDS[need].length >= 2);
});

/* ---------------- comida (Fase 3) ---------------- */

import { cleanPantry, getPantry, foodCount, buyFood, eatFood, parsePantry } from '../src/state/pantry.js';
import { FOODS, FOOD_MAX, findFood } from '../src/content/food.js';
import { FOOD_FACTS } from '../src/content/nutrition.js';
import { FOOD_ART } from '../src/content/art/food.js';
import { MITO_FOOD, PET_EAT } from '../src/content/house.js';
import { resetAll } from '../src/state/backup.js';

const freshPantry = (chispas = 1000) => { delete state.pantry; state.chispas = chispas; };

test('comida: comprar suma una unidad y cobra; sin saldo o con el máximo, no', ()=>{
  freshPantry(25);
  assert.equal(buyFood('f-apple'), 1);
  assert.equal(buyFood('f-apple'), 2);
  assert.equal(state.chispas, 5);
  assert.equal(buyFood('f-banana'), 0, 'sin saldo (cuesta 15)');
  assert.equal(state.chispas, 5);
  assert.equal(buyFood('f-nope'), 0, 'no existe');
  state.chispas = 1000; state.pantry = { 'f-egg': FOOD_MAX };
  assert.equal(buyFood('f-egg'), 0, 'máximo por alimento');
  assert.equal(state.chispas, 1000);
  freshPantry(0);
});

test('comida: comer gasta una unidad y llena; con Mito lleno no se gasta', ()=>{
  const t0 = 2e12;
  freshPantry();
  state.house = { v: 3, at: t0, needs: { hunger: 30, clean: 100, energy: 100, mood: 100 }, sleepSince: null };
  state.pantry = { 'f-apple': 2, 'f-plate': 1 };
  assert.deepEqual(eatFood('f-banana', t0), { ok: false, reason: 'none' }, 'no tienes ese alimento');
  const a = eatFood('f-apple', t0);
  assert.equal(a.ok, true);
  assert.equal(a.left, 1);
  assert.ok(Math.abs(a.hunger - 55) < .01, 'la manzana llena 25');
  const b = eatFood('f-plate', t0);
  assert.ok(Math.abs(b.hunger - 100) < .01, 'no pasa de 100');
  assert.deepEqual(getPantry(), { 'f-apple': 1 }, 'lo que llega a 0 sale de la charola');
  assert.deepEqual(eatFood('f-apple', t0), { ok: false, reason: 'full' });
  assert.equal(foodCount('f-apple'), 1, 'lleno: la comida no se gasta');
  // justo debajo del umbral, sí come
  state.house.needs.hunger = N.fullAbove - 1;
  assert.equal(eatFood('f-apple', t0).ok, true);
  assert.equal('pantry' in state, false, 'charola vacía: el campo no se guarda');
  delete state.house;
});

test('comida: comer sube el hambre sin pasar de 100, y desde NEEDS.fullAbove está lleno', ()=>{
  const t0 = 4e12;
  state.house = { v: 3, at: t0, needs: { hunger: 40, clean: 100, energy: 100, mood: 100 }, sleepSince: null };
  assert.equal(isFull(t0), false);
  assert.ok(Math.abs(feed(25, t0) - 65) < .01);
  assert.equal(feed(-10, t0), 65, 'nunca baja al comer');
  assert.equal(feed(500, t0), 100);
  assert.equal(isFull(t0), true);
  delete state.house;
});

test('comida: el hambre baja con el tiempo, hasta el piso, y no baja de golpe en partidas de antes', ()=>{
  const t0 = 3e12;
  state.house = { v: 3, at: t0, needs: { hunger: 100, clean: 100, energy: 100, mood: 100 }, sleepSince: null };
  assert.ok(Math.abs(getNeeds(t0 + 12 * HR).hunger - 75) < .01);
  assert.equal(getNeeds(t0 + 60 * 24 * HR).hunger, N.floor);
  // datos de la Fase 2 (sin `v`) guardados hace 2 días: el hambre empieza a bajar desde ahora; lo demás, como siempre
  state.house = { at: t0 - 48 * HR, needs: { hunger: 100, clean: 100, energy: 100, mood: 100 }, sleepSince: null };
  const now = getNeeds(t0);
  assert.equal(now.hunger, 100);
  assert.equal(now.clean, N.floor);
  assert.equal(state.house.v, 3, 'se migra una sola vez');
  assert.ok(Math.abs(getNeeds(t0 + 24 * HR).hunger - 50) < .01);
  delete state.house;
});

test('comida: compatible con partidas sin el campo, con respaldos dañados y con reiniciar', ()=>{
  const fixture = readFileSync(new URL('./fixtures/guardado-42c03de.json', import.meta.url), 'utf8');
  assert.equal('pantry' in parseSave(fixture), false, 'una partida vieja no inventa el campo');
  const old = JSON.parse(fixture);
  const junk = parseSave(JSON.stringify({ ...old, pantry: { 'f-apple': 3.7, 'f-egg': -2, 'f-x': 5, 'f-rice': 500, 'f-oats': 'mucho' } }));
  assert.deepEqual(junk.pantry, { 'f-apple': 3, 'f-rice': FOOD_MAX });
  assert.equal('pantry' in parseSave(JSON.stringify({ ...old, pantry: { 'f-x': 1 } })), false, 'vacía: no se guarda');
  assert.deepEqual(cleanPantry('nada'), {});
  assert.equal(parsePantry(undefined), undefined);
  state.pantry = { 'f-apple': 2 }; state.foodHint = 2;
  resetAll();
  assert.equal('pantry' in state, false);
  assert.equal('foodHint' in state, false);
});

test('contenido: catálogo de comida completo, datos de nutrición cortos y frases cortas', ()=>{
  assert.ok(FOODS.length >= 6 && FOODS.length <= 8);
  for(const f of FOODS){
    assert.ok(f.cost >= 10 && f.cost <= 50, `${f.id}: precio`);
    assert.ok(f.fill >= 25 && f.fill <= 60, `${f.id}: cuánto llena`);
    assert.ok(FOOD_ART[f.id], `${f.id}: dibujo`);
    assert.ok(typeof f.fact === 'string' && f.fact.length > 20 && [...f.fact].length <= 90, `${f.id}: dato (${f.fact})`);
    assert.ok([...f.say].length <= 34, `${f.id}: frase`);
    assert.equal(findFood(f.id), f);
  }
  assert.deepEqual(Object.keys(FOOD_FACTS).sort(), FOODS.map(f => f.id).sort(), 'un dato por alimento, sin sobrantes');
  const phrases = [...Object.values(MITO_FOOD).flat(), ...Object.values(PET_EAT), ...MITO_NEEDS.hungry];
  assert.deepEqual(phrases.filter(m => [...m].length > 34), []);
  assert.deepEqual(Object.keys(PET_EAT).sort(), Object.keys(PET_HOUSE).sort(), 'cada mascota tiene su frase al comer');
});

/* ---------------- muebles y decoración (Fase 4) ---------------- */

import { cleanDecor, getDecor, buyFurniture, placeFurniture, flipFurniture, storeFurniture, grantGift, parseDecor } from '../src/state/decor.js';
import { FURNITURE, findFurniture, FURNITURE_SIZE, FURNITURE_SCALE } from '../src/content/furniture.js';
import { FURNITURE_ART } from '../src/content/art/furniture.js';
import { MITO_DECOR } from '../src/content/house.js';
import { importSave, exportSave } from '../src/state/backup.js';
import { FURN, furnitureBox, clampSpot, spotAt, freeSpot, depthOrder, windowRect, snapScale, stepScale, resizeSpot } from '../src/features/house/furniture-layout.js';

const freshDecor = (chispas = 5000) => { delete state.decor; state.chispas = chispas; };
const F = id => findFurniture(id);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
// Los tamaños de pantalla que se revisan (el cuarto, con la barra dentro).
const ROOMS = [[1176, 900, 84], [1176, 800, 84], [390, 714, 76], [360, 614, 76], [1920, 900, 84]].map(([w, h, bar]) => sceneLayout(w, h, bar));

test('muebles: comprar cobra una sola vez, va al inventario y el regalo no se vende', ()=>{
  freshDecor(400);
  assert.equal(buyFurniture('m-bed'), true);
  assert.equal(state.chispas, 0);
  assert.deepEqual(getDecor().owned, ['m-bed']);
  assert.deepEqual(getDecor().placed, {}, 'comprado: queda en el inventario, no en el cuarto');
  state.chispas = 1000;
  assert.equal(buyFurniture('m-bed'), false, 'una sola vez');
  assert.equal(buyFurniture('m-rug'), false, 'la alfombra es regalo');
  assert.equal(buyFurniture('m-nope'), false);
  assert.equal(state.chispas, 1000);
  state.chispas = 100;
  assert.equal(buyFurniture('m-lamp'), false, 'sin saldo');
  assert.equal(state.chispas, 100);
  freshDecor(0);
});

test('muebles: colocar, mover, voltear y guardar; Mito lo comenta solo la primera vez', ()=>{
  freshDecor();
  buyFurniture('m-sofa'); buyFurniture('m-clock');
  assert.deepEqual(placeFurniture('m-lamp', { u: .5, v: .5 }), { ok: false, first: false }, 'no lo tienes');
  assert.deepEqual(placeFurniture('m-sofa', { zona: 'wall', u: 3, v: -1 }), { ok: true, first: true });
  assert.deepEqual(getDecor().placed['m-sofa'], { zona: 'floor', u: 1, v: 0 }, 'la zona es la del catálogo y u, v quedan en [0, 1]');
  assert.equal(placeFurniture('m-sofa', { u: .3, v: .6 }).first, false, 'moverlo no es la primera vez');
  assert.equal(flipFurniture('m-sofa'), true);
  assert.equal(placeFurniture('m-sofa', { u: .4, v: .6 }).ok, true);
  assert.equal(getDecor().placed['m-sofa'].flip, true, 'al moverlo sigue volteado');
  assert.equal(flipFurniture('m-sofa'), false);
  placeFurniture('m-clock', { u: .7, v: .3 });
  assert.equal(flipFurniture('m-clock'), false, 'el reloj es simétrico: no se voltea');
  assert.equal(storeFurniture('m-sofa'), true);
  assert.equal(storeFurniture('m-sofa'), false, 'ya estaba guardado');
  assert.deepEqual(Object.keys(getDecor().placed), ['m-clock']);
  assert.ok(getDecor().owned.includes('m-sofa'), 'guardar no lo quita de tus muebles');
  assert.equal(placeFurniture('m-sofa', { u: .5, v: .5 }).first, false, 'volver a ponerlo tampoco es la primera vez');
  freshDecor(0);
});

test('muebles: la alfombra de regalo se entrega una vez, ya colocada', ()=>{
  freshDecor(0);
  assert.deepEqual(grantGift('bedroom', { u: .5, v: .4 }), ['m-rug']);
  assert.deepEqual(getDecor().placed['m-rug'], { zona: 'floor', u: .5, v: .4 });
  assert.deepEqual(grantGift('bedroom', { u: .1, v: .1 }), [], 'ya la tienes');
  storeFurniture('m-rug');
  assert.deepEqual(grantGift('bedroom', { u: .1, v: .1 }), [], 'guardada sigue siendo tuya: no se regala otra');
  assert.equal(state.chispas, 0, 'el regalo no cuesta');
  freshDecor(0);
});

test('muebles: datos guardados limpios, compatibles sin el campo, y en exportar, importar y reiniciar', ()=>{
  const fixture = readFileSync(new URL('./fixtures/guardado-42c03de.json', import.meta.url), 'utf8');
  const old = JSON.parse(fixture);
  assert.equal('decor' in parseSave(fixture), false, 'una partida vieja no inventa el campo');
  assert.deepEqual(cleanDecor(undefined), { owned: [], placed: {}, seen: [] }, 'sin el campo: sin muebles');
  const junk = parseSave(JSON.stringify({ ...old, decor: {
    owned: ['m-bed', 'm-bed', 'm-x', 7, 'm-picture'],
    placed: { 'm-bed': { zona: 'wall', u: 'mucho', v: 9, flip: true }, 'm-picture': { u: .5, v: .2, flip: true }, 'm-lamp': { u: .5, v: .5 }, 'm-x': {} },
    seen: ['m-bed', 'm-lamp'],
  } }));
  assert.deepEqual(junk.decor, {
    v: 2,
    owned: ['m-bed', 'm-picture'],
    placed: { 'm-bed': { zona: 'floor', u: .5, v: 1, flip: true }, 'm-picture': { zona: 'wall', u: .5, v: .2 } },
    seen: ['m-bed'],
  }, 'sin repetidos ni desconocidos, nada colocado sin comprar, y el cuadro no se voltea');
  assert.equal('decor' in parseSave(JSON.stringify({ ...old, decor: { owned: ['m-x'] } })), false, 'sin muebles: no se guarda');
  assert.equal('decor' in parseSave(JSON.stringify({ ...old, decor: 'roto' })), false);
  assert.equal(parseDecor(null), undefined);

  // exportar e importar no pierde nada
  freshDecor();
  buyFurniture('m-desk'); placeFurniture('m-desk', { u: .25, v: .5 }); flipFurniture('m-desk'); buyFurniture('m-plant');
  const saved = getDecor();
  importSave(exportSave());
  assert.deepEqual(getDecor(), saved);
  // importar una partida sin el campo la reemplaza entera: el cuarto queda sin muebles
  importSave(fixture);
  assert.deepEqual(getDecor().owned, []);
  assert.equal('decor' in state, false);
  // reiniciar todo
  state.decor = { owned: ['m-bed'], placed: {} }; state.decorHint = 3;
  resetAll();
  assert.equal('decor' in state, false);
  assert.equal('decorHint' in state, false);
});

test('muebles: colocados quedan enteros dentro de su zona, en todos los tamaños', ()=>{
  for(const L of ROOMS) for(const item of FURNITURE) for(const [u, v] of [[0, 0], [1, 1], [-3, 5], [.5, .5], [1, 0], [0, 1]]){
    const p = clampSpot(L, item, { u, v });
    const b = furnitureBox(L, item, p);
    const tag = `${item.id} ${L.W}×${L.H} (${u}, ${v})`;
    assert.ok(b.x >= FURN.margin - .5 && b.x + b.w <= L.W - FURN.margin + .5, `${tag}: dentro a lo ancho`);
    assert.ok(b.y >= FURN.margin - .5, `${tag}: no sale por arriba`);
    if(item.zone === 'floor'){
      assert.ok(b.base >= L.horizon + FURN.margin - .5, `${tag}: la base está en el piso`);
      assert.ok(b.base <= L.H - L.barSpace - FURN.barGap + .5, `${tag}: no baja a la franja de la barra`);
    } else {
      assert.ok(b.y + b.h <= L.horizon - FURN.margin + .5, `${tag}: en la pared, arriba del zócalo`);
      assert.ok(!overlap(b, windowRect(L)), `${tag}: no tapa la ventana`);
    }
  }
});

test('muebles: más al frente se ven más grandes (la perspectiva del piso) y valen 1 donde está Mito', ()=>{
  for(const L of ROOMS){
    const sofa = F('m-sofa');
    const back = furnitureBox(L, sofa, { u: .5, v: 0 }), front = furnitureBox(L, sofa, { u: .5, v: 1 });
    assert.ok(front.w > back.w * 1.05, `${L.W}×${L.H}: crece hacia el frente`);
    const atMito = spotAt(L, sofa, L.home.x, L.home.y);
    const w = furnitureBox(L, sofa, atMito).w, w0 = sofa.size * L.block.w * FURNITURE_SIZE[L.kind];
    assert.ok(Math.abs(w - w0) < 1, 'en la fila de Mito, su tamaño de catálogo');
    const clock = F('m-clock');
    assert.equal(furnitureBox(L, clock, { u: .5, v: 0 }).w, furnitureBox(L, clock, { u: .5, v: 1 }).w, 'en la pared no cambia');
  }
});

test('muebles: de una posición en px a { u, v } y de vuelta', ()=>{
  const L = ROOMS[0], lamp = F('m-lamp');
  const p = spotAt(L, lamp, L.W * .3, L.horizon + 120);
  const b = furnitureBox(L, lamp, p);
  assert.ok(Math.abs(b.x + b.w / 2 - L.W * .3) < .5 && Math.abs(b.base - (L.horizon + 120)) < .5);
  assert.equal(spotAt(L, lamp, L.W * .3, L.horizon + 120, { flip: true }).flip, true, 'conserva el volteo');
  const far = spotAt(L, lamp, -500, 99999);
  assert.ok(far.u > 0 && far.v === 1, 'fuera del cuarto: al borde más cercano');
});

test('muebles: un mueble de la pared que cae sobre la ventana se corre al lado libre más cercano', ()=>{
  for(const L of ROOMS){
    const R = windowRect(L), pic = F('m-picture');
    const p = clampSpot(L, pic, { u: (R.x + R.w / 2) / L.W, v: .3 });
    assert.ok(!overlap(furnitureBox(L, pic, p), R), `${L.W}×${L.H}`);
  }
});

test('muebles: al sacarlo de la bandeja va a un lugar libre (no detrás de Mito ni encima de otro), si lo hay', ()=>{
  const body = L => ({ x: L.home.x - L.mito * .35, y: L.home.y - L.mito * .76, w: L.mito * .7, h: L.mito * .72 });   // el cuerpo de Mito
  // escritorio: hasta el sillón (grande, para que Mito quepa encima) tiene sitio libre
  const D = ROOMS[0];
  const sofa = furnitureBox(D, F('m-sofa'), freeSpot(D, F('m-sofa')));
  assert.ok(!overlap(sofa, body(D)), 'no queda escondido detrás de Mito');
  const plant = furnitureBox(D, F('m-plant'), freeSpot(D, F('m-plant'), [sofa]));
  assert.ok(!overlap(plant, sofa) && !overlap(plant, body(D)));
  // teléfono: los muebles que caben junto a Mito van a un lugar libre
  const T = ROOMS[2];
  const lamp = furnitureBox(T, F('m-lamp'), freeSpot(T, F('m-lamp')));
  const cushion = furnitureBox(T, F('m-cushion'), freeSpot(T, F('m-cushion'), [lamp]));
  assert.ok(!overlap(lamp, body(T)) && !overlap(cushion, body(T)) && !overlap(cushion, lamp));
});

test('muebles: profundidad: la pared atrás y el piso por v (lo de más al frente, encima)', ()=>{
  const e = (id, v) => ({ item: F(id), p: { u: .5, v } });
  const order = depthOrder([e('m-sofa', .9), e('m-clock', .9), e('m-bed', .1), e('m-plant', .5), e('m-picture', 0)]).map(x => x.item.id);
  assert.deepEqual(order, ['m-clock', 'm-picture', 'm-bed', 'm-plant', 'm-sofa']);
});

test('contenido: catálogo de muebles (10 a 12, pared y piso, 150–400), dibujos y frases cortas', ()=>{
  assert.ok(FURNITURE.length >= 10 && FURNITURE.length <= 12);
  assert.ok(FURNITURE.some(f => f.zone === 'wall') && FURNITURE.some(f => f.zone === 'floor'));
  assert.deepEqual(FURNITURE.filter(f => f.gift).map(f => f.id), ['m-rug'], 'un solo regalo, gratis');
  for(const f of FURNITURE){
    if(!f.gift) assert.ok(f.cost >= 150 && f.cost <= 400, `${f.id}: precio`);
    assert.ok(['wall', 'floor'].includes(f.zone));
    const vb = FURNITURE_ART[f.id]?.match(/viewBox="0 0 (\d+) (\d+)"/);
    assert.ok(vb, `${f.id}: dibujo`);
    assert.deepEqual([+vb[1], +vb[2]], f.box, `${f.id}: la proporción del dibujo es la del catálogo`);
    assert.ok(MITO_DECOR.placed[f.id], `${f.id}: lo que dice Mito al colocarlo`);
  }
  const phrases = [...Object.values(MITO_DECOR.placed), ...MITO_DECOR.gift];
  assert.deepEqual(phrases.filter(m => [...m].length > 34), []);
});

test('respaldo: importar reemplaza la partida entera, también los campos opcionales que el archivo no trae', ()=>{
  const fixture = readFileSync(new URL('./fixtures/guardado-42c03de.json', import.meta.url), 'utf8');
  state.house = { v: 3, at: Date.now(), needs: { hunger: 30, clean: 30, energy: 30, mood: 30 }, sleepSince: null };
  state.pantry = { 'f-apple': 4 }; state.decor = { owned: ['m-bed'], placed: {} };
  state.houseHint = 2; state.foodHint = 1; state.decorHint = 5;
  const before = state;
  importSave(fixture);
  assert.equal(state, before, 'el objeto de estado es el mismo (quien lo capturó lo sigue viendo)');
  for(const k of ['house', 'pantry', 'decor', 'houseHint', 'foodHint', 'decorHint']) assert.equal(k in state, false, k);
  assert.equal(state.chispas, JSON.parse(fixture).chispas);
  // y lo que el archivo sí trae, entra
  importSave(JSON.stringify({ ...JSON.parse(fixture), pantry: { 'f-egg': 2 }, decorHint: 3 }));
  assert.deepEqual(state.pantry, { 'f-egg': 2 });
  assert.equal(state.decorHint, 3);
  resetAll();
});

test('muebles: cambiar solo una parte de la colocación conserva lo demás (no vuelve al centro)', ()=>{
  freshDecor();
  buyFurniture('m-sofa');
  placeFurniture('m-sofa', { u: .3, v: .7, flip: true });
  placeFurniture('m-sofa', { v: .4 });
  assert.deepEqual(getDecor().placed['m-sofa'], { zona: 'floor', u: .3, v: .4, flip: true });
  freshDecor(0);
});

/* ---------------- tamaño ajustable de los muebles (Fase 4.5) ---------------- */

test('tamaño: guardado opcional (sin él, 1), acotado a 60–160 % y compatible con muebles guardados sin scale', ()=>{
  freshDecor();
  buyFurniture('m-bed'); buyFurniture('m-clock');
  placeFurniture('m-bed', { u: .3, v: .4 });
  assert.equal('scale' in getDecor().placed['m-bed'], false, 'el 100 % no se guarda');
  placeFurniture('m-bed', { u: .3, v: .4, scale: 1.25 });
  assert.equal(getDecor().placed['m-bed'].scale, 1.25);
  placeFurniture('m-bed', { u: .5, v: .5 });
  assert.equal(getDecor().placed['m-bed'].scale, 1.25, 'moverlo conserva el tamaño');
  flipFurniture('m-bed');
  assert.equal(getDecor().placed['m-bed'].scale, 1.25, 'voltearlo también');
  placeFurniture('m-clock', { u: .7, v: .3, scale: 9 });
  assert.equal(getDecor().placed['m-clock'].scale, FURNITURE_SCALE.max);
  placeFurniture('m-clock', { scale: .1 });
  assert.equal(getDecor().placed['m-clock'].scale, FURNITURE_SCALE.min);
  placeFurniture('m-clock', { scale: 1 });
  assert.equal('scale' in getDecor().placed['m-clock'], false, 'volver al original lo quita');
  assert.equal(getDecor().placed['m-clock'].u, .7, 'cambiar solo el tamaño no mueve el mueble');
  // datos guardados: sin scale (Fase 4) y con valores raros
  const clean = cleanDecor({ owned: ['m-bed', 'm-sofa', 'm-lamp', 'm-plant'], placed: {
    'm-bed': { u: .2, v: .3 }, 'm-sofa': { u: .5, v: .5, scale: 'grande' }, 'm-lamp': { u: .5, v: .5, scale: 0 }, 'm-plant': { u: .5, v: .5, scale: 1.333333 },
  } });
  assert.deepEqual(clean.placed['m-bed'], { zona: 'floor', u: .2, v: .3 }, 'sin scale: tamaño de siempre, sin inventar el campo');
  assert.equal('scale' in clean.placed['m-sofa'], false, 'no es número: 1');
  assert.equal(clean.placed['m-lamp'].scale, FURNITURE_SCALE.min);
  assert.equal(clean.placed['m-plant'].scale, 1.33, 'con 2 decimales');
  // exportar e importar lo conserva
  const saved = getDecor();
  importSave(exportSave());
  assert.deepEqual(getDecor(), saved);
  freshDecor(0);
});

test('tamaño: se pega al 100 % al pasar cerca, y los pasos de los botones caen en múltiplos de 10 %', ()=>{
  const { min, max, snap } = FURNITURE_SCALE;
  assert.equal(snapScale(1 + snap * .8), 1);
  assert.equal(snapScale(1 - snap * .8), 1);
  assert.equal(snapScale(1 + snap * 1.2), Math.round((1 + snap * 1.2) * 100) / 100, 'fuera del margen, no se pega');
  assert.equal(snapScale(5), max);
  assert.equal(snapScale(-1), min);
  assert.equal(snapScale(NaN), 1);
  assert.equal(stepScale(1, 1), 1.1);
  assert.equal(stepScale(1, -1), .9);
  assert.equal(stepScale(1.37, 1), 1.4, 'al siguiente múltiplo');
  assert.equal(stepScale(1.37, -1), 1.3);
  assert.equal(stepScale(max, 1), max);
  assert.equal(stepScale(min, -1), min);
  let s = 1; for(let i = 0; i < 20; i++) s = stepScale(s, 1);
  assert.equal(s, max);
});

test('tamaño: se combina con la perspectiva del piso (al 120 % sigue creciendo al acercarse)', ()=>{
  for(const L of ROOMS){
    const sofa = F('m-sofa');
    const back = furnitureBox(L, sofa, { u: .5, v: 0, scale: 1.2 }), front = furnitureBox(L, sofa, { u: .5, v: 1, scale: 1.2 });
    assert.ok(front.w > back.w * 1.05);
    const plain = furnitureBox(L, sofa, { u: .5, v: .5 });
    assert.ok(Math.abs(furnitureBox(L, sofa, { u: .5, v: .5, scale: 1.2 }).w - plain.w * 1.2) < .01, 'en el mismo lugar, 1.2 veces');
  }
});

test('tamaño: al cambiarlo, el mueble del piso conserva su base y el de la pared su centro', ()=>{
  const L = ROOMS[0];
  const bed = F('m-bed'), p = clampSpot(L, bed, { u: .4, v: .5 });
  const b0 = furnitureBox(L, bed, p), b1 = furnitureBox(L, bed, resizeSpot(L, bed, p, 1.3));
  assert.ok(Math.abs(b1.base - b0.base) < .5 && Math.abs((b1.x + b1.w / 2) - (b0.x + b0.w / 2)) < .5, 'la base no se mueve');
  const clock = F('m-clock'), c = clampSpot(L, clock, { u: .7, v: .5 });
  const c0 = furnitureBox(L, clock, c), c1 = furnitureBox(L, clock, resizeSpot(L, clock, c, 1.5));
  assert.ok(Math.abs((c1.y + c1.h / 2) - (c0.y + c0.h / 2)) < .5 && Math.abs((c1.x + c1.w / 2) - (c0.x + c0.w / 2)) < .5, 'el centro no se mueve');
  assert.equal(resizeSpot(L, bed, { ...p, flip: true }, 1.2).flip, true, 'conserva el volteo');
});

test('tamaño: a cualquier tamaño, el mueble queda dentro del cuarto, arriba de la barra y fuera de la ventana', ()=>{
  for(const L of ROOMS) for(const item of FURNITURE) for(const scale of [FURNITURE_SCALE.min, 1.3, FURNITURE_SCALE.max]) for(const [u, v] of [[0, 0], [1, 1], [.5, .5], [0, 1], [1, 0]]){
    const p = clampSpot(L, item, { u, v, scale });
    const b = furnitureBox(L, item, p);
    const tag = `${item.id} ${L.W}×${L.H} ${scale} (${u}, ${v})`;
    assert.ok(b.x >= FURN.margin - .5 && b.x + b.w <= L.W - FURN.margin + .5, `${tag}: dentro a lo ancho`);
    assert.ok(b.y >= FURN.margin - .5, `${tag}: no sale por arriba`);
    assert.ok((p.scale || 1) >= FURNITURE_SCALE.min && (p.scale || 1) <= scale + 1e-9, `${tag}: el tamaño solo baja si no cabe`);
    if(item.zone === 'floor') assert.ok(b.base <= L.H - L.barSpace - FURN.barGap + .5, `${tag}: arriba de la barra`);
    else {
      assert.ok(b.y + b.h <= L.horizon - FURN.margin + .5, `${tag}: arriba del zócalo`);
      assert.ok(!overlap(b, windowRect(L)), `${tag}: no tapa la ventana`);
    }
  }
  // en el escritorio, todo cabe a 160 %: el tamaño no se recorta
  const L = ROOMS[0];
  for(const item of FURNITURE) assert.equal(clampSpot(L, item, { u: .5, v: .5, scale: FURNITURE_SCALE.max }).scale, FURNITURE_SCALE.max, item.id);
  // agrandar un cuadro junto a la ventana: se corre al lado libre, no la tapa
  const R = windowRect(L), pic = F('m-picture');
  const beside = clampSpot(L, pic, spotAt(L, pic, R.x + R.w + 60, R.y + 40));
  const big = resizeSpot(L, pic, beside, FURNITURE_SCALE.max);
  assert.ok(!overlap(furnitureBox(L, pic, big), R));
  assert.equal(big.scale, FURNITURE_SCALE.max);
});

test('arte: los muebles son vectoriales puros (sin imágenes, filtros ni trazos que no escalen)', ()=>{
  for(const [id, svg] of Object.entries(FURNITURE_ART)){
    assert.doesNotMatch(svg, /<image|<foreignObject|filter=|<filter|vector-effect|data:image/i, id);
    assert.match(svg, /^<svg viewBox="0 0 \d+ \d+"/, `${id}: escala con su viewBox (los contornos crecen en proporción)`);
    assert.doesNotMatch(svg, /\b(width|height)="\d+(px)?"\s[^>]*viewBox|<svg[^>]*\b(width|height)=/, `${id}: sin tamaño fijo en px`);
  }
});

/* ---------------- varios cuartos y Mito libre (Fase 5): modelo ---------------- */

import { ROOMS as HOUSE_ROOMS, DEFAULT_ROOM, findRoom } from '../src/content/rooms.js';
import { placedIn, spotRoom } from '../src/state/decor.js';
import { getMito, setMito, cleanMito } from '../src/state/house.js';

test('cuartos: cuatro, en orden, con su acción (y una sola vez cada una); el Cuarto es el de siempre', ()=>{
  assert.deepEqual(HOUSE_ROOMS.map(r => r.id), ['bedroom', 'bath', 'living', 'kitchen']);
  assert.deepEqual(HOUSE_ROOMS.map(r => r.name), ['Cuarto', 'Baño', 'Sala', 'Cocina']);
  assert.deepEqual(HOUSE_ROOMS.map(r => r.action), ['sleep', 'bath', null, 'eat']);
  assert.equal(findRoom(DEFAULT_ROOM).name, 'Cuarto');
  assert.equal(findRoom('patio'), null);
  for(const f of FURNITURE) assert.ok(findRoom(f.room), `${f.id}: su cuarto existe`);
});

test('cuartos: cada mueble guarda su cuarto (sin él, el Cuarto) y lo conserva al moverlo', ()=>{
  freshDecor();
  ['m-bed', 'm-sofa', 'm-clock'].forEach(buyFurniture);
  placeFurniture('m-bed', { u: .2, v: .3 });
  assert.equal('room' in getDecor().placed['m-bed'], false, 'el Cuarto no se escribe (como las partidas de antes)');
  placeFurniture('m-sofa', { room: 'living', u: .5, v: .5 });
  assert.equal(getDecor().placed['m-sofa'].room, 'living');
  placeFurniture('m-sofa', { u: .3 });
  assert.equal(getDecor().placed['m-sofa'].room, 'living', 'moverlo no lo cambia de cuarto');
  placeFurniture('m-sofa', { room: 'bedroom' });
  assert.equal('room' in getDecor().placed['m-sofa'], false, 'de vuelta al Cuarto');
  placeFurniture('m-clock', { room: 'patio', u: .5, v: .5 });
  assert.equal('room' in getDecor().placed['m-clock'], false, 'un cuarto que no existe es el Cuarto');
  placeFurniture('m-clock', { room: 'kitchen' });
  assert.deepEqual(placedIn('bedroom').sort(), ['m-bed', 'm-sofa']);
  assert.deepEqual(placedIn('kitchen'), ['m-clock']);
  assert.deepEqual(placedIn('bath'), []);
  assert.equal(spotRoom(undefined), 'bedroom');
  // datos guardados: room raro → el Cuarto; y viaja en el respaldo
  const clean = cleanDecor({ owned: ['m-bed', 'm-lamp'], placed: { 'm-bed': { room: 7, u: .5, v: .5 }, 'm-lamp': { room: 'bath', u: .5, v: .5 } } });
  assert.equal('room' in clean.placed['m-bed'], false);
  assert.equal(clean.placed['m-lamp'].room, 'bath');
  const saved = getDecor();
  importSave(exportSave());
  assert.deepEqual(getDecor(), saved);
  freshDecor(0);
});

test('cuartos: el regalo es por cuarto (la alfombra solo en el Cuarto) y se entrega una vez', ()=>{
  freshDecor(0);
  assert.deepEqual(grantGift('kitchen', { u: .5, v: .5 }), [], 'la alfombra no es de la Cocina');
  assert.deepEqual(grantGift('bedroom', { u: .5, v: .46 }), ['m-rug']);
  assert.deepEqual(getDecor().placed['m-rug'], { zona: 'floor', u: .5, v: .46 });
  assert.deepEqual(grantGift('bedroom', { u: .5, v: .46 }), []);
  freshDecor(0);
});

test('muebles para sentarse: más grandes, y el tamaño que eligió la usuaria se conserva relativo al nuevo', ()=>{
  assert.equal(F('m-bed').size, .36);
  assert.equal(F('m-sofa').size, .25);
  const L = ROOMS[0], bed = F('m-bed');
  const base = furnitureBox(L, bed, { u: .5, v: .5 }).w, scaled = furnitureBox(L, bed, { u: .5, v: .5, scale: 1.2 }).w;
  assert.ok(Math.abs(scaled / base - 1.2) < 1e-9, 'al 120 % sigue siendo 1.2 veces su base');
  // superficies: dentro del dibujo, de izquierda a derecha, de un tipo conocido
  for(const f of FURNITURE) for(const seat of f.seat || []){
    assert.ok(['sit', 'lie', 'in'].includes(seat.kind), f.id);
    assert.ok(seat.y > 0 && seat.y < 1 && seat.x[0] >= 0 && seat.x[1] <= 1 && seat.x[0] < seat.x[1], f.id);
  }
  assert.deepEqual(FURNITURE.filter(f => f.seat).map(f => f.id).sort(), ['m-bed', 'm-cushion', 'm-desk', 'm-sofa']);
});

test('Mito: sin posición guardada está en su lugar de siempre del Cuarto; se guarda en el piso, sobre un mueble o en otro cuarto', ()=>{
  freshDecor();
  delete state.house;
  assert.deepEqual(getMito(), { room: 'bedroom', home: true });
  assert.deepEqual(setMito({ room: 'kitchen', u: .3, v: 2 }), { room: 'kitchen', u: .3, v: 1 }, 'u, v acotados');
  assert.deepEqual(setMito({ room: 'bath' }), { room: 'bath', home: true }, 'el lugar de siempre de otro cuarto');
  // sobre un mueble: solo si tiene superficie y está colocado en ese cuarto
  buyFurniture('m-bed'); buyFurniture('m-picture');
  placeFurniture('m-bed', { u: .2, v: .3 }); placeFurniture('m-picture', { u: .5, v: .3 });
  assert.deepEqual(setMito({ room: 'bedroom', on: 'm-bed', s: .4 }), { room: 'bedroom', on: 'm-bed', s: .4 });
  assert.deepEqual(setMito({ room: 'bedroom', on: 'm-picture', s: .4 }), { room: 'bedroom', home: true }, 'el cuadro no tiene superficie');
  setMito({ room: 'bedroom', on: 'm-bed', s: .4 });
  placeFurniture('m-bed', { room: 'living' });
  assert.deepEqual(getMito(), { room: 'bedroom', home: true }, 'la cama se fue a la Sala: Mito queda en su cuarto, en el piso');
  storeFurniture('m-bed');
  setMito({ room: 'living', on: 'm-bed', s: .5 });
  assert.deepEqual(getMito(), { room: 'living', home: true }, 'la cama está guardada');
  assert.deepEqual(setMito({ room: 'patio', u: .5, v: .5 }), { room: 'bedroom', u: .5, v: .5 }, 'un cuarto que no existe es el Cuarto');
  assert.deepEqual(setMito(null), { room: 'bedroom', home: true });
  assert.equal('mito' in (state.house || {}), false, 'el lugar de siempre del Cuarto no se escribe');
  assert.equal(cleanMito('nada'), null);
  freshDecor(0); delete state.house;
});

test('Mito: su posición sobrevive a las necesidades (cariños, comer, dormir, la migración de la Fase 2) y al respaldo', ()=>{
  const t0 = 5e12;
  delete state.house;
  setMito({ room: 'kitchen', u: .4, v: .6 }, t0);
  careMood(t0 + 1); addClean(5, t0 + 2); feed(10, t0 + 3); startSleep(t0 + 4); wakeUp(t0 + 5);
  assert.deepEqual(getMito(), { room: 'kitchen', u: .4, v: .6 });
  // datos de la Fase 2 (sin v) con posición: se migran sin perderla
  state.house = { at: t0, needs: { hunger: 80, clean: 80, energy: 80, mood: 80 }, sleepSince: null, mito: { room: 'bath', u: .1, v: .2 } };
  getNeeds(t0 + 10);
  assert.equal(state.house.v, 3);
  assert.deepEqual(getMito(), { room: 'bath', u: .1, v: .2 });
  // respaldo: viaja, se limpia y se borra al reiniciar
  const out = JSON.parse(exportSave());
  assert.deepEqual(out.house.mito, { room: 'bath', u: .1, v: .2 });
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/guardado-42c03de.json', import.meta.url), 'utf8'));
  const junk = parseSave(JSON.stringify({ ...fixture, house: { at: t0, needs: {}, mito: { room: 'sótano', on: 'm-x', u: 'x' } } }));
  assert.equal('mito' in junk.house, false, 'posición inválida: el lugar de siempre');
  importSave(JSON.stringify({ ...fixture, house: { at: t0, needs: {}, mito: { room: 'living', u: .9, v: .1 } } }));
  assert.deepEqual(getMito(), { room: 'living', u: .9, v: .1 });
  resetAll();
  assert.deepEqual(getMito(), { room: 'bedroom', home: true });
});

test('tamaño con la base nueva (Fase 5): solo se convierte lo ajustado, al mínimo si hace falta, y una vez', ()=>{
  const old = { owned: ['m-bed', 'm-sofa', 'm-lamp'], placed: {
    'm-bed': { u: .2, v: .3, scale: 1.2 }, 'm-sofa': { u: .5, v: .5, scale: .7 }, 'm-lamp': { u: .8, v: .3, scale: 1.4 },
  } };
  const now = cleanDecor(old).placed;
  assert.equal(now['m-bed'].scale, .83, '1.2 × 0.25 / 0.36');
  assert.equal(now['m-sofa'].scale, FURNITURE_SCALE.min, '0.7 × 0.185 / 0.25 = 0.52: al mínimo');
  assert.equal(now['m-lamp'].scale, 1.4, 'la lámpara no cambió de base');
  assert.deepEqual(cleanDecor({ ...old, v: 2 }).placed['m-bed'].scale, 1.2, 'con la marca: ya estaba convertida');
  const noScale = cleanDecor({ owned: ['m-bed'], placed: { 'm-bed': { u: .2, v: .3 } } });
  assert.equal('scale' in noScale.placed['m-bed'], false, 'al 100 %: toma la base nueva');
  // al guardar queda la marca; al parsear un respaldo también
  freshDecor(); state.decor = JSON.parse(JSON.stringify(old));
  assert.equal(getDecor().placed['m-bed'].scale, .83);
  assert.equal(getDecor().placed['m-bed'].scale, .83, 'leer dos veces: igual');
  placeFurniture('m-lamp', { u: .7 });
  assert.equal(state.decor.v, 2);
  assert.equal(getDecor().placed['m-bed'].scale, .83, 'guardada: ya no se convierte');
  assert.equal(parseDecor(old).v, 2);
  assert.equal(parseDecor(parseDecor(old)).placed['m-bed'].scale, .83, 'importar lo ya importado: igual');
  freshDecor(0);
});

