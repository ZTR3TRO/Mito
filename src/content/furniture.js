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

export const FURNITURE_SIZE = { wide: 1, tall: 2.1 };   // ajuste del tamaño según el bloque (el alto es el del teléfono)

const M = (id, name, short, zone, cost, size, box, extra = {}) => ({ id, name, short, zone, cost, size, box, ...extra });

export const FURNITURE = [
  M('m-rug',      'Alfombra de lunares', 'Alfombra', 'floor', 0,   .27,  [160, 66],  { flat: true, gift: true }),
  M('m-cushion',  'Cojín grande',        'Cojín',    'floor', 150, .075, [92, 68],   {}),
  M('m-plant',    'Planta de interior',  'Planta',   'floor', 170, .065, [80, 134],  {}),
  M('m-lamp',     'Lámpara de pie',      'Lámpara',  'floor', 240, .055, [74, 176],  { flip: true, glow: true }),
  M('m-bookcase', 'Librero',             'Librero',  'floor', 320, .115, [104, 176], { flip: true }),
  M('m-sofa',     'Sillón',              'Sillón',   'floor', 300, .185, [156, 92],  { flip: true }),
  M('m-desk',     'Escritorio con silla', 'Escritorio', 'floor', 380, .195, [176, 150], { flip: true }),
  M('m-bed',      'Cama',                'Cama',     'floor', 400, .25,  [196, 112], { flip: true }),
  M('m-picture',  'Cuadro de montañas',  'Cuadro',   'wall',  150, .1,   [96, 74],   {}),
  M('m-clock',    'Reloj de pared',      'Reloj',    'wall',  160, .055, [66, 66],   {}),
  M('m-shelf',    'Repisa con libros',   'Repisa',   'wall',  200, .13,  [136, 74],  { flip: true }),
  M('m-lights',   'Guirnalda de luces',  'Guirnalda', 'wall', 220, .21,  [200, 56],  { glow: true }),
];

export const findFurniture = id => FURNITURE.find(f => f.id === id) || null;
