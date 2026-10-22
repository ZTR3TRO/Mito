// Los cuartos de la Casa (datos puros), de izquierda a derecha: la casa es horizontal y la cámara se mueve entre ellos.
// Agregar un cuarto (p. ej. el patio) = una entrada más aquí, con su fondo.
//
//   id       clave guardada (en los muebles colocados y en la posición de Mito)
//   name     en los indicadores, las flechas y las frases
//   action   la acción que vive solo en ese cuarto ('sleep' | 'bath' | 'eat'; la Sala no tiene: es para estar)

export const ROOMS = [
  { id: 'bedroom', name: 'Cuarto', action: 'sleep' },
  { id: 'bath',    name: 'Baño',   action: 'bath' },
  { id: 'living',  name: 'Sala',   action: null },
  { id: 'kitchen', name: 'Cocina', action: 'eat' },
];

// El cuarto de las partidas de antes de la Fase 5: ahí quedan los muebles sin cuarto y Mito, si no se sabe dónde está.
export const DEFAULT_ROOM = 'bedroom';

export const findRoom = id => ROOMS.find(r => r.id === id) || null;
