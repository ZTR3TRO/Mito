// Tienda y armario: catálogo, tarjetas de producto, compra/equipar y la
// tienda de temporada de Halloween.

import { clear, byId, delegate } from '../../core/dom.js';
import { WARDROBE, findItem, findItemById, categoryOf, isSeasonalOpen } from '../../content/wardrobe.js';
import {
  getChispas, getEquipped, owns, buyAndEquip, equipCategory,
  getPetName, getPetDisplayName, renamePet, getPetLook, setPetLook,
} from '../../state/store.js';
import { on } from '../../core/bus.js';
import { applyAvatar, previewAvatar, itemThumb } from '../mascot/avatar.js';
import { sparkAt } from '../mascot/effects.js';
import { petSay } from '../mascot/speech.js';

const SEASON_CLOSED = 'La temporada ha terminado. Tus compras siguen disponibles en el armario.';
const ACTION_FAILED = 'No se pudo completar la acción. Revisa tu saldo y tu colección.';
const PET_NAME_MAX = 20;
let petNameReturnFocus = null;

// Móvil (≤ 880 px): tocar un objeto lo pone "en prueba" (vista previa grande + barra fija); comprar o equipar solo con el botón de la barra.
const isMobile = ()=> !!window.matchMedia?.('(max-width: 880px)').matches;
let trial = null;   // { cat, id } del objeto en prueba

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
  renderCollection('shopHost', true);
  renderCollection('wardrobeHost', false);
  syncTrial();
}

function renderCollection(hostId, shopping, seasonalOnly = false){
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
    ${hasCustomPetName ? `<div class="si-subname">Original: ${esc(item.name)}</div>` : ''}`;

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
    mini.textContent = buyLabel(item);
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

  // Preview al pasar el ratón o al tabular por el botón.
  // (En móvil el toque dispara mouseenter: ahí manda la prueba, no el hover.)
  const preview = ()=>{ if(!isMobile()) previewAvatar(cat.id, item.id, previewId); };
  const restore = ()=>{ if(!isMobile()) applyAvatar(); };
  card.addEventListener('mouseenter', preview);
  card.addEventListener('mouseleave', restore);
  mini.addEventListener('focus', preview);
  mini.addEventListener('blur', restore);
  return card;
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
function updateAffordability(){
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
    btn.textContent = buyLabel(item);
    btn.setAttribute('aria-label', `${btn.textContent}: ${item.name}`);
  });
  renderTrialBar();
}

/* ---------- Prueba en móvil: barra fija ---------- */
const currentCollectionIsShop = ()=> document.body.dataset.view === 'shop';

function previewTargets(){
  return [currentCollectionIsShop() ? 'mascotPreview' : 'mascotWardrobe', 'mascotBar'];
}

function setTrial(card){
  const id = card.dataset.item;
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
  trial = null;
  document.querySelectorAll('.shop-item.is-trial').forEach(c=>c.classList.remove('is-trial'));
  applyAvatar();
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
  const box = document.querySelector('.tb-mito');
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
  if(cat === 'pet' && preview) setTimeout(()=>petSay(preview), 350);
}

export function init(){
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
    if(isMobile()){
      // En móvil, tocar una tarjeta (o su botón) solo pone el objeto en prueba; la compra va en la barra.
      const card = e.target.closest('.shop-item');
      if(card && !e.target.closest('.rename-pet')){ setTrial(card); return; }
    }
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
    }
  });

  // El saldo decide qué se puede comprar, así que la tienda reacciona a los chispas.
  on('state:changed', updateAffordability);
  // Al cambiar de vista (Tienda ↔ Armario, etc.) no se arrastra la prueba.
  on('nav:after', ()=>{
    trial = null;
    document.querySelectorAll('.shop-item.is-trial').forEach(c=>c.classList.remove('is-trial'));
    renderTrialBar();
  });
}
