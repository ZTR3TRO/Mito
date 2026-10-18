// Boclas de Mito: burbuja lateral, bocadillo del héroe y globitos de la mascota compañera.
// La materia activa se inyecta como callback para no importar el módulo de cursos
// (evita ciclo con course, que usa este módulo para hablar al cambiar de materia).

import { idleMessage, petMessage } from '../../content/messages.js';
import { byId } from '../../core/dom.js';

const IDLE_SIDE_MS = 9000;
const TICK_SIDE_MS = 5000;
const IDLE_HERO_MS = 8000;
const TICK_HERO_MS = 8000;
const PET_TICK_MS = 11000;
const PET_BUBBLE_MS = 5000;

let sideBubbleEl, heroSpeechEl;
let bubbleLastChange = Date.now();
let bubbleOwnWrite = false;
let sideLastMsg = '';
let heroLastMsg = '';
const petLastMsg = {};
const petTimers = new WeakMap();

// Id de la materia activa, lo inyecta el composition root.
let getCourseId = () => '';

export function init({ courseId }){
  sideBubbleEl = byId('sideBubble');
  heroSpeechEl = byId('heroSpeech');
  getCourseId = courseId;
  if(sideBubbleEl){
    new MutationObserver(()=>{
      if(bubbleOwnWrite){ bubbleOwnWrite = false; return; }
      bubbleLastChange = Date.now();
    }).observe(sideBubbleEl, { childList:true, characterData:true, subtree:true });
  }
  setInterval(()=>{
    if(document.hidden || !sideBubbleEl) return;
    if(Date.now() - bubbleLastChange >= IDLE_SIDE_MS){
      bubbleOwnWrite = true;
      sideBubbleEl.textContent = sideLastMsg = idleMessage(getCourseId(), sideLastMsg);
      bubbleLastChange = Date.now();
    }
  }, TICK_SIDE_MS);
  setInterval(()=>{
    if(document.hidden) return;
    sayHero(idleMessage(getCourseId(), heroLastMsg));
  }, TICK_HERO_MS);
}

export function say(text){
  if(!sideBubbleEl) return;
  sideBubbleEl.textContent = text;
  sideLastMsg = text;
}

export function sayHero(text){
  if(!heroSpeechEl) return;
  heroSpeechEl.textContent = text;
  heroLastMsg = text;
}

export const getHeroLastMsg = ()=> heroLastMsg;

// Mantiene el globo dentro de su contenedor (la tarjeta de la portada o la vista previa del armario):
// limita su ancho y, si aun así se sale por un lado, lo desplaza lo justo.
const BUBBLE_GAP = 8;
function fitBubble(mascotEl, bub){
  const box = mascotEl.closest('.hero, .wardrobe-preview');
  if(!box) return;
  bub.style.maxWidth = '';
  bub.style.translate = '';
  const b = box.getBoundingClientRect();
  bub.style.maxWidth = Math.max(80, Math.min(150, b.width - BUBBLE_GAP * 2)) + 'px';
  // posición de layout (sin la animación de entrada): la del mascot + su offset dentro de él
  const left = mascotEl.getBoundingClientRect().left + bub.offsetLeft;
  const right = left + bub.offsetWidth;
  let dx = 0;
  if(left < b.left + BUBBLE_GAP) dx = b.left + BUBBLE_GAP - left;
  else if(right > b.right - BUBBLE_GAP) dx = b.right - BUBBLE_GAP - right;
  if(dx) bub.style.translate = dx + 'px 0';
}

// Hace que la mascota compañera (si hay una en ese .mascot) diga algo un momento.
export function petSay(mascotEl){
  if(!mascotEl) return;
  const pet = mascotEl.querySelector(':scope > svg.pet');
  if(!pet) return;
  const key = pet.dataset.k;
  const msg = petMessage(key, petLastMsg[key]);
  if(!msg) return;
  petLastMsg[key] = msg;

  let bub = mascotEl.querySelector(':scope > .pet-bubble');
  if(!bub){
    bub = document.createElement('div');
    bub.className = 'pet-bubble';
    bub.setAttribute('aria-hidden', 'true');
    mascotEl.appendChild(bub);
  }
  bub.textContent = msg;
  fitBubble(mascotEl, bub);
  // reinicia la animación de entrada
  bub.classList.remove('show');
  void bub.offsetWidth;
  bub.classList.add('show');

  clearTimeout(petTimers.get(mascotEl));
  petTimers.set(mascotEl, setTimeout(()=>bub.classList.remove('show'), PET_BUBBLE_MS));
}

// Habla en la vista que estás viendo: portada (Mito grande) o tienda/armario (vista previa).
export function initPetTalk({ viewVisible }){
  setInterval(()=>{
    if(document.hidden) return;
    if(viewVisible('home')) petSay(byId('mascotHero'));
    else if(viewVisible('shop')) petSay(byId('mascotPreview'));
    else if(viewVisible('wardrobe')) petSay(byId('mascotWardrobe'));
  }, PET_TICK_MS);
}