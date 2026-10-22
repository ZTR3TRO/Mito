// Economía: las chispas, la moneda con la que se compra.

import { state, commit } from './core.js';

export const PASSING_BONUS = 50;
export const SPARK_CLICK_EGG_REWARD = 1000;
export const SEASON_GIFT_REWARD = 10000;

export function getChispas(){
  return state.chispas;
}

export function addChispas(n){
  state.chispas += n;
  commit();
  return state.chispas;
}

export function claimSparkClickEgg(){
  if(state.claimedEggs.spark50) return false;
  state.chispas += SPARK_CLICK_EGG_REWARD;
  state.claimedEggs.spark50 = true;
  commit();
  return true;
}

export function hasClaimedSeasonGift(){
  return state.claimedEggs.seasonGift === true;
}

// El saldo y el reclamo se guardan juntos: volver a tocar o recargar no repite el regalo.
export function claimSeasonGift(){
  if(hasClaimedSeasonGift()) return false;
  state.chispas += SEASON_GIFT_REWARD;
  state.claimedEggs.seasonGift = true;
  commit();
  return true;
}
