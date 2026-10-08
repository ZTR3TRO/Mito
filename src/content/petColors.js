// Reglas de color de las mascotas compañeras (datos puros, sin imports).
// Las usa features/mascot/petRecolor.js cuando eliges un color para una mascota.
//
// Cómo funciona el recolor: todos los colores "con color" del dibujo se remapean por su brillo a una rampa
// (oscuro → medio → claro) del color elegido, así que las sombras, el cuerpo y los brillos siguen siendo coherentes.
// Lo que NO se toca son los colores de estas dos listas.

// Cara y detalles que no cambian en NINGUNA mascota: ojos y boca, brillos, mejillas, pico/hocico anaranjado, burbujas…
export const PET_FACE_COLORS = [
  '#000', '#fff', '#2b2140', '#6a56a8', '#ff8fc0', '#ff7fb2',
  '#ff8a3d', '#d9601c', '#e8f6ff', '#eaf7ff', '#8cc4f0',
];

// Detalles que conserva cada mascota para no perder su identidad.
export const PET_KEEP = {
  dragon: ['#ff9ccb', '#fff3a6', '#f0a91a', '#b9790a', '#e8c98f'],   // alas rosas, cuernos dorados y su vientre
  turtle: ['#f3d99a', '#c9a24c'],                                    // el borde arena del caparazón
};
