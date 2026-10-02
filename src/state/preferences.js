// Preferencias: tema y materia activa.

import { state, commit } from './core.js';

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
