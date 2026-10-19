import test from 'node:test';
import assert from 'node:assert/strict';
import { MITO_QUIZ, PET_QUIZ, quizMessage } from '../src/content/quizMessages.js';
import { WARDROBE } from '../src/content/wardrobe.js';

const KINDS = ['correct', 'streak', 'wrong', 'lastLife', 'lastQuestion'];
const FINISH = ['finishGreat', 'finishOk', 'finishLow'];

test('Mito tiene varias frases por cada evento del quiz', ()=>{
  KINDS.forEach(k => assert.ok(MITO_QUIZ[k].length >= 4, `Mito: pocas frases en ${k}`));
});

test('cada mascota compañera con frases tiene las suyas para todos los eventos y todas son distintas', ()=>{
  const pets = WARDROBE.find(c => c.id === 'pet').items.filter(i => i.k).map(i => i.k);
  pets.forEach(k => {
    const q = PET_QUIZ[k];
    assert.ok(q, `falta la mascota ${k} en PET_QUIZ`);
    [...KINDS, ...FINISH].forEach(kind => {
      assert.ok(q[kind] && q[kind].length >= 2, `${k}: pocas frases en ${kind}`);
      assert.equal(new Set(q[kind]).size, q[kind].length, `${k}.${kind} repite una frase`);
    });
  });
});

test('las frases animan sin regañar ni dar pistas del contenido', ()=>{
  const all = [...Object.values(MITO_QUIZ).flat(), ...Object.values(PET_QUIZ).flatMap(p => Object.values(p).flat())];
  const bad = /\b(error|mal|equivocad|incorrect|la respuesta|era la|opci[oó]n [abcd]\b|\b[abcd]\)|atp|glucosa|enzima)/i;
  all.forEach(m => assert.ok(!bad.test(m), `frase sospechosa: ${m}`));
});

test('quizMessage no repite la anterior y reemplaza la racha', ()=>{
  const pool = ['uno {n}', 'dos {n}'];
  for(let i = 0; i < 20; i++) assert.notEqual(quizMessage(pool, 'uno 4', 4), 'uno 4');
  assert.equal(quizMessage(['solo {n}'], 'solo 3', 3), 'solo 3', 'con una sola frase se repite');
});

test('el mensaje de resultado y el título usan los mismos umbrales (90 / 70), y sin vidas cuenta como bajo', async ()=>{
  const { resultTier, GREAT_PCT, PASS_PCT } = await import('../src/content/messages.js');
  assert.equal(GREAT_PCT, 90);
  assert.equal(PASS_PCT, 70);
  assert.equal(resultTier(90), 'great');
  assert.equal(resultTier(89), 'ok');
  assert.equal(resultTier(70), 'ok');
  assert.equal(resultTier(69), 'low');
  assert.equal(resultTier(95, true), 'low', 'sin vidas, el título dice "Se acabaron las vidas"');
});
