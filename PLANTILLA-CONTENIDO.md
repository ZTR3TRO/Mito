# Plantilla para agregar contenido a Chispa (Mito)

Este archivo es la guía de "cómo me pasas la información" para que yo la agregue al sistema.
Copia la **plantilla vacía** de más abajo, llénala y me la pegas. Yo me encargo de escribir el código.

---

## 1. Dónde vive el contenido

| Archivo | Qué contiene |
|---|---|
| `src/content/atp.js` | Solo la materia de **Bioquímica del ATP** (`COURSE_ATP`) |
| `src/content/courses.js` | El registro `COURSES`. Aquí van las materias nuevas (`calculo-dietetico`, `fisiopatologia-gi`, etc.) |

Tú **nunca** escribes código. Solo me pasas la información ya redactada en el formato de abajo.

## 2. Las 5 secciones que tiene cada materia

Toda materia es un objeto con esta forma:

```js
{
  id, label,
  notes:     [],  // apuntes
  cheats:    [],  // cheat sheet (dato corto + su etiqueta)
  keypoints: [],  // puntos clave (frases resumen)
  questions: [],  // banco de preguntas de opción múltiple
}
```

### 2.1 `notes` — apuntes
Agrupados en **temas** (cada tema es una pestaña). Los temas tienen:
- `id` — **único en toda la app**, sin acentos, minúsculas, con guiones: `acalasia`, `motilidad`
- `label` — el nombre visible de la pestaña. **Texto plano, sin HTML** (el badge `<span class="tag">artículo</span>` va en el `q` del apunte, no aquí).
- `items` — lista de apuntes, cada uno con:
  - `q` — la pregunta / título del acordeón
  - `a` — la respuesta (HTML permitido, ver abajo)

### 2.2 `cheats` — cheat sheet
Tarjetas de "dato + contexto". Son para números que hay que memorizar.
- `n` — el dato corto (ej. `'114 g/sem'`, `'>70%'`)
- `l` — la etiqueta que explica el dato (una línea)

Máximo ~8 tarjetas (las que realmente valen la pena).

### 2.3 `keypoints` — puntos clave
Frases resumen numeradas automáticamente. Una idea por entrada, 1 o 2 oraciones.
Ideal: **6 a 15** entradas por materia.

### 2.4 `questions` — preguntas
- `cat` — **debe ser exactamente el `label` de un tema** (con acentos y mayúsculas iguales). Se usa para el filtro por categoría y las estadísticas.
- `q` — el enunciado
- `opts` — array de 4 opciones
- `correct` — **índice de la opción correcta empezando en 0** (0 = primera, 1 = segunda, 2 = tercera, 3 = cuarta)
- `exp` — la explicación de por qué es correcta (1 o 2 oraciones)

Las preguntas pueden ser fáciles, intermedias o difíciles. Se permiten **4 opciones siempre**.

## 3. HTML permitido dentro de `q`, `a`, `keypoints`, `cheats`

El texto se inserta directo en la app, así que puedes usar etiquetas:

- `<strong>texto</strong>` → **negrita** (úsalo en el dato clave de cada frase)
- `<em>texto</em>` → *cursiva* (nombres de bacterias, genes)
- `<ul><li>…</li></ul>` → lista con viñetas
- `<ol><li>…</li></ol>` → lista numerada
- `<span class="tag">artículo</span>` → insignia al lado de una pregunta

**No uses** `<h1>`–`<h6>`, `style=`, `class=` (salvo `tag`), ni tablas: se descuadran.

## 4. Reglas que sigue el sistema (para que yo no las rompa)

1. Los `id` de los temas son **únicos en toda la app** (comparten namespace entre todas las materias).
2. Cada `cat` de pregunta debe existir como `label` de tema, **idéntico** (mismas tildes, mayúsculas y espacios). Ej. si el label es `Anabolismo / Catabolismo`, el cat va con los espacios. Por eso los `label` no llevan HTML.
3. `correct` es un índice 0-based y siempre dentro del rango de `opts` (siempre 4 opciones, sin repetidas).
4. No se modifican `id` de cursos ya existentes: se rompe el progreso guardado en el navegador (`localStorage`, clave `chispa-atp-v4`).
5. Los datos que ya están cargados no se tocan; solo se agregan nuevos bloques.

## 5. PLANTILLA VACÍA (copia, llena y pégame)

```markdown
## ACCIÓN
[ ] Nueva materia
[ ] Agregar a materia existente: (nombre de la materia)

## DATOS GENERALES
- id: (solo si es materia nueva; minúsculas, guiones)
- label: (solo si es materia nueva)

## TEMAS (notes)
### Tema 1
- id: (ej. acalasia)
- label: (ej. Acalasia y Espasmos Esofágicos)
  - q: ¿Qué es la acalasia y qué la produce?
    a: Es un trastorno donde el <strong>EEI no se relaja</strong>. Se produce por daño del <strong>plexo mientérico</strong>.
  - q: ¿Cómo se diagnostica y trata la acalasia?
    a: La <strong>manometría esofágica</strong> es el estándar de oro. Opciones:
      <ul>
        <li>Dilatación neumática.</li>
        <li>Miotomía de Heller.</li>
      </ul>

### Tema 2
- id: (otro id único)
- label: (otro label)
  - q: (otra pregunta)
    a: (otra respuesta con <strong> en el dato importante)

## CHEAT SHEET (cheats)
- n: 114 g/sem
  l: carne roja · límite en EII
- n: >70%
  l: degluciones ineficaces · motilidad esofágica ineficaz

## PUNTOS CLAVE (keypoints)
- En la acalasia el EEI <strong>no se relaja</strong> al tragar.
- Ya <strong>no se recomienda restringir la fibra</strong> en la EII.
- El <strong>tabaquismo</strong> es el factor de riesgo más controlable para Crohn.

## PREGUNTAS (questions)
1. cat: (label exacto de un tema, ej. Acalasia y Espasmos Esofágicos)
   q: (enunciado)
   opts: [opción A, opción B, opción C, opción D]
   correct: (0 | 1 | 2 | 3)
   exp: (explicación breve)

2. cat: (label exacto de un tema)
   q: (enunciado)
   opts: [opción A, opción B, opción C, opción D]
   correct: (0 | 1 | 2 | 3)
   exp: (explicación breve)
```

## 6. EJEMPLO LISTO PARA USAR (así me lo pasas)

```markdown
## ACCIÓN
[ ] Agregar a materia existente: Fisiopatología Gastrointestinal y Nutrición

## TEMAS (notes)
### Tema 1
- id: este
- label: Esteatosis Hepática
  - q: ¿Qué es la esteatosis hepática?
    a: Acumulación de <strong>grasa en el hepatocito</strong>. Se define por más del <strong>5% de lípidos</strong> en el hepatocito. Puede ser macrovesicular o microvesicular.
  - q: ¿Qué causas tiene?
    a: <ul>
      <li>Esteatosis no alcohólica: obesidad, diabetes 2, síndrome metabólico.</li>
      <li>Esteatosis alcohólica.</li>
      <li>Fármacos: corticoides, amiodarona, metformina.</li>
    </ul>

## CHEAT SHEET (cheats)
- n: >5%
  l: lípidos en hepatocito · diagnóstico de esteatosis
- n: AST/ALT <1
  l: esteatosis no alcohólica · ALT suele ser mayor

## PUNTOS CLAVE (keypoints)
- La esteatosis se define por más del <strong>5% de grasa</strong> en el hepatocito.
- En la esteatosis no alcohólica la <strong>ALT es mayor que la AST</strong>; en la alcohólica suele ser al revés.

## PREGUNTAS (questions)
1. cat: Esteatosis Hepática
   q: ¿Qué porcentaje de lípidos en el hepatocito confirma una esteatosis hepática?
   opts: [1%, 3%, 5%, 10%]
   correct: 2
   exp: El diagnóstico histológico se establece con más del 5% de lípidos dentro del hepatocito.
2. cat: Esteatosis Hepática
   q: En la esteatosis no alcohólica, ¿qué relación suele existir entre AST y ALT?
   opts: [AST > ALT, AST = ALT, ALT > AST, Ambas siempre están elevadas por igual]
   correct: 2
   exp: En la esteatosis no alcohólica la ALT suele ser mayor que la AST; en la alcohólica ocurre lo contrario.
```

## 7. Qué hago yo al recibirlo

1. Valido ids únicos, `cat` coincidentes e índices de `correct`.
2. Escribo el bloque en `src/content/courses.js` (o `src/content/atp.js` si es ATP).
3. Corro `npm run build` para confirmar que no se rompe nada.
4. Te paso un resumen de qué se agregó.

## 8. Casos especiales (dímelo en el propio mensaje)

- **Quiero reescribir un tema completo** → escribe `## ACCIÓN: Reemplazar tema` y pega el tema nuevo completo.
- **Quiero borrar algo** → escribe `## ACCIÓN: Borrar` y di el `id` del tema o el texto de la pregunta.
- **Tengo apuntes sueltos, no están organizados** → pégalos tal cual, yo los organizo en temas y te muestro cómo quedaron antes de guardarlos.
