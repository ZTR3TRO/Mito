// Bus de eventos mínimo para comunicación entre módulos.
// Los módulos de dominio se emiten entre sí sin conocerse: quien produce publica,
// quien necesita se suscribe. Evita imports circulares y deja el flujo de datos explícito.

const listeners = new Map();

export function on(event, fn){
  if(!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => off(event, fn);
}

function off(event, fn){
  listeners.get(event)?.delete(fn);
}

export function emit(event, detail){
  listeners.get(event)?.forEach(fn=>fn(detail));
  listeners.get('*')?.forEach(fn=>fn(event, detail));
}