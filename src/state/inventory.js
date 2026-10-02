// Inventario: qué prendas tienes compradas y cuál llevas puesta en cada categoría.

import { SECRET_IDS, findItem, isSeasonalOpen } from '../content/wardrobe.js';
import { state, commit } from './core.js';

export function owns(id){
  return !!state.owned[id];
}

export function getEquipped(){
  return { ...state.equipped };
}

export function equipCategory(cat, id){
  const item = findItem(cat, id);
  if(!item || ((item.cost > 0 || item.secret) && !owns(id))) return false;
  state.equipped[cat] = id;
  commit();
  return true;
}

// Easter egg: entrega los premios secretos. Devuelve los ids recién desbloqueados ([] si ya los tenías).
export function unlockSecrets(){
  const fresh = SECRET_IDS.filter(id => !state.owned[id]);
  if(!fresh.length) return [];
  fresh.forEach(id => { state.owned[id] = true; });
  commit();
  return fresh;
}

export function secretsUnlocked(){
  return SECRET_IDS.every(id => state.owned[id]);
}

export function buyAndEquip(cat, id){
  const item = findItem(cat, id);
  if(!item || item.secret || item.cost <= 0 || owns(id) || state.chispas < item.cost) return false;
  if(item.seasonal && !isSeasonalOpen()) return false;
  state.chispas -= item.cost;
  state.owned[id] = true;
  state.equipped[cat] = id;
  commit();
  return true;
}
