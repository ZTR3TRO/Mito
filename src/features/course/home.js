// Portada: textos de resumen, títulos y los elementos que solo existen en ATP.

import { byId, setText, $$ } from '../../core/dom.js';
import { activeCourse } from './course.js';

// Tamaño del título del hero según lo largo que sea el nombre de la materia: 's' (normal), 'm' o 'l'.
// Con nombres largos el título llegaba a 5 líneas; con 'm' y 'l' además se ensancha la columna del texto (style.css).
export function heroTitleSize(name){
  if(name.length <= 17) return 's';
  return name.length <= 30 ? 'm' : 'l';
}

export function renderHome(){
  const course = activeCourse();
  const notes = course.notes || [];
  const nItems = notes.reduce((t, n)=>t + n.items.length, 0);
  const nKeys = (course.keypoints || []).length;

  const a = byId('homeNotesText');
  const k = byId('homeKeysText');
  if(a) a.textContent = notes.length
    ? `${notes.length} temas con ${nItems} notas expandibles: ${notes.map(n=>n.label.replace(/<[^>]*>/g,'')).join(', ')}.`
    : 'Aún no hay apuntes para esta materia.';
  if(k) k.textContent = nKeys
    ? `${nKeys} ideas que casi seguro te preguntan en el examen, condensadas en tarjetas de repaso relámpago.`
    : 'Aún no hay puntos clave para esta materia.';

  setText('homeQuizTitle', 'Quiz de ' + course.label);
  const heroName = course.id === 'atp' ? 'el ATP' : course.label;
  setText('heroCourse', heroName);
  const hero = byId('heroCourse')?.closest('.hero');
  if(hero) hero.dataset.size = heroTitleSize(heroName);
  setText('statTopics', notes.length);
  setText('statKeys', nKeys);
  $$('.atp-only').forEach(el=>{ el.style.display = course.id === 'atp' ? '' : 'none'; });
  $$('.other-only').forEach(el=>{ el.style.display = course.id === 'atp' ? 'none' : ''; });
}