// Lógica de la Casa que no depende del navegador: composición del cuarto y luz (features/house/layout.js).

import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneLayout, lightPlan, BLOCKS, FLOOR, floorRowY, floorX, GLASS } from '../src/features/house/layout.js';

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
