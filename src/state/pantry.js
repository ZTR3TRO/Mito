// Charola de la Casa: la comida que tienes. A diferencia de la ropa, la comida se consume: se compran unidades en
// la Tienda y se gastan al dársela a Mito.
//
// Se guarda en el campo opcional `pantry` ({ id de alimento: cantidad }). Una partida sin él tiene la charola vacía.
// Solo cuentan los alimentos del catálogo (content/food.js) y cantidades enteras de 1 a FOOD_MAX.

import { FOODS, FOOD_MAX, findFood } from '../content/food.js';
import { state, commit, num } from './core.js';
import { isFull, feed } from './house.js';

// Deja una charola guardada (o importada) en un estado válido.
export function cleanPantry(p){
  const out = {};
  if(!p || typeof p !== 'object') return out;
  FOODS.forEach(({ id })=>{
    const n = Math.min(FOOD_MAX, Math.floor(num(p[id])));
    if(n > 0) out[id] = n;
  });
  return out;
}

export function getPantry(){
  return cleanPantry(state.pantry);
}

export function foodCount(id){
  return getPantry()[id] || 0;
}

function store(p){
  if(Object.keys(p).length) state.pantry = p;
  else delete state.pantry;
}

// Comprar una unidad. Devuelve la cantidad nueva, o 0 si no se pudo (no existe, sin saldo o ya tienes el máximo).
export function buyFood(id){
  const food = findFood(id);
  const p = getPantry();
  const have = p[id] || 0;
  if(!food || have >= FOOD_MAX || state.chispas < food.cost) return 0;
  state.chispas -= food.cost;
  p[id] = have + 1;
  store(p);
  commit();
  return p[id];
}

// Dársela a Mito: si está lleno, no come y la comida no se gasta.
//   { ok: true, hunger, left }  ·  { ok: false, reason: 'none' | 'full' }
export function eatFood(id, now = Date.now()){
  const food = findFood(id);
  const p = getPantry();
  if(!food || !p[id]) return { ok: false, reason: 'none' };
  if(isFull(now)) return { ok: false, reason: 'full' };
  p[id] -= 1;
  if(!p[id]) delete p[id];
  store(p);
  const hunger = feed(food.fill, now);   // guarda la charola y el hambre juntas
  return { ok: true, hunger, left: p[id] || 0 };
}

// Para partidas importadas: el campo es opcional; si viene, se limpia (y si queda vacío, no se guarda).
export function parsePantry(p){
  if(p == null) return undefined;
  const clean = cleanPantry(p);
  return Object.keys(clean).length ? clean : undefined;
}
