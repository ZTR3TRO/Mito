# Proyecto Mito

App de estudio hecha con Vite y JavaScript puro (sin frameworks). Idioma del código, comentarios y textos: español.

## Arquitectura (obligatoria)

Lee `src/README.md` antes de tocar nada. Resumen:

- Solo `src/features/` toca el DOM. `content/` son datos, `core/` no conoce el dominio, `state/` no depende de nada visual.
- `main.js` solo cablea: llama a los `init()` y suscribe listeners.
- Una feature expone `init()` (registra listeners una vez) y funciones `render*` que solo pintan.
- El estado se guarda solo por `src/state/store.js`. Nunca uses `localStorage` directo.
- Los cambios de estado se hacen con `commit()`. Quien necesita repintar se suscribe al evento `state:changed` del bus (`src/core/bus.js`).
- Nada se exporta sin usar. Todo fichero debe ser alcanzable desde `main.js`. No puede haber ciclos de importación.
- `tests/architecture.test.js` comprueba esas reglas: debe seguir pasando.

## Estilo de código

- Mismo estilo que el resto: `function nombre(){`, `if(x){`, comentarios en español que explican el porqué.
- Estilos nuevos en `src/style.css`, con prefijo `.survivor-`. Reutiliza las variables CSS y fuentes existentes.
- Prohibido usar emojis en la interfaz, en textos, en comentarios o en documentos. Si hace falta un ícono, usa SVG o CSS.
- No expongas funciones de trampa en `window`.
- Textos de interfaz en español simple y directo.

## Datos reales de la app que debes reutilizar

- Preguntas: `activeCourse().questions` (de `src/features/course/course.js`). Cada una es `{ cat, q, opts, correct, exp }` con 4 opciones y `correct` como índice desde 0.
- Preparar opciones: mismas reglas que `prepareQuestion` en `src/features/quiz/session.js`, con `shuffle`, `isNumericSeries` y `keepsOptionOrder` de `src/core/utils.js`.
- Registrar respuestas: `recordAnswer(courseId, q, correct)` de `src/state/store.js`.
- Chispas: `addChispas(n)` de `src/state/store.js`.
- Mascota equipada: `getEquipped().pet`. Ids: `p-none`, `p-chick`, `p-turtle`, `p-fox`, `p-ufo`, `p-dragon`, `p-unicorn`, `p-nutria`, `p-pumpkin`, `p-bat`, `p-bee`, `p-ajolote`. Por defecto la mascota es `p-none`.
- Avatar de Mito: cualquier elemento con clase `.mascot` que contenga un `svg.mito` se pinta con `applyAvatar()` (`src/features/mascot/avatar.js`). Pone color, ropa, accesorios, sombrero, aura y mascota. Se llama solo en el evento `nav:before`, pero se puede llamar a mano.
- Navegación: `src/features/nav/router.js` y los botones `data-view` en `index.html`. Eventos del bus: `nav:before`, `nav:after` (recibe la vista), `course:changed`, `state:changed`.

## Diseño de Mito Survivor (decisiones cerradas)

- Minijuego de supervivencia estilo Vampire Survivors dentro de la app, con el banco de preguntas de la materia activa.
- Mito se ve exactamente como en el armario: se pinta como `.mascot` del DOM encima del canvas, no se redibuja en el canvas.
- Mito tiene siempre su arma principal "Chispa de Mito". Nunca baja de nivel 1.
- La mascota equipada aporta un arma secundaria propia, con cooldown independiente. Sin mascota no hay secundaria.
- Todo ataque es automático. Niveles de arma y de poder: del 1 al 8.
- Preguntas solo en tres momentos: subir de nivel, intentar revivir y romper escudos del boss.
- Respuesta correcta al subir de nivel: menú de 3 mejoras. 3 aciertos seguidos dan 1 reroll (máximo 3, no se conservan entre partidas).
- Respuesta incorrecta: se muestra la explicación, se degrada 1 nivel al elemento elegible de menor nivel. Si estaba en nivel 1, se pierde. 3 fallos seguidos quitan un nivel o poder adicional y reinician el contador. Nunca se quita la Chispa de Mito ni se oculta la mascota.
- Revivida: una vez por partida, 3 preguntas seguidas correctas, revive con 50% de vida y la misma build. Esas preguntas no dan mejoras.
- Boss final con 3 escudos. Cada acierto rompe un escudo y congela al boss 4 segundos. Con los 3 rotos, combate normal.
- Partida de 5 minutos. El boss aparece al minuto 5.
- Chispas moderadas al terminar: base 20, boss derrotado 30, 2 por pregunta correcta, 15 si no revivió.
- Las respuestas se registran en el progreso con `recordAnswer`.
- Boss genérico. Joystick móvil en una pasada posterior: en móvil, control básico por arrastre.

## Módulos de `src/features/survivor/`

- `index.js`: orquestador. Inicia, pausa, termina y conecta motor, sesión, vista y preguntas.
- `session.js`: estado lógico de la partida (estado, nivel, xp, vida, tiempo, rachas, rerolls, armas, poderes).
- `engine.js`: motor del canvas. No conoce el DOM ni las preguntas. Emite eventos hacia `index.js`.
- `view.js`: HUD, overlays (pregunta, explicación, mejoras, revivida, resumen) y sincronía de Mito DOM.
- `questions.js`: banco de preguntas sin repetir hasta agotar el catálogo.
- `weapons.js`, `pets.js`, `powers.js`: datos y reglas de armas y poderes.
- `balance.js`: todos los números de balance.

## Cómo trabajar

- Cambios pequeños y revisables. No toques archivos ajenos a la fase, salvo los mínimos para cablear.
- Después de cada fase: `npm test` y `npm run build` deben pasar. Agrega pruebas para la lógica pura.
- Si algo del plan choca con una regla de arquitectura, detente y explica el conflicto en vez de saltarte la regla.

## Mito Survivor en teléfono (decisiones cerradas)

- El uso principal es en teléfono, en vertical. Se diseña primero para 360 a 430 px de ancho y después se adapta a pantallas grandes.
- La partida se juega en pantalla completa: la arena ocupa todo el alto visible (`100dvh`) y oculta la barra superior y la barra inferior de navegación mientras dura la partida.
- La arena es vertical y no se distorsiona nunca: la escala es la misma en X y en Y. El mundo lógico mide 960 de alto y su ancho sale de la proporción real de la pantalla, limitado entre 440 y 720.
- En pantallas anchas la arena es una columna vertical centrada, con un máximo de 520 px de ancho.
- La web no puede forzar la orientación en una pestaña normal. Por eso: se diseña para vertical, se intenta bloquear con la API cuando el navegador lo permite, y si el teléfono está en horizontal durante la partida se pausa y se pide girarlo.
- La interfaz táctil usa zonas de toque de al menos 48 px, textos de al menos 14 px y respeta las áreas seguras (`env(safe-area-inset-*)`).
- Nada de contenido que quede recortado: toda tarjeta o panel debe poder desplazarse por dentro y sus botones principales deben verse siempre.
- Sin emojis. Textos en español con acentos correctos.