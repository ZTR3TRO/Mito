// Datos de nutrición de la comida de la Casa (datos puros). Es lo único que Mito "enseña" al comer: aparece en
// la tarjeta "Dato de nutrición" después de cada alimento.
//
// Para revisarlos o corregirlos basta con editar el texto de aquí. Reglas:
//   - correctos y sencillos, sin matices de cantidad ni promesas de salud;
//   - de 90 caracteres como mucho, para que la tarjeta quepa en un teléfono de 360 px (lo comprueba npm test);
//   - referencias de México (Guías Alimentarias 2023: el Plato del Bien Comer).
// La clave es el id del alimento en content/food.js.

export const FOOD_FACTS = {
  'f-apple':  'La manzana tiene pectina, una fibra soluble que ayuda a sentirte satisfecho.',
  'f-carrot': 'La zanahoria tiene betacaroteno, que el cuerpo convierte en vitamina A.',
  'f-banana': 'El plátano aporta potasio, que ayuda a que músculos y nervios funcionen bien.',
  'f-yogurt': 'El yogur natural aporta proteína y calcio, que ayuda a cuidar tus huesos.',
  'f-egg':    'El huevo tiene proteína de alto valor biológico: los 9 aminoácidos esenciales.',
  'f-oats':   'La avena es un cereal integral: aporta fibra y te mantiene con energía por más tiempo.',
  'f-rice':   'Arroz y frijol se complementan: juntos dan una proteína más completa.',
  'f-plate':  'El Plato del Bien Comer recomienda que verduras y frutas llenen la mitad del plato.',
};
