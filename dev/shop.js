// Tienda nueva · BOCETOS (solo dev; propuesta): /dev/shop.html
//   pestañas por tipo de producto, una sección de Mito (Ropa), Comida, Muebles con su filtro y una sección completa.
//   Cada boceto mide una pantalla (escritorio: la zona de contenido de 1440 × 900; móvil: 390 × 844), para ver cuánto
//   cabe sin bajar. ?theme=light|dark   ?size=1440|390   ?state=ropa|food|furn|done
import { WARDROBE } from '../src/content/wardrobe.js';
import { FOODS } from '../src/content/food.js';
import { FOOD_ART } from '../src/content/art/food.js';
import { FURNITURE } from '../src/content/furniture.js';
import { FURNITURE_ART, FURNITURE_DEFS } from '../src/content/art/furniture.js';
import { ROOMS } from '../src/content/rooms.js';
import { itemThumb, previewAvatar } from '../src/features/mascot/avatar.js';

const q = new URLSearchParams(location.search);
const themes = q.get('theme') ? [q.get('theme')] : ['light', 'dark'];
const SIZES = [['1440', 1176, 900, 'Escritorio · 1440 × 900 (zona de contenido)'], ['390', 390, 844, 'Móvil · 390 × 844']].filter(([k]) => !q.get('size') || q.get('size') === k);
const STATES = [['ropa', 'Ropa (una sección de Mito) · ordenar y "Me alcanza"'], ['food', 'Comida'], ['furn', 'Muebles con su filtro por cuarto'], ['done', 'Sección completa (Sombreros)']]
  .filter(([k]) => !q.get('state') || q.get('state') === k);
const CHISPAS = 120;
const LOOK = { color: 'c-mint', ropa: 'r-none', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-none', pet: 'p-chick' };

const SVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
// Una pestaña por tipo de producto. Temporada solo si hay objetos de temporada a la venta.
const TABS = [
  ['color', 'Piel', SVG('<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/>')],
  ['ropa', 'Ropa', SVG('<path d="M8 4 4 7l2 4 2-1v10h8V10l2 1 2-4-4-3q-1 2-4 2T8 4Z"/>')],
  ['accesorio', 'Accesorios', SVG('<circle cx="7" cy="14" r="3.5"/><circle cx="17" cy="14" r="3.5"/><path d="M10.5 14h3M3.5 13 5 8M20.5 13 19 8"/>')],
  ['sombrero', 'Sombreros', SVG('<path d="M3 17h18M6 17c0-5 2-9 6-9s6 4 6 9"/><path d="M9 13h6"/>')],
  ['aura', 'Auras', SVG('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>')],
  ['pet', 'Mascotas', SVG('<circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="10" cy="5" r="1.8"/><circle cx="14" cy="5" r="1.8"/><path d="M12 12c-3 0-5 3-5 5 0 1.5 1.5 2.5 3 2l2-.6 2 .6c1.5.5 3-.5 3-2 0-2-2-5-5-5Z"/>')],
  ['food', 'Comida', SVG('<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/>')],
  ['furn', 'Muebles', SVG('<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2.5 13a2 2 0 0 1 4 0v1.5h11V13a2 2 0 0 1 4 0v5H2.5Z"/><path d="M5 18v2M19 18v2"/>')],
  ['season', 'Temporada', SVG('<path d="M12 6c-5 0-8 3-8 7s3 7 8 7 8-3 8-7-3-7-8-7Z"/><path d="M12 6V3M9 6.5c0 4 0 9 3 13.5M15 6.5c0 4 0 9-3 13.5"/>')],
];
const tabsBar = active => `<nav class="s2-tabs" role="tablist" aria-label="Secciones de la Tienda">${TABS.map(([id, name, icon]) =>
  `<button type="button" role="tab" class="s2-tab" aria-selected="${id === active}">${icon}<span>${name}</span></button>`).join('')}</nav>`;
// Herramientas: en escritorio, los tres órdenes a la vista; en el teléfono, un botón compacto que abre la lista.
const SORTS = [['rec', 'Recomendado'], ['up', 'Precio ↑'], ['down', 'Precio ↓']];
const tools = (title, left, sort = 'rec', afford = false, done = false) => `<div class="s2-tools${done ? ' is-done' : ''}">
  <h3>${title} <small>${left}</small></h3>
  ${done ? '' : `<div class="s2-sort" role="group" aria-label="Ordenar"><span>Ordenar</span>${SORTS.map(([k, n]) => `<button type="button" aria-pressed="${k === sort}">${n}</button>`).join('')}</div>
  <button type="button" class="s2-sort-m" aria-haspopup="listbox">${SORTS.find(x => x[0] === sort)[1]} <b>▾</b></button>
  <label class="s2-afford"><input type="checkbox"${afford ? ' checked' : ''}><i></i>Me alcanza</label>`}</div>`;

// Tarjeta: siempre dibujo, nombre, precio y botón (mismo alto); las etiquetas que ya existen, arriba.
const btn = cost => cost > CHISPAS ? `<button type="button" class="btn-mini" aria-disabled="true">Te faltan ${cost - CHISPAS} ⚡</button>` : '<button type="button" class="btn-mini">Comprar</button>';
const card = ({ art, name, price, button, tag = '', badge = '', sel = false, wide = false }) => `<div class="shop-item s2-card${sel ? ' is-trial' : ''}">
  ${tag}${badge}<div class="si-visual s2-visual${wide ? ' wide' : ''}">${art}</div>
  <div class="si-name s2-name">${name}</div><div class="s2-price">${price}</div><div class="s2-act">${button}</div></div>`;

let n = 0;
const jobs = [];
const mitoBox = (cls = '') => { const id = `sh-${++n}`; jobs.push(id); return { id, html: `<div class="mascot face-happy ${cls}" id="${id}"><svg class="mito" viewBox="0 0 150 150"></svg></div>` }; };
const miniRoom = f => `<div class="fv-mini s2-mini"><span class="fv-wall"></span><span class="fv-floor"></span><span class="fv-base"></span>
  <span class="fv-art ${f.zone}${f.flat ? ' flat' : ''}">${FURNITURE_ART[f.id].replace('<svg ', `<svg preserveAspectRatio="${f.zone === 'wall' ? 'xMidYMid' : 'xMidYMax'} meet" `)}</span></div>`;

function section(state){
  if(state === 'ropa'){
    const cat = WARDROBE.find(c => c.id === 'ropa');
    const items = cat.items.filter(i => i.cost > 0 && !i.secret && !i.seasonal).slice().sort((a, b) => a.cost - b.cost);
    const sel = items[3];
    return { tab: 'ropa', preview: { kind: 'mito', item: ['ropa', sel.id], name: sel.name, sub: `Ropa · ⚡ ${sel.cost}`, btn: btn(sel.cost) },
      body: tools('Ropa', `${items.length} por comprar`, 'up') + `<div class="shop-items s2-grid">${items.map(i => card({ art: itemThumb('ropa', i), name: i.name, price: `⚡ ${i.cost}`, button: btn(i.cost), sel: i === sel })).join('')}</div>` };
  }
  if(state === 'food'){
    const have = { 'f-apple': 3, 'f-egg': 4, 'f-banana': 2 };
    const sel = FOODS[0];
    return { tab: 'food', preview: { kind: 'art', art: FOOD_ART[sel.id], name: `${sel.name} · tienes 3`, sub: `Comida · Llena ${sel.fill} % · ⚡ ${sel.cost}`, btn: '<button type="button" class="btn-mini">Comprar otra</button>' },
      body: tools('Comida', 'se compra por unidad') + `<div class="shop-items s2-grid">${FOODS.map(f => card({ art: FOOD_ART[f.id], name: f.name, price: `⚡ ${f.cost} <em>· llena ${f.fill} %</em>`, button: btn(f.cost),
        badge: have[f.id] ? `<span class="si-have">×${have[f.id]}</span>` : '', sel: f === sel })).join('')}</div>` };
  }
  if(state === 'furn'){
    const owned = ['m-rug', 'm-bed', 'm-lamp'];
    const list = FURNITURE.filter(f => f.room === 'bedroom' && !owned.includes(f.id));   // lo comprado ya no aparece
    const sel = FURNITURE.find(f => f.id === 'm-desk');
    const chips = `<div class="furn-filter" role="group">${[['all', 'Todos'], ...ROOMS.map(r => [r.id, r.name])].map(([id, name]) => `<button type="button" class="ff-chip" aria-pressed="${id === 'bedroom'}">${name}</button>`).join('')}</div>`;
    return { tab: 'furn', preview: { kind: 'room', f: sel, name: sel.name, sub: `Muebles · Piso · ⚡ ${sel.cost}`, btn: btn(sel.cost) },
      body: tools('Muebles', 'se compran una vez') + chips + `<div class="shop-items s2-grid">${list.map(f => card({
        art: FURNITURE_ART[f.id], wide: true, name: f.name, price: `⚡ ${f.cost}`, button: btn(f.cost),
        tag: `<span class="fi-tag ${f.zone}">${f.zone === 'wall' ? 'Pared' : 'Piso'}</span>`, sel: f === sel })).join('')}</div>` };
  }
  // sección completa
  const m = mitoBox('s2-done-mito');
  return { tab: 'sombrero', preview: null,
    body: tools('Sombreros', 'todo comprado', 'rec', false, true) + `<div class="s2-done">${m.html}<div><b>¡Ya tienes todo de esta sección!</b><span>Tus sombreros están en el Armario: ponte el que quieras.</span></div>
      <button type="button" class="btn-mini equip-only">Ir al Armario →</button></div>` };
}

function screen(w, h, state, mobile){
  const s = section(state);
  let preview = '';
  if(s.preview){
    const p = s.preview;
    let vis = '';
    if(p.kind === 'mito'){ const m = mitoBox(); vis = m.html; jobs[jobs.length - 1] = [m.id, p.item]; }
    else if(p.kind === 'art') vis = `<span class="s2-pv-art">${p.art}</span>`;
    else vis = miniRoom(p.f);
    preview = mobile
      ? `<div class="sk-trial s2-trial"><div class="tb-mito${p.kind === 'room' ? ' tb-room' : ''}">${vis}</div><div class="tb-text"><b class="tb-name">${p.name}</b><span class="tb-sub">${p.sub}</span></div>${p.btn.replace('btn-mini', 'btn-mini tb-act')}<button type="button" class="tb-close">×</button></div>`
      : `<div class="s2-preview"><div class="s2-pv-vis ${p.kind}">${vis}</div><div class="s2-pv-text"><b>${p.name}</b><span>${p.sub}</span></div>${p.btn}</div>`;
  }
  const head = `<div class="s2-head"><h2 class="page-title">Tienda</h2><div class="s2-head-r"><div class="balance-chip${mobile ? '' : ' big'}"><span class="bc-emoji">⚡</span><span>${CHISPAS}</span><span class="bc-label">chispas</span></div>
    <button class="btn-mini equip-only" type="button">Armario →</button></div></div>`;
  return `<div class="s2-screen${mobile ? ' is-mobile' : ''}" style="width:${w}px;height:${h}px">
    <div class="s2-scroll">${head}
      <div class="s2-sticky">${tabsBar(s.tab)}${mobile ? '' : preview}</div>
      <section class="s2-section">${s.body}</section></div>
    ${mobile ? preview + '<div class="s2-nav">barra de navegación</div>' : ''}
  </div>`;
}

export function render(root){
  document.body.insertAdjacentHTML('afterbegin', FURNITURE_DEFS);
  for(const theme of themes){
    const panel = document.createElement('section');
    panel.className = 'panel';
    panel.dataset.theme = theme;
    let html = `<h1>Tienda nueva · ${theme === 'dark' ? 'oscuro' : 'claro'}</h1>`;
    for(const [k, w, h, label] of SIZES){
      html += `<h2>${label}</h2><div class="pair">`;
      for(const [st, stLabel] of STATES) html += `<div data-sk="${st}-${k}"><div class="lbl">${stLabel}</div>${screen(w, h, st, k === '390')}</div>`;
      html += '</div>';
    }
    panel.innerHTML = html;
    root.appendChild(panel);
  }
  for(const j of jobs){
    if(Array.isArray(j)){ const [id, [cat, item]] = j; previewAvatar(cat, item, id, LOOK); }
    else previewAvatar('color', LOOK.color, j, LOOK);
  }
  // en el teléfono, la pestaña activa se centra sola en su fila
  root.querySelectorAll('.is-mobile .s2-tabs').forEach(bar=>{
    const t = bar.querySelector('[aria-selected="true"]');
    bar.scrollLeft = t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2;
    bar.classList.toggle('can-left', bar.scrollLeft > 2);
    bar.classList.toggle('can-right', bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2);
  });
  requestAnimationFrame(()=> requestAnimationFrame(()=>{ document.body.dataset.ready = '1'; }));
}
