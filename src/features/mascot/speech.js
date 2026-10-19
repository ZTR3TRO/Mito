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

// Mantiene el globo dentro de su contenedor (la tarjeta de la portada o la vista previa del armario):
// limita su ancho y, si aun así se sale por un lado, lo desplaza lo justo.
const BUBBLE_GAP = 8;
function fitBubble(mascotEl, bub){
  // En el quiz la caja es todo el quiz (así la burbuja puede usar el margen de la tarjeta).
  const box = mascotEl.closest('.mascot-quiz') ? mascotEl.closest('.quiz-shell') : mascotEl.closest('.hero, .wardrobe-preview');
  if(!box || !box.offsetWidth) return;   // sin caja (p. ej. el panel lateral oculto en móvil) no hay nada que ajustar
  bub.style.maxWidth = '';
  bub.style.translate = '';
  const b = box.getBoundingClientRect();
  // En el hero en móvil la burbuja va a la izquierda de Mito: su ancho es el espacio libre hasta él.
  const besideMito = !!mascotEl.closest('.mascot-quiz') || (box.classList.contains('hero') && window.matchMedia?.('(max-width: 880px)').matches);
  let room = b.width - BUBBLE_GAP * 2;
  if(besideMito) room = mascotEl.getBoundingClientRect().left - b.left - BUBBLE_GAP - 4;
  bub.style.maxWidth = Math.max(besideMito ? 64 : 80, Math.min(150, room)) + 'px';
  // posición de layout (sin la animación de entrada): la del mascot + su offset dentro de él
  const left = mascotEl.getBoundingClientRect().left + bub.offsetLeft;
  const right = left + bub.offsetWidth;
  let dx = 0;
  if(left < b.left + BUBBLE_GAP) dx = b.left + BUBBLE_GAP - left;
  else if(right > b.right - BUBBLE_GAP) dx = b.right - BUBBLE_GAP - right;
  if(dx) bub.style.translate = dx + 'px 0';
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
