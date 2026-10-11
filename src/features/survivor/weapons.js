import { SURVIVOR_BALANCE } from './balance.js';

export const CHISPA_MITO_ID = 'chispa-mito';

function clampLevel(level){
  return Math.max(1, Math.min(8, Math.round(Number(level) || 1)));
}

function tableFor(id, balance = SURVIVOR_BALANCE){
  if(id === CHISPA_MITO_ID) return balance.weapons?.chispaMito || SURVIVOR_BALANCE.weapons.chispaMito;
  return null;
}

export function weaponStats(id, level, balance = SURVIVOR_BALANCE){
  const table = tableFor(id, balance);
  if(!table) return null;
  return { ...table[clampLevel(level)] };
}

export function nearestEnemy(origin, enemies){
  let nearest = null;
  let nearestDistance = Infinity;
  for(const enemy of enemies){
    if(enemy.dead || enemy.life <= 0) continue;
    const dx = enemy.x - origin.x;
    const dy = enemy.y - origin.y;
    const distance = dx * dx + dy * dy;
    if(distance < nearestDistance){
      nearest = enemy;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function protectedWeaponLevel(id, level){
  const min = id === CHISPA_MITO_ID ? 1 : 0;
  return Math.max(min, Math.min(8, Math.round(Number(level) || min)));
}
