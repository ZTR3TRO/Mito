// Variantes de arte por objeto, solo para revisión (no están en el catálogo hasta que se elija una).
// Nada de esto está en el catálogo: se pinta empalmando cada variante en el SVG real de Mito en su capa
// (back = detrás del cuerpo, front = delante de la cara y detrás de las antenas, ver docs/mito-items-style.md).
//   /dev/items.html?variants&item=<k>   (opcional: &theme=light|dark  &still)
import { previewAvatar } from '../src/features/mascot/avatar.js';
import { WARDROBE } from '../src/content/wardrobe.js';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, mixRgb } from '../src/core/color.js';

const mirror = s => `<g transform="translate(150 0) scale(-1 1)">${s}</g>`;
const o = (d, w, c) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---------- degradados, patrones y recortes propios de las variantes ---------- */
// El contorno de cada objeto sale de su propio color: el tono medio del relleno, ~17 % más oscuro (como el de Mito).
const darker = hex => { const [h, s, l] = rgbToHsl(hexToRgb(hex)); return rgbToHex(hslToRgb([h, Math.min(1, s * .95), Math.max(.1, l - .15)])); };
const defs = [];
const G = (id, a, b, dir = 'x1="0" y1="0" x2="0" y2="1"') => {
  defs.push(`<linearGradient id="${id}" ${dir}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`);
  return { u: `url(#${id})`, line: darker(rgbToHex(mixRgb(hexToRgb(a), hexToRgb(b), .5))) };
};
const CLIP = (id, d) => { defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return `url(#${id})`; };
const PAT = (id, w, h, inner) => { defs.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${inner}</pattern>`); return `url(#${id})`; };

const CSS = ``; // animaciones propias de las variantes del lote en curso (al integrar pasan a style.css)

// helpers: contorno 2.4 por lado
const fillp = (d, fill, line, sw = 2.4) => `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const thick = (d, w, fill, line, ow = 2.4) => o(d, w + 2 * ow, line) + o(d, w, fill);
const dash = (d, w, c, da, op = 1, off = 0) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="${da}" stroke-dashoffset="${off}" opacity="${op}"/>`;
const shift = (inner, dy) => `<g transform="translate(0 ${dy})">${inner}</g>`;
const hi = (d, w = 2, op = .5) => o(d, w, '#fff').replace('<path', `<path opacity="${op}"`);
const shade = (d, op = .14) => `<path d="${d}" fill="none" stroke="#000" stroke-width="5" opacity="${op}" stroke-linecap="round" transform="translate(0 2)"/>`;
const sideShade = d => `<path d="${d}" fill="url(#gSideDk)"/>`;
const star = (s = 1) => `M0 ${-7 * s}L${2.1 * s} ${-2.2 * s}L${7.2 * s} ${-2.2 * s}L${3.1 * s} ${s}L${4.6 * s} ${6 * s}L0 ${3 * s}L${-4.6 * s} ${6 * s}L${-3.1 * s} ${s}L${-7.2 * s} ${-2.2 * s}L${-2.1 * s} ${-2.2 * s}Z`;
const bow = (x, y, fill, line, k = .8) => `<g transform="translate(${x} ${y}) scale(${k})">${fillp('M0 0Q14 -12 22 -4Q18 8 0 0Z', fill, line, 2.2)}${fillp('M0 0Q-12 -12 -20 -4Q-16 8 0 0Z', fill, line, 2.2)}${fillp('M0 1Q4 12 -2 19L4 18Q8 10 6 1Z', fill, line, 2)}${fillp('M0 1Q12 10 14 19L8 18Q6 10 -2 1Z', fill, line, 2)}<circle r="3.4" fill="${fill}" stroke="${line}" stroke-width="2"/></g>`;

// Cada entrada: { k, name, catId, itemId, vs: [{ label, back, front }] }. `back` va detrás del cuerpo; `front`, delante de la cara y detrás de las antenas.
// Vacío entre lotes: aquí se dibujan las variantes del siguiente lote (ver docs/mito-items-style.md) y se borran al integrar la elegida.
const VARIANTS = [];
const DEFS = defs.join('\n');
const NONE = { color: 'c-mint', ropa: 'r-none', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-none', pet: 'p-none' };
const NOITEM = { ropa: 'r-none', accesorio: 'ac-none', sombrero: 's-none' };
const MARK = '<g class="ant ant-l"';
let n = 0;

function paint(cellId, v, which, skinId){
  previewAvatar(v.catId, which === 'cur' ? v.itemId : which === 'ref' ? 'r-armadura' : NOITEM[v.catId], cellId, { ...NONE, color: skinId });
  if(which === 'cur' || which === 'ref') return;
  const svg = document.querySelector(`#${cellId} svg.mito`);
  const part = v.vs[which];
  let html = svg.innerHTML;
  html = html.replace('<g class="rig">', `<g class="rig">${part.back}`);
  const i = html.indexOf(MARK);
  svg.innerHTML = html.slice(0, i) + part.front + html.slice(i);
}


export function renderVariants(root, q){
  document.head.insertAdjacentHTML('beforeend', `<style>${CSS}.big .mascot{width:230px;height:230px}.lbl{font-size:12px;font-weight:700;text-align:center;opacity:.7}.bigrow{display:flex;gap:18px;flex-wrap:wrap;margin:6px 0 14px}</style>`);
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${DEFS}</defs></svg>`);
  const skins = WARDROBE.find(c => c.id === 'color').items;
  const list = VARIANTS.filter(v => !q.get('item') || q.get('item') === v.k);
  const themes = q.get('theme') ? [q.get('theme')] : ['light', 'dark'];
  const jobs = [];
  const cell = (v, which, skinId, big) => { const id = `vc-${++n}`; jobs.push([id, v, which, skinId]); return `<div class="${big ? 'big' : ''}"><div class="mascot face-normal" id="${id}"><svg class="mito" viewBox="0 0 150 150"></svg></div></div>`; };
  for(const theme of themes){
    const panel = document.createElement('section');
    panel.className = 'panel' + (q.has('still') ? ' still' : '');
    panel.dataset.theme = theme;
    let html = `<h1>Variantes · modo ${theme === 'dark' ? 'oscuro' : 'claro'}</h1>`;
    for(const v of list){
      const whiches = ['cur', 'ref', ...v.vs.keys()];
      const label = w => w === 'cur' ? 'Actual' : w === 'ref' ? 'Ref: Armadura A' : v.vs[w].label;
      html += `<h2>${v.name}</h2><div class="bigrow">${whiches.map(w => `<div>${cell(v, w, 'c-mint', true)}<div class="lbl">${label(w)}</div></div>`).join('')}</div>`;
      html += `<table><tr><th></th>${skins.map(s => `<th>${s.name}</th>`).join('')}</tr>${whiches.map(w => `<tr><th class="row">${label(w)}</th>${skins.map(s => `<td>${cell(v, w, s.id, false)}</td>`).join('')}</tr>`).join('')}</table>`;
    }
    panel.innerHTML = html;
    root.appendChild(panel);
  }
  for(const [id, v, w, s] of jobs) paint(id, v, w, s);
}
