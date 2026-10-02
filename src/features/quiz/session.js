// Estado de una ronda en curso. Aísla los datos del quiz del DOM para que la
// lógica sea comprobable y la vista solo pinte.

import { shuffle, isNumericSeries, keepsOptionOrder } from '../../core/utils.js';
import { activeCourse } from '../course/course.js';
import { buildReviewPool } from './review.js';
import { recordAnswer } from '../../state/store.js';

const LIVES = 3;
const STREAK_CAP = 4;
const BASE_POINTS = 3;

const session = {
  questions: [],
  index: 0,
  score: 0,
  streak: 0,
  lives: LIVES,
  answered: false,
  catStats: {},
  roundsPlayed: 0,
};

export const getSession = ()=> session;

export function currentQuestion(){
  return session.questions[session.index];
}

function isLastQuestion(){
  return session.index === session.questions.length - 1;
}

export function isGameOver(){
  return session.lives <= 0 || isLastQuestion();
}

// Elige el banco de preguntas según el modo seleccionado.
function buildRound(setup){
  const qs = activeCourse().questions;
  if(setup === 'repaso') return buildReviewPool();
  const nRaw = parseInt(document.querySelector('.mode-card.selected')?.dataset.n, 10);
  const n = Number.isFinite(nRaw) ? Math.min(nRaw, qs.length) : qs.length;
  return shuffle(qs).slice(0, n);
}

export function startRound(){
  const qs = activeCourse().questions;
  if(qs.length === 0) return null;
  session.questions = buildRound(readSetup());
  session.index = 0;
  session.score = 0;
  session.streak = 0;
  session.lives = LIVES;
  session.answered = false;
  session.catStats = {};
  return session.questions;
}

function readSetup(){
  let setup = 'normal';
  document.querySelectorAll('.mode-card').forEach(c=>{
    if(c.classList.contains('selected')) setup = c.dataset.setup || 'normal';
  });
  return setup;
}

// Baraja las opciones para que la correcta no siempre caiga en B/C, salvo cuando
// el orden importa (opciones tipo "A y B" o series numéricas).
export function prepareQuestion(base){
  const keepOrder = keepsOptionOrder(base.opts) || isNumericSeries(base.opts);
  const order = keepOrder ? base.opts.map((_, i)=>i) : shuffle(base.opts.map((_, i)=>i));
  const item = { ...base, opts: order.map(i=>base.opts[i]), correct: order.indexOf(base.correct) };
  session.questions[session.index] = item;
  return item;
}

export function advance(){
  if(isGameOver()) return false;
  session.index++;
  // Cada pregunta admite una sola respuesta: hay que liberar el flag al avanzar.
  session.answered = false;
  return true;
}

export function resetSession(){
  session.index = 0;
  session.score = 0;
  session.streak = 0;
  session.lives = LIVES;
  session.answered = false;
  session.catStats = {};
}

// Registra la respuesta y devuelve el efecto para que la vista lo pinte.
export function submitAnswer(idx){
  if(session.answered) return null;
  session.answered = true;
  const item = currentQuestion();
  const correct = idx === item.correct;

  if(!session.catStats[item.cat]) session.catStats[item.cat] = { right:0, total:0 };
  session.catStats[item.cat].total++;
  recordAnswer(activeCourse().id, item.q, correct);

  if(correct){
    session.streak++;
    const gain = BASE_POINTS + Math.min(session.streak, STREAK_CAP);
    session.score += gain;
    session.catStats[item.cat].right++;
    return { correct:true, gain, streak:session.streak, hotStreak:session.streak >= 3 };
  }

  session.streak = 0;
  session.lives--;
  return { correct:false, lives:session.lives };
}

// Totales de la ronda, para el resultado y para el historial.
function totals(){
  const answered = Object.values(session.catStats).reduce((s,c)=>s+c.total, 0);
  const right = Object.values(session.catStats).reduce((s,c)=>s+c.right, 0);
  const pct = answered ? Math.round(right/answered*100) : 0;
  return { answered, right, pct };
}

export function finishRound(){
  session.roundsPlayed++;
  return { ...totals(), score: session.score };
}