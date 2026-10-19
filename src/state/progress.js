// Progreso: historial de rondas, fallos pendientes y racha diaria.

import { dayStr, dayBefore } from '../core/utils.js';
import { state, commit, HISTORY_LIMIT, MISTAKES_LIMIT } from './core.js';

export function getHistory(){
  return state.history;
}

// `size` (opcional): cuántas preguntas tenía la ronda. Las entradas antiguas no lo tienen; nada depende de él.
export function recordQuizResult({score, right, total, pct, cats, courseId, size}){
  const today = dayStr();
  const entry = { t:Date.now(), score, right, total, pct, cats, courseId };
  if(Number.isInteger(size) && size > 0) entry.size = size;
  state.history.push(entry);
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

// Aciertos seguidos que hacen falta para sacar un fallo de la lista.
export const MASTERY_STREAK = 2;

// `pick`: el texto de la opción que se eligió (las opciones se barajan, así que no sirve el índice).
// Las entradas guardadas antes no traen `ok` ni `pick`: cuentan como 0 seguidas y sin respuesta elegida.
export function recordAnswer(courseId, q, correct, pick){
  const key = `${courseId}::${q}`;
  const m = state.mistakes[key];
  if(correct){
    // acertar algo que nunca se falló no deja rastro
    if(m){
      const ok = (m.ok || 0) + 1;
      if(ok >= MASTERY_STREAK) delete state.mistakes[key];
      else state.mistakes[key] = { ...m, right:m.right + 1, ok };
    }
  } else {
    // fallar reinicia los aciertos seguidos
    const entry = { wrong:(m ? m.wrong : 0) + 1, right:m ? m.right : 0, ok:0 };
    if(typeof pick === 'string' && pick) entry.pick = pick;
    state.mistakes[key] = entry;
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
