// Clasificador de gestos sobre un objeto (picar, cosquillas, acariciar, agarrar y soltar).
// Es lógica pura: no toca el DOM ni lee el reloj. Quien lo usa le pasa los eventos del puntero
// con su tiempo (ms) y posición (px), y recibe los gestos reconocidos. Así se prueba en Node.
//
// Cómo se distinguen (los umbrales están en GESTURE, en un solo lugar, para ajustarlos en un teléfono real):
// - Picar: soltar rápido (≤ tapMaxMs) sin moverse más de slopPx. Se reconoce al soltar, sin esperar a ver si hay más.
// - Cosquillas: tickleTaps toques o más, con ≤ tickleGapMs entre uno y otro. El picado "se convierte" en
//   cosquillas al llegar al tercer toque, así nunca hay retraso.
// - Acariciar: moverse más de slopPx ANTES de longPressMs, sin salir del objeto, hasta sumar strokePx de recorrido.
//   Si el dedo sale del objeto, es un barrido y no cuenta.
// - Agarrar: mantener quieto longPressMs (el que lo usa llama a tick() cuando se cumple el tiempo). Luego se arrastra.
// - Soltar: la velocidad sale de los últimos velocityMs de movimiento, con un tope de maxThrowPxMs.

export const GESTURE = {
  slopPx: 10,           // movimiento que todavía cuenta como "quieto"
  tapMaxMs: 250,        // un toque dura como mucho esto
  tickleGapMs: 350,     // pausa máxima entre toques para que sigan siendo cosquillas
  tickleTaps: 3,        // toques seguidos para que sean cosquillas
  longPressMs: 300,     // mantener quieto esto = agarrar
  strokePx: 60,         // recorrido sobre el objeto para que sea una caricia (el que lo usa lo escala al tamaño)
  velocityMs: 80,       // ventana para medir la velocidad al soltar
  maxThrowPxMs: 3,      // tope de velocidad al lanzar (px/ms)
};

// Gestos que devuelve: { type: 'poke' | 'tickle' | 'pet' | 'petEnd' | 'grab' | 'drag' | 'drop', ... }
//   poke   { x, y, taps }      tickle { x, y, taps }
//   pet    { x, y, strokes }   (una vez por cada strokePx recorridos)   petEnd { strokes }
//   grab   { x, y }   drag { x, y }   drop { x, y, vx, vy } (px/ms)
export function createGestureClassifier(options = {}){
  const o = { ...GESTURE, ...options };
  let state = 'idle';            // idle | pressing | stroking | swipe | grabbing
  let start = null;              // { t, x, y }
  let last = null;
  let samples = [];              // [{ t, x, y }] recientes, para la velocidad
  let path = 0, strokes = 0;
  let lastTapAt = -Infinity, taps = 0;

  const far = (x, y) => Math.hypot(x - start.x, y - start.y) > o.slopPx;
  const keep = (t, x, y) => {
    samples.push({ t, x, y });
    while(samples.length > 2 && t - samples[0].t > o.velocityMs) samples.shift();
  };

  function velocity(){
    if(samples.length < 2) return { vx: 0, vy: 0 };
    const a = samples[0], b = samples[samples.length - 1], dt = b.t - a.t;
    if(dt <= 0) return { vx: 0, vy: 0 };
    let vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt;
    const speed = Math.hypot(vx, vy);
    if(speed > o.maxThrowPxMs){ vx *= o.maxThrowPxMs / speed; vy *= o.maxThrowPxMs / speed; }
    return { vx, vy };
  }

  return {
    get state(){ return state; },
    options: o,   // se puede ajustar en vivo (p. ej. strokePx según el tamaño del objeto)

    down(t, x, y){
      state = 'pressing';
      start = last = { t, x, y };
      samples = [{ t, x, y }];
      path = 0; strokes = 0;
      return [];
    },

    // `inside`: si el puntero sigue sobre el objeto (solo importa para las caricias).
    move(t, x, y, inside = true){
      if(state === 'idle' || !start) return [];
      const out = [];
      keep(t, x, y);
      if(state === 'pressing' && far(x, y)){
        if(t - start.t >= o.longPressMs){ state = 'grabbing'; out.push({ type: 'grab', x: start.x, y: start.y }); }
        else state = 'stroking';
      }
      if(state === 'stroking'){
        if(!inside) state = 'swipe';
        else {
          path += Math.hypot(x - last.x, y - last.y);
          while(path >= (strokes + 1) * o.strokePx){ strokes++; out.push({ type: 'pet', x, y, strokes }); }
        }
      }
      if(state === 'grabbing') out.push({ type: 'drag', x, y });
      last = { t, x, y };
      return out;
    },

    // Se llama cuando pasa longPressMs desde down() (con un temporizador). Si sigue quieto, agarra.
    tick(t){
      if(state === 'pressing' && t - start.t >= o.longPressMs){
        state = 'grabbing';
        return [{ type: 'grab', x: last.x, y: last.y }];
      }
      return [];
    },

    up(t, x, y){
      const out = [];
      if(state === 'pressing' && !far(x, y) && t - start.t < o.longPressMs){
        // Un toque largo (entre tapMaxMs y longPressMs) no es un toque rápido: reinicia la cadena de cosquillas.
        const quick = t - start.t <= o.tapMaxMs;
        taps = quick && start.t - lastTapAt <= o.tickleGapMs ? taps + 1 : 1;
        lastTapAt = quick ? t : -Infinity;
        out.push({ type: taps >= o.tickleTaps ? 'tickle' : 'poke', x, y, taps });
      } else if(state === 'grabbing'){
        keep(t, x, y);
        out.push({ type: 'drop', x, y, ...velocity() });
      } else if(state === 'stroking' && strokes > 0){
        out.push({ type: 'petEnd', strokes });
      }
      if(state !== 'pressing') taps = 0, lastTapAt = -Infinity;
      state = 'idle';
      start = null;
      return out;
    },

    // El navegador canceló el puntero (llamada, cambio de pestaña…): si estaba agarrado, se suelta quieto.
    cancel(){
      const out = state === 'grabbing' && last ? [{ type: 'drop', x: last.x, y: last.y, vx: 0, vy: 0 }] : [];
      state = 'idle';
      start = null;
      return out;
    },
  };
}
