// Necesidades de Mito en la Casa: hambre, limpieza, energía y ánimo, de 0 a 100.
//
// Son suaves: nunca afectan el estudio ni nada fuera de la Casa, y Mito nunca se enferma ni se va.
// Se guardan en el campo opcional `house` (una partida sin él empieza con todo lleno):
//   { v: 3, at: ms en que se calcularon, needs: { hunger, clean, energy, mood }, sleepSince: ms o null, mito? }
// `mito` (Fase 5, opcional) es dónde está Mito; sin él, en su lugar de siempre en el Cuarto (ver getMito).
// `v` marca los datos de la Fase 3 en adelante (desde entonces el hambre baja; ver current()).
// No hay temporizadores que escriban: los valores de "ahora" se calculan con la hora (needsAt), también si la
// app estuvo cerrada, y solo se guarda al hacer algo (un cariño, dormir, despertar, bañar, comer).

import { state, commit, num } from './core.js';
import { DEFAULT_ROOM, findRoom } from '../content/rooms.js';
import { findFurniture } from '../content/furniture.js';
import { getDecor, spotRoom } from './decor.js';

const HOUR = 3600e3;
const KEYS = ['hunger', 'clean', 'energy', 'mood'];
const VERSION = 3;

// Todo lo ajustable, en un solo lugar.
export const NEEDS = {
  max: 100,
  floor: 20,                      // con el tiempo no bajan de aquí
  low: 45,                        // por debajo, se nota en la cara y en lo que dice
  decayPerHour: { hunger: 50 / 24, clean: 50 / 24, energy: 50 / 24, mood: 50 / 24 },   // de 100 a 50 en ~1 día
  sleepFillPerHour: 100,          // durmiendo, la energía va de 0 a 100 en ~1 hora
  minNapMinutes: 10,              // aunque ya tenga la energía llena, si se duerme, duerme al menos esto
  sleepBelow: 80,                 // con más energía que esto no tiene sueño: "Dormir" no lo duerme
  fullAbove: 90,                  // con esta hambre o más está lleno: no come (y la comida no se gasta)
  moodPerCare: 4,                 // cada cariño
  moodCapPerMinute: 12,           // y no más que esto por minuto
  cleanPerWidth: 10,              // limpieza por cada ancho de Mito que se frota con la esponja (de 20 a 100: ~8 anchos)
};

const clamp = v => Math.min(NEEDS.max, Math.max(0, v));
const full = () => ({ hunger: NEEDS.max, clean: NEEDS.max, energy: NEEDS.max, mood: NEEDS.max });
// Con el tiempo baja, pero nunca por debajo del piso (y si ya estaba debajo, no sube sola).
const decay = (v, perHour, hours) => v <= NEEDS.floor ? v : Math.max(NEEDS.floor, v - perHour * hours);

// Deja un `house` guardado (o importado) en un estado válido. Sin datos, todo lleno.
export function cleanHouse(h, now = Date.now()){
  if(!h || typeof h !== 'object') return { at: now, needs: full(), sleepSince: null };
  const needs = full();
  if(h.needs && typeof h.needs === 'object') KEYS.forEach(k=>{ if(Number.isFinite(h.needs[k])) needs[k] = clamp(h.needs[k]); });
  const at = Number.isFinite(h.at) && h.at <= now ? h.at : now;   // una hora futura o rara cuenta como "ahora"
  const sleepSince = Number.isFinite(h.sleepSince) && h.sleepSince <= now ? Math.min(h.sleepSince, now) : null;
  const mito = cleanMito(h.mito);
  return { ...(h.v === VERSION ? { v: VERSION } : {}), at, needs, sleepSince, ...(mito ? { mito } : {}) };
}

// Cómo están las necesidades en `now`, a partir de lo guardado (lógica pura).
// Durmiendo: la energía sube, el ánimo no baja y lo demás baja igual; al llenarse la energía despierta solo,
// en la hora exacta en que se llenó (aunque la app estuviera cerrada), y desde ahí todo baja normal. Si se durmió
// ya lleno, hace al menos una siesta corta (minNapMinutes).
// hungerFrozen: el hambre no baja en ese tramo (para los datos de antes de la Fase 3, ver current()).
export function needsAt(saved, now = Date.now(), { hungerFrozen = false } = {}){
  const h = cleanHouse(saved, now);
  let t = Math.max(0, now - h.at) / HOUR;
  const n = { ...h.needs };
  let sleepSince = h.sleepSince;
  const rate = hungerFrozen ? { ...NEEDS.decayPerHour, hunger: 0 } : NEEDS.decayPerHour;
  if(sleepSince !== null){
    const toFull = Math.max(0, NEEDS.max - n.energy) / NEEDS.sleepFillPerHour;
    const napLeft = Math.max(0, sleepSince + NEEDS.minNapMinutes * 60e3 - h.at) / HOUR;
    const slept = Math.min(t, Math.max(toFull, napLeft));
    n.energy = clamp(n.energy + NEEDS.sleepFillPerHour * slept);
    n.clean = decay(n.clean, rate.clean, slept);
    n.hunger = decay(n.hunger, rate.hunger, slept);
    t -= slept;
    if(slept >= Math.max(toFull, napLeft)){ sleepSince = null; n.energy = NEEDS.max; }   // ya durmió lo que le tocaba
  }
  if(sleepSince === null && t > 0) KEYS.forEach(k=>{ n[k] = decay(n[k], rate[k], t); });
  return { v: VERSION, at: now, needs: n, sleepSince, ...(h.mito ? { mito: h.mito } : {}) };
}

// La necesidad baja más importante, por prioridad: sueño > hambre > limpieza > ánimo. null si está todo bien.
export function topNeed(needs){
  const order = [['energy', 'sleepy'], ['hunger', 'hungry'], ['clean', 'dirty'], ['mood', 'sad']];
  const hit = order.find(([k]) => needs[k] < NEEDS.low);
  return hit ? hit[1] : null;
}

/* ---------- con la partida guardada ---------- */

// Antes de la Fase 3 el hambre no bajaba. Una partida con datos de entonces (sin `v`) no debe encontrarse a Mito
// hambriento de golpe: se pasa a la versión nueva una sola vez, con el hambre quieta hasta ahora, y desde ahí baja.
function current(now = Date.now()){
  const raw = state.house;
  if(raw && typeof raw === 'object' && raw.v !== VERSION){
    state.house = needsAt(raw, now, { hungerFrozen: true });
    commit();
  }
  return needsAt(state.house, now);
}
function save(h){ state.house = h; commit(); }

export function getNeeds(now = Date.now()){
  const h = current(now);
  return { ...h.needs, asleep: h.sleepSince !== null, sleepSince: h.sleepSince };
}

// Cariños: suben el ánimo, con un tope por minuto (para que no se pueda abusar). No se guarda el tope: es por sesión.
let window_ = { start: 0, gained: 0 };
export function careMood(now = Date.now()){
  if(now - window_.start >= 60e3) window_ = { start: now, gained: 0 };
  const room = NEEDS.moodCapPerMinute - window_.gained;
  if(room <= 0) return 0;
  const h = current(now);
  const add = Math.min(NEEDS.moodPerCare, room, NEEDS.max - h.needs.mood);
  if(add <= 0) return 0;
  window_.gained += add;
  h.needs.mood += add;
  save(h);
  return add;
}

export function startSleep(now = Date.now()){
  const h = current(now);
  if(h.sleepSince === null){ h.sleepSince = now; save(h); }
}

export function wakeUp(now = Date.now()){
  const h = current(now);
  if(h.sleepSince !== null){ h.sleepSince = null; save(h); }
}

// Bañar: suma limpieza (lo que frota la esponja). Devuelve la limpieza nueva.
export function addClean(amount, now = Date.now()){
  const h = current(now);
  h.needs.clean = clamp(h.needs.clean + Math.max(0, num(amount)));
  save(h);
  return h.needs.clean;
}

// Comer: ¿está lleno? (con NEEDS.fullAbove de hambre o más no come). La comida la gasta state/pantry.js.
export const isFull = (now = Date.now()) => current(now).needs.hunger >= NEEDS.fullAbove;

// Sube el hambre (lo que llena un alimento). Devuelve el hambre nueva.
export function feed(amount, now = Date.now()){
  const h = current(now);
  h.needs.hunger = clamp(h.needs.hunger + Math.max(0, num(amount)));
  save(h);
  return h.needs.hunger;
}

/* ---------- dónde está Mito (Fase 5) ----------
   Guardado en house.mito, de tres formas:
     { room, u, v }    en el piso de ese cuarto (u, v como los muebles del piso: furniture-layout.js)
     { room, on, s }   sobre un mueble que tiene superficie (seat); s = dónde, de 0 a 1 a lo largo de ella
     { room }          en el lugar de siempre de ese cuarto (sin el campo: en el del Cuarto)
   Se limpia al leer: un cuarto que no existe es el Cuarto; un mueble sin superficie, o que ya no está en ese cuarto
   (guardado, movido a otro), deja a Mito en el lugar de siempre del cuarto. */
const unit = n => Math.min(1, Math.max(0, num(n, .5)));

// Solo la forma (sin mirar los muebles colocados). null = el lugar de siempre en el Cuarto.
export function cleanMito(m){
  if(!m || typeof m !== 'object') return null;
  const room = findRoom(m.room) ? m.room : DEFAULT_ROOM;
  if(typeof m.on === 'string' && findFurniture(m.on)?.seat) return { room, on: m.on, s: unit(m.s) };
  if(Number.isFinite(m.u) && Number.isFinite(m.v)) return { room, u: unit(m.u), v: unit(m.v) };
  return room === DEFAULT_ROOM ? null : { room };
}

// Dónde está ahora: { room, u, v } | { room, on, s } | { room, home: true }.
export function getMito(){
  const m = cleanMito(state.house?.mito);
  if(!m) return { room: DEFAULT_ROOM, home: true };
  if(m.on){
    const p = getDecor().placed[m.on];
    if(!p || spotRoom(p) !== m.room) return { room: m.room, home: true };
  }
  return m.on || 'u' in m ? m : { room: m.room, home: true };
}

// Guardarlo (al soltarlo, al cambiar de cuarto, al dormir en la cama…). Devuelve la posición limpia.
export function setMito(pos, now = Date.now()){
  const m = cleanMito(pos);
  const h = current(now);
  if(m) h.mito = m; else delete h.mito;
  save(h);
  return getMito();
}

// Para partidas importadas: el campo es opcional; si viene, se limpia.
export const parseHouse = (h, now = Date.now()) => h == null ? undefined : cleanHouse(h, now);
