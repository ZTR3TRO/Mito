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

/* ---------- Colecciones ---------- */
export function renderShop(){
  renderCollection('shopHost', true);
  renderCollection('wardrobeHost', false);
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
  const hasCustomPetName = cat.id === 'pet' && !shopping && !!getPetName(item.id);
  const card = document.createElement('div');
  card.className = 'shop-item' + (equipped ? ' equipped' : '');
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
    mini.textContent = 'Comprar · ⚡ ' + item.cost;
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
  const preview = ()=> previewAvatar(cat.id, item.id, previewId);
  card.addEventListener('mouseenter', preview);
  card.addEventListener('mouseleave', applyAvatar);
  mini.addEventListener('focus', preview);
  mini.addEventListener('blur', applyAvatar);
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
  });
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
}
