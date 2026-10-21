// Comer: el botón "Comer" abre la charola, que ocupa el lugar de la barra de acciones mientras está abierta (así
// no tapa a Mito ni a la mascota). La comida se le da a Mito de dos formas:
//   - arrastrándola hasta su boca (al acercarla, abre la boca; si se suelta lejos, vuelve a la charola);
//   - tocándola (o con Enter): vuela sola hasta su boca.
// Al comer: 3 mordidas con la boca masticando (y migajas si es crujiente), su frase, la tarjeta "Dato de nutrición"
// y la mascota se acerca (Mito le comparte una migaja). Si está lleno (NEEDS.fullAbove), lo dice con cariño y la
// comida no se gasta. Sin comida, la charola lleva a la sección Comida de la Tienda.
// Con movimiento reducido: la comida aparece en su boca con un desvanecido, sin vuelo ni migajas.

import { emit } from '../../core/bus.js';
import { getPantry, eatFood, getNeeds, getEquipped, NEEDS, getFoodHintCount, markFoodHintShown } from '../../state/store.js';
import { FOODS, findFood } from '../../content/food.js';
import { FOOD_ART } from '../../content/art/food.js';
import { MITO_FOOD, PET_EAT } from '../../content/house.js';
import { findItem } from '../../content/wardrobe.js';
import { petSpeak } from '../mascot/speech.js';

const DRAG_START_PX = 7;       // cuánto hay que mover el dedo para que un toque se vuelva arrastre
const MOUTH = { x: 75 / 150, y: 103 / 150 };   // la boca, dentro del dibujo de Mito (viewBox 150)
const MOUTH_REACH = .32;       // a qué distancia de la boca (× ancho de Mito) la comida "llega"
const FOOD_SIZE = .26;         // tamaño de la comida junto a Mito (× su ancho)
const FLY_MS = 560;            // vuelo de la charola a la boca
const BACK_MS = 320;           // si se suelta lejos, vuelta a la charola
const BITES = 3, BITE_MS = 480;
const NOPE_MS = 600;
const FACT_MS = 7000;          // cuánto se ve la tarjeta del dato
const HINT_TIMES = 3, HINT_MS = 6000;

const CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const reduced = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function createFood(room, mascot, reactions, { button, onChange = ()=>{} }){
  const tray = document.createElement('div');
  tray.className = 'house-bar food-tray';
  tray.setAttribute('role', 'toolbar');
  tray.setAttribute('aria-label', 'Charola: dale de comer a Mito');
  tray.hidden = true;
  const fact = document.createElement('div');
  fact.className = 'food-fact';
  fact.setAttribute('role', 'status');
  fact.hidden = true;
  const hint = document.createElement('p');
  hint.className = 'house-hint food-hint';
  hint.textContent = 'Toca un alimento o arrástralo a su boca';
  hint.hidden = true;
  room.append(tray, fact, hint);

  let open = false, eating = false, drag = null, suppressClick = false, petTurn = 0;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(()=>{ timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  let factTimer = 0, hintTimer = 0;
  const svg = ()=> mascot.querySelector(':scope > svg.mito');
  const petEl = ()=> mascot.querySelector(':scope > svg.pet');

  /* ---------- la charola ---------- */
  function render(){
    if(!open) return;
    const list = tray.querySelector('.ft-list');
    const scroll = list ? list.scrollLeft : 0;
    const p = getPantry();
    const items = FOODS.filter(f => p[f.id]);
    const close = `<button class="house-act ft-close" type="button" data-food-close aria-label="Cerrar la charola">${CLOSE_ICON}<span>Cerrar</span></button>`;
    tray.innerHTML = close + (items.length
      ? `<div class="ft-list">${items.map(f => `<button class="ft-item" type="button" data-food="${f.id}" aria-label="${esc(f.name)}: tienes ${p[f.id]}. Dársela a Mito">
          <span class="ft-art" aria-hidden="true">${FOOD_ART[f.id]}</span><span class="ft-count" aria-hidden="true">${p[f.id]}</span><span class="ft-name" aria-hidden="true">${esc(f.short)}</span></button>`).join('')}</div>`
      : `<div class="ft-empty"><span class="ft-plate" aria-hidden="true"></span><div><b>Tu charola está vacía</b><span>Compra comida en la Tienda</span></div>
          <button class="btn-mini" type="button" data-nav="shop" data-food-shop>Ir a la Tienda →</button></div>`);
    const fresh = tray.querySelector('.ft-list');
    if(fresh){
      fresh.scrollLeft = scroll;
      fresh.classList.toggle('is-scrollable', fresh.scrollWidth > fresh.clientWidth + 1);
    }
  }

  function setOpen(v, { focus = true } = {}){
    if(open === v) return;
    open = v;
    room.classList.toggle('is-feeding', open);
    tray.hidden = !open;
    if(button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if(open){
      render();
      if(focus) (tray.querySelector('.ft-item, [data-food-shop]') || tray.querySelector('[data-food-close]'))?.focus({ preventScroll: true });
      if(!Object.keys(getPantry()).length) reactions.sayFrom(MITO_FOOD.empty, 'food-empty');
      else showHint();
    } else {
      cancelDrag();
      hideHint();
      if(focus) button?.focus({ preventScroll: true });
    }
  }

  function showHint(){
    if(getFoodHintCount() >= HINT_TIMES) return;
    markFoodHintShown();
    hint.hidden = false;
    (window.requestAnimationFrame || (f => f()))(()=> hint.classList.add("show"));
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, HINT_MS);
  }
  function hideHint(){
    clearTimeout(hintTimer);
    hint.classList.remove('show');
    hint.hidden = true;
  }

  /* ---------- posiciones (px del cuarto) ---------- */
  function mouthAt(){
    const r = room.getBoundingClientRect(), s = svg()?.getBoundingClientRect();
    if(!s || !s.width) return null;
    return { x: s.left - r.left + s.width * MOUTH.x, y: s.top - r.top + s.height * MOUTH.y, w: s.width };
  }
  function centerOf(el){
    const r = room.getBoundingClientRect(), b = el.getBoundingClientRect();
    return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
  }
  function foodEl(id, at, w){
    const el = document.createElement('div');
    el.className = 'food-bite';
    el.dataset.bite = '0';
    el.innerHTML = FOOD_ART[id];
    el.style.width = Math.round(w * FOOD_SIZE) + 'px';
    el.style.left = at.x + 'px';
    el.style.top = at.y + 'px';
    room.appendChild(el);
    return el;
  }
  function moveTo(el, to, ms, arc){
    const from = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
    const dx = to.x - from.x, dy = to.y - from.y;
    el.style.left = to.x + 'px';
    el.style.top = to.y + 'px';
    if(reduced() || !el.animate || !ms) return;
    el.animate([
      { transform: `translate(${-dx}px, ${-dy}px)` },
      { transform: `translate(${-dx / 2}px, ${-dy / 2 - arc}px) scale(1.08)`, offset: .5 },
      { transform: 'none' },
    ], { duration: ms, easing: 'cubic-bezier(.4,0,.3,1)' });
  }
  const nearMouth = (x, y) => { const m = mouthAt(); return !!m && Math.hypot(x - m.x, y - m.y) <= m.w * MOUTH_REACH; };

  /* ---------- comer ---------- */
  function nope(item, el){
    reactions.nope();
    reactions.sayFrom(MITO_FOOD.full, 'food-full');
    if(item){ item.classList.add('is-nope'); later(()=> item.classList.remove('is-nope'), NOPE_MS); }
    if(el) flyBack(el, item);
  }

  function give(id, item, ghost){
    const food = findFood(id);
    if(!food){ ghost?.remove(); return; }
    if(eating){ if(ghost) flyBack(ghost, item); return; }
    if(getNeeds().hunger >= NEEDS.fullAbove){ nope(item, ghost); return; }
    const m = mouthAt();
    if(!m){ ghost?.remove(); return; }
    eating = true;
    hideHint();
    const el = ghost || foodEl(id, item ? centerOf(item) : m, m.w);
    el.classList.remove('is-ghost');
    if(reduced()){ el.style.left = m.x + 'px'; el.style.top = m.y + 'px'; el.classList.add('fade-in'); }
    else moveTo(el, m, ghost ? 160 : FLY_MS, ghost ? 0 : m.w * .35);
    mascot.classList.add('mouth-open');
    later(()=> chew(food, el), ghost || reduced() ? 180 : FLY_MS);
  }

  function chew(food, el){
    mascot.classList.remove('mouth-open');
    const r = eatFood(food.id);
    if(!r.ok){   // se llenó o se acabó mientras volaba
      eating = false;
      if(r.reason === 'full') nope(null, el); else el.remove();
      return;
    }
    const ms = BITES * BITE_MS;
    reactions.munch(ms + 200);
    petEats();
    for(let i = 1; i <= BITES; i++) later(()=>{
      el.dataset.bite = String(i);
      if(food.bite === 'crunch' && !reduced()) crumbs(3);
    }, i * BITE_MS - 120);
    later(()=>{
      el.remove();
      eating = false;
      reactions.sayFrom([food.say], 'food-say');
      showFact(food);
      onChange();
    }, ms + 120);
  }

  function crumbs(n){
    const m = mouthAt();
    if(!m) return;
    for(let i = 0; i < n; i++){
      const c = document.createElement('i');
      c.className = 'food-crumb';
      c.style.left = (m.x + (Math.random() - .5) * m.w * .2) + 'px';
      c.style.top = (m.y + m.w * .04) + 'px';
      c.style.setProperty('--dx', ((Math.random() - .5) * m.w * .5).toFixed(0) + 'px');
      c.style.setProperty('--dy', (m.w * (.18 + Math.random() * .16)).toFixed(0) + 'px');
      room.appendChild(c);
      later(()=> c.remove(), 750);
    }
  }

  // La mascota se acerca; Mito le comparte una migaja; una de cada dos veces, la mascota dice algo.
  function petEats(){
    const pet = petEl();
    const k = (findItem('pet', getEquipped().pet) || {}).k;
    if(!pet || !k) return;
    later(()=> reactions.petPlay('approach'), 250);
    const m = mouthAt();
    if(m && !reduced()){
      const r = room.getBoundingClientRect(), p = pet.getBoundingClientRect();
      const c = document.createElement('i');
      c.className = 'food-crumb to-pet';
      c.style.left = m.x + 'px';
      c.style.top = m.y + 'px';
      c.style.setProperty('--dx', (p.left - r.left + p.width * .5 - m.x).toFixed(0) + 'px');
      c.style.setProperty('--dy', (p.top - r.top + p.height * .3 - m.y).toFixed(0) + 'px');
      later(()=>{ room.appendChild(c); later(()=> c.remove(), 900); }, 700);
    }
    if(PET_EAT[k] && petTurn++ % 2 === 0) later(()=>{ petSpeak(PET_EAT[k], mascot); reactions.place(); }, 500);
  }

  function showFact(food){
    if(!food.fact) return;
    fact.innerHTML = `<span class="ff-art" aria-hidden="true">${FOOD_ART[food.id]}</span>
      <div><b>Dato de nutrición · ${esc(food.name)}</b><span>${esc(food.fact)}</span></div>
      <button class="ff-close" type="button" aria-label="Cerrar el dato">×</button>`;
    fact.hidden = false;
    fact.classList.remove('show');
    void fact.offsetWidth;
    fact.classList.add('show');
    clearTimeout(factTimer);
    factTimer = setTimeout(hideFact, FACT_MS);
  }
  function hideFact(){
    clearTimeout(factTimer);
    fact.classList.remove('show');
    fact.hidden = true;
  }
  fact.addEventListener('click', hideFact);

  /* ---------- arrastrar desde la charola ---------- */
  function flyBack(el, item){
    if(!el.isConnected) return;
    const slot = item && item.isConnected ? centerOf(item) : null;
    if(!slot || reduced()){ el.classList.add('fade-out'); later(()=> el.remove(), 250); }
    else { moveTo(el, slot, BACK_MS, 0); el.classList.add('going-back'); later(()=> el.remove(), BACK_MS); }
    item?.classList.remove('is-picked');
  }
  function cancelDrag(){
    if(!drag) return;
    drag.ghost?.remove();
    drag.item.classList.remove('is-picked');
    mascot.classList.remove('mouth-open');
    drag = null;
  }

  // Dónde va la comida que se arrastra (px del cuarto): con el ratón, en el puntero; con el dedo, un poco más
  // arriba, para que el dedo no la tape. La que cuenta para llegar a la boca es esa posición.
  function ghostAt(e, d = drag){
    const r = room.getBoundingClientRect();
    const lift = d && !d.mouse && d.ghost ? d.ghost.offsetHeight * .7 : 0;
    return { x: e.clientX - r.left, y: e.clientY - r.top - lift };
  }

  tray.addEventListener('pointerdown', e=>{
    const item = e.target.closest('.ft-item');
    if(!item || e.button > 0 || drag) return;
    drag = { id: item.dataset.food, item, x: e.clientX, y: e.clientY, pointer: e.pointerId, mouse: e.pointerType === 'mouse', ghost: null };
  });
  tray.addEventListener('pointermove', e=>{
    if(!drag || e.pointerId !== drag.pointer) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if(!drag.ghost){
      // en el dedo, el arrastre es hacia arriba (de lado se desliza la charola); con el ratón, a cualquier lado
      const start = drag.mouse ? Math.hypot(dx, dy) > DRAG_START_PX : -dy > DRAG_START_PX && Math.abs(dy) > Math.abs(dx);
      if(!start) return;
      const m = mouthAt();
      if(!m || eating){ drag = null; return; }
      try{ tray.setPointerCapture(e.pointerId); }catch{}
      drag.ghost = foodEl(drag.id, centerOf(drag.item), m.w);
      drag.ghost.classList.add('is-ghost');
      drag.item.classList.add('is-picked');
      hideHint();
    }
    e.preventDefault();
    const { x, y } = ghostAt(e);
    drag.ghost.style.left = x + 'px';
    drag.ghost.style.top = y + 'px';
    const near = nearMouth(x, y);
    mascot.classList.toggle('mouth-open', near && getNeeds().hunger < NEEDS.fullAbove);
  });
  const endDrag = e=>{
    if(!drag || e.pointerId !== drag.pointer) return;
    const d = drag;
    drag = null;
    if(!d.ghost) return;   // fue un toque: lo resuelve el click
    suppressClick = true;
    setTimeout(()=>{ suppressClick = false; }, 0);
    mascot.classList.remove('mouth-open');
    const { x, y } = ghostAt(e, d);
    if(e.type === 'pointerup' && nearMouth(x, y)){ d.item.classList.remove('is-picked'); give(d.id, d.item, d.ghost); }
    else flyBack(d.ghost, d.item);
  };
  tray.addEventListener('pointerup', endDrag);
  tray.addEventListener('pointercancel', endDrag);

  tray.addEventListener('click', e=>{
    if(e.target.closest('[data-food-close]')) return setOpen(false);
    if(e.target.closest('[data-food-shop]')){ emit('shop:focus', 'food'); return; }   // la navegación la hace data-nav
    const item = e.target.closest('.ft-item');
    if(!item || suppressClick) return;
    give(item.dataset.food, item, null);
  });
  tray.addEventListener('keydown', e=>{
    if(e.key === 'Escape'){ e.preventDefault(); setOpen(false); }
  });

  return {
    get open(){ return open; },
    get eating(){ return eating; },
    render,
    toggle(){ setOpen(!open); },
    close(){ setOpen(false, { focus: false }); },
    // Al salir de la Casa: todo a su lugar, sin animaciones.
    leave(){
      setOpen(false, { focus: false });
      timers.forEach(clearTimeout); timers.clear();
      room.querySelectorAll(':scope > .food-bite, :scope > .food-crumb').forEach(el => el.remove());
      mascot.classList.remove('mouth-open');
      eating = false;
      hideFact();
    },
  };
}
