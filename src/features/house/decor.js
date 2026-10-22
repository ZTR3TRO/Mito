// Decorar: los muebles del cuarto y el modo para acomodarlos.
//
// Fuera de Decorar, los muebles solo se ven: no reciben toques, así que nunca estorban el juego con Mito (que en
// reposo queda siempre al frente). El botón "Decorar" abre el modo: la barra de acciones se vuelve una bandeja (como
// la charola) con "Listo" y los muebles guardados (el inventario), y los gestos de Mito se apagan.
//   - mover: arrastrar el mueble (dedo o ratón); se resalta su zona (pared o piso) y no puede salir de ella;
//   - colocar: tocar uno guardado lo pone en un lugar libre, o arrastrarlo desde la bandeja hasta donde quieras;
//   - tocar uno lo selecciona: encima sale "Voltear" (si se puede) y "Guardar" (vuelve a la bandeja);
//     también se guarda soltándolo sobre la bandeja;
//   - teclado: Tab los recorre; flechas mueven (con Mayús, más), F voltea, Supr guarda y Esc deselecciona o sale.
// Todo se guarda al soltar (state/decor.js). La primera vez que se coloca un mueble, Mito lo comenta.
// La colocación, los límites y la profundidad son lógica pura: furniture-layout.js.
// La lámpara y la guirnalda se encienden de noche (modo oscuro) y se apagan cuando Mito duerme: solo CSS (.fx-glow).

import {
  getDecor, placeFurniture, flipFurniture, storeFurniture, grantGift, getDecorHintCount, markDecorHintShown,
} from '../../state/store.js';
import { FURNITURE, findFurniture } from '../../content/furniture.js';
import { FURNITURE_ART, FURNITURE_DEFS } from '../../content/art/furniture.js';
import { MITO_DECOR } from '../../content/house.js';
import { emit } from '../../core/bus.js';
import { roomLayout } from './room.js';
import { furnitureBox, clampSpot, spotAt, freeSpot, depthOrder, FURN } from './furniture-layout.js';

const DRAG_START_PX = 6;          // cuánto hay que mover el dedo para que un toque se vuelva arrastre
const STEP = .01, STEP_BIG = .05; // flechas (con Mayús, más)
const HINT_TIMES = 3;             // la pista sale las primeras veces que se abre Decorar
const TOOLS_GAP = 12;

const ICONS = {
  done: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  flip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18" stroke-dasharray="2.5 3"/><path d="M9 7 3 17h6zM15 7l6 10h-6z"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="M3 4h18v4H3zM10 13h4"/></svg>',
};
const ZONE = { wall: 'Pared', floor: 'Piso' };
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const px = n => n.toFixed(1) + 'px';
const inside = (e, el) => { const r = el.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };

export function createDecor(room, reactions, { button, canTalk = ()=> true, onChange = ()=>{} }){
  if(!document.getElementById('furnDefs')) document.body.insertAdjacentHTML('afterbegin', FURNITURE_DEFS);
  const layer = cls => { const el = document.createElement('div'); el.className = cls; el.setAttribute('aria-hidden', 'true'); return el; };
  // capas: alfombras (sobre el piso, bajo la luz de la ventana) · zonas · muebles (bajo Mito) · barrita del seleccionado
  const rugs = layer('room-rugs'), zones = layer('room-zones'), furn = layer('room-furn'), tools = document.createElement('div');
  tools.className = 'room-tools';
  zones.innerHTML = '<div class="dc-zone" data-zona="wall"><b>Pared</b></div><div class="dc-zone" data-zona="floor"><b>Piso</b></div>';
  (room.querySelector('.room-base') || room.firstChild).after(rugs, zones, furn);
  const tray = document.createElement('div');
  tray.className = 'house-bar decor-tray';
  tray.setAttribute('role', 'toolbar');
  tray.setAttribute('aria-label', 'Decorar: tus muebles guardados');
  tray.hidden = true;
  const hint = document.createElement('p');
  hint.className = 'house-hint decor-hint';
  hint.textContent = 'Arrastra un mueble para moverlo · toca uno guardado para colocarlo';
  hint.hidden = true;
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  room.append(tools, tray, hint, status);

  let L = null, active = false, sel = null, drag = null, suppressClick = false;
  const announce = t => { status.textContent = t; };

  /* ---------- dibujar ---------- */
  function placedList(d = getDecor()){
    return FURNITURE.filter(f => d.placed[f.id]).map(item => ({ item, p: clampSpot(L, item, d.placed[item.id]) }));
  }
  const boxStyle = b => `left:${px(b.x)};top:${px(b.y)};width:${px(b.w)};height:${px(b.h)}`;
  function piece({ item, p }){
    const attrs = active
      ? ` tabindex="0" role="button" aria-label="${esc(item.name)} (${ZONE[item.zone].toLowerCase()}). Flechas para moverlo${item.flip ? ', F para voltearlo' : ''}, Supr para guardarlo"`
      : '';
    return `<div class="furn ${item.zone}${item.flat ? ' flat' : ''}${p.flip ? ' is-flip' : ''}${sel === item.id ? ' is-sel' : ''}" data-furn="${item.id}" style="${boxStyle(furnitureBox(L, item, p))}"${attrs}>
      <span class="furn-art">${FURNITURE_ART[item.id]}</span></div>`;
  }

  function render(){
    if(drag) return;   // no se repinta en medio de un arrastre: al soltar se pinta todo
    L = roomLayout(room);
    const d = getDecor();
    if(active) renderTray(d);   // la bandeja no depende del tamaño del cuarto
    if(!L) return;
    const list = placedList(d);
    if(sel && !d.placed[sel]) sel = null;
    // lo que tiene el foco se vuelve a enfocar después de repintar (al moverlo con el teclado)
    const focused = room.contains(document.activeElement) ? document.activeElement.closest?.('.furn')?.dataset.furn : null;
    rugs.innerHTML = list.filter(e => e.item.flat).map(piece).join('');
    furn.innerHTML = depthOrder(list.filter(e => !e.item.flat)).map(piece).join('');
    [rugs, furn].forEach(el => active ? el.removeAttribute('aria-hidden') : el.setAttribute('aria-hidden', 'true'));
    const M = FURN.margin, [wall, floor] = zones.children;
    Object.assign(wall.style, { left: px(M), top: px(M), width: px(L.W - 2 * M), height: px(L.horizon - 2 * M) });
    Object.assign(floor.style, { left: px(M), top: px(L.horizon + M), width: px(L.W - 2 * M), height: px(Math.max(0, L.H - L.barSpace - L.horizon - M)) });
    renderTools();
    if(active && !hint.hidden) placeHint();
    if(focused) pieceEl(focused)?.focus({ preventScroll: true });
  }
  const pieceEl = id => room.querySelector(`.furn[data-furn="${id}"]`);

  function renderTray(d){
    const list = tray.querySelector('.ft-list');
    const scroll = list ? list.scrollLeft : 0;
    const stored = FURNITURE.filter(f => d.owned.includes(f.id) && !d.placed[f.id]);
    tray.innerHTML = `<button class="house-act ft-close dc-done" type="button" data-decor-done aria-label="Terminar de decorar">${ICONS.done}<span>Listo</span></button>`
      + (stored.length
        ? `<div class="ft-list">${stored.map(f => `<button class="ft-item dc-item" type="button" data-furn-item="${f.id}" aria-label="${esc(f.name)} (${ZONE[f.zone].toLowerCase()}): colocarlo en el cuarto">
            <span class="ft-art" aria-hidden="true">${FURNITURE_ART[f.id]}</span><span class="ft-name" aria-hidden="true">${esc(f.short)}</span>
            <span class="dc-tag ${f.zone}" aria-hidden="true">${ZONE[f.zone]}</span></button>`).join('')}</div>`
        : `<div class="ft-empty dc-empty"><div><b>Todo está en tu cuarto</b><span>Hay más muebles en la Tienda</span></div>
            <button class="btn-mini" type="button" data-nav="shop" data-decor-shop>Ir a la Tienda →</button></div>`)
      + `<div class="dc-drop" aria-hidden="true">${ICONS.store}<b>Suelta aquí para guardarlo</b></div>`;
    const fresh = tray.querySelector('.ft-list');
    if(fresh){
      fresh.scrollLeft = scroll;
      fresh.classList.toggle('is-scrollable', fresh.scrollWidth > fresh.clientWidth + 1);
    }
  }

  // La barrita del mueble seleccionado: arriba de él (o abajo, si no cabe), siempre dentro del cuarto.
  function renderTools(){
    tools.innerHTML = '';
    if(!active || !sel || drag || !L) return;
    const item = findFurniture(sel), p = getDecor().placed[sel];
    if(!item || !p) return;
    const b = furnitureBox(L, item, clampSpot(L, item, p));
    tools.innerHTML = `<div class="dc-tools" role="toolbar" aria-label="${esc(item.name)}">
      ${item.flip ? `<button type="button" data-decor-flip>${ICONS.flip}<span>Voltear</span></button>` : ''}
      <button type="button" data-decor-store>${ICONS.store}<span>Guardar</span></button></div>`;
    const bar = tools.firstElementChild, w = bar.offsetWidth, h = bar.offsetHeight, M = FURN.margin;
    let y = b.y - h - TOOLS_GAP;
    if(y < M) y = Math.min(b.y + b.h + TOOLS_GAP, L.H - L.barSpace - h);
    bar.style.left = px(Math.min(Math.max(M, b.x + b.w / 2 - w / 2), L.W - M - w));
    bar.style.top = px(Math.max(M, y));
  }

  function select(id){
    sel = id;
    room.querySelectorAll('.furn').forEach(el => el.classList.toggle('is-sel', el.dataset.furn === id));
    renderTools();
  }

  /* ---------- acciones ---------- */
  function said(item, first){
    hideHint();
    if(first && canTalk()) reactions.sayFrom([MITO_DECOR.placed[item.id]], 'decor-' + item.id);
  }
  function place(item, spot){
    const r = placeFurniture(item.id, spot);
    if(!r.ok) return;
    sel = item.id;
    said(item, r.first);
    onChange();
    render();
    announce(`${item.name}: colocado.`);
  }
  // Tocar uno guardado: va a un lugar libre de su zona y queda seleccionado (con el foco, para seguir con el teclado).
  function placeFromTray(id){
    const item = findFurniture(id);
    if(!item || !L) return;
    const others = placedList().filter(e => !e.item.flat).map(e => furnitureBox(L, e.item, e.p));
    place(item, freeSpot(L, item, others));
    pieceEl(id)?.focus({ preventScroll: true });
  }
  function flip(id){
    const item = findFurniture(id);
    if(!item?.flip) return;
    hideHint();
    flipFurniture(id);
    render();
    announce(`${item.name}: volteado.`);
  }
  function putAway(id){
    const item = findFurniture(id);
    if(!item || !storeFurniture(id)) return;
    hideHint();
    sel = null;
    onChange();
    render();
    announce(`${item.name}: guardado en la bandeja.`);
    tray.querySelector(`[data-furn-item="${id}"]`)?.focus({ preventScroll: true });
  }

  /* ---------- arrastrar ---------- */
  // Mover uno del cuarto (kind 'move') o traer uno de la bandeja (kind 'new'). La posición nueva sale del
  // desplazamiento del puntero; desde la bandeja, el mueble va en el puntero (con el dedo, un poco arriba).
  function startDrag(e, kind, id, el){
    const item = findFurniture(id);
    if(!item || !L) return;
    const d = { kind, id, item, el: kind === 'move' ? el : null, chip: kind === 'new' ? el : null, x: e.clientX, y: e.clientY, pointer: e.pointerId, mouse: e.pointerType === 'mouse', moved: false, spot: null, over: false };
    if(kind === 'move'){
      const p = clampSpot(L, item, getDecor().placed[id]);
      const b = furnitureBox(L, item, p);
      Object.assign(d, { flip: !!p.flip, cx: b.x + b.w / 2, y0: item.zone === 'wall' ? b.y : b.base });
    }
    drag = d;
  }
  function liftOff(e){
    const d = drag;
    d.moved = true;
    hideHint();
    tools.innerHTML = '';
    if(d.kind === 'new'){
      furn.insertAdjacentHTML('beforeend', piece({ item: d.item, p: clampSpot(L, d.item, { u: .5, v: .5 }) }));
      d.el = furn.lastElementChild;
      d.chip?.classList.add('is-picked');
    }
    try{ (d.kind === 'new' ? tray : d.el).setPointerCapture(e.pointerId); }catch{}
    d.el.classList.add('is-lift');
    room.classList.add('is-dragging-furn');
    zones.querySelector(`[data-zona="${d.item.zone}"]`).classList.add('is-target');
    tray.classList.add('is-dragging');
  }
  function dragTo(e){
    const d = drag, r = room.getBoundingClientRect();
    let cx, y;
    if(d.kind === 'move'){ cx = d.cx + e.clientX - d.x; y = d.y0 + e.clientY - d.y; }
    else {
      const h = d.el.offsetHeight || 40, px0 = e.clientX - r.left, py0 = e.clientY - r.top;
      const lift = d.mouse ? 0 : h * .5 + 16;   // con el dedo, arriba del dedo
      cx = px0;
      y = d.item.zone === 'wall' ? py0 - h / 2 - lift : py0 + h / 2 - lift;
    }
    d.spot = spotAt(L, d.item, cx, y, d.flip);
    const b = furnitureBox(L, d.item, d.spot);
    d.el.setAttribute('style', boxStyle(b));
    d.over = d.kind === 'move' && inside(e, tray);
    tray.classList.toggle('is-hot', d.over);
    d.el.classList.toggle('is-leaving', d.over);
  }
  function endDrag(e, cancel = false){
    const d = drag;
    drag = null;
    room.classList.remove('is-dragging-furn');
    zones.querySelectorAll('.is-target').forEach(z => z.classList.remove('is-target'));
    tray.classList.remove('is-dragging', 'is-hot');
    if(!d || !d.moved) return d;
    suppressClick = true;
    setTimeout(()=>{ suppressClick = false; }, 0);
    d.chip?.classList.remove('is-picked');
    if(cancel || !d.spot || (d.kind === 'new' && inside(e, tray))){ if(d.kind === 'new') d.el.remove(); render(); return d; }
    if(d.over) putAway(d.id);
    else place(d.item, d.spot);
    return d;
  }

  room.addEventListener('pointerdown', e=>{
    if(!active || e.button > 0 || drag) return;
    const el = e.target.closest('.furn');
    if(el){ select(el.dataset.furn); startDrag(e, 'move', el.dataset.furn, el); return; }
    const chip = e.target.closest('.dc-item');
    if(chip){ startDrag(e, 'new', chip.dataset.furnItem, chip); return; }
    if(!e.target.closest('.decor-tray, .dc-tools')) select(null);   // tocar el cuarto vacío deselecciona
  });
  room.addEventListener('pointermove', e=>{
    const d = drag;
    if(!d || e.pointerId !== d.pointer) return;
    if(!d.moved){
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      // desde la bandeja, con el dedo, el arrastre es hacia arriba (de lado se desliza la bandeja)
      const go = d.kind === 'new' && !d.mouse ? -dy > DRAG_START_PX && Math.abs(dy) > Math.abs(dx) : Math.hypot(dx, dy) > DRAG_START_PX;
      if(!go) return;
      liftOff(e);
    }
    e.preventDefault();
    dragTo(e);
  });
  room.addEventListener('pointerup', e=>{ if(drag && e.pointerId === drag.pointer){ const d = endDrag(e); if(d && !d.moved && d.kind === 'move') renderTools(); } });
  room.addEventListener('pointercancel', e=>{ if(drag && e.pointerId === drag.pointer) endDrag(e, true); });

  room.addEventListener('click', e=>{
    if(!active) return;
    if(e.target.closest('[data-decor-done]')) return setActive(false);
    if(e.target.closest('[data-decor-shop]')) return emit('shop:focus', 'furniture');   // la navegación la hace data-nav
    if(e.target.closest('[data-decor-flip]')) return sel && flip(sel);
    if(e.target.closest('[data-decor-store]')) return sel && putAway(sel);
    const chip = e.target.closest('.dc-item');
    if(chip && !suppressClick) placeFromTray(chip.dataset.furnItem);
  });
  room.addEventListener('focusin', e=>{
    const el = active && e.target.closest?.('.furn');
    if(el && sel !== el.dataset.furn) select(el.dataset.furn);
  });
  room.addEventListener('keydown', e=>{
    if(!active || drag) return;
    const el = e.target.closest?.('.furn');
    if(e.key === 'Escape'){
      e.preventDefault();
      if(el || sel){ select(null); el?.blur(); } else setActive(false);
      return;
    }
    if(!el) return;
    const id = el.dataset.furn, item = findFurniture(id), p = getDecor().placed[id];
    if(!item || !p) return;
    const step = e.shiftKey ? STEP_BIG : STEP;
    const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if(move){
      e.preventDefault();
      hideHint();
      placeFurniture(id, clampSpot(L, item, { ...p, u: p.u + move[0], v: p.v + move[1] }));
      render();
    } else if(e.key === 'f' || e.key === 'F'){ e.preventDefault(); flip(id); }
    else if(e.key === 'Delete' || e.key === 'Backspace'){ e.preventDefault(); putAway(id); }
  });

  /* ---------- el modo ---------- */
  function paintButton(){
    if(!button) return;
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.classList.toggle('has-dot', !active && getDecorHintCount() === 0);   // puntito hasta que se abra la primera vez
  }
  // La pista va justo arriba de la bandeja (que puede ser más alta que la barra), sin tapar los muebles de la pared.
  function placeHint(){
    const r = room.getBoundingClientRect(), t = tray.getBoundingClientRect();
    if(t.height) hint.style.bottom = px(r.bottom - t.top + 8);
  }
  function showHint(){
    hint.hidden = false;
    placeHint();
    (window.requestAnimationFrame || (f => f()))(()=> hint.classList.add('show'));
  }
  function hideHint(){
    hint.classList.remove('show');
    hint.hidden = true;
  }
  function setActive(v, { focus = true } = {}){
    if(active === v) return;
    if(!v && drag) endDrag({ clientX: -1, clientY: -1 }, true);
    active = v;
    sel = null;
    room.classList.toggle('is-decorating', active);
    tray.hidden = !active;
    if(active){
      const showIt = getDecorHintCount() < HINT_TIMES;
      markDecorHintShown();
      render();
      if(showIt) showHint();
      if(focus) (tray.querySelector('.dc-item') || tray.querySelector('[data-decor-done]'))?.focus({ preventScroll: true });
    } else {
      hideHint();
      render();
      if(focus) button?.focus({ preventScroll: true });
    }
    paintButton();
    onChange();
  }

  paintButton();

  return {
    get active(){ return active; },
    render,
    toggle(){ setActive(!active); },
    open(){ setActive(true); },
    // Al entrar a la Casa: pinta los muebles y entrega la alfombra de regalo (una vez), bajo los pies de Mito.
    // Devuelve true si la acaba de entregar (para que Mito lo diga en vez de saludar).
    enter(){
      L = roomLayout(room);
      let gifted = false;
      const rug = FURNITURE.find(f => f.gift);
      if(L && rug && !getDecor().owned.includes(rug.id)){
        const first = spotAt(L, rug, L.home.x, L.home.y);
        const h = furnitureBox(L, rug, first).h;
        gifted = grantGift(spotAt(L, rug, L.home.x, L.home.y + h * .3)).length > 0;
      }
      render();
      paintButton();
      return gifted;
    },
    thank(){ if(canTalk()) reactions.sayFrom(MITO_DECOR.gift, 'decor-gift'); },
    leave(){ setActive(false, { focus: false }); },
  };
}
