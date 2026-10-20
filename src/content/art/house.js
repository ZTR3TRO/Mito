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
