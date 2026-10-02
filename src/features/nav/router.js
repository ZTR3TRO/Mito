// Navegación entre vistas. Es el router de la app: cada vista es una <section>
// con id "view-<nombre>" y un .navbtn con data-view="<nombre>".

import { $$, byId } from '../../core/dom.js';
import { emit } from '../../core/bus.js';

export function isVisible(view){
  return byId('view-' + view)?.classList.contains('active') ?? false;
}

export function goTo(view){
  // applyAvatar() y checkSeason() los ejecuta quien registra el listener:
  // la navegación no debe conocer al avatar ni a la tienda.
  emit('nav:before', view);
  $$('.view').forEach(v=>v.classList.remove('active'));
  byId('view-' + view)?.classList.add('active');
  $$('.navbtn').forEach(b=>b.classList.toggle('active', b.dataset.view === view));
  emit('nav:after', view);
  window.scrollTo({ top:0, behavior:'smooth' });
}

export function initNavButtons(){
  $$('.navbtn').forEach(b=>{
    b.addEventListener('click', ()=>goTo(b.dataset.view));
  });
}

// Un solo listener para todos los botones con data-nav (tarjetas de la portada,
// botones sueltos en varias vistas). Los data-action los resuelve cada módulo.
export function initNavLinks(){
  document.addEventListener('click', e=>{
    const nav = e.target.closest('[data-nav]');
    if(nav) goTo(nav.dataset.nav);
  });
}