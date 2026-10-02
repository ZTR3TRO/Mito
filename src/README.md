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
  content/         datos puros. No importan nada del proyecto, ni del DOM ni del store
    courses.js       registro COURSES (materias)
    atp.js           contenido de Bioquímica del ATP
    wardrobe.js      catálogo de prendas (WARDROBE)
    messages.js      frases de la mascota
    art/             SVG y piezas de dibujo
      base.js         cuerpo y caras de Mito
      halloween.js    piezas de Halloween
      secrets.js      mascotas y auras secretas
      skins.js        piezas por categoría de ropa
  state/           la partida guardada en localStorage. Solo se accede por store.js
    store.js         barril: la API pública
    core.js          objeto de estado, carga, guardado, commit
    economy.js       chispas
    inventory.js     prendas compradas y equipadas
    progress.js      historial, fallos, racha
    preferences.js   tema y materia activa
    backup.js        exportar, importar y reiniciar
  features/        la lógica de la app. Una carpeta por dominio
    nav/router.js      cambia de vista y actualiza la barra lateral
    theme/index.js     tema claro/oscuro
    course/            materia activa y sus vistas: course, home, keys, notes
    quiz/              ronda, sesión, reparto y fallos: index, session,
                       view, review, counts
    shop/              tienda y tienda de temporada: index, season
    progress/          vista de progreso y copia de seguridad: view, backup
    mascot/            la mascota entera: avatar, auras, face, effects, speech
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
| Cambiar cómo se cobra o se guarda | `state/economy.js`, `state/inventory.js` |
| Añadir una vista nueva | carpeta en `features/`, un `init()` y un caso en `nav/router.js` |
