// Fase 3 · BOCETOS (solo dev; los de la propuesta aprobada, con el catálogo real): /dev/house.html?food
//   la charola abierta, arrastrar comida a la boca, Mito comiendo (dato + mascota), con hambre, charola vacía,
//   Mito lleno, y la sección Comida de la Tienda (con la barra de vista previa en móvil). Claro y oscuro,
//   móvil (390 × 714) y escritorio (1176 × 800).
//   ?theme=light|dark   ?size=390|1176   ?state=tray|drag|eat|hungry|empty|full|shop   ?pet=0   ?still
import { previewAvatar } from '../src/features/mascot/avatar.js';
import { buildPanes, layoutRoom } from '../src/features/house/room.js';
import { FOODS as CATALOG } from '../src/content/food.js';
import { FOOD_ART as ART } from '../src/content/art/food.js';
import { PET_EAT } from '../src/content/house.js';
// (los bocetos usan claves cortas: apple, banana…)
const FOOD_ART = Object.fromEntries(Object.entries(ART).map(([k, v]) => [k.slice(2), v]));
const FOODS = CATALOG.map(f => ({ ...f, art: f.id.slice(2) }));

const q = new URLSearchParams(location.search);
const themes = q.get('theme') ? [q.get('theme')] : ['light', 'dark'];
const SIZES = [['390', 390, 714, 'Móvil · 390 × 844'], ['1176', 1176, 800, 'Escritorio · 1440 × 900']].filter(([k]) => !q.get('size') || q.get('size') === k);
const STATES = [
  ['tray', 'Charola abierta (toca o arrastra)'], ['drag', 'Arrastrando a la boca'], ['eat', 'Comiendo: dato y mascota'],
  ['hungry', 'Con hambre'], ['empty', 'Charola vacía'], ['full', 'Ya está lleno'],
].filter(([k]) => !q.get('state') || q.get('state') === k);
const withPet = q.get('pet') !== '0';
const LOOK = withPet
  ? { color: 'c-mint', ropa: 'r-sueter', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-none', pet: 'p-chick' }
  : { color: 'c-mint', ropa: 'r-none', accesorio: 'ac-headphones', sombrero: 's-none', aura: 'a-none', pet: 'p-none' };
const STOCK = { 'f-apple': 3, 'f-carrot': 1, 'f-banana': 2, 'f-yogurt': 1, 'f-egg': 4, 'f-oats': 1, 'f-rice': 2 };   // sin "plato completo"

const I = {
  eat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/></svg>',
  bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v1.5A5.5 5.5 0 0 1 14.5 19h-5A5.5 5.5 0 0 1 4 13.5Z"/><path d="M6 12V6.5a2.2 2.2 0 0 1 4-1.3"/><circle cx="13" cy="7" r="1.3"/><circle cx="16.5" cy="4.6" r="1"/><path d="M7.5 19l-1 2M16.5 19l1 2"/></svg>',
  sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  wardrobe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M9 10v4M15 10v4"/></svg>',
};
const bar = (eatOn, dot) => `<div class="house-bar" role="toolbar">
  <button class="house-act${eatOn ? ' is-on' : ''}${dot ? ' has-dot' : ''}" type="button">${I.eat}<span>${eatOn ? 'Cerrar' : 'Comer'}</span></button>
  <button class="house-act" type="button">${I.bath}<span>Bañar</span></button>
  <button class="house-act" type="button">${I.sleep}<span>Dormir</span></button>
  <button class="house-act" type="button">${I.wardrobe}<span>Armario</span></button></div>`;

const food = id => FOODS.find(f => f.id === id);
// Charola: mientras está abierta ocupa el lugar de la barra de acciones (así no tapa a Mito ni a la mascota).
// A la izquierda, "Cerrar"; a la derecha, la comida que tienes (se desliza de lado si no cabe).
const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const tray = (opts = {}) => {
  const items = FOODS.filter(f => STOCK[f.id]);
  const close = `<button class="house-act ft-close" type="button" aria-label="Cerrar la charola">${CLOSE}<span>Cerrar</span></button>`;
  if(opts.empty) return `<div class="house-bar is-tray" role="toolbar" aria-label="Charola">${close}
    <div class="ft-empty"><span class="ft-plate"></span><div><b>Tu charola está vacía</b><span>Compra comida en la Tienda</span></div>
    <button class="btn-mini" type="button">Ir a la Tienda →</button></div></div>`;
  return `<div class="house-bar is-tray" role="toolbar" aria-label="Charola">${close}
    <div class="ft-list">${items.map(f => `<button class="ft-item${opts.picked === f.id ? ' is-picked' : ''}${opts.wiggle === f.id ? ' is-nope' : ''}" type="button" aria-label="${f.name}, tienes ${STOCK[f.id]}">
      <span class="ft-art">${FOOD_ART[f.art]}</span><span class="ft-count">${STOCK[f.id]}</span><span class="ft-name">${f.short}</span></button>`).join('')}</div></div>`;
};

/* Bocas nuevas de Mito (propuesta): una copia recortada del cuerpo tapa la boca de la cara y encima va la boca nueva,
   con la misma técnica que los párpados. Así funciona con cualquier piel. */
const MOUTHS = {
  open: '<ellipse cx="75" cy="103" rx="8" ry="8.5" fill="#3a2247" stroke="#2b2140" stroke-width="3"/><ellipse cx="75" cy="108" rx="5" ry="2.8" fill="#ff8fa8"/>',
  chew: '<path d="M64 102q5.5-4 11 0t11 0" fill="none" stroke="#2b2140" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>',
  hungry: '<path d="M64 100Q75 107 86 100" fill="none" stroke="#2b2140" stroke-width="3.6" stroke-linecap="round"/><path d="M80 103q4 0 5.5 3.6q-3 3.6-6.4.4z" fill="#ff8fa8" stroke="#e0607e" stroke-width="1.4" stroke-linejoin="round"/>',
};
function setMouth(id, kind){
  const svg = document.querySelector(`#${id} > svg.mito`);
  if(!svg || !MOUTHS[kind]) return;
  const mb = svg.querySelector('g[id^="mb-"]').id;
  svg.querySelector('defs').insertAdjacentHTML('beforeend', `<clipPath id="mo-${id}"><rect x="54" y="91" width="42" height="24" rx="10"/></clipPath>`);
  // va justo después de los párpados (antes de la ropa)
  const lids = [...svg.querySelectorAll('.lid')].pop();
  const g = `<g class="mouth"><use href="#${mb}" clip-path="url(#mo-${id})"/>${MOUTHS[kind]}</g>`;
  if(lids) lids.insertAdjacentHTML('afterend', g); else svg.querySelector('.rig').insertAdjacentHTML('beforeend', g);
}

let n = 0;
const jobs = [];
function houseRoom(w, h, st){
  const s = ++n, id = `fm-${s}`;
  const face = st === 'eat' || st === 'full' ? 'face-happy' : 'face-normal';
  const mouth = { drag: 'open', eat: 'chew', hungry: 'hungry' }[st];
  jobs.push([id, mouth]);
  const speech = {
    eat: food('f-apple').say, hungry: '¿Comemos algo rico? 🍎', empty: '¡Vamos por comida a la Tienda!', full: '¡Estoy llenito! Gracias 💕',
  }[st];
  let extra = '';
  if(st === 'drag') extra = `<div class="sk-ghost">${FOOD_ART.banana}</div><div class="sk-target"></div>`;
  if(st === 'eat') extra = `<div class="sk-bite">${FOOD_ART.apple}</div><i class="sk-crumb" style="--x:-.16;--y:.02"></i><i class="sk-crumb" style="--x:.14;--y:.05"></i><i class="sk-crumb" style="--x:.05;--y:.12"></i>${withPet ? '<i class="sk-crumb to-pet" style="--x:-.62;--y:.14"></i>' : ''}`;
  if(st === 'hungry') extra = `<div class="hunger-think"><i></i><i></i><span>${FOOD_ART.apple}</span></div><div class="hunger-rumble"><i></i><i></i></div>`;
  const petBubble = st === 'eat' && withPet ? `<div class="pet-bubble show sk-pet-bubble">${PET_EAT.chick}</div>` : '';
  const fact = st === 'eat' ? `<div class="food-fact show" role="status"><span class="ff-art">${FOOD_ART.apple}</span><div><b>Dato de nutrición</b><span>${food('f-apple').fact}</span></div></div>` : '';
  const showTray = ['tray', 'drag', 'eat', 'empty', 'full'].includes(st);
  return `<div class="cmp-room" style="width:${w}px"><div class="house" style="width:${w}px;height:${h}px">
    <div class="room${st === 'eat' && withPet ? ' sk-pet-near' : ''}" data-s="f${s}" data-need="${st === 'hungry' ? 'hungry' : ''}">
      <div class="room-wall"></div><div class="room-floor"></div><div class="room-base"></div>
      <div class="scene">
        <div class="room-light"></div><div class="win"></div>
        <div class="room-stage">
          <div class="contact contact-mito"></div><div class="contact contact-pet"></div>
          <div class="mascot ${face}" id="${id}"><svg class="mito" viewBox="0 0 150 150"></svg>${petBubble}</div>
        </div>
        ${extra}
        ${speech ? `<div class="house-speech show sk-speech" data-side="above">${speech}</div>` : ''}
      </div>
      ${st === 'tray' ? '<p class="house-hint show">Toca un alimento o arrástralo a su boca</p>' : ''}
      ${fact}
      ${showTray ? tray({ empty: st === 'empty', picked: st === 'drag' ? 'f-banana' : '', wiggle: st === 'full' ? 'f-egg' : '' }) : bar(false, st === 'hungry')}
    </div></div></div>`;
}

/* ---------- Tienda: sección Comida ---------- */
function shopCard(f, i){
  const have = { 'f-apple': 3, 'f-egg': 4, 'f-banana': 2, 'f-plate': 0, 'f-rice': 99 }[f.id] || 0;
  const broke = f.id === 'f-plate';         // ejemplo sin saldo
  const max = have >= 99;
  const btn = max ? '<button class="btn-mini" type="button" disabled>Máximo 99</button>'
    : broke ? '<button class="btn-mini" type="button" aria-disabled="true">Te faltan 12 ⚡</button>'
    : `<button class="btn-mini" type="button">Comprar · ⚡ ${f.cost}</button>`;
  return `<div class="shop-item food-item${i === 0 ? ' is-trial' : ''}">
    ${have ? `<span class="si-have" aria-label="Tienes ${have}">×${have}</span>` : ''}
    <div class="si-visual">${FOOD_ART[f.art]}</div>
    <div class="si-name">${f.name}</div>
    <div class="si-fill"><i style="--p:${f.fill}%"></i>Llena ${f.fill} %</div>
    <div class="si-actions">${btn}</div></div>`;
}
function shop(w, mobile){
  return `<div class="sk-shop${mobile ? ' is-mobile' : ''}" style="width:${w}px">
    <div class="page-head"><div><h2 class="page-title">Tienda</h2>
      <p class="page-sub">Descubre lo que aún no tienes. La ropa se equipa al comprarla; la comida se guarda en la charola de la Casa.</p></div>
      <div class="shop-head-actions"><div class="balance-chip big"><span class="bc-emoji">⚡</span><span>38</span><span class="bc-label">chispas</span></div></div></div>
    <div class="shop-cat food-cat" id="shopFood">
      <h3>Comida <span class="food-cat-sub">Se compra por unidad y se gasta al dársela a Mito.</span></h3>
      <div class="shop-items">${FOODS.map(shopCard).join('')}</div>
    </div>
    <div class="shop-cat sk-more"><h3>Ropa</h3><p>… debajo siguen las secciones de siempre (ropa, accesorios, sombreros, auras, mascotas).</p></div>
    ${mobile ? `<div class="sk-trial">
      <div class="tb-mito tb-food">${FOOD_ART.apple}</div>
      <div class="tb-text"><b class="tb-name">Manzana · tienes 3</b><span class="tb-sub">Comida · Llena 25 % · ⚡ 10</span></div>
      <button type="button" class="btn-mini tb-act">Comprar otra · ⚡ 10</button>
      <button type="button" class="tb-close" aria-label="Quitar la prueba">×</button></div>` : ''}
  </div>`;
}

export function renderFood(root){
  for(const theme of themes){
    const panel = document.createElement('section');
    panel.className = 'panel food-sketch' + (q.has('still') ? ' still' : '');
    panel.dataset.theme = theme;
    let html = `<h1>Fase 3 · la comida · ${theme === 'dark' ? 'oscuro' : 'claro'} · ${withPet ? 'con el pollito' : 'sin mascota'}</h1>`;
    for(const [k, w, h, label] of SIZES){
      html += `<h2>${label}</h2><div class="pair needs">`;
      for(const [st, stLabel] of STATES) html += `<div data-sk="${st}-${k}"><div class="lbl">${stLabel}</div>${houseRoom(w, h, st)}</div>`;
      html += '</div>';
      if(!q.get('state') || q.get('state') === 'shop')
        html += `<h2>${label} · Tienda, sección Comida</h2><div data-sk="shop-${k}">${shop(k === '390' ? 390 : 980, k === '390')}</div>`;
    }
    panel.innerHTML = html;
    root.appendChild(panel);
  }
  root.querySelectorAll('.food-sketch .room').forEach(r => buildPanes(r));
  for(const [id, mouth] of jobs){
    previewAvatar('color', LOOK.color, id, LOOK);
    if(mouth) setMouth(id, mouth);
  }
  const ro = new ResizeObserver(entries => entries.forEach(e => layoutRoom(e.target)));
  root.querySelectorAll('.food-sketch .room').forEach(r => ro.observe(r));
}
