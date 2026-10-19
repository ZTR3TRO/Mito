// Curso/materia activa: qué materia se está estudiando y el-switch entre ellas.
// Es el módulo del que dependen casi todas las vistas, así que expone un getter
// en lugar de que cada vista imports y almacene su propia copia.

import { COURSES } from '../../content/courses.js';
import { getCourse, setCourse } from '../../state/store.js';
import { emit } from '../../core/bus.js';
import { guardLeave } from '../../core/leave.js';
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

// En móvil los chips van en una sola fila con scroll: el desvanecido de los bordes solo aparece del lado donde hay más,
// y el chip activo se centra solo (sin mover la página).
function updateTabsFade(host){
  host.classList.toggle('can-left', host.scrollLeft > 4);
  host.classList.toggle('can-right', host.scrollLeft + host.clientWidth < host.scrollWidth - 4);
}
function centerActivePill(host){
  const pill = host.querySelector('.course-pill.active');
  if(pill && host.scrollWidth > host.clientWidth){
    const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const x = pill.getBoundingClientRect().left - host.getBoundingClientRect().left + host.scrollLeft;
    host.scrollTo({ left: x - (host.clientWidth - pill.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
  }
  updateTabsFade(host);
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
  centerActivePill(host);
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
  host.addEventListener('scroll', ()=>updateTabsFade(host), { passive:true });
  window.addEventListener('resize', ()=>updateTabsFade(host));
  host.onclick = e=>{
    const pill = e.target.closest('.course-pill');
    if(pill && pill.dataset.id !== active.id) guardLeave(()=>switchCourse(pill.dataset.id));
  };
}