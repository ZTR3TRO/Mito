// Física sencilla de una pelota dentro de una caja: gravedad, rebote con pérdida de energía y reposo.
// Lógica pura, sin DOM ni reloj: el que la usa le pasa el tiempo transcurrido. Así se prueba en Node.
//
// Unidades: todo en "altos de la caja" (1 = el alto del cuarto), con y hacia abajo. Así el resultado no depende
// del tamaño de la pantalla y cambiar el tamaño de la ventana a medio vuelo no rompe nada.
// El cuerpo se mide por sus pies: { x, y } es el centro de abajo; `r` es su medio ancho y `h` su alto.
//
// Mundo: { width, floor, r, h } — width = ancho/alto de la caja; floor = y del piso (donde apoya los pies).
// Límites del cuerpo: x en [r, width − r]; y en [h, floor] (la cabeza no pasa del techo, los pies no del piso).

export const PHYSICS = {
  gravity: 5.5,           // altos de caja / s²
  floorBounce: .6,        // velocidad que conserva al rebotar en el piso
  wallBounce: .7,         // … en las paredes y el techo
  floorFriction: .85,     // velocidad lateral que conserva en cada rebote contra el piso
  rollFriction: 4,        // frenado lateral (1/s) mientras se desliza por el piso
  restSpeed: .35,         // por debajo de esto un rebote contra el piso ya no sube: se queda en el piso
  stopSpeed: .05,         // por debajo de esto, deslizándose por el piso, se detiene
  step: 1 / 120,          // paso fijo de la simulación (s)
  maxFrame: .05,          // tiempo máximo que se procesa de golpe (pestaña oculta, tirón): evita saltos
  maxSim: 6,              // a los 6 s de simulación se da por terminado sí o sí
};

const finite = n => Number.isFinite(n);

// Deja el cuerpo dentro de los límites (y sin valores raros). Sirve también para arrastrar con el dedo.
export function clampToRoom(body, world){
  const minX = world.r, maxX = Math.max(world.r, world.width - world.r);
  const minY = Math.min(world.h, world.floor), maxY = world.floor;
  const x = finite(body.x) ? Math.min(maxX, Math.max(minX, body.x)) : world.width / 2;
  const y = finite(body.y) ? Math.min(maxY, Math.max(minY, body.y)) : maxY;
  return { ...body, x, y, vx: finite(body.vx) ? body.vx : 0, vy: finite(body.vy) ? body.vy : 0 };
}

// Un paso fijo. Devuelve el cuerpo nuevo y si chocó contra algo ('floor' | 'wall' | 'ceiling') con qué rapidez.
export function step(body, world, dt = PHYSICS.step){
  const p = PHYSICS;
  let { x, y, vx, vy } = clampToRoom(body, world);
  let resting = !!body.resting;
  let hit = null, impact = 0;
  const onFloor = y >= world.floor - 1e-9;

  if(resting || (onFloor && Math.abs(vy) < p.restSpeed && vy >= 0)){
    // deslizándose por el piso
    resting = true;
    vy = 0; y = world.floor;
    vx *= Math.max(0, 1 - p.rollFriction * dt);
    x += vx * dt;
  } else {
    vy += p.gravity * dt;
    x += vx * dt;
    y += vy * dt;
    if(y >= world.floor){
      y = world.floor;
      if(vy > 0){
        hit = 'floor'; impact = vy;
        vy = -vy * p.floorBounce;
        vx *= p.floorFriction;
        if(Math.abs(vy) < p.restSpeed){ vy = 0; resting = true; }
      }
    }
    const top = Math.min(world.h, world.floor);
    if(y < top){ y = top; if(vy < 0){ hit = 'ceiling'; impact = -vy; vy = -vy * p.wallBounce; } }
  }

  const minX = world.r, maxX = Math.max(world.r, world.width - world.r);
  if(x < minX){ x = minX; if(vx < 0){ hit = hit || 'wall'; impact = Math.max(impact, -vx); vx = -vx * p.wallBounce; } }
  if(x > maxX){ x = maxX; if(vx > 0){ hit = hit || 'wall'; impact = Math.max(impact, vx); vx = -vx * p.wallBounce; } }

  const stopped = resting && Math.abs(vx) < p.stopSpeed;
  if(stopped) vx = 0;
  return { body: { x, y, vx, vy, resting, stopped, t: (body.t || 0) + dt }, hit, impact };
}

// Avanza `elapsed` segundos con pasos fijos (como mucho maxFrame de golpe). Devuelve el cuerpo y los choques.
// Si la simulación pasa de maxSim, el cuerpo se detiene en el piso.
export function advance(body, world, elapsed){
  const p = PHYSICS;
  let dt = finite(elapsed) ? Math.min(Math.max(elapsed, 0), p.maxFrame) : 0;
  let b = clampToRoom(body, world);
  b.t = body.t || 0; b.resting = !!body.resting;
  const hits = [];
  while(dt > 1e-9){
    const h = Math.min(p.step, dt);
    const r = step(b, world, h);
    b = r.body;
    if(r.hit) hits.push({ hit: r.hit, impact: r.impact });
    dt -= h;
    if(b.stopped) break;
  }
  if(b.t >= p.maxSim && !b.stopped) b = { ...b, y: world.floor, vx: 0, vy: 0, resting: true, stopped: true };
  return { body: b, hits };
}
