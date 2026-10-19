// Boclas de Mito: burbuja lateral, bocadillo del héroe y globitos de la mascota compañera.
// La materia activa se inyecta como callback para no importar el módulo de cursos
// (evita ciclo con course, que usa este módulo para hablar al cambiar de materia).

import { idleMessage, petMessage } from '../../content/messages.js';
import { byId } from '../../core/dom.js';
import { on } from '../../core/bus.js';

const IDLE_SIDE_MS = 9000;
const TICK_SIDE_MS = 5000;
const IDLE_HERO_MS = 8000;
const TICK_HERO_MS = 8000;
// Cada cuánto habla la mascota compañera: un valor al azar entre min y max (ms) tras cada frase, para que no suene mecánico.
const PET_TALK_MS = { min: 8000, max: 13000 };
// Cuánto se queda visible su globito.
const PET_BUBBLE_MS = 5000;
// Margen que se deja entre una frase de la mascota y un cambio de mensaje de Mito, para que no coincidan.
const PET_HERO_GAP_MS = 2000;

let sideBubbleEl, heroSpeechEl;
let bubbleLastChange = Date.now();
let bubbleOwnWrite = false;
let sideLastMsg = '';
let heroLastMsg = '';
let heroChangedAt = 0;    // última vez que Mito cambió de frase por cualquier motivo
// Durante una ronda del quiz los temporizadores se apagan: solo hablan las reacciones a lo que pasa (reactions.js).
let talkPaused = false;
let petTalkAt = 0;        // cuándo está agendada la próxima frase de la mascota
let petSpokeAt = 0;       // cuándo habló por última vez
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
    if(document.hidden || talkPaused || !sideBubbleEl || mitoBlocked(Date.now())) return;
    if(Date.now() - bubbleLastChange >= IDLE_SIDE_MS){
      bubbleOwnWrite = true;
      sideBubbleEl.textContent = sideLastMsg = idleMessage(getCourseId(), sideLastMsg);
      bubbleLastChange = Date.now();
    }
  }, TICK_SIDE_MS);
  // Si coincide con la frase de la mascota, Mito espera un poco (reintenta cada 500 ms): así la mascota mantiene su ritmo.
  const tickHero = (tries = 0)=>{
    if(document.hidden || talkPaused) return;
    if(mitoBlocked(Date.now()) && tries < 8){ setTimeout(()=>tickHero(tries + 1), 500); return; }
    sayHero(idleMessage(getCourseId(), heroLastMsg));
  };
  setInterval(()=>tickHero(), TICK_HERO_MS);
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
  heroChangedAt = Date.now();
}

export const getHeroLastMsg = ()=> heroLastMsg;

// Regla de las burbujas: ninguna tapa la cara de Mito ni a la mascota. El globo de la mascota va siempre a la izquierda de
// Mito (la mascota se sienta a su izquierda), encima de ella y con la colita apuntándole; su ancho es el espacio libre
// entre el borde de la caja y Mito, así nunca alcanza la cara. En la vista previa de Tienda y Armario en móvil no hay
// espacio al lado: el globo va en una franja reservada al pie de la tarjeta (ver style.css).
const BUBBLE_GAP = 8;
const MOBILE = '(max-width: 880px)';

// La caja dentro de la que debe quedar el globo.
function bubbleBox(mascotEl){
  // En el quiz la caja es todo el quiz (así la burbuja puede usar el margen de la tarjeta).
  if(mascotEl.closest('.mascot-quiz')) return mascotEl.closest('.quiz-shell');
  return mascotEl.closest('.mascot-hero-wrap, .wardrobe-preview');
}

function fitBubble(mascotEl, bub){
  const box = bubbleBox(mascotEl);
  if(!box || !box.offsetWidth) return;   // sin caja (p. ej. el panel lateral oculto en móvil) no hay nada que ajustar
  bub.style.maxWidth = '';
  const room = mascotEl.getBoundingClientRect().left - box.getBoundingClientRect().left - BUBBLE_GAP - 4;
  bub.style.maxWidth = Math.max(64, Math.min(150, room)) + 'px';
}

// Vista previa en móvil: el globo vive en la franja del pie de la tarjeta y la colita se alinea con la mascota.
function stripHost(mascotEl){
  const card = mascotEl.closest('.wardrobe-preview');
  return card && window.matchMedia?.(MOBILE).matches ? card : null;
}
function aimStripTail(mascotEl, bub){
  const pet = mascotEl.querySelector(':scope > svg.pet').getBoundingClientRect();
  const b = bub.getBoundingClientRect();
  const x = pet.left + pet.width / 2 - b.left;
  bub.style.setProperty('--tail-x', Math.max(14, Math.min(b.width - 14, x)) + 'px');
}

// Hace que la mascota compañera (si hay una en ese .mascot) diga algo un momento. Si se pasan más .mascot
// (p. ej. el del panel lateral), todos muestran la misma frase.
export function petSay(mascotEl, ...alsoOn){
  const targets = [mascotEl, ...alsoOn].filter(el => el && el.querySelector(':scope > svg.pet'));
  if(!targets.length) return;
  const key = targets[0].querySelector(':scope > svg.pet').dataset.k;
  const msg = petMessage(key, petLastMsg[key]);
  if(!msg) return;
  petLastMsg[key] = msg;
  targets.forEach(el => showPetBubble(el, msg));
}

// Frase concreta de la mascota (las reacciones del quiz) en uno o más .mascot.
export function petSpeak(text, ...mascots){
  mascots.filter(el => el && el.offsetParent !== null && el.querySelector(':scope > svg.pet')).forEach(el => showPetBubble(el, text));
}

// Apaga los globitos de reacción que sigan a la vista, para que solo se vea el de la reacción más reciente.
export function hideReactions(){
  document.querySelectorAll('.pet-bubble.show, .quiz-speech.show').forEach(b => b.classList.remove('show'));
}

// Globito de Mito junto a su mascota en el quiz (en móvil, donde no hay panel lateral).
let quizSayTimer = null;
export function quizSay(text){
  const bubbles = [...document.querySelectorAll('.quiz-speech')].filter(b => b.offsetParent !== null || b.closest('.mascot-quiz')?.offsetParent !== null);
  bubbles.forEach(b => { b.textContent = text; b.classList.add('show'); });
  clearTimeout(quizSayTimer);
  quizSayTimer = setTimeout(()=>bubbles.forEach(b => b.classList.remove('show')), PET_BUBBLE_MS);
}

function showPetBubble(mascotEl, msg){
  const strip = stripHost(mascotEl);
  const host = strip || mascotEl;
  // si cambió el ancho de la ventana, el globo del otro sitio no debe quedarse a la vista
  (strip ? mascotEl : mascotEl.closest('.wardrobe-preview'))?.querySelector(':scope > .pet-bubble')?.classList.remove('show');
  let bub = host.querySelector(':scope > .pet-bubble');
  if(!bub){
    bub = document.createElement('div');
    bub.className = 'pet-bubble';
    bub.setAttribute('aria-hidden', 'true');
    host.appendChild(bub);
  }
  bub.textContent = msg;
  if(strip) aimStripTail(mascotEl, bub);
  else fitBubble(mascotEl, bub);
  // reinicia la animación de entrada
  bub.classList.remove('show');
  void bub.offsetWidth;
  bub.classList.add('show');

  clearTimeout(petTimers.get(mascotEl));
  petTimers.set(mascotEl, setTimeout(()=>bub.classList.remove('show'), PET_BUBBLE_MS));
}

// Mito no cambia de frase justo cuando la mascota va a hablar (o acaba de hablar), y al revés.
function mitoBlocked(t){
  return Math.abs(t - petTalkAt) < PET_HERO_GAP_MS || t - petSpokeAt < PET_HERO_GAP_MS;
}
function mitoChangedRecently(t){
  return Math.abs(t - heroChangedAt) < PET_HERO_GAP_MS || Math.abs(t - bubbleLastChange) < PET_HERO_GAP_MS;
}

// Habla en la vista que estás viendo (portada, tienda o armario). En el panel lateral solo habla Mito.
// Cada frase se agenda sola con un retraso al azar; con la pestaña oculta se pausa y al volver se retoma.
export function initPetTalk({ viewVisible }){
  let timer = null;
  const nextDelay = ()=> PET_TALK_MS.min + Math.random() * (PET_TALK_MS.max - PET_TALK_MS.min);

  function speak(){
    timer = null;
    if(talkPaused) return;
    const now = Date.now();
    if(mitoChangedRecently(now)){ schedule(PET_HERO_GAP_MS); return; }   // Mito acaba de hablar: se desfasa unos segundos
    petSpokeAt = now;
    const main = viewVisible('home') ? byId('mascotHero')
      : viewVisible('shop') ? byId('mascotPreview')
      : viewVisible('wardrobe') ? byId('mascotWardrobe') : null;
    petSay(main);
    schedule(nextDelay());
  }
  function schedule(ms){
    clearTimeout(timer);
    petTalkAt = Date.now() + ms;
    timer = setTimeout(speak, ms);
  }

  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ clearTimeout(timer); timer = null; petTalkAt = 0; }
    else if(!talkPaused) schedule(nextDelay());
  });
  // Ronda del quiz: sin temporizador. Al terminar o salir se reanuda el normal.
  on('quiz:started', ()=>{ talkPaused = true; clearTimeout(timer); timer = null; petTalkAt = 0; });
  const resume = ()=>{
    if(!talkPaused) return;
    talkPaused = false;
    bubbleLastChange = heroChangedAt = Date.now();   // Mito también retoma su ritmo normal desde cero, no de golpe
    if(!document.hidden) schedule(nextDelay());
  };
  on('quiz:finished', resume);
  on('quiz:ended', resume);
  if(!document.hidden) schedule(nextDelay());
}
