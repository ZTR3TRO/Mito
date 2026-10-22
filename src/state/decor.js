// Muebles de la Casa: los que compraste y dónde los pusiste. Cada mueble se compra una sola vez.
//
// Se guarda en el campo opcional `decor`:
//   { owned: [ids], placed: { id: { zona: 'wall' | 'floor', u, v, flip?, scale? } }, seen: [ids] }
//   owned   comprados (o regalados)
//   placed  los que están en el cuarto: u y v van de 0 a 1 dentro de su zona (ver features/house/furniture-layout.js);
//           los comprados que no están aquí están en el inventario (la bandeja de Decorar);
//           scale: tamaño elegido en Decorar (× el base, de FURNITURE_SCALE.min a .max); sin él, 1
//   seen    los que Mito ya comentó al colocarlos la primera vez
// Una partida sin el campo no tiene muebles; la alfombra de regalo se entrega al entrar a la Casa (grantGift).
// Solo cuentan los muebles del catálogo (content/furniture.js), y la zona siempre es la del catálogo.

import { FURNITURE, FURNITURE_SCALE, findFurniture } from '../content/furniture.js';
import { state, commit, num } from './core.js';

const unit = n => Math.min(1, Math.max(0, num(n, .5)));
const known = list => Array.isArray(list) ? FURNITURE.map(f => f.id).filter(id => list.includes(id)) : [];

// El tamaño, acotado y con 2 decimales; el 1 no se guarda (es el de siempre).
const cleanScale = s => Math.round(Math.min(FURNITURE_SCALE.max, Math.max(FURNITURE_SCALE.min, num(s, 1))) * 100) / 100;

function cleanSpot(item, p){
  const scale = cleanScale(p.scale);
  return { zona: item.zone, u: unit(p.u), v: unit(p.v), ...(p.flip === true && item.flip ? { flip: true } : {}), ...(scale !== 1 ? { scale } : {}) };
}

// Deja un `decor` guardado (o importado) en un estado válido.
export function cleanDecor(d){
  const out = { owned: [], placed: {}, seen: [] };
  if(!d || typeof d !== 'object') return out;
  out.owned = known(d.owned);
  const placed = d.placed && typeof d.placed === 'object' ? d.placed : {};
  out.owned.forEach(id=>{
    const p = placed[id];
    if(p && typeof p === 'object') out.placed[id] = cleanSpot(findFurniture(id), p);
  });
  out.seen = known(d.seen).filter(id => out.owned.includes(id));
  return out;
}

export function getDecor(){
  return cleanDecor(state.decor);
}

// Lo que se guarda: sin `seen` si está vacío, y sin el campo entero si no tienes muebles.
const shape = d => ({ owned: d.owned, placed: d.placed, ...(d.seen.length ? { seen: d.seen } : {}) });
function store(d){
  if(d.owned.length) state.decor = shape(d);
  else delete state.decor;
}

// Comprar: va al inventario. false si no existe, es un regalo, ya lo tienes o no te alcanza.
export function buyFurniture(id){
  const item = findFurniture(id);
  const d = getDecor();
  if(!item || item.cost <= 0 || d.owned.includes(id) || state.chispas < item.cost) return false;
  state.chispas -= item.cost;
  d.owned = known([...d.owned, id]);
  store(d);
  commit();
  return true;
}

// Poner (o mover) un mueble que tienes. Devuelve { ok, first }: first = es la primera vez que se coloca (Mito lo comenta).
export function placeFurniture(id, spot){
  const item = findFurniture(id);
  const d = getDecor();
  if(!item || !d.owned.includes(id) || !spot || typeof spot !== 'object') return { ok: false, first: false };
  const prev = d.placed[id];
  // lo que no venga en `spot` (posición, volteo, tamaño) se queda como estaba
  d.placed[id] = cleanSpot(item, { ...prev, ...spot });
  const first = !d.seen.includes(id);
  if(first) d.seen = known([...d.seen, id]);
  store(d);
  commit();
  return { ok: true, first };
}

// Voltear de izquierda a derecha (solo los que se pueden). Devuelve si quedó volteado.
export function flipFurniture(id){
  const item = findFurniture(id);
  const d = getDecor();
  const p = d.placed[id];
  if(!item || !item.flip || !p) return false;
  if(p.flip) delete p.flip; else p.flip = true;
  store(d);
  commit();
  return !!p.flip;
}

// Guardar: sale del cuarto y vuelve al inventario (no se pierde ni se reembolsa).
export function storeFurniture(id){
  const d = getDecor();
  if(!d.placed[id]) return false;
  delete d.placed[id];
  store(d);
  commit();
  return true;
}

// El regalo (la alfombra): se entrega una vez, ya colocada en `spot`. Devuelve los ids entregados ([] si ya los tenías).
export function grantGift(spot){
  const d = getDecor();
  const fresh = FURNITURE.filter(f => f.gift && !d.owned.includes(f.id));
  if(!fresh.length) return [];
  fresh.forEach(f=>{ d.placed[f.id] = cleanSpot(f, spot || {}); d.seen.push(f.id); });
  d.owned = known([...d.owned, ...fresh.map(f => f.id)]);
  d.seen = known(d.seen);
  store(d);
  commit();
  return fresh.map(f => f.id);
}

// Para partidas importadas: el campo es opcional; si viene, se limpia (y si no queda ningún mueble, no se guarda).
export function parseDecor(d){
  if(d == null) return undefined;
  const clean = cleanDecor(d);
  return clean.owned.length ? shape(clean) : undefined;
}
