# Estructura de `src/`

Mito se organiza por capas. La regla que lo explica todo es una sola:

> **Solo `features/` toca el DOM.** `content/` son datos, `core/` no conoce el
> dominio y `state/` no depende de nada visual.

```
src/
  main.js          entrypoint. Solo cablea: llama a los init() y suscribe listeners.
  style.css        estilos
  core/            primitivas transversales, sin dominio
    bus.js           bus de eventos (on/emit)
    dom.js           $, $$, byId, el, clear, delegate, setText
    utils.js         funciones puras: shuffle, escapeHtml, isNumericSeries, fechas
    gesture.js       clasificador de gestos (picar, cosquillas, acariciar, agarrar); umbrales en GESTURE
    physics.js       física de rebote dentro de una caja (gravedad, rebote, reposo)
  content/         datos puros. No importan nada del proyecto, ni del DOM ni del store
    courses.js       registro COURSES (materias)
    atp.js           contenido de Bioquímica del ATP
    wardrobe.js      catálogo de prendas (WARDROBE)
    messages.js      frases de la mascota
    house.js         frases de la Casa y reacciones de cada mascota
    food.js          catálogo de comida de la Casa (precio, cuánto llena, frase)
    nutrition.js     los datos de nutrición de cada alimento (en un solo lugar, para revisarlos)
    furniture.js     catálogo de muebles de la Casa (zona pared/piso, precio, tamaño, cuarto, superficies para Mito)
    rooms.js         los cuartos de la Casa, en orden (Cuarto, Baño, Sala, Cocina) y la acción de cada uno
    art/             SVG y piezas de dibujo
      base.js         cuerpo y caras de Mito
      halloween.js    piezas de Halloween
      secrets.js      mascotas y auras secretas
      house.js        piezas de la Casa: párpados y bocas (copia recortada del cuerpo), polvito, esponja y espuma
      food.js         dibujos de la comida
      furniture.js    dibujos de los muebles y sus degradados (FURNITURE_DEFS, se monta una vez)
      skins.js        piezas por categoría de ropa
  state/           la partida guardada en localStorage. Solo se accede por store.js
    store.js         barril: la API pública
    core.js          objeto de estado, carga, guardado, commit
    economy.js       chispas
    inventory.js     prendas compradas y equipadas
    progress.js      historial, fallos, racha
    preferences.js   tema, materia activa y pistas de la Casa, de la charola y de Decorar
    house.js         necesidades de Mito en la Casa (hambre, limpieza, energía, ánimo): cálculo con la hora y constantes NEEDS;
                     y dónde está Mito (cuarto, piso o sobre un mueble)
    pantry.js        la charola: comida comprada (se compra por unidad y se gasta al comer)
    decor.js         los muebles: comprados (una vez cada uno), colocados ({ room, zona, u, v, flip, scale }) y el regalo de cada cuarto
    backup.js        exportar, importar y reiniciar
  features/        la lógica de la app. Una carpeta por dominio
    nav/router.js      cambia de vista y actualiza la barra lateral
    theme/index.js     tema claro/oscuro
    course/            materia activa y sus vistas: course, home, keys, notes
    quiz/              ronda, sesión, reparto y fallos: index, session,
                       view, review, counts
    shop/              tienda (con las secciones Comida y Muebles) y tienda de temporada: index, season
    house/             la Casa: index (cableado), layout (bloque aprobado escalado, piso y luz; puro),
                       room (dibuja cada cuarto: pared, piso, ventana y luz), nav (la cámara entre cuartos:
                       flechas, indicadores, la orilla y el parallax), gestures (dedo y ratón), motion
                       (arrastrar y lanzar), reactions (cara, frases y mascota), needs (cómo se notan sus
                       necesidades), sleep (dormir), bath (bañar), food (la charola y comer), decor (los
                       muebles y el modo Decorar), furniture-layout (dónde y de qué tamaño va cada mueble,
                       límites y escala; puro)
    progress/          vista de progreso y copia de seguridad: view, backup
    mascot/            la mascota entera: avatar, auras, face, effects, speech
    pwa/update.js      service worker: registro y actualización segura (solo en producción)
    easter.js          el egg de los 10 toques
```

## Convenciones

- **Una feature expone `init()`**, que registra sus listeners una sola vez, y
  funciones `render*` que solo pintan. `main.js` es quien las llama.
- **Las features no se importan entre sí.** Si dos necesitan hablarse, se
  escriben en el bus (`core/bus.js`) y quien reacciona se suscribe. Así se puede
  mover un fichero sin romper el resto.
- **El estado se muta en sitio y se guarda con `commit()`**, que persiste y
  emite `state:changed`. Quien necesita repintarse se suscribe a ese evento.
- **Nada se exporta sin usar.** Si un símbolo solo lo usa su propio fichero, no
  se exporta.

## Guardas

`tests/architecture.test.js` comprueba estas siete reglas sobre `src/`, así que
un fichero suelto, un ciclo o un export muerto rompen `npm test`:

1. la raíz de `src/` solo tiene `main.js`
2. `content/` no importa fuera de `content/`
3. `core/` no importa de `features/`, `state/` ni `content/`
4. `state/` no importa de `features/`
5. no hay ciclos de importación
6. todo fichero de `src/` es alcanzable desde `main.js`
7. no hay exports muertos

## Dónde tocar según lo que quieras cambiar

| Quiero… | Fichero |
|---|---|
| Añadir o cambiar una materia | `content/courses.js` o `content/atp.js` (ver `PLANTILLA-CONTENIDO.md`) |
| Añadir una prenda a la tienda | `content/wardrobe.js` |
| Cambiar el dibujo de Mito | `content/art/base.js` y `features/mascot/avatar.js` |
| Añadir un aura o mascota secreta | `content/art/secrets.js` y `content/art/skins.js` |
| Cambiar lo que dice la mascota | `content/messages.js` |
| Cambiar lo que dicen Mito y la mascota en la Casa | `content/house.js` |
| Ajustar los umbrales de los gestos o la física | `core/gesture.js` (`GESTURE`), `core/physics.js` (`PHYSICS`) |
| Ajustar cómo bajan y suben las necesidades de Mito | `state/house.js` (`NEEDS`) |
| Cambiar la comida (precio, cuánto llena) | `content/food.js` |
| Revisar o corregir los datos de nutrición | `content/nutrition.js` |
| Cambiar cómo se cobra o se guarda | `state/economy.js`, `state/inventory.js` |
| Añadir una vista nueva | carpeta en `features/`, un `init()` y un caso en `nav/router.js` |
