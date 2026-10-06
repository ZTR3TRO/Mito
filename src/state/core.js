// Núcleo del estado: el objeto guardado, su carga desde localStorage y el guardado.
//
// Los módulos de dominio (economy, inventory, progress, preferences, backup) importan
// de aquí. La app nunca importa este fichero directamente: usa src/state/store.js.

import { WARDROBE, categoryOf } from '../content/wardrobe.js';
import * as bus from '../core/bus.js';

// Clave de la partida guardada. Privada a propósito: nadie fuera de state/ debe
// leer ni escribir el localStorage, se escribe por commit() y se borra por resetAll().
const KEY = 'chispa-atp-v4';

export const HISTORY_LIMIT = 60;
export const MISTAKES_LIMIT = 80;

export function defaultState(){
  return {
    chispas: 0,
    owned: {},
    petNames: {},
    claimedEggs: {},
    equipped: { color:'c-mint', ropa:'r-none', accesorio:'ac-none', sombrero:'s-none', aura:'a-none', pet:'p-none' },
    history: [],
    mistakes: {},
    streak: 0,
    lastDay: null,
    theme: 'light',
    course: 'atp',
  };
}

// Reubica prendas guardadas en versiones anteriores (p. ej. la corona ahora es un sombrero)
export function fixEquipped(eq){
  const out = {};
  WARDROBE.forEach(c=>{ out[c.id] = c.items[0].id; });
  Object.values(eq || {}).forEach(id=>{
    const cat = categoryOf(id);
    if(cat && id !== WARDROBE.find(c=>c.id===cat).items[0].id) out[cat] = id;
  });
  return out;
}

export function cleanPetNames(names){
  const out = {};
  if(!names || typeof names !== 'object') return out;
  Object.keys(names).forEach(id=>{
    if(categoryOf(id) !== 'pet' || id === 'p-none') return;
    const name = String(names[id] || '').trim().slice(0, 20);
    if(name) out[id] = name;
  });
  return out;
}

export function cleanClaimedEggs(claimed){
  const out = {};
  if(claimed && typeof claimed === 'object' && claimed.spark50 === true) out.spark50 = true;
  return out;
}

function load(){
  try{
    const s = JSON.parse(localStorage.getItem(KEY));
    if(s && typeof s.chispas === 'number' && s.equipped){
      return {
        ...defaultState(),
        ...s,
        history: Array.isArray(s.history) ? s.history : [],
        mistakes: s.mistakes && typeof s.mistakes === 'object' ? s.mistakes : {},
        petNames: cleanPetNames(s.petNames),
        claimedEggs: cleanClaimedEggs(s.claimedEggs),
        equipped: fixEquipped(s.equipped),
      };
    }
  }catch(e){ /* localStorage no disponible */ }
  return defaultState();
}

// El estado se inicializa al importar este módulo. Es un objeto único que los
// dominios mutan en sitio: resetAll/importSave usan Object.assign para no cambiar
// la identidad, así que las referencias capturadas siguen siendo válidas.
export const state = load();

function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){ /* silencio */ }
}

// Todo cambio pasa por aquí: se persiste y se avisa a quien esté escuchando.
// Quien reacciona a un cambio se suscribe al bus, no al estado: así el estado no
// necesita saber quién lo observa.
export function commit(){
  save();
  bus.emit('state:changed', state);
}

export const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
