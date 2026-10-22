// Muebles de la Casa (datos puros): se compran en la Tienda (una sola vez cada uno) y se colocan donde quieras en Decorar.
// Los dibujos están en content/art/furniture.js, con la misma clave.
//
//   zone      'wall' (cuadros, reloj…) o 'floor' (el resto): dónde se puede poner
//   cost      chispas (0 = regalo)
//   gift      el regalo de su cuarto: se entrega la primera vez que se entra a ese cuarto, ya colocado en { u, v }
//             ('mito': debajo de Mito, como la alfombra del Cuarto)
//   size      ancho en el cuarto, como fracción del ancho del bloque de la escena (ver features/house/furniture-layout.js)
//   box       proporción del dibujo [ancho, alto] (la misma que su viewBox)
//   flat      alfombra: va pegada al piso, siempre detrás de los demás muebles del piso
//   flip      se puede voltear de izquierda a derecha (los simétricos no)
//   glow      se enciende de noche (modo oscuro) y se apaga cuando Mito duerme
//   room      el cuarto al que pertenece en la Tienda y en el regalo (content/rooms.js); se puede poner en cualquiera
//   seat      dónde se puede sentar ('sit'), acostar ('lie') o meter ('in') Mito: y = altura de la superficie y
//             x = [desde, hasta], en fracciones del dibujo (x se refleja si está volteado). Puede haber varias.
//
// Los muebles para sentarse o acostarse tienen un tamaño base grande, para que Mito quepa encima (Fase 5): su
// superficie mide cerca de 3/4 del ancho del cuerpo de Mito. Si la
// usuaria les había cambiado el tamaño, ese tamaño es relativo al base (scale) y se conserva.

export const FURNITURE_SIZE = { wide: 1, tall: 2.1 };   // ajuste del tamaño según el bloque (el alto es el del teléfono)
// Tamaño ajustable en Decorar (× el tamaño base): de min a max, con botones de step en step, y "se pega" al 100 %
// cuando queda a menos de snap (al estirar con la manija o al pellizcar).
export const FURNITURE_SCALE = { min: .6, max: 1.6, step: .1, snap: .05 };

const M = (id, name, short, zone, cost, size, box, room, extra = {}) => ({ id, name, short, zone, cost, size, box, room, ...extra });
const sit = (y, x0, x1) => ({ kind: 'sit', y, x: [x0, x1] });

export const FURNITURE = [
  M('m-rug',      'Alfombra de lunares', 'Alfombra', 'floor', 0,   .27,  [160, 66],  'bedroom', { flat: true, gift: 'mito' }),
  M('m-cushion',  'Cojín grande',        'Cojín',    'floor', 150, .14,  [92, 68],   'living',  { seat: [sit(.22, .14, .86)] }),
  M('m-plant',    'Planta de interior',  'Planta',   'floor', 170, .065, [80, 134],  'living',  {}),
  M('m-lamp',     'Lámpara de pie',      'Lámpara',  'floor', 240, .055, [74, 176],  'bedroom', { flip: true, glow: true }),
  M('m-bookcase', 'Librero',             'Librero',  'floor', 320, .115, [104, 176], 'bedroom', { flip: true }),
  M('m-sofa',     'Sillón',              'Sillón',   'floor', 300, .25,  [156, 92],  'living',  { flip: true, seat: [sit(.5, .2, .8)] }),
  M('m-desk',     'Escritorio con silla', 'Escritorio', 'floor', 380, .34,  [176, 150], 'bedroom', { flip: true, seat: [sit(.66, .72, .98)] }),
  M('m-bed',      'Cama',                'Cama',     'floor', 400, .36,  [196, 112], 'bedroom', { flip: true, seat: [{ kind: 'lie', y: .36, x: [.12, .9] }] }),
  M('m-picture',  'Cuadro de montañas',  'Cuadro',   'wall',  150, .1,   [96, 74],   'bedroom', {}),
  M('m-clock',    'Reloj de pared',      'Reloj',    'wall',  160, .055, [66, 66],   'kitchen', {}),
  M('m-shelf',    'Repisa con libros',   'Repisa',   'wall',  200, .13,  [136, 74],  'living',  { flip: true }),
  M('m-lights',   'Guirnalda de luces',  'Guirnalda', 'wall', 220, .21,  [200, 56],  'bedroom', { glow: true }),

  // Cocina
  M('m-table',    'Mesa con sillas',  'Mesa',      'floor', 0,   .42,  [190, 128], 'kitchen', { gift: { u: .3, v: .5 }, flip: true, seat: [sit(.66, .04, .25), sit(.66, .75, .96)] }),
  M('m-fridge',   'Refrigerador',     'Refri',     'floor', 320, .105, [92, 192],  'kitchen', { flip: true }),
  M('m-stove',    'Estufa con horno', 'Estufa',    'floor', 300, .12,  [112, 132], 'kitchen', {}),
  M('m-cupboard', 'Alacena',          'Alacena',   'wall',  200, .15,  [140, 84],  'kitchen', {}),
  // Baño
  M('m-bathmat',  'Tapete de baño',   'Tapete',    'floor', 0,   .19,  [140, 52],  'bath',    { gift: { u: .5, v: .55 }, flat: true }),
  M('m-tub',      'Tina',             'Tina',      'floor', 380, .3,   [204, 116], 'bath',    { flip: true, seat: [{ kind: 'in', y: .46, x: [.14, .84] }] }),
  M('m-toilet',   'Inodoro',          'Inodoro',   'floor', 220, .14,  [96, 124],  'bath',    { flip: true, seat: [sit(.46, .12, .88)] }),
  M('m-sink',     'Lavabo',           'Lavabo',    'floor', 240, .085, [92, 146],  'bath',    { flip: true }),
  M('m-mirror',   'Espejo',           'Espejo',    'wall',  180, .065, [72, 98],   'bath',    {}),
  M('m-towels',   'Toallero',         'Toallas',   'wall',  150, .1,   [112, 74],  'bath',    {}),
  // Sala
  M('m-pouf',     'Puf',              'Puf',       'floor', 0,   .14,  [92, 66],   'living',  { gift: { u: .66, v: .8 }, seat: [sit(.2, .12, .88)] }),
  M('m-couch',    'Sofá grande',      'Sofá',      'floor', 400, .36,  [232, 112], 'living',  { flip: true, seat: [sit(.5, .14, .86)] }),
  M('m-tv',       'Tele con mueble',  'Tele',      'floor', 380, .16,  [172, 152], 'living',  {}),
  M('m-art',      'Cuadro abstracto', 'Cuadro',    'wall',  160, .12,  [124, 84],  'living',  { flip: true }),
  M('m-hanger',   'Maceta colgante',  'Colgante',  'wall',  170, .06,  [76, 128],  'living',  {}),
];

export const findFurniture = id => FURNITURE.find(f => f.id === id) || null;
