// Escucha el dedo o el ratón sobre Mito y le pasa los eventos al clasificador (core/gesture.js).
// Pointer Events cubren touch y mouse por igual. Solo Mito bloquea el scroll del dedo (touch-action:none
// en style.css), así que el resto de la página se sigue moviendo normal.

import { createGestureClassifier, GESTURE } from '../../core/gesture.js';

const now = ()=> (typeof performance !== 'undefined' ? performance.now() : Date.now());
// Cuerpo de Mito dentro de su SVG (viewBox 150): centro (75, 72), radio ~52. Una caricia cuenta mientras el dedo
// siga a menos de 1.15 radios del centro.
const CENTER = { x: 75 / 150, y: 72 / 150 }, RADIUS = 52 / 150 * 1.15;

// onGesture(g) recibe los gestos del clasificador; onPetTap() cuando se toca a la mascota.
// enabled(): si es falso (p. ej. durante el baño, cuando el dedo mueve la esponja), Mito no recibe gestos.
export function bindGestures(mascot, { onGesture, onPetTap, enabled = ()=> true }){
  const classifier = createGestureClassifier();
  let pointer = null, longPress = 0;

  const svg = ()=> mascot.querySelector(':scope > svg.mito');
  function inside(x, y){
    const r = svg()?.getBoundingClientRect();
    if(!r || !r.width) return true;
    return Math.hypot(x - (r.left + r.width * CENTER.x), y - (r.top + r.height * CENTER.y)) <= r.width * RADIUS;
  }
  const emit = list => list.forEach(onGesture);

  mascot.addEventListener('pointerdown', e=>{
    if(e.button > 0 || pointer !== null || !enabled()) return;
    if(e.target.closest('svg.pet')){ onPetTap(); return; }
    if(!e.target.closest('svg.mito')) return;
    e.preventDefault();   // sin selección de texto ni arrastre de imagen
    pointer = e.pointerId;
    try{ mascot.setPointerCapture(e.pointerId); }catch{}
    // La caricia se mide en proporción a Mito: medio Mito de recorrido.
    const w = svg()?.getBoundingClientRect().width;
    if(w) classifier.options.strokePx = Math.max(36, w * .5);
    emit(classifier.down(now(), e.clientX, e.clientY));
    clearTimeout(longPress);
    longPress = setTimeout(()=> emit(classifier.tick(now())), GESTURE.longPressMs);
  });
  mascot.addEventListener('pointermove', e=>{
    if(e.pointerId !== pointer) return;
    emit(classifier.move(now(), e.clientX, e.clientY, inside(e.clientX, e.clientY)));
  });
  const end = cancel => e=>{
    if(e.pointerId !== pointer) return;
    clearTimeout(longPress);
    pointer = null;
    emit(cancel ? classifier.cancel() : classifier.up(now(), e.clientX, e.clientY));
  };
  mascot.addEventListener('pointerup', end(false));
  mascot.addEventListener('pointercancel', end(true));
  mascot.addEventListener('lostpointercapture', end(true));
  // Mantener presionado en el teléfono no debe abrir el menú del navegador.
  mascot.addEventListener('contextmenu', e=> e.preventDefault());

  // Teclado: Enter o Espacio sobre Mito = picarlo en el centro.
  mascot.addEventListener('keydown', e=>{
    if((e.key !== 'Enter' && e.key !== ' ') || !enabled()) return;
    e.preventDefault();
    const r = svg()?.getBoundingClientRect();
    onGesture({ type: 'poke', x: r ? r.left + r.width / 2 : 0, y: r ? r.top + r.height / 2 : 0, taps: 1 });
  });

  // Al salir de la vista: suelta lo que hubiera a medias.
  return function cancel(){
    clearTimeout(longPress);
    if(pointer !== null){ pointer = null; emit(classifier.cancel()); }
  };
}
