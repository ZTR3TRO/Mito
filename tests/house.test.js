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
