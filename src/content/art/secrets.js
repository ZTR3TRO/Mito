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
  // Ajolote (premio de la ronda perfecta): nada suave, mueve las branquias y la cola y suelta burbujas.
  // Convención de siempre: viewBox 80x80, `.pe` = parpadeo, `.oflt` = flotar. Las clases .agl/.agr/.atail/.abub se animan en style.css.
  ajolote: `<g data-p="ajolote"><g class="oflt">
  <g class="atail"><path d="M47 60C60 66 71 60 74 49C76 43 71 41 69 46C65 54 57 55 47 55Z" fill="#ffb5d3" stroke="#d9578f" stroke-width="2.2" stroke-linejoin="round"/><path d="M52 58C60 59 66 56 70 50" fill="none" stroke="#ff8fb8" stroke-width="1.6" stroke-linecap="round" opacity=".8"/></g>
  <g class="agl"><path d="M23 34C16 35 10 30 8 21C15 22 21 26 24.5 32Z" fill="#ff5d9e" stroke="#c4306a" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 32C17 31 13 28 10.5 23.5" fill="none" stroke="#ffb0d0" stroke-width="1.2" stroke-linecap="round"/><path d="M21 41.5C14 42 8 40 3.5 36C9.5 33 16.5 35 22.5 38.5Z" fill="#ff5d9e" stroke="#c4306a" stroke-width="1.6" stroke-linejoin="round"/><path d="M20.5 40C14 39.5 9 38 6 36" fill="none" stroke="#ffb0d0" stroke-width="1.2" stroke-linecap="round"/><path d="M23 48C16 50 11 54.5 9.5 62C16 60.5 22 56 24.5 50Z" fill="#ff5d9e" stroke="#c4306a" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 50.5C16.5 52 13 55.5 11 59" fill="none" stroke="#ffb0d0" stroke-width="1.2" stroke-linecap="round"/></g>
  <g class="agr"><g transform="translate(80 0) scale(-1 1)"><path d="M23 34C16 35 10 30 8 21C15 22 21 26 24.5 32Z" fill="#ff5d9e" stroke="#c4306a" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 32C17 31 13 28 10.5 23.5" fill="none" stroke="#ffb0d0" stroke-width="1.2" stroke-linecap="round"/><path d="M21 41.5C14 42 8 40 3.5 36C9.5 33 16.5 35 22.5 38.5Z" fill="#ff5d9e" stroke="#c4306a" stroke-width="1.6" stroke-linejoin="round"/><path d="M20.5 40C14 39.5 9 38 6 36" fill="none" stroke="#ffb0d0" stroke-width="1.2" stroke-linecap="round"/><path d="M23 48C16 50 11 54.5 9.5 62C16 60.5 22 56 24.5 50Z" fill="#ff5d9e" stroke="#c4306a" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 50.5C16.5 52 13 55.5 11 59" fill="none" stroke="#ffb0d0" stroke-width="1.2" stroke-linecap="round"/></g></g>
  <ellipse cx="31" cy="69" rx="5.4" ry="3.2" fill="#ffb5d3" stroke="#d9578f" stroke-width="2"/><ellipse cx="49" cy="69" rx="5.4" ry="3.2" fill="#ffb5d3" stroke="#d9578f" stroke-width="2"/>
  <ellipse cx="40" cy="60" rx="16" ry="11" fill="#ffb5d3" stroke="#d9578f" stroke-width="2.4"/>
  <ellipse cx="40" cy="64" rx="9.5" ry="6" fill="#ffe3ef"/>
  <ellipse cx="40" cy="42" rx="22" ry="18" fill="#ffc2da" stroke="#d9578f" stroke-width="2.4"/>
  <ellipse cx="30" cy="31" rx="8" ry="3.4" transform="rotate(-25 30 31)" fill="#fff" opacity=".5"/>
  <circle cx="45" cy="29" r="1.3" fill="#e8407e" opacity=".45"/><circle cx="50" cy="33" r="1" fill="#e8407e" opacity=".45"/><circle cx="36" cy="28.5" r="1" fill="#e8407e" opacity=".4"/>
  <circle cx="24.5" cy="48" r="4.4" fill="#ff7fb2" opacity=".55"/><circle cx="55.5" cy="48" r="4.4" fill="#ff7fb2" opacity=".55"/>
  <g class="pe"><ellipse cx="31" cy="41" rx="3.3" ry="4.3" fill="#2b2140"/><ellipse cx="49" cy="41" rx="3.3" ry="4.3" fill="#2b2140"/><circle cx="32.1" cy="39.4" r="1.4" fill="#fff"/><circle cx="50.1" cy="39.4" r="1.4" fill="#fff"/></g>
  <path d="M33 49Q40 55.5 47 49" stroke="#2b2140" stroke-width="2.1" fill="none" stroke-linecap="round"/>
  <circle cx="38.6" cy="45.6" r=".8" fill="#d9578f"/><circle cx="41.4" cy="45.6" r=".8" fill="#d9578f"/>
  <g class="abub" style="--dl:0s"><circle cx="64" cy="22" r="2.4" fill="#e8f6ff" fill-opacity=".7" stroke="#8cc4f0" stroke-width="1.3"/></g>
  <g class="abub" style="--dl:1.1s"><circle cx="68" cy="14" r="1.8" fill="#e8f6ff" fill-opacity=".7" stroke="#8cc4f0" stroke-width="1.2"/></g>
  <g class="abub" style="--dl:2.1s"><circle cx="60" cy="10" r="1.3" fill="#e8f6ff" fill-opacity=".7" stroke="#8cc4f0" stroke-width="1.1"/></g>
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