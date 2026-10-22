// Escena de la Casa: dibuja el fondo de cada cuarto (pared, piso de duela o de mosaico, ventana con cortinas y luz).
// Solo dibuja; no sabe nada de gestos ni de física. La composición sale de layout.js: la escena aprobada es un
// bloque fijo (.scene) que se escala de forma uniforme para caber, y el fondo se extiende alrededor.
//
// La casa es horizontal: cada cuarto es un panel (.pane, uno por cada cuarto de content/rooms.js) con sus propias
// capas, todos del tamaño del cuarto visible. La cámara (nav.js) mueve cada capa con su velocidad (parallax); los
// paneles no se transforman, así las capas de todos los cuartos se ordenan con Mito por su z-index.
//
// Profundidad (de atrás hacia adelante): pared → piso → zócalo → alfombras → luz → ventana → muebles (los de la
// pared y luego los del piso por su profundidad v; los dibuja decor.js) → escenario: sombras, mascota y Mito →
// globos de texto y barra de acciones. Mito en reposo queda siempre al frente de todos los muebles (para que nada
// lo tape ni impida tocarlo) y mientras vuela también.

import { sceneLayout, lightPlan, FLOOR, floorRowY, floorX, toRoomX, toRoomY, GLASS, CURTAIN } from './layout.js';
import { ROOMS } from '../../content/rooms.js';

const f = n => n.toFixed(1);
const poly = pts => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';

/* ---------- piso: duela menta ----------
   La de la versión aprobada (filas, largo de tabla, tonos, veta y perspectiva), pero cubriendo todo el piso del
   cuarto: las filas siguen hacia abajo con la misma ley y las tablas siguen a los lados. Se dibuja en px reales
   (sin estirar), con la proporción del bloque. */
function floorSvg(L){
  const H = L.H - L.horizon;
  const yMax = (L.H - L.horizon) / L.fb * 100;                 // hasta dónde llega el piso, en % del piso del bloque
  const xMin = (0 - L.block.x) / L.block.w * 100, xMax = (L.W - L.block.x) / L.block.w * 100;
  const X = (u, y) => toRoomX(L, floorX(u, y)), Y = y => toRoomY(L, y) - L.horizon;
  let planks = '', joints = '', grain = '', bevel = '';
  for(let r = 0; floorRowY(r) < yMax; r++){
    const ya = floorRowY(r), yb = floorRowY(r + 1), h = yb - ya;
    const off = ((r * 37) % 100) / 100 * FLOOR.plank;
    // las mismas tablas que en la versión aprobada (empiezan en u = −60 + off), extendidas a los dos lados
    const first = Math.floor((xMin - (-60 + off)) / FLOOR.plank) - 1;
    for(let k = first, ua = -60 + off + first * FLOOR.plank; floorX(ua, ya) < xMax + FLOOR.plank; k++, ua += FLOOR.plank){
      const ub = ua + FLOOR.plank;
      const kk = ((k % 3) + 3) % 3, odd = n => ((n % 2) + 2) % 2;
      const tone = 1 + ((r * 7 + kk * 5) % 3);
      planks += `<path d="M${f(X(ua, ya))} ${f(Y(ya))}L${f(X(ub, ya))} ${f(Y(ya))}L${f(X(ub, yb))} ${f(Y(yb))}L${f(X(ua, yb))} ${f(Y(yb))}Z" fill="var(--plank-${tone})"/>`;
      joints += `<path d="M${f(X(ub, ya))} ${f(Y(ya))}L${f(X(ub, yb))} ${f(Y(yb))}"/>`;
      // veta: dos trazos suaves por tabla, curvados "al azar" (pero siempre igual)
      for(const [t, bend] of [[.38, odd(r + k) ? .12 : -.1], [.72, odd(r * k) ? -.08 : .1]]){
        const y = ya + h * t, a = ua + 4 + kk, b = ub - 5 - (r % 3);
        grain += `<path d="M${f(X(a, y))} ${f(Y(y))}Q${f(X((a + b) / 2, y))} ${f(Y(y + h * bend))} ${f(X(b, y))} ${f(Y(y))}"/>`;
      }
    }
    if(r){ joints += `<path d="M0 ${f(Y(ya))}H${f(L.W)}"/>`; bevel += `<path d="M0 ${f(Y(ya) + 1.2)}H${f(L.W)}"/>`; }
  }
  return `<svg viewBox="0 0 ${f(L.W)} ${f(H)}" aria-hidden="true">${planks}
    <g stroke="var(--grain)" stroke-width="1" stroke-linecap="round" fill="none">${grain}</g>
    <g stroke="var(--bevel)" stroke-width="1" fill="none">${bevel}</g>
    <g stroke="var(--joint)" stroke-width="1.3" fill="none">${joints}</g></svg>`;
}

/* ---------- piso de mosaico: Cocina (ajedrez) y Baño (mosaico chico) ----------
   La misma perspectiva que la duela (filas con floorRowY y columnas con floorX), con baldosas cuadradas en vez de
   tablas. Colores: --tile-1, --tile-2 y --grout (style.css, por cuarto). */
const TILES = { checker: { w: 26, split: 1 }, tiles: { w: 15, split: 2 } };   // ancho de la baldosa (u) y filas por fila de duela
function tilesSvg(L, kind){
  const T = TILES[kind];
  const H = L.H - L.horizon, yMax = H / L.fb * 100;
  const xMin = (0 - L.block.x) / L.block.w * 100, xMax = (L.W - L.block.x) / L.block.w * 100;
  const X = (u, y) => toRoomX(L, floorX(u, y)), Y = y => toRoomY(L, y) - L.horizon;
  const rowY = i => floorRowY(i / T.split);
  let tiles = '', grout = '';
  for(let r = 0; rowY(r) < yMax; r++){
    const ya = rowY(r), yb = rowY(r + 1);
    const first = Math.floor((xMin - 50) / T.w) - 3;
    for(let k = first, ua = 50 + first * T.w; floorX(ua, ya) < xMax + T.w; k++, ua += T.w){
      const ub = ua + T.w;
      // ajedrez: alterna; mosaico: casi todas iguales, con alguna más oscura "al azar" (pero siempre igual)
      const tone = kind === 'checker' ? (((r + k) % 2 + 2) % 2 ? 1 : 2) : (((r * 3 + k * 7) % 5 + 5) % 5 === 0 ? 2 : 1);
      tiles += `<path d="M${f(X(ua, ya))} ${f(Y(ya))}L${f(X(ub, ya))} ${f(Y(ya))}L${f(X(ub, yb))} ${f(Y(yb))}L${f(X(ua, yb))} ${f(Y(yb))}Z" fill="var(--tile-${tone})"/>`;
      grout += `<path d="M${f(X(ub, ya))} ${f(Y(ya))}L${f(X(ub, yb))} ${f(Y(yb))}"/>`;
    }
    if(r) grout += `<path d="M0 ${f(Y(ya))}H${f(L.W)}"/>`;
  }
  return `<svg viewBox="0 0 ${f(L.W)} ${f(H)}" aria-hidden="true">${tiles}
    <g stroke="var(--grout)" stroke-width="1.4" fill="none">${grout}</g></svg>`;
}

/* ---------- ventana redonda (Baño): marco grueso, vidrio esmerilado y el cielo de día o de noche ----------
   El mismo viewBox 200 × 250 que la rectangular, para que ocupe el mismo lugar. Sin cortinas ni haz de luz. */
function roundWindowSvg(s){
  return `<svg viewBox="0 0 200 250" aria-hidden="true">
    <defs>
      <clipPath id="ph-${s}"><circle cx="100" cy="104" r="50"/></clipPath>
      <linearGradient id="phsky-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)"/><stop offset="1" style="stop-color:var(--sky-2)"/></linearGradient>
      <radialGradient id="phfrost-${s}" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></radialGradient>
      <mask id="phmoon-${s}"><circle cx="120" cy="82" r="11" fill="#fff"/><circle cx="126" cy="77" r="9" fill="#000"/></mask>
    </defs>
    <circle cx="104" cy="110" r="66" style="fill:var(--frame-shadow)"/>
    <circle cx="100" cy="104" r="66" style="fill:var(--frame)" stroke="var(--frame-line)" stroke-width="2"/>
    <circle cx="100" cy="104" r="56" style="fill:var(--frame-in)"/>
    <g clip-path="url(#ph-${s})">
      <rect x="40" y="44" width="120" height="120" fill="url(#phsky-${s})"/>
      <g class="day"><circle cx="120" cy="80" r="11" fill="#fff4b8"/>
        <g fill="#fff" opacity=".9"><circle cx="80" cy="112" r="7"/><circle cx="90" cy="106" r="9"/><rect x="74" y="111" width="28" height="7" rx="3.5"/></g></g>
      <g class="night"><rect x="98" y="62" width="40" height="40" fill="#fff7dc" mask="url(#phmoon-${s})"/>
        <g fill="#fff"><circle cx="74" cy="80" r="1.2"/><circle cx="86" cy="128" r="1"/><circle cx="130" cy="124" r="1.1"/></g></g>
      <rect x="40" y="44" width="120" height="120" fill="url(#phfrost-${s})"/>
      <path d="M70 134L118 70" stroke="#fff" stroke-width="6" stroke-linecap="round" style="opacity:var(--glare)"/>
    </g>
    <g style="fill:var(--frame-line)"><circle cx="100" cy="42" r="3.4"/><circle cx="162" cy="104" r="3.4"/><circle cx="100" cy="166" r="3.4"/><circle cx="38" cy="104" r="3.4"/></g>
  </svg>`;
}

/* ---------- ventana rectangular: marco con grosor, repisón, cortinas y el cielo de día o de noche ----------
   viewBox 200 × 250. La luz usa GLASS y PANES, y las siluetas de las cortinas (.cur-shape). */
const MULLION = { x: 97.5, w: 5 };      // parteluz (vertical)
const TRANSOM = { y: 117.5, h: 5 };     // travesaño (horizontal)
// La cortina (CURTAIN, en layout.js) cubre un poco del vidrio arriba (x > 58): el reflejo del piso lo respeta.
function windowSvg(s){
  const curtain = mirror => `<g${mirror ? ' transform="translate(200 0) scale(-1 1)"' : ''}>
      <path class="cur-shape"${mirror ? ' data-mirror="1"' : ''} d="${CURTAIN}" fill="url(#cur-${s})" stroke="var(--cur-line)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M28 30Q28 92 30 144M41 30Q41 92 36 144M53 30Q51 92 41 144M22 158Q18 192 18 220M31 158Q31 192 31 220M40 158Q44 192 44 220" fill="none" stroke="var(--cur-line)" stroke-width="1.2" opacity=".45" stroke-linecap="round"/>
      <path d="M19 139Q31 149 45 139L46 148Q31 158 18 148Z" fill="var(--tie)" stroke="var(--tie-line)" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="32" cy="148" r="3" fill="var(--yellow)" stroke="#e0a516" stroke-width="1.1"/>
    </g>`;
  // Cortina cerrada: un paño recto de la barra hasta abajo, con pliegues y el borde de abajo ondulado.
  // (el espejo va en un grupo aparte: la animación de style.css usa transform y lo reemplazaría)
  const closedPanel = mirror => `<g${mirror ? ' transform="translate(200 0) scale(-1 1)"' : ''}><g class="cur-panel">
      <path d="M12 26H102V218Q96 224 90 218Q83 224 76 218Q69 224 62 218Q55 224 48 218Q41 224 34 218Q27 224 20 218Q16 222 12 218Z" fill="url(#cur-${s})" stroke="var(--cur-line)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M27 30V214M41 30V214M55 30V214M69 30V214M83 30V214M96 30V214" fill="none" stroke="var(--cur-line)" stroke-width="1.2" opacity=".4" stroke-linecap="round"/>
    </g></g>`;
  const { x0, x1, y0, y1 } = GLASS;
  return `<svg viewBox="0 0 200 250" aria-hidden="true">
    <defs>
      <clipPath id="glass-${s}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath>
      <linearGradient id="sky-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)"/><stop offset="1" style="stop-color:var(--sky-2)"/></linearGradient>
      <linearGradient id="cur-${s}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style="stop-color:var(--cur-1)"/><stop offset=".22" style="stop-color:var(--cur-2)"/><stop offset=".42" style="stop-color:var(--cur-1)"/>
        <stop offset=".62" style="stop-color:var(--cur-2)"/><stop offset=".82" style="stop-color:var(--cur-1)"/><stop offset="1" style="stop-color:var(--cur-2)"/></linearGradient>
      <linearGradient id="reveal-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".2" stop-color="#000" stop-opacity="0"/></linearGradient>
      <radialGradient id="sun-${s}"><stop offset="0" stop-color="#fff6c2"/><stop offset=".55" stop-color="#ffe680" stop-opacity=".55"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient>
      <mask id="moon-${s}"><circle cx="122" cy="80" r="12" fill="#fff"/><circle cx="128.5" cy="74.5" r="10" fill="#000"/></mask>
    </defs>
    <!-- sombra del marco sobre la pared -->
    <rect x="44" y="38" width="112" height="160" rx="4" transform="translate(3 5)" style="fill:var(--frame-shadow)"/>
    <!-- marco: cara exterior, canto interior (el grosor) y vidrio -->
    <rect x="44" y="38" width="112" height="160" rx="4" style="fill:var(--frame)" stroke="var(--frame-line)" stroke-width="2"/>
    <rect x="51" y="45" width="98" height="149" rx="2" style="fill:var(--frame-in)"/>
    <g clip-path="url(#glass-${s})">
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#sky-${s})"/>
      <g class="day">
        <circle cx="121" cy="80" r="22" fill="url(#sun-${s})"/><circle cx="121" cy="80" r="10.5" fill="#fff4b8"/>
        <g fill="#fff" opacity=".95"><circle cx="74" cy="104" r="6.5"/><circle cx="83" cy="99" r="8.5"/><circle cx="93" cy="105" r="6"/><rect x="70" y="104" width="27" height="7" rx="3.5"/></g>
        <g fill="#fff" opacity=".8"><circle cx="117" cy="140" r="5"/><circle cx="124" cy="136" r="6"/><rect x="113" y="139" width="18" height="5.5" rx="2.7"/></g>
      </g>
      <g class="night">
        <circle cx="122" cy="80" r="20" fill="#cfc4ff" opacity=".18"/>
        <rect x="100" y="58" width="40" height="40" fill="#fff7dc" mask="url(#moon-${s})"/>
        <g fill="#fff"><circle cx="70" cy="66" r="1.3"/><circle cx="86" cy="96" r="1"/><circle cx="68" cy="140" r="1.1"/><circle cx="134" cy="132" r="1.2"/><circle cx="108" cy="64" r=".9"/><circle cx="80" cy="150" r=".8"/></g>
        <path transform="translate(84 74)" d="M0 -4Q.6 -.6 4 0Q.6 .6 0 4Q-.6 .6 -4 0Q-.6 -.6 0 -4Z" fill="#ffe9a8"/>
      </g>
      <path d="M50 172Q78 148 104 164Q124 152 150 162V200H50Z" style="fill:var(--hill)"/>
      <path d="M50 182Q90 166 150 180V200H50Z" style="fill:var(--hill-2)"/>
      <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#reveal-${s})"/>
      <path d="M66 150L94 60M78 158L104 76" stroke="#fff" stroke-width="5" stroke-linecap="round" style="opacity:var(--glare)"/>
    </g>
    <!-- parteluz y travesaño: cuatro paneles -->
    <rect x="${MULLION.x}" y="${y0}" width="${MULLION.w}" height="${y1 - y0}" style="fill:var(--frame)"/>
    <rect x="${x0}" y="${TRANSOM.y}" width="${x1 - x0}" height="${TRANSOM.h}" style="fill:var(--frame)"/>
    <rect x="${x0}" y="${TRANSOM.y + TRANSOM.h}" width="${x1 - x0}" height="1.6" fill="#000" opacity=".08"/>
    <!-- repisón: superficie de arriba, frente y sombra en la pared -->
    <rect x="34" y="204" width="132" height="10" rx="5" style="fill:var(--frame-shadow)" opacity=".8"/>
    <path d="M40 188H160L168 196H32Z" style="fill:var(--sill-top)" stroke="var(--frame-line)" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="30" y="195.5" width="140" height="10" rx="3" style="fill:var(--sill-front)" stroke="var(--frame-line)" stroke-width="1.6"/>
    <!-- barra y cortinas: abiertas (amarradas) y cerradas (al dormir se despliegan desde los lados; style.css) -->
    <g class="cur-open">${curtain(false)}${curtain(true)}</g>
    <g class="cur-closed">${closedPanel(false)}${closedPanel(true)}</g>
    <rect x="10" y="21" width="180" height="6" rx="3" style="fill:var(--rod)" stroke="var(--rod-line)" stroke-width="1.4"/>
    <circle cx="8" cy="24" r="6.5" fill="var(--yellow)" stroke="#e0a516" stroke-width="1.6"/><circle cx="192" cy="24" r="6.5" fill="var(--yellow)" stroke="#e0a516" stroke-width="1.6"/>
  </svg>`;
}

/* ---------- luz: el haz sale de la ventana y su reflejo es la ventana proyectada en el piso ----------
   El ángulo y la proyección los calcula lightPlan (layout.js), igual que en la versión aprobada. Aquí se dibujan,
   dentro del bloque: los cuatro paneles proyectados, menos las cortinas proyectadas igual, y el haz como la
   envolvente entre el contorno del vidrio y su reflejo. */
function hull(points){
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = list => { const h = []; for(const q of list){ while(h.length > 1 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop(); h.push(q); } h.pop(); return h; };
  return [...half(p), ...half(p.reverse())];
}

function lightSvg(L, s, soft){
  const plan = lightPlan(L), W = L.block.w, H = L.block.h;
  const { wall, floor } = plan;
  const g0 = [(wall[0][0] + wall[3][0]) / 2, (wall[0][1] + wall[3][1]) / 2];
  const g1 = floor.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]);
  const blur = Math.max(1.2, W * .0016) * soft;
  return `<svg viewBox="0 0 ${f(W)} ${f(H)}" aria-hidden="true">
    <defs>
      <filter id="blur-a-${s}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f(Math.max(6, W * .012))}"/></filter>
      <filter id="blur-b-${s}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f(blur)}"/></filter>
      <linearGradient id="shaft-${s}" gradientUnits="userSpaceOnUse" x1="${f(g0[0])}" y1="${f(g0[1])}" x2="${f(g1[0])}" y2="${f(g1[1])}">
        <stop offset="0" style="stop-color:rgb(var(--light));stop-opacity:var(--light-shaft)"/><stop offset="1" style="stop-color:rgb(var(--light));stop-opacity:0.08"/></linearGradient>
      <mask id="lit-${s}" maskUnits="userSpaceOnUse" x="0" y="0" width="${f(W)}" height="${f(H)}">
        <path d="${plan.panes.map(poly).join('')}" fill="#fff"/><path d="${plan.curtains.map(poly).join('')}" fill="#000"/>
      </mask>
    </defs>
    <path d="${poly(hull([...wall, ...floor]))}" fill="url(#shaft-${s})" filter="url(#blur-a-${s})"/>
    <g filter="url(#blur-b-${s})"><rect width="${f(W)}" height="${f(H)}" mask="url(#lit-${s})" style="fill:rgb(var(--light));opacity:var(--light-patch)"/></g>
  </svg>`;
}

// Arma los cuartos de la casa en .house-panes (una vez): un panel por cuarto, con sus capas. La pared, su detalle y
// la ventana con su luz son "lejanas" (.far: van más lento en el parallax); el piso, el zócalo y la oscuridad de
// dormir van con la cámara. Las capas de muebles las agrega decor.js.
// Un cuarto suelto (los bocetos de dev, sin .house-panes) solo necesita su ventana de siempre.
// `s` hace únicos los ids de los SVG (puede haber varios cuartos en la misma página).
export function buildPanes(room, s = room.dataset.s || 'room'){
  room.dataset.s = s;
  const host = room.querySelector('.house-panes');
  if(!host){
    const win = room.querySelector('.win');
    if(win) win.innerHTML = windowSvg(s);
    return;
  }
  host.innerHTML = ROOMS.map((r, i) => `<div class="pane" data-room="${r.id}" data-floor="${r.floor}" data-window="${r.window}" style="--i:${i}">
      <div class="room-wall far"></div><div class="wall-deco far"></div><div class="room-floor"></div><div class="room-base"></div>
      <div class="scene pane-scene far"><div class="room-light"></div><div class="win"></div></div>
      <div class="room-night" aria-hidden="true"></div>
    </div>`).join('');
  host.querySelectorAll('.pane').forEach(p=>{
    p.querySelector('.win').innerHTML = p.dataset.window === 'round' ? roundWindowSvg(`${s}-${p.dataset.room}`) : windowSvg(`${s}-${p.dataset.room}`);
  });
}

// Compone la escena para el tamaño actual del cuarto: el bloque (posición y tamaño), el fondo extendido y la luz.
// Se llama al entrar a la Casa, al cambiar de tamaño y al cambiar de modo (la luz de día es más suave).
// `barSpace` = 0 si la barra de acciones va fuera del cuarto (la versión aprobada, en dev).
// La composición del cuarto para su tamaño actual (null si está oculto). La usan la escena y los muebles (decor.js).
export function roomLayout(room){
  const W = room.clientWidth, H = room.clientHeight;
  if(!W || !H) return null;   // cuarto oculto (otra vista)
  const bar = room.dataset.bar === 'outside' ? 0 : parseFloat(getComputedStyle(room).getPropertyValue('--bar-space')) || 84;
  return sceneLayout(W, H, bar);
}

export function layoutRoom(room){
  const L = roomLayout(room);
  if(!L) return;
  const css = getComputedStyle(room);
  const px = n => f(n) + 'px';
  const set = (k, v) => room.style.setProperty(k, v);
  set('--bx', px(L.block.x)); set('--by', px(L.block.y)); set('--bw', px(L.block.w)); set('--bh', px(L.block.h));
  set('--horizon', px(L.horizon)); set('--fb', px(L.fb)); set('--wb', px(L.block.h - L.fb));
  set('--rw', px(L.W));   // ancho de un cuarto: la cámara se mueve de a uno (nav.js)
  room.querySelectorAll('.scene').forEach(scene=>{ scene.dataset.kind = L.kind; });
  const soft = parseFloat(css.getPropertyValue('--light-soft')) || 1;   // de día, bordes más suaves
  // la escena de un solo cuarto (dev) o los paneles de la casa
  const panes = room.querySelectorAll('.pane');
  const targets = panes.length ? [...panes] : [room];
  for(const t of targets){
    const kind = t.dataset.floor || 'planks';
    const floor = t.querySelector('.room-floor');
    if(floor) floor.innerHTML = kind === 'planks' ? floorSvg(L) : tilesSvg(L, kind);
    const light = t.querySelector('.room-light');
    const id = (room.dataset.s || 'room') + (t.dataset.room ? '-' + t.dataset.room : '');
    if(light) light.innerHTML = t.dataset.window === 'round' ? '' : lightSvg(L, id, soft);
  }
}
