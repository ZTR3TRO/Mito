// Tienda y armario: catálogo, tarjetas de producto, compra/equipar y la
// tienda de temporada de Halloween.

import { clear, byId, delegate } from '../../core/dom.js';
import { WARDROBE, findItem, findItemById, categoryOf, isSeasonalOpen } from '../../wardrobe.js';
import { getChispas, getEquipped, owns, buyAndEquip, equipCategory } from '../../state/store.js';
import { on } from '../../core/bus.js';
import { applyAvatar, previewAvatar, itemThumb } from '../../avatar.js';
import { sparkAt } from '../mascot/effects.js';
import { petSay } from '../mascot/speech.js';

const SEASON_CLOSED = 'La temporada ha terminado. Tus compras siguen disponibles en el armario.';
const ACTION_FAILED = 'No se pudo completar la acción. Revisa tu saldo y tu colección.';

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
    if(node) node.textContent = item ? item.name : '—';
  });
  document.querySelectorAll('[data-equipped-label]').forEach(node=>{
    const cat = node.dataset.equippedLabel;
    node.textContent = findItem(cat, eq[cat])?.name || '—';
  });
}

/* ---------- Colecciones ---------- */
export function renderShop(){
  renderCollection('shopHost', true);
  renderCollection('wardrobeHost', false);
}

export function renderCollection(hostId, shopping, seasonalOnly = false){
  const host = byId(hostId);
  if(!host) return;
  clear(host);
  const eq = getEquipped();
  const previewId = shopping ? 'mascotPreview' : 'mascotWardrobe';

  if(!shopping && !hasAnythingToEquip()){
    host.innerHTML = '<div class="empty-state">Todavía no has comprado productos. Puedes usar las opciones básicas o <button class="btn-mini" data-nav="shop">Visitar tienda</button>.</div>';
  }

  WARDROBE.forEach(cat=>{
    const items = cat.items.filter(item=>shopping
      ? item.cost > 0 && !item.secret && !owns(item.id) && !!item.seasonal === seasonalOnly
      : (item.cost === 0 && !item.secret) || owns(item.id));
    if(!items.length) return;

    const grid = document.createElement('div');
    grid.className = 'shop-items';
    items.forEach(item=> grid.appendChild(buildCard(cat, item, { shopping, equipped: !shopping && eq[cat.id] === item.id, previewId })));

    const section = document.createElement('div');
    section.className = 'shop-cat';
    const heading = document.createElement('h3');
    heading.textContent = cat.label;
    section.append(heading, grid);
    host.appendChild(section);
  });

  if(shopping && !host.children.length){
    host.innerHTML = `<div class="empty-state">${seasonalOnly ? '¡Ya tienes toda la colección de Halloween!' : '¡Ya tienes todos los productos del catálogo habitual!'} Disfruta tu colección en el <button class="btn-mini" data-nav="wardrobe">Armario</button>.</div>`;
  }
  if(shopping && !seasonalOnly && isSeasonalOpen()){
    const season = buildSeasonSection();
    host.appendChild(season);
    // El render va después de insertar la sección: renderCollection busca el host
    // por id en el documento, así que antes de esto no existiría.
    renderCollection('seasonalShopHost', true, true);
  }
}

function hasAnythingToEquip(){
  return WARDROBE.some(cat=>cat.items.some(item=>(item.cost > 0 || item.secret) && owns(item.id)));
}

function buildCard(cat, item, { shopping, equipped, previewId }){
  const affordable = getChispas() >= item.cost;
  const card = document.createElement('div');
  card.className = 'shop-item' + (equipped ? ' equipped' : '');
  card.dataset.item = item.id;
  card.innerHTML = `
    <div class="si-visual">${visualFor(cat, item)}</div>
    <div class="si-name">${item.name}</div>`;

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
    mini.textContent = 'Comprar · ⚡ ' + item.cost;
    mini.dataset.buy = item.id;
    if(!affordable){
      mini.setAttribute('aria-disabled','true');
      mini.title = `Te faltan ${item.cost - getChispas()} chispas`;
    }
  }
  mini.setAttribute('aria-label', `${mini.textContent}: ${item.name}`);
  card.appendChild(mini);

  // Preview al pasar el ratón o al tabular por el botón.
  const preview = ()=> previewAvatar(cat.id, item.id, previewId);
  card.addEventListener('mouseenter', preview);
  card.addEventListener('mouseleave', applyAvatar);
  mini.addEventListener('focus', preview);
  mini.addEventListener('blur', applyAvatar);
  return card;
}

// Un aura o un color con efecto se muestra como swatch; el resto, como miniatura de Mito.
function visualFor(cat, item){
  if(!item.swatch) return itemThumb(cat.id, item);
  return item.fx
    ? `<span class="swatch sw-${item.fx}"></span>`
    : `<span class="swatch" style="background:${item.swatch}"></span>`;
}

function buildSeasonSection(){
  const season = document.createElement('section');
  season.className = 'seasonal-shop';
  season.setAttribute('aria-labelledby', 'seasonalTitle');
  season.innerHTML = `
    <h2 id="seasonalTitle" class="seasonal-title">🎃 Tienda de temporada · Halloween</h2>
    <div id="seasonalShopHost"></div>
    <p class="seasonal-note">Estos productos solo estarán disponibles durante el mes de octubre.</p>`;
  return season;
}

// El botón de compra lleva el precio y el bloqueo por saldo. Cuando cambian las
// chispas hay que reajustarlos sin repintar todo el catálogo: se repinta en cada
// respuesta del quiz y rehacer todos los SVG en cada una sería wasteful.
export function updateAffordability(){
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
  });
}

/* ---------- Compra / equipar ---------- */
export function handlePurchase(btn){
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
  applyAvatar();
  renderShop();
  updateBalance();
  updatePreviewLabels();
  if(notice) notice.textContent = shopping
    ? `${item.name}: comprado y equipado. Ya está en tu armario.`
    : `${item.name}: equipado.`;
  if(hadFocus && notice){
    notice.tabIndex = -1;
    notice.focus({ preventScroll:true });
  }
  if(cat === 'pet' && preview) setTimeout(()=>petSay(preview), 350);
}

export function init(){
  delegate('click', e=>{
    const btn = e.target.closest('[data-buy], [data-equip]');
    if(btn) handlePurchase(btn);
  });

  // El saldo decide qué se puede comprar, así que la tienda reacciona a los chispas.
  on('state:changed', updateAffordability);
}