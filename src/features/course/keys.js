// Puntos clave: tarjetas numeradas con las ideas que más preguntan.

import { el, clear, byId } from '../../core/dom.js';
import { activeCourse } from './course.js';

export function renderKeys(){
  const host = byId('keyGrid');
  if(!host) return;
  clear(host);
  const kps = activeCourse().keypoints || [];
  if(kps.length === 0){
    host.innerHTML = `<div class="empty-state">Aún no hay puntos clave para esta materia. Agrégalos en src/courses.js ✨</div>`;
    return;
  }
  kps.forEach((k, i)=>{
    host.appendChild(el('div', {
      class: 'key-card',
      html: `<span class="key-num">${i+1}</span>${k}`,
    }));
  });
}