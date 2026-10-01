import { WARDROBE, SECRET_IDS, categoryOf, findItem, isSeasonalOpen } from './wardrobe.js';

// Reubica prendas guardadas en versiones anteriores (p. ej. la corona ahora es un sombrero)
function fixEquipped(eq){
  const out = {};
  WARDROBE.forEach(c=>{ out[c.id] = c.items[0].id; });
  Object.values(eq || {}).forEach(id=>{
    const cat = categoryOf(id);
    if(cat && id !== WARDROBE.find(c=>c.id===cat).items[0].id) out[cat] = id;
  });
  return out;
}
const KEY = 'chispa-atp-v4';
const PASSING_BONUS = 50;
const HISTORY_LIMIT = 60;
const MISTAKES_LIMIT = 80;

function defaultState(){
  return {
    chispas: 0,
    owned: {},
    equipped: { color:'c-mint', ropa:'r-none', accesorio:'ac-none', sombrero:'s-none', aura:'a-none', pet:'p-none' },
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
        equipped: fixEquipped(s.equipped),
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
  const item = findItem(cat, id);
  if(!item || ((item.cost > 0 || item.secret) && !owns(id))) return false;
  state.equipped[cat] = id;
  save();
  emit();
  return true;
}

// Easter egg: entrega los premios secretos. Devuelve los ids recién desbloqueados ([] si ya los tenías).
export function unlockSecrets(){
  const fresh = SECRET_IDS.filter(id => !state.owned[id]);
  if(!fresh.length) return [];
  fresh.forEach(id => { state.owned[id] = true; });
  save();
  emit();
  return fresh;
}

export function secretsUnlocked(){
  return SECRET_IDS.every(id => state.owned[id]);
}

export function buyAndEquip(cat, id){
  const item = findItem(cat, id);
  if(!item || item.secret || item.cost <= 0 || owns(id) || state.chispas < item.cost) return false;
  if(item.seasonal && !isSeasonalOpen()) return false;
  state.chispas -= item.cost;
  state.owned[id] = true;
  state.equipped[cat] = id;
  save();
  emit();
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
  } else if(state.lastDay && dayBefore(today) === state.lastDay){
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
  // La racha solo sigue viva si jugaste hoy o ayer; si no, ya se rompió
  if(!state.lastDay) return 0;
  const today = dayStr();
  return (state.lastDay === today || state.lastDay === dayBefore(today)) ? state.streak : 0;
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

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

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
    equipped: fixEquipped(s.equipped),
    history: cleanHistory(s.history),
    mistakes: cleanMistakes(s.mistakes),
    streak: Math.max(0, Math.floor(num(s.streak))),
    lastDay: typeof s.lastDay === 'string' ? s.lastDay : null,
    theme: s.theme === 'dark' ? 'dark' : 'light',
    course: typeof s.course === 'string' ? s.course : d.course,
  };
  Object.assign(state, clean);
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