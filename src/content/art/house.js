// Piezas de dibujo de la Casa (datos puros: SVG en el viewBox 150 × 150 de Mito).
//
// Párpados: no son un color plano. Son una copia del cuerpo de Mito (su relleno, la capa de efectos de su piel,
// sus brillos y mejillas: el grupo #mb-<id> que arma avatar.js) recortada con la forma del párpado, así se funden
// con el degradado de cualquier piel. Van dentro del SVG de Mito, después de la cara y antes de la ropa: las
// gafas siempre quedan delante. Están ocultos por defecto; solo los muestra la Casa (style.css).

const EYES = { l: 58, r: 94 };
const HALF = x => `M${x - 10} 69Q${x} 64 ${x + 10} 69L${x + 10} 82Q${x} 85.5 ${x - 10} 82Z`;
const CLOSED = x => `M${x - 10.5} 70Q${x} 64 ${x + 10.5} 70L${x + 10.5} 94Q${x} 98 ${x - 10.5} 94Z`;
const HALF_LINE = x => `M${x - 9} 82Q${x} 85.6 ${x + 9} 82`;
const CLOSED_LINE = x => `M${x - 8} 84Q${x} 91 ${x + 8} 84`;
const line = (d, w) => `<path d="${d}" fill="none" stroke="#2b2140" stroke-width="${w}" stroke-linecap="round"/>`;

export function lidsMarkup(id){
  let defs = '', body = '';
  for(const [side, x] of Object.entries(EYES)){
    defs += `<clipPath id="lh${side}-${id}"><path d="${HALF(x)}"/></clipPath><clipPath id="lc${side}-${id}"><path d="${CLOSED(x)}"/></clipPath>`;
    body += `<g class="lid lid-${side} lid-half"><use href="#mb-${id}" clip-path="url(#lh${side}-${id})"/>${line(HALF_LINE(x), 2.6)}</g>`;
    body += `<g class="lid lid-${side} lid-closed"><use href="#mb-${id}" clip-path="url(#lc${side}-${id})"/>${line(CLOSED_LINE(x), 3)}</g>`;
  }
  return { defs, body };
}

// Polvito de cuando está sucio: manchitas suaves y unas motas que flotan. Su opacidad la da --dirt (0 a 1).
export const DIRT = `<svg class="mito-dirt" viewBox="0 0 150 150" aria-hidden="true"><g fill="#8b6b55">
  <ellipse cx="104" cy="99" rx="8" ry="4.5" opacity=".26"/><ellipse cx="44" cy="100" rx="5" ry="3" opacity=".18"/>
  <circle cx="41" cy="58" r="3.4" opacity=".4"/><circle cx="46" cy="64" r="1.6" opacity=".28"/>
  <circle cx="112" cy="66" r="2.6" opacity=".38"/><circle cx="54" cy="112" r="2.8" opacity=".34"/>
  <circle cx="98" cy="116" r="1.8" opacity=".3"/><circle cx="83" cy="36" r="1.6" opacity=".25"/></g>
  <g class="dust" fill="#b89a82"><circle cx="30" cy="96" r="1.3"/><circle cx="122" cy="88" r="1.1"/><circle cx="118" cy="42" r=".9"/></g></svg>`;

// Esponja del baño (se arrastra sobre Mito).
export const SPONGE = `<svg viewBox="0 0 64 48" aria-hidden="true">
  <rect x="4" y="8" width="56" height="34" rx="12" fill="#ffd23c" stroke="#e0a516" stroke-width="2.4"/>
  <rect x="4" y="8" width="56" height="12" rx="6" fill="#ff8fc0" stroke="#e8619c" stroke-width="2"/>
  <g fill="#e0a516" opacity=".55"><circle cx="16" cy="28" r="2.4"/><circle cx="30" cy="33" r="1.8"/><circle cx="44" cy="27" r="2.6"/><circle cx="52" cy="35" r="1.6"/><circle cx="24" cy="37" r="1.4"/></g>
  <ellipse cx="18" cy="12" rx="8" ry="2.2" fill="#fff" opacity=".55"/></svg>`;

// Espuma del baño: manchones que se quedan pegados al cuerpo de Mito donde pasa la esponja y crecen al frotar.
// Una cuadrícula de celdas dentro del cuerpo (círculo de centro 75, 72 y radio 52), sin la zona de la cara (ojos y
// boca), para que su cara siempre se vea. Cada celda es un racimo de burbujas; bath.js le da su tamaño (0 a 1).
const FACE = { x0: 44, x1: 106, y0: 66, y1: 108 };
export const FOAM_CELLS = [];
for(let y = 24; y <= 124; y += 11) for(let x = 28; x <= 122; x += 12){
  const cx = x + ((y / 11) % 2 ? 6 : 0);
  const inBody = Math.hypot(cx - 75, y - 72) <= 48;
  const inFace = cx > FACE.x0 && cx < FACE.x1 && y > FACE.y0 && y < FACE.y1;
  if(inBody && !inFace) FOAM_CELLS.push({ x: cx, y });
}
const cluster = (x, y, i) => {
  const k = (i * 37) % 7;   // cada racimo distinto, pero siempre igual
  return `<g class="fc" style="transform-origin:${x}px ${y}px">
    <circle cx="${x}" cy="${y}" r="${6.5 + k * .3}"/><circle cx="${x - 5 - k % 3}" cy="${y + 3}" r="${4.4 + k % 2}"/>
    <circle cx="${x + 5}" cy="${y + 2 - k % 2}" r="${4.8 - k % 3 * .4}"/><circle cx="${x + 1}" cy="${y - 5}" r="${3.6 + k % 2 * .6}"/>
    <circle class="fh" cx="${x - 2}" cy="${y - 2.5}" r="1.6"/></g>`;
};
export const FOAM = `<svg class="mito-foam" viewBox="0 0 150 150" aria-hidden="true">${FOAM_CELLS.map((c, i) => cluster(c.x, c.y, i)).join('')}</svg>`;
