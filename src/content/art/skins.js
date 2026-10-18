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

/* ---------- Lava: lava fundida con placas de roca enfriada ---------- */
// Placa de roca enfriada: contorno rugoso y asimétrico (determinista), no un polígono regular
const roughBlob = (cx, cy, rx, ry, rot, seed) => {
  let q = seed; const rnd = () => (q = (q * 9301 + 49297) % 233280) / 233280;
  const n = 24, c = Math.cos(rot), sn = Math.sin(rot), pts = [];
  for(let i = 0; i < n; i++){
    const a = i / n * Math.PI * 2, k = (.8 + rnd() * .4) * (1 + .16 * Math.sin(3 * a + seed));
    const x = rx * k * Math.cos(a), y = ry * k * Math.sin(a);
    pts.push(`${(cx + x * c - y * sn).toFixed(1)} ${(cy + x * sn + y * c).toFixed(1)}`);
  }
  return 'M' + pts.join('L') + 'Z';
};
// Burbujas (suben y revientan de vez en cuando) y brasas ocasionales
const bubbles = pts => pts.map(([x, y, r], i) =>
  `<g class="fx-bub" style="--dl:${[0, 2.6, 4.8][i % 3]}s"><circle cx="${x}" cy="${y}" r="${r}" fill="#ffb347" fill-opacity=".7" stroke="#ffe27a" stroke-width=".9"/><circle cx="${x - r * .35}" cy="${y - r * .35}" r="${r * .28}" fill="#fff3c0" opacity=".9"/></g>`).join('');
const embersL = pts => pts.map(([x, y, r], i) => `<circle class="fx-ember2" style="--dl:${[0.8, 3.1, 5.2][i % 3]}s" cx="${x}" cy="${y}" r="${r}" fill="#ffb347"/>`).join('');

// cfg: stops del degradado de lava, luz del núcleo, viñeta roja y bandas de flujo (sin contornos: todo es color).
// Colores base de la piel en wardrobe.js (c-lava); el resplandor naranja exterior está en style.css ([data-fx="lava"]).
const lavaSkin = cfg => ({
  defs:
    `<linearGradient id="fxl-${TOKEN}" gradientUnits="userSpaceOnUse" x1="0" y1="18" x2="0" y2="126">${cfg.stops.map((c, i) => `<stop offset="${[0, .35, .7, 1][i]}" stop-color="${c}"/>`).join('')}</linearGradient>` +
    `<radialGradient id="fxcore-${TOKEN}" gradientUnits="userSpaceOnUse" cx="72" cy="66" r="58"><stop offset="0" stop-color="${cfg.core}" stop-opacity="${cfg.coreOp}"/><stop offset="1" stop-color="${cfg.core}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="fxvg-${TOKEN}" gradientUnits="userSpaceOnUse" cx="75" cy="62" r="84"><stop offset=".5" stop-color="${cfg.deep}" stop-opacity="0"/><stop offset="1" stop-color="${cfg.deep}" stop-opacity="${cfg.deepOp}"/></radialGradient>` +
    `<radialGradient id="fxbl-${TOKEN}"><stop offset="0" stop-color="#fff0a0" stop-opacity="${cfg.lightOp}"/><stop offset="1" stop-color="#fff0a0" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="fxbd-${TOKEN}"><stop offset="0" stop-color="${cfg.deep}" stop-opacity="${cfg.darkOp}"/><stop offset="1" stop-color="${cfg.deep}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="fxp-${TOKEN}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c3a3c"/><stop offset="1" stop-color="#241a1c"/></linearGradient>` +
    `<linearGradient id="fxsink-${TOKEN}" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#ff7a1a" stop-opacity="0"/><stop offset="1" stop-color="#ff7a1a" stop-opacity=".9"/></linearGradient>`,
  over:
    `<rect x="0" y="0" width="150" height="150" fill="url(#fxl-${TOKEN})"/>` +
    `<rect x="0" y="0" width="150" height="150" fill="url(#fxcore-${TOKEN})"/>` +
    // bandas suaves de color más claro y más oscuro que giran despacio en sentidos opuestos (el "flujo" vive en el degradado)
    `<g class="fx-spin" style="--d:28s"><ellipse cx="75" cy="36" rx="50" ry="12" transform="rotate(-16 75 36)" fill="url(#fxbl-${TOKEN})"/><ellipse cx="80" cy="110" rx="46" ry="11" transform="rotate(10 80 110)" fill="url(#fxbl-${TOKEN})"/><ellipse cx="30" cy="78" rx="22" ry="10" transform="rotate(70 30 78)" fill="url(#fxbl-${TOKEN})"/></g>` +
    `<g class="fx-spin" style="--d:38s;animation-direction:reverse"><ellipse cx="78" cy="54" rx="52" ry="12" transform="rotate(14 78 54)" fill="url(#fxbd-${TOKEN})"/><ellipse cx="70" cy="122" rx="48" ry="12" transform="rotate(-8 70 122)" fill="url(#fxbd-${TOKEN})"/><ellipse cx="122" cy="82" rx="22" ry="10" transform="rotate(80 122 82)" fill="url(#fxbd-${TOKEN})"/></g>` +
    `<rect x="0" y="0" width="150" height="150" fill="url(#fxvg-${TOKEN})"/>` +
    // 3 placas de roca enfriada, medio hundidas: borde que brilla en naranja y lava subiendo por abajo
    [[40, 46, 18, 11, -.35, 3], [108, 42, 14, 9, .45, 7], [93, 119, 11, 6.5, -.2, 11]].map(([cx, cy, rx, ry, rot, seed], i) => {
      const d = roughBlob(cx, cy, rx, ry, rot, seed);
      return `<g class="fx-plate" style="--dl:${i * 2.1}s;--dx:${i % 2 ? -1 : 1}px;--dy:${i % 2 ? .8 : -.8}px">` +
        `<path class="fx-lpulse" style="--dl:${i * 1.3}s" d="${d}" fill="none" stroke="#ff8a1a" stroke-width="5" stroke-linejoin="round" opacity=".7"/>` +
        `<path d="${d}" fill="url(#fxp-${TOKEN})" stroke="#ff9a2a" stroke-width="1.4" stroke-linejoin="round"/>` +
        `<path d="${d}" fill="url(#fxsink-${TOKEN})"/></g>`;
    }).join('') +
    bubbles([[38, 108, 3], [64, 121, 2.6], [112, 98, 2.8]]) +
    embersL([[50, 114, 1.3], [100, 112, 1.3], [78, 122, 1.2]]),
});

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

  // Lava: cuerpo de lava fundida (degradado con núcleo caliente y bordes rojos), bandas de flujo que giran despacio,
  // 3 placas de roca enfriada medio hundidas, burbujas que revientan y brasas ocasionales
  lava: lavaSkin({ stops: ['#ffd03a', '#ff9a1f', '#f0541a', '#c41c0e'], core: '#fff0a0', coreOp: .5, deep: '#9a1208', deepOp: .42, lightOp: .45, darkOp: .32 }),

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