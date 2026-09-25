const KEY = 'chispa-atp-v4';
const PASSING_BONUS = 50;
const HISTORY_LIMIT = 60;
const MISTAKES_LIMIT = 80;

function defaultState(){
  return {
    chispas: 0,
    owned: {},
    equipped: { color:'c-mint', ropa:'r-none', accesorio:'ac-none', aura:'a-none', pet:'p-none' },
    history: [],
    mistakes: {},
    streak: 0,
    lastDay: null,
    theme: 'light',
    course: 'atp',
  };
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
        equipped: { ...defaultState().equipped, ...s.equipped },
      };
    }
  }catch(e){ /* localStorage no disponible */ }
  return defaultState();
}

const state = load();
let listeners = [];

function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){ /* silencio */ }
}
function emit(){
  listeners.forEach(fn=>fn(state));
}

export function onChange(fn){
  listeners.push(fn);
}

export function getChispas(){
  return state.chispas;
}

export function addChispas(n){
  state.chispas += n;
  save();
  emit();
  return state.chispas;
}

export function spendChispas(n){
  if(state.chispas < n) return false;
  state.chispas -= n;
  save();
  emit();
  return true;
}

export function owns(id){
  return !!state.owned[id];
}

export function ownItem(id){
  state.owned[id] = true;
  save();
  emit();
}

export function getEquipped(){
  return { ...state.equipped };
}

export function equipCategory(cat, id){
  state.equipped[cat] = id;
  save();
  emit();
}

export function buyAndEquip(cat, id, cost){
  if(!spendChispas(cost)) return false;
  ownItem(id);
  equipCategory(cat, id);
  return true;
}

/* =================== PROGRESO =================== */
function dayStr(d = new Date()){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}

function dayBefore(iso){
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate()-1);
  return dayStr(d);
}

export function recordQuizResult({score, right, total, pct, cats, courseId}){
  const today = dayStr();
  state.history.push({ t:Date.now(), score, right, total, pct, cats, courseId });
  if(state.history.length > HISTORY_LIMIT) state.history = state.history.slice(-HISTORY_LIMIT);

  if(state.lastDay === today){
    // misma racha del día: no cambia
  } else if(dayBefore(state.lastDay) === today){
    state.streak++;
  } else {
    state.streak = 1;
  }
  state.lastDay = today;
  save();
  emit();
  return state.streak;
}

export function recordAnswer(courseId, q, correct){
  const key = `${courseId}::${q}`;
  const m = state.mistakes[key] || { wrong:0, right:0 };
  if(correct) m.right++; else m.wrong++;
  // solo cuenta como "fallo pendiente" si hay errores y aún no los dominas
  // (se libera cuando aciertas al menos el doble de veces que fallas)
  if(m.wrong > 0 && m.right < m.wrong*2){
    state.mistakes[key] = { wrong:m.wrong, right:m.right };
  } else {
    delete state.mistakes[key];
  }
  const keys = Object.keys(state.mistakes);
  if(keys.length > MISTAKES_LIMIT){
    const excess = keys.length - MISTAKES_LIMIT;
    keys.slice(0, excess).forEach(k=>delete state.mistakes[k]);
  }
  save();
  emit();
}

export function getMistakes(){
  return { ...state.mistakes };
}

export function getHistory(){
  return state.history;
}

export function getStreak(){
  return state.streak;
}

export function clearMistakes(){
  state.mistakes = {};
  save();
  emit();
}

/* =================== TEMA =================== */
export function getTheme(){
  return state.theme;
}

export function setTheme(t){
  if(t !== 'dark' && t !== 'light') t = 'light';
  state.theme = t;
  save();
  emit();
  return t;
}

/* =================== MATERIA ACTIVA =================== */
export function getCourse(){
  return state.course;
}

export function setCourse(id){
  if(typeof id !== 'string') return state.course;
  state.course = id;
  save();
  emit();
  return state.course;
}

/* =================== RESPALDO / IMPORT-EXPORT =================== */
export function exportSave(){
  return JSON.stringify(state, null, 2);
}

export function importSave(json){
  const s = JSON.parse(json);
  const merged = {
    ...defaultState(),
    ...s,
    history: Array.isArray(s.history) ? s.history : [],
    mistakes: s.mistakes && typeof s.mistakes === 'object' ? s.mistakes : {},
    equipped: { ...defaultState().equipped, ...s.equipped },
  };
  if(typeof s.chispas !== 'number') throw new Error('Progreso inválido');
  Object.assign(state, merged);
  save();
  emit();
}

export function resetAll(){
  const prevTheme = state.theme;
  Object.assign(state, defaultState());
  state.theme = prevTheme;
  save();
  emit();
}

export { PASSING_BONUS };