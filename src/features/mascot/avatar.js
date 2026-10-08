import { findItem } from '../../content/wardrobe.js';
import { getEquipped, getPetLook } from '../../state/store.js';
import { DEFS, PRE, GBODY, SEGS, PET_BASE, PETS } from '../../content/art/base.js';
import { setAura } from './auras.js';
import { skinParts } from '../../content/art/skins.js';
import { HALLOWEEN_DEFS, HALLOWEEN_AFTER, HALLOWEEN_PETS } from '../../content/art/halloween.js';
import { SECRET_PETS } from '../../content/art/secrets.js';
import { PET_KEEP } from '../../content/petColors.js';
import { recolorPet } from './petRecolor.js';

const NS = 'http://www.w3.org/2000/svg';
const AURA_HTML = '<div class="a-glow"></div><div class="a-neb"></div><div class="a-gal"></div><div class="a-rays"></div><div class="a-ring"></div><div class="a-parts"></div>';
let uid = 0;
const avatarSegments = SEGS.flatMap(segment=>[segment, ...(HALLOWEEN_AFTER[segment[0]] || [])]);
const ALL_DEFS = DEFS + HALLOWEEN_DEFS;

// defs compartidos (gradientes, patrones, clipPaths) una sola vez
if(!document.getElementById('mitoDefs')){
  document.body.insertAdjacentHTML('afterbegin',
    `<svg id="mitoDefs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${DEFS}${HALLOWEEN_DEFS}</defs></svg>`);
}

export function mascotMarkup(keys, id, fx = ''){
  const sk = skinParts(fx, id);
  // los efectos de la piel van justo encima del cuerpo, debajo de cara y ropa
  const inner = avatarSegments.filter(([k])=>!k || keys.includes(k))
    .map(s => !s[0] && s[1].includes('url(#gBody)') ? s[1] + sk.over : s[1]).join('')
    .replaceAll('id="vcol"', `id="vcol-${id}"`).replaceAll('href="#vcol"', `href="#vcol-${id}"`);
  const g = GBODY.replace('id="gBody"', `id="gBody-${id}"`);
  return (`<defs>${g}${sk.defs}</defs>${PRE}<g class="rig">${inner}</g>`).split('url(#gBody)').join(`url(#gBody-${id})`);
}
// Mascota compañera: su dibujo base, o recoloreado si le elegiste un color en el armario.
const petMarkup = (k, colorId = '', id = 'pet') => {
  const art = PETS[k] || HALLOWEEN_PETS[k] || SECRET_PETS[k] || '';
  const color = colorId ? findItem('color', colorId) : null;
  if(!art || !color || !color.defaults) return PET_BASE + art;
  return PET_BASE + recolorPet(art, { body: color.defaults.body, defs: ALL_DEFS, id, keep: PET_KEEP[k] });
};

// Sombreros que tapan la cabeza: Mito se queda sin antenas para que no asomen por encima.
const NO_ANT = ['pumpkinhat', 'vamphair'];

// miniatura para la tienda: Mito con esa sola pieza, o la mascota sola
export function itemThumb(catId, item){
  const eq = getEquipped(), c = findItem('color', eq.color);
  const st = c && c.defaults ? `--body:${c.defaults.body};--stroke:${c.defaults.stroke};--hi:${c.defaults.highlight}` : '';
  if(!item.k) return '<svg class="th" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="opacity:.5"><circle cx="12" cy="12" r="8"/><path d="M6.5 17.5l11-11"/></svg>';
  if(catId === 'pet'){
    const colorId = getPetLook(item.id);
    const pid = 'pth' + (++uid);
    return `<svg class="th" viewBox="0 0 80 80">${petMarkup(item.k, colorId, pid)}</svg>`;
  }
  const hatClass = (item.k === 'pumpkinhat' ? ' has-tall pumpkin-hat' : '') + (NO_ANT.includes(item.k) ? ' no-ant' : '');
  return `<svg class="th${hatClass}" viewBox="0 0 150 150" style="${st}">${mascotMarkup([item.k], 'th' + (++uid))}</svg>`;
}

function applyTo(el, eq){
  const id = el.dataset.uid || (el.dataset.uid = ++uid);
  const color = findItem('color', eq.color);
  const items = ['ropa', 'accesorio', 'sombrero'].map(c => findItem(c, eq[c]));
  const keys = items.map(i => i && i.k).filter(Boolean);

  const svg = el.querySelector(':scope > svg.mito');
  if(svg){
    if(color && color.defaults){
      svg.style.setProperty('--body', color.defaults.body);
      svg.style.setProperty('--stroke', color.defaults.stroke);
      svg.style.setProperty('--hi', color.defaults.highlight);
    }
    const fx = (color && color.fx) || '';
    const sig = keys.join() + '|' + fx;
    if(svg.dataset.sig !== sig){
      svg.dataset.sig = sig;
      svg.dataset.fx = fx;
      svg.innerHTML = mascotMarkup(keys, id, fx);
      svg.classList.toggle('has-crown', keys.some(k => k === 'crown' || k === 'grad'));
      svg.classList.toggle('has-tall', keys.some(k => k === 'chef' || k === 'wizard' || k === 'pumpkinhat'));
      svg.classList.toggle('pumpkin-hat', keys.includes('pumpkinhat'));
      svg.classList.toggle('no-ant', keys.some(k => NO_ANT.includes(k)));
    }
  }

  // mascota compañera (SVG)
  const petItem = findItem('pet', eq.pet);
  const pk = (petItem || {}).k || '';
  const petLook = petItem ? getPetLook(petItem.id) : '';
  let pet = el.querySelector(':scope > svg.pet');
  if(!pk){ if(pet) pet.remove(); }
  else if(!pet || pet.dataset.k !== pk || pet.dataset.look !== petLook){
    if(pet) pet.remove();
    pet = document.createElementNS(NS, 'svg');
    pet.setAttribute('class', 'pet'); pet.setAttribute('viewBox', '0 0 80 80'); pet.dataset.k = pk; pet.dataset.look = petLook;
    pet.innerHTML = petMarkup(pk, petLook, `p${id}`);
    el.appendChild(pet);
  }

  // aura
  const ak = (findItem('aura', eq.aura) || {}).k || '';
  let box = el.querySelector(':scope > .aura');
  if(!ak){ if(box) box.remove(); }
  else {
    if(!box){ box = document.createElement('div'); box.className = 'aura on'; box.innerHTML = AURA_HTML; el.prepend(box); }
    if(box.dataset.key !== ak){ box.dataset.key = ak; setAura(box, ak); }
  }
}

export function applyAvatar(){
  const eq = getEquipped();
  document.querySelectorAll('.mascot').forEach(el => applyTo(el, eq));
}

export function previewAvatar(cat, itemId, targetId = 'mascotPreview'){
  const el = document.getElementById(targetId);
  if(!el) return;
  applyTo(el, { ...getEquipped(), [cat]: itemId });
}
