// Fase 5 · BOCETOS (solo dev; propuesta): /dev/house.html?rooms
//   los cuatro cuartos (Cuarto · Baño · Sala · Cocina), la transición entre dos (con parallax), llevar a Mito a la
//   orilla, Mito sobre la cama y sobre el sofá, y los indicadores. Escritorio (1176 × 900) y móvil (390 × 714),
//   claro (día) y oscuro (noche).
//   ?theme=light|dark   ?size=390|1176   ?state=rooms|move|edge|bed|sofa   ?still
import { previewAvatar } from '../src/features/mascot/avatar.js';
import { buildPanes, layoutRoom } from '../src/features/house/room.js';
import { sceneLayout, FLOOR, floorRowY, floorX, toRoomX, toRoomY } from '../src/features/house/layout.js';
import { FURNITURE, FURNITURE_SIZE } from '../src/content/furniture.js';
import { FURNITURE_ART, FURNITURE_DEFS } from '../src/content/art/furniture.js';
import { furnitureBox, clampSpot, depthOrder } from '../src/features/house/furniture-layout.js';

const q = new URLSearchParams(location.search);
const themes = q.get('theme') ? [q.get('theme')] : ['light', 'dark'];
const SIZES = [['1176', 1176, 900, 'Escritorio · 1440 × 900'], ['390', 390, 714, 'Móvil · 390 × 844']].filter(([k]) => !q.get('size') || q.get('size') === k);
const want = k => !q.get('state') || q.get('state') === k;
const ITEMS = FURNITURE;
const item = id => ITEMS.find(x => x.id === id);
const ART = FURNITURE_ART;
const LOOK = { color: 'c-mint', ropa: 'r-sueter', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-none', pet: 'p-chick' };

/* ---------- los cuartos (propuesta de content/rooms.js) ---------- */
const I = {
  bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10.5" r="1.6"/></svg>',
  bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v1.5A5.5 5.5 0 0 1 14.5 19h-5A5.5 5.5 0 0 1 4 13.5Z"/><path d="M6 12V6.5a2.2 2.2 0 0 1 4-1.3"/><path d="M7.5 19l-1 2M16.5 19l1 2"/></svg>',
  sofa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2.5 13a2 2 0 0 1 4 0v1.5h11V13a2 2 0 0 1 4 0v5H2.5Z"/><path d="M5 18v2M19 18v2"/></svg>',
  pot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/></svg>',
  eat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/></svg>',
  sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  wardrobe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M9 10v4M15 10v4"/></svg>',
  decor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
};
I.bathAct = I.bath;
// Orden de izquierda a derecha. Agregar el patio = una entrada más (y su fondo).
const ROOMS = [
  { id: 'bedroom', name: 'Cuarto', icon: I.bed,  action: ['sleep', 'Dormir', I.sleep],  floor: 'planks', window: 'rect' },
  { id: 'bath',    name: 'Baño',   icon: I.bath, action: ['bath', 'Bañar', I.bathAct],   floor: 'tiles',  window: 'round' },
  { id: 'living',  name: 'Sala',   icon: I.sofa, action: null,                           floor: 'planks', window: 'rect' },
  { id: 'kitchen', name: 'Cocina', icon: I.pot,  action: ['eat', 'Comer', I.eat],        floor: 'checker', window: 'rect' },
];
const roomOf = id => ROOMS.find(r => r.id === id);

// Dónde puso las cosas "la persona" en cada cuarto (u, v de la Fase 4; el mismo para escritorio y móvil).
const PLACED = {
  bedroom: { 'm-rug': [.5, .46], 'm-bed': [.2, .22], 'm-bookcase': [.92, .1], 'm-lamp': [.78, .26], 'm-plant': [.05, .7], 'm-picture': [.52, .38], 'm-clock': [.7, .3], 'm-lights': [.5, .02] },
  bath:    { 'm-bathmat': [.5, .5], 'm-tub': [.24, .2], 'm-toilet': [.86, .22], 'm-sink': [.68, .1], 'm-mirror': [.68, .42], 'm-towels': [.9, .5] },
  living:  { 'm-couch': [.32, .18], 'm-tv': [.84, .16], 'm-pouf': [.66, .82], 'm-cushion': [.12, .86], 'm-art': [.56, .36], 'm-hanger': [.92, .06], 'm-plant': [.04, .4] },
  kitchen: { 'm-table': [.28, .5], 'm-fridge': [.93, .06], 'm-stove': [.75, .1], 'm-cupboard': [.74, .3] },
};

/* ---------- piso de mosaico (Cocina: ajedrez; Baño: mosaico chico), con la ley de perspectiva del piso ---------- */
function tilesSvg(L, kind){
  const H = L.H - L.horizon, yMax = H / L.fb * 100;
  const xMin = -L.block.x / L.block.w * 100, xMax = (L.W - L.block.x) / L.block.w * 100;
  const X = (u, y) => toRoomX(L, floorX(u, y)), Y = y => toRoomY(L, y) - L.horizon;
  const T = kind === 'checker' ? 26 : 15, rows = kind === 'checker' ? 1 : 2;   // ancho de la baldosa (u) y filas por fila del piso
  const f = n => n.toFixed(1);
  let tiles = '', grout = '';
  const rowY = i => floorRowY(i / rows);
  for(let r = 0; rowY(r) < yMax; r++){
    const ya = rowY(r), yb = rowY(r + 1);
    const first = Math.floor((xMin - 50) / T) - 3;
    for(let k = first, ua = 50 + first * T; floorX(ua, ya) < xMax + T; k++, ua += T){
      const ub = ua + T;
      const tone = kind === 'checker' ? ((r + k) % 2 ? 1 : 2) : 1 + ((r * 3 + k * 7) % 5 === 0 ? 1 : 0);
      tiles += `<path d="M${f(X(ua, ya))} ${f(Y(ya))}L${f(X(ub, ya))} ${f(Y(ya))}L${f(X(ub, yb))} ${f(Y(yb))}L${f(X(ua, yb))} ${f(Y(yb))}Z" fill="var(--tile-${tone})"/>`;
      grout += `<path d="M${f(X(ub, ya))} ${f(Y(ya))}L${f(X(ub, yb))} ${f(Y(yb))}"/>`;
    }
    if(r) grout += `<path d="M0 ${f(Y(ya))}H${f(L.W)}"/>`;
  }
  return `<svg viewBox="0 0 ${f(L.W)} ${f(H)}" aria-hidden="true">${tiles}<g stroke="var(--grout)" stroke-width="1.4" fill="none">${grout}</g></svg>`;
}

/* ---------- ventana redonda del Baño (vidrio esmerilado; mismo viewBox 200 × 250 que la de siempre) ---------- */
const PORTHOLE = s => `<svg viewBox="0 0 200 250" aria-hidden="true">
  <defs><clipPath id="ph-${s}"><circle cx="100" cy="104" r="50"/></clipPath>
    <linearGradient id="phsky-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)"/><stop offset="1" style="stop-color:var(--sky-2)"/></linearGradient>
    <radialGradient id="phfrost-${s}" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></radialGradient></defs>
  <circle cx="104" cy="110" r="66" style="fill:var(--frame-shadow)"/>
  <circle cx="100" cy="104" r="66" style="fill:var(--frame)" stroke="var(--frame-line)" stroke-width="2"/>
  <circle cx="100" cy="104" r="56" style="fill:var(--frame-in)"/>
  <g clip-path="url(#ph-${s})">
    <rect x="40" y="44" width="120" height="120" fill="url(#phsky-${s})"/>
    <g class="day"><circle cx="120" cy="80" r="11" fill="#fff4b8"/><g fill="#fff" opacity=".9"><circle cx="80" cy="112" r="7"/><circle cx="90" cy="106" r="9"/><rect x="74" y="111" width="28" height="7" rx="3.5"/></g></g>
    <g class="night"><rect x="98" y="62" width="40" height="40" fill="#fff7dc" mask="url(#moon-${s})"/><g fill="#fff"><circle cx="74" cy="80" r="1.2"/><circle cx="86" cy="128" r="1"/><circle cx="130" cy="124" r="1.1"/></g></g>
    <rect x="40" y="44" width="120" height="120" fill="url(#phfrost-${s})"/>
    <path d="M70 134L118 70" stroke="#fff" stroke-width="6" stroke-linecap="round" style="opacity:var(--glare)"/>
  </g>
  <mask id="moon-${s}"><circle cx="120" cy="82" r="11" fill="#fff"/><circle cx="126" cy="77" r="9" fill="#000"/></mask>
  <g fill="var(--frame-line)"><circle cx="100" cy="42" r="3.4"/><circle cx="162" cy="104" r="3.4"/><circle cx="100" cy="166" r="3.4"/><circle cx="38" cy="104" r="3.4"/></g>
</svg>`;

/* ---------- un cuarto ---------- */
let n = 0;
const jobs = [];
// opts: { held: [dx, dy] (Mito en la mano), on: id del mueble donde está, asleep, edge: 'left'|'right' con progreso, bubble, chip }
function room(w, h, roomId, opts = {}){
  const s = ++n, id = `rm-${s}`;
  jobs.push(id);
  const L = sceneLayout(w, h, w < 460 ? 76 : 84);
  const R = roomOf(roomId);
  const list = Object.entries(PLACED[roomId]).map(([fid, [u, v, flip]]) => ({ item: item(fid), p: clampSpot(L, item(fid), { u, v, flip }) }));
  const box = e => furnitureBox(L, e.item, e.p);
  const piece = e => { const b = box(e); return `<div class="furn ${e.item.zone}${e.p.flip ? ' is-flip' : ''}" style="left:${b.x.toFixed(1)}px;top:${b.y.toFixed(1)}px;width:${b.w.toFixed(1)}px;height:${b.h.toFixed(1)}px"><span class="furn-art">${ART[e.item.id]}</span></div>`; };
  const rugs = list.filter(e => e.item.flat).map(piece).join('');
  const rest = depthOrder(list.filter(e => !e.item.flat)).map(piece).join('');

  // Mito sobre un mueble: los pies en su superficie, con la perspectiva de la base del mueble
  let mitoStyle = '', seatShadow = '', petHost = '';
  if(opts.on){
    const e = list.find(x => x.item.id === opts.on), b = box(e);
    const seat = e.item.seat[0];
    const k = b.w / (e.item.size * L.block.w * FURNITURE_SIZE[L.kind]);
    const [x0, x1] = e.p.flip ? [1 - seat.x[1], 1 - seat.x[0]] : seat.x;
    const cx = b.x + b.w * (x0 + (x1 - x0) * (opts.at ?? .5)), cy = b.y + b.h * seat.y;
    mitoStyle = `left:${(cx - L.block.x).toFixed(1)}px;top:${(cy - L.block.y).toFixed(1)}px;width:calc(var(--mito) * ${k.toFixed(3)} * ${opts.small || 1});height:calc(var(--mito) * ${k.toFixed(3)} * ${opts.small || 1})`;
    seatShadow = `<i class="seat-shadow" style="left:${cx.toFixed(1)}px;top:${cy.toFixed(1)}px;width:${(L.mito * k * .7).toFixed(1)}px"></i>`;
    // la mascota baja al piso, frente al mueble y del lado libre
    const px = Math.min(L.W - L.mito * .3, Math.max(L.mito * .6, b.x + b.w * (e.p.flip ? .15 : .85) + L.mito * .45)), py = Math.min(L.H - L.barSpace - 8, b.base + L.fb * .18);
    jobs.push(id + '-pet');
    petHost = `<div class="mascot pet-only" id="${id}-pet" style="left:${(px - L.block.x).toFixed(1)}px;top:${(py - L.block.y).toFixed(1)}px"><svg class="mito" viewBox="0 0 150 150"></svg></div>`;
  }
  const held = opts.held ? ` is-held" style="--fly-x:${opts.held[0]}px;--fly-y:${opts.held[1]}px;--lift:.6` : '';
  const action = R.action ? `<button class="house-act${opts.asleep ? ' is-on' : ''}" type="button">${R.action[2]}<span>${opts.asleep ? 'Despertar' : R.action[1]}</span></button>` : '';
  const chip = opts.chip ? `<button class="house-act go-chip" type="button">${I.pot}<span>${opts.chip}</span></button>` : '';
  const bar = `<div class="house-bar" role="toolbar">${action}${chip}<button class="house-act" type="button">${I.decor}<span>Decorar</span></button><button class="house-act" type="button">${I.wardrobe}<span>Armario</span></button></div>`;
  const idx = ROOMS.indexOf(R), prev = ROOMS[idx - 1], next = ROOMS[idx + 1];
  const arrows = `${prev ? `<button class="room-arrow left" type="button" aria-label="Ir a ${prev.name}">${I.left}<span>${prev.name}</span></button>` : ''}
    ${next ? `<button class="room-arrow right" type="button" aria-label="Ir a ${next.name}">${I.right}<span>${next.name}</span></button>` : ''}`;
  const dots = `<nav class="room-dots" aria-label="Cuartos">${ROOMS.map(r => `<button type="button" class="rd${r.id === roomId ? ' is-here' : ''}${opts.mitoIn === r.id ? ' has-mito' : ''}" aria-label="${r.name}">${r.icon}<span>${r.name}</span></button>`).join('')}</nav>`;
  const edge = opts.edge ? `<div class="edge-go ${opts.edge}" style="--p:${opts.progress || .6}"><i></i>${opts.edge === 'right' ? I.right : I.left}<b>${(opts.edge === 'right' ? next : prev).name}</b></div>` : '';
  const ui = { arrows, dots, bar };
  if(opts.ui) Object.assign(opts.ui, ui);
  return `<div class="room${opts.noMito ? ' no-mito' : ''}" data-s="r${s}" data-room="${roomId}"${opts.asleep ? ' data-asleep' : ''} data-floor="${R.floor}" data-window="${R.window}">
      <div class="room-wall"></div><div class="wall-deco"></div><div class="room-floor"></div><div class="room-base"></div>
      <div class="room-rugs">${rugs}</div><div class="room-furn">${rest}</div>${seatShadow}
      <div class="scene">
        <div class="room-light"></div><div class="win"></div>
        <div class="room-stage${opts.on ? ' on-furn' : ''}">
          ${opts.noMito ? '' : `<div class="contact contact-mito"></div><div class="contact contact-pet"></div>`}
          <div class="mascot face-${opts.face || 'normal'}${held}" id="${id}"${mitoStyle ? ` style="${mitoStyle}"` : ''}><svg class="mito" viewBox="0 0 150 150"></svg></div>${petHost}
        </div>
        <div class="zzz" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></div>
      </div>
      <div class="room-night"></div>
      ${opts.bubble ? `<div class="house-speech show sk-say">${opts.bubble}</div>` : ''}
      ${opts.toast ? `<div class="room-toast">${R.icon}${R.name}</div>` : ''}
      ${opts.bare ? '' : arrows + edge + dots + bar}
    </div>`;
}
const frame = (w, h, inner, extra = '') => `<div class="cmp-room" style="width:${w}px"><div class="house" style="width:${w}px;height:${h}px">${inner}</div></div>${extra}`;

/* ---------- transición entre dos cuartos: la cámara a medio camino, con parallax ----------
   El piso y los muebles del piso van a la velocidad de la cámara; la pared, la ventana y lo colgado, más lento
   (×0.8, se ven "más lejos"); el marco de la puerta entre los dos cuartos, más rápido (×1.18, "más cerca"). */
const WALL_K = .8, FRONT_K = 1.18;
function transition(w, h, a, b, t){
  const c = t * w;
  // la barra, los indicadores y las flechas no se mueven con la cámara: van encima (ya del cuarto al que se llega)
  const ui = {};
  const ra = room(w, h, a, { bare: true }), rb = room(w, h, b, { bare: true, noMito: true, toast: true, ui, mitoIn: a });
  const wallShift = (1 - WALL_K) * c;   // la pared se queda atrás: se corre a la derecha respecto a su cuarto
  return `<div class="cam" style="width:${w}px;height:${h}px">
    <div class="track" style="width:${w * 2}px;transform:translateX(${-c}px);--wall-shift:${wallShift.toFixed(1)}px">${ra}${rb}</div>
    <div class="door-frame" style="left:${(w - FRONT_K * c - 22).toFixed(1)}px"></div>
    <div class="cam-ui" style="--bar-space:${w < 460 ? 76 : 84}px">${ui.dots}${ui.bar}</div>
    <div class="cam-note">cámara al ${Math.round(t * 100)} % · pared ×${WALL_K} · piso ×1 · marco ×${FRONT_K}</div>
  </div>`;
}

export function renderRooms(root){
  document.body.insertAdjacentHTML('afterbegin', FURNITURE_DEFS);
  for(const theme of themes){
    const panel = document.createElement('section');
    panel.className = 'panel rooms-sketch' + (q.has('still') ? ' still' : '');
    panel.dataset.theme = theme;
    const night = theme === 'dark';
    let html = `<h1>Fase 5 · varios cuartos y Mito libre · ${night ? 'noche (oscuro)' : 'día (claro)'}</h1>`;
    for(const [k, w, h, label] of SIZES){
      if(want('rooms')){
        html += `<h2>${label} · los cuatro cuartos (de izquierda a derecha)</h2><div class="pair needs">`;
        for(const r of ROOMS) html += `<div data-sk="rooms-${r.id}-${k}"><div class="lbl">${r.name}</div>${frame(w, h, room(w, h, r.id, { mitoIn: 'bedroom' }))}</div>`;
        html += '</div>';
      }
      html += `<h2>${label} · moverse y Mito libre</h2><div class="pair needs">`;
      if(want('move')) html += `<div data-sk="move-${k}"><div class="lbl">Transición Cuarto → Baño (parallax)</div>${frame(w, h, transition(w, h, 'bedroom', 'bath', .42))}</div>`;
      if(want('edge')) html += `<div data-sk="edge-${k}"><div class="lbl">Mito en la orilla: mantenerlo avanza de cuarto</div>${frame(w, h, room(w, h, 'living', { held: [w * (k === '390' ? .3 : .37), -h * .08], edge: 'right', progress: .62, face: 'happy' }))}</div>`;
      if(want('bed')) html += `<div data-sk="bed-${k}"><div class="lbl">${night ? 'Dormido en la cama (al dormir se acuesta en ella)' : 'Mito sobre la cama'}</div>${frame(w, h, room(w, h, 'bedroom', { on: 'm-bed', at: .4, asleep: night, face: night ? 'normal' : 'happy' }))}</div>`;
      if(want('sofa')) html += `<div data-sk="sofa-${k}"><div class="lbl">Sobre el sofá · con hambre en la Sala: invita a la Cocina</div>${frame(w, h, room(w, h, 'living', { on: 'm-couch', at: .55, bubble: '¿Vamos a la Cocina? 🍎', chip: 'Cocina' }))}</div>`;
      html += '</div>';
    }
    panel.innerHTML = html;
    root.appendChild(panel);
  }
  const rooms = [...root.querySelectorAll('.rooms-sketch .room')];
  rooms.forEach(r => {
    buildPanes(r);
    if(r.dataset.window === 'round') r.querySelector('.win').innerHTML = PORTHOLE(r.dataset.s);
    if(r.hasAttribute('data-asleep')) r.classList.add('is-asleep');
  });
  for(const id of jobs) previewAvatar('color', LOOK.color, id, LOOK);
  // el piso de mosaico va después de componer (layoutRoom dibuja duela)
  const paint = r => {
    layoutRoom(r);
    if(r.dataset.floor !== 'planks'){
      const L = sceneLayout(r.clientWidth, r.clientHeight, parseFloat(getComputedStyle(r).getPropertyValue('--bar-space')) || 84);
      r.querySelector('.room-floor').innerHTML = tilesSvg(L, r.dataset.floor);
    }
  };
  const ro = new ResizeObserver(es => es.forEach(e => paint(e.target)));
  rooms.forEach(r => ro.observe(r));
}
