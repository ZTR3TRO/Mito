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
export const FURNITURE_DEFS = `<svg id="furnDefs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${
  Object.entries(PAL).map(([k, [a, b]]) =>
    `<linearGradient id="gf-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')
}<radialGradient id="gf-glow"><stop offset="0" stop-color="#fff2b0" stop-opacity=".95"/><stop offset=".45" stop-color="#ffd86a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd86a" stop-opacity="0"/></radialGradient></defs></svg>`;

const F = k => `url(#gf-${k})`;
// trazo estándar: contorno de 2.4, esquinas redondas
const S = c => `stroke="${c}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".16"/>`;
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
};
