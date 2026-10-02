// Estado y cara de Mito. Sin dependencias del store: solo toca clases del DOM.

export function setFace(el, face){
  if(!el) return;
  el.classList.remove('face-normal','face-happy','face-sad','face-excited');
  el.classList.add('face-'+face);
}

// Reinicia la animación de estado antes de reaplicarla (mismo truco que en CSS land).
export function playState(el, state){
  if(!el) return;
  el.classList.remove('state-happy','state-sad','state-excited');
  void el.offsetWidth;
  if(state) el.classList.add('state-'+state);
}