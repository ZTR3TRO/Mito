// Inventario: qué prendas tienes compradas y cuál llevas puesta en cada categoría.

import { secretIdsFor, findItem, isSeasonalOpen } from '../content/wardrobe.js';
import { state, commit } from './core.js';

const PET_NAME_MAX = 20;

export function owns(id){
  return !!state.owned[id];
}

export function getEquipped(){
  return { ...state.equipped };
}

export function getPetName(id){
  return state.petNames[id] || '';
}

export function getPetDisplayName(id){
  const item = findItem('pet', id);
  return getPetName(id) || (item ? item.name : '—');
}

export function renamePet(id, name){
  const item = findItem('pet', id);
  if(!item || id === 'p-none' || !owns(id)) return false;
  const clean = String(name || '').trim().slice(0, PET_NAME_MAX);
  if(clean) state.petNames[id] = clean;
  else delete state.petNames[id];
  commit();
  return true;
}

export function equipCategory(cat, id){
  const item = findItem(cat, id);
  if(!item || ((item.cost > 0 || item.secret) && !owns(id))) return false;
  state.equipped[cat] = id;
  commit();
  return true;
}

// Easter egg: entrega los premios secretos de ESE egg ('tap10' | 'perfect'). Devuelve los ids recién desbloqueados ([] si ya los tenías).
export function unlockSecrets(egg){
  const fresh = secretIdsFor(egg).filter(id => !state.owned[id]);
  if(!fresh.length) return [];
  fresh.forEach(id => { state.owned[id] = true; });
  commit();
  return fresh;
}

export function secretsUnlocked(egg){
  return secretIdsFor(egg).every(id => state.owned[id]);
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
