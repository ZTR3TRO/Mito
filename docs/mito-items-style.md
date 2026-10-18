# Guía de estilo de objetos de Mito

Mito **no se rediseña**: cuerpo, cara, antenas y colores de las pieles existentes se quedan igual
(salvo Lava, ver abajo). Esta guía fija cómo se dibuja todo lo que se le pone encima.
La referencia es Mito base con la piel **Menta**. Lienzo: `viewBox="0 0 150 150"`; el cuerpo es el
círculo-ovalado `M75 18c-30 0-52 24-52 54 0 32 24 54 52 54s52-22 52-54c0-30-22-54-52-54Z`
(centro ≈ 75,72; radio ≈ 52).

## 1. Lenguaje visual

| Elemento | Regla |
|---|---|
| Relleno | Degradado de **2 tonos** (claro arriba-izquierda → oscuro abajo-derecha), como `gBody`. Nada de colores planos salvo detalles pequeños. |
| Brillo | **Un** highlight por objeto: elipse/trazo blanco a ~.4–.6 de opacidad, arriba-izquierda (como el de Mito en `52,42`). |
| Contorno | Grosor **2.4** (el del cuerpo de Mito en `base.js`), `stroke-linejoin="round"`, `stroke-linecap="round"`. Color: un tono **oscuro del propio color del objeto**, no el de la piel y **nunca casi negro**. El contorno de Mito es suave (su `--stroke` es solo ~15 % más oscuro que su relleno): el del objeto debe sentirse igual. Regla práctica: tomar el color medio del relleno y bajarle ~15–20 % de luminosidad manteniendo el matiz. Detalles interiores: 1.2–2. |
| Sombra de contacto | Donde el objeto toca a Mito, una sombra suave: trazo/elipse negra a `.14–.2` de opacidad, desplazada 2 px hacia abajo, recortada con `cpBody` si cae dentro del círculo. Sin `filter` (no se puede recolorear ni va bien en miniaturas). |
| Paleta | Cada objeto define sus colores (no depende de la piel). Excepción: las **manos**, que usan `gBody` / `var(--stroke)` para ser de la piel. |

Los degradados nuevos van en `DEFS` (`content/art/base.js`) con id `g<Nombre>`; ids de patrones `p<Nombre>`.

## 2. Proporción y silueta

> **La armadura A ("Plata") es la referencia de proporción y acabado de toda la ropa.**
> Sus hombreras sobresalen poco, el metal tiene un brillo parecido al de Mito y no añade cuerpo bajo la esfera.
> Cada prenda nueva se compara contra ella (misma página `dev/items.html`, claro y oscuro) antes de enseñarse.

Reglas de proporción (el diámetro de Mito es ≈ 104 unidades: x 23–127):

- Una prenda **puede sobresalir del contorno, pero poco**: como máximo **10–15 % del diámetro** (≈ 10–15 unidades) por cada lado.
- **Nada de agregar torso ni volumen debajo de la esfera.** La ropa no baja de y ≈ 130 (el cuerpo termina en 126). Nada de faldas, conos, canastas ni colas largas.
- Las prendas se ciñen a la esfera: bordes **curvos** que la siguen; se recortan con `cpBody` lo que quede dentro del círculo.
- **Cada forma debe leerse como lo que es a primera vista.** Si se parece a otra cosa (alas de murciélago, tenazas, bracitos, flotador, maceta), está mal y se rehace.
- Sin zigzags ni festones puntiagudos en capas o solapas; pliegues suaves.
- **Excepción explícita — la capa (`cape`):** conserva su forma original de domo **detrás del cuerpo**, que baja hasta y≈148 (22 unidades bajo la esfera). Es la única prenda que puede pasar de y≈130, porque va detrás y es el diseño elegido. El collar con broche, en cambio, sigue la regla (se queda dentro de la esfera).

Reglas de silueta:

1. Toda prenda debe **asomar un poco fuera del contorno circular** (≥ 3 px en al menos un lado, dentro del máximo anterior) o tener **volumen visible** (solapas, pliegues, grosor).
2. **Prohibidas las franjas planas horizontales dentro del círculo** (se leen como babero o cinturón). Un borde dentro del círculo siempre debe ser curvo y seguir la esfera.
3. Las prendas de cuello (bufanda, suéter, gorguera, capucha) **siguen la curva** del cuerpo y tienen grosor visible por los lados.
4. Nada tapa **boca ni ojos**: la zona de cara es `x 44–106, y 70–118`. Una prenda puede entrar en ella solo por debajo de `y 112`.

## 3. Legibilidad sobre TODAS las pieles

Cada objeto se revisa sobre las 11 pieles, en claro y oscuro, con la página `dev/items.html` (sección 6), junto a la armadura A.
Pieles críticas: **Oro líquido** (clara y amarilla), **Chocolate**, **Lava** y **Materia oscura** (oscuras).

- Si un objeto se pierde sobre alguna piel, se le añade **contorno más marcado o sombra de contacto** que lo separe del cuerpo; **no** se cambia su color según la piel.
- Objetos oscuros (audífonos, estetoscopio, birrete, suéter morado…) llevan un **filo claro** (trazo blanco `.35–.5` por dentro del contorno) para leerse sobre Lava/Materia oscura.
- Objetos amarillos/dorados llevan contorno marrón-ocre profundo para leerse sobre Oro líquido.

### Contraste de cara en pieles oscuras
Ojos (`#2b2140`) y boca se pierden sobre Lava, Materia oscura y, en menor grado, Chocolate. Regla:
sobre pieles con luminosidad de `--body` < 0.2 (hoy: Lava, Materia oscura; Chocolate se revisa) la cara
gana un **halo claro** (contorno de ~1.6 en `#fff` a `.85` o ojos/boca en tono claro) aplicado **solo
como capa de esa piel** (`skins.js`), sin tocar las caras base ni el resto de la piel.

## 4. Orden de capas (fijo)

```
1. FONDO            alas, capa (cape / vampcape), mochila trasera, capucha (hoodie-back)
2. CUERPO           cuerpo + efecto de piel (fx) + brillos + mejillas
3. CARA             ojos, boca (normal/happy/sad/excited)
4. ROPA FRONTAL     gafas, bata, delantal, sudadera, armadura, corbata, bufanda, moño, suéter, disfraces
5. ACCESORIOS FRONT estetoscopio, libro, teléfono, mochila delantera (tirantes), audífonos (parte delantera), carro
6. SOMBREROS        corona, birrete, chef, mago, calabaza, cabello de vampiro
7. ANTENAS          ver sección 5
```

Notas:
- Hoy `SEGS` pinta las antenas **antes** de los sombreros. La regla de la tabla de abajo manda; si una
  fila dice "encima", la antena se mueve en `SEGS` tras el sombrero.
- Los objetos de dos partes (diadema de audífonos, mochila, capucha) se parten en **dos segmentos con la misma
  clave**: una parte trasera (capa 1) y una delantera (capa 4/5). Es el patrón que ya usa `bag`.
- Las **manos** (libro, teléfono) van **encima del objeto** y reciben la misma capa de efecto de piel que
  el cuerpo (`sk.over`), para que en Oro/Aurora/Lava se vean iguales que el cuerpo.
- La capa de vampiro se inserta después de `cape` y `stetho` (`HALLOWEEN_AFTER`); no se altera.

## 5. Antenas y sombreros (regla explícita por sombrero)

Antenas: izquierda `ant-l` (amarilla), derecha `ant-r` (lila), central `ant-c` (rosa, la más alta).
Las antenas se pintan **antes** que los sombreros, así que el sombrero siempre queda encima de ellas.
La regla por sombrero es **un dato** (`HAT_ANTENNAS` en `content/art/hats.js`), no clases CSS:
`hidden` = no se pinta; `dx, dy` = se desplaza. `mascotMarkup` la aplica a cada antena al armar el SVG
(avatar y miniaturas por igual). Un sombrero nuevo sin entrada deja las antenas como están.

| Sombrero (`k`) | `ant-c` | `ant-l` / `ant-r` |
|---|---|---|
| Corona (`crown`), Birrete (`grad`) | se ve, desplazada (−3, −7) | se ven, abiertas (∓8, +2) |
| Gorro de chef (`chef`), Mago (`wizard`) | **oculta** | se ven, abiertas (∓8, +2) |
| Calabaza (`pumpkinhat`), Cabello de vampiro (`vamphair`) | **oculta** | **ocultas** |
| Sin sombrero / cualquier otro | base | base |

Accesorios de cabeza que no son sombrero:
- **Audífonos**: la diadema pasa **entre** las antenas: tramo trasero (capa 1, detrás del cuerpo) y
  tramo delantero (capa 5) con las antenas entre ambos. Las almohadillas, delante.
- Con sombrero + audífonos equipados a la vez, el sombrero va encima de la diadema.

## 6. Herramienta de revisión

- `dev/items.html` (solo `pnpm dev`; no entra en `pnpm build`): rejilla de **cada objeto × cada piel**,
  claro y oscuro. Parámetros: `?cat=ropa|accesorio|sombrero`, `?theme=light|dark`, `?still` (sin
  animaciones), `?face=happy|sad|excited`.
- `node dev/shoot.mjs <carpeta>` (con `pnpm dev` corriendo): captura las 6 combinaciones categoría × modo.
  Referencia **antes de cambios de arte**: `docs/shots/ref/`. Capturas de cada lote: `docs/shots/<lote>/`.

## 7. Reglas de implementación

- **No cambiar ids ni claves** (`id`, `k`) de objetos o pieles; solo el nombre visible si se pide.
- Un objeto = una definición en `SEGS` (con su clave). Sin duplicar lógica de anclaje/capas entre objetos:
  si dos piezas comparten geometría (p. ej. lado izquierdo/derecho) se usa `<use>` con un `<g id>` por instancia (patrón de `vcol`).
- Animaciones en `style.css`, con clase por objeto, y **todas** envueltas/anuladas en
  `@media (prefers-reduced-motion: reduce)`. En miniaturas (`svg.th`) ya se anulan.
- No tocar objetos fuera de la lista de cada lote (gafas, moño, corbata, carro, libro, teléfono,
  sombreros), salvo el orden de capas de las antenas con los sombreros y la mano del libro/teléfono (fx).
- Mantener `#wingP`, la inserción de Halloween tras `cape`/`stetho` y los dos segmentos de `bag`; si hace
  falta reestructurar, se explica antes.

## 8. Piel Lava (c-lava) — objetivo

Base de roca **gris/negra** (no café), grietas con degradado **naranja → amarillo** con pulso lento,
resplandor naranja alrededor y brasas subiendo. Cara con contraste suficiente (sección 3). Los
`defaults` de color (`body/stroke/highlight`) son el único cambio de datos permitido; el `id` y `fx` no cambian.
