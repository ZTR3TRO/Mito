// Comida de la Casa (datos puros): se compra en la Tienda por unidad y se gasta al dársela a Mito.
// Los datos de nutrición están aparte, en content/nutrition.js (para revisarlos en un solo lugar).
//
//   name   en la Tienda y en la tarjeta del dato      short  en la charola (cabe en ~60 px)
//   cost   chispas por unidad                         fill   cuánto sube el hambre (de 0 a 100)
//   bite   cómo se come: crunch (migajas), soft, creamy (se relame)
//   say    lo que dice Mito al comerlo (≤ 34 caracteres, como todas las frases de la Casa)
// Los dibujos están en content/art/food.js, con la misma clave.

import { FOOD_FACTS } from './nutrition.js';

export const FOOD_MAX = 99;   // unidades de un mismo alimento como mucho

const F = (id, name, short, cost, fill, bite, say) => ({ id, name, short, cost, fill, bite, say, fact: FOOD_FACTS[id] });

export const FOODS = [
  F('f-apple',  'Manzana',            'Manzana',        10, 25, 'crunch', '¡Crunch! Qué jugosa 🍎'),
  F('f-carrot', 'Zanahoria',          'Zanahoria',      10, 25, 'crunch', '¡Crunch crunch! 🥕'),
  F('f-banana', 'Plátano',            'Plátano',        15, 30, 'soft',   'Mmm, dulcecito 🍌'),
  F('f-yogurt', 'Yogur natural',      'Yogur',          20, 35, 'creamy', 'Qué cremosito 😋'),
  F('f-egg',    'Huevo cocido',       'Huevo',          25, 40, 'soft',   '¡Me da mucha fuerza! 💪'),
  F('f-oats',   'Avena con fruta',    'Avena',          35, 45, 'creamy', 'Calientita y rica 🥣'),
  F('f-rice',   'Arroz con frijoles', 'Arroz y frijol', 40, 50, 'soft',   '¡Sabe a comida de casa! 😋'),
  F('f-plate',  'Plato completo',     'Plato',          50, 60, 'soft',   '¡Un plato completo! 🌟'),
];

export const findFood = id => FOODS.find(f => f.id === id) || null;
