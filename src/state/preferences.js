// Preferencias: tema, materia activa y cuántas veces se mostró la pista de la Casa.

import { state, commit, num } from './core.js';

export function getTheme(){
  return state.theme;
}

export function setTheme(t){
  if(t !== 'dark' && t !== 'light') t = 'light';
  state.theme = t;
  commit();
  return t;
}

export function getCourse(){
  return state.course;
}

export function setCourse(id){
  if(typeof id !== 'string') return state.course;
  state.course = id;
  commit();
  return state.course;
}

// Pista de la Casa ("pícalo, hazle cosquillas…"): solo se muestra las primeras veces.
// `houseHint` es opcional: las partidas guardadas antes de la Casa no lo tienen y cuentan como 0.
export function getHouseHintCount(){
  return Math.max(0, Math.floor(num(state.houseHint)));
}

export function markHouseHintShown(){
  state.houseHint = getHouseHintCount() + 1;
  commit();
}
