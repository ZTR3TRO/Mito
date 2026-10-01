// Pieles animadas de Mito.
// Cada piel = colores base (en wardrobe.js) + una capa de efectos SVG recortada a la forma del cuerpo.
// Las animaciones viven en style.css (clases .fx-*), aquí solo se dibuja.
//
// Para agregar una piel nueva:
//   1) añade su entrada en SKINS (defs / over)
//   2) añade el ítem en wardrobe.js con `fx:'clave'` y sus colores base
//   3) añade su swatch animado en style.css (.swatch.sw-clave)

const BODY = 'M75 18c-30 0-52 24-52 54 0 32 24 54 52 54s52-22 52-54c0-30-22-54-52-54Z';
const TOKEN = '@@'; // se reemplaza por el id único de cada mascota (evita choques de ids entre SVGs)

/* ---------- helpers de dibujo ---------- */
const blob = (name, color) =>
  `<radialGradient id="fxb-${name}-${TOKEN}"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

const shine = (name = 's') =>
  `<linearGradient id="fxs-${name}-${TOKEN}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

const sweep = (w, dur, opacity = 0.55, name = 's') =>
  `<g class="fx-sweep" style="--d:${dur}s"><rect x="-40" y="-10" width="${w}" height="170" fill="url(#fxs-${name}-${TOKEN})" opacity="${opacity}" transform="skewX(-18)"/></g>`;

const dot = (x, y, r, c, dl, d = 2.6) =>
  `<circle class="fx-twk" cx="${x}" cy="${y}" r="${r}" fill="${c}" style="--dl:${dl}s;--d:${d}s"/>`;

const spark = (x, y, s, c, dl) =>
  `<path class="fx-twk" d="M${x} ${y - s}L${x + s * 0.28} ${y - s * 0.28}L${x + s} ${y}L${x + s * 0.28} ${y + s * 0.28}L${x} ${y + s}L${x - s * 0.28} ${y + s * 0.28}L${x - s} ${y}L${x - s * 0.28} ${y - s * 0.28}Z" fill="${c}" style="--dl:${dl}s;--d:3s"/>`;

const orbit = (dur, inner) => `<g class="fx-spin" style="--d:${dur}s">${inner}</g>`;

/* ---------- catálogo de pieles ---------- */
const SKINS = {
  // Materia oscura: negro-violeta con nebulosa que gira, estrellas y un destello que cruza
  dark: {
    defs: blob('a', '#8b5cf6') + blob('b', '#e879f9') + blob('c', '#38bdf8') + shine(),
    over:
      orbit(18,
        `<circle cx="52" cy="56" r="44" fill="url(#fxb-a-${TOKEN})" opacity=".8"/>` +
        `<circle cx="102" cy="94" r="42" fill="url(#fxb-b-${TOKEN})" opacity=".6"/>` +
        `<circle cx="78" cy="78" r="30" fill="url(#fxb-c-${TOKEN})" opacity=".45"/>`) +
      dot(46, 50, 1.3, '#fff', 0) + dot(92, 44, 1, '#ffe9a8', 0.7) + dot(104, 70, 1.5, '#fff', 1.4) +
      dot(60, 86, 1, '#cfe8ff', 0.3) + dot(84, 108, 1.3, '#fff', 1.9) + dot(38, 78, 0.9, '#ffe9a8', 1.1) +
      dot(70, 62, 0.9, '#fff', 2.2) + dot(112, 96, 1, '#cfe8ff', 0.5) +
      sweep(26, 5.5, 0.5),
  },

  // Oro líquido: dorado con un brillo metálico que barre el cuerpo y destellos
  gold: {
    defs: blob('a', '#fff2a8') + shine(),
    over:
      `<circle cx="56" cy="50" r="40" fill="url(#fxb-a-${TOKEN})" opacity=".55"/>` +
      sweep(34, 3.8, 0.8) +
      spark(48, 46, 5, '#fff', 0) + spark(100, 84, 4, '#fff8d0', 1.2) + spark(70, 106, 3.4, '#fff', 2.2),
  },

  // Aurora: bandas de color que fluyen de lado a lado
  aurora: {
    defs:
      `<linearGradient id="fxf-${TOKEN}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="150" y2="0" spreadMethod="repeat">` +
      `<stop offset="0" stop-color="#5bffd0"/><stop offset=".33" stop-color="#4cc9f0"/>` +
      `<stop offset=".66" stop-color="#b388ff"/><stop offset="1" stop-color="#5bffd0"/></linearGradient>` +
      blob('a', '#ffffff') + shine(),
    over:
      `<g class="fx-flow"><rect x="0" y="0" width="300" height="150" fill="url(#fxf-${TOKEN})" opacity=".62"/></g>` +
      `<circle cx="54" cy="48" r="36" fill="url(#fxb-a-${TOKEN})" opacity=".35"/>` +
      sweep(22, 6.5, 0.35),
  },

  // Lava: costra de roca oscura agrietada; las grietas brillan y laten, se desvanecen hacia el centro
  // (máscara) para que la cara quede limpia, y el magma asoma por el borde de abajo
  lava: {
    defs:
      blob('a', '#ff8a00') + blob('b', '#ffd27a') + blob('c', '#ff4d00') +
      `<radialGradient id="fxmg-${TOKEN}" gradientUnits="userSpaceOnUse" cx="75" cy="84" r="56"><stop offset=".42" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>` +
      `<mask id="fxm-${TOKEN}"><rect x="0" y="0" width="150" height="150" fill="url(#fxmg-${TOKEN})"/></mask>`,
    over:
      // magma que asoma abajo
      `<ellipse class="fx-pulse" cx="75" cy="128" rx="58" ry="26" fill="url(#fxb-c-${TOKEN})" style="--dl:0s"/>` +
      `<g mask="url(#fxm-${TOKEN})">` +
        // burbujas de magma que suben por los costados
        `<circle class="fx-rise" cx="30" cy="96" r="15" fill="url(#fxb-a-${TOKEN})" style="--dl:0s"/>` +
        `<circle class="fx-rise" cx="122" cy="92" r="15" fill="url(#fxb-c-${TOKEN})" style="--dl:1.7s"/>` +
        `<circle class="fx-rise" cx="52" cy="118" r="14" fill="url(#fxb-b-${TOKEN})" style="--dl:3.2s"/>` +
        // red de grietas
        [
          'M26 70L36 62L40 48L52 38L60 24',
          'M124 70L114 60L112 46L100 36L92 22',
          'M28 86L40 94L44 108L58 116L64 126',
          'M122 88L110 96L106 110L92 118L86 126',
          'M52 38L68 33L82 37L100 36',
          'M36 62L48 60L52 50',
          'M114 60L102 58L100 47',
          'M40 48L28 44',
          'M112 46L124 42',
          'M44 108L32 112',
          'M106 110L119 115',
          'M48 60L44 76L38 82',
          'M102 58L106 74L112 82',
        ].map((d, i) =>
          `<g class="fx-pulse" style="--dl:${(i % 5) * 0.5}s">` +
          `<path d="${d}" fill="none" stroke="#ff5a00" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>` +
          `<path d="${d}" fill="none" stroke="#ffd27a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
        ).join('') +
      `</g>` +
      `<circle class="fx-ember" cx="58" cy="116" r="1.5" fill="#ffb347" style="--dl:0s"/>` +
      `<circle class="fx-ember" cx="92" cy="118" r="1.3" fill="#ffd27a" style="--dl:1.2s"/>` +
      `<circle class="fx-ember" cx="76" cy="120" r="1.4" fill="#ff8a00" style="--dl:2.1s"/>`,
  },

  // Prisma: nácar con reflejos de arcoíris que giran
  prism: {
    defs: blob('p', '#ff7ad9') + blob('c', '#5ce1ff') + blob('y', '#ffe66d') + blob('l', '#b8a0ff') + shine(),
    over:
      orbit(9,
        `<circle cx="42" cy="66" r="38" fill="url(#fxb-p-${TOKEN})" opacity=".7"/>` +
        `<circle cx="108" cy="66" r="38" fill="url(#fxb-c-${TOKEN})" opacity=".7"/>` +
        `<circle cx="75" cy="30" r="34" fill="url(#fxb-y-${TOKEN})" opacity=".6"/>` +
        `<circle cx="75" cy="112" r="34" fill="url(#fxb-l-${TOKEN})" opacity=".65"/>`) +
      sweep(24, 4.6, 0.7),
  },
};

/* ---------- API ---------- */
// Devuelve las piezas que necesita mascotMarkup:
//   defs = gradientes y recorte · over = efectos encima del cuerpo
// Las pieles no llevan halo ni estela: eso lo dan las auras.
export function skinParts(fx, id){
  const s = SKINS[fx];
  if(!s) return { defs:'', over:'' };
  const fill = str => str.split(TOKEN).join(id);
  return {
    defs: fill(`<clipPath id="fxc-${TOKEN}"><path d="${BODY}"/></clipPath>` + s.defs),
    over: fill(`<g class="skinfx" clip-path="url(#fxc-${TOKEN})">${s.over}</g>`),
  };
}