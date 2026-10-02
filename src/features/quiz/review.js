// Repaso inteligente: decide qué preguntas entran en una ronda de repaso.
//
// Prioriza los fallos pendientes, luego los temas débiles por porcentaje de aciertos,
// y rellena con el resto del banco barajado.

import { COURSES } from '../../content/courses.js';
import { getMistakes, getHistory } from '../../state/store.js';
import { shuffle } from '../../core/utils.js';
import { activeCourse } from '../course/course.js';

const SEP = '::';
const DEFAULT_COURSE = COURSES[0].id;

export const mistakeKey = (courseId, q) => courseId + SEP + q;

// Fallos de la materia activa. Las claves viejas (sin prefijo de materia)
// pertenecen a la primera materia, que es de donde venían.
export function activeMistakeEntries(){
  const course = activeCourse();
  const prefix = course.id + SEP;
  return Object.entries(getMistakes()).filter(([k])=>
    k.startsWith(prefix) || (!k.includes(SEP) && course.id === DEFAULT_COURSE)
  );
}

export function findQuestionByKey(key){
  if(key.includes(SEP)){
    const i = key.indexOf(SEP);
    const cid = key.slice(0, i);
    const txt = key.slice(i + 2);
    return COURSES.find(x=>x.id === cid)?.questions.find(x=>x.q === txt) ?? null;
  }
  for(const c of COURSES){
    const found = c.questions.find(x=>x.q === key);
    if(found) return found;
  }
  return null;
}

// Topics ordered worst-first, only those with enough answers to be meaningful.
export function weakTopics(minAnswers = 3){
  const course = activeCourse();
  const agg = {};
  getHistory().forEach(h=>{
    if(h.courseId && h.courseId !== course.id) return;
    if(!h.courseId && course.id !== DEFAULT_COURSE) return;
    Object.entries(h.cats || {}).forEach(([cat, s])=>{
      agg[cat] = agg[cat] || { r:0, t:0 };
      // catStats guarda { right, total }; se acepta también { r, t } por compatibilidad
      agg[cat].r += s.right ?? s.r ?? 0;
      agg[cat].t += s.total ?? s.t ?? 0;
    });
  });
  return Object.entries(agg)
    .map(([cat, s])=>({ cat, r:s.r, t:s.t, pct: s.t ? s.r/s.t : 1 }))
    .filter(x=>x.t >= minAnswers)
    .sort((a,b)=>a.pct-b.pct);
}

export function buildReviewPool(){
  const qs = activeCourse().questions;
  const byQ = new Map(qs.map(q=>[q.q, q]));

  const pool = [];
  const pushQ = qq=>{ if(qq && !pool.includes(qq)) pool.push(qq); };

  activeMistakeEntries().forEach(([k])=>{
    const q = findQuestionByKey(k);
    if(q) pushQ(byQ.get(q.q) || q);
  });
  weakTopics(2).forEach(t=>{
    qs.filter(q=>q.cat === t.cat).forEach(q=>pushQ(q));
  });

  const rest = shuffle(qs.filter(q=>!pool.includes(q)));
  const final = shuffle(pool).concat(rest);
  const n = Math.min(Math.max(pool.length * 2, 4), qs.length);
  return final.slice(0, n);
}