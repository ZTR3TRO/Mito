// Portada: textos de resumen, títulos y los elementos que solo existen en ATP.

import { byId, setText, $$ } from '../../core/dom.js';
import { activeCourse } from './course.js';

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
  setText('heroCourse', course.id === 'atp' ? 'el ATP' : course.label);
  $$('.atp-only').forEach(el=>{ el.style.display = course.id === 'atp' ? '' : 'none'; });
}