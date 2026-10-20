// Bañar: el botón "Bañar" saca una esponja. Se arrastra (con el dedo o el ratón, desde cualquier parte del cuarto)
// y al frotar sobre Mito la espuma se acumula donde pasa (manchones pegados al cuerpo que crecen, sin taparle la
// cara) y salen burbujas que flotan y revientan. La limpieza sube según cuánto se frota (NEEDS.cleanPerWidth por
// cada ancho de Mito); si ya estaba limpio, se baña igual por diversión y se queda en 100.
//
// El baño no termina solo al llegar a 100: termina con "Listo", o solo cuando se frotó un mínimo (MIN_RUB) y la
// limpieza está llena. Al terminar: enjuague (cae agua y la espuma se va) y luego el destello de "limpio".
// La mascota también se ríe del baño: de vez en cuando le cae espuma y se sacude.
// Con movimiento reducido: la espuma aparece y se va con un desvanecido, sin burbujas flotando ni gotas.

import { getNeeds, addClean, NEEDS } from '../../state/store.js';
import { MITO_BATH } from '../../content/house.js';
import { SPONGE, FOAM, FOAM_CELLS } from '../../content/art/house.js';

const MIN_RUB = 7;             // anchos de Mito frotados antes de que el baño pueda terminar solo
const FLUSH_MS = 300;          // cada cuánto se guarda lo frotado
const BUBBLE_EVERY_PX = 9;     // una burbuja cada tantos px frotados
const FOAM_REACH = 17;         // radio (en el viewBox 150 de Mito) que enjabona la esponja
const FOAM_PER_WIDTH = 1.1;    // cuánto crece la espuma de una celda por cada ancho frotado encima
const PET_SUDS_EVERY = 2.2;    // anchos frotados entre que a la mascota le cae espuma
const RUB_PHRASE_AT = 1.5;     // anchos frotados antes de decir algo
const RINSE_MS = 900;          // enjuague antes del destello
// "Limpio": la limpieza baja de a poco con el tiempo, así que unos milisegundos después de llegar a 100 ya es 99,99…
const isClean = v => v >= NEEDS.max - 1;
// Cuerpo de Mito dentro de su SVG (viewBox 150): centro (75, 72), radio 52.
const CENTER = { x: 75 / 150, y: 72 / 150 }, RADIUS = 52 / 150;

const ICONS = {
  bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v1.5A5.5 5.5 0 0 1 14.5 19h-5A5.5 5.5 0 0 1 4 13.5Z"/><path d="M6 12V6.5a2.2 2.2 0 0 1 4-1.3"/><circle cx="13" cy="7" r="1.3"/><circle cx="16.5" cy="4.6" r="1"/><path d="M7.5 19l-1 2M16.5 19l1 2"/></svg>',
  done: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};
const reduced = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function createBath(room, mascot, reactions, { button, onChange = ()=>{} }){
  const sponge = document.createElement('div');
  sponge.className = 'sponge';
  sponge.innerHTML = SPONGE;
  sponge.hidden = true;
  room.append(sponge);
  mascot.insertAdjacentHTML('beforeend', FOAM);
  const foamSvg = mascot.querySelector(':scope > .mito-foam');
  const cells = [...foamSvg.querySelectorAll('.fc')];
  const level = new Float32Array(cells.length);

  let bathing = false, rinsing = false, pointer = null, last = null, pending = 0, rubbed = 0, sinceBubble = 0,
    sincePetSuds = 0, flushTimer = 0, saidRub = false;
  const svg = ()=> mascot.querySelector(':scope > svg.mito');

  function paint(){
    room.classList.toggle('is-bathing', bathing);
    sponge.hidden = !bathing;
    if(button){
      button.innerHTML = (bathing ? ICONS.done : ICONS.bath) + (bathing ? 'Listo' : 'Bañar');
      button.classList.toggle('is-on', bathing);
      button.setAttribute('aria-pressed', bathing ? 'true' : 'false');
    }
  }

  // Coloca la esponja centrada en un punto del cuarto (px de cliente).
  function moveSponge(x, y){
    const r = room.getBoundingClientRect();
    sponge.style.left = (x - r.left) + 'px';
    sponge.style.top = (y - r.top) + 'px';
  }

  // Si el punto está sobre Mito: su posición en el viewBox 150 y su ancho en px.
  function onMito(x, y){
    const s = svg()?.getBoundingClientRect();
    if(!s || !s.width) return null;
    const cx = s.left + s.width * CENTER.x, cy = s.top + s.height * CENTER.y;
    if(Math.hypot(x - cx, y - cy) > s.width * RADIUS * 1.1) return null;
    return { lx: (x - s.left) / s.width * 150, ly: (y - s.top) / s.height * 150, width: s.width };
  }

  // La espuma crece en las celdas cerca de donde pasa la esponja.
  function lather(lx, ly, widths){
    FOAM_CELLS.forEach((c, i)=>{
      const d = Math.hypot(c.x - lx, c.y - ly);
      if(d > FOAM_REACH || level[i] >= 1) return;
      level[i] = Math.min(1, level[i] + widths * FOAM_PER_WIDTH * (1 - d / FOAM_REACH * .6));
      cells[i].style.setProperty('--f', level[i].toFixed(2));
      cells[i].classList.add('on');
    });
  }
  function clearFoam(){
    level.fill(0);
    cells.forEach(c => { c.classList.remove('on'); c.style.setProperty('--f', 0); });
  }

  function addFx(cls, x, y, life, extra = {}){
    const r = room.getBoundingClientRect();
    const el = document.createElement('i');
    el.className = cls;
    el.style.left = (x - r.left) + 'px';
    el.style.top = (y - r.top) + 'px';
    el.style.setProperty('--s', (.6 + Math.random() * .9).toFixed(2));
    el.style.setProperty('--dx', ((Math.random() - .5) * 46).toFixed(0) + 'px');
    el.style.setProperty('--rise', (60 + Math.random() * 60).toFixed(0) + 'px');
    Object.entries(extra).forEach(([k, v]) => el.style.setProperty(k, v));
    room.appendChild(el);
    setTimeout(()=> el.remove(), life);
    return el;
  }

  // A la mascota le cae espuma en la cabeza y se sacude.
  function petSuds(){
    const pet = mascot.querySelector(':scope > svg.pet');
    if(!pet) return;
    const p = pet.getBoundingClientRect();
    addFx('pet-suds', p.left + p.width / 2, p.top + p.height * .18, 1300);
    setTimeout(()=> reactions.petPlay('shake'), 550);
  }

  function flush(){
    clearTimeout(flushTimer); flushTimer = 0;
    if(pending <= 0) return;
    const clean = addClean(pending);   // si ya está en 100, se queda en 100
    pending = 0;
    onChange();
    // solo termina solo después de un baño de verdad (MIN_RUB) y con la limpieza llena
    if(isClean(clean) && rubbed >= MIN_RUB) finish();
  }

  function start(){
    bathing = true; rubbed = 0; saidRub = false; pending = 0; sincePetSuds = 0;
    reactions.clear();
    clearFoam();
    paint();
    // la esponja aparece a la derecha de Mito, a media altura
    const s = svg()?.getBoundingClientRect();
    if(s) moveSponge(s.right + s.width * .08, s.top + s.height * .55);
    reactions.sayFrom(MITO_BATH.start, 'bath-start');
  }

  // Enjuague: cae agua y la espuma se va; luego, si quedó limpio, el destello.
  function finish(){
    if(!bathing) return;
    bathing = false; pointer = null; rinsing = true;   // antes de guardar: el auto-fin de flush() no lo repite
    flush();
    room.classList.remove('is-rubbing');
    paint();
    room.classList.add('is-rinsing');
    const s = svg()?.getBoundingClientRect();
    if(s && !reduced()) for(let i = 0; i < 18; i++){
      addFx('rinse-drop', s.left + s.width * (.18 + Math.random() * .64), s.top - s.height * (.05 + Math.random() * .25), 1100,
        { '--delay': (Math.random() * .45).toFixed(2) + 's', '--fall': (s.height * .95).toFixed(0) + 'px' });
    }
    clearFoam();   // la espuma se desvanece (transición en style.css)
    setTimeout(()=>{
      room.classList.remove('is-rinsing');
      rinsing = false;
      const shiny = rubbed > 0 && isClean(getNeeds().clean);
      if(shiny){
        mascot.classList.remove('hr-shine'); void mascot.offsetWidth; mascot.classList.add('hr-shine');
        setTimeout(()=> mascot.classList.remove('hr-shine'), 1600);
        reactions.sayFrom(MITO_BATH.done, 'bath-done');
      }
      onChange();
    }, RINSE_MS);
  }

  // Frotar: la esponja sigue al puntero desde cualquier parte del cuarto (menos la barra de acciones).
  room.addEventListener('pointerdown', e=>{
    if(!bathing || pointer !== null || e.button > 0 || e.target.closest('.house-bar')) return;
    e.preventDefault();
    pointer = e.pointerId;
    try{ room.setPointerCapture(e.pointerId); }catch{}
    last = { x: e.clientX, y: e.clientY };
    moveSponge(e.clientX, e.clientY);
    room.classList.add('is-rubbing');
  });
  room.addEventListener('pointermove', e=>{
    if(e.pointerId !== pointer) return;
    moveSponge(e.clientX, e.clientY);
    const d = Math.hypot(e.clientX - last.x, e.clientY - last.y);
    last = { x: e.clientX, y: e.clientY };
    const at = onMito(e.clientX, e.clientY);
    if(!at || !d) return;
    const widths = d / at.width;
    rubbed += widths;
    pending += widths * NEEDS.cleanPerWidth;
    lather(at.lx, at.ly, widths);
    sinceBubble += d;
    if(sinceBubble >= BUBBLE_EVERY_PX && !reduced()){
      sinceBubble = 0;
      addFx('bath-bubble', e.clientX + (Math.random() - .5) * 24, e.clientY + (Math.random() - .5) * 16, 1700);
    }
    sincePetSuds += widths;
    if(sincePetSuds >= PET_SUDS_EVERY){ sincePetSuds = 0; petSuds(); }
    if(!saidRub && rubbed >= RUB_PHRASE_AT){ saidRub = true; reactions.sayFrom(MITO_BATH.rub, 'bath-rub'); }
    if(!flushTimer) flushTimer = setTimeout(flush, FLUSH_MS);
  });
  const end = e=>{
    if(e.pointerId !== pointer) return;
    pointer = null;
    room.classList.remove('is-rubbing');
    flush();
  };
  room.addEventListener('pointerup', end);
  room.addEventListener('pointercancel', end);

  paint();

  return {
    get bathing(){ return bathing || rinsing; },
    toggle(){ bathing ? finish() : (!rinsing && start()); },
    finish,
    // Al salir de la Casa: sin enjuague ni frases.
    leave(){
      if(!bathing) return;
      bathing = false; pointer = null;
      flush();
      clearFoam();
      paint();
    },
  };
}
