// Qué hace cada sombrero con las antenas de Mito (datos puros). Las antenas se pintan antes que los sombreros,
// así que el sombrero siempre queda encima: aquí solo se decide cuáles se ven y dónde.
//   c / l / r  = antena central / izquierda / derecha
//   hidden     = no se pinta
//   dx, dy     = desplazamiento en unidades del lienzo (viewBox 150)
// Un sombrero que no aparece aquí deja las tres antenas donde están.

const LOW = { c: { dx: -3, dy: -7 }, l: { dx: -8, dy: 2 }, r: { dx: 8, dy: 2 } };       // corona, birrete: las tres asoman, abiertas
const TALL = { c: { hidden: true }, l: { dx: -8, dy: 2 }, r: { dx: 8, dy: 2 } };         // chef, mago: la central no cabe
const BARE = { c: { hidden: true }, l: { hidden: true }, r: { hidden: true } };          // tapan la cabeza entera

export const HAT_ANTENNAS = {
  crown: LOW,
  grad: LOW,
  chef: TALL,
  wizard: TALL,
  pumpkinhat: BARE,
  vamphair: BARE,
};
