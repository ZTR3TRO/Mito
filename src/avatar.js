import { findItem } from './wardrobe.js';
import { getEquipped } from './store.js';

const AURA_CLASSES = ['aura-mint', 'aura-gold', 'aura-rainbow'];

function applyTo(el, eq){
  const color = findItem('color', eq.color);
  if(color && color.defaults){
    el.style.setProperty('--mascot-body', color.defaults.body);
    el.style.setProperty('--mascot-stroke', color.defaults.stroke);
    el.style.setProperty('--mascot-hi', color.defaults.highlight);
  }

  const ropa = findItem('ropa', eq.ropa);
  const accesorio = findItem('accesorio', eq.accesorio);
  const aura = findItem('aura', eq.aura);
  const pet = findItem('pet', eq.pet);

  // prendas y accesorios con overlay SVG (ropa va primero para que, si ambas
  // piden ir "atrás", la capa quede más al fondo que la mochila, etc.)
  el.querySelectorAll('.wardrobe-use').forEach(u=>u.remove());
  const svg = el.querySelector('svg');
  [ropa, accesorio].forEach(piece=>{
    if(!piece || !piece.overlay || !svg) return;
    const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + piece.overlay);
    u.classList.add('wardrobe-use');
    if(piece.overlayZ === 'back'){
      svg.insertBefore(u, svg.firstElementChild);
    } else {
      svg.appendChild(u);
    }
  });

  // aura
  AURA_CLASSES.forEach(c=>el.classList.remove(c));
  if(aura && aura.auraClass) el.classList.add(aura.auraClass);

  // partículas del aura
  const RAINBOW = ['#ff5da2', '#ffc93c', '#16c98d', '#5db2ff', '#b98af6'];
  el.querySelectorAll('.aura-particles').forEach(p=>p.remove());
  if(aura && (aura.particleColor || aura.auraClass)){
    const box = document.createElement('div');
    box.className = 'aura-particles';
    for(let i=0;i<12;i++){
      const d = document.createElement('i');
      d.style.left = (6 + Math.random()*88) + '%';
      d.style.setProperty('--dur', (2.2 + Math.random()*2) + 's');
      d.style.setProperty('--delay', (Math.random()*2.5) + 's');
      d.style.setProperty('--drift', ((Math.random()*40) - 20) + 'px');
      d.style.background = aura.particleColor === 'rainbow'
        ? RAINBOW[Math.floor(Math.random()*RAINBOW.length)]
        : aura.particleColor;
      if(d.style.background) d.style.color = d.style.background;
      box.appendChild(d);
    }
    el.appendChild(box);
  }

  // mascota compañera
  el.querySelectorAll('.mascot-pet').forEach(p=>p.remove());
  if(pet && pet.icon && pet.id !== 'p-none'){
    const p = document.createElement('div');
    p.className = 'mascot-pet';
    p.textContent = pet.icon;
    el.appendChild(p);
  }
}

export function applyAvatar(){
  const eq = getEquipped();
  document.querySelectorAll('.mascot').forEach(el=>applyTo(el, eq));
}

export function previewAvatar(cat, itemId){
  const el = document.getElementById('mascotPreview');
  if(!el) return;
  const eq = getEquipped();
  applyTo(el, { ...eq, [cat]: itemId });
}