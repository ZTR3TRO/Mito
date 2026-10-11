import { SURVIVOR_BALANCE } from './balance.js';

export const SURVIVOR_POWERS = [
  { id:'iman-gemas', table:'imanGemas', name:'Iman de gemas' },
  { id:'atp-turbo', table:'atpTurbo', name:'ATP Turbo' },
  { id:'mitocampo', table:'mitocampo', name:'Mitocampo' },
  { id:'chispa-doble', table:'chispaDoble', name:'Chispa doble' },
  { id:'catalizador', table:'catalizador', name:'Catalizador' },
  { id:'membrana-protectora', table:'membranaProtectora', name:'Membrana protectora' },
  { id:'reparacion-celular', table:'reparacionCelular', name:'Reparacion celular' },
  { id:'congelacion', table:'congelacion', name:'Congelacion' },
  { id:'critico', table:'critico', name:'Critico' },
  { id:'area-ampliada', table:'areaAmpliada', name:'Area ampliada' },
];

function clampLevel(level){
  return Math.max(0, Math.min(8, Math.round(Number(level) || 0)));
}

export function powerById(id){
  return SURVIVOR_POWERS.find(power => power.id === id) || null;
}

export function powerStats(id, level, balance = SURVIVOR_BALANCE){
  const power = powerById(id);
  if(!power) return null;
  const table = balance.powers?.[power.table] || SURVIVOR_BALANCE.powers[power.table];
  const safeLevel = clampLevel(level);
  if(!safeLevel || !table?.[safeLevel]) return null;
  return { ...table[safeLevel] };
}

export function effectiveStats(session, balance = SURVIVOR_BALANCE){
  const stats = {
    pickupRadius: balance.xp?.pickupRadius || SURVIVOR_BALANCE.xp.pickupRadius,
    playerSpeed: balance.player?.speed || SURVIVOR_BALANCE.player.speed,
    maxLife: balance.player?.maxLife || SURVIVOR_BALANCE.player.maxLife,
    regen: 0,
    enemySlow: 0,
    globalProjectiles: 0,
    cooldownMultiplier: 1,
    areaMultiplier: 1,
    criticalChance: 0,
    criticalMultiplier: 1,
    mitocampoDamage: 0,
    mitocampoRadius: 0,
  };
  const levels = session?.powers || {};

  for(const power of SURVIVOR_POWERS){
    const powerLevel = clampLevel(levels[power.id]);
    if(!powerLevel) continue;
    const value = powerStats(power.id, powerLevel, balance);
    if(!value) continue;
    if(value.pickupRadius) stats.pickupRadius = value.pickupRadius;
    if(value.playerSpeed) stats.playerSpeed = Math.round(stats.playerSpeed * value.playerSpeed);
    if(value.maxLife) stats.maxLife = value.maxLife;
    if(value.regen) stats.regen = value.regen;
    if(value.enemySlow) stats.enemySlow = value.enemySlow;
    if(value.projectiles) stats.globalProjectiles = value.projectiles;
    if(value.cooldown) stats.cooldownMultiplier = value.cooldown;
    if(value.area) stats.areaMultiplier = value.area;
    if(value.chance) stats.criticalChance = value.chance;
    if(value.multiplier) stats.criticalMultiplier = value.multiplier;
    if(value.damage) stats.mitocampoDamage = value.damage;
    if(value.radius) stats.mitocampoRadius = value.radius;
  }

  if(stats.mitocampoRadius) stats.mitocampoRadius = Math.round(stats.mitocampoRadius * stats.areaMultiplier);

  return stats;
}
