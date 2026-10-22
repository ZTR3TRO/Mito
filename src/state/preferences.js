// Preferencias: tema, materia activa, la última pestaña de la Tienda y cuántas veces se mostraron las pistas de la Casa,
// de la charola y de Decorar.

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

// Pista de la charola ("toca un alimento o arrástralo a su boca"): igual, solo las primeras veces. `foodHint` es opcional.
export function getFoodHintCount(){
  return Math.max(0, Math.floor(num(state.foodHint)));
}

export function markFoodHintShown(){
  state.foodHint = getFoodHintCount() + 1;
  commit();
}

// Pista de Decorar ("arrastra un mueble…") y el puntito del botón (solo mientras nunca se ha abierto). `decorHint` es opcional.
export function getDecorHintCount(){
  return Math.max(0, Math.floor(num(state.decorHint)));
}

export function markDecorHintShown(){
  state.decorHint = getDecorHintCount() + 1;
  commit();
}

// La última pestaña visitada de la Tienda (la valida la Tienda: si ya no existe, abre la de siempre).
// `shopTab` es opcional: sin él, la Tienda abre en su pestaña de siempre.
export function getShopTab(){
  return typeof state.shopTab === 'string' ? state.shopTab : null;
}

export function setShopTab(id){
  if(typeof id !== 'string' || state.shopTab === id) return;
  state.shopTab = id.slice(0, 20);
  commit();
}
