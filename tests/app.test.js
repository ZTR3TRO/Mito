// Prueba de integración de la app: monta index.html en un DOM de linkedom,
// arranca main.js una vez y ejercita los flujos reales sobre esa instancia.
//
// Complementa a las pruebas de unidad: aquí se verifica el cableado entre módulos
// (que el router cambia de vista, que una compra repinta la tienda, que el
// easter egg entrega los premios), que es justo lo que un refactor puede romper
// sin que ninguna prueba existente se dé cuenta.

import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { emit } from '../src/core/bus.js';
import { isSeasonalOpen, WARDROBE } from '../src/content/wardrobe.js';

function memoryStorage(){
  const data = new Map();
  return {
    getItem: k => data.has(k) ? data.get(k) : null,
    setItem: (k, v)=> data.set(k, String(v)),
    removeItem: k => data.delete(k),
    clear: ()=> data.clear(),
    key: i => [...data.keys()][i] ?? null,
    get length(){ return data.size; },
  };
}

// linkedom cubre el DOM que usa la app. Falta lo que provee el navegador:
// timers, observers y el service worker. Los timers se desactivan porque la app
// agenda globitos y comprobaciones de temporada que nadie espera en un test, y si
// quedan vivas mantienen el proceso colgado.
async function installBrowserGlobals(){
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const { window, document } = parseHTML(html);

  globalThis.window = window;
  globalThis.document = document;
  globalThis.localStorage = memoryStorage();
  globalThis.location = { protocol:'http:', href:'http://localhost/' };
  globalThis.MutationObserver = class { observe(){} disconnect(){} };
  globalThis.Node = window.Node;
  globalThis.Element = window.Element;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.CSSStyleDeclaration = window.CSSStyleDeclaration;
  globalThis.getComputedStyle = window.getComputedStyle ?? (()=>({}));

  // navigator es un accessor de solo lectura en Node 22+: hay que redefinirlo.
  Object.defineProperty(globalThis, 'navigator', {
    configurable:true, writable:true, value:{ userAgent:'test' },
  });

  globalThis.setInterval = ()=> 0;
  globalThis.setTimeout = ()=> 0;
  globalThis.clearTimeout = ()=>{};
  globalThis.clearInterval = ()=>{};
  window.setInterval ??= ()=> 0;
  window.setTimeout ??= ()=> 0;
  window.scrollTo = ()=>{};
  window.confirm = ()=> true;
  window.alert = ()=>{};
  window.addEventListener ??= ()=>{};
  document.addEventListener ??= ()=>{};
}

// store, bus y main se importan una sola vez y se comparten entre pruebas:
// así los listeners registrados al arrancar siguen apuntando al documento vivo.
let store, quiz, quizSession, theme, courses;

before(async ()=>{
  await installBrowserGlobals();
  store = await import('../src/state/store.js');
  await import('../src/main.js');
  quiz = await import('../src/features/quiz/index.js');
  quizSession = await import('../src/features/quiz/session.js');
  theme = await import('../src/features/theme/index.js');
  courses = (await import('../src/content/courses.js')).COURSES;
});

// Vuelve al estado inicial y repinta, como si el usuario acabara de recargar.
function resetApp(){
  store.resetAll();
  emit('state:imported');
  document.querySelector('.navbtn[data-view="home"]').click();
}

test('arranque: las 7 vistas existen y el router cambia entre ellas', ()=>{
  ['home','apuntes','claves','quiz','progreso','shop','wardrobe'].forEach(v=>{
    assert.ok(document.getElementById('view-' + v), 'falta la vista ' + v);
  });
  assert.ok(document.getElementById('view-home').classList.contains('active'));

  document.querySelector('.navbtn[data-view="quiz"]').click();
  assert.ok(document.getElementById('view-quiz').classList.contains('active'));
  assert.ok(!document.getElementById('view-home').classList.contains('active'));

  // El botón activo de la sidebar sigue a la vista.
  assert.ok(document.querySelector('.navbtn[data-view="quiz"]').classList.contains('active'));
});

test('arranque: apuntes, claves y contadores del quiz quedan pintados', ()=>{
  assert.equal(document.querySelectorAll('#courseTabs .course-pill').length, courses.length);
  assert.ok(document.querySelectorAll('#topicTabs .topic-pill').length > 0, 'sin pestañas de temas');
  assert.ok(document.querySelectorAll('#notesHost .note-block').length > 0, 'sin bloques de apuntes');
  assert.ok(document.querySelectorAll('#keyGrid .key-card').length > 0, 'sin tarjetas de clave');

  // Los contadores deben coincidir con el tamaño real del banco de la materia activa.
  const bank = String(courses[0].questions.length);
  assert.equal(document.getElementById('modeAllN').textContent, bank);
  assert.equal(document.getElementById('statBankSize').textContent, bank);
});

test('cambiar de materia repinta las vistas dependientes', ()=>{
  const titleBefore = document.getElementById('quizTitle').textContent;
  const topicCount = courses[1].notes.length;

  document.querySelectorAll('#courseTabs .course-pill')[1].click();

  assert.notEqual(document.getElementById('quizTitle').textContent, titleBefore,
    'el título del quiz debería seguir a la materia');
  assert.ok(document.querySelectorAll('#courseTabs .course-pill')[1].classList.contains('active'));
  assert.equal(document.querySelectorAll('#topicTabs .topic-pill').length, topicCount,
    'las pestañas de temas deberían ser las de la nueva materia');
  assert.equal(document.getElementById('heroCourse').textContent, courses[1].label);

  // Los bloques exclusivos de ATP se ocultan fuera del ATP.
  assert.equal(document.querySelector('.atp-only').style.display, 'none');

  // ...y se muestran de nuevo al volver.
  document.querySelectorAll('#courseTabs .course-pill')[0].click();
  assert.equal(document.querySelector('.atp-only').style.display, '');
});

test('comprar descuenta chispas, actualiza el saldo y avisa en la tienda', ()=>{
  resetApp();
  store.addChispas(5000);
  emit('state:changed');

  assert.equal(document.getElementById('sparkBalance').textContent, '5000');

  const btn = document.querySelector('#shopHost [data-buy]');
  assert.ok(btn, 'la tienda debería ofrecer productos comprables');

  const id = btn.dataset.buy;
  const name = btn.closest('.shop-item').querySelector('.si-name').textContent;
  const cost = Number(btn.textContent.split('⚡')[1].trim());

  btn.click();

  assert.equal(document.getElementById('sparkBalance').textContent, String(5000 - cost));
  assert.ok(document.getElementById('shopNotice').textContent.includes(name),
    'el aviso debería confirmar la compra de ' + name);
  // Ya no se ofrece en la tienda. En el armario aparece, y como la compra
  // equipa al instante, viene marcado como equipado (sin botón "Equipar").
  assert.equal(document.querySelector(`#shopHost [data-buy="${id}"]`), null);
  const owned = document.querySelector(`#wardrobeHost .shop-item[data-item="${id}"]`);
  assert.ok(owned, 'el artículo comprado debería estar en el armario');
  assert.ok(owned.classList.contains('equipped'));
  assert.equal(store.owns(id), true);
});

test('en la tienda, el botón sin saldo dice cuántas chispas faltan y se actualiza con el saldo', ()=>{
  resetApp();
  emit('state:changed');
  const btn = document.querySelector('#shopHost [data-buy]');
  const id = btn.dataset.buy;
  const cost = store.getChispas() + 40;   // 40 más de lo que hay
  assert.match(document.querySelector('#shopHost [data-buy][aria-disabled="true"]').textContent, /^Te faltan \d+ ⚡$/);
  store.addChispas(5000);
  emit('state:changed');
  const after = document.querySelector(`#shopHost [data-buy="${id}"]`);
  assert.match(after.textContent, /^Comprar · ⚡ \d+$/, 'con saldo vuelve el precio');
  assert.equal(after.getAttribute('aria-disabled'), null);
  assert.ok(cost > 0);
});

test('comprar y luego equipar deja la pieza activa en el avatar', ()=>{
  resetApp();
  store.addChispas(5000);

  // Se compra un color de pago y queda equipado en el acto.
  const buy = document.querySelector('#shopHost [data-buy]');
  const id = buy.dataset.buy;
  buy.click();
  assert.equal(store.getEquipped().color, id, 'comprar también equipa');

  // Volver a equipar el básico desde el armario cambia el color activo.
  const basic = document.querySelector('#wardrobeHost [data-equip="c-mint"]');
  assert.ok(basic, 'el color básico debería estar en el armario');
  basic.click();

  assert.equal(store.getEquipped().color, 'c-mint');
  assert.ok(document.getElementById('wardrobeNotice').textContent.includes('Menta'));
  assert.equal(document.getElementById('pvColor').textContent, 'Menta');
  // El básica queda marcado como equipado y ya no se puede volver a pulsar.
  assert.ok(document.querySelector('#wardrobeHost [data-equip="c-mint"]') === null,
    'una pieza equipada no debe ofrecer el botón Equipar');
});

test('el armario permite renombrar la mascota compañera', ()=>{
  resetApp();
  store.addChispas(5000);
  emit('state:changed');

  const buy = document.querySelector('#shopHost [data-buy="p-chick"]');
  assert.ok(buy, 'el pollito debería poder comprarse');
  buy.click();

  const rename = document.querySelector('#wardrobeHost [data-rename-pet="p-chick"]');
  assert.ok(rename, 'la mascota comprada debería ofrecer renombrar');
  rename.click();

  const modal = document.querySelector('.pet-modal-backdrop');
  assert.ok(modal, 'debería abrirse el modal de nombre');
  const input = modal.querySelector('input[name="petName"]');
  assert.ok(input, 'el modal debería incluir el campo de nombre');
  input.value = 'Chispa';
  modal.querySelector('[data-save-pet-name="p-chick"]').click();

  assert.equal(store.getPetDisplayName('p-chick'), 'Chispa');
  assert.equal(document.querySelector('.pet-modal-backdrop'), null, 'el modal debería cerrarse al guardar');
  assert.equal(document.getElementById('pvPet').textContent, 'Chispa');
  assert.equal(document.querySelector('#wardrobeHost [data-item="p-chick"] .si-name').textContent, 'Chispa');
  assert.ok(document.getElementById('wardrobeNotice').textContent.includes('Chispa'));
});

test('el armario permite cambiar el color de la mascota sin recolorear la cara', ()=>{
  resetApp();
  store.addChispas(5000);
  emit('state:changed');

  document.querySelector('#shopHost [data-buy="c-sky"]').click();
  document.querySelector('#shopHost [data-buy="p-chick"]').click();

  const customize = document.querySelector('#wardrobeHost [data-rename-pet="p-chick"]');
  assert.ok(customize, 'la mascota comprada debería poder personalizarse');
  customize.click();

  const modal = document.querySelector('.pet-modal-backdrop');
  assert.ok(modal, 'debería abrirse el modal de personalización');
  const sky = modal.querySelector('[data-set-pet-look="p-chick"][data-pet-look="c-sky"]');
  assert.ok(sky, 'debería ofrecer los colores comprados');
  sky.click();

  assert.equal(store.getPetLook('p-chick'), 'c-sky');
  const pet = document.querySelector('#mascotWardrobe svg.pet');
  assert.ok(!pet.innerHTML.includes('var(--pet-'), 'el recolor va horneado en el SVG, sin variables CSS sueltas');
  assert.ok(!pet.innerHTML.includes('#ffd44d') && !pet.innerHTML.includes('#d99512'), 'el amarillo original (cuerpo y contorno) ya no debería quedar');
  assert.ok(pet.innerHTML.includes('fill="#2b2140"'), 'ojos y boca deberían conservar su color base');
  assert.ok(pet.innerHTML.includes('fill="#fff"'), 'brillos de la cara deberían conservarse');

  modal.querySelector('[data-set-pet-look="p-chick"][data-pet-look=""]').click();
  assert.equal(store.getPetLook('p-chick'), '');
});

test('el modo repaso se habilita solo cuando hay fallos pendientes', ()=>{
  resetApp();
  const card = document.getElementById('modeRev');
  assert.equal(card.getAttribute('aria-disabled'), 'true', 'sin fallos debe estar deshabilitado');

  const course = courses[0];
  store.recordAnswer(course.id, course.questions[0].q, false);
  quiz.renderReviewCard();

  assert.equal(card.getAttribute('aria-disabled'), null);
  assert.equal(document.getElementById('modeRevL').textContent, 'repaso inteligente');
  assert.equal(document.getElementById('modeRevN').textContent, '1');
});

test('una ronda terminada guarda historial, paga chispas y refresca la racha', ()=>{
  resetApp();
  const course = courses[0];
  store.recordQuizResult({
    score: 30, right: 3, total: 4, pct: 75,
    cats:{ [course.questions[0].cat]: { right:3, total:4 } },
    courseId: course.id,
  });

  document.querySelector('.navbtn[data-view="progreso"]').click();

  assert.ok(document.getElementById('historyList').textContent.includes('75%'));
  assert.ok(document.getElementById('progressStats').textContent.includes('75%'));
  assert.ok(document.getElementById('sideProgressLabel').textContent.includes('ronda jugada'));
  // El título del quiz se renderiza aunque no se haya entrado a la vista.
  assert.equal(document.getElementById('quizTitle').textContent, 'Quiz de ' + course.label);
});

test('el easter egg necesita 10 toques y entrega los premios secretos', ()=>{
  resetApp();
  const hero = document.getElementById('mascotHero');
  // El handler solo cuenta toques sobre el <svg> de Mito. Los nodos SVG de
  // linkedom no traen .click(), así que se despacha el evento a mano.
  const svg = hero.querySelector('svg');
  svg.classList.add('mito');
  const tap = ()=> svg.dispatchEvent(new window.Event('click', { bubbles:true }));

  for(let i=0;i<9;i++) tap();
  assert.equal(store.secretsUnlocked('tap10'), false, 'con 9 toques aún no debe desbloquear');

  tap();
  assert.equal(store.secretsUnlocked('tap10'), true, 'el décimo toque entrega los premios');
  assert.equal(store.secretsUnlocked('perfect'), false, 'el Ajolote no viene de los toques de portada');

  // Los premios ya no se venden y se ven en el armario.
  assert.equal(document.querySelector('#shopHost [data-buy="p-bee"]'), null);
  assert.ok(document.querySelector('#wardrobeHost [data-equip="p-bee"]'));
});

test('el easter egg de chispas da 1000 desde cualquier saldo visible y solo una vez', ()=>{
  resetApp();
  const sideChip = document.querySelector('.sidebar .balance-chip');
  const shopChip = document.querySelector('.shop-head-actions .balance-chip');
  assert.ok(sideChip, 'debería existir el chip de chispas de la sidebar');
  assert.ok(shopChip, 'debería existir el chip de chispas de la tienda');

  for(let i=0; i<20; i++) sideChip.click();
  for(let i=0; i<29; i++) shopChip.click();
  assert.equal(store.getChispas(), 0);
  assert.equal(document.getElementById('sideSparks').textContent, '0');

  shopChip.click();
  assert.equal(store.getChispas(), 1000);
  assert.equal(document.getElementById('sideSparks').textContent, '1000');
  assert.equal(document.getElementById('sparkBalance').textContent, '1000');

  for(let i=0; i<50; i++) shopChip.click();
  assert.equal(store.getChispas(), 1000, 'no debe repetirse en la misma partida');
});

test('la tienda de Halloween pinta sus productos dentro de su propia sección', ()=>{
  resetApp();
  if(!isSeasonalOpen()){
    assert.equal(document.querySelector('.seasonal-shop'), null,
      'fuera de temporada no debe existir la sección');
    return;
  }
  // La sección se inserta antes de rellenar su host: si se rellenara antes, el
  // catálogo de temporada saldría vacío.
  const host = document.querySelector('#shopHost #seasonalShopHost');
  assert.ok(host, 'debería existir la tienda de temporada');
  const ids = [...host.querySelectorAll('[data-buy]')].map(b=>b.dataset.buy);
  const expected = WARDROBE.flatMap(cat=>cat.items.filter(i=>i.seasonal).map(i=>i.id));
  assert.deepEqual([...ids].sort(), [...expected].sort(),
    'deberían pintarse todas las piezas de temporada');
});

test('se puede jugar una ronda entera: cada pregunta acepta su respuesta', ()=>{
  resetApp();
  const course = courses[0];

  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();
  assert.notEqual(document.getElementById('quizPlay').style.display, 'none');

  const total = Number(document.getElementById('qTotalLabel').textContent);
  assert.equal(total, course.questions.length, 'arrancó en modo examen completo');
  assert.equal(document.querySelectorAll('#livesRow svg').length, 3,
    'la ronda debe empezar con las 3 vidas dibujadas');

  // Se responde una a una hasta el final. Si el quiz bloquea la segunda
  // pregunta, el contador de la etiqueta se queda en 1 y esto truena.
  const score = ()=> Number(document.getElementById('scoreLabel').textContent);
  for(let q=0; q<total; q++){
    assert.equal(Number(document.getElementById('qIndexLabel').textContent), q + 1,
      `esperaba la pregunta ${q + 1}`);

    const opts = [...document.querySelectorAll('#qOpts .opt')];
    assert.equal(opts.length, 4, 'la pregunta debe pintar sus opciones');

    // Se acierta siempre: las opciones vienen barajadas, así que la correcta es
    // la que la sesión tiene marcada.
    const correct = quizSession.currentQuestion().correct;
    opts[correct].click();

    assert.ok(document.getElementById('qFeedback').classList.contains('show'),
      `la pregunta ${q + 1} no aceptó la respuesta`);
    assert.ok(document.getElementById('qFeedback').classList.contains('ok'),
      `la pregunta ${q + 1} no registró el acierto`);
    assert.equal(quizSession.getSession().lives, 3, 'acertar no debe gastar vidas');

    document.getElementById('nextBtn').click();
  }

  assert.ok(score() > 0, 'una ronda perfecta debe dar puntos');
  assert.equal(document.getElementById('quizResult').style.display, 'block',
    'la ronda debió terminar mostrando el resultado');
});

test('tres fallos agotan las vidas y cortan la ronda', ()=>{
  resetApp();
  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();

  for(let i=0; i<3; i++){
    const opts = [...document.querySelectorAll('#qOpts .opt')];
    const wrong = (quizSession.currentQuestion().correct + 1) % opts.length;
    opts[wrong].click();
    assert.equal(quizSession.getSession().lives, 2 - i, `quedaban ${2 - i} vidas`);
    document.getElementById('nextBtn').click();
  }

  assert.equal(document.getElementById('quizResult').style.display, 'block');
  assert.equal(document.getElementById('resultTitle').textContent, 'Se acabaron las vidas');
});

const filledLives = ()=> [...document.querySelectorAll('#livesRow svg')].filter(v=>v.getAttribute('fill') !== 'none').length;
const leaveModal = ()=> document.querySelector('.pet-modal-backdrop #leaveTitle');

test('los íconos de vida pintados coinciden con las vidas de la sesión en cada fallo', ()=>{
  resetApp();
  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();
  assert.equal(filledLives(), 3);
  for(let i=0; i<2; i++){
    const opts = [...document.querySelectorAll('#qOpts .opt')];
    opts[(quizSession.currentQuestion().correct + 1) % opts.length].click();
    assert.equal(quizSession.getSession().lives, 2 - i);
    assert.equal(filledLives(), 2 - i, 'los íconos llenos deben ser las vidas que quedan');
    document.getElementById('nextBtn').click();
  }
  assert.equal(filledLives(), 1, 'con 2 fallos queda 1 vida y se ve');
});

test('abandonar una ronda no la guarda: salir pide confirmación y solo "Salir" descarta la ronda', ()=>{
  resetApp();
  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();
  const opts = [...document.querySelectorAll('#qOpts .opt')];
  opts[quizSession.currentQuestion().correct].click();
  const other = [...document.querySelectorAll('.course-pill')].find(p=>!p.classList.contains('active'));
  const before = document.querySelector('.course-pill.active').dataset.id;

  // Cambiar de materia a mitad de ronda pregunta y, si se queda, no pasa nada.
  other.click();
  assert.ok(leaveModal(), 'debió aparecer la confirmación propia de la app');
  assert.equal(leaveModal().textContent, '¿Salir de la ronda?');
  assert.ok(document.getElementById('leaveText').textContent.includes('no se guardará'));
  document.querySelector('[data-leave="stay"]').click();
  assert.equal(leaveModal(), null);
  assert.equal(document.querySelector('.course-pill.active').dataset.id, before, 'seguir jugando conserva la materia');
  assert.equal(quizSession.isRoundActive(), true);

  // Cambiar de sección también pregunta; salir descarta la ronda sin registrarla.
  document.querySelector('.navbtn[data-view="progreso"]').click();
  assert.ok(leaveModal());
  document.querySelector('[data-leave="exit"]').click();
  assert.equal(leaveModal(), null);
  assert.equal(store.getHistory().length, 0, 'una ronda abandonada no entra al historial');
  assert.equal(quizSession.isRoundActive(), false);
  assert.ok(document.getElementById('view-progreso').classList.contains('active'));
  assert.equal(document.getElementById('quizIntro').style.display, 'block');
  assert.equal(document.getElementById('sideProgressLabel').textContent.includes('0 rondas'), true);
});

test('el historial guarda el tamaño de la ronda, y las entradas viejas sin él siguen funcionando', ()=>{
  resetApp();
  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();
  for(let i=0; i<3; i++){
    const opts = [...document.querySelectorAll('#qOpts .opt')];
    opts[(quizSession.currentQuestion().correct + 1) % opts.length].click();
    if(i < 2) document.getElementById('nextBtn').click();
  }
  document.getElementById('nextBtn').click();
  const last = store.getHistory().at(-1);
  assert.equal(last.size, courses[0].questions.length, 'size = preguntas de la ronda');
  assert.equal(last.total, 3, 'total sigue siendo lo respondido');

  // una entrada antigua (sin size) se importa tal cual y se pinta igual
  const old = { t:1, score:10, right:2, total:3, pct:67, cats:{}, courseId:courses[0].id };
  const save = JSON.parse(store.exportSave());
  save.history = [old, { ...old, size:'x' }, { ...old, size:8 }];
  store.importSave(JSON.stringify(save));
  const h = store.getHistory();
  assert.equal('size' in h[0], false);
  assert.equal('size' in h[1], false, 'un size inválido se descarta');
  assert.equal(h[2].size, 8);
  assert.equal(h[0].pct, 67);
});

test('una ronda solo se registra al terminarla, y una sola vez aunque se pulse dos veces "Ver resultado"', ()=>{
  resetApp();
  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();
  assert.equal(quizSession.finishRound(), null, 'sin responder nada no hay ronda que contar');
  quizSession.startRound();
  assert.equal(store.getHistory().length, 0);

  document.querySelector('[data-action="startQuiz"]').click();
  for(let i=0; i<3; i++){
    const opts = [...document.querySelectorAll('#qOpts .opt')];
    opts[(quizSession.currentQuestion().correct + 1) % opts.length].click();
    if(i < 2) document.getElementById('nextBtn').click();
  }
  // Round completa a falta de ver el resultado: dos pulsaciones seguidas guardan una sola ronda.
  document.getElementById('nextBtn').click();
  document.getElementById('nextBtn').click();
  assert.equal(store.getHistory().length, 1, 'doble toque en "Ver resultado" no duplica la ronda');
  assert.equal(store.getHistory()[0].total, 3);
});

test('si la última respuesta ya estaba dada, salir guarda la ronda en vez de perderla', ()=>{
  resetApp();
  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();
  for(let i=0; i<3; i++){
    const opts = [...document.querySelectorAll('#qOpts .opt')];
    opts[(quizSession.currentQuestion().correct + 1) % opts.length].click();
    if(i < 2) document.getElementById('nextBtn').click();
  }
  document.querySelector('.navbtn[data-view="home"]').click();
  assert.equal(leaveModal(), null, 'una ronda terminada no pide confirmación');
  assert.equal(store.getHistory().length, 1);
});

test('un tema corrupto en localStorage no rompe la interfaz', ()=>{
  // localStorage es editable a mano; el toggle debe seguir siendo coherente.
  const { applyTheme } = theme;
  assert.doesNotThrow(()=> applyTheme('neon'));

  applyTheme('dark');
  assert.equal(document.documentElement.dataset.theme, 'dark');
  assert.equal(document.getElementById('themeToggle').getAttribute('aria-pressed'), 'true');
  assert.equal(document.querySelector('#themeToggle .tt-emoji').textContent, '☀️');

  applyTheme('light');
  assert.equal(document.getElementById('themeToggle').getAttribute('aria-pressed'), 'false');
  assert.equal(document.querySelector('#themeToggle .tt-emoji').textContent, '🌙');
});

test('importar un respaldo repinta todo y respeta el tema', ()=>{
  store.setTheme('dark');
  const snapshot = store.exportSave();

  store.resetAll();
  store.addChispas(9999);
  emit('state:imported');
  assert.equal(document.getElementById('sparkBalance').textContent, '9999');

  store.importSave(snapshot);
  emit('state:imported');

  assert.notEqual(document.getElementById('sparkBalance').textContent, '9999');
  assert.equal(document.documentElement.dataset.theme, 'dark',
    'resetAll conserva el tema; importarlo debe respetarlo');
});


test('quiz: dentro de la ronda el contador de aciertos seguidos se llama "Combo"', ()=>{
  resetApp();
  document.querySelector('.mode-card[data-n="99"]').click();
  document.querySelector('[data-action="startQuiz"]').click();
  assert.ok(document.querySelector('.streak-flame').textContent.startsWith('Combo'));
  assert.ok(document.querySelector('#view-quiz .page-sub').textContent.includes('combo'));
  assert.ok(!/racha/i.test(document.querySelector('#view-quiz .quiz-meta').textContent));
});
