// Compatibilidad con partidas de la Fase 4 (muebles sin cuarto, Mito sin posición guardada).
//
// tests/fixtures/guardado-fase4.json es lo que escribió en localStorage el commit 083f589 (Fase 4.5, antes de los
// varios cuartos): generado con su propio store, con la alfombra de regalo, muebles comprados y colocados (uno
// volteado, dos con tamaño ajustado) y uno guardado en la bandeja. Si un cambio futuro hace que esta partida se
// pierda o se lea mal, esta prueba truena: no la "arregles" editando el fixture.
//
// Va en su propio archivo porque la partida se lee al importar el store: hay que sembrar localStorage antes.

import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const KEY = 'chispa-atp-v4';
const raw = readFileSync(new URL('./fixtures/guardado-fase4.json', import.meta.url), 'utf8');
const saved = JSON.parse(raw);

let store;

before(async ()=>{
  const data = new Map([[KEY, raw]]);
  globalThis.localStorage = {
    getItem: k => data.has(k) ? data.get(k) : null,
    setItem: (k, v)=> data.set(k, String(v)),
    removeItem: k => data.delete(k),
  };
  store = await import('../src/state/store.js');
});

// La cama (base 0.25 → 0.36) y el sillón (0.185 → 0.25) crecieron en la Fase 5: lo que la usuaria había ajustado se
// convierte una vez para que se vea del mismo tamaño; lo que estaba al 100 % toma la base nueva.
const BED_BEFORE = .25, BED_NOW = .36;

test('fase 4 → 5: los muebles colocados quedan en el Cuarto, en su lugar y volteados como estaban', ()=>{
  const d = store.getDecor();
  assert.deepEqual(new Set(d.owned), new Set(saved.decor.owned), 'los mismos muebles');
  for(const [id, p] of Object.entries(saved.decor.placed)){
    const now = d.placed[id];
    assert.equal(now.u, p.u, `${id}: u`); assert.equal(now.v, p.v, `${id}: v`);
    assert.equal(now.zona, p.zona); assert.equal(!!now.flip, !!p.flip, `${id}: volteo`);
    assert.equal('room' in now, false, `${id}: sin inventar el campo room`);
  }
  assert.deepEqual(store.placedIn('bedroom').sort(), Object.keys(saved.decor.placed).sort(), 'todo en el Cuarto');
  for(const room of ['bath', 'living', 'kitchen']) assert.deepEqual(store.placedIn(room), [], `nada en ${room}`);
  assert.ok(!d.placed['m-desk'] && d.owned.includes('m-desk'), 'lo guardado sigue en la bandeja');
});

test('fase 4 → 5: la cama al 120 % se convierte a ≈83 % (se ve igual que antes); lo demás conserva su tamaño', ()=>{
  const d = store.getDecor();
  assert.equal(saved.decor.placed['m-bed'].scale, 1.2);
  assert.equal(d.placed['m-bed'].scale, .83);
  assert.ok(Math.abs(d.placed['m-bed'].scale * BED_NOW - 1.2 * BED_BEFORE) < .005, 'el mismo ancho que antes');
  assert.equal('scale' in d.placed['m-sofa'], false, 'el sillón estaba al 100 %: toma la base nueva');
  assert.equal(d.placed['m-picture'].scale, .8, 'el cuadro no cambió de base: su tamaño se queda');
});

test('fase 4 → 5: la conversión se aplica una sola vez (leer, guardar, exportar e importar varias veces)', ()=>{
  assert.equal(store.getDecor().placed['m-bed'].scale, .83, 'leer otra vez: igual');
  store.importSave(store.exportSave());   // aún sin guardar: el respaldo trae los datos de antes y se convierten al importar
  assert.equal(store.getDecor().placed['m-bed'].scale, .83);
  const once = JSON.parse(store.exportSave());
  assert.equal(once.decor.v, 2, 'ya convertida: queda marcada');
  assert.equal(once.decor.placed['m-bed'].scale, .83);
  for(let i = 0; i < 3; i++) store.importSave(store.exportSave());
  store.placeFurniture('m-lamp', { u: .7 });
  assert.equal(store.getDecor().placed['m-bed'].scale, .83, 'importar una partida convertida no la vuelve a convertir');
  assert.deepEqual(JSON.parse(store.exportSave()).decor.placed['m-bed'], once.decor.placed['m-bed']);
});

test('fase 4 → 5: Mito está en su lugar de siempre, en el Cuarto', ()=>{
  assert.deepEqual(store.getMito(), { room: 'bedroom', home: true });
});

test('fase 4 → 5: el resto de la partida se lee igual, y guardar a Mito no toca los muebles', ()=>{
  assert.equal(store.getChispas(), saved.chispas);
  assert.equal(store.getTheme(), 'dark');
  assert.deepEqual(JSON.parse(store.exportSave()).house.needs, saved.house.needs, 'las necesidades guardadas, igual');
  const placed = store.getDecor().placed;
  store.setMito({ room: 'bedroom', on: 'm-bed', s: .4 });
  assert.deepEqual(store.getMito(), { room: 'bedroom', on: 'm-bed', s: .4 });
  assert.deepEqual(store.getDecor().placed, placed);
});
