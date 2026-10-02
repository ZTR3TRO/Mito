// Progreso: historial de rondas, fallos pendientes y racha diaria.

import { dayStr, dayBefore } from '../core/utils.js';
import { state, commit, HISTORY_LIMIT, MISTAKES_LIMIT } from './core.js';

export function getHistory(){
  return state.history;
}

export function recordQuizResult({score, right, total, pct, cats, courseId}){
  const today = dayStr();
  state.history.push({ t:Date.now(), score, right, total, pct, cats, courseId });
  if(state.history.length > HISTORY_LIMIT) state.history = state.history.slice(-HISTORY_LIMIT);

  if(state.lastDay === today){
    // misma racha del día: no cambia
  } else if(state.lastDay && dayBefore(today) === state.lastDay){
    state.streak++;
  } else {
    state.streak = 1;
  }
  state.lastDay = today;
  commit();
  return state.streak;
}

export function getMistakes(){
  return { ...state.mistakes };
}

export function recordAnswer(courseId, q, correct){
  const key = `${courseId}::${q}`;
  const m = state.mistakes[key] || { wrong:0, right:0 };
  if(correct) m.right++; else m.wrong++;
  // solo cuenta como "fallo pendiente" si hay errores y aún no los dominas
  // (se libera cuando aciertas al menos el doble de veces que fallas)
  if(m.wrong > 0 && m.right < m.wrong*2){
    state.mistakes[key] = { wrong:m.wrong, right:m.right };
  } else {
    delete state.mistakes[key];
  }
  const keys = Object.keys(state.mistakes);
  if(keys.length > MISTAKES_LIMIT){
    const excess = keys.length - MISTAKES_LIMIT;
    keys.slice(0, excess).forEach(k=>delete state.mistakes[k]);
  }
  commit();
}

export function clearMistakes(){
  state.mistakes = {};
  commit();
}

export function getStreak(){
  // La racha solo sigue viva si jugaste hoy o ayer; si no, ya se rompió
  if(!state.lastDay) return 0;
  const today = dayStr();
  return (state.lastDay === today || state.lastDay === dayBefore(today)) ? state.streak : 0;
}
