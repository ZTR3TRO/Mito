// Fase 4 · BOCETOS (solo dev; propuesta, con el catálogo y el arte reales): /dev/house.html?decor
//   el cuarto con muebles, el modo Decorar con el inventario, arrastrando un mueble y la sección Muebles de la Tienda
//   (escritorio y barra de vista previa en móvil). Claro y oscuro, escritorio (1176 × 900) y móvil (390 × 714).
//   ?theme=light|dark   ?size=390|1176   ?state=placed|decor|drag|shop   ?pet=0   ?still
// La colocación de aquí (place) es la que se propone para features/house/furniture-layout.js.
import { previewAvatar } from '../src/features/mascot/avatar.js';
import { buildPanes, layoutRoom } from '../src/features/house/room.js';
import { sceneLayout } from '../src/features/house/layout.js';
import { FURNITURE as ALL, findFurniture, FURNITURE_SIZE } from '../src/content/furniture.js';
import { FURNITURE_ART as ART, FURNITURE_DEFS } from '../src/content/art/furniture.js';

const q = new URLSearchParams(location.search);
const themes = q.get('theme') ? [q.get('theme')] : ['light', 'dark'];
const SIZES = [['1176', 1176, 900, 'Escritorio · 1440 × 900'], ['390', 390, 714, 'Móvil · 390 × 844']].filter(([k]) => !q.get('size') || q.get('size') === k);
const STATES = [['placed', 'El cuarto con muebles'], ['decor', 'Decorar · inventario abierto'], ['drag', 'Decorar · arrastrando un mueble']]
  .filter(([k]) => !q.get('state') || q.get('state') === k);
const withPet = q.get('pet') !== '0';
const LOOK = withPet
  ? { color: 'c-mint', ropa: 'r-sueter', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-none', pet: 'p-chick' }
  : { color: 'c-mint', ropa: 'r-none', accesorio: 'ac-headphones', sombrero: 's-none', aura: 'a-none', pet: 'p-none' };

/* ---------- colocación: { zona, u, v, flip } → píxeles del cuarto ----------
   floor: u = x del centro (0–1 del ancho del cuarto); v = qué tan al frente está la base (0 en el zócalo, 1 junto a la
          barra). El tamaño sigue la perspectiva del piso (la misma ley que las tablas) y vale 1 en el lugar de Mito.
   wall:  u = x del centro; v = altura dentro de la pared (0 arriba, 1 en el zócalo). No cambia de tamaño. */
const MARGIN = 8;
function place(L, item, p){
  const unit = L.block.w * FURNITURE_SIZE[L.kind];
  const w0 = item.size * unit, h0 = w0 * item.box[1] / item.box[0];
  if(item.zone === 'wall'){
    const top = MARGIN, bot = L.horizon - MARGIN - h0;
    return { x: p.u * L.W - w0 / 2, y: top + p.v * Math.max(0, bot - top), w: w0, h: h0, z: 0 };
  }
  const yTop = L.horizon + MARGIN, yBot = L.H - L.barSpace - 6;
  const base = yTop + p.v * (yBot - yTop);
  const pct = y => (y - L.horizon) / L.fb * 100;
  const s = (pct(base) + 260) / (pct(L.home.y) + 260);
  const w = w0 * s, h = h0 * s;
  return { x: p.u * L.W - w / 2, y: base - h, w, h, z: p.v, base };
}

// Dónde puso las cosas "la persona": en el escritorio y en el móvil (en el móvil la ventana está a la derecha).
const LAYOUT = {
  wide: {
    'm-rug': { u: .5, v: .46 }, 'm-bed': { u: .19, v: .2 }, 'm-bookcase': { u: .92, v: .1 }, 'm-lamp': { u: .8, v: .28 },
    'm-plant': { u: .045, v: .62 }, 'm-cushion': { u: .33, v: .83 }, 'm-sofa': { u: .78, v: .86, flip: true },
    'm-picture': { u: .52, v: .38 }, 'm-clock': { u: .68, v: .3 }, 'm-lights': { u: .5, v: .02 },
  },
  tall: {
    'm-rug': { u: .5, v: .46 }, 'm-bed': { u: .27, v: .16 }, 'm-bookcase': { u: .91, v: .1 }, 'm-lamp': { u: .73, v: .27 },
    'm-plant': { u: .08, v: .66 }, 'm-cushion': { u: .3, v: .86 }, 'm-sofa': { u: .72, v: .88, flip: true },
    'm-picture': { u: .26, v: .72 }, 'm-clock': { u: .08, v: .3 }, 'm-lights': { u: .26, v: .04 },
  },
};
const UNPLACED = ['m-desk', 'm-shelf'];
const SELECTED = 'm-sofa', DRAGGED = 'm-plant';

const I = {
  eat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/></svg>',
  bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v1.5A5.5 5.5 0 0 1 14.5 19h-5A5.5 5.5 0 0 1 4 13.5Z"/><path d="M6 12V6.5a2.2 2.2 0 0 1 4-1.3"/><circle cx="13" cy="7" r="1.3"/><circle cx="16.5" cy="4.6" r="1"/><path d="M7.5 19l-1 2M16.5 19l1 2"/></svg>',
  sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  wardrobe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M9 10v4M15 10v4"/></svg>',
  decor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2.5 13a2 2 0 0 1 4 0v1.5h11V13a2 2 0 0 1 4 0v5H2.5Z"/><path d="M5 18v2M19 18v2"/></svg>',
  flip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18" stroke-dasharray="2.5 3"/><path d="M9 7 3 17h6zM15 7l6 10h-6z"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="M3 4h18v4H3zM10 13h4"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
};
const bar = () => `<div class="house-bar" role="toolbar">
  <button class="house-act" type="button">${I.eat}<span>Comer</span></button>
  <button class="house-act" type="button">${I.bath}<span>Bañar</span></button>
  <button class="house-act" type="button">${I.sleep}<span>Dormir</span></button>
  <button class="house-act has-dot" type="button">${I.decor}<span>Decorar</span></button>
  <button class="house-act" type="button">${I.wardrobe}<span>Armario</span></button></div>`;
const tag = z => z === 'wall' ? 'Pared' : 'Piso';
// Bandeja de Decorar: ocupa el lugar de la barra (como la charola). "Listo" a la izquierda; a la derecha lo que no está colocado.
function tray(hot){
  const items = UNPLACED.map(findFurniture);
  return `<div class="house-bar is-tray is-decor${hot ? ' is-hot' : ''}" role="toolbar" aria-label="Muebles guardados">
    <button class="house-act ft-close dc-done" type="button" aria-label="Terminar de decorar">${I.close}<span>Listo</span></button>
    <div class="ft-list">${hot ? `<div class="dc-drop">${I.store}<b>Suelta aquí para guardarlo</b></div>` : items.map(f => `<button class="ft-item dc-item" type="button" aria-label="${f.name}, ${tag(f.zone)}, toca para colocarlo">
      <span class="ft-art">${ART[f.id]}</span><span class="ft-name">${f.short}</span><span class="dc-tag ${f.zone}">${tag(f.zone)}</span></button>`).join('')}</div></div>`;
}

let n = 0;
const jobs = [];
function furnLayer(L, kind, state){
  const spots = LAYOUT[kind];
  const lift = state === 'drag' ? DRAGGED : '';
  const list = Object.keys(spots).map(id => ({ item: findFurniture(id), p: spots[id] }));
  // los muebles que se están usando en Decorar: el seleccionado y el que se arrastra
  if(state === 'decor') {/* el sillón queda seleccionado */}
  let tools = '';   // la barrita del mueble seleccionado va en su propia capa, por encima de Mito
  const box = ({ item, p }) => {
    const r = place(L, item, p);
    const sel = state === 'decor' && item.id === SELECTED;
    const drag = state === 'drag' && item.id === lift;
    const pos = drag ? { ...r, y: r.y - r.h * .1, x: r.x + L.W * .02 } : r;
    const flip = p.flip ? ' is-flip' : '';
    if(sel) tools = `<div class="dc-tools" role="toolbar" aria-label="${item.name}" style="left:${(pos.x + pos.w / 2).toFixed(1)}px;top:${(pos.y - 16).toFixed(1)}px"><button type="button">${I.flip}<span>Voltear</span></button><button type="button">${I.store}<span>Guardar</span></button></div>`;
    return `<div class="furn ${item.zone}${item.flat ? ' flat' : ''}${sel ? ' is-sel' : ''}${drag ? ' is-lift' : ''}${flip}" data-id="${item.id}"
      style="left:${pos.x.toFixed(1)}px;top:${pos.y.toFixed(1)}px;width:${pos.w.toFixed(1)}px;height:${pos.h.toFixed(1)}px">
      ${item.zone === 'floor' && !item.flat ? '<i class="furn-shadow"></i>' : ''}<span class="furn-art">${ART[item.id]}</span></div>`;
  };
  const rugs = list.filter(x => x.item.flat).map(box).join('');
  const wall = list.filter(x => x.item.zone === 'wall').map(box).join('');
  const floor = list.filter(x => x.item.zone === 'floor' && !x.item.flat).sort((a, b) => a.p.v - b.p.v).map(box).join('');
  // zonas (solo mientras se arrastra): se resalta la del mueble que llevas
  let zones = '';
  if(state === 'drag'){
    const yTop = L.horizon + MARGIN, yBot = L.H - L.barSpace - 6;
    zones = `<div class="dc-zone floor is-target" style="left:${MARGIN}px;right:${MARGIN}px;top:${yTop}px;height:${yBot - yTop}px"><b>Piso</b></div>
      <div class="dc-zone wall" style="left:${MARGIN}px;right:${MARGIN}px;top:${MARGIN}px;height:${L.horizon - 2 * MARGIN}px"><b>Pared</b></div>`;
  }
  return `<div class="room-rugs">${rugs}</div><div class="room-furn">${wall}${floor}</div>${zones}<div class="room-tools">${wall && floor ? '' : ''}${tools}</div>`;
}

function houseRoom(w, h, state){
  const s = ++n, id = `dm-${s}`;
  jobs.push(id);
  const L = sceneLayout(w, h, w < 460 ? 76 : 84);
  const kind = L.kind;
  const hint = state === 'decor' ? '<p class="house-hint show">Arrastra un mueble para moverlo · toca uno guardado para colocarlo</p>' : '';
  return `<div class="cmp-room" style="width:${w}px"><div class="house" style="width:${w}px;height:${h}px">
    <div class="room${state === 'placed' ? '' : ' is-decorating'}" data-s="d${s}">
      <div class="room-wall"></div><div class="room-floor"></div><div class="room-base"></div>
      ${furnLayer(L, kind, state)}
      <div class="scene">
        <div class="room-light"></div><div class="win"></div>
        <div class="room-stage">
          <div class="contact contact-mito"></div><div class="contact contact-pet"></div>
          <div class="mascot face-normal" id="${id}"><svg class="mito" viewBox="0 0 150 150"></svg></div>
        </div>
      </div>
      ${hint}
      ${state === 'placed' ? bar() : tray(state === 'drag')}
    </div></div></div>`;
}

/* ---------- Tienda: sección Muebles ---------- */
const OWNED = { 'm-rug': 'Regalo · en tu cuarto', 'm-sofa': 'En tu cuarto', 'm-bed': 'En tu cuarto', 'm-desk': 'En tu inventario' };
const BROKE = { 'm-bookcase': 52 };
const shopCard = (f, i) => {
  const have = OWNED[f.id], need = BROKE[f.id];
  const act = have ? `<button class="btn-mini" type="button" disabled>${have.startsWith('En tu inv') ? 'Colocar en la Casa' : 'Ya lo tienes'}</button>`
    : need ? `<button class="btn-mini" type="button" aria-disabled="true">Te faltan ${need} ⚡</button>`
    : `<button class="btn-mini" type="button">Comprar · ⚡ ${f.cost}</button>`;
  return `<div class="shop-item furn-item${i === 3 ? ' is-trial' : ''}">
    <span class="fi-tag ${f.zone}">${tag(f.zone)}</span>
    ${have ? `<span class="si-have" title="${have}">${have.startsWith('En tu inv') ? '📦' : '✓'}</span>` : ''}
    <div class="si-visual fi-art">${ART[f.id]}</div>
    <div class="si-name">${f.name}</div>
    <div class="si-fill fi-state">${have || 'Una sola vez'}</div>
    <div class="si-actions">${act}</div></div>`;
};
// Mini cuarto de la vista previa (escritorio) y del recuadro (móvil): pared, piso y el mueble apoyado donde le toca.
const mini = (id, w, h) => {
  const f = findFurniture(id), wall = f.zone === 'wall';
  const aw = Math.min(w * .62, f.box[0] * (h * .55 / f.box[1]));
  const ah = aw * f.box[1] / f.box[0];
  const pos = wall ? `top:${(h * .62 - ah) / 2}px` : `bottom:${h * .12}px`;
  return `<div class="room fv-mini" style="width:${w}px;height:${h}px;--horizon:62%"><div class="room-wall"></div><div class="room-floor"></div><div class="room-base"></div>
    <span class="fv-art${f.flat ? ' flat' : ''}" style="width:${aw}px;height:${ah}px;left:${(w - aw) / 2}px;${pos}">${ART[id]}</span></div>`;
};
function shop(w, mobile){
  const sel = findFurniture('m-lamp');
  const preview = mobile ? '' : `<div class="wardrobe-preview fv-preview">
      ${mini('m-lamp', 300, 190)}
      <div class="preview-labels"><div class="pv-row">Mueble: <b>${sel.name}</b></div><div class="pv-row">Va en: <b>${sel.zone === 'wall' ? 'la pared' : 'el piso'}</b></div>
        <div class="pv-row">Se enciende de noche ✨</div><div class="pv-row">Precio: <b>⚡ ${sel.cost}</b></div>
        <button class="btn-mini" type="button" style="margin-top:8px">Comprar · ⚡ ${sel.cost}</button></div></div>`;
  return `<div class="sk-shop${mobile ? ' is-mobile' : ''}" style="width:${w}px">
    <div class="page-head"><div><h2 class="page-title">Tienda</h2>
      <p class="page-sub">La ropa se equipa al comprarla; la comida se guarda en la charola y los muebles se colocan en la Casa.</p></div>
      <div class="shop-head-actions"><div class="balance-chip big"><span class="bc-emoji">⚡</span><span>188</span><span class="bc-label">chispas</span></div></div></div>
    ${preview}
    <div class="shop-cat furn-cat" id="shopFurniture">
      <h3>Muebles <span class="food-cat-sub">Se compran una sola vez. Colócalos donde quieras en la Casa, con “Decorar”.</span></h3>
      <div class="shop-items">${ALL.map(shopCard).join('')}</div></div>
    <div class="shop-cat sk-more"><h3>Comida</h3><p>… debajo siguen las secciones de siempre (comida, ropa, accesorios…).</p></div>
    ${mobile ? `<div class="sk-trial">
      <div class="tb-mito tb-furn">${mini('m-lamp', 124, 96)}</div>
      <div class="tb-text"><b class="tb-name">${sel.name}</b><span class="tb-sub">Muebles · Piso · ⚡ ${sel.cost}</span></div>
      <button type="button" class="btn-mini tb-act">Comprar · ⚡ ${sel.cost}</button>
      <button type="button" class="tb-close" aria-label="Quitar la prueba">×</button></div>` : ''}
  </div>`;
}

export function renderDecor(root){
  document.body.insertAdjacentHTML('afterbegin', FURNITURE_DEFS);
  for(const theme of themes){
    const panel = document.createElement('section');
    panel.className = 'panel decor-sketch' + (q.has('still') ? ' still' : '');
    panel.dataset.theme = theme;
    let html = `<h1>Fase 4 · muebles y decoración · ${theme === 'dark' ? 'oscuro (noche)' : 'claro (día)'} · ${withPet ? 'con el pollito' : 'sin mascota'}</h1>`;
    for(const [k, w, h, label] of SIZES){
      html += `<h2>${label}</h2><div class="pair needs">`;
      for(const [st, stLabel] of STATES) html += `<div data-sk="${st}-${k}"><div class="lbl">${stLabel}</div>${houseRoom(w, h, st)}</div>`;
      html += '</div>';
      if(!q.get('state') || q.get('state') === 'shop')
        html += `<h2>${label} · Tienda, sección Muebles</h2><div data-sk="shop-${k}">${shop(k === '390' ? 390 : 980, k === '390')}</div>`;
    }
    panel.innerHTML = html;
    root.appendChild(panel);
  }
  root.querySelectorAll('.decor-sketch .room:not(.fv-mini)').forEach(r => buildPanes(r));
  for(const id of jobs) previewAvatar('color', LOOK.color, id, LOOK);
  const ro = new ResizeObserver(entries => entries.forEach(e => layoutRoom(e.target)));
  root.querySelectorAll('.decor-sketch .room:not(.fv-mini)').forEach(r => ro.observe(r));
}
