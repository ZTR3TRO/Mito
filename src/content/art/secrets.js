// Arte de los premios secretos (easter egg de la portada).
// Vive aparte de halloweenArt.js porque esas piezas se verifican contra mito-halloween.html.
// Misma convención que las demás mascotas: viewBox 80x80, `.pe` = parpadeo, `.oflt` = flotar.

export const SECRET_PETS = {
  // Abejita: flota, aletea rápido (.bwl/.bwr) y parpadea. Reusa el degradado #gYel del arte base.
  bee: `<g data-p="bee"><g class="oflt">
  <g class="bwl"><ellipse cx="22" cy="30" rx="13" ry="8.5" transform="rotate(-32 22 30)" fill="#eaf7ff" fill-opacity=".88" stroke="#8cc4f0" stroke-width="2.2"/><ellipse cx="18.5" cy="27.6" rx="6" ry="2.4" transform="rotate(-32 18.5 27.6)" fill="#fff" opacity=".75"/></g>
  <g class="bwr"><ellipse cx="58" cy="30" rx="13" ry="8.5" transform="rotate(32 58 30)" fill="#eaf7ff" fill-opacity=".88" stroke="#8cc4f0" stroke-width="2.2"/><ellipse cx="61.5" cy="27.6" rx="6" ry="2.4" transform="rotate(32 61.5 27.6)" fill="#fff" opacity=".75"/></g>
  <path d="M33 28Q29 18 24 14M47 28Q51 18 56 14" stroke="#2b2140" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <circle cx="23" cy="13.5" r="3.4" fill="#ffd23c" stroke="#2b2140" stroke-width="2"/><circle cx="57" cy="13.5" r="3.4" fill="#ffd23c" stroke="#2b2140" stroke-width="2"/>
  <ellipse cx="31" cy="68" rx="5.2" ry="3" fill="#3a2a1a"/><ellipse cx="49" cy="68" rx="5.2" ry="3" fill="#3a2a1a"/>
  <ellipse cx="40" cy="48" rx="24" ry="21" fill="url(#gYel)"/>
  <path d="M17.3 54Q40 61 62.7 54L58.6 61.5Q40 69 21.4 61.5Z M26 63.5Q40 69 54 63.5L50 67Q40 70 30 67Z" fill="#2b2140"/>
  <ellipse cx="40" cy="48" rx="24" ry="21" fill="none" stroke="#c98a0a" stroke-width="2.4"/>
  <ellipse cx="29" cy="33" rx="8" ry="3.6" transform="rotate(-30 29 33)" fill="#fff" opacity=".5"/>
  <g class="pe"><ellipse cx="31" cy="43" rx="3.2" ry="4.2" fill="#2b2140"/><ellipse cx="49" cy="43" rx="3.2" ry="4.2" fill="#2b2140"/><circle cx="32" cy="41.5" r="1.3" fill="#fff"/><circle cx="50" cy="41.5" r="1.3" fill="#fff"/></g>
  <circle cx="23.5" cy="50" r="4.2" fill="#ff8fc0" opacity=".55"/><circle cx="56.5" cy="50" r="4.2" fill="#ff8fc0" opacity=".55"/>
  <path d="M36 49.4q4 3.4 8 0" stroke="#2b2140" stroke-width="2" fill="none" stroke-linecap="round"/>
</g></g>`,
};

// Mini-vuelos para las auras (se orbitan alrededor de Mito). Se insertan como HTML en el aura.
export const AURA_BAT = `<svg viewBox="0 0 30 16" aria-hidden="true"><path d="M15 5C13 1 11 1 10 3C8 2 3 3 0 8C3 7 5 8 6 10C8 8 10 9 11 11C12.5 9 13.5 9 15 12C16.5 9 17.5 9 19 11C20 9 22 8 24 10C25 8 27 7 30 8C27 3 22 2 20 3C19 1 17 1 15 5Z" fill="#3a2470" stroke="#1d1033" stroke-width=".8" stroke-linejoin="round"/><circle cx="13.4" cy="5.6" r=".9" fill="#ffb347"/><circle cx="16.6" cy="5.6" r=".9" fill="#ffb347"/></svg>`;

export const AURA_BEE = `<svg viewBox="0 0 150 150" aria-hidden="true" style="position:absolute; width:100%; height:100%; top:0; left:0; z-index:-1;">
  <defs>
    <radialGradient id="gPanalAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd23c" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#ffb347" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    <path id="hex" d="M0,-8 L6.9,-4 L6.9,4 L0,8 L-6.9,4 L-6.9,-4 Z" fill="none" stroke="#ffd23c" stroke-width="1.4" stroke-opacity="0.85"/>
  </defs>
  
  <!-- Resplandor dorado de fondo -->
  <circle cx="75" cy="75" r="72" fill="url(#gPanalAura)"/>
  
  <!-- Hexágonos flotantes -->
  <g class="oflt">
    <use href="#hex" x="35" y="32"/>
    <use href="#hex" x="115" y="45" transform="scale(0.85) translate(20, 10)"/>
    <use href="#hex" x="30" y="112" transform="scale(1.1) translate(-5, -5)"/>
    <use href="#hex" x="120" y="105"/>
    <use href="#hex" x="75" y="20" transform="scale(0.7) translate(30, 0)"/>
  </g>
</svg>`;