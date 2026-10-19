// Composición del cuarto (lógica pura, sin DOM: se prueba en Node).
//
// La escena aprobada (dev/house.html antes de la pantalla completa) es un BLOQUE que no se modifica: Mito, la
// mascota, la ventana, el haz y su reflejo, con sus proporciones y su relación entre ellos. Hay dos bloques:
// el ancho (16:9, escritorio) y el alto (3:4, teléfono). El bloque se escala de forma uniforme para caber en el
// espacio disponible ("contain"), dejando abajo el sitio de la barra de acciones, así Mito nunca se ve más
// grande, en proporción al cuarto, que en la versión aprobada. Lo que sobra se llena extendiendo el fondo: más
// pared (con sus lunares) arriba y a los lados, y más piso hacia abajo y a los lados, con las mismas tablas y
// la misma perspectiva de la versión aprobada, sin cortes.
//
// Coordenadas: px del cuarto. Dentro del bloque, todo se mide como en la versión aprobada: en % o en
// fracciones de su ancho (bw) y alto (bh).

export const BLOCKS = {
  //        proporción    piso      Mito (× bw)  lugar de casa      ventana (× bw / × bh)
  wide: { aspect: 16 / 9, floor: .34, mito: .21, home: [.5, .86], win: { x: .06, y: .05, w: .22 } },
  tall: { aspect: 3 / 4, floor: .36, mito: .44, home: [.5, .84], win: { x: .55, y: .05, w: .40 } },
};
const BOTTOM_SHARE = .4;   // del espacio que sobra en vertical (fuera de la barra), cuánto va abajo (más piso)

// barSpace: alto (px) que se reserva abajo para la barra de acciones (0 si la barra va fuera del cuarto).
export function sceneLayout(W, H, barSpace = 84){
  W = Math.max(1, W || 0); H = Math.max(1, H || 0);
  const kind = W / H < 1 ? 'tall' : 'wide';
  const B = BLOCKS[kind];
  const room = Math.max(1, H - barSpace);
  const bw = Math.min(W, room * B.aspect), bh = bw / B.aspect;
  const extra = Math.max(0, room - bh);
  const by = extra * (1 - BOTTOM_SHARE);
  const bx = (W - bw) / 2;
  const fb = bh * B.floor;                       // alto del piso dentro del bloque
  const horizon = by + bh - fb;                  // el zócalo (pared ↔ piso), en px del cuarto
  const mito = bw * B.mito;
  return {
    W, H, kind, barSpace,
    block: { x: bx, y: by, w: bw, h: bh },
    horizon, fb, mito,
    home: { x: bx + bw * B.home[0], y: by + bh * B.home[1] },
    win: { x: bw * B.win.x, y: bh * B.win.y, w: bw * B.win.w },   // dentro del bloque
  };
}

/* ---------- piso: la perspectiva de la versión aprobada, extendida a todo el cuarto ----------
   En la versión aprobada el piso del bloque se dibujaba en % (x de 0 a 100 en su ancho, y de 0 a 100 en su
   alto): las filas de tablas iban en y = 100 · (i / 8)^1.4 y una posición u se veía en
   x = 50 + (u − 50) · (y + 260) / 260. Aquí se usa exactamente eso, pero sin cortar en los bordes del bloque:
   las filas siguen hacia abajo con la misma ley y las tablas siguen a los lados. */
export const FLOOR = { rows: 8, power: 1.4, persp: 260, plank: 34 };
export const floorRowY = i => 100 * (Math.max(0, i) / FLOOR.rows) ** FLOOR.power;   // % del piso del bloque
export const floorX = (u, y) => 50 + (u - 50) * (y + FLOOR.persp) / FLOOR.persp;    // % del ancho del bloque
// % del bloque → px del cuarto
export const toRoomX = (L, x) => L.block.x + L.block.w * x / 100;
export const toRoomY = (L, y) => L.horizon + L.fb * y / 100;

/* ---------- luz: la de la versión aprobada, ligada a la ventana ----------
   Rayos paralelos entran por el vidrio: un punto de la pared a altura h sobre el piso cae a la profundidad
   h · kz y se corre de lado h · kx; luego se ve con la perspectiva del piso. Es una transformación proyectiva:
   la ventana proyectada conserva sus cuatro paneles (parteluz y travesaño en su sitio). El borde de arriba del
   vidrio cae al 88 % de la profundidad del piso, y la luz se corre hacia el centro del cuarto, pero el reflejo
   no llega al cuerpo de Mito (si no cabe, el ángulo se ajusta; la forma no cambia).
   Todo en px del BLOQUE (el SVG de la luz va dentro de él). */
export const GLASS = { x0: 58, x1: 142, y0: 52, y1: 188 };     // vidrio dentro del SVG de la ventana (200 × 250)
export const PANES = [
  [GLASS.x0, 97.5, GLASS.y0, 117.5], [102.5, GLASS.x1, GLASS.y0, 117.5],
  [GLASS.x0, 97.5, 122.5, GLASS.y1], [102.5, GLASS.x1, 122.5, GLASS.y1],
];
// Silueta de la cortina (izquierda; la derecha es su reflejo): la luz que tapa no llega al piso.
export const CURTAIN = 'M16 27H63Q61 95 43 146Q50 186 50 222H12Q13 186 22 146Q16 95 16 27Z';
const LIGHT = { cam: 3, persp: 260, topAt: 88, kx: .6 };

// Puntos de un trazado con M, H, Q y Z (los únicos que usa la cortina).
function samplePath(d, steps = 12){
  const t = d.match(/[MHQZ]|-?\d*\.?\d+/g), pts = [];
  let i = 0, x = 0, y = 0, cmd = '';
  const n = () => parseFloat(t[i++]);
  while(i < t.length){
    if(/[MHQZ]/.test(t[i])) cmd = t[i++];
    if(cmd === 'M'){ x = n(); y = n(); pts.push([x, y]); }
    else if(cmd === 'H'){ x = n(); pts.push([x, y]); }
    else if(cmd === 'Q'){
      const cx = n(), cy = n(), ex = n(), ey = n();
      for(let s = 1; s <= steps; s++){
        const k = s / steps, a = (1 - k) ** 2, b = 2 * (1 - k) * k, c = k * k;
        pts.push([a * x + b * cx + c * ex, a * y + b * cy + c * ey]);
      }
      x = ex; y = ey;
    } else if(cmd === 'Z') break;
  }
  return pts;
}
const CURTAIN_PTS = samplePath(CURTAIN);

export function lightPlan(L){
  const B = BLOCKS[L.kind], W = L.block.w, H = L.block.h;
  const k = L.win.w / 200;
  const toBlock = ([x, y]) => [L.win.x + x * k, L.win.y + y * k];
  const yb = H * (1 - B.floor), FH = H - yb, cx = W / 2, c0 = LIGHT.cam * FH;
  const zTop = c0 * (1 - 1 / (1 + LIGHT.topAt / LIGHT.persp));
  const kz = zTop / (yb - toBlock([0, GLASS.y0])[1]);
  const scale = h => 1 / (1 - h * kz / c0);
  const project = ([x, y], kx) => { const h = yb - y, s = scale(h); return [cx + (x + h * kx - cx) * s, yb + LIGHT.persp * (s - 1) / 100 * FH]; };

  // Mito en su lugar, dentro del bloque
  const mitoLeft = W * B.home[0] - L.mito / 2, mitoRight = mitoLeft + L.mito;
  const wall = [[GLASS.x0, GLASS.y0], [GLASS.x1, GLASS.y0], [GLASS.x0, GLASS.y1], [GLASS.x1, GLASS.y1]].map(toBlock);
  const onRight = (wall[0][0] + wall[1][0]) / 2 > cx;
  const limit = onRight ? mitoRight - L.mito * .12 : mitoLeft + L.mito * .12;
  let kx = (onRight ? -1 : 1) * LIGHT.kx;
  wall.forEach(([x, y], i) => {
    if(onRight ? i % 2 : !(i % 2)) return;     // los bordes del lado de Mito
    const h = yb - y, need = ((limit - cx) / scale(h) - (x - cx)) / h;
    kx = onRight ? Math.max(kx, need) : Math.min(kx, need);
  });
  kx = Math.max(-1, Math.min(1, kx));
  const P = pt => project(toBlock(pt), kx);
  return {
    kx, wall, P,
    floor: wall.map(([x, y]) => project([x, y], kx)),
    panes: PANES.map(([a, b, c, d]) => [[a, c], [b, c], [b, d], [a, d]].map(P)),
    curtains: [CURTAIN_PTS, CURTAIN_PTS.map(([x, y]) => [200 - x, y])].map(pts => pts.map(P)),
  };
}
