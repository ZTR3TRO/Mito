// Piezas extraídas de mito-halloween.html: conservar trazos, colores y orden de capas.
export const HALLOWEEN_DEFS = `
<radialGradient id="gPk" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffc48a"/><stop offset=".55" stop-color="#ff8f2a"/><stop offset="1" stop-color="#d9601c"/></radialGradient>
<radialGradient id="gBat" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#a98aea"/><stop offset=".55" stop-color="#6a4aa8"/><stop offset="1" stop-color="#3a2470"/></radialGradient>
<linearGradient id="gCapeDk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3d66"/><stop offset="1" stop-color="#1a1030"/></linearGradient>`;

// Cada grupo se inserta después de la pieza indicada del arte base.
export const HALLOWEEN_AFTER = {
  cape: [
    ['vampcape', `<g data-k="vampcape"><path d="M36 62 Q2 96 4 140 Q40 154 75 150 Q110 154 146 140 Q148 96 114 62Z" fill="url(#gCapeDk)" stroke="#8a6ab8" stroke-width="2.5" stroke-linejoin="round"/><path d="M46 76 Q20 104 22 138 Q75 148 128 138 Q130 104 104 76Z" fill="#c2203f" opacity=".92"/><path d="M52 90 Q34 110 36 134" stroke="#ff8fa0" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/></g>`],
  ],
  stetho: [
    ['vampcape', `<g data-k="vampcape">
  <g id="vcol"><path d="M24 114 L16 74 L54 102 L70 118 Q44 124 24 114Z" fill="url(#gCapeDk)" stroke="#8a6ab8" stroke-width="2.4" stroke-linejoin="round"/><path d="M26 108 L22 84 L48 104 L58 112Z" fill="#c2203f"/></g>
  <use href="#vcol" transform="translate(150 0) scale(-1 1)"/>
  <circle cx="75" cy="121" r="6" fill="url(#gRed)" stroke="#ffd23c" stroke-width="2.4"/><circle cx="73" cy="119" r="1.6" fill="#fff" opacity=".85"/></g>`],
    ['pumpkincos', `<g data-k="pumpkincos"><g clip-path="url(#cpBody)">
  <path d="M14 99Q75 117 136 99L136 146L14 146Z" fill="url(#gPk)"/>
  <path d="M40 106Q32 124 46 144M110 106Q118 124 104 144M75 112V146" stroke="#d9601c" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/>
  <path d="M14 99Q75 117 136 99L136 146L14 146Z" fill="url(#gSideDk)"/>
  <path d="M14 134Q75 150 136 134L136 148L14 148Z" fill="#000" opacity=".14"/></g>
  <path d="M20 100Q75 119 130 100" stroke="#2d7a34" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M20 100Q75 119 130 100" stroke="#6fcf5a" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-dasharray="9 4"/>
  <path d="M60 124L67 133L75 126L83 133L90 124" stroke="#5a2a08" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/></g>`],
    ['fangs', `<g data-k="fangs"><path d="M67 100.4L72 102.4L69.5 108.5Z M83 100.4L78 102.4L80.5 108.5Z" fill="#fff" stroke="#2b2140" stroke-width="1.4" stroke-linejoin="round"/></g>`],
    ['candy', `<g data-k="candy"><g transform="rotate(-8 122 110)">
  <path d="M107 100Q122 76 137 100" stroke="#4a2f1c" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="115" cy="96" r="4.5" fill="#ff5da2" stroke="#b3245f" stroke-width="1.4"/><circle cx="124" cy="93" r="4.5" fill="#ffd23c" stroke="#b9790a" stroke-width="1.4"/><circle cx="131" cy="98" r="4" fill="#b98af6" stroke="#6a3fb8" stroke-width="1.4"/>
  <path d="M106 102Q122 96 138 102L134 126Q122 132 110 126Z" fill="url(#gPk)" stroke="#b8501a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M114 111L118 106L122 111Z M122 111L126 106L130 111Z M113 118L117 121L122 118L127 121L131 118" fill="#5a2a08" stroke="#5a2a08" stroke-width="1.6" stroke-linejoin="round"/></g>
  <circle cx="121" cy="128" r="8" fill="url(#gBody)" stroke="var(--stroke)" stroke-width="2.2"/></g>`],
  ],
  chef: [
    ['pumpkinhat', `<g data-k="pumpkinhat"><g transform="rotate(-6 75 30)">
  <ellipse cx="75" cy="27" rx="36" ry="21" fill="url(#gPk)" stroke="#b8501a" stroke-width="2.5"/>
  <path d="M60 8Q48 27 60 46M90 8Q102 27 90 46M75 6V48" stroke="#d9601c" stroke-width="2.2" fill="none" opacity=".8" stroke-linecap="round"/>
  <ellipse cx="55" cy="18" rx="9" ry="4" transform="rotate(-30 55 18)" fill="#fff" opacity=".5"/>
  <path d="M71 8Q69 -3 77 -6L82 -2Q78 3 80 8Z" fill="#4da64a" stroke="#2d7a34" stroke-width="2" stroke-linejoin="round"/>
  <path d="M80 -3Q92 -9 90 2" stroke="#4da64a" stroke-width="2.6" fill="none" stroke-linecap="round"/></g></g>`],
    ['vamphair', `<g data-k="vamphair"><path d="M24 58Q20 20 75 15Q130 20 126 58Q112 46 100 38Q90 54 75 58Q60 54 50 38Q38 46 24 58Z" fill="url(#gDark)" stroke="#17102a" stroke-width="2.4" stroke-linejoin="round"/><path d="M42 34Q58 20 80 22" stroke="#8a7bb5" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/></g>`],
  ],
};

export const HALLOWEEN_PETS = {
  pumpkin: `<g data-p="pumpkin"><g class="pbob">
  <ellipse cx="40" cy="52" rx="26" ry="20" fill="url(#gPk)" stroke="#b8501a" stroke-width="2.4"/>
  <path d="M30 34Q20 52 30 70M50 34Q60 52 50 70M40 32V72" stroke="#d9601c" stroke-width="2" fill="none" opacity=".7"/>
  <path d="M37 33Q36 24 42 21L46 25Q43 28 44 33Z" fill="#4da64a" stroke="#2d7a34" stroke-width="2" stroke-linejoin="round"/><path d="M45 24Q55 17 55 27" stroke="#4da64a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="27" cy="42" rx="7" ry="3.4" transform="rotate(-30 27 42)" fill="#fff" opacity=".5"/>
  <g class="pe"><ellipse cx="31" cy="50" rx="3.2" ry="4.2" fill="#2b2140"/><ellipse cx="49" cy="50" rx="3.2" ry="4.2" fill="#2b2140"/><circle cx="32" cy="48.5" r="1.3" fill="#fff"/><circle cx="50" cy="48.5" r="1.3" fill="#fff"/></g>
  <circle cx="23" cy="58" r="4" fill="#ff8fc0" opacity=".55"/><circle cx="57" cy="58" r="4" fill="#ff8fc0" opacity=".55"/>
  <path d="M34 59Q40 66 46 59" stroke="#2b2140" stroke-width="2" fill="none" stroke-linecap="round"/></g></g>`,
  bat: `<g data-p="bat"><g class="oflt">
  <path class="wl" d="M27 46Q8 28 3 38Q9 42 7 50Q13 48 15 56Q21 54 27 60Z" fill="url(#gBat)" stroke="#2b1a52" stroke-width="2.2" stroke-linejoin="round"/>
  <path class="wr" d="M53 46Q72 28 77 38Q71 42 73 50Q67 48 65 56Q59 54 53 60Z" fill="url(#gBat)" stroke="#2b1a52" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M26 40L23 18L38 31Z" fill="url(#gBat)" stroke="#2b1a52" stroke-width="2.2" stroke-linejoin="round"/><path d="M54 40L57 18L42 31Z" fill="url(#gBat)" stroke="#2b1a52" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M27 35L26 25L33 31Z M53 35L54 25L47 31Z" fill="#ff9ccb"/>
  <ellipse cx="40" cy="50" rx="17" ry="17" fill="url(#gBat)" stroke="#2b1a52" stroke-width="2.4"/>
  <ellipse cx="40" cy="58" rx="9" ry="8" fill="#c9b4f2" opacity=".85"/>
  <ellipse cx="31" cy="38" rx="6" ry="3" transform="rotate(-25 31 38)" fill="#fff" opacity=".35"/>
  <g class="pe"><ellipse cx="33" cy="48" rx="4.4" ry="5" fill="#fff"/><ellipse cx="47" cy="48" rx="4.4" ry="5" fill="#fff"/><circle cx="33.6" cy="48.6" r="2.6" fill="#2b2140"/><circle cx="46.4" cy="48.6" r="2.6" fill="#2b2140"/><circle cx="34.4" cy="47.4" r="1" fill="#fff"/><circle cx="47.2" cy="47.4" r="1" fill="#fff"/></g>
  <path d="M36 57Q40 61 44 57" stroke="#2b1a52" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M36.6 58l1.4 3.4 1.4-2.6Z M43.4 58l-1.4 3.4-1.4-2.6Z" fill="#fff" stroke="#2b1a52" stroke-width="1" stroke-linejoin="round"/>
  <circle cx="26" cy="55" r="3.2" fill="#ff8fc0" opacity=".6"/><circle cx="54" cy="55" r="3.2" fill="#ff8fc0" opacity=".6"/>
  <ellipse cx="33" cy="68" rx="4" ry="2.6" fill="#3a2470" stroke="#2b1a52" stroke-width="1.6"/><ellipse cx="47" cy="68" rx="4" ry="2.6" fill="#3a2470" stroke="#2b1a52" stroke-width="1.6"/>
</g></g>`,
};
