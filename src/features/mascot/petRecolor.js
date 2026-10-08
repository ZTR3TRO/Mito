// Recolor de mascotas compañeras. Función pura: recibe el SVG de la mascota y el color elegido y devuelve el SVG nuevo.
//
// Idea: en vez de cambiar colores sueltos (que dejaba mascotas "a medias"), se remapea TODO el dibujo por su brillo:
//   1. se reúnen los colores con color del dibujo (directos y de sus degradados);
//   2. se ordenan por brillo: el más oscuro (contornos) → tono oscuro del color elegido, el más claro (brillos) → tono claro;
//   3. los grises, negros, blancos y los colores protegidos (cara, detalles) se dejan tal cual.
// Los degradados se copian con un id propio por instancia, así dos mascotas distintas nunca se pisan.

import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, mixRgb, brightness } from '../../core/color.js';
import { PET_FACE_COLORS } from '../../content/petColors.js';

const COLOR_RE = /((?:fill|stroke|stop-color)\s*[=:]\s*"?)(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g;

const norm = hex => rgbToHex(hexToRgb(hex));
const FACE = new Set(PET_FACE_COLORS.map(norm));

// Gris, casi negro o casi blanco: no tiene "color" que remapear
function isNeutral(hex){
  const [, s, l] = rgbToHsl(hexToRgb(hex));
  return s < 0.16 || l > 0.93 || l < 0.16;
}

function findGradient(defs, id){
  const m = defs.match(new RegExp(`<(linearGradient|radialGradient)\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?</\\1>`));
  return m ? m[0] : null;
}

// Rampa de 3 tonos a partir del color elegido
function rampOf(bodyHex){
  const body = hexToRgb(bodyHex), [h, s, l] = rgbToHsl(body);
  return {
    dark: hslToRgb([h, s, Math.max(0.14, l * 0.5)]),
    mid: body,
    light: mixRgb(body, [255, 255, 255], 0.62),
  };
}
const rampAt = (r, t) => t < 0.5 ? mixRgb(r.dark, r.mid, t / 0.5) : mixRgb(r.mid, r.light, (t - 0.5) / 0.5);

/**
 * @param {string} art     SVG de la mascota (viewBox 80x80, sin <svg>)
 * @param {object} opts
 * @param {string} opts.body  color elegido (el `body` del color del armario)
 * @param {string} opts.defs  texto con los <linearGradient>/<radialGradient> que usa el dibujo
 * @param {string} opts.id    sufijo único de esta instancia (ids de degradados)
 * @param {string[]} [opts.keep]  colores extra que esta mascota conserva
 * @returns {string} SVG recoloreado, con un <defs> delante
 */
export function recolorPet(art, { body, defs, id, keep = [] }){
  const skip = new Set([...FACE, ...keep.map(norm)]);
  const gradientIds = [...new Set([...art.matchAll(/url\(#([\w-]+)\)/g)].map(m => m[1]))].filter(g => findGradient(defs, g));

  // colores del dibujo y de los degradados que usa
  const found = new Set();
  const scan = text => { for(const m of text.matchAll(COLOR_RE)) found.add(norm(m[2])); };
  scan(art);
  gradientIds.forEach(g => scan(findGradient(defs, g)));

  const movable = [...found].filter(c => !skip.has(c) && !isNeutral(c));
  if(!movable.length) return art;

  const ys = movable.map(c => brightness(hexToRgb(c)));
  const y0 = Math.min(...ys), y1 = Math.max(...ys), ramp = rampOf(body);
  const target = new Map(movable.map(c => {
    const t = y1 === y0 ? 0.5 : (brightness(hexToRgb(c)) - y0) / (y1 - y0);
    return [c, rgbToHex(rampAt(ramp, Math.pow(t, 0.9)))];
  }));

  const paint = text => text.replace(COLOR_RE, (all, prefix, hex) => target.has(norm(hex)) ? prefix + target.get(norm(hex)) : all);

  let out = paint(art), copies = '';
  for(const g of gradientIds){
    copies += paint(findGradient(defs, g)).replace(`id="${g}"`, `id="${g}-${id}"`);
    out = out.replaceAll(`url(#${g})`, `url(#${g}-${id})`);
  }
  return `<defs>${copies}</defs>${out}`;
}
