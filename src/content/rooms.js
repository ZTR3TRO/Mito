// Los cuartos de la Casa (datos puros), de izquierda a derecha: la casa es horizontal y la cámara se mueve entre ellos.
// Agregar un cuarto (p. ej. el patio) = una entrada más aquí, con su fondo.
//
//   id       clave guardada (en los muebles colocados y en la posición de Mito)
//   name     en los indicadores, las flechas y las frases
//   action   la acción que vive solo en ese cuarto ('sleep' | 'bath' | 'eat'; la Sala no tiene: es para estar)
//   floor    el piso: 'planks' (duela) | 'tiles' (mosaico chico) | 'checker' (ajedrez); los colores van en style.css
//   window   la ventana: 'rect' (la de siempre, con cortinas y haz de luz) | 'round' (redonda, esmerilada)

export const ROOMS = [
  { id: 'bedroom', name: 'Cuarto', action: 'sleep', floor: 'planks',  window: 'rect' },
  { id: 'bath',    name: 'Baño',   action: 'bath',  floor: 'tiles',   window: 'round' },
  { id: 'living',  name: 'Sala',   action: null,    floor: 'planks',  window: 'rect' },
  { id: 'kitchen', name: 'Cocina', action: 'eat',   floor: 'checker', window: 'rect' },
];

// El cuarto de las partidas de antes de la Fase 5: ahí quedan los muebles sin cuarto y Mito, si no se sabe dónde está.
export const DEFAULT_ROOM = 'bedroom';

export const findRoom = id => ROOMS.find(r => r.id === id) || null;
