// Muebles de la Casa (datos puros): se compran en la Tienda (una sola vez cada uno) y se colocan donde quieras en Decorar.
// Los dibujos están en content/art/furniture.js, con la misma clave.
//
//   zone      'wall' (cuadros, reloj…) o 'floor' (el resto): dónde se puede poner
//   cost      chispas (0 = regalo: se entrega al entrar a la Casa)
//   size      ancho en el cuarto, como fracción del ancho del bloque de la escena (ver features/house/furniture-layout.js)
//   box       proporción del dibujo [ancho, alto] (la misma que su viewBox)
//   flat      alfombra: va pegada al piso, siempre detrás de los demás muebles del piso
//   flip      se puede voltear de izquierda a derecha (los simétricos no)
//   glow      se enciende de noche (modo oscuro) y se apaga cuando Mito duerme
//   room      el cuarto al que pertenece en la Tienda y en el regalo (content/rooms.js); se puede poner en cualquiera
//   seat      dónde se puede sentar ('sit'), acostar ('lie') o meter ('in') Mito: y = altura de la superficie y
//             x = [desde, hasta], en fracciones del dibujo (x se refleja si está volteado). Puede haber varias.
//
// Los muebles para sentarse o acostarse tienen un tamaño base grande, para que Mito quepa encima (Fase 5). Si la
// usuaria les había cambiado el tamaño, ese tamaño es relativo al base (scale) y se conserva.

export const FURNITURE_SIZE = { wide: 1, tall: 2.1 };   // ajuste del tamaño según el bloque (el alto es el del teléfono)
// Tamaño ajustable en Decorar (× el tamaño base): de min a max, con botones de step en step, y "se pega" al 100 %
// cuando queda a menos de snap (al estirar con la manija o al pellizcar).
export const FURNITURE_SCALE = { min: .6, max: 1.6, step: .1, snap: .05 };

const M = (id, name, short, zone, cost, size, box, room, extra = {}) => ({ id, name, short, zone, cost, size, box, room, ...extra });
const sit = (y, x0, x1) => ({ kind: 'sit', y, x: [x0, x1] });

export const FURNITURE = [
  M('m-rug',      'Alfombra de lunares', 'Alfombra', 'floor', 0,   .27,  [160, 66],  'bedroom', { flat: true, gift: true }),
  M('m-cushion',  'Cojín grande',        'Cojín',    'floor', 150, .075, [92, 68],   'living',  { seat: [sit(.22, .14, .86)] }),
  M('m-plant',    'Planta de interior',  'Planta',   'floor', 170, .065, [80, 134],  'living',  {}),
  M('m-lamp',     'Lámpara de pie',      'Lámpara',  'floor', 240, .055, [74, 176],  'bedroom', { flip: true, glow: true }),
  M('m-bookcase', 'Librero',             'Librero',  'floor', 320, .115, [104, 176], 'bedroom', { flip: true }),
  M('m-sofa',     'Sillón',              'Sillón',   'floor', 300, .25,  [156, 92],  'living',  { flip: true, seat: [sit(.5, .2, .8)] }),
  M('m-desk',     'Escritorio con silla', 'Escritorio', 'floor', 380, .195, [176, 150], 'bedroom', { flip: true, seat: [sit(.66, .72, .98)] }),
  M('m-bed',      'Cama',                'Cama',     'floor', 400, .36,  [196, 112], 'bedroom', { flip: true, seat: [{ kind: 'lie', y: .36, x: [.12, .9] }] }),
  M('m-picture',  'Cuadro de montañas',  'Cuadro',   'wall',  150, .1,   [96, 74],   'bedroom', {}),
  M('m-clock',    'Reloj de pared',      'Reloj',    'wall',  160, .055, [66, 66],   'kitchen', {}),
  M('m-shelf',    'Repisa con libros',   'Repisa',   'wall',  200, .13,  [136, 74],  'living',  { flip: true }),
  M('m-lights',   'Guirnalda de luces',  'Guirnalda', 'wall', 220, .21,  [200, 56],  'bedroom', { glow: true }),

];

export const findFurniture = id => FURNITURE.find(f => f.id === id) || null;
