// Economía: las chispas, la moneda con la que se compra.

import { state, commit } from './core.js';

export const PASSING_BONUS = 50;

export function getChispas(){
  return state.chispas;
}

export function addChispas(n){
  state.chispas += n;
  commit();
  return state.chispas;
}

export function spendChispas(n){
  if(state.chispas < n) return false;
  state.chispas -= n;
  commit();
  return true;
}
