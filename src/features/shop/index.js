// Tienda y armario: tarjetas de producto, compra/equipar y la vista previa.
// La Tienda va por pestañas, una por tipo de producto (Piel, Ropa, Accesorios, Sombreros, Auras, Mascotas, Comida,
// Muebles y, en temporada, Temporada); se ve una sección a la vez, con ordenar por precio y "Me alcanza". Qué se vende
// en cada una (lo comprado ya no aparece, salvo la comida) es lógica pura: catalog.js. La Tienda recuerda la última
// pestaña (state/preferences.js) y los accesos de otras partes (shop:focus) abren directo en la que corresponde.

import { clear, byId, delegate } from '../../core/dom.js';
import { WARDROBE, findItem, findItemById, categoryOf, isSeasonalOpen } from '../../content/wardrobe.js';
import {
  getChispas, getEquipped, owns, buyAndEquip, equipCategory,
  getPetName, getPetDisplayName, renamePet, getPetLook, setPetLook, foodCount, buyFood, getDecor, buyFurniture,
  getShopTab, setShopTab,
  SEASON_GIFT_REWARD, hasClaimedSeasonGift, claimSeasonGift,
} from '../../state/store.js';
import { FOOD_MAX, findFood } from '../../content/food.js';
import { FOOD_ART } from '../../content/art/food.js';
import { findFurniture } from '../../content/furniture.js';
import { ROOMS } from '../../content/rooms.js';
import { SORTS, tabsFor, validTab, shopView, focusTarget } from './catalog.js';
import { FURNITURE_ART, FURNITURE_DEFS } from '../../content/art/furniture.js';
import { on, emit } from '../../core/bus.js';
import { applyAvatar, previewAvatar, itemThumb } from '../mascot/avatar.js';
import { sparkAt } from '../mascot/effects.js';
import { petSay } from '../mascot/speech.js';

const SEASON_CLOSED = 'La temporada ha terminado. Tus compras siguen disponibles en el armario.';
const ACTION_FAILED = 'No se pudo completar la acción. Revisa tu saldo y tu colección.';
const PET_NAME_MAX = 20;
let petNameReturnFocus = null;

// Móvil (≤ 880 px): tocar un objeto lo pone "en prueba" (vista previa grande + barra fija); comprar o equipar solo con el botón de la barra.
const isMobile = ()=> !!window.matchMedia?.('(max-width: 880px)').matches;
let trial = null;   // { cat, id } del objeto en prueba, o { food: true, id } para la comida, o { furn: true, id } para un mueble
let focusOnShow = null;   // { tab, room }: al abrir la Tienda, ir a esa pestaña (accesos desde la Casa: catalog.js, focusTarget)
const reducedMotion = ()=> !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function displayName(cat, item, custom){
  return custom && cat === 'pet' ? getPetDisplayName(item.id) : item.name;
}

function petLookOptions(){
  const colorCat = WARDROBE.find(cat=>cat.id === 'color');
  const colors = colorCat ? colorCat.items.filter(item=>!item.secret && (item.cost === 0 || owns(item.id))) : [];
  return [{ id:'', name:'Original', swatch:'linear-gradient(135deg,#fff,#f2e8ff)' }, ...colors];
}

function esc(text){
  return String(text).replace(/[&<>"]/g, c=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

/* ---------- Saldo y etiquetas de la vista previa ---------- */
export function updateBalance(){
  const n = getChispas();
  const side = byId('sideSparks');
  const bal = byId('sparkBalance');
  if(side) side.textContent = n;
  if(bal) bal.textContent = n;
}

const PREVIEW_LABELS = [
  ['pvColor','color'], ['pvRopa','ropa'], ['pvAccesorio','accesorio'],
  ['pvSombrero','sombrero'], ['pvAura','aura'], ['pvPet','pet'],
];

export function updatePreviewLabels(){
  const eq = getEquipped();
  PREVIEW_LABELS.forEach(([elId, catId])=>{
    const item = findItem(catId, eq[catId]);
    const node = byId(elId);
    if(node) node.textContent = item ? displayName(catId, item, elId === 'pvPet') : '—';
  });
  document.querySelectorAll('[data-equipped-label]').forEach(node=>{
    const cat = node.dataset.equippedLabel;
    const item = findItem(cat, eq[cat]);
    node.textContent = item ? displayName(cat, item, true) : '—';
  });
}

// Texto del botón de compra: con saldo, el precio; sin saldo, cuántas chispas faltan.
function buyLabel(item){
  const missing = item.cost - getChispas();
  return missing > 0 ? `Te faltan ${missing} ⚡` : 'Comprar · ⚡ ' + item.cost;
}

/* ---------- Colecciones ---------- */
export function renderShop(){
  renderStore();
  renderCollection('wardrobeHost');
  syncTrial();
}

/* ---------- La Tienda: pestañas y secciones ---------- */
// tab: la pestaña que se ve (null: la última visitada, guardada); sort y afford se reinician al salir de la Tienda;
// room: el filtro por cuarto de Muebles.
const store = { tab: null, sort: 'rec', afford: false, room: 'all' };
const SVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const TAB_ICONS = {
  color: SVG('<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/>'),
  ropa: SVG('<path d="M8 4 4 7l2 4 2-1v10h8V10l2 1 2-4-4-3q-1 2-4 2T8 4Z"/>'),
  accesorio: SVG('<circle cx="7" cy="14" r="3.5"/><circle cx="17" cy="14" r="3.5"/><path d="M10.5 14h3M3.5 13 5 8M20.5 13 19 8"/>'),
  sombrero: SVG('<path d="M3 17h18M6 17c0-5 2-9 6-9s6 4 6 9"/><path d="M9 13h6"/>'),
  aura: SVG('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  pet: SVG('<circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="10" cy="5" r="1.8"/><circle cx="14" cy="5" r="1.8"/><path d="M12 12c-3 0-5 3-5 5 0 1.5 1.5 2.5 3 2l2-.6 2 .6c1.5.5 3-.5 3-2 0-2-2-5-5-5Z"/>'),
  food: SVG('<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/>'),
  furn: SVG('<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2.5 13a2 2 0 0 1 4 0v1.5h11V13a2 2 0 0 1 4 0v5H2.5Z"/><path d="M5 18v2M19 18v2"/>'),
  season: SVG('<path d="M12 6c-5 0-8 3-8 7s3 7 8 7 8-3 8-7-3-7-8-7Z"/><path d="M12 6V3M9 6.5c0 4 0 9 3 13.5M15 6.5c0 4 0 9-3 13.5"/>'),
};
// Lo que dice una sección cuando ya tienes todo, y adónde lleva.
const DONE = {
  color: 'Todos los colores de piel están en tu Armario.', ropa: 'Tu ropa está en el Armario: ponte la que quieras.',
  accesorio: 'Tus accesorios están en el Armario.', sombrero: 'Tus sombreros están en el Armario: ponte el que quieras.',
  aura: 'Tus auras están en el Armario.', pet: 'Tus mascotas te esperan en el Armario.',
  season: 'Toda la colección de temporada está en tu Armario.', furn: 'Todos tus muebles están en la Casa: acomódalos con “Decorar”.',
};
const SECTION_IDS = { food: 'shopFood', furn: 'shopFurniture' };

const currentTab = ()=> (store.tab = validTab(store.tab || getShopTab(), isSeasonalOpen()));

function renderStore(){
  const host = byId('shopHost');
  if(!host) return;
  // el foco vuelve a la herramienta que se usó (ordenar, "Me alcanza", el filtro por cuarto)
  const focused = host.contains(document.activeElement) ? document.activeElement : null;
  const again = focused && ['shopSort', 'shopSortSelect', 'shopAfford', 'furnRoom'].map(k => focused.dataset[k] != null ? `[data-${k.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}="${focused.dataset[k]}"]` : '').find(Boolean);
  clear(host);
  const tab = currentTab();
  renderTabs(tab);
  const furniture = new Set(getDecor().owned);
  const ctx = { owns, ownsFurniture: id => furniture.has(id), seasonOpen: isSeasonalOpen(), chispas: getChispas(), sort: store.sort, afford: store.afford };
  tabsFor(ctx.seasonOpen).forEach(t => {
    const section = buildSection(t, ctx, t.id === tab);
    if(t.id === 'season'){
      section.insertAdjacentHTML('beforeend', `<div class="shop-season-gift">
        <button type="button" class="btn-mini" data-season-gift></button>
        <span>Un regalo para ti · una sola vez por partida</span>
      </div>`);
    }
    host.appendChild(section);
  });
  syncSeasonGift();
  if(again) host.querySelector(`.shop-sec:not([hidden]) ${again}`)?.focus({ preventScroll: true });
  renderSpot();
}

function syncSeasonGift(){
  const button = document.querySelector('[data-season-gift]');
  if(!button) return;
  const claimed = hasClaimedSeasonGift();
  button.disabled = claimed;
  button.textContent = claimed ? '✓ Regalo reclamado · 10 000 ⚡' : `🎁 Recibir ${SEASON_GIFT_REWARD.toLocaleString('es-MX')} chispas ⚡`;
}

function renderTabs(active){
  const bar = byId('shopTabs');
  if(!bar) return;
  bar.innerHTML = tabsFor(isSeasonalOpen()).map(t => `<button type="button" role="tab" class="shop-tab" id="shopTab-${t.id}" data-shop-tab="${t.id}"
      aria-selected="${t.id === active}" aria-controls="${SECTION_IDS[t.id] || 'shopSec-' + t.id}" tabindex="${t.id === active ? 0 : -1}">${TAB_ICONS[t.id]}<span>${t.name}</span></button>`).join('');
  centerTab(false);
}

// En el teléfono las pestañas van en una fila con scroll: la activa se centra sola y el desvanecido va del lado donde hay más.
function tabsFade(){
  const bar = byId('shopTabs');
  if(!bar) return;
  bar.classList.toggle('can-left', bar.scrollLeft > 4);
  bar.classList.toggle('can-right', bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 4);
}
function centerTab(smooth = true){
  const bar = byId('shopTabs'), t = bar?.querySelector('[aria-selected="true"]');
  if(t && bar.scrollWidth > bar.clientWidth){
    const x = t.getBoundingClientRect().left - bar.getBoundingClientRect().left + bar.scrollLeft;
    bar.scrollTo?.({ left: x - (bar.clientWidth - t.offsetWidth) / 2, behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' });
  }
  tabsFade();
}

// Cambiar de pestaña: se muestra solo esa sección (ya están todas pintadas) y se recuerda.
function selectTab(id, { focus = false } = {}){
  const tab = validTab(id, isSeasonalOpen());
  store.tab = tab;
  setShopTab(tab);
  document.querySelectorAll('#shopHost .shop-sec').forEach(sec => { sec.hidden = sec.dataset.tab !== tab; });
  document.querySelectorAll('#shopTabs .shop-tab').forEach(b=>{
    const on = b.dataset.shopTab === tab;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
  });
  if(focus) byId('shopTab-' + tab)?.focus({ preventScroll: true });
  centerTab();
  clearTrial();
  spot = null;
  renderSpot();
  // si se había bajado, la sección nueva empieza arriba (debajo de las pestañas fijas)
  const host = byId('shopHost'), top = byId('shopTop');
  if(host && top){
    const y = window.scrollY + host.getBoundingClientRect().top - top.offsetHeight - 8;
    if(window.scrollY > y) window.scrollTo({ top: Math.max(0, y), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }
}

function buildSection(t, ctx, active){
  const sec = document.createElement('section');
  sec.className = 'shop-sec';
  sec.dataset.tab = t.id;
  sec.id = SECTION_IDS[t.id] || 'shopSec-' + t.id;
  sec.setAttribute('role', 'tabpanel');
  sec.setAttribute('aria-labelledby', 'shopTab-' + t.id);
  sec.hidden = !active;
  const view = shopView(t.id, { ...ctx, room: t.id === 'furn' ? store.room : 'all' });
  const left = t.id === 'food' ? 'se compra por unidad y se gasta en la Casa'
    : view.complete ? 'todo comprado'
    : t.id === 'furn' ? `${view.all.length} por comprar · una sola vez cada uno` : `${view.all.length} por comprar`;
  sec.innerHTML = `<div class="shop-tools${view.complete ? ' is-done' : ''}">
      <h3>${t.name} <small>${left}</small></h3>
      ${view.complete ? '' : `<div class="shop-sort" role="group" aria-label="Ordenar"><span>Ordenar</span>${SORTS.map(([k, n]) =>
        `<button type="button" data-shop-sort="${k}" aria-pressed="${k === ctx.sort}">${n}</button>`).join('')}</div>
      <label class="shop-sort-m"><span class="sr-only">Ordenar</span><select data-shop-sort-select="${t.id}">${SORTS.map(([k, n]) =>
        `<option value="${k}"${k === ctx.sort ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="shop-afford"><input type="checkbox" data-shop-afford="${t.id}"${ctx.afford ? ' checked' : ''}><i aria-hidden="true"></i>Me alcanza</label>`}
    </div>`;
  if(t.id === 'furn' && !view.complete){
    if(!document.getElementById('furnDefs')) document.body.insertAdjacentHTML('afterbegin', FURNITURE_DEFS);
    sec.insertAdjacentHTML('beforeend', `<div class="furn-filter" role="group" aria-label="Ver los muebles de">${[['all', 'Todos'], ...ROOMS.map(r => [r.id, r.name])].map(([id, name]) =>
      `<button type="button" class="ff-chip" data-furn-room="${id}" aria-pressed="${id === store.room}">${name}</button>`).join('')}</div>`);
  }
  if(view.complete){
    const toHouse = t.id === 'furn';
    sec.insertAdjacentHTML('beforeend', `<div class="shop-done"><div class="mascot face-happy" aria-hidden="true"><svg class="mito" viewBox="0 0 150 150"></svg></div>
      <div><b>¡Ya tienes todo de esta sección!</b><span>${DONE[t.id]}</span></div>
      <button type="button" class="btn-mini equip-only" data-nav="${toHouse ? 'house' : 'wardrobe'}">${toHouse ? 'Ir a la Casa →' : 'Ir al Armario →'}</button></div>`);
    return sec;
  }
  if(!view.shown.length){
    // con "Me alcanza" no queda nada; o en Muebles, nada de ese cuarto
    sec.insertAdjacentHTML('beforeend', ctx.afford && view.all.length
      ? `<div class="shop-empty"><b>Con tus chispas aún no alcanza nada aquí</b><span>Juega una ronda del quiz para ganar más ⚡</span>
          <button type="button" class="btn-mini" data-shop-afford-off>Ver todo</button></div>`
      : `<div class="shop-empty"><b>Ya tienes todos los muebles de este cuarto</b><span>Mira los de los otros cuartos.</span>
          <button type="button" class="btn-mini" data-furn-room="all">Ver todos</button></div>`);
    return sec;
  }
  const grid = document.createElement('div');
  grid.className = 'shop-items';
  if(t.id === 'season') grid.id = 'seasonalShopHost';
  view.shown.forEach(e=>{
    if(e.kind === 'food') grid.appendChild(buildFoodCard(e.item));
    else if(e.kind === 'furn') grid.appendChild(buildFurnitureCard(e.item));
    else grid.appendChild(buildCard(WARDROBE.find(c => c.id === e.cat), e.item, { shopping: true, equipped: false, previewId: 'mascotPreview' }));
  });
  sec.appendChild(grid);
  return sec;
}

/* ---------- vista previa compacta (escritorio) ----------
   Muestra el último objeto por el que pasaste el cursor (o que enfocaste): Mito con él puesto (o con la mascota), el
   alimento o el mini cuarto del mueble, con su nombre, su precio y el botón de compra. En móvil la vista previa es la
   barra flotante (renderTrialBar). */
let spot = null;   // { kind: 'wear', cat, id } | { kind: 'food' | 'furn', id }
function spotlight(next){
  if(isMobile()) return;
  spot = next;
  renderSpot();
}
function renderSpot(){
  const box = byId('shopPreview');
  if(!box) return;
  const name = byId('spName'), sub = byId('spSub'), act = byId('spAct'), art = box.querySelector('.sp-art');
  ['buy', 'buyFood', 'buyFurn', 'placeFurn', 'nav'].forEach(k => delete act.dataset[k]);
  act.removeAttribute('aria-disabled'); act.removeAttribute('disabled'); act.removeAttribute('title');
  act.className = 'btn-mini sp-act';
  const item = spot?.kind === 'wear' ? findItem(spot.cat, spot.id) : spot?.kind === 'food' ? findFood(spot.id) : spot ? findFurniture(spot.id) : null;
  box.dataset.kind = item ? spot.kind : 'none';
  if(!item){
    spot = null;
    applyAvatar();
    name.textContent = 'Pasa el cursor por un objeto para verlo aquí';
    sub.textContent = 'También puedes recorrerlos con el teclado';
    act.hidden = true;
    return;
  }
  act.hidden = false;
  if(spot.kind === 'wear'){
    applyAvatar();
    previewAvatar(spot.cat, item.id, 'mascotPreview');
    const cat = WARDROBE.find(c => c.id === spot.cat);
    name.textContent = item.name;
    sub.textContent = `${cat.label} · ⚡ ${item.cost}`;
    act.textContent = buyLabel(item);
    act.dataset.buy = item.id;
    const missing = item.cost - getChispas();
    if(missing > 0){ act.setAttribute('aria-disabled', 'true'); act.title = `Te faltan ${missing} chispas`; }
    act.setAttribute('aria-label', `${act.textContent}: ${item.name}`);
  } else if(spot.kind === 'food'){
    if(art.dataset.item !== item.id){ art.dataset.item = item.id; art.innerHTML = FOOD_ART[item.id]; }
    const have = foodCount(item.id);
    name.textContent = item.name + (have ? ` · tienes ${have}` : '');
    sub.textContent = `Comida · Llena ${item.fill} % · ⚡ ${item.cost}`;
    syncFoodButton(act, item, true);
  } else {
    if(art.dataset.item !== item.id){ art.dataset.item = item.id; art.innerHTML = miniRoom(item); }
    name.textContent = item.name;
    sub.textContent = `Muebles · ${ZONE[item.zone]}${item.glow ? ' · se enciende de noche' : ''} · ` + (item.cost > 0 ? `⚡ ${item.cost}` : 'Regalo');
    syncFurnitureButton(act, item);
  }
}

// El Armario: lo que tienes (y lo básico), por categoría.
function renderCollection(hostId){
  const host = byId(hostId);
  if(!host) return;
  clear(host);
  const eq = getEquipped();
  if(!hasAnythingToEquip()){
    host.innerHTML = '<div class="empty-state">Todavía no has comprado productos. Puedes usar las opciones básicas o <button class="btn-mini" data-nav="shop">Visitar tienda</button>.</div>';
  }
  WARDROBE.forEach(cat=>{
    const items = cat.items.filter(item => (item.cost === 0 && !item.secret) || owns(item.id));
    if(!items.length) return;
    const grid = document.createElement('div');
    grid.className = 'shop-items';
    items.forEach(item=> grid.appendChild(buildCard(cat, item, { shopping: false, equipped: eq[cat.id] === item.id, previewId: 'mascotWardrobe' })));
    const section = document.createElement('div');
    section.className = 'shop-cat';
    const heading = document.createElement('h3');
    heading.textContent = cat.label;
    section.append(heading, grid);
    host.appendChild(section);
  });
}

function hasAnythingToEquip(){
  return WARDROBE.some(cat=>cat.items.some(item=>(item.cost > 0 || item.secret) && owns(item.id)));
}

// Texto del botón de compra en la tarjeta (el precio va en su propia línea): "Comprar" o cuántas chispas faltan.
function cardBuyLabel(cost){
  const missing = cost - getChispas();
  return missing > 0 ? `Te faltan ${missing} ⚡` : 'Comprar';
}

function buildCard(cat, item, { shopping, equipped, previewId }){
  const affordable = getChispas() >= item.cost;
  const name = displayName(cat.id, item, !shopping);
  // La línea "Original: …" solo sale si la mascota tiene un nombre propio distinto del original.
  const customName = cat.id === 'pet' && !shopping ? getPetName(item.id) : '';
  const hasCustomPetName = !!customName && customName.trim().toLowerCase() !== item.name.trim().toLowerCase();
  const card = document.createElement('div');
  card.className = 'shop-item' + (equipped ? ' equipped' : '') + (trial && trial.id === item.id ? ' is-trial' : '');
  card.dataset.item = item.id;
  card.innerHTML = `
    <div class="si-visual">${visualFor(cat, item)}</div>
    <div class="si-name">${esc(name)}</div>
    ${hasCustomPetName ? `<div class="si-subname">Original: ${esc(item.name)}</div>` : ''}
    ${shopping ? `<div class="si-price">⚡ ${item.cost}</div>` : ''}`;

  const mini = document.createElement('button');
  mini.type = 'button';
  mini.className = 'btn-mini' + (!shopping && !equipped ? ' equip-only' : '');
  if(equipped){
    mini.textContent = 'Equipado';
    mini.setAttribute('disabled','');
  } else if(!shopping){
    mini.textContent = 'Equipar';
    mini.dataset.equip = item.id;
  } else {
    mini.textContent = cardBuyLabel(item.cost);
    mini.dataset.buy = item.id;
    if(!affordable){
      mini.setAttribute('aria-disabled','true');
      mini.title = `Te faltan ${item.cost - getChispas()} chispas`;
    }
  }
  mini.setAttribute('aria-label', `${mini.textContent}: ${item.name}`);

  const actions = document.createElement('div');
  actions.className = 'si-actions';
  actions.appendChild(mini);

  if(!shopping && cat.id === 'pet' && item.id !== 'p-none'){
    const rename = document.createElement('button');
    rename.type = 'button';
    rename.className = 'btn-mini rename-pet';
    rename.textContent = 'Personalizar';
    rename.dataset.renamePet = item.id;
    rename.setAttribute('aria-label', `Personalizar: ${item.name}`);
    actions.appendChild(rename);
  }
  card.appendChild(actions);

  // Vista previa al pasar el ratón o al tabular por el botón (en móvil el toque dispara mouseenter: ahí manda la
  // prueba, no el hover). En la Tienda se queda puesto el último (spotlight); en el Armario se vuelve a lo equipado.
  if(shopping){
    const show = ()=> spotlight({ kind: 'wear', cat: cat.id, id: item.id });
    card.addEventListener('mouseenter', show);
    mini.addEventListener('focus', show);
    return card;
  }
  const preview = ()=>{ if(!isMobile()) previewAvatar(cat.id, item.id, previewId); };
  const restore = ()=>{ if(!isMobile()) applyAvatar(); };
  card.addEventListener('mouseenter', preview);
  card.addEventListener('mouseleave', restore);
  mini.addEventListener('focus', preview);
  mini.addEventListener('blur', restore);
  return card;
}

/* ---------- Comida: se compra por unidad (1 por toque) y se gasta en la Casa ---------- */
function buildFoodCard(f){
  const card = document.createElement('div');
  card.className = 'shop-item food-item' + (trial && trial.id === f.id ? ' is-trial' : '');
  card.dataset.item = f.id;
  card.innerHTML = `
    <span class="si-have" aria-hidden="true"></span>
    <div class="si-visual">${FOOD_ART[f.id]}</div>
    <div class="si-name">${esc(f.name)}</div>
    <div class="si-price">⚡ ${f.cost} <em>· llena ${f.fill} %</em></div>
    <div class="si-actions"><button type="button" class="btn-mini"></button></div>`;
  syncFoodCard(card, f);
  const show = ()=> spotlight({ kind: 'food', id: f.id });
  card.addEventListener('mouseenter', show);
  card.querySelector('.btn-mini').addEventListener('focus', show);
  return card;
}

// Botón de compra de comida: "Comprar" (en la tarjeta el precio va aparte), "Te faltan N ⚡" sin saldo, o "Máximo 99".
// `again` (la vista previa y la barra de móvil): con el precio, y "Comprar otra" si ya tienes.
function syncFoodButton(btn, f, again = false){
  const have = foodCount(f.id), missing = f.cost - getChispas();
  btn.dataset.buyFood = f.id;
  btn.removeAttribute('disabled'); btn.removeAttribute('aria-disabled'); btn.removeAttribute('title');
  if(have >= FOOD_MAX){
    btn.textContent = `Máximo ${FOOD_MAX}`;
    btn.setAttribute('disabled', '');
  } else if(missing > 0){
    btn.textContent = `Te faltan ${missing} ⚡`;
    btn.setAttribute('aria-disabled', 'true');
    btn.title = `Te faltan ${missing} chispas`;
  } else btn.textContent = again ? (have ? 'Comprar otra' : 'Comprar') + ` · ⚡ ${f.cost}` : 'Comprar';
  btn.setAttribute('aria-label', `${btn.textContent}: ${f.name}${have ? ` (tienes ${have})` : ''}`);
}

function syncFoodCard(card, f){
  const have = foodCount(f.id);
  const badge = card.querySelector('.si-have');
  badge.hidden = !have;
  badge.textContent = '×' + have;
  syncFoodButton(card.querySelector('[data-buy-food], .si-actions .btn-mini'), f);
}

// Cuando cambian las chispas o la charola (comprar, comer en la Casa, el panel de depuración), sin repintar todo.
function refreshFood(){
  document.querySelectorAll('.food-item[data-item]').forEach(card=>{
    const f = findFood(card.dataset.item);
    if(f) syncFoodCard(card, f);
  });
}

function handleFoodBuy(btn){
  const notice = byId('shopNotice');
  const f = findFood(btn.dataset.buyFood);
  if(!f || btn.hasAttribute('disabled')) return;
  if(btn.getAttribute('aria-disabled') === 'true'){
    if(notice) notice.textContent = btn.title;
    return;
  }
  const have = buyFood(f.id);
  if(!have){
    if(notice) notice.textContent = ACTION_FAILED;
    refreshFood();
    return;
  }
  sparkAt(byId('mascotPreview'), '🧺');
  refreshFood();
  updateBalance();
  const card = document.querySelector(`.food-item[data-item="${f.id}"] .si-have`);
  if(card){ card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
  renderTrialBar();   // la barra de móvil sigue abierta: se puede comprar otra
  renderSpot();
  if(notice) notice.textContent = `${f.name}: +1. Tienes ${have} en tu charola.`;
}

/* ---------- Muebles: se compran una sola vez y se colocan en la Casa ("Decorar") ---------- */
const ZONE = { wall: 'Pared', floor: 'Piso' };
// placed: en el cuarto · stored: comprado, en el inventario · gift: el regalo, aún sin entregar · shop: a la venta
function furnitureState(f){
  const d = getDecor();
  if(d.placed[f.id]) return 'placed';
  if(d.owned.includes(f.id)) return 'stored';
  return f.cost > 0 ? 'shop' : 'gift';
}
const FURN_STATE = { placed: 'En tu cuarto', stored: 'En tu inventario', gift: 'Te espera en la Casa', shop: 'Una sola vez' };
const furnitureStateLabel = f => (f.gift ? 'Regalo · ' : '') + FURN_STATE[furnitureState(f)];

function buildFurnitureCard(f){
  const card = document.createElement('div');
  card.className = 'shop-item furn-item' + (trial && trial.id === f.id ? ' is-trial' : '');
  card.dataset.item = f.id;
  card.innerHTML = `
    <span class="fi-tag ${f.zone}">${ZONE[f.zone]}</span>
    ${f.gift ? '<span class="si-have si-gift">Regalo</span>' : ''}
    <div class="si-visual fi-art">${FURNITURE_ART[f.id]}</div>
    <div class="si-name">${esc(f.name)}</div>
    <div class="si-price">${f.cost > 0 ? `⚡ ${f.cost}` : 'Te espera en la Casa'}</div>
    <div class="si-actions"><button type="button" class="btn-mini"></button></div>`;
  syncFurnitureButton(card.querySelector('.si-actions .btn-mini'), f);
  // En escritorio, la vista previa muestra el mueble (no a Mito) en su mini cuarto.
  const show = ()=> spotlight({ kind: 'furn', id: f.id });
  card.addEventListener('mouseenter', show);
  card.querySelector('.btn-mini').addEventListener('focus', show);
  return card;
}

// Botón de un mueble: comprar ("Te faltan N ⚡" sin saldo) o, si ya es tuyo, llevarlo a la Casa con Decorar abierto.
// `withPrice`: la barra de móvil y la vista previa llevan el precio en el botón (la tarjeta, en su propia línea).
function syncFurnitureButton(btn, f, withPrice = btn.matches?.('.tb-act, .sp-act')){
  const st = furnitureState(f), missing = f.cost - getChispas();
  ['buyFurn', 'placeFurn', 'nav'].forEach(k => delete btn.dataset[k]);
  btn.removeAttribute('disabled'); btn.removeAttribute('aria-disabled'); btn.removeAttribute('title');
  btn.classList.toggle('equip-only', st !== 'shop');
  if(st === 'shop'){
    btn.dataset.buyFurn = f.id;
    btn.textContent = missing > 0 ? `Te faltan ${missing} ⚡` : withPrice ? `Comprar · ⚡ ${f.cost}` : 'Comprar';
    if(missing > 0){ btn.setAttribute('aria-disabled', 'true'); btn.title = `Te faltan ${missing} chispas`; }
  } else {
    btn.dataset.nav = 'house';
    if(st !== 'gift') btn.dataset.placeFurn = f.id;
    btn.textContent = { placed: 'Mover en la Casa', stored: 'Colocar en la Casa', gift: 'Ir a la Casa' }[st];
  }
  btn.setAttribute('aria-label', `${btn.textContent}: ${f.name}`);
}

// Cuando cambian las chispas: los botones de los muebles (los comprados ya no están en la Tienda).
function refreshFurniture(){
  document.querySelectorAll('#shopHost .furn-item[data-item]').forEach(card=>{
    const f = findFurniture(card.dataset.item);
    if(f) syncFurnitureButton(card.querySelector('.si-actions .btn-mini'), f);
  });
}

// Mini cuarto (pared, zócalo y piso) con el mueble donde le toca: en la vista previa de escritorio y en la barra de móvil.
function miniRoom(f){
  const art = FURNITURE_ART[f.id].replace('<svg ', `<svg preserveAspectRatio="${f.zone === 'wall' ? 'xMidYMid' : 'xMidYMax'} meet" `);
  return `<div class="fv-mini" aria-hidden="true"><span class="fv-wall"></span><span class="fv-floor"></span><span class="fv-base"></span>
    <span class="fv-art ${f.zone}${f.flat ? ' flat' : ''}">${art}</span></div>`;
}

function handleFurnitureBuy(btn){
  const notice = byId('shopNotice');
  const f = findFurniture(btn.dataset.buyFurn);
  if(!f) return;
  if(btn.getAttribute('aria-disabled') === 'true'){
    if(notice) notice.textContent = btn.title;
    return;
  }
  if(!buyFurniture(f.id)){
    if(notice) notice.textContent = ACTION_FAILED;
    refreshFurniture();
    return;
  }
  sparkAt(byId('mascotPreview'), '🛋️');
  // comprado: sale de la Tienda; el aviso lleva a la Casa con Decorar abierto
  const hadFocus = document.activeElement === btn;
  trial = null; spot = null;
  renderShop();
  updateBalance();
  if(notice){
    notice.innerHTML = `${esc(f.name)}: comprado. <button type="button" class="btn-mini" data-nav="house" data-place-furn="${f.id}">Colocar en la Casa →</button>`;
    if(hadFocus) notice.querySelector('button').focus({ preventScroll: true });
  }
}

function closePetNameModal(){
  document.querySelector('.pet-modal-backdrop')?.remove();
  if(petNameReturnFocus && document.contains(petNameReturnFocus)) petNameReturnFocus.focus({ preventScroll:true });
  petNameReturnFocus = null;
}

function showPetNameModal(btn){
  const item = findItem('pet', btn.dataset.renamePet);
  if(!item) return;
  closePetNameModal();
  petNameReturnFocus = btn;
  const current = getPetName(item.id);
  const currentLook = getPetLook(item.id);
  const options = petLookOptions();
  const back = document.createElement('div');
  back.className = 'pet-modal-backdrop';
  back.innerHTML = `
    <form class="pet-modal-card" role="dialog" aria-modal="true" aria-labelledby="petModalTitle">
      <button type="button" class="pet-modal-close" data-close-pet-modal aria-label="Cerrar">×</button>
      <div class="pet-modal-visual">${itemThumb('pet', item)}</div>
      <h2 id="petModalTitle">Personalizar mascota</h2>
      <p>Nombre original: <b>${esc(item.name)}</b></p>
      <label class="pet-modal-field">Nombre personalizado
        <input name="petName" maxlength="${PET_NAME_MAX}" value="${esc(current || item.name)}" autocomplete="off">
      </label>
      <div class="pet-look-field" aria-label="Color de mascota">
        <span>Color</span>
        <div class="pet-look-options">
          ${options.map(opt=>`
            <button type="button" class="pet-look-btn${opt.id === currentLook ? ' selected' : ''}" data-set-pet-look="${item.id}" data-pet-look="${opt.id}" aria-pressed="${opt.id === currentLook ? 'true' : 'false'}" title="${esc(opt.name)}">
              <span class="pet-look-swatch" style="background:${opt.swatch || opt.defaults?.body}"></span>
              <span>${esc(opt.name)}</span>
            </button>`).join('')}
        </div>
      </div>
      <div class="pet-modal-actions">
        <button type="submit" class="btn-mini equip-only" data-save-pet-name="${item.id}">Guardar nombre</button>
        ${current ? `<button type="button" class="btn-mini pet-modal-ghost" data-clear-pet-name="${item.id}">Quitar nombre</button>` : ''}
        <button type="button" class="btn-mini pet-modal-ghost" data-close-pet-modal>Cancelar</button>
      </div>
    </form>`;
  document.body.appendChild(back);
  back.querySelector('input').focus();
}

function savePetName(id, name){
  const notice = byId('wardrobeNotice');
  if(!renamePet(id, name)){
    if(notice) notice.textContent = ACTION_FAILED;
    return;
  }
  closePetNameModal();
  applyAvatar();
  renderShop();
  updatePreviewLabels();
  if(notice) notice.textContent = `${getPetDisplayName(id)}: nombre actualizado.`;
}

function savePetLook(btn){
  const id = btn.dataset.setPetLook;
  const colorId = btn.dataset.petLook || '';
  const notice = byId('wardrobeNotice');
  if(!setPetLook(id, colorId)){
    if(notice) notice.textContent = ACTION_FAILED;
    return;
  }
  const item = findItem('pet', id);
  const modal = btn.closest('.pet-modal-backdrop');
  if(modal && item){
    const visual = modal.querySelector('.pet-modal-visual');
    if(visual) visual.innerHTML = itemThumb('pet', item);
    modal.querySelectorAll('[data-set-pet-look]').forEach(opt=>{
      const selected = (opt.dataset.petLook || '') === colorId;
      opt.classList.toggle('selected', selected);
      opt.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }
  applyAvatar();
  renderShop();
  updatePreviewLabels();
  const color = colorId ? findItem('color', colorId) : null;
  if(notice) notice.textContent = `${getPetDisplayName(id)}: color ${color ? color.name : 'Original'}.`;
}

// Un aura o un color con efecto se muestra como swatch; el resto, como miniatura de Mito.
function visualFor(cat, item){
  if(!item.swatch) return itemThumb(cat.id, item);
  return item.fx
    ? `<span class="swatch sw-${item.fx}"></span>`
    : `<span class="swatch" style="background:${item.swatch}"></span>`;
}

// El botón de compra lleva el precio y el bloqueo por saldo. Cuando cambian las
// chispas hay que reajustarlos sin repintar todo el catálogo: se repinta en cada
// respuesta del quiz y rehacer todos los SVG en cada una sería wasteful.
function updateAffordability(){
  syncSeasonGift();
  // con "Me alcanza", lo que se ve depende de las chispas: se vuelve a pintar la Tienda
  if(store.afford){ renderShop(); return; }
  const balance = getChispas();
  document.querySelectorAll('[data-buy]').forEach(btn=>{
    const item = findItemById(btn.dataset.buy);
    if(!item) return;
    const missing = item.cost - balance;
    if(missing > 0){
      btn.setAttribute('aria-disabled','true');
      btn.title = `Te faltan ${missing} chispas`;
    } else {
      btn.removeAttribute('aria-disabled');
      btn.removeAttribute('title');
    }
    btn.textContent = btn.closest('#shopHost') ? cardBuyLabel(item.cost) : buyLabel(item);
    btn.setAttribute('aria-label', `${btn.textContent}: ${item.name}`);
  });
  refreshFood();
  refreshFurniture();
  renderTrialBar();
  renderSpot();
}

/* ---------- Prueba en móvil: barra fija ---------- */
const currentCollectionIsShop = ()=> document.body.dataset.view === 'shop';

function previewTargets(){
  return [currentCollectionIsShop() ? 'mascotPreview' : 'mascotWardrobe', 'mascotBar'];
}

function setTrial(card){
  const id = card.dataset.item;
  // la comida y los muebles no se prueban: la barra los muestra en vez de a Mito
  if(findFood(id) || findFurniture(id)){
    if(trial && !trial.food && !trial.furn) applyAvatar();
    trial = findFood(id) ? { food: true, id } : { furn: true, id };
    document.querySelectorAll('.shop-item.is-trial').forEach(c=>c.classList.remove('is-trial'));
    card.classList.add('is-trial');
    renderTrialBar();
    return;
  }
  const cat = categoryOf(id);
  if(!id || !cat) return;
  trial = { cat, id };
  applyAvatar();   // Mito con lo equipado, y encima se prueba el objeto
  previewTargets().forEach(t=> previewAvatar(cat, id, t));
  document.querySelectorAll('.shop-item.is-trial').forEach(c=>c.classList.remove('is-trial'));
  document.querySelectorAll(`.shop-item[data-item="${id}"]`).forEach(c=>c.classList.add('is-trial'));
  renderTrialBar();
}

function clearTrial(){
  if(!trial) return;
  const withMito = !trial.food && !trial.furn;
  trial = null;
  document.querySelectorAll('.shop-item.is-trial').forEach(c=>c.classList.remove('is-trial'));
  if(withMito) applyAvatar();
  renderTrialBar();
}

// Si el objeto en prueba ya no está en pantalla (se compró, cambió la vista…), se quita la prueba.
function syncTrial(){
  if(trial && !document.querySelector(`.shop-item[data-item="${trial.id}"]`)){ trial = null; applyAvatar(); }
  renderTrialBar();
}

function renderTrialBar(){
  const name = byId('tbName'), sub = byId('tbSub'), act = byId('tbAct'), close = byId('tbClose');
  if(!name || !act) return;
  const box = document.querySelector('.tb-mito');
  const food = trial && trial.food ? findFood(trial.id) : null;
  const furn = trial && trial.furn ? findFurniture(trial.id) : null;
  box?.classList.toggle('is-food', !!food);
  box?.classList.toggle('is-furn', !!furn);
  ['buyFurn', 'placeFurn', 'nav'].forEach(k => delete act.dataset[k]);
  if(furn){
    byId('trialBar').classList.add('is-open');
    document.body.classList.add('trial-open');
    let pic = box.querySelector('.tb-furn');
    if(!pic){ pic = document.createElement('div'); pic.className = 'tb-furn'; box.appendChild(pic); }
    if(pic.dataset.item !== furn.id){ pic.dataset.item = furn.id; pic.innerHTML = miniRoom(furn); }
    name.textContent = furn.name;
    sub.textContent = `Muebles · ${ZONE[furn.zone]} · ` + (furnitureState(furn) === 'shop' ? `⚡ ${furn.cost}` : furnitureStateLabel(furn));
    close.hidden = act.hidden = false;
    act.className = 'btn-mini tb-act';
    ['buy', 'equip', 'buyFood'].forEach(k=> delete act.dataset[k]);
    syncFurnitureButton(act, furn);
    return;
  }
  if(food){
    byId('trialBar').classList.add('is-open');
    document.body.classList.add('trial-open');
    let pic = box.querySelector('.tb-food');
    if(!pic){ pic = document.createElement('div'); pic.className = 'tb-food'; pic.setAttribute('aria-hidden', 'true'); box.appendChild(pic); }
    if(pic.dataset.food !== food.id){ pic.dataset.food = food.id; pic.innerHTML = FOOD_ART[food.id]; }
    const have = foodCount(food.id);
    name.textContent = food.name + (have ? ` · tienes ${have}` : '');
    sub.textContent = `Comida · Llena ${food.fill} % · ⚡ ${food.cost}`;
    close.hidden = act.hidden = false;
    act.className = 'btn-mini tb-act';
    ['buy', 'equip'].forEach(k=> delete act.dataset[k]);
    syncFoodButton(act, food, true);
    return;
  }
  delete act.dataset.buyFood;
  const item = trial && findItemById(trial.id);
  // La barra solo existe mientras hay un objeto en prueba; sin él, ni se ve ni reserva espacio abajo.
  byId('trialBar').classList.toggle('is-open', !!item);
  document.body.classList.toggle('trial-open', !!item);
  if(!item){
    name.textContent = '';
    sub.textContent = '';
    act.hidden = close.hidden = true;
    return;
  }
  // Composición de Mito en el recuadro: según lleve aura y/o mascota se escala para que quepa entera (ver .tb-mito en style.css)
  const mini = byId('mascotBar');
  const hasAura = !!mini.querySelector(':scope > .aura.on'), hasPet = !!mini.querySelector(':scope > svg.pet');
  box.dataset.comp = hasAura ? (hasPet ? 'aura-pet' : 'aura') : hasPet ? 'pet' : 'solo';
  box.dataset.aura = hasAura ? mini.querySelector(':scope > .aura.on').dataset.a : '';
  const shopping = currentCollectionIsShop();
  const cat = WARDROBE.find(c=>c.id === trial.cat);
  const equipped = !shopping && getEquipped()[trial.cat] === item.id;
  name.textContent = displayName(trial.cat, item, !shopping);
  sub.textContent = cat.label + (shopping ? ` · ⚡ ${item.cost}` : equipped ? ' · Equipado' : '');
  close.hidden = false;
  act.hidden = false;
  act.className = 'btn-mini tb-act' + (!shopping && !equipped ? ' equip-only' : '');
  ['buy','equip'].forEach(k=> delete act.dataset[k]);
  act.removeAttribute('aria-disabled'); act.removeAttribute('disabled'); act.removeAttribute('title');
  if(shopping){
    act.textContent = buyLabel(item);
    act.dataset.buy = item.id;
    const missing = item.cost - getChispas();
    if(missing > 0){ act.setAttribute('aria-disabled','true'); act.title = `Te faltan ${missing} chispas`; }
  } else if(equipped){
    act.textContent = 'Equipado';
    act.setAttribute('disabled','');
  } else {
    act.textContent = 'Equipar';
    act.dataset.equip = item.id;
  }
  act.setAttribute('aria-label', `${act.textContent}: ${item.name}`);
}

/* ---------- Compra / equipar ---------- */
function handlePurchase(btn){
  const shopping = btn.hasAttribute('data-buy');
  const notice = byId(shopping ? 'shopNotice' : 'wardrobeNotice');
  const item = findItemById(shopping ? btn.dataset.buy : btn.dataset.equip);
  if(!item) return;

  if(shopping && item.seasonal && !isSeasonalOpen()){
    applyAvatar();
    renderShop();
    if(notice) notice.textContent = SEASON_CLOSED;
    return;
  }
  if(btn.getAttribute('aria-disabled') === 'true'){
    if(notice) notice.textContent = btn.title;
    return;
  }

  const cat = categoryOf(item.id);
  const success = shopping ? buyAndEquip(cat, item.id) : equipCategory(cat, item.id);
  if(!success){
    if(notice) notice.textContent = ACTION_FAILED;
    renderShop();
    return;
  }

  const preview = byId(shopping ? 'mascotPreview' : 'mascotWardrobe');
  sparkAt(preview, shopping ? '🛍️' : '✨');

  // Si el foco estaba en el botón que acabamos de destruir, muévelo al aviso
  // para que el usuario no pierda el hilo con el teclado.
  const hadFocus = document.activeElement === btn;
  trial = null;   // al comprar o equipar, la prueba termina: la barra vuelve a Mito con lo equipado
  if(shopping) spot = null;   // y la vista previa de escritorio, a Mito con lo que lleva
  applyAvatar();
  renderShop();
  updateBalance();
  updatePreviewLabels();
  if(notice) notice.textContent = shopping
    ? `${item.name}: comprado y equipado. Ya está en tu armario.`
    : `${displayName(cat, item, true)}: equipado.`;
  if(hadFocus && notice){
    notice.tabIndex = -1;
    notice.focus({ preventScroll:true });
  }
  // en el Armario la mascota saluda (en la Tienda la vista previa es compacta: no cabe su globo)
  if(cat === 'pet' && preview && !shopping) setTimeout(()=>petSay(preview), 350);
}

export function init(){
  const resetStore = ()=>{
    Object.assign(store, { tab: null, sort: 'rec', afford: false, room: 'all' });
    focusOnShow = null;
    trial = null;
    spot = null;
    renderShop();
  };
  on('state:imported', resetStore);
  on('state:reset', resetStore);
  delegate('click', e=>{
    const rename = e.target.closest('[data-rename-pet]');
    if(rename){ showPetNameModal(rename); return; }
    const petLook = e.target.closest('[data-set-pet-look]');
    if(petLook){ savePetLook(petLook); return; }
    const save = e.target.closest('[data-save-pet-name]');
    if(save){ e.preventDefault(); savePetName(save.dataset.savePetName, save.closest('form')?.querySelector('input[name="petName"]')?.value); return; }
    const clear = e.target.closest('[data-clear-pet-name]');
    if(clear){ savePetName(clear.dataset.clearPetName, ''); return; }
    if(e.target.closest('[data-close-pet-modal]') || e.target.classList.contains('pet-modal-backdrop')){ closePetNameModal(); return; }
    if(e.target.closest('[data-trial-clear]')){ clearTrial(); return; }
    const tab = e.target.closest('[data-shop-tab]');
    if(e.target.closest('[data-season-gift]')){
      if(claimSeasonGift()){
        const notice = byId('shopNotice');
        if(notice) notice.textContent = '¡Recibiste 10 000 chispas de regalo! ⚡';
      }
      return;
    }
    if(tab){ selectTab(tab.dataset.shopTab); return; }
    const sort = e.target.closest('[data-shop-sort]');
    if(sort){ store.sort = sort.dataset.shopSort; renderStore(); return; }
    if(e.target.closest('[data-shop-afford-off]')){ store.afford = false; renderStore(); byId('shopHost').querySelector('.shop-sec:not([hidden]) [data-shop-afford]')?.focus({ preventScroll: true }); return; }
    const filter = e.target.closest('[data-furn-room]');
    if(filter){ store.room = filter.dataset.furnRoom; renderStore(); return; }
    if(isMobile()){
      // En móvil, tocar una tarjeta (o su botón) solo pone el objeto en prueba; la compra va en la barra.
      // (Los botones que llevan a otra vista, como "Colocar en la Casa", sí funcionan directo.)
      const card = e.target.closest('.shop-item');
      if(card && !e.target.closest('.rename-pet, [data-nav]')){ setTrial(card); return; }
    }
    const foodBtn = e.target.closest('[data-buy-food]');
    if(foodBtn){ handleFoodBuy(foodBtn); return; }
    const furnBtn = e.target.closest('[data-buy-furn]');
    if(furnBtn){ handleFurnitureBuy(furnBtn); return; }
    // "Colocar en la Casa": la navegación la hace data-nav; la Casa abre Decorar al llegar
    if(e.target.closest('[data-place-furn]')){ emit('house:focus', 'decor'); return; }
    const btn = e.target.closest('[data-buy], [data-equip]');
    if(btn) handlePurchase(btn);
  });
  delegate('submit', e=>{
    const save = e.target.querySelector('[data-save-pet-name]');
    if(save){ e.preventDefault(); savePetName(save.dataset.savePetName, e.target.querySelector('input[name="petName"]')?.value); }
  });
  delegate('keydown', e=>{
    if(e.key === 'Escape' && document.querySelector('.pet-modal-backdrop')){
      e.preventDefault();
      closePetNameModal();
      return;
    }
    // pestañas: flechas, Inicio y Fin (el patrón de pestañas: el foco se mueve y la pestaña se elige)
    const tab = e.target.closest?.('[data-shop-tab]');
    if(tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)){
      e.preventDefault();
      const ids = tabsFor(isSeasonalOpen()).map(t => t.id), i = ids.indexOf(tab.dataset.shopTab);
      const j = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
      selectTab(ids[j], { focus: true });
    }
  });
  // ordenar (en el teléfono, la lista) y "Me alcanza"
  delegate('change', e=>{
    if(e.target.matches?.('[data-shop-sort-select]')){ store.sort = e.target.value; renderStore(); return; }
    if(e.target.matches?.('[data-shop-afford]')){ store.afford = e.target.checked; renderStore(); }
  });
  byId('shopTabs')?.addEventListener('scroll', tabsFade, { passive: true });
  window.addEventListener('resize', ()=> centerTab(false));

  // El saldo decide qué se puede comprar, así que la tienda reacciona a los chispas.
  on('state:changed', updateAffordability);
  // Al cambiar de vista (Tienda ↔ Armario, etc.) no se arrastra la prueba. Al salir de la Tienda, ordenar, "Me
  // alcanza" y el filtro por cuarto vuelven a como estaban; al entrar, se abre en la última pestaña visitada o en la
  // que pidió un acceso directo.
  on('nav:after', view=>{
    trial = null;
    spot = null;
    document.querySelectorAll('.shop-item.is-trial').forEach(c=>c.classList.remove('is-trial'));
    renderTrialBar();
    if(view !== 'shop'){ Object.assign(store, { tab: null, sort: 'rec', afford: false, room: 'all' }); return; }
    if(focusOnShow){
      store.tab = focusOnShow.tab;
      store.room = focusOnShow.room;
      setShopTab(focusOnShow.tab);
      focusOnShow = null;
    }
    renderStore();
    centerTab(false);
  });
  // La charola, la bandeja de Decorar y Mito con hambre piden ir directo a una pestaña.
  on('shop:focus', req=>{ focusOnShow = focusTarget(req); });
}
