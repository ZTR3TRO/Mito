// Racha de días jugados. Vive fuera de la materia porque se muestra en la sidebar,
// el héroe y la vista de progreso.

import { byId } from '../../core/dom.js';
import { getStreak } from '../../state/store.js';
import { activeCourse } from '../course/course.js';

const STACKS = ['sideStreak','heroStreak','progressStreak'];

export function renderStreak(){
  const s = getStreak();
  STACKS.forEach(id=>{
    const node = byId(id);
    if(node && node.dataset.mode !== 'days') node.textContent = s;
  });
  const days = byId('sideStreakDays');
  if(!days) return;
  days.textContent = s === 0
    ? 'juega hoy para encender la racha'
    : s === 1 ? '1 día seguido' : `${s} días seguidos`;
}

// Contadores del banco de preguntas y los modos de ronda disponibles.
export function renderQuizCounts(){
  const course = activeCourse();
  const n = course.questions.length;
  const all = byId('modeAllN');
  const stat = byId('statBankSize');
  const startBtn = document.querySelector('[data-action="startQuiz"]');
  const quick = byId('modeQuickN');
  const rec = byId('modeRecN');

  const quickN = n === 0 ? 0 : Math.min(n, Math.max(1, Math.round(n * 0.3)));
  const recN = n === 0 ? 0 : Math.min(n, Math.max(1, Math.round(n * 0.6)));

  if(all) all.textContent = n;
  if(stat) stat.textContent = n;

  if(quick){ quick.textContent = quickN; setCardCount(quick, quickN); }
  if(rec){ rec.textContent = recN; setCardCount(rec, recN); }

  if(startBtn){
    startBtn.disabled = n === 0;
    startBtn.textContent = n === 0 ? 'Sin preguntas aún' : 'Comenzar';
  }
  const title = byId('quizTitle');
  if(title) title.textContent = 'Quiz de ' + course.label;
}

// El tamaño de la ronda vive en data-n de cada .mode-card.
function setCardCount(node, count){
  const card = node.closest('.mode-card');
  if(card) card.dataset.n = count;
}