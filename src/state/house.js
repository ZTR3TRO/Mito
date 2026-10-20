// Necesidades de Mito en la Casa: hambre, limpieza, energía y ánimo, de 0 a 100.
//
// Son suaves: nunca afectan el estudio ni nada fuera de la Casa, y Mito nunca se enferma ni se va.
// Se guardan en el campo opcional `house` (una partida sin él empieza con todo lleno):
//   { at: ms en que se calcularon, needs: { hunger, clean, energy, mood }, sleepSince: ms o null }
// No hay temporizadores que escriban: los valores de "ahora" se calculan con la hora (needsAt), también si la
// app estuvo cerrada, y solo se guarda al hacer algo (un cariño, dormir, despertar, bañar).

import { state, commit, num } from './core.js';

const HOUR = 3600e3;
const KEYS = ['hunger', 'clean', 'energy', 'mood'];

// Todo lo ajustable, en un solo lugar.
export const NEEDS = {
  max: 100,
  floor: 20,                      // con el tiempo no bajan de aquí
  low: 45,                        // por debajo, se nota en la cara y en lo que dice
  decayPerHour: { hunger: 0, clean: 50 / 24, energy: 50 / 24, mood: 50 / 24 },   // de 100 a 50 en ~1 día (el hambre, desde la Fase 3)
  sleepFillPerHour: 100,          // durmiendo, la energía va de 0 a 100 en ~1 hora
  minNapMinutes: 10,              // aunque ya tenga la energía llena, si se duerme, duerme al menos esto
  sleepBelow: 80,                 // con más energía que esto no tiene sueño: "Dormir" no lo duerme
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
  return { at, needs, sleepSince };
}

// Cómo están las necesidades en `now`, a partir de lo guardado (lógica pura).
// Durmiendo: la energía sube, el ánimo no baja y lo demás baja igual; al llenarse la energía despierta solo,
// en la hora exacta en que se llenó (aunque la app estuviera cerrada), y desde ahí todo baja normal. Si se durmió
// ya lleno, hace al menos una siesta corta (minNapMinutes).
export function needsAt(saved, now = Date.now()){
  const h = cleanHouse(saved, now);
  let t = Math.max(0, now - h.at) / HOUR;
  const n = { ...h.needs };
  let sleepSince = h.sleepSince;
  const rate = NEEDS.decayPerHour;
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
  return { at: now, needs: n, sleepSince };
}

// La necesidad baja más importante, por prioridad: sueño > hambre > limpieza > ánimo. null si está todo bien.
export function topNeed(needs){
  const order = [['energy', 'sleepy'], ['hunger', 'hungry'], ['clean', 'dirty'], ['mood', 'sad']];
  const hit = order.find(([k]) => needs[k] < NEEDS.low);
  return hit ? hit[1] : null;
}

/* ---------- con la partida guardada ---------- */

const current = (now = Date.now()) => needsAt(state.house, now);
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

// Para partidas importadas: el campo es opcional; si viene, se limpia.
export const parseHouse = (h, now = Date.now()) => h == null ? undefined : cleanHouse(h, now);
