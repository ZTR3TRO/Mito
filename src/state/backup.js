// Respaldo: exportar, importar y reiniciar el progreso.
//
// Importar valida campo por campo: un archivo editado a mano no debe poder colar
// tipos raros ni tirar la partida.

import {
  state, commit, defaultState, fixEquipped, cleanPetNames, cleanPetLooks, cleanClaimedEggs,
  HISTORY_LIMIT, MISTAKES_LIMIT, num,
} from './core.js';
import { parseHouse } from './house.js';

export function exportSave(){
  return JSON.stringify(state, null, 2);
}

function cleanHistory(list){
  if(!Array.isArray(list)) return [];
  return list.slice(-HISTORY_LIMIT).filter(h=>h && typeof h === 'object').map(h=>{
    const cats = {};
    if(h.cats && typeof h.cats === 'object'){
      Object.keys(h.cats).forEach(k=>{
        const c = h.cats[k] || {};
        cats[k] = { right:num(c.right ?? c.r), total:num(c.total ?? c.t) };
      });
    }
    const entry = {
      t:num(h.t), score:num(h.score), right:num(h.right), total:num(h.total),
      pct:Math.min(100, Math.max(0, num(h.pct))), cats,
      courseId: typeof h.courseId === 'string' ? h.courseId : undefined,
    };
    // campo opcional: solo si venía con un valor válido (los respaldos viejos no lo traen)
    if(Number.isInteger(h.size) && h.size > 0) entry.size = h.size;
    return entry;
  });
}

function cleanMistakes(m){
  const out = {};
  if(m && typeof m === 'object'){
    Object.keys(m).slice(0, MISTAKES_LIMIT).forEach(k=>{
      const e = m[k] || {};
      out[k] = { wrong:num(e.wrong), right:num(e.right) };
      // opcionales: los respaldos viejos no los traen
      if(Number.isFinite(e.ok) && e.ok >= 0) out[k].ok = Math.floor(e.ok);
      if(typeof e.pick === 'string' && e.pick) out[k].pick = e.pick.slice(0, 300);
    });
  }
  return out;
}

const isObject = v => !!v && typeof v === 'object' && !Array.isArray(v);

// Valida un respaldo y devuelve el estado limpio, sin tocar nada. Lanza un Error con un mensaje
// pensado para mostrarse tal cual si el archivo no es un progreso válido.
export function parseSave(json){
  let s;
  try{ s = JSON.parse(json); }
  catch(e){ throw new Error('El archivo no es un JSON válido.'); }
  if(!isObject(s)) throw new Error('El archivo no tiene el formato de un progreso de Mito.');
  if(typeof s.chispas !== 'number' || !Number.isFinite(s.chispas)) throw new Error('Al archivo le faltan las chispas, no parece un progreso de Mito.');
  if(!isObject(s.equipped)) throw new Error('Al archivo le falta lo equipado, no parece un progreso de Mito.');
  [['history', Array.isArray], ['owned', isObject], ['mistakes', isObject]].forEach(([field, ok])=>{
    if(s[field] != null && !ok(s[field])) throw new Error(`El campo "${field}" del archivo está dañado.`);
  });
  const d = defaultState();
  // solo se copian campos conocidos, con su tipo validado
  return {
    chispas: Math.max(0, num(s.chispas)),
    owned: s.owned ? Object.fromEntries(Object.keys(s.owned).map(k=>[k, true])) : {},
    petNames: cleanPetNames(s.petNames),
    petLooks: cleanPetLooks(s.petLooks),
    claimedEggs: cleanClaimedEggs(s.claimedEggs),
    equipped: fixEquipped(s.equipped),
    history: cleanHistory(s.history),
    mistakes: cleanMistakes(s.mistakes),
    streak: Math.max(0, Math.floor(num(s.streak))),
    lastDay: typeof s.lastDay === 'string' ? s.lastDay : null,
    theme: s.theme === 'dark' ? 'dark' : 'light',
    course: typeof s.course === 'string' ? s.course : d.course,
    // opcional: si el archivo no lo trae, se queda como estaba
    ...(Number.isFinite(s.houseHint) ? { houseHint: Math.max(0, Math.floor(s.houseHint)) } : {}),
    // opcional: las necesidades de Mito en la Casa, validadas (sin el campo, todo empieza lleno)
    ...(s.house != null ? { house: parseHouse(s.house) } : {}),
  };
}

export function importSave(json){
  const clean = parseSave(json);
  // Object.assign mantiene la identidad de `state`: quien la capturó la sigue viendo.
  Object.assign(state, clean);
  commit();
}

export function resetAll(){
  const prevTheme = state.theme;
  Object.assign(state, defaultState());
  delete state.houseHint;   // empezar de cero también vuelve a mostrar la pista de la Casa
  delete state.house;       // y deja a Mito con todas sus necesidades llenas
  state.theme = prevTheme;
  commit();
}
