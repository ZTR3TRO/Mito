// Comparación de la Casa: versión aprobada (antes de la pantalla completa) y nueva, lado a lado. Solo dev.
// Las dos usan el mismo código (features/house/room.js y style.css): la aprobada es el cuarto del tamaño que
// tenía entonces (el bloque sin extender, con la barra debajo); la nueva llena el área de la vista.
//   /dev/house.html             todos los tamaños, claro y oscuro, con y sin mascota
//   ?size=1440x900|1440x800|390x844|360x740   un tamaño     ?theme=light|dark   un modo
//   ?pet=1|0   con o sin mascota      ?still   sin animaciones (capturas)      ?grid   zonas de la Fase 4
import { previewAvatar } from '../src/features/mascot/avatar.js';
import { buildRoom, layoutRoom } from '../src/features/house/room.js';

const q = new URLSearchParams(location.search);
const themes = q.get('theme') ? [q.get('theme')] : ['light', 'dark'];
const pets = q.get('pet') ? [q.get('pet') === '1'] : [true, false];
// [pantalla, cuarto aprobado (ancho × alto), cuarto nuevo (ancho × alto)]
const SIZES = [
  ['1440x900', [908, 511], [1176, 900]],
  ['1440x800', [908, 511], [1176, 800]],
  ['390x844', [362, 483], [390, 714]],
  ['360x740', [336, 448], [360, 614]],
].filter(([k]) => !q.get('size') || q.get('size') === k);
const WITH_PET = { color: 'c-mint', ropa: 'r-sueter', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-gold', pet: 'p-chick' };
const NO_PET = { color: 'c-mint', ropa: 'r-none', accesorio: 'ac-headphones', sombrero: 's-none', aura: 'a-none', pet: 'p-none' };
const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M9 10v4M15 10v4"/></svg>';
const SAMPLE = [{ x: 22, y: 94, w: 16, r: 1.4, t: 'sofá · piso' }, { x: 84, y: 76, w: 8, r: .45, t: 'planta · piso' }, { x: 66, y: 36, w: 11, r: 1.2, t: 'cuadro · pared' }];
const zones = () => `<div class="zones">${SAMPLE.map(s => `<div class="ph" style="left:${s.x}%;top:${s.y}%;width:${s.w}%;aspect-ratio:${s.r}">${s.t}</div>`).join('')}<div class="home"></div></div>`;

let n = 0;
const jobs = [];
const room = (w, h, approved, look) => {
  const s = ++n, id = `mito-${s}`;
  jobs.push([id, look]);
  const bar = `<div class="house-bar"><button class="house-act" type="button">${ICON}Armario</button></div>`;
  return `<div class="cmp-room ${approved ? 'approved' : ''}" style="width:${w}px">
    <div class="house" style="width:${w}px;height:${h}px">
      <div class="room" data-s="r${s}"${approved ? ' data-bar="outside"' : ''}>
        <div class="room-wall"></div><div class="room-floor"></div><div class="room-base"></div>
        <div class="scene">
          <div class="room-light"></div><div class="win"></div>
          <div class="room-stage">
            <div class="contact contact-mito"></div><div class="contact contact-pet"></div>
            <div class="mascot face-normal" id="${id}"><svg class="mito" viewBox="0 0 150 150"></svg></div>
          </div>
          ${zones()}
        </div>
        ${approved ? '' : bar}
      </div>
    </div>
    ${approved ? `<div class="approved-bar">${bar}</div>` : ''}
  </div>`;
};

const root = document.getElementById('root');
for(const theme of themes){
  const panel = document.createElement('section');
  panel.className = 'panel' + (q.has('still') ? ' still' : '') + (q.has('grid') ? ' show-grid' : '');
  panel.dataset.theme = theme;
  let html = `<h1>Casa de Mito · ${theme === 'dark' ? 'noche (modo oscuro)' : 'día (modo claro)'}</h1>`;
  for(const [label, [aw, ah], [nw, nh]] of SIZES) for(const pet of pets){
    const look = pet ? WITH_PET : NO_PET;
    html += `<h2>${label} · ${pet ? 'con mascota y aura' : 'sin mascota'}</h2><div class="pair">
      <div><div class="lbl">Aprobada · ${aw} × ${ah}</div>${room(aw, ah, true, look)}</div>
      <div><div class="lbl">Nueva · ${nw} × ${nh}</div>${room(nw, nh, false, look)}</div></div>`;
  }
  panel.innerHTML = html;
  root.appendChild(panel);
}
document.querySelectorAll('.room').forEach(r => buildRoom(r));
for(const [id, look] of jobs) previewAvatar('color', look.color, id, look);
const ro = new ResizeObserver(entries => entries.forEach(e => layoutRoom(e.target)));
document.querySelectorAll('.room').forEach(r => ro.observe(r));
requestAnimationFrame(()=> requestAnimationFrame(()=>{ document.body.dataset.ready = '1'; }));
