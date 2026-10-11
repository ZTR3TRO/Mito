import { SURVIVOR_BALANCE } from './balance.js';

export const PET_WEAPONS = {
  'p-chick': {
    id: 'picotazo-pollito',
    table: 'picotazoPollito',
    name: 'Picotazo veloz',
    role: 'rapido',
    maxLevel: 8,
    fire(stats, api){
      api.fireShortProjectiles(stats);
    },
  },
  'p-turtle': {
    id: 'onda-tortuguita',
    table: 'ondaTortuguita',
    name: 'Onda de caparazón',
    role: 'defensa',
    maxLevel: 8,
    fire(stats, api){
      api.firePulse(stats);
    },
  },
  'p-fox': {
    id: 'chispa-zorrito',
    table: 'chispaZorrito',
    name: 'Chispa perseguidora',
    role: 'persecucion',
    maxLevel: 8,
    fire(stats, api){
      api.fireHomingProjectiles(stats);
    },
  },
};

function clampLevel(level){
  return Math.max(1, Math.min(8, Math.round(Number(level) || 1)));
}

export function createPetWeapon(petId){
  const weapon = PET_WEAPONS[petId];
  if(!weapon) return null;
  return { id:weapon.id, petId, level:1 };
}

export function petWeaponStats(petId, level, balance = SURVIVOR_BALANCE){
  const weapon = PET_WEAPONS[petId];
  const table = weapon ? balance.weapons?.petWeapons?.[weapon.table] || SURVIVOR_BALANCE.weapons.petWeapons[weapon.table] : null;
  if(!table) return null;
  return { ...table[clampLevel(level)] };
}
