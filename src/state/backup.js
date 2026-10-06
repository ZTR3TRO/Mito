// Respaldo: exportar, importar y reiniciar el progreso.
//
// Importar valida campo por campo: un archivo editado a mano no debe poder colar
// tipos raros ni tirar la partida.

import {
  state, commit, defaultState, fixEquipped, cleanPetNames,
  HISTORY_LIMIT, MISTAKES_LIMIT, num,
} from './core.js';

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
    return {
      t:num(h.t), score:num(h.score), right:num(h.right), total:num(h.total),
      pct:Math.min(100, Math.max(0, num(h.pct))), cats,
      courseId: typeof h.courseId === 'string' ? h.courseId : undefined,
    };
  });
}

function cleanMistakes(m){
  const out = {};
  if(m && typeof m === 'object'){
    Object.keys(m).slice(0, MISTAKES_LIMIT).forEach(k=>{
      out[k] = { wrong:num(m[k] && m[k].wrong), right:num(m[k] && m[k].right) };
    });
  }
  return out;
}

export function importSave(json){
  const s = JSON.parse(json);
  if(!s || typeof s !== 'object' || typeof s.chispas !== 'number') throw new Error('Progreso inválido');
  const d = defaultState();
  // solo se copian campos conocidos, con su tipo validado
  const clean = {
    chispas: Math.max(0, num(s.chispas)),
    owned: s.owned && typeof s.owned === 'object' ? Object.fromEntries(Object.keys(s.owned).map(k=>[k, true])) : {},
    petNames: cleanPetNames(s.petNames),
    equipped: fixEquipped(s.equipped),
    history: cleanHistory(s.history),
    mistakes: cleanMistakes(s.mistakes),
    streak: Math.max(0, Math.floor(num(s.streak))),
    lastDay: typeof s.lastDay === 'string' ? s.lastDay : null,
    theme: s.theme === 'dark' ? 'dark' : 'light',
    course: typeof s.course === 'string' ? s.course : d.course,
  };
  // Object.assign mantiene la identidad de `state`: quien la capturó la sigue viendo.
  Object.assign(state, clean);
  commit();
}

export function resetAll(){
  const prevTheme = state.theme;
  Object.assign(state, defaultState());
  state.theme = prevTheme;
  commit();
}
