// Compatibilidad con partidas guardadas por la versión publicada.
//
// tests/fixtures/guardado-42c03de.json es lo que escribió en localStorage el commit 42c03de (la versión
// desplegada antes del flujo de estudio): generado con su propio store, más una clave de fallo sin prefijo
// de materia y una ronda con el formato más viejo ({r,t} y sin courseId). Si un cambio futuro hace que esta
// partida se pierda o se lea mal, esta prueba truena: no la "arregles" editando el fixture.
//
// Va en su propio archivo porque la partida se lee al importar el store: hay que sembrar localStorage antes.

import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dayStr } from '../src/core/utils.js';

const KEY = 'chispa-atp-v4';
const raw = readFileSync(new URL('./fixtures/guardado-42c03de.json', import.meta.url), 'utf8')
  .replace('__TODAY__', dayStr());
const saved = JSON.parse(raw);

let store, review, course, courses;

before(async ()=>{
  const data = new Map([[KEY, raw]]);
  globalThis.localStorage = {
    getItem: k => data.has(k) ? data.get(k) : null,
    setItem: (k, v)=> data.set(k, String(v)),
    removeItem: k => data.delete(k),
  };
  store = await import('../src/state/store.js');
  review = await import('../src/features/quiz/review.js');
  course = await import('../src/features/course/course.js');
  courses = (await import('../src/content/courses.js')).COURSES;
});

test('la clave de localStorage sigue siendo chispa-atp-v4', ()=>{
  store.addChispas(0);
  assert.ok(localStorage.getItem(KEY), 'la partida se sigue guardando bajo la misma clave');
});

test('una partida de la versión publicada se lee completa', ()=>{
  assert.equal(store.getChispas(), saved.chispas);
  assert.deepEqual(store.getEquipped(), saved.equipped);
  Object.keys(saved.owned).forEach(id=> assert.equal(store.owns(id), true, `se conserva la compra ${id}`));
  assert.equal(store.getPetName('p-chick'), 'Chispita');
  assert.equal(store.getPetLook('p-chick'), saved.petLooks['p-chick']);
  assert.equal(store.getCourse(), saved.course);
  assert.equal(store.getTheme(), 'dark');
  assert.equal(store.getStreak(), 4, 'la racha de días sigue viva');
  assert.deepEqual(store.getHistory().map(h=>h.pct), [50, 70, 33]);
});

test('los fallos viejos (con y sin prefijo de materia) siguen listados, y salen con 2 aciertos seguidos', ()=>{
  const keys = Object.keys(store.getMistakes());
  assert.equal(keys.length, 3);
  const legacyKey = keys.find(k=>!k.includes('::'));
  const [atp, calc] = courses;
  assert.ok(legacyKey, 'la clave sin prefijo no se pierde');
  assert.ok(atp.questions.some(q=>q.q === legacyKey), 'y sigue apuntando a una pregunta de la primera materia');

  store.recordAnswer(atp.id, legacyKey, true);
  assert.ok(store.getMistakes()[`${atp.id}::${legacyKey}`] === undefined && store.getMistakes()[legacyKey], 'con 1 acierto sigue pendiente');
  store.recordAnswer(calc.id, calc.questions[0].q, true);
  store.recordAnswer(calc.id, calc.questions[0].q, true);
  assert.equal(store.getMistakes()[`${calc.id}::${calc.questions[0].q}`], undefined, 'las entradas viejas ya se dominan con 2 seguidos');
});

test('el progreso por tema se calcula con rondas viejas, también las de formato {r,t} sin materia', ()=>{
  // la materia activa del guardado es Cálculo Dietético: solo cuenta su ronda (2/6)
  const calc = review.topicStats(1);
  assert.deepEqual(calc.map(t=>[t.cat, t.r, t.t]), [['Gasto Energético Total (GET)', 2, 6]]);
  assert.deepEqual(review.weakTopics().map(t=>t.cat), ['Gasto Energético Total (GET)']);

  // la ronda sin materia pertenece a la primera (ATP), como antes
  store.setCourse(courses[0].id);
  course.reloadCourse();
  const atp = Object.fromEntries(review.topicStats(1).map(t=>[t.cat, [t.r, t.t]]));
  assert.deepEqual(atp['El ATP'], [2, 4]);
  assert.deepEqual(atp['Bioenergética'], [5, 5]);
  assert.deepEqual(atp['Anabolismo / Catabolismo'], [1, 5]);
});

test('exportar y volver a importar una partida vieja no pierde nada', ()=>{
  const out = store.exportSave();
  store.importSave(out);
  const again = JSON.parse(store.exportSave());
  ['chispas', 'owned', 'petNames', 'petLooks', 'equipped', 'streak', 'course', 'theme'].forEach(k=>{
    assert.deepEqual(again[k], JSON.parse(out)[k], k);
  });
  assert.equal(again.history.length, saved.history.length);
});
