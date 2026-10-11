import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { createEngine } from '../src/features/survivor/engine.js';
import { computeWorld, SURVIVOR_BALANCE } from '../src/features/survivor/balance.js';
import { createPetWeapon, PET_WEAPONS, petWeaponStats } from '../src/features/survivor/pets.js';
import { effectiveStats, SURVIVOR_POWERS } from '../src/features/survivor/powers.js';
import { activeCourse } from '../src/features/course/course.js';
import { nextSurvivorQuestion, resetQuestionDeck } from '../src/features/survivor/questions.js';
import { applyPenalty, buildUpgradeOptions, completeRevive, endSession, finalChispas, getSession, pauseSession, recordBossAnswer, recordReviveAnswer, recordSurvivorAnswer, resetSession, resumeSession, spendReroll, startReviveChallenge, startSession, updateSessionFromEngine, xpToNext } from '../src/features/survivor/session.js';
import { enterPlayMode, exitPlayMode, getInput, initView, renderHud, shouldPauseForLandscape, showIntro, showQuestion, startGameInput, stopGameInput } from '../src/features/survivor/view.js';
import { CHISPA_MITO_ID, nearestEnemy, weaponStats } from '../src/features/survivor/weapons.js';

const baseBalance = {
  world: { height:100, minWidth:100, maxWidth:100 },
  player: { maxLife:100, speed:40, radius:10, invulnerableTime:0.5 },
  enemy: { radius:8, speed:20, damage:25, maxCount:20 },
  waves: { firstDelay:0, interval:1, baseCount:2, growthEvery:30, growthAmount:1, spawnPadding:6 },
  render: { gridSize:20, enemySize:5, playerDomSize:20 },
};

function noRaf(){
  globalThis.requestAnimationFrame = ()=> 1;
  globalThis.cancelAnimationFrame = ()=>{};
}

function randomSequence(values){
  let i = 0;
  return () => values[i++ % values.length];
}

function survivorSnapshot(life = 0){
  return { time:12, level:2, xp:3, xpToNext:20, player:{ life } };
}

function setupSurvivorDom(active = true){
  const { window } = parseHTML(`<!doctype html><html><body>
    <section class="view ${active ? 'active' : ''}" id="view-survivor">
      <input id="renamePet">
      <div class="survivor-shell" id="survivorShell">
        <canvas id="survivorCanvas"></canvas>
        <div class="mascot" id="survivorMito"><svg class="mito"></svg></div>
        <div class="survivor-hud">
          <b id="survivorLife">100/100</b>
          <b id="survivorXp">0/30</b>
          <em id="survivorXpFill"></em>
          <b id="survivorTime">0:00</b>
          <b id="survivorEnemies">0</b>
        </div>
        <div class="survivor-overlay" id="survivorOverlay"><div class="survivor-card"><h3 id="survivorOverlayTitle"></h3><p id="survivorOverlayText"></p><button id="survivorStart" type="button"></button></div></div>
        <div id="survivorBuild"></div>
      </div>
    </section>
  </body></html>`);
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.devicePixelRatio = 1;
  window.HTMLCanvasElement.prototype.getContext = () => ({ setTransform(){}, clearRect(){} });
  initView({ onStart(){} });
  return window;
}

function keyboardEvent(window, code){
  const event = new window.Event('keydown', { bubbles:true, cancelable:true });
  Object.defineProperty(event, 'code', { value:code });
  Object.defineProperty(event, 'key', { value:code });
  return event;
}

function keyEvent(window, key){
  const event = new window.Event('keydown', { bubbles:true, cancelable:true });
  Object.defineProperty(event, 'key', { value:key });
  return event;
}

function pointerEvent(window, type, { target, pointerId = 1, pointerType = 'touch', clientX = 0, clientY = 0 } = {}){
  const event = new window.Event(type, { bubbles:true, cancelable:true });
  Object.defineProperty(event, 'pointerId', { value:pointerId });
  Object.defineProperty(event, 'pointerType', { value:pointerType });
  Object.defineProperty(event, 'clientX', { value:clientX });
  Object.defineProperty(event, 'clientY', { value:clientY });
  target.dispatchEvent(event);
  return event;
}

test('survivor session: inicia, pausa, reanuda y termina', ()=>{
  resetSession();
  assert.equal(getSession().status, 'intro');
  assert.equal(getSession().life, 100);
  assert.equal(getSession().petWeapon, null);

  startSession(createPetWeapon('p-chick'));
  assert.equal(getSession().status, 'running');
  assert.deepEqual(getSession().petWeapon, { id:'picotazo-pollito', petId:'p-chick', level:1 });

  pauseSession();
  assert.equal(getSession().status, 'paused');

  resumeSession();
  assert.equal(getSession().status, 'running');

  updateSessionFromEngine({ time:3.4, player:{ life:72 } });
  assert.equal(getSession().life, 72);
  assert.equal(getSession().time, 3.4);

  endSession('dead');
  assert.equal(getSession().status, 'gameover');
  assert.equal(getSession().life, 0);
});

test('survivor balance: computeWorld mantiene escala uniforme', ()=>{
  const cases = [
    [390, 844, 443.602, 960, 0.879],
    [360, 640, 540, 960, 0.667],
    [430, 932, 442.918, 960, 0.971],
    [1280, 720, 720, 960, 0.75],
    [768, 1024, 720, 960, 1.067],
  ];

  for(const [cssWidth, cssHeight, width, height, scale] of cases){
    const world = computeWorld(cssWidth, cssHeight);
    assert.equal(Number(world.width.toFixed(3)), width);
    assert.equal(world.height, height);
    assert.equal(Number(world.scale.toFixed(3)), scale);
  }
});

test('survivor view: detecta horizontal solo en pantalla táctil', ()=>{
  assert.equal(shouldPauseForLandscape({ width:844, height:390, pointerCoarse:true }), true);
  assert.equal(shouldPauseForLandscape({ width:390, height:844, pointerCoarse:true }), false);
  assert.equal(shouldPauseForLandscape({ width:1280, height:720, pointerCoarse:false }), false);
});

test('survivor view: modo partida agrega y quita clases y listeners', ()=>{
  const window = setupSurvivorDom(true);
  const counts = new Map();
  const mediaCounts = new Map();
  const added = [];
  const removed = [];
  const mediaQuery = {
    matches:false,
    addEventListener(type){ mediaCounts.set(type, (mediaCounts.get(type) || 0) + 1); },
    removeEventListener(type){ mediaCounts.set(type, (mediaCounts.get(type) || 0) - 1); },
  };
  window.matchMedia = () => mediaQuery;
  const originalAdd = window.addEventListener.bind(window);
  const originalRemove = window.removeEventListener.bind(window);
  window.addEventListener = (type, fn, options)=>{
    added.push(type);
    counts.set(type, (counts.get(type) || 0) + 1);
    originalAdd(type, fn, options);
  };
  window.removeEventListener = (type, fn, options)=>{
    removed.push(type);
    counts.set(type, (counts.get(type) || 0) - 1);
    originalRemove(type, fn, options);
  };

  enterPlayMode();
  assert.equal(document.body.classList.contains('survivor-playing'), true);
  assert.equal(document.querySelector('#survivorShell').classList.contains('is-fullscreen'), true);
  assert.equal(added.includes('keydown'), true);
  assert.equal(added.includes('popstate'), true);

  exitPlayMode();
  assert.equal(document.body.classList.contains('survivor-playing'), false);
  assert.equal(document.querySelector('#survivorShell').classList.contains('is-fullscreen'), false);
  assert.equal(counts.get('keydown'), 0);
  assert.equal(counts.get('popstate'), 0);
  assert.equal(mediaCounts.get('change'), 0);
  assert.equal(removed.includes('keydown'), true);
  assert.equal(removed.includes('popstate'), true);
});

test('survivor view: Escape pide pausa durante partida', ()=>{
  const window = setupSurvivorDom(true);
  let paused = 0;
  initView({ onStart(){}, onPause(){ paused++; } });

  enterPlayMode();
  const event = keyEvent(window, 'Escape');
  window.dispatchEvent(event);

  assert.equal(paused, 1);
  assert.equal(event.defaultPrevented, true);
  exitPlayMode();
});

test('survivor questions: no repite hasta agotar y reinicia el ciclo', ()=>{
  resetQuestionDeck();
  const total = activeCourse().questions.length;
  const seen = new Set();

  for(let i=0; i<total; i++){
    const item = nextSurvivorQuestion();
    assert.ok(item);
    assert.equal(seen.has(item.q), false, `pregunta repetida antes de agotar: ${item.q}`);
    seen.add(item.q);
  }

  assert.equal(seen.size, total);
  const restarted = nextSurvivorQuestion();
  assert.ok(restarted);
  assert.equal(activeCourse().questions.some(item => item.q === restarted.q), true);
});

test('survivor session: xpToNext crece por nivel según balance', ()=>{
  const balance = { xp:{ baseToNext:12, growth:7 } };

  assert.equal(xpToNext(1, balance), 12);
  assert.equal(xpToNext(2, balance), 19);
  assert.equal(xpToNext(5, balance), 40);
});

test('survivor session: calcula chispas finales con economía protegida', ()=>{
  const balance = {
    match:{ duration:300 },
    rewards:{ base:8, baseEverySeconds:30, baseMax:40, correctAnswer:2, noRevive:15, bossDefeated:30, minSecondsForAny:20, maxWithoutBoss:80, maxWithBoss:110 },
  };

  assert.equal(finalChispas({ time:0, correctAnswers:0, wrongAnswers:0, revived:false, bossDefeated:false }, balance), 0);
  assert.equal(finalChispas({ time:60, correctAnswers:2, wrongAnswers:1, revived:false, bossDefeated:false }, balance), 20);
  assert.equal(finalChispas({ time:320, correctAnswers:99, wrongAnswers:0, revived:false, bossDefeated:true }, balance), 110);
  assert.equal(finalChispas({ time:300, correctAnswers:99, wrongAnswers:0, revived:false, bossDefeated:false, bossActive:true }, balance), 110);
});

test('survivor view: el teclado solo mueve durante partida activa y fuera de inputs', ()=>{
  const window = setupSurvivorDom(true);
  startGameInput();

  const input = document.querySelector('#renamePet');
  const inputEvent = keyboardEvent(window, 'KeyA');
  input.dispatchEvent(inputEvent);
  assert.equal(inputEvent.defaultPrevented, false);

  document.querySelector('#view-survivor').classList.remove('active');
  const inactiveEvent = keyboardEvent(window, 'KeyA');
  window.dispatchEvent(inactiveEvent);
  assert.equal(inactiveEvent.defaultPrevented, false);
  assert.deepEqual(getInput(), { x:0, y:0 });

  document.querySelector('#view-survivor').classList.add('active');
  const activeEvent = keyboardEvent(window, 'KeyA');
  window.dispatchEvent(activeEvent);
  assert.equal(activeEvent.defaultPrevented, true);
  assert.deepEqual(getInput(), { x:-1, y:0 });

  stopGameInput();
});

test('survivor view: el HUD solo escribe cuando cambian valores', ()=>{
  setupSurvivorDom(true);
  const snapshot = { player:{ life:100 }, xp:0, xpToNext:30, time:0, enemies:[], boss:{ active:false } };
  renderHud(snapshot);
  const life = document.querySelector('#survivorLife');
  const before = life.textContent;

  renderHud({ ...snapshot, player:{ life:100 } });
  assert.equal(life.textContent, before);

  renderHud({ ...snapshot, player:{ life:80 } });
  assert.equal(life.textContent, '80/100');
});

test('survivor view: la introducción usa el XP real del balance', ()=>{
  setupSurvivorDom(true);
  showIntro();

  assert.equal(document.querySelector('#survivorXp').textContent, 'Nv. 1 · 0/30');
});

test('survivor view: el joystick no se activa desde overlays', ()=>{
  const window = setupSurvivorDom(true);
  const shell = document.querySelector('#survivorShell');
  const canvas = document.querySelector('#survivorCanvas');
  shell.getBoundingClientRect = () => ({ left:0, top:0, width:390, height:844 });
  canvas.getBoundingClientRect = () => ({ left:0, top:0, width:390, height:844 });
  startGameInput();

  const blocked = pointerEvent(window, 'pointerdown', { target:document.querySelector('#survivorStart'), clientX:200, clientY:700 });
  assert.equal(blocked.defaultPrevented, false);
  assert.deepEqual(getInput(), { x:0, y:0 });

  document.querySelector('#survivorOverlay').hidden = true;
  const active = pointerEvent(window, 'pointerdown', { target:shell, clientX:200, clientY:700 });
  assert.equal(active.defaultPrevented, true);
  pointerEvent(window, 'pointermove', { target:shell, clientX:240, clientY:700 });
  assert.deepEqual(getInput(), { x:1, y:0 });
  pointerEvent(window, 'pointerup', { target:shell, clientX:240, clientY:700 });

  stopGameInput();
});

test('survivor view: un fallo de revivida puede mostrar explicación antes del resumen', ()=>{
  const window = setupSurvivorDom(true);
  let continued = false;

  showQuestion({ q:'Pregunta', opts:['A','B','C','D'], correct:1, exp:'Explicación visible.' }, {
    onAnswer:()=>({ correct:false, exp:'Explicación visible.', penalties:[], continueText:'Ver resumen' }),
    onContinue:()=>{ continued = true; },
  });

  document.querySelector('.survivor-option').click();
  assert.equal(continued, false);
  assert.match(document.querySelector('.survivor-result').textContent, /Explicación visible/);
  assert.equal(document.querySelector('.survivor-actions .btn-primary').textContent, 'Ver resumen');

  document.querySelector('.survivor-actions .btn-primary').click();
  assert.equal(continued, true);
  stopGameInput();
  window.close?.();
});

test('survivor view: el HUD y la build no usan aria-live', ()=>{
  setupSurvivorDom(true);
  showIntro();

  assert.equal(document.querySelector('.survivor-hud')?.hasAttribute('aria-live'), false);
  assert.equal(document.querySelector('#survivorBuild')?.hasAttribute('aria-live'), false);
});

test('survivor revive: tres aciertos reviven sin tocar build ni rachas de build', ()=>{
  resetSession();
  startSession(createPetWeapon('p-chick'));
  recordSurvivorAnswer(true);
  recordSurvivorAnswer(true);
  recordSurvivorAnswer(true);
  const before = getSession();

  startReviveChallenge(survivorSnapshot(0));
  assert.equal(getSession().status, 'revive');
  recordReviveAnswer(true);
  recordReviveAnswer(true);
  const ready = recordReviveAnswer(true);
  assert.equal(ready.reviveProgress, 3);

  const revived = completeRevive(survivorSnapshot(50));
  assert.equal(revived.status, 'paused');
  assert.equal(revived.life, 50);
  assert.equal(revived.reviveUsed, true);
  assert.equal(revived.rerolls, before.rerolls);
  assert.equal(revived.correctStreak, before.correctStreak);
  assert.equal(revived.wrongStreak, before.wrongStreak);
  assert.deepEqual(revived.petWeapon, before.petWeapon);
  assert.equal(revived.chispaLevel, before.chispaLevel);
});

test('survivor revive: un fallo termina sin penalizar la build', ()=>{
  resetSession();
  startSession(createPetWeapon('p-chick'));
  const before = getSession();

  startReviveChallenge(survivorSnapshot(0));
  const failed = recordReviveAnswer(false);
  assert.equal(failed.reviveProgress, 0);
  assert.equal(failed.wrongStreak, before.wrongStreak);
  assert.equal(failed.rerolls, before.rerolls);
  assert.deepEqual(failed.petWeapon, before.petWeapon);

  const ended = endSession('dead');
  assert.equal(ended.status, 'gameover');
  assert.equal(ended.life, 0);
});

test('survivor revive: no se puede repetir en la misma partida', ()=>{
  resetSession();
  startSession();
  startReviveChallenge(survivorSnapshot(0));
  recordReviveAnswer(true);
  recordReviveAnswer(true);
  recordReviveAnswer(true);
  completeRevive(survivorSnapshot(50));

  const before = getSession();
  const retry = startReviveChallenge(survivorSnapshot(0));
  assert.equal(retry.reviveUsed, true);
  assert.equal(retry.status, before.status);
  assert.equal(retry.reviveProgress, 3);
});

test('survivor upgrades: ofrece opciones sin repetir y sin maxeados', ()=>{
  const powers = Object.fromEntries(SURVIVOR_POWERS.map(power => [power.id, 8]));
  powers['iman-gemas'] = 7;
  powers['critico'] = 0;
  const options = buildUpgradeOptions({
    chispaLevel: 8,
    petWeapon: { id:'picotazo-pollito', petId:'p-chick', level:8 },
    powers,
  }, randomSequence([0, 0.9, 0.4]));

  assert.equal(options.length, 2);
  assert.equal(new Set(options.map(option => option.id)).size, options.length);
  assert.equal(options.some(option => option.currentLevel >= 8), false);
  assert.deepEqual(new Set(options.map(option => option.id)), new Set(['iman-gemas', 'critico']));
});

test('survivor upgrades: incluye armas y como maximo tres candidatos', ()=>{
  const options = buildUpgradeOptions({
    chispaLevel: 1,
    petWeapon: { id:'picotazo-pollito', petId:'p-chick', level:1 },
    powers: {},
  }, randomSequence([0, 0, 0]));

  assert.equal(options.length, 3);
  assert.equal(new Set(options.map(option => option.id)).size, 3);
  assert.equal(options[0].id, CHISPA_MITO_ID);
  assert.equal(options[1].id, 'picotazo-pollito');
  assert.equal(options.every(option => typeof option.description === 'string' && option.description.length > 0), true);
});

test('survivor session: cada tres aciertos da reroll y no pasa de tres', ()=>{
  resetSession();
  startSession();

  recordSurvivorAnswer(true);
  recordSurvivorAnswer(true);
  assert.equal(getSession().rerolls, 0);
  recordSurvivorAnswer(true);
  assert.equal(getSession().rerolls, 1);

  for(let i=0; i<9; i++) recordSurvivorAnswer(true);
  assert.equal(getSession().rerolls, 3);

  spendReroll(randomSequence([0]));
  assert.equal(getSession().rerolls, 2);
  resetSession();
  startSession();
  assert.equal(getSession().rerolls, 0);
});

test('survivor session: racha maxima cuenta respuestas sin dar rerolls extra', ()=>{
  resetSession();
  startSession(createPetWeapon('p-chick'));

  recordSurvivorAnswer(true);
  recordBossAnswer(true);
  recordBossAnswer(false);
  startReviveChallenge(survivorSnapshot(0));
  recordReviveAnswer(true);
  recordReviveAnswer(true);

  const current = getSession();
  assert.equal(current.maxCorrectStreak, 2);
  assert.equal(current.correctStreak, 1);
  assert.equal(current.rerolls, 0);
});

test('survivor penalty: degrada el elemento elegible de menor nivel', ()=>{
  const result = applyPenalty({
    chispaLevel: 8,
    petWeapon: { id:'picotazo-pollito', petId:'p-chick', level:4 },
    powers: { 'iman-gemas':3, 'atp-turbo':2 },
    upgradeOptions: [],
    wrongStreak: 1,
  });

  assert.deepEqual(result.changes, [{ type:'power', id:'atp-turbo', name:'ATP Turbo', from:2, to:1 }]);
  assert.equal(result.session.powers['atp-turbo'], 1);
  assert.equal(result.session.powers['iman-gemas'], 3);
  assert.equal(result.session.petWeapon.level, 4);
  assert.equal(result.session.chispaLevel, 8);
});

test('survivor penalty: pierde un poder si estaba en nivel 1', ()=>{
  const result = applyPenalty({
    chispaLevel: 2,
    petWeapon: { id:'picotazo-pollito', petId:'p-chick', level:3 },
    powers: { 'iman-gemas':1, 'atp-turbo':2 },
    upgradeOptions: [],
    wrongStreak: 1,
  });

  assert.deepEqual(result.changes, [{ type:'power', id:'iman-gemas', name:'Imán de gemas', from:1, to:0 }]);
  assert.equal('iman-gemas' in result.session.powers, false);
  assert.equal(result.session.powers['atp-turbo'], 2);
});

test('survivor penalty: el tercer fallo aplica castigo adicional y reinicia contador', ()=>{
  const result = applyPenalty({
    chispaLevel: 1,
    petWeapon: { id:'picotazo-pollito', petId:'p-chick', level:2 },
    powers: { 'iman-gemas':2, 'atp-turbo':3 },
    upgradeOptions: [],
    wrongStreak: 3,
  });

  assert.deepEqual(result.changes, [
    { type:'pet', id:'picotazo-pollito', name:'Picotazo veloz', from:2, to:1 },
    { type:'pet', id:'picotazo-pollito', name:'Picotazo veloz', from:1, to:0 },
  ]);
  assert.equal(result.session.petWeapon.level, 0);
  assert.equal(result.session.powers['iman-gemas'], 2);
  assert.equal(result.session.wrongStreak, 0);
});

test('survivor penalty: protege la Chispa de Mito y conserva la mascota visual', ()=>{
  const result = applyPenalty({
    chispaLevel: 1,
    petWeapon: { id:'picotazo-pollito', petId:'p-chick', level:1 },
    powers: {},
    upgradeOptions: [],
    wrongStreak: 1,
  });

  assert.deepEqual(result.changes, [{ type:'pet', id:'picotazo-pollito', name:'Picotazo veloz', from:1, to:0 }]);
  assert.equal(result.session.chispaLevel, 1);
  assert.deepEqual(result.session.petWeapon, { id:'picotazo-pollito', petId:'p-chick', level:0 });
});

test('survivor penalty: la Chispa de Mito baja hasta nivel 1', ()=>{
  const result = applyPenalty({
    chispaLevel: 4,
    petWeapon: null,
    powers: {},
    upgradeOptions: [],
    wrongStreak: 1,
  });

  assert.deepEqual(result.changes, [{ type:'weapon', id:CHISPA_MITO_ID, name:'Chispa de Mito', from:4, to:3 }]);
  assert.equal(result.session.chispaLevel, 3);
});

test('survivor penalty: la Chispa de Mito en nivel 1 no baja', ()=>{
  const result = applyPenalty({
    chispaLevel: 1,
    petWeapon: null,
    powers: {},
    upgradeOptions: [],
    wrongStreak: 1,
  });

  assert.deepEqual(result.changes, []);
  assert.equal(result.session.chispaLevel, 1);
});

test('survivor penalty: sin equipo no penaliza la build', ()=>{
  const current = {
    chispaLevel: 1,
    petWeapon: null,
    powers: {},
    upgradeOptions: [],
    wrongStreak: 1,
  };
  const result = applyPenalty(current);

  assert.deepEqual(result.changes, []);
  assert.equal(result.session.chispaLevel, 1);
  assert.equal(result.session.petWeapon, null);
  assert.deepEqual(result.session.powers, {});
});

test('survivor powers: effectiveStats aplica cada poder', ()=>{
  const stats = effectiveStats({ powers:{
    'iman-gemas': 1,
    'atp-turbo': 1,
    'mitocampo': 1,
    'chispa-doble': 1,
    'catalizador': 1,
    'membrana-protectora': 1,
    'reparacion-celular': 1,
    'congelacion': 1,
    'critico': 1,
    'area-ampliada': 1,
  } });

  assert.equal(stats.pickupRadius, 72);
  assert.equal(stats.playerSpeed, 244);
  assert.equal(stats.mitocampoDamage, 4);
  assert.equal(stats.mitocampoRadius, 78);
  assert.equal(stats.globalProjectiles, 1);
  assert.equal(stats.cooldownMultiplier, 0.96);
  assert.equal(stats.maxLife, 112);
  assert.equal(stats.regen, 0.25);
  assert.equal(stats.enemySlow, 0.04);
  assert.equal(stats.criticalChance, 0.05);
  assert.equal(stats.criticalMultiplier, 1.5);
  assert.equal(stats.areaMultiplier, 1.08);
});

test('survivor textos visibles: poderes y mascota usan acentos', ()=>{
  assert.equal(SURVIVOR_POWERS.find(power => power.id === 'iman-gemas').name, 'Imán de gemas');
  assert.equal(SURVIVOR_POWERS.find(power => power.id === 'reparacion-celular').name, 'Reparación celular');
  assert.equal(SURVIVOR_POWERS.find(power => power.id === 'congelacion').name, 'Congelación');
  assert.equal(SURVIVOR_POWERS.find(power => power.id === 'critico').name, 'Crítico');
  assert.equal(SURVIVOR_POWERS.find(power => power.id === 'area-ampliada').name, 'Área ampliada');
  assert.equal(PET_WEAPONS['p-turtle'].name, 'Onda de caparazón');
});

test('survivor engine: spawnea oleadas en los bordes', ()=>{
  noRaf();
  const engine = createEngine({
    balance: baseBalance,
    random: randomSequence([0, 0.3, 0.3, 0.6]),
  });

  engine.start();
  const snapshot = engine.update(0);

  assert.equal(snapshot.enemies.length, 2);
  assert.equal(snapshot.enemies[0].y, baseBalance.enemy.radius);
  assert.equal(snapshot.enemies[1].y, baseBalance.world.height - baseBalance.enemy.radius);
  for(const enemy of snapshot.enemies){
    assert.ok(enemy.x >= baseBalance.enemy.radius && enemy.x <= snapshot.world.width - baseBalance.enemy.radius);
    assert.ok(enemy.y >= baseBalance.enemy.radius && enemy.y <= snapshot.world.height - baseBalance.enemy.radius);
  }
  engine.stop();
});

test('survivor engine: funciona sin DOM con mundos distintos y redimensionado', ()=>{
  noRaf();
  const engine = createEngine({
    balance: baseBalance,
    world: { width:100, height:100, scale:1 },
    random: randomSequence([0, 0.2, 0.4, 0.25, 0.8, 0.6]),
  });

  engine.start();
  engine.update(0);
  const resized = engine.setWorld({ width:100, height:100, scale:2 });

  assert.equal(resized.world.width, 100);
  assert.equal(resized.world.height, 100);
  assert.equal(resized.world.scale, 2);
  assert.ok(resized.player.x >= baseBalance.player.radius && resized.player.x <= resized.world.width - baseBalance.player.radius);
  assert.ok(resized.enemies.every(enemy => enemy.x >= baseBalance.enemy.radius && enemy.x <= resized.world.width - baseBalance.enemy.radius));
  engine.stop();
});

test('survivor engine: ningún enemigo aparece fuera del mundo', ()=>{
  noRaf();
  const world = computeWorld(390, 844);
  const engine = createEngine({
    world,
    random: randomSequence([0, 0, 0, 0.25, 1, 1, 0.5, 0.4, 0.6, 0.75, 0.2, 0.8]),
  });

  engine.start();
  let snapshot = engine.snapshot();
  for(let i=0; i<Math.ceil(SURVIVOR_BALANCE.waves.graceTime / 0.05) + 1; i++){
    snapshot = engine.update(0.05);
  }

  assert.ok(snapshot.enemies.length > 0);
  for(const enemy of snapshot.enemies){
    assert.ok(enemy.x >= SURVIVOR_BALANCE.enemy.radius && enemy.x <= snapshot.world.width - SURVIVOR_BALANCE.enemy.radius);
    assert.ok(enemy.y >= SURVIVOR_BALANCE.enemy.radius && enemy.y <= snapshot.world.height - SURVIVOR_BALANCE.enemy.radius);
  }
  engine.stop();
});

test('survivor engine: balance inicial permite huir al menos 45 segundos', ()=>{
  noRaf();
  let engine;
  let deadAt = null;
  const world = computeWorld(390, 844);
  engine = createEngine({
    world,
    random: randomSequence([0, 0.1, 0.2, 0.25, 0.8, 0.3, 0.5, 0.7, 0.4, 0.75, 0.9, 0.6]),
    getInput:()=>{
      const snapshot = engine.snapshot();
      let nearest = null;
      let best = Infinity;
      for(const enemy of snapshot.enemies){
        const dx = enemy.x - snapshot.player.x;
        const dy = enemy.y - snapshot.player.y;
        const d = dx * dx + dy * dy;
        if(d < best){
          best = d;
          nearest = enemy;
        }
      }
      if(!nearest) return { x:0, y:0 };
      return { x:snapshot.player.x - nearest.x, y:snapshot.player.y - nearest.y };
    },
    onPlayerDead:snapshot=>{ deadAt = snapshot.time; },
    onLevelUp:()=>{ engine.resume(); },
  });

  engine.start();
  let snapshot = engine.snapshot();
  for(let i=0; i<1200 && snapshot.running && !snapshot.paused; i++){
    snapshot = engine.update(0.05);
  }

  assert.ok(deadAt === null || deadAt >= 45, `Mito murió demasiado pronto en ${deadAt}s`);
  assert.ok(snapshot.time >= 45);
  engine.stop();
});

test('survivor engine: los enemigos persiguen a Mito', ()=>{
  noRaf();
  const engine = createEngine({
    balance: baseBalance,
    random: randomSequence([0.75, 0.5]),
  });

  engine.start();
  const snapshot = engine.update(0.5);
  const enemy = snapshot.enemies[0];

  assert.ok(enemy.x > -baseBalance.waves.spawnPadding, 'el enemigo de la izquierda debe avanzar hacia el centro');
  assert.ok(enemy.y < 71, 'el enemigo debe avanzar hacia el centro vertical');
  engine.stop();
});

test('survivor engine: limita dt grandes al volver de pausa o pestaña oculta', ()=>{
  noRaf();
  const engine = createEngine({
    balance: baseBalance,
    getInput:()=>({ x:1, y:0 }),
    random: randomSequence([0.75, 0.5]),
  });

  engine.start();
  const snapshot = engine.update(10);

  assert.equal(snapshot.time, 0.05);
  assert.equal(snapshot.player.x, 52);
  engine.stop();
});

test('survivor engine: la colisión aplica daño con invulnerabilidad corta', ()=>{
  noRaf();
  const balance = {
    ...baseBalance,
    enemy: { ...baseBalance.enemy, radius:45, speed:0, damage:30 },
    waves: { ...baseBalance.waves, spawnPadding:0 },
  };
  const engine = createEngine({
    balance,
    random: randomSequence([0.75, 0.5]),
  });

  engine.start();
  const hit = engine.update(0);
  assert.equal(hit.player.life, 70);

  const protectedHit = engine.update(0.1);
  assert.equal(protectedHit.player.life, 70, 'no debe dañar otra vez durante invulnerabilidad');

  let nextHit = protectedHit;
  for(let i=0; i<10; i++) nextHit = engine.update(0.05);
  assert.equal(nextHit.player.life, 40);
  engine.stop();
});

test('survivor engine: al agotar vida emite muerte una sola vez', ()=>{
  noRaf();
  let deaths = 0;
  const balance = {
    ...baseBalance,
    player: { ...baseBalance.player, invulnerableTime:0.1 },
    enemy: { ...baseBalance.enemy, radius:45, speed:0, damage:60 },
    waves: { ...baseBalance.waves, spawnPadding:0 },
  };
  const engine = createEngine({
    balance,
    random: randomSequence([0.75, 0.5]),
    onPlayerDead: ()=>{ deaths++; },
  });

  engine.start();
  engine.update(0);
  engine.update(0.05);
  const dead = engine.update(0.05);
  engine.update(1);

  assert.equal(dead.player.life, 0);
  assert.equal(deaths, 1);
  engine.stop();
});

test('survivor engine: revive con invulnerabilidad antes de reanudar', ()=>{
  noRaf();
  let deaths = 0;
  const balance = {
    ...baseBalance,
    player: { ...baseBalance.player, invulnerableTime:0.1 },
    enemy: { ...baseBalance.enemy, radius:45, speed:0, damage:120 },
    waves: { ...baseBalance.waves, spawnPadding:0 },
  };
  const engine = createEngine({
    balance,
    random: randomSequence([0.75, 0.5]),
    onPlayerDead: ()=>{ deaths++; },
  });

  engine.start();
  const dead = engine.update(0);
  assert.equal(dead.player.life, 0);
  assert.equal(deaths, 1);

  const revived = engine.revive(50);
  assert.equal(revived.player.life, 50);
  assert.equal(revived.running, true);
  assert.equal(revived.paused, true);
  assert.ok(revived.player.invulnerable > 0);

  engine.resume();
  const safe = engine.update(0);
  assert.equal(safe.player.life, 50);
  assert.equal(deaths, 1);
  engine.stop();
});

test('survivor weapons: Chispa de Mito progresa del nivel 1 al 8', ()=>{
  const expected = [
    { damage:10, cooldown:0.72, projectiles:1, speed:420, pierce:0, explosionRadius:0 },
    { damage:16, cooldown:0.72, projectiles:1, speed:420, pierce:0, explosionRadius:0 },
    { damage:16, cooldown:0.48, projectiles:1, speed:420, pierce:0, explosionRadius:0 },
    { damage:16, cooldown:0.48, projectiles:2, speed:420, pierce:0, explosionRadius:0 },
    { damage:16, cooldown:0.48, projectiles:2, speed:560, pierce:0, explosionRadius:0 },
    { damage:16, cooldown:0.48, projectiles:2, speed:560, pierce:1, explosionRadius:0 },
    { damage:16, cooldown:0.48, projectiles:2, speed:560, pierce:1, explosionRadius:46 },
    { damage:16, cooldown:0.34, projectiles:5, speed:560, pierce:1, explosionRadius:46 },
  ];

  for(let level=1; level<=8; level++){
    assert.deepEqual(weaponStats(CHISPA_MITO_ID, level), expected[level - 1]);
  }
});

test('survivor pet weapons: Pollito progresa del nivel 1 al 8', ()=>{
  const expected = [
    { damage:5, cooldown:0.42, projectiles:1, speed:360, range:120, pierce:0, spread:0 },
    { damage:7, cooldown:0.42, projectiles:1, speed:380, range:128, pierce:0, spread:0 },
    { damage:7, cooldown:0.34, projectiles:1, speed:400, range:132, pierce:0, spread:0 },
    { damage:7, cooldown:0.34, projectiles:2, speed:400, range:136, pierce:0, spread:0.22 },
    { damage:9, cooldown:0.34, projectiles:2, speed:420, range:144, pierce:0, spread:0.22 },
    { damage:9, cooldown:0.28, projectiles:2, speed:430, range:148, pierce:0, spread:0.24 },
    { damage:9, cooldown:0.28, projectiles:3, speed:440, range:152, pierce:0, spread:0.2 },
    { damage:11, cooldown:0.22, projectiles:4, speed:460, range:160, pierce:1, spread:0.18 },
  ];

  for(let level=1; level<=8; level++){
    assert.deepEqual(petWeaponStats('p-chick', level), expected[level - 1]);
  }
});

test('survivor pet weapons: Tortuguita progresa del nivel 1 al 8', ()=>{
  const expected = [
    { damage:7, cooldown:1.65, radius:78, knockback:95, pulses:1, weakBlock:false, shieldTime:0 },
    { damage:7, cooldown:1.65, radius:78, knockback:150, pulses:1, weakBlock:false, shieldTime:0 },
    { damage:12, cooldown:1.65, radius:78, knockback:150, pulses:1, weakBlock:false, shieldTime:0 },
    { damage:12, cooldown:1.65, radius:112, knockback:150, pulses:1, weakBlock:false, shieldTime:0 },
    { damage:12, cooldown:1.1, radius:112, knockback:150, pulses:1, weakBlock:false, shieldTime:0 },
    { damage:12, cooldown:1.1, radius:112, knockback:150, pulses:1, weakBlock:true, shieldTime:0 },
    { damage:12, cooldown:1.1, radius:124, knockback:150, pulses:2, weakBlock:true, shieldTime:0 },
    { damage:12, cooldown:1.1, radius:124, knockback:150, pulses:2, weakBlock:true, shieldTime:1.2 },
  ];

  for(let level=1; level<=8; level++){
    assert.deepEqual(petWeaponStats('p-turtle', level), expected[level - 1]);
  }
});

test('survivor pet weapons: Zorrito progresa del nivel 1 al 8', ()=>{
  const expected = [
    { damage:8, cooldown:1.1, projectiles:1, speed:250, turn:3.2, pierce:0, explosionRadius:0, burst:1 },
    { damage:13, cooldown:1.1, projectiles:1, speed:250, turn:3.2, pierce:0, explosionRadius:0, burst:1 },
    { damage:13, cooldown:0.82, projectiles:1, speed:250, turn:3.2, pierce:0, explosionRadius:0, burst:1 },
    { damage:13, cooldown:0.82, projectiles:2, speed:250, turn:3.2, pierce:0, explosionRadius:0, burst:1 },
    { damage:13, cooldown:0.82, projectiles:2, speed:340, turn:3.2, pierce:0, explosionRadius:0, burst:1 },
    { damage:13, cooldown:0.82, projectiles:2, speed:340, turn:5.4, pierce:0, explosionRadius:0, burst:1 },
    { damage:13, cooldown:0.82, projectiles:2, speed:340, turn:5.4, pierce:0, explosionRadius:38, burst:1 },
    { damage:13, cooldown:0.82, projectiles:2, speed:340, turn:5.4, pierce:0, explosionRadius:38, burst:3 },
  ];

  for(let level=1; level<=8; level++){
    assert.deepEqual(petWeaponStats('p-fox', level), expected[level - 1]);
  }
});

test('survivor pet weapons: sin mascota o mascota sin arma no hay secundaria', ()=>{
  noRaf();
  assert.equal(createPetWeapon('p-none'), null);
  assert.equal(createPetWeapon('p-ufo'), null);

  resetSession();
  startSession();
  assert.equal(getSession().petWeapon, null);

  const engine = createEngine({ balance:baseBalance, petWeapon:createPetWeapon('p-none') });
  engine.start();
  assert.equal(engine.snapshot().petWeapon, null);
  engine.stop();
});

test('survivor engine: Mito dispara igual con y sin mascota', ()=>{
  noRaf();
  const noPet = createEngine({
    balance: baseBalance,
    random: randomSequence([0.75, 0.5]),
  });
  const withPet = createEngine({
    balance: baseBalance,
    random: randomSequence([0.75, 0.5]),
    petWeapon: createPetWeapon('p-chick'),
  });

  noPet.start();
  withPet.start();
  const noPetShot = noPet.update(0).projectiles.find(projectile => projectile.weaponId === CHISPA_MITO_ID);
  const withPetShot = withPet.update(0).projectiles.find(projectile => projectile.weaponId === CHISPA_MITO_ID);

  assert.deepEqual(withPetShot, noPetShot);
  noPet.stop();
  withPet.stop();
});

test('survivor engine: carga máxima mantiene el frame bajo 10 ms', ()=>{
  noRaf();
  const balance = {
    ...SURVIVOR_BALANCE,
    world: { height:960, minWidth:520, maxWidth:520 },
    enemy: { ...SURVIVOR_BALANCE.enemy, maxCount:60, speed:0, life:9999 },
    waves: { ...SURVIVOR_BALANCE.waves, graceTime:0, firstDelay:0, interval:0.05, baseCount:60, growthEvery:999, growthAmount:0 },
    weapons: { ...SURVIVOR_BALANCE.weapons, projectilePoolSize:180 },
    boss: { ...SURVIVOR_BALANCE.boss, shields:0, waveInterval:999 },
    match: { duration:999 },
  };
  const engine = createEngine({
    balance,
    petWeapon:createPetWeapon('p-fox'),
    random:randomSequence([0, 0.1, 0.2, 0.25, 0.8, 0.3, 0.5, 0.7, 0.4, 0.75, 0.9, 0.6]),
  });

  engine.start();
  engine.setWeaponLevel(CHISPA_MITO_ID, 8);
  engine.setWeaponLevel('chispa-zorrito', 8);
  let snapshot = engine.update(0);
  for(let i=0; i<260; i++) snapshot = engine.update(0.05);
  assert.equal(snapshot.enemies.length, 60);

  const frames = 180;
  const started = performance.now();
  for(let i=0; i<frames; i++) engine.update(0.016);
  const average = (performance.now() - started) / frames;

  assert.ok(average < 10, `frame promedio ${average.toFixed(3)} ms`);
  engine.stop();
});

test('survivor engine: la mascota equipada cambia el ataque secundario', ()=>{
  noRaf();
  const chick = createEngine({
    balance: baseBalance,
    random: randomSequence([0.75, 0.5]),
    petWeapon: createPetWeapon('p-chick'),
  });
  const fox = createEngine({
    balance: baseBalance,
    random: randomSequence([0.75, 0.5]),
    petWeapon: createPetWeapon('p-fox'),
  });

  chick.start();
  fox.start();
  const chickShot = chick.update(0).projectiles.find(projectile => projectile.weaponId === 'picotazo-pollito');
  const foxShot = fox.update(0).projectiles.find(projectile => projectile.weaponId === 'chispa-zorrito');

  assert.equal(chick.snapshot().petWeapon.id, 'picotazo-pollito');
  assert.equal(fox.snapshot().petWeapon.id, 'chispa-zorrito');
  assert.ok(chickShot);
  assert.ok(foxShot);
  assert.notEqual(chickShot.damage, foxShot.damage);
  chick.stop();
  fox.stop();
});

test('survivor weapons: selecciona el enemigo más cercano', ()=>{
  const origin = { x:50, y:50 };
  const enemies = [
    { id:1, x:10, y:50, life:10 },
    { id:2, x:62, y:50, life:10 },
    { id:3, x:54, y:50, life:0 },
  ];

  assert.equal(nearestEnemy(origin, enemies).id, 2);
});

test('survivor engine: la perforación permite golpear un enemigo extra', ()=>{
  noRaf();
  const balance = {
    ...baseBalance,
    enemy: { ...baseBalance.enemy, life:16, speed:0, maxCount:2 },
    waves: { ...baseBalance.waves, interval:99, baseCount:2, spawnPadding:6 },
  };
  const engine = createEngine({
    balance,
    random: randomSequence([0.75, 0.5, 0.5]),
  });

  engine.start();
  engine.setWeaponLevel(CHISPA_MITO_ID, 6);
  let snapshot = engine.update(0);
  for(let i=0; i<3; i++) snapshot = engine.update(0.05);

  assert.equal(snapshot.enemies.length, 0);
  engine.stop();
});

test('survivor engine: la Chispa de Mito nunca baja de nivel 1', ()=>{
  noRaf();
  const engine = createEngine({ balance:baseBalance });

  engine.start();
  assert.equal(engine.setWeaponLevel(CHISPA_MITO_ID, -3), 1);
  assert.equal(engine.levelUpWeapon(CHISPA_MITO_ID), 2);
  assert.equal(engine.setWeaponLevel(CHISPA_MITO_ID, 0), 1);
  engine.stop();
});

test('survivor boss: aparece al terminar el temporizador y detiene oleadas normales', ()=>{
  noRaf();
  let shieldQuestions = 0;
  const balance = {
    ...baseBalance,
    match: { duration:0 },
    boss: { life:60, radius:18, speed:0, damage:20, shields:3, shieldedDamage:1, freezeTime:4, shieldQuestionInterval:1, waveInterval:99, baseWaveCount:0, pressureWaveBonus:2 },
    waves: { ...baseBalance.waves, baseCount:3, interval:1 },
  };
  const engine = createEngine({ balance, onBossShieldReady:()=>{ shieldQuestions++; } });

  engine.start();
  const snapshot = engine.update(0);

  assert.equal(snapshot.boss.active, true);
  assert.equal(snapshot.boss.shields, 3);
  assert.equal(snapshot.enemies.length, 0);
  assert.equal(snapshot.paused, true);
  assert.equal(shieldQuestions, 1);
  engine.stop();
});

test('survivor boss: romper escudo congela y deja vulnerable tras el tercero', ()=>{
  noRaf();
  const balance = {
    ...baseBalance,
    match: { duration:0 },
    boss: { life:60, radius:18, speed:0, damage:20, shields:3, shieldedDamage:1, freezeTime:4, shieldQuestionInterval:1, waveInterval:99, baseWaveCount:0, pressureWaveBonus:2 },
  };
  const engine = createEngine({ balance });

  engine.start();
  engine.update(0);
  const first = engine.breakBossShield();
  const second = engine.breakBossShield();
  const third = engine.breakBossShield();

  assert.equal(first.boss.shields, 2);
  assert.equal(first.boss.frozen, 4);
  assert.equal(second.boss.shields, 1);
  assert.equal(third.boss.shields, 0);
  assert.equal(third.boss.vulnerable, true);
  engine.stop();
});

test('survivor boss: con escudos recibe solo daño minimo', ()=>{
  noRaf();
  const balance = {
    ...baseBalance,
    match: { duration:0 },
    enemy: { ...baseBalance.enemy, maxCount:0 },
    boss: { life:60, radius:24, speed:0, damage:20, shields:1, shieldedDamage:1, freezeTime:4, shieldQuestionInterval:99, waveInterval:99, baseWaveCount:0, pressureWaveBonus:2 },
  };
  const engine = createEngine({ balance });

  engine.start();
  engine.update(0);
  engine.resume();
  let snapshot = engine.update(0);
  for(let i=0; i<8; i++) snapshot = engine.update(0.05);

  assert.equal(snapshot.boss.life, 59);
  engine.stop();
});

test('survivor boss: sin escudos recibe daño normal', ()=>{
  noRaf();
  const balance = {
    ...baseBalance,
    match: { duration:0 },
    enemy: { ...baseBalance.enemy, maxCount:0 },
    boss: { life:60, radius:24, speed:0, damage:20, shields:0, shieldedDamage:1, freezeTime:4, shieldQuestionInterval:99, waveInterval:99, baseWaveCount:0, pressureWaveBonus:2 },
  };
  const engine = createEngine({ balance });

  engine.start();
  let snapshot = engine.update(0);
  for(let i=0; i<8; i++) snapshot = engine.update(0.05);

  assert.equal(snapshot.boss.life, 50);
  engine.stop();
});

test('survivor boss: fallo de pregunta aumenta presion con mas enemigos', ()=>{
  noRaf();
  const balance = {
    ...baseBalance,
    match: { duration:0 },
    enemy: { ...baseBalance.enemy, maxCount:20 },
    boss: { life:60, radius:18, speed:0, damage:20, shields:3, shieldedDamage:1, freezeTime:4, shieldQuestionInterval:1, waveInterval:99, baseWaveCount:1, pressureWaveBonus:3 },
  };
  const engine = createEngine({ balance, random:randomSequence([0, 0.5]) });

  engine.start();
  engine.update(0);
  const pressured = engine.pressureBoss();

  assert.equal(pressured.boss.pressure, 1);
  assert.equal(pressured.enemies.length, 4);
  engine.stop();
});

test('survivor boss: derrotarlo emite victoria una sola vez', ()=>{
  noRaf();
  let wins = 0;
  const balance = {
    ...baseBalance,
    match: { duration:0 },
    enemy: { ...baseBalance.enemy, maxCount:0 },
    boss: { life:10, radius:24, speed:0, damage:20, shields:0, shieldedDamage:1, freezeTime:4, shieldQuestionInterval:99, waveInterval:99, baseWaveCount:0, pressureWaveBonus:2 },
  };
  const engine = createEngine({ balance, onGameWon:()=>{ wins++; } });

  engine.start();
  let snapshot = engine.update(0);
  for(let i=0; i<8; i++) snapshot = engine.update(0.05);
  engine.update(1);

  assert.equal(snapshot.boss.life, 0);
  assert.equal(wins, 1);
  engine.stop();
});

test('survivor session: preguntas de boss cuentan sin tocar build y victoria da recompensa', ()=>{
  resetSession();
  startSession(createPetWeapon('p-chick'));
  const before = getSession();

  recordBossAnswer(true);
  recordBossAnswer(false);
  const answered = getSession();
  assert.equal(answered.correctAnswers, 1);
  assert.equal(answered.wrongAnswers, 1);
  assert.equal(answered.rerolls, before.rerolls);
  assert.deepEqual(answered.petWeapon, before.petWeapon);
  assert.equal(answered.chispaLevel, before.chispaLevel);

  const ended = endSession('won');
  assert.equal(ended.bossDefeated, true);
  assert.equal(ended.awardedChispas, 47);
});
