// Dónde y de qué tamaño se ve cada mueble (lógica pura, sin DOM: se prueba en Node). Usa la composición del cuarto
// de layout.js (sceneLayout). Coordenadas: px del cuarto.
//
// Colocación guardada (state/decor.js): { zona, u, v, flip, scale }, con u y v de 0 a 1 dentro de su zona y scale el
// tamaño elegido (× el base, FURNITURE_SCALE; se combina con la perspectiva del piso).
//   floor: u = x del centro (fracción del ancho del cuarto); v = qué tan al frente está la base, de 0 (junto al
//          zócalo) a 1 (junto a la barra de acciones). El tamaño sigue la perspectiva del piso (la misma ley que las
//          tablas, layout.js) y vale 1 en el lugar de Mito: más al frente, más grande.
//   wall:  u = x del centro; v = altura dentro de la pared, de 0 (arriba) a 1 (junto al zócalo). No cambia de tamaño.
// Límites: el mueble queda entero dentro del cuarto (con un margen), la base del piso nunca baja a la franja de la
// barra, y lo de la pared no tapa la ventana ni sus cortinas (se corre al lado libre más cercano). Si con su tamaño
// no cabe de ninguna forma, se achica lo necesario (nunca por debajo del mínimo).
// Todo recibe la composición del cuarto (L): sirve igual para cualquier cuarto de la casa.
//
// Profundidad (de atrás hacia adelante): pared → alfombras (flat) → muebles del piso por v → Mito y la mascota.

import { FLOOR } from './layout.js';
import { FURNITURE_SIZE, FURNITURE_SCALE as SC } from '../../content/furniture.js';

export const FURN = {
  margin: 8,        // separación con los bordes del cuarto y con el zócalo
  barGap: 6,        // separación de la base de un mueble con la franja de la barra
  winPad: 6,        // separación de lo de la pared con la ventana
};
const WIN_BOX = { y0: 17 / 250, y1: 216 / 250, ratio: 250 / 200 };   // ventana con barra, cortinas y repisón (viewBox 200 × 250)

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const area = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

const scaleOf = p => clamp(Number.isFinite(p?.scale) ? p.scale : 1, SC.min, SC.max);
const round2 = n => Math.round(n * 100) / 100;

// Tamaño sin perspectiva (px), con el tamaño elegido.
function baseSize(L, item, scale = 1){
  const w = item.size * L.block.w * FURNITURE_SIZE[L.kind] * scale;
  return { w, h: w * item.box[1] / item.box[0] };
}

/* ---------- tamaño ---------- */
// Acota al rango y se pega al 100 % si queda cerca (para la manija y el pellizco, que son continuos).
export function snapScale(s){
  const c = scaleOf({ scale: s });
  return Math.abs(c - 1) < SC.snap ? 1 : round2(c);
}
// Un paso de los botones o del teclado (dir = 1 o −1): al siguiente múltiplo del paso, dentro del rango.
export function stepScale(s, dir){
  const k = scaleOf({ scale: s }) / SC.step;
  const next = (dir > 0 ? Math.floor(k + 1e-6) + 1 : Math.ceil(k - 1e-6) - 1) * SC.step;
  return round2(clamp(next, SC.min, SC.max));
}
// Cambiar el tamaño sin que el mueble se "vaya": del piso queda fija la base (crece hacia arriba y a los lados);
// de la pared, el centro. Después se corrige como cualquier colocación (límites, ventana).
export function resizeSpot(L, item, p, scale){
  const s = scaleOf({ scale });
  const next = { ...p, scale: s };
  if(item.zone !== 'wall') return clampSpot(L, item, next);
  const b = furnitureBox(L, item, clampSpot(L, item, p));
  return spotAt(L, item, b.x + b.w / 2, b.y + b.h / 2 - baseSize(L, item, s).h / 2, { flip: p.flip, scale: s });
}
// Franja donde puede estar la base de un mueble del piso.
const floorBand = L => [L.horizon + FURN.margin, Math.max(L.horizon + FURN.margin, L.H - L.barSpace - FURN.barGap)];
// Escala de perspectiva para una base en y (1 en el lugar de Mito).
function scaleAt(L, y){
  const pct = yy => (yy - L.horizon) / L.fb * 100;
  return (pct(y) + FLOOR.persp) / (pct(L.home.y) + FLOOR.persp);
}
// Rango de la esquina de arriba de un mueble de la pared de alto h.
const wallBand = (L, h) => [FURN.margin, Math.max(FURN.margin, L.horizon - FURN.margin - h)];

// La ventana (con cortinas y repisón), en px del cuarto.
export function windowRect(L){
  const x = L.block.x + L.win.x, top = L.block.y + L.win.y, h = L.win.w * WIN_BOX.ratio;
  return { x, y: top + h * WIN_BOX.y0, w: L.win.w, h: h * (WIN_BOX.y1 - WIN_BOX.y0) };
}

// La caja del mueble en el cuarto (sin corregir: para eso, clampSpot). Del piso, también su base.
export function furnitureBox(L, item, p){
  const s0 = baseSize(L, item, scaleOf(p));
  if(item.zone === 'wall'){
    const [t0, t1] = wallBand(L, s0.h);
    return { x: p.u * L.W - s0.w / 2, y: t0 + p.v * (t1 - t0), w: s0.w, h: s0.h };
  }
  const [b0, b1] = floorBand(L);
  const base = b0 + p.v * (b1 - b0), k = scaleAt(L, base);
  const w = s0.w * k, h = s0.h * k;
  return { x: p.u * L.W - w / 2, y: base - h, w, h, base };
}

// De una posición en px (centro en x; base del piso o borde de arriba en la pared) a { u, v }, ya corregida.
// `keep`: lo demás de la colocación que se conserva (flip, scale).
export function spotAt(L, item, cx, y, keep = {}){
  let u = cx / L.W, v;
  if(item.zone === 'wall'){
    const [t0, t1] = wallBand(L, baseSize(L, item, scaleOf(keep)).h);
    v = t1 > t0 ? (y - t0) / (t1 - t0) : 0;
  } else {
    const [b0, b1] = floorBand(L);
    v = b1 > b0 ? (y - b0) / (b1 - b0) : 0;
  }
  return clampSpot(L, item, { u, v, flip: keep.flip, scale: keep.scale });
}

// Corrige una colocación para que el mueble quede entero en su zona (y lo de la pared, fuera de la ventana).
// Conserva el volteo y el tamaño; el tamaño solo baja si con él no hay forma de que quepa.
export function clampSpot(L, item, p){
  let r;
  for(let s = scaleOf(p); ; s = Math.max(SC.min, s - .05)){
    r = fitAt(L, item, p, s);
    if(r.ok || s <= SC.min) break;
  }
  const out = { u: r.u, v: r.v };
  if(p.flip) out.flip = true;
  if(round2(r.scale) !== 1) out.scale = round2(r.scale);
  return out;
}

// La colocación corregida con un tamaño dado, y si con ese tamaño cabe (ok).
function fitAt(L, item, p, scale){
  const M = FURN.margin;
  let v = clamp(Number.isFinite(p.v) ? p.v : .5, 0, 1);
  const box = vv => furnitureBox(L, item, { u: .5, v: vv, scale });
  // del piso: si es tan alto que se saldría por arriba, se trae hacia el frente (más abajo)
  if(item.zone === 'floor'){
    for(let i = 0; i < 20 && box(v).y < M && v < 1; i++) v = Math.min(1, v + .05);
  }
  const b = box(v);
  let ok = b.w <= L.W - 2 * M + .5 && b.y >= M - .5 && (item.zone === 'floor' || b.h <= L.horizon - 2 * M + .5);
  const u = b.w >= L.W - 2 * M ? .5 : clamp(Number.isFinite(p.u) ? p.u : .5, (M + b.w / 2) / L.W, (L.W - M - b.w / 2) / L.W);
  let out = { u, v, scale };
  if(item.zone === 'wall'){
    out = awayFromWindow(L, item, out);
    if(hitsWindow(L, furnitureBox(L, item, out))) ok = false;
  }
  return { ...out, ok };
}

const hitsWindow = (L, b) => { const R = windowRect(L), pad = FURN.winPad - .5; return area(b, { x: R.x - pad, y: R.y - pad, w: R.w + 2 * pad, h: R.h + 2 * pad }) > 0; };

// Si un mueble de la pared pisa la ventana, se corre al lugar libre más cercano: a un lado, abajo o arriba.
function awayFromWindow(L, item, p){
  const b = furnitureBox(L, item, p), R = windowRect(L), pad = FURN.winPad, M = FURN.margin;
  if(!hitsWindow(L, b)) return p;
  const [t0, t1] = wallBand(L, b.h);
  const options = [
    { x: R.x - pad - b.w, y: b.y }, { x: R.x + R.w + pad, y: b.y },
    { x: b.x, y: R.y + R.h + pad }, { x: b.x, y: R.y - pad - b.h },
  ].filter(o => o.x >= M - .5 && o.x + b.w <= L.W - M + .5 && o.y >= t0 - .5 && o.y <= t1 + .5);
  if(!options.length) return p;
  const best = options.sort((a, c) => Math.hypot(a.x - b.x, a.y - b.y) - Math.hypot(c.x - b.x, c.y - b.y))[0];
  return { ...p, u: (best.x + b.w / 2) / L.W, v: t1 > t0 ? (best.y - t0) / (t1 - t0) : 0 };
}

// Un lugar libre para un mueble que sale del inventario: el que menos se encima con lo que ya está y con Mito (para
// que no quede escondido detrás de él). Se prueban lugares de una rejilla, del centro hacia los lados.
export function freeSpot(L, item, others = []){
  // el cuerpo de Mito (dibujo de 150: x 23–127, y 18–126; el dibujo va a −88 % de su alto sobre home), con un margen
  const mito = { x: L.home.x - L.mito * .4, y: L.home.y - L.mito * .8, w: L.mito * .8, h: L.mito * .8 };
  const rows = item.zone === 'wall' ? [.35, .65, .1] : [.25, .6, .9];
  const cols = [.5, .35, .65, .2, .8, .08, .92];
  let best = null;
  for(const v of rows) for(const u of cols){
    const p = clampSpot(L, item, { u, v });
    const b = furnitureBox(L, item, p);
    const cost = area(b, mito) * 4 + others.reduce((s, o) => s + area(b, o), 0);
    if(!best || cost < best.cost - 1) best = { p, cost };
  }
  return best.p;
}

// Orden de dibujo dentro de una capa: los de la pared primero y los del piso de atrás hacia adelante (por v).
// `list`: [{ item, p }] (el orden de entrada desempata).
export const depthOrder = list => list
  .map((e, i) => ({ e, i, z: e.item.zone === 'wall' ? -1 : e.p.v }))
  .sort((a, b) => a.z - b.z || a.i - b.i)
  .map(x => x.e);
