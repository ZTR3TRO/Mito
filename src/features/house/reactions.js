// Reacciones en la Casa: la cara y la animación de Mito, lo que dice, y cómo reacciona la mascota.
// Las frases y la tabla de reacciones por mascota están en content/house.js.
//
// Globos: el de Mito se coloca donde no tape su cara, ni a la mascota, ni el globo de la mascota, ni la orilla
// (cuando se lleva a Mito al borde para cambiar de cuarto): arriba de Mito, arriba pero corrido hacia adentro, a su
// derecha o a su izquierda, lo primero que quepa dentro del cuarto. Lo sigue si se mueve. El de la mascota
// es el de siempre (speech.js), a la izquierda de Mito y encima de ella.

import { MITO_HOUSE, PET_HOUSE } from '../../content/house.js';
import { findItem } from '../../content/wardrobe.js';
import { getEquipped } from '../../state/store.js';
import { setFace } from '../mascot/face.js';
import { petSpeak } from '../mascot/speech.js';

const SPEECH_MS = 2600;      // cuánto se ve el globo de Mito
const SAME_KIND_MS = 1600;   // una misma clase de frase no se repite antes de esto (cosquillas y caricias llegan seguidas)
const PET_ACT_MS = 1300;     // duración máxima de una reacción de la mascota
const PET_ACT_GAP_MS = 700;  // la mascota no reacciona más seguido que esto
const GAP = 10;              // separación del globo con Mito
const EDGE = 6;              // margen con el borde del cuarto
// Medidas del dibujo de Mito (viewBox 150): cuerpo de x 23 a 127 y de y 18 a 126; antenas hasta y −5.
const BODY = { x0: 23 / 150, x1: 127 / 150, y0: 18 / 150, y1: 126 / 150, top: -5 / 150 };

const pick = (pool, last) => { const opts = pool.filter(m => m !== last); const list = opts.length ? opts : pool; return list[Math.floor(Math.random() * list.length)]; };
const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export function createReactions(room, mascot, speech){
  const svg = ()=> mascot.querySelector(':scope > svg.mito');
  const petEl = ()=> mascot.querySelector(':scope > svg.pet');
  const petKey = ()=> { const k = (findItem('pet', getEquipped().pet) || {}).k; return PET_HOUSE[k] ? k : null; };
  const timers = new Map();
  const later = (key, ms, fn) => { clearTimeout(timers.get(key)); timers.set(key, setTimeout(fn, ms)); };
  const lastMsg = {}, lastAt = {};
  let petActAt = 0, petTurn = 0;
  let baseFace = 'normal';     // la cara de reposo: la pone el estado de Mito (needs.js), p. ej. triste

  /* ---------- cara y clases ---------- */
  function face(f, ms){
    setFace(mascot, f);
    if(ms) later('face', ms, ()=>{ timers.delete('face'); setFace(mascot, baseFace); });
    else clearTimeout(timers.get('face'));
  }
  function play(cls, ms){
    mascot.classList.remove(cls);
    void mascot.offsetWidth;   // reinicia la animación si ya estaba
    mascot.classList.add(cls);
    later(cls, ms, ()=> mascot.classList.remove(cls));
  }
  function hold(cls, ms){      // mantiene la clase mientras sigan llegando eventos
    mascot.classList.add(cls);
    later(cls, ms, ()=> mascot.classList.remove(cls));
  }

  /* ---------- globo de Mito ---------- */
  function place(){
    if(!speech.classList.contains('show')) return;
    const r = room.getBoundingClientRect(), s = svg()?.getBoundingClientRect();
    if(!s || !r.width) return;
    const W = r.width, H = r.height, w = speech.offsetWidth, h = speech.offsetHeight;
    const rel = b => ({ left: b.left - r.left, right: b.right - r.left, top: b.top - r.top, bottom: b.bottom - r.top });
    const box = s.width;
    const body = { left: s.left - r.left + box * BODY.x0, right: s.left - r.left + box * BODY.x1, top: s.top - r.top + box * BODY.top, bottom: s.top - r.top + box * BODY.y1 };
    const cx = (body.left + body.right) / 2;
    const avoid = [body];
    const pet = petEl(); if(pet) avoid.push(rel(pet.getBoundingClientRect()));
    const pb = mascot.querySelector(':scope > .pet-bubble.show'); if(pb) avoid.push(rel(pb.getBoundingClientRect()));
    const edge = room.querySelector('.edge-go.show'), strip = edge && rel(edge.getBoundingClientRect());
    if(strip) avoid.push(strip);
    const clampX = x => Math.max(EDGE, Math.min(W - w - EDGE, x));
    const faceY = s.top - r.top + box * .3;
    // arriba, pero sin entrar a la orilla (del lado contrario a ella)
    const inward = strip ? (strip.left > W / 2 ? Math.min(clampX(cx - w / 2), strip.left - w - GAP) : Math.max(clampX(cx - w / 2), strip.right + GAP)) : null;
    const options = [
      ['above', clampX(cx - w / 2), body.top - h - GAP],
      ...(strip ? [['above', inward, body.top - h - GAP]] : []),
      ['right', body.right + GAP, faceY],
      ['left', body.left - w - GAP, faceY],
    ];
    const fits = ([, x, y]) => {
      const b = { left: x, right: x + w, top: y, bottom: y + h };
      return x >= EDGE && x + w <= W - EDGE && y >= EDGE && y + h <= H - EDGE && !avoid.some(a => overlaps(a, b));
    };
    const [side, x, y] = options.find(fits) || ['above', options[0][1], Math.max(EDGE, options[0][2])];
    speech.dataset.side = side;
    speech.style.left = x.toFixed(1) + 'px';
    speech.style.top = y.toFixed(1) + 'px';
    speech.style.setProperty('--tail', Math.max(14, Math.min(w - 14, cx - x)).toFixed(1) + 'px');
  }

  function show(text){
    speech.textContent = text;
    speech.classList.add('show');
    place();
    later('speech', SPEECH_MS, ()=> speech.classList.remove('show'));
  }
  // Una frase al azar de un grupo, sin repetir la anterior de ese grupo ni decirla dos veces seguidas muy rápido.
  function sayFrom(pool, key){
    const t = Date.now();
    if(lastAt[key] && t - lastAt[key] < SAME_KIND_MS) return;
    lastAt[key] = t;
    show(lastMsg[key] = pick(pool, lastMsg[key]));
  }
  const say = kind => sayFrom(MITO_HOUSE[kind], kind);

  /* ---------- mascota ---------- */
  const stopPet = el => [...el.classList].filter(c => c.startsWith('pr-')).forEach(c => el.classList.remove(c));
  function petPlay(act){
    const el = petEl();
    if(!el) return;
    stopPet(el);
    void el.getBoundingClientRect();   // reinicia la animación
    el.classList.add('pr-' + act);
    later('pet', PET_ACT_MS, ()=> stopPet(el));
  }
  function petAct(event, force = false){
    const k = petKey();
    if(!petEl() || !k) return;
    const t = Date.now();
    if(!force && t - petActAt < PET_ACT_GAP_MS) return;
    petActAt = t;
    petPlay(PET_HOUSE[k].act[event] || 'hop');
  }
  // En la caricia y el aterrizaje hablan por turnos: una vez Mito, otra la mascota.
  function sayOrPet(event){
    const k = petKey();
    if(k && petTurn++ % 2 === 1){
      const pool = PET_HOUSE[k].say[event];
      const key = k + event;
      petSpeak(lastMsg[key] = pick(pool, lastMsg[key]), mascot);
      place();   // el globo de Mito no debe quedar encima del de la mascota
    } else say(event);
  }

  return {
    place,
    sayFrom,
    petPlay,

    // La cara de reposo (normal o triste). Si hay una reacción en curso, se aplica al terminar.
    setBase(f){
      baseFace = f;
      if(!timers.has('face')) setFace(mascot, f);
    },

    poke(px, py){
      const s = svg()?.getBoundingClientRect();
      const dx = s && s.width ? (px - (s.left + s.width / 2)) / s.width : 0;
      // en el centro se infla; a un lado, se hace a un lado (alejándose del dedo)
      if(Math.abs(dx) < .14) play('hr-puff', 550);
      else { mascot.style.setProperty('--poke-dir', dx > 0 ? -1 : 1); play('hr-side', 550); }
      face('happy', 700);
      say('poke');
      petAct('poke');
    },

    tickle(){
      mascot.classList.remove('hr-side', 'hr-puff');
      hold('hr-tickle', 1000);
      face('happy', 1100);
      say('tickle');
      petAct('tickle');
    },

    stroke(){
      hold('hr-pet', 900);
      face('happy', 1000);
      if(!mascot.dataset.petting){ mascot.dataset.petting = '1'; sayOrPet('pet'); petAct('pet', true); }
      later('petting', 1600, ()=> delete mascot.dataset.petting);
    },

    grab(){
      ['hr-side', 'hr-puff', 'hr-tickle', 'hr-pet'].forEach(c => mascot.classList.remove(c));
      mascot.classList.add('hr-held');
      face('excited');
      say('grab');
      petAct('grab', true);
    },

    // speed en altos de cuarto por segundo
    release(speed, reduced){
      mascot.classList.remove('hr-held');
      if(speed > .8 && !reduced) say('throw');
    },

    hit(kind, impact){
      if(kind !== 'floor' || impact < 1) return;
      play('hr-squash', 320);
      petAct('land');
    },

    settle(bounced){
      face('happy', 1500);
      if(bounced) sayOrPet('land'); else say('drop');
      petAct('land', true);
    },

    // Tocar a la mascota: salta y dice algo de la Casa (no la charla de estudio).
    petTap(){
      const k = petKey();
      if(!petEl() || !k) return;
      petPlay('hop');
      const key = k + 'tap';
      petSpeak(lastMsg[key] = pick(PET_HOUSE[k].say.pet, lastMsg[key]), mascot);
      place();
    },

    welcome(){ say('welcome'); },

    // Comer (food.js): ojitos felices y la boca masticando mientras dura.
    munch(ms){
      face('happy', ms);
      play('is-chewing', ms);
    },

    // "No, gracias" (ya está lleno, o no tiene sueño): se hace un poco a un lado.
    nope(){
      mascot.style.setProperty('--poke-dir', 1);
      play('hr-side', 550);
    },

    // Al salir de la Casa: todo a su estado de reposo.
    clear(){
      timers.forEach(clearTimeout); timers.clear();
      ['hr-side', 'hr-puff', 'hr-tickle', 'hr-pet', 'hr-held', 'hr-squash', 'is-chewing'].forEach(c => mascot.classList.remove(c));
      delete mascot.dataset.petting;
      const el = petEl();
      if(el) stopPet(el);
      speech.classList.remove('show');
      setFace(mascot, baseFace);
    },

    // Callar el globo (al dormirse, por ejemplo).
    hush(){ clearTimeout(timers.get('speech')); speech.classList.remove('show'); },
  };
}
