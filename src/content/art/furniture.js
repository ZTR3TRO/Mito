// Dibujos de los muebles de la Casa (datos puros: SVG, cada uno en el viewBox de `box` en content/furniture.js).
// Mismo lenguaje que Mito y la ropa (docs/mito-items-style.md): relleno en degradado de 2 tonos (claro arriba a la
// izquierda → oscuro abajo a la derecha), un brillo blanco, contorno de 2.4 en un tono más oscuro DEL PROPIO COLOR
// (nunca casi negro) y sombra de contacto suave en el piso. Los degradados están en FURNITURE_DEFS: se monta UNA
// vez en la página (un <svg> sin tamaño) y todos los dibujos lo usan por id (gf-…).

const PAL = {   // nombre: [claro, oscuro]
  lilac: ['#d9c4ff', '#a98bf0'], pink: ['#ffb3d4', '#ff7fb6'], rose: ['#ffd1e3', '#ffa6c9'], mint: ['#9af2cf', '#4fd1a0'],
  sky: ['#a6e0ff', '#62b5f0'], sun: ['#ffe98a', '#ffc93c'], wood: ['#f0cfa6', '#cf9d6c'], woodD: ['#d9aa78', '#b07c4c'],
  white: ['#ffffff', '#f1e6f5'], leaf: ['#7be8b0', '#33b87d'], pot: ['#ffbd8a', '#f08d52'], metal: ['#cdbcf0', '#9a82d6'],
  coral: ['#ff9a9a', '#ff6b7d'], navy: ['#8aa0f5', '#5b6ee8'], hill: ['#8fe3bb', '#4cc794'],
};
// degradados que no son de 2 tonos simples: el metal claro (refri, estufa), el vidrio (alacena, espejo) y la pantalla
const EXTRA = `<linearGradient id="gf-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dbe7f5"/></linearGradient> <linearGradient id="gf-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f8ff"/><stop offset=".55" stop-color="#bfe6fb"/><stop offset="1" stop-color="#d9ccff"/></linearGradient> <linearGradient id="gf-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f8ef0"/><stop offset="1" stop-color="#b98af6"/></linearGradient>`;
export const FURNITURE_DEFS = `<svg id="furnDefs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${
  Object.entries(PAL).map(([k, [a, b]]) =>
    `<linearGradient id="gf-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')
}${EXTRA}<radialGradient id="gf-glow"><stop offset="0" stop-color="#fff2b0" stop-opacity=".95"/><stop offset=".45" stop-color="#ffd86a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd86a" stop-opacity="0"/></radialGradient></defs></svg>`;

const F = k => `url(#gf-${k})`;
// trazo estándar: contorno de 2.4, esquinas redondas
const S = (c, w = 2.4) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const shadow = (cx, cy, rx, ry = 5) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".16"/>`;
const hi = (d, w = 3) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity=".55"/>`;
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${body}</svg>`;

export const FURNITURE_ART = {
  'm-rug': svg(160, 66, `
    <ellipse cx="80" cy="35" rx="76" ry="28" fill="#000" opacity=".1"/>
    <ellipse cx="80" cy="32" rx="76" ry="28" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <ellipse cx="80" cy="32" rx="58" ry="20" fill="${F('rose')}" ${S('#e8619c').replace('2.4', '1.8')}/>
    <g fill="#fff" opacity=".85"><circle cx="46" cy="30" r="3.2"/><circle cx="62" cy="38" r="3.2"/><circle cx="80" cy="24" r="3.2"/><circle cx="80" cy="41" r="3.2"/><circle cx="98" cy="38" r="3.2"/><circle cx="114" cy="30" r="3.2"/><circle cx="64" cy="25" r="2.4"/><circle cx="96" cy="25" r="2.4"/></g>
    ${hi('M20 24Q40 10 70 8', 3.4)}`),

  'm-cushion': svg(92, 68, `
    ${shadow(46, 62, 38, 5)}
    <path d="M10 18Q46 4 82 18Q90 36 82 52Q46 64 10 52Q2 36 10 18Z" fill="${F('pink')}" ${S('#d6478a')}/>
    <path d="M46 14V56M26 18Q30 36 26 54M66 18Q62 36 66 54" fill="none" stroke="#d6478a" stroke-width="1.4" opacity=".4" stroke-linecap="round"/>
    <circle cx="46" cy="35" r="5.5" fill="#fff3b0" stroke="#e0a516" stroke-width="2"/>
    ${hi('M16 24Q30 14 50 12')}`),

  'm-plant': svg(80, 134, `
    ${shadow(40, 128, 28, 5)}
    <path d="M40 78Q22 60 24 26Q36 36 40 78Z" fill="${F('leaf')}" ${S('#1f8f5c')}/>
    <path d="M40 78Q58 56 56 20Q44 32 40 78Z" fill="${F('leaf')}" ${S('#1f8f5c')}/>
    <path d="M40 80Q12 76 8 46Q30 48 40 80Z" fill="${F('leaf')}" ${S('#1f8f5c')}/>
    <path d="M40 80Q68 74 72 42Q50 46 40 80Z" fill="${F('leaf')}" ${S('#1f8f5c')}/>
    <path d="M40 78Q38 54 40 10Q48 36 40 78Z" fill="${F('leaf')}" ${S('#1f8f5c')}/>
    <path d="M40 76V26" stroke="#1f8f5c" stroke-width="1.4" opacity=".5" fill="none"/>
    <path d="M14 88H66L60 124Q59 128 54 128H26Q21 128 20 124Z" fill="${F('pot')}" ${S('#c9662c')}/>
    <rect x="11" y="80" width="58" height="14" rx="6" fill="${F('pot')}" ${S('#c9662c')}/>
    ${hi('M18 100L22 118', 3.4)}${hi('M17 85H40', 3)}`),

  'm-lamp': svg(74, 176, `
    <ellipse class="fx-glow" cx="37" cy="40" rx="60" ry="50" fill="url(#gf-glow)"/>
    ${shadow(37, 170, 28, 5)}
    <path d="M14 150Q37 142 60 150Q60 166 37 168Q14 166 14 150Z" fill="${F('metal')}" ${S('#6f58b0')}/>
    <rect x="33" y="62" width="8" height="90" rx="4" fill="${F('metal')}" ${S('#6f58b0')}/>
    <path d="M22 14H52L66 64H8Z" fill="${F('sun')}" ${S('#d9a010')}/>
    <path d="M22 14H52L56 28H18Z" fill="#fff" opacity=".28"/>
    <ellipse cx="37" cy="64" rx="29" ry="5" fill="#d9a010" opacity=".35"/>
    ${hi('M20 26L14 54', 3.4)}`),

  'm-bookcase': svg(104, 176, `
    ${shadow(52, 170, 44, 5)}
    <rect x="6" y="6" width="92" height="162" rx="8" fill="${F('wood')}" ${S('#a3703f')}/>
    <rect x="14" y="14" width="76" height="146" rx="3" fill="#b07c4c" opacity=".55"/>
    <rect x="14" y="14" width="76" height="146" rx="3" fill="none" stroke="#a3703f" stroke-width="1.6"/>
    <g ${S('#a3703f').replace('2.4', '1.6')}><path d="M14 52H90M14 90H90M14 128H90" fill="none"/></g>
    <g stroke-width="1.6" stroke-linejoin="round">
      <rect x="18" y="26" width="10" height="26" rx="2" fill="${F('coral')}" stroke="#d6435a"/><rect x="29" y="30" width="9" height="22" rx="2" fill="${F('sky')}" stroke="#3a8ccc"/>
      <rect x="39" y="24" width="12" height="28" rx="2" fill="${F('sun')}" stroke="#d9a010"/><rect x="53" y="32" width="9" height="20" rx="2" fill="${F('mint')}" stroke="#2fa87c"/>
      <path d="M68 52l5-24 9 2-5 22z" fill="${F('lilac')}" stroke="#8f6fd6"/>
      <rect x="20" y="104" width="12" height="24" rx="2" fill="${F('navy')}" stroke="#3a4bc0"/><rect x="34" y="108" width="9" height="20" rx="2" fill="${F('pink')}" stroke="#d6478a"/>
      <rect x="46" y="100" width="11" height="28" rx="2" fill="${F('leaf')}" stroke="#1f8f5c"/>
      <rect x="20" y="64" width="46" height="26" rx="3" fill="${F('rose')}" stroke="#e8619c"/><circle cx="76" cy="78" r="9" fill="${F('sun')}" stroke="#d9a010"/>
    </g>
    <path d="M26 140H78L72 160H32Z" fill="${F('mint')}" ${S('#2fa87c').replace('2.4', '1.8')}/>
    ${hi('M11 18V150', 3)}`),

  'm-sofa': svg(156, 92, `
    ${shadow(78, 86, 68, 5)}
    <rect x="22" y="8" width="112" height="52" rx="22" fill="${F('sky')}" ${S('#3a8ccc')}/>
    <rect x="6" y="34" width="34" height="46" rx="16" fill="${F('sky')}" ${S('#3a8ccc')}/>
    <rect x="116" y="34" width="34" height="46" rx="16" fill="${F('sky')}" ${S('#3a8ccc')}/>
    <rect x="30" y="42" width="96" height="36" rx="14" fill="${F('sky')}" ${S('#3a8ccc')}/>
    <path d="M78 46V76" stroke="#3a8ccc" stroke-width="1.6" opacity=".45"/>
    <rect x="18" y="78" width="9" height="8" rx="3" fill="#b07c4c" stroke="#a3703f" stroke-width="1.6"/><rect x="129" y="78" width="9" height="8" rx="3" fill="#b07c4c" stroke="#a3703f" stroke-width="1.6"/>
    <path d="M54 26q0-7 8-7h6q8 0 8 7v8H54z" fill="${F('rose')}" stroke="#e8619c" stroke-width="1.8" stroke-linejoin="round"/>
    ${hi('M32 22Q40 14 58 12', 3.4)}${hi('M12 50V66', 3)}`),

  'm-desk': svg(176, 150, `
    ${shadow(88, 144, 80, 5)}
    <rect x="14" y="62" width="9" height="78" rx="3" fill="${F('woodD')}" ${S('#a3703f').replace('2.4', '1.8')}/>
    <rect x="102" y="62" width="9" height="78" rx="3" fill="${F('woodD')}" ${S('#a3703f').replace('2.4', '1.8')}/>
    <rect x="6" y="52" width="114" height="14" rx="6" fill="${F('wood')}" ${S('#a3703f')}/>
    <rect x="76" y="66" width="34" height="38" rx="5" fill="${F('wood')}" ${S('#a3703f').replace('2.4', '1.8')}/>
    <path d="M80 80H106M80 94H106" stroke="#a3703f" stroke-width="1.6" opacity=".6"/><circle cx="93" cy="73" r="2.4" fill="#ffc93c" stroke="#d9a010" stroke-width="1"/><circle cx="93" cy="87" r="2.4" fill="#ffc93c" stroke="#d9a010" stroke-width="1"/>
    <path d="M22 50L30 24H62L70 50Z" fill="${F('metal')}" ${S('#6f58b0')}/><rect x="28" y="28" width="38" height="20" rx="2" fill="${F('sky')}" opacity=".9"/>
    <path d="M32 44L48 30" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>
    <rect x="90" y="42" width="20" height="12" rx="2" fill="${F('coral')}" ${S('#d6435a').replace('2.4', '1.6')}/><rect x="92" y="34" width="16" height="9" rx="2" fill="${F('sun')}" ${S('#d9a010').replace('2.4', '1.6')}/>
    <rect x="128" y="64" width="8" height="48" rx="3" fill="${F('metal')}" ${S('#6f58b0').replace('2.4', '1.6')}/>
    <rect x="126" y="98" width="46" height="14" rx="7" fill="${F('pink')}" ${S('#d6478a')}/>
    <rect x="158" y="40" width="12" height="62" rx="6" fill="${F('pink')}" ${S('#d6478a')}/>
    <path d="M150 112V138M164 112V138" stroke="#6f58b0" stroke-width="5" stroke-linecap="round"/>
    <path d="M140 140H174" stroke="#6f58b0" stroke-width="4" stroke-linecap="round"/>
    ${hi('M12 57H100', 3)}${hi('M163 48V82', 2.6)}`),

  'm-bed': svg(196, 112, `
    ${shadow(98, 106, 90, 5)}
    <rect x="6" y="14" width="14" height="86" rx="6" fill="${F('woodD')}" ${S('#a3703f')}/>
    <rect x="176" y="40" width="14" height="60" rx="6" fill="${F('woodD')}" ${S('#a3703f')}/>
    <rect x="14" y="56" width="168" height="40" rx="10" fill="${F('wood')}" ${S('#a3703f')}/>
    <rect x="14" y="94" width="10" height="12" rx="3" fill="#b07c4c" stroke="#a3703f" stroke-width="1.6"/><rect x="172" y="94" width="10" height="12" rx="3" fill="#b07c4c" stroke="#a3703f" stroke-width="1.6"/>
    <rect x="18" y="38" width="160" height="30" rx="14" fill="${F('white')}" ${S('#d9b8d0')}/>
    <path d="M62 38Q70 30 190 38V68H62Z" fill="${F('mint')}" ${S('#2fa87c')}/>
    <path d="M70 44Q74 56 70 66M96 44Q100 56 96 66" stroke="#2fa87c" stroke-width="1.4" opacity=".4" fill="none" stroke-linecap="round"/>
    <rect x="22" y="22" width="40" height="22" rx="11" fill="${F('rose')}" ${S('#e8619c')}/>
    <path d="M28 30Q40 24 54 28" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>
    ${hi('M12 22V86', 3)}`),

  'm-picture': svg(96, 74, `
    <rect x="4" y="6" width="90" height="66" rx="6" fill="#000" opacity=".1"/>
    <rect x="3" y="3" width="90" height="66" rx="6" fill="${F('wood')}" ${S('#a3703f')}/>
    <rect x="11" y="11" width="74" height="50" rx="2" fill="${F('sky')}"/>
    <circle cx="66" cy="26" r="7" fill="#fff4b8" stroke="#e0a516" stroke-width="1.4"/>
    <path d="M11 61V44L30 26L46 44L58 36L85 58V61Z" fill="${F('hill')}" stroke="#2fa87c" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M30 26l-6 7 4 2 3-3 4 3 3-3z" fill="#fff" opacity=".9"/>
    <rect x="11" y="11" width="74" height="50" rx="2" fill="none" stroke="#a3703f" stroke-width="1.6"/>
    ${hi('M9 12V26', 2.6)}`),

  'm-clock': svg(66, 66, `
    <circle cx="35" cy="36" r="29" fill="#000" opacity=".1"/>
    <circle cx="33" cy="33" r="29" fill="${F('sun')}" ${S('#d9a010')}/>
    <circle cx="33" cy="33" r="22" fill="${F('white')}" stroke="#d9a010" stroke-width="1.6"/>
    <g stroke="#a98bf0" stroke-width="2.2" stroke-linecap="round"><path d="M33 15V19M33 47V51M15 33H19M47 33H51"/></g>
    <path d="M33 33L33 21" stroke="#5b4a85" stroke-width="3.2" stroke-linecap="round"/><path d="M33 33L43 38" stroke="#5b4a85" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="33" cy="33" r="3.2" fill="#ff7fb6" stroke="#d6478a" stroke-width="1.4"/>
    ${hi('M12 24Q16 14 26 10', 3)}`),

  'm-shelf': svg(136, 74, `
    <rect x="14" y="60" width="108" height="12" rx="5" fill="#000" opacity=".1"/>
    <path d="M26 54V66M110 54V66" stroke="#a3703f" stroke-width="4" stroke-linecap="round"/>
    <rect x="8" y="48" width="120" height="12" rx="5" fill="${F('wood')}" ${S('#a3703f')}/>
    <g stroke-width="1.8" stroke-linejoin="round">
      <rect x="18" y="22" width="11" height="26" rx="2" fill="${F('coral')}" stroke="#d6435a"/><rect x="30" y="26" width="10" height="22" rx="2" fill="${F('sky')}" stroke="#3a8ccc"/>
      <rect x="41" y="20" width="12" height="28" rx="2" fill="${F('sun')}" stroke="#d9a010"/>
      <path d="M58 48l4-22 9 2-3 20z" fill="${F('lilac')}" stroke="#8f6fd6"/>
      <path d="M86 30h22l-3 18H89z" fill="${F('white')}" stroke="#b98af6"/><path d="M97 30q-12-10-8-24 9 6 8 24zM97 30q12-10 8-24-9 6-8 24z" fill="${F('leaf')}" stroke="#1f8f5c"/>
      <rect x="112" y="34" width="12" height="14" rx="3" fill="${F('rose')}" stroke="#e8619c"/>
    </g>
    ${hi('M12 52H70', 2.8)}`),

  'm-lights': svg(200, 56, `
    <ellipse class="fx-glow" cx="100" cy="36" rx="110" ry="44" fill="url(#gf-glow)" fill-opacity=".5"/>
    <path d="M4 6Q50 44 100 30T196 6" fill="none" stroke="#a98bf0" stroke-width="2.4" stroke-linecap="round"/>
    <g stroke-width="1.6">
      <g class="bulb"><circle cx="30" cy="27" r="7.5" fill="#ffe98a" stroke="#d9a010"/><circle cx="27.5" cy="24.5" r="2.2" fill="#fff" opacity=".8"/></g>
      <g class="bulb"><circle cx="62" cy="38" r="7.5" fill="#ff9ec8" stroke="#d6478a"/><circle cx="59.5" cy="35.5" r="2.2" fill="#fff" opacity=".8"/></g>
      <g class="bulb"><circle cx="100" cy="38" r="7.5" fill="#9af2cf" stroke="#2fa87c"/><circle cx="97.5" cy="35.5" r="2.2" fill="#fff" opacity=".8"/></g>
      <g class="bulb"><circle cx="138" cy="35" r="7.5" fill="#ffe98a" stroke="#d9a010"/><circle cx="135.5" cy="32.5" r="2.2" fill="#fff" opacity=".8"/></g>
      <g class="bulb"><circle cx="170" cy="22" r="7.5" fill="#a6e0ff" stroke="#3a8ccc"/><circle cx="167.5" cy="19.5" r="2.2" fill="#fff" opacity=".8"/></g>
    </g>
    <g stroke="#a98bf0" stroke-width="2"><path d="M30 19.6V16M62 30.6V27M100 30.6V27M138 27.6V24M170 14.6V11"/></g>`),

  /* ---------- Cocina, Baño y Sala (Fase 5) ---------- */
  'm-table': svg(190, 128, `
    ${shadow(95, 122, 86)}
    <g>
      <rect x="10" y="26" width="10" height="64" rx="5" fill="${F('pink')}" ${S('#d6478a')}/>
      <rect x="8" y="82" width="42" height="12" rx="6" fill="${F('pink')}" ${S('#d6478a')}/>
      <path d="M14 94V120M44 94V120" stroke="#b07c4c" stroke-width="4" stroke-linecap="round"/>
      ${hi('M15 32V60', 2.4)}
    </g>
    <g>
      <rect x="170" y="26" width="10" height="64" rx="5" fill="${F('pink')}" ${S('#d6478a')}/>
      <rect x="140" y="82" width="42" height="12" rx="6" fill="${F('pink')}" ${S('#d6478a')}/>
      <path d="M146 94V120M176 94V120" stroke="#b07c4c" stroke-width="4" stroke-linecap="round"/>
    </g>
    <rect x="88" y="62" width="14" height="54" rx="4" fill="${F('woodD')}" ${S('#a3703f', 1.8)}/>
    <ellipse cx="95" cy="118" rx="26" ry="6" fill="${F('woodD')}" ${S('#a3703f', 1.8)}/>
    <path d="M30 58Q95 46 160 58V66Q95 78 30 66Z" fill="${F('wood')}" ${S('#a3703f')}/>
    <ellipse cx="95" cy="58" rx="65" ry="12" fill="${F('wood')}" ${S('#a3703f')}/>
    <path d="M58 52Q95 44 132 52" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>
    <path d="M76 54Q95 64 114 54L111 46H79Z" fill="${F('white')}" ${S('#b98af6', 1.8)}/>
    <circle cx="88" cy="42" r="6" fill="${F('coral')}" ${S('#d6435a', 1.4)}/><path d="M96 44q6-12 14-6-4 8-14 6z" fill="${F('sun')}" ${S('#d9a010', 1.4)}/>
    <circle cx="101" cy="40" r="5" fill="${F('leaf')}" ${S('#1f8f5c', 1.4)}/>`),

  'm-fridge': svg(92, 192, `
    ${shadow(46, 186, 40)}
    <rect x="6" y="6" width="80" height="176" rx="14" fill="${F('steel')}" ${S('#9fb3cc')}/>
    <path d="M6 64H86" stroke="#9fb3cc" stroke-width="2.4"/>
    <rect x="68" y="24" width="6" height="28" rx="3" fill="${F('metal')}" ${S('#6f58b0', 1.4)}/>
    <rect x="68" y="78" width="6" height="44" rx="3" fill="${F('metal')}" ${S('#6f58b0', 1.4)}/>
    <path d="M24 92c-4-6 4-10 7-4 3-6 11-2 7 4l-7 7z" fill="${F('pink')}" ${S('#d6478a', 1.4)}/>
    <circle cx="30" cy="112" r="5" fill="${F('sun')}" ${S('#d9a010', 1.4)}/>
    <rect x="18" y="120" width="22" height="16" rx="2" fill="#fff" ${S('#b98af6', 1.4)} transform="rotate(-6 29 128)"/>
    <path d="M22 126h14M22 131h10" stroke="#b98af6" stroke-width="1.4" stroke-linecap="round" transform="rotate(-6 29 128)"/>
    <rect x="14" y="180" width="10" height="6" rx="2" fill="#9fb3cc"/><rect x="68" y="180" width="10" height="6" rx="2" fill="#9fb3cc"/>
    ${hi('M14 16V56', 3.4)}${hi('M14 74V160', 3.4)}`),

  'm-stove': svg(112, 132, `
    ${shadow(56, 126, 50)}
    <path d="M44 10q-4-6 0-10M56 12q-4-6 0-12M68 10q-4-6 0-10" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
    <rect x="6" y="34" width="100" height="88" rx="10" fill="${F('steel')}" ${S('#9fb3cc')}/>
    <rect x="4" y="28" width="104" height="10" rx="4" fill="${F('metal')}" ${S('#6f58b0', 2)}/>
    <ellipse cx="30" cy="29" rx="14" ry="3" fill="#5b4a85" opacity=".55"/>
    <path d="M36 16h40l-3 13H39z" fill="${F('pink')}" ${S('#d6478a', 2)}/>
    <rect x="34" y="12" width="44" height="6" rx="3" fill="${F('rose')}" ${S('#d6478a', 1.8)}/><circle cx="56" cy="10" r="2.6" fill="${F('rose')}" ${S('#d6478a', 1.4)}/>
    <g fill="${F('white')}" stroke="#9a82d6" stroke-width="1.4"><circle cx="20" cy="46" r="4"/><circle cx="34" cy="46" r="4"/><circle cx="78" cy="46" r="4"/><circle cx="92" cy="46" r="4"/></g>
    <rect x="16" y="56" width="80" height="58" rx="8" fill="${F('steel')}" ${S('#9fb3cc', 2)}/>
    <rect x="26" y="70" width="60" height="34" rx="6" fill="${F('glass')}" ${S('#7d8fd6', 1.6)}/>
    <rect x="30" y="58" width="52" height="6" rx="3" fill="${F('metal')}" ${S('#6f58b0', 1.4)}/>
    <path d="M32 98l14-22" stroke="#fff" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>
    ${hi('M12 44V110', 3)}`),

  'm-cupboard': svg(140, 84, `
    <rect x="6" y="8" width="130" height="74" rx="8" fill="#000" opacity=".1"/>
    <rect x="4" y="4" width="132" height="74" rx="8" fill="${F('wood')}" ${S('#a3703f')}/>
    <rect x="12" y="12" width="54" height="58" rx="5" fill="${F('glass')}" ${S('#a3703f', 1.8)}/>
    <rect x="74" y="12" width="54" height="58" rx="5" fill="${F('glass')}" ${S('#a3703f', 1.8)}/>
    <path d="M12 42H66M74 42H128" stroke="#a3703f" stroke-width="1.6"/>
    <g stroke-width="1.4" stroke-linejoin="round">
      <rect x="18" y="22" width="12" height="18" rx="4" fill="${F('rose')}" stroke="#e8619c"/><rect x="34" y="26" width="12" height="14" rx="4" fill="${F('sun')}" stroke="#d9a010"/>
      <rect x="50" y="20" width="10" height="20" rx="4" fill="${F('mint')}" stroke="#2fa87c"/>
      <rect x="80" y="24" width="18" height="16" rx="3" fill="${F('lilac')}" stroke="#8f6fd6"/><rect x="104" y="22" width="16" height="18" rx="6" fill="${F('coral')}" stroke="#d6435a"/>
      <path d="M20 66q8-10 16 0zM40 66q8-10 16 0z" fill="${F('white')}" stroke="#b98af6"/><path d="M82 66h36v-6h-36z" fill="${F('sky')}" stroke="#3a8ccc"/>
    </g>
    <circle cx="62" cy="56" r="2.8" fill="#ffc93c" stroke="#d9a010" stroke-width="1"/><circle cx="78" cy="56" r="2.8" fill="#ffc93c" stroke="#d9a010" stroke-width="1"/>
    ${hi('M16 16L28 34', 2.6)}${hi('M78 16L90 34', 2.6)}`),

  'm-bathmat': svg(140, 52, `
    <rect x="6" y="10" width="128" height="38" rx="18" fill="#000" opacity=".1"/>
    <rect x="6" y="6" width="128" height="38" rx="18" fill="${F('mint')}" ${S('#2fa87c')}/>
    <rect x="18" y="13" width="104" height="24" rx="12" fill="${F('white')}" ${S('#2fa87c', 1.6)} opacity=".9"/>
    <g fill="${F('mint')}" opacity=".9"><circle cx="40" cy="25" r="3.4"/><circle cx="58" cy="25" r="3.4"/><circle cx="76" cy="25" r="3.4"/><circle cx="94" cy="25" r="3.4"/></g>
    ${hi('M24 10Q50 6 80 7', 2.6)}`),

  'm-tub': svg(204, 116, `
    ${shadow(102, 110, 92)}
    <path d="M18 30V6q0-4 4-4h8" fill="none" stroke="#9a82d6" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 2v6" stroke="#9a82d6" stroke-width="4" stroke-linecap="round"/>
    <g fill="#fff" stroke="#bfe6fb" stroke-width="1.4"><circle cx="56" cy="30" r="9"/><circle cx="72" cy="24" r="11"/><circle cx="92" cy="28" r="10"/><circle cx="130" cy="27" r="9"/><circle cx="146" cy="30" r="7"/><circle cx="112" cy="24" r="8"/></g>
    <path d="M122 22q0-8 8-8t6 6l5 1-4 4q-1 5-8 5h-7z" fill="${F('sun')}" ${S('#d9a010', 1.6)}/><circle cx="131" cy="18" r="1.4" fill="#2b2140"/>
    <path d="M8 36H196Q192 92 160 98H44Q12 92 8 36Z" fill="${F('steel')}" ${S('#7fb8d8')}/>
    <rect x="4" y="30" width="196" height="10" rx="5" fill="${F('white')}" ${S('#7fb8d8')}/>
    <path d="M40 98l-6 12M164 98l6 12" stroke="#d9a010" stroke-width="5" stroke-linecap="round"/>
    <path d="M24 46Q30 80 52 88" fill="none" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>`),

  'm-toilet': svg(96, 124, `
    ${shadow(48, 118, 34)}
    <rect x="20" y="6" width="56" height="46" rx="8" fill="${F('steel')}" ${S('#9fb3cc')}/>
    <circle cx="48" cy="18" r="4" fill="${F('metal')}" ${S('#6f58b0', 1.4)}/>
    <path d="M14 62Q14 92 34 98L30 114H66L62 98Q82 92 82 62Z" fill="${F('steel')}" ${S('#9fb3cc')}/>
    <ellipse cx="48" cy="60" rx="36" ry="9" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <ellipse cx="48" cy="58" rx="26" ry="5" fill="${F('white')}" opacity=".5"/>
    ${hi('M26 12V44', 3)}${hi('M22 70Q24 86 34 92', 3)}`),

  'm-sink': svg(92, 146, `
    ${shadow(46, 140, 30)}
    <path d="M40 30V20q0-6 6-6h12" fill="none" stroke="#9a82d6" stroke-width="4.4" stroke-linecap="round"/>
    <circle cx="36" cy="40" r="3.4" fill="${F('metal')}" ${S('#6f58b0', 1.2)}/><circle cx="56" cy="40" r="3.4" fill="${F('metal')}" ${S('#6f58b0', 1.2)}/>
    <rect x="68" y="30" width="12" height="18" rx="4" fill="${F('pink')}" ${S('#d6478a', 1.6)}/><rect x="71" y="24" width="6" height="7" rx="2" fill="${F('rose')}" ${S('#d6478a', 1.2)}/>
    <rect x="38" y="70" width="16" height="64" rx="6" fill="${F('steel')}" ${S('#9fb3cc')}/>
    <ellipse cx="46" cy="136" rx="20" ry="5" fill="${F('steel')}" ${S('#9fb3cc', 2)}/>
    <path d="M6 50H86Q84 74 46 76Q8 74 6 50Z" fill="${F('steel')}" ${S('#9fb3cc')}/>
    <ellipse cx="46" cy="50" rx="40" ry="8" fill="${F('white')}" ${S('#9fb3cc')}/>
    <ellipse cx="46" cy="50" rx="28" ry="4.4" fill="${F('glass')}"/>
    ${hi('M12 56Q18 68 32 72', 3)}`),

  'm-mirror': svg(72, 98, `
    <ellipse cx="38" cy="52" rx="32" ry="44" fill="#000" opacity=".1"/>
    <ellipse cx="36" cy="49" rx="32" ry="44" fill="${F('sun')}" ${S('#d9a010')}/>
    <ellipse cx="36" cy="49" rx="24" ry="35" fill="${F('glass')}" stroke="#d9a010" stroke-width="1.6"/>
    <path d="M24 34l14-14M24 48l20-20" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>
    ${hi('M10 36Q12 18 26 10', 2.6)}`),

  'm-towels': svg(112, 74, `
    <rect x="8" y="12" width="96" height="58" rx="6" fill="#000" opacity=".08"/>
    <rect x="4" y="6" width="104" height="7" rx="3.5" fill="${F('metal')}" ${S('#6f58b0', 1.8)}/>
    <path d="M14 12h38v50q0 4-4 4H18q-4 0-4-4z" fill="${F('pink')}" ${S('#d6478a')}/>
    <path d="M14 52h38M14 57h38" stroke="#fff" stroke-width="2.4" opacity=".7"/>
    <path d="M60 12h38v44q0 4-4 4H64q-4 0-4-4z" fill="${F('mint')}" ${S('#2fa87c')}/>
    <path d="M60 46h38M60 51h38" stroke="#fff" stroke-width="2.4" opacity=".7"/>
    ${hi('M20 18V44', 2.6)}${hi('M66 18V40', 2.6)}`),

  'm-pouf': svg(92, 66, `
    ${shadow(46, 60, 38)}
    <path d="M8 20Q6 52 18 56Q46 64 74 56Q86 52 84 20Z" fill="${F('sun')}" ${S('#d9a010')}/>
    <path d="M28 22Q26 42 30 58M46 22V61M64 22Q66 42 62 58" fill="none" stroke="#d9a010" stroke-width="1.4" opacity=".55"/>
    <ellipse cx="46" cy="20" rx="38" ry="10" fill="${F('sun')}" ${S('#d9a010')}/>
    <circle cx="46" cy="20" r="3.4" fill="${F('coral')}" ${S('#d6435a', 1.2)}/>
    ${hi('M16 18Q26 12 40 12', 2.8)}${hi('M14 30Q14 44 20 50', 3)}`),

  'm-couch': svg(232, 112, `
    ${shadow(116, 106, 104)}
    <rect x="24" y="8" width="184" height="58" rx="24" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <path d="M86 14V58M146 14V58" stroke="#8f6fd6" stroke-width="1.6" opacity=".45"/>
    <rect x="6" y="40" width="40" height="56" rx="18" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <rect x="186" y="40" width="40" height="56" rx="18" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <rect x="36" y="54" width="54" height="40" rx="14" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <rect x="89" y="54" width="54" height="40" rx="14" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <rect x="142" y="54" width="54" height="40" rx="14" fill="${F('lilac')}" ${S('#8f6fd6')}/>
    <path d="M40 30q0-10 12-10h12q10 0 10 10v14H40z" fill="${F('mint')}" ${S('#2fa87c', 1.8)}/>
    <path d="M158 30q0-10 12-10h12q10 0 10 10v14h-34z" fill="${F('rose')}" ${S('#e8619c', 1.8)}/>
    <rect x="24" y="94" width="10" height="10" rx="3" fill="#b07c4c" stroke="#a3703f" stroke-width="1.6"/><rect x="198" y="94" width="10" height="10" rx="3" fill="#b07c4c" stroke="#a3703f" stroke-width="1.6"/>
    ${hi('M38 20Q50 12 80 11', 3.4)}${hi('M12 52V82', 3)}`),

  'm-tv': svg(172, 152, `
    ${shadow(86, 146, 76)}
    <rect x="12" y="104" width="148" height="38" rx="8" fill="${F('wood')}" ${S('#a3703f')}/>
    <path d="M86 108V138" stroke="#a3703f" stroke-width="1.6"/>
    <circle cx="78" cy="123" r="2.6" fill="#ffc93c" stroke="#d9a010" stroke-width="1"/><circle cx="94" cy="123" r="2.6" fill="#ffc93c" stroke="#d9a010" stroke-width="1"/>
    <path d="M70 98h32l4 8H66z" fill="${F('metal')}" ${S('#6f58b0', 1.8)}/>
    <rect x="22" y="12" width="128" height="86" rx="12" fill="${F('metal')}" ${S('#5b4a85')}/>
    <rect x="30" y="20" width="112" height="70" rx="7" fill="${F('screen')}"/>
    <circle cx="86" cy="60" r="16" fill="#9af2cf" opacity=".9"/><circle cx="81" cy="57" r="2.4" fill="#2b2140"/><circle cx="91" cy="57" r="2.4" fill="#2b2140"/>
    <path d="M81 64q5 4 10 0" fill="none" stroke="#2b2140" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M118 30l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#ffe98a"/>
    <path d="M38 76L60 28" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>
    <rect x="136" y="90" width="16" height="14" rx="3" fill="${F('pot')}" ${S('#c9662c', 1.4)}/><path d="M144 90q-8-12-2-20 6 8 2 20zM144 90q8-12 2-20" fill="${F('leaf')}" stroke="#1f8f5c" stroke-width="1.4"/>
    ${hi('M18 110H70', 2.6)}`),

  'm-art': svg(124, 84, `
    <rect x="5" y="7" width="116" height="74" rx="6" fill="#000" opacity=".1"/>
    <rect x="3" y="3" width="116" height="74" rx="6" fill="${F('white')}" ${S('#b98af6')}/>
    <rect x="11" y="11" width="100" height="58" rx="2" fill="#fff6e8"/>
    <circle cx="40" cy="36" r="16" fill="${F('pink')}" opacity=".9"/>
    <path d="M11 58Q36 40 58 54T111 46V69H11Z" fill="${F('mint')}" opacity=".9"/>
    <rect x="70" y="18" width="26" height="26" rx="13" fill="${F('sun')}" opacity=".95"/>
    <path d="M60 22l12 30" stroke="#8f6fd6" stroke-width="3" stroke-linecap="round"/>
    ${hi('M9 12V28', 2.6)}`),

  'm-hanger': svg(76, 128, `
    <circle cx="38" cy="6" r="4" fill="none" stroke="#a3703f" stroke-width="2.4"/>
    <path d="M38 10L14 62M38 10L62 62M38 10V62" stroke="#cf9d6c" stroke-width="2" fill="none"/>
    <path d="M24 70Q20 98 12 122M32 74Q34 100 28 118M50 72Q56 96 62 116" fill="none" stroke="#1f8f5c" stroke-width="2.4" stroke-linecap="round"/>
    <g fill="${F('leaf')}" stroke="#1f8f5c" stroke-width="1.4">
      <ellipse cx="18" cy="98" rx="5" ry="3" transform="rotate(-50 18 98)"/><ellipse cx="13" cy="116" rx="5" ry="3" transform="rotate(-70 13 116)"/>
      <ellipse cx="33" cy="104" rx="5" ry="3" transform="rotate(80 33 104)"/><ellipse cx="56" cy="96" rx="5" ry="3" transform="rotate(60 56 96)"/>
      <ellipse cx="61" cy="112" rx="5" ry="3" transform="rotate(70 61 112)"/>
      <path d="M38 62Q20 48 22 34Q34 42 38 62ZM38 62Q56 48 54 34Q42 42 38 62Z"/>
    </g>
    <path d="M14 60H62L56 84Q55 88 50 88H26Q21 88 20 84Z" fill="${F('pot')}" ${S('#c9662c')}/>
    ${hi('M20 66L24 82', 3)}`),
};
