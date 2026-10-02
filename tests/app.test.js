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
import { isSeasonalOpen, WARDROBE } from '../src/wardrobe.js';

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
  theme = await import('../src/features/theme.js');
  courses = (await import('../src/courses.js')).COURSES;
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
  assert.equal(store.secretsUnlocked(), false, 'con 9 toques aún no debe desbloquear');

  tap();
  assert.equal(store.secretsUnlocked(), true, 'el décimo toque entrega los premios');

  // Los premios ya no se venden y se ven en el armario.
  assert.equal(document.querySelector('#shopHost [data-buy="p-bee"]'), null);
  assert.ok(document.querySelector('#wardrobeHost [data-equip="p-bee"]'));
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