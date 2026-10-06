// Orquestación del quiz: conecta session (estado), view (DOM) y store (puntos),
// y expone las acciones que despachan los botones de la interfaz.

import { $$ } from '../../core/dom.js';
import { addChispas, recordQuizResult, PASSING_BONUS } from '../../state/store.js';
import { emit } from '../../core/bus.js';
import { activeCourse } from '../course/course.js';
import { sparkAt } from '../mascot/effects.js';
import { activeMistakeEntries } from './review.js';
import * as s from './session.js';
import * as view from './view.js';

export function startQuiz(){
  const questions = s.startRound();
  if(!questions) return;
  view.showPlay();
  view.renderQuestion(answer);
  emit('quiz:started');
}

function answer(idx){
  const outcome = s.submitAnswer(idx);
  if(!outcome) return;
  view.renderAnswerResult(idx, outcome);
}

function nextQuestion(){
  if(!s.advance()){
    finishQuiz();
    return;
  }
  view.renderQuestion(answer);
}

function finishQuiz(){
  const result = s.finishRound();
  view.renderResult(result);

  const { score, right, answered, pct, total, perfect } = result;
  const mascotResult = document.getElementById('mascotResult');
  const approved = pct >= view.PASS_PCT;
  const awarded = score + (approved ? PASSING_BONUS : 0);

  if(awarded > 0){
    addChispas(awarded);
    setTimeout(()=>sparkAt(mascotResult, `+${awarded} ⚡`), 400);
    document.getElementById('resultSub').textContent =
      `puntos · ${right}/${answered} correctas (${pct}%) · Ganaste +${awarded} ⚡ chispas${approved ? ' (bono por aprobar)' : ''}`;
  }

  recordQuizResult({ score, right, total: answered, pct, cats: s.getSession().catStats, courseId: activeCourse().id });
  emit('quiz:finished', { pct, awarded, perfect, total });
}

export function resetQuiz(){
  s.resetSession();
  view.showIntro();
}

// Tarjeta "repaso inteligente": habilitada solo si hay fallos pendientes.
export function renderReviewCard(){
  const card = document.getElementById('modeRev');
  if(!card) return;
  const n = activeMistakeEntries().length;
  const num = document.getElementById('modeRevN');
  const lab = document.getElementById('modeRevL');

  if(n === 0){
    card.classList.add('emptied');
    card.removeAttribute('data-setup');
    card.setAttribute('aria-disabled','true');
    if(num) num.textContent = '0';
    if(lab) lab.textContent = 'sin fallos aún';
    return;
  }
  card.classList.remove('emptied');
  card.setAttribute('data-setup','repaso');
  card.removeAttribute('aria-disabled');
  if(num) num.textContent = n;
  if(lab) lab.textContent = 'repaso inteligente';
}

export function goReview(){
  const card = document.getElementById('modeRev');
  if(!card || card.getAttribute('aria-disabled') === 'true') return;
  $$('.mode-card').forEach(x=>x.classList.remove('selected'));
  card.classList.add('selected');
  emit('nav:request', 'quiz');
}

export function init(){
  // Selección de modo de ronda.
  $$('.mode-card').forEach(m=>{
    m.addEventListener('click', ()=>{
      if(m.getAttribute('aria-disabled') === 'true') return;
      $$('.mode-card').forEach(x=>x.classList.remove('selected'));
      m.classList.add('selected');
    });
  });

  // Acciones declaradas en index.html con data-action.
  const actions = { startQuiz, resetQuiz, nextQuestion, goReview };
  document.addEventListener('click', e=>{
    const action = e.target.closest('[data-action]');
    if(action && actions[action.dataset.action]) actions[action.dataset.action]();
  });
}