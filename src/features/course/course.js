// Curso/materia activa: qué materia se está estudiando y el-switch entre ellas.
// Es el módulo del que dependen casi todas las vistas, así que expone un getter
// en lugar de que cada vista imports y almacene su propia copia.

import { COURSES } from '../../content/courses.js';
import { getCourse, setCourse } from '../../state/store.js';
import { emit } from '../../core/bus.js';
import { el, clear, byId } from '../../core/dom.js';

let active = COURSES.find(c=>c.id === getCourse()) || COURSES[0];

export const activeCourse = ()=> active;

function selectCourse(id){
  active = COURSES.find(c=>c.id === id) || COURSES[0];
}

// Rehidrata la materia activa desde el store. Úsalo tras importar o reiniciar
// el progreso, que es lo único que puede cambiarla por fuera.
export function reloadCourse(){
  selectCourse(getCourse());
}

export function renderCourseTabs(){
  const host = byId('courseTabs');
  if(!host) return;
  clear(host);
  COURSES.forEach(c=>{
    host.appendChild(el('button', {
      class: 'course-pill' + (c.id === active.id ? ' active' : ''),
      text: c.label,
      attrs: { 'data-id': c.id },
    }));
  });
}

// Cambia de materia y avisa al resto de la app para que se refresquen las vistas.
// Los ids de los pills se guardan como data-id para no depender del texto (traducible).
function switchCourse(id){
  if(id === active.id) return;
  selectCourse(id);
  setCourse(active.id);
  emit('course:changed', active);
}

export function initCourseTabs(){
  const host = byId('courseTabs');
  if(!host) return;
  host.onclick = e=>{
    const pill = e.target.closest('.course-pill');
    if(pill) switchCourse(pill.dataset.id);
  };
}