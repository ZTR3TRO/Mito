// Variantes de arte por objeto, solo para revisión (no están en el catálogo hasta que se elija una).
// Nada de esto está en el catálogo: se pinta empalmando cada variante en el SVG real de Mito en su capa
// (back = detrás del cuerpo, front = delante de la cara y detrás de las antenas, ver docs/mito-items-style.md).
//   /dev/items.html?variants&item=<k>   (opcional: &theme=light|dark  &still)
import { previewAvatar } from '../src/features/mascot/avatar.js';
import { WARDROBE } from '../src/content/wardrobe.js';

const mirror = s => `<g transform="translate(150 0) scale(-1 1)">${s}</g>`;
const o = (d, w, c) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const note = (x, y, c, dl) => `<g transform="translate(${x} ${y})"><g class="vx-note" style="--dl:${dl}s"><ellipse cx="0" cy="0" rx="3.6" ry="2.6" transform="rotate(-22)" fill="${c}" stroke="#fff" stroke-width=".8"/><path d="M3 -1.4V-12Q7 -10 8 -6" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></g></g>`;
const star = (x, y, s, dl) => `<path class="vx-twk" style="--dl:${dl}s" d="M${x} ${y - s}L${x + s * .28} ${y - s * .28}L${x + s} ${y}L${x + s * .28} ${y + s * .28}L${x} ${y + s}L${x - s * .28} ${y + s * .28}L${x - s} ${y}L${x - s * .28} ${y - s * .28}Z" fill="#fff" stroke="#b393ee" stroke-width=".8"/>`;

/* ---------- degradados propios de las variantes ---------- */
const DEFS = ``;
const CSS = ``;

// Cada entrada: { k, name, itemId, catId, A: {back, front}, B: {back, front} }. Vacío entre lotes.
const VARIANTS = [];
const NONE = { color: 'c-mint', ropa: 'r-none', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-none', pet: 'p-none' };
const MARK = '<g class="ant ant-l"';
let n = 0;

function paint(cellId, v, which, skinId){
  previewAvatar('accesorio', which === 'cur' ? v.itemId : 'ac-none', cellId, { ...NONE, color: skinId });
  if(which === 'cur') return;
  const svg = document.querySelector(`#${cellId} svg.mito`);
  const part = v[which];
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
    let html = `<h1>Lote A · variantes · modo ${theme === 'dark' ? 'oscuro' : 'claro'}</h1>`;
    for(const v of list){
      html += `<h2>${v.name}</h2><div class="bigrow">${['cur', 'A', 'B', 'C'].map(w => `<div>${cell(v, w, 'c-mint', true)}<div class="lbl">${w === 'cur' ? 'Actual' : ({A:'A "Bandolera"',B:'B "Peluche"',C:'C "Jetpack"'}[w])}</div></div>`).join('')}</div>`;
      html += `<table><tr><th></th>${skins.map(s => `<th>${s.name}</th>`).join('')}</tr>${['cur', 'A', 'B', 'C'].map(w => `<tr><th class="row">${w === 'cur' ? 'Actual' : ({A:'A "Bandolera"',B:'B "Peluche"',C:'C "Jetpack"'}[w])}</th>${skins.map(s => `<td>${cell(v, w, s.id, false)}</td>`).join('')}</tr>`).join('')}</table>`;
    }
    panel.innerHTML = html;
    root.appendChild(panel);
  }
  for(const [id, v, w, s] of jobs) paint(id, v, w, s);
}
