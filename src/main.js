// Punto de entrada de la app.
//
// Aquí no hay lógica de negocio: solo se registran los módulos y se cablea quién
// reacciona a qué. Cada módulo de src/features/ es autónomo y se puede quitar o
// añadir sin tocar los demás.
//
// Orden de arranque: 0) núcleo  1) tema  2) navegación  3) materia  4) quiz
// 5) tienda  6) progreso  7) mascot  8) easter egg  9) service worker

import { on } from './core/bus.js';
import { byId } from './core/dom.js';

import { applyAvatar } from './features/mascot/avatar.js';
import { getHistory, getTheme, addChispas, getChispas } from './state/store.js';

import { goTo, isVisible, initNavButtons, initNavLinks } from './features/nav/router.js';
import { initTheme, applyTheme } from './features/theme/index.js';

import { initCourseTabs, renderCourseTabs, reloadCourse, activeCourse } from './features/course/course.js';
import { renderNotes, initNotes } from './features/course/notes.js';
import { renderKeys } from './features/course/keys.js';
import { renderHome } from './features/course/home.js';

import { init as initQuiz, renderReviewCard, resetQuiz } from './features/quiz/index.js';
import { renderQuizCounts, renderStreak } from './features/quiz/counts.js';

import { init as initShop, renderShop, updateBalance, updatePreviewLabels } from './features/shop/index.js';
import { init as initSeason, checkSeason } from './features/shop/season.js';

import { init as initBackup } from './features/progress/backup.js';
import { renderProgress, renderSidebarStats } from './features/progress/view.js';

import { init as initSpeech, initPetTalk, say, sayHero, getHeroLastMsg } from './features/mascot/speech.js';
import { setFace, playState } from './features/mascot/face.js';
import { burstConfetti } from './features/mascot/effects.js';
import { greeting, idleMessage, courseSwitchMessage, firstRoundMessage, resultMessage } from './content/messages.js';
import { initEasterEgg, initPerfectEgg } from './features/easter.js';

/* ---------- Re-render de las vistas que dependen de la materia ---------- */
function renderCourseViews(){
  renderCourseTabs();
  renderNotes();
  renderKeys();
  renderHome();
  renderQuizCounts();
  renderReviewCard();
}

/* ---------- Estado global: repinta todo tras importar/reiniciar ---------- */
function refreshAll(){
  document.querySelectorAll('.collection-notice').forEach(el=>{ el.textContent = ''; });
  reloadCourse();
  renderCourseViews();
  byId('quizPlay').style.display = 'none';
  resetQuiz();
  applyAvatar();
  applyTheme(getTheme());
  renderShop();
  updateBalance();
  updatePreviewLabels();
  renderStreak();
  renderSidebarStats();
  renderReviewCard();
  renderProgress();
}

// Easter egg de ronda perfecta: se crea en boot() y lo arma/apaga el evento quiz:finished.
let perfectEgg = null;

/* ---------- Reacciones entre módulos ---------- */
function wire(){
  on('nav:before', ()=>{
    applyAvatar();
    checkSeason();
  });
  on('nav:after', view=>{
    if(view === 'progreso') renderProgress();
    if(view === 'quiz') renderReviewCard();
  });
  on('nav:request', view => goTo(view));

  on('course:changed', course=>{
    renderCourseViews();
    renderStreak();
    byId('quizPlay').style.display = 'none';
    resetQuiz();
    say(courseSwitchMessage(course.label));
    sayHero(idleMessage(course.id, getHeroLastMsg()));
    if(isVisible('progreso')) renderProgress();
  });

  on('quiz:finished', ({ pct, awarded, perfect, total })=>{
    perfectEgg?.arm(perfect ? total : 0);
    renderSidebarStats();
    renderReviewCard();
    renderStreak();
    // Solo hay que repintar la tienda si el saldo cambió (state:changed ya
    // actualiza el saldo y los botones de compra).
    if(awarded > 0) renderShop();
    say(resultMessage(pct));
    if(isVisible('progreso')) renderProgress();
  });

  // El store avisa de cualquier cambio guardado (chispas, compras, respuestas):
  // lo barato se repinta aquí. Lo caro (la tienda completa, el historial) solo
  // cuando el evento lo amerita.
  on('state:changed', ()=>{
    updateBalance();
    updatePreviewLabels();
    renderSidebarStats();
  });

  // Importar o reiniciar el progreso deja el estado entero cambiado.
  on('state:imported', refreshAll);
  on('state:reset', ()=>{
    refreshAll();
    say('Listo, todo desde cero. ¡A empezar de nuevo, Zare! 🧼');
  });
}

/* ---------- Arranque ---------- */
function boot(){
  wire();

  initTheme();
  initNavButtons();
  initNavLinks();

  initCourseTabs();
  initNotes();
  initQuiz();
  initShop();
  initSeason();
  initBackup();

  initSpeech({ courseId: ()=> activeCourse().id });
  initPetTalk({ viewVisible: isVisible });

  renderCourseViews();
  applyAvatar();
  renderShop();
  updateBalance();
  updatePreviewLabels();
  renderStreak();
  renderSidebarStats();
  renderProgress();

  say(getHistory().length === 0 ? `${greeting()} ${firstRoundMessage()}` : greeting());
  sayHero(idleMessage(activeCourse().id, ''));

  initEasterEgg({
    target: byId('mascotHero'),
    say: sayHero,
    onUnlock: celebrateSecrets,
    onOpenWardrobe: ()=> goTo('wardrobe'),
  });

  // Solo cuenta mientras se ve la pantalla de resultado de la ronda perfecta.
  perfectEgg = initPerfectEgg({
    target: byId('mascotResult'),
    enabled: ()=> byId('quizResult').style.display === 'block',
    onUnlock: celebratePerfectEgg,
    onOpenWardrobe: ()=> goTo('wardrobe'),
  });

  registerServiceWorker();
}

// Recompensa del easter egg: el avatar ya trae lo nuevo, solo la celebración.
function celebrateSecrets(){
  const hero = byId('mascotHero');
  applyAvatar();
  renderShop();
  updatePreviewLabels();
  setFace(hero, 'excited');
  playState(hero, 'excited');
  setTimeout(()=> setFace(hero, 'happy'), 1400);
  const r = hero.getBoundingClientRect();
  burstConfetti(r.left + r.width/2, r.top, 70);
  sayHero('¡Bzzz! Mira lo que encontraste 🐝');
}

// Recompensa del egg de ronda perfecta: la celebración ocurre sobre Mito en la pantalla de resultado.
function celebratePerfectEgg(){
  const mascot = byId('mascotResult');
  applyAvatar();
  renderShop();
  updatePreviewLabels();
  setFace(mascot, 'excited');
  playState(mascot, 'excited');
  const r = mascot.getBoundingClientRect();
  burstConfetti(r.left + r.width/2, r.top, 90);
  sayHero('¡Glub glub! Tienes un ajolote 🌸');
}

// Solo en producción. import.meta.env no existe fuera de Vite (p. ej. en tests),
// por eso la comprobación es opcional.
function registerServiceWorker(){
  const env = import.meta.env;
  if(env?.PROD && 'serviceWorker' in navigator && location.protocol !== 'file:'){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register(env.BASE_URL + 'sw.js').catch(()=>{});
    });
  }
}

// Atajo para la consola: window.addChispas(n) suma chispas desde fuera.
window.addChispas = (n)=>{
  addChispas(n);
  renderShop();
  updateBalance();
  updatePreviewLabels();
  return getChispas();
};

boot();