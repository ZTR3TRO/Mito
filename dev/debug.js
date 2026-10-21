// Panel de depuración de la Casa (solo en desarrollo, con ?debug). No entra al build de producción: main.js lo
// importa solo si import.meta.env.DEV, y Vite elimina esa rama al compilar.
//   - fijar las necesidades (hambre, limpieza, energía, ánimo) y atajos (todo lleno, muy sucio, con sueño, triste)
//   - adelantar el tiempo: corre hacia atrás la hora guardada, como si hubiera pasado ese tiempo (con la app cerrada)
//   - dormirlo desde hace un rato, para probar la recarga
//   - la charola: añadir comida sin gastar chispas, o vaciarla
import { state, commit } from '../src/state/core.js';
import { needsAt, NEEDS } from '../src/state/house.js';
import { getPantry } from '../src/state/pantry.js';
import { FOODS, FOOD_MAX } from '../src/content/food.js';

const KEYS = [['hunger', 'Hambre'], ['clean', 'Limpieza'], ['energy', 'Energía'], ['mood', 'Ánimo']];
const MIN = 60e3, HOUR = 3600e3;

const now = ()=> Date.now();
const current = ()=> needsAt(state.house, now());
function save(h){ state.house = h; commit(); paint(); }
function setNeeds(values, sleepSince){
  const h = current();
  save({ ...h, at: now(), needs: { ...h.needs, ...values }, sleepSince: sleepSince === undefined ? h.sleepSince : sleepSince });
}
// Adelantar el tiempo: lo guardado pasa a ser de hace `ms`, así al leerlo "ahora" ya pasó ese tiempo.
function advance(ms){
  const h = current();
  save({ ...h, at: h.at - ms, sleepSince: h.sleepSince === null ? null : h.sleepSince - ms });
}

const panel = document.createElement('div');
panel.id = 'houseDebug';
panel.innerHTML = `
  <style>
    #houseDebug{ position:fixed; right:12px; top:12px; z-index:2000; width:250px; padding:12px; border-radius:14px;
      background:rgba(30,22,48,.92); color:#fff; font:600 12px/1.35 Nunito, system-ui, sans-serif; box-shadow:0 10px 30px rgba(0,0,0,.35); }
    #houseDebug h4{ margin:0 0 8px; font-size:13px; display:flex; justify-content:space-between; align-items:center; }
    #houseDebug label{ display:grid; grid-template-columns:62px 1fr 34px; gap:6px; align-items:center; margin:4px 0; }
    #houseDebug input[type=range]{ width:100%; }
    #houseDebug .row{ display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; }
    #houseDebug button{ font:inherit; font-size:11px; padding:4px 7px; border-radius:8px; border:0; cursor:pointer; background:#ff5da2; color:#fff; }
    #houseDebug button.alt{ background:#4a3d66; }
    #houseDebug .now{ margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,.15); color:#d9d0ec; font-weight:700; }
    #houseDebug.min > :not(h4){ display:none; }
  </style>
  <h4>🛠️ Casa · depuración <button class="alt" data-x="min">—</button></h4>
  ${KEYS.map(([k, label]) => `<label>${label}<input type="range" min="0" max="100" step="1" data-k="${k}"><span data-v="${k}"></span></label>`).join('')}
  <div class="row"><button data-x="apply">Aplicar</button><button class="alt" data-x="full">Todo lleno</button>
    <button class="alt" data-x="dirty">Muy sucio</button><button class="alt" data-x="sleepy">Con sueño</button><button class="alt" data-x="hungry">Con hambre</button><button class="alt" data-x="sad">Triste</button></div>
  <div class="row"><b style="width:100%">Adelantar el tiempo</b>
    <button class="alt" data-t="10">+10 min</button><button class="alt" data-t="60">+1 h</button><button class="alt" data-t="360">+6 h</button><button class="alt" data-t="1440">+24 h</button></div>
  <div class="row"><button class="alt" data-x="sleep30">Dormido hace 30 min</button><button class="alt" data-x="wake">Despierto</button></div>
  <div class="row"><b style="width:100%">Charola</b>
    <button class="alt" data-x="food5">+5 de cada alimento</button><button class="alt" data-x="food1">+1 manzana</button><button class="alt" data-x="foodClear">Vaciar</button></div>
  <div class="now" data-now></div>
  <div class="now" data-pantry></div>`;
document.body.appendChild(panel);

function paint(){
  const h = current();
  KEYS.forEach(([k])=>{
    const input = panel.querySelector(`[data-k="${k}"]`);
    if(document.activeElement !== input) input.value = Math.round(h.needs[k]);
    panel.querySelector(`[data-v="${k}"]`).textContent = Math.round(h.needs[k]);
  });
  const p = getPantry();
  panel.querySelector('[data-pantry]').textContent = 'Charola: ' + (Object.keys(p).length ? FOODS.filter(f => p[f.id]).map(f => `${f.short} ${p[f.id]}`).join(' · ') : 'vacía');
  panel.querySelector('[data-now]').textContent = h.sleepSince !== null
    ? `Dormido desde hace ${Math.round((now() - h.sleepSince) / MIN)} min` : 'Despierto';
}
panel.addEventListener('input', e=>{
  const k = e.target.dataset.k;
  if(k) panel.querySelector(`[data-v="${k}"]`).textContent = e.target.value;
});
panel.addEventListener('click', e=>{
  const x = e.target.dataset.x, t = e.target.dataset.t;
  const low = NEEDS.floor;
  if(t) return advance(Number(t) * MIN);
  if(x === 'min') return panel.classList.toggle('min');
  if(x === 'apply') return setNeeds(Object.fromEntries(KEYS.map(([k]) => [k, Number(panel.querySelector(`[data-k="${k}"]`).value)])));
  if(x === 'full') return setNeeds({ hunger: 100, clean: 100, energy: 100, mood: 100 }, null);
  if(x === 'dirty') return setNeeds({ clean: low });
  if(x === 'sleepy') return setNeeds({ energy: 25 });
  if(x === 'sad') return setNeeds({ mood: 25 });
  if(x === 'hungry') return setNeeds({ hunger: 25 });
  if(x === 'food5' || x === 'food1'){   // sin gastar chispas
    const p = getPantry();
    (x === 'food1' ? FOODS.slice(0, 1) : FOODS).forEach(f => { p[f.id] = Math.min(FOOD_MAX, (p[f.id] || 0) + (x === 'food1' ? 1 : 5)); });
    state.pantry = p; commit(); return paint();
  }
  if(x === 'foodClear'){ delete state.pantry; commit(); return paint(); }
  if(x === 'sleep30'){ const h = current(); return save({ ...h, sleepSince: now() - 30 * MIN, at: now() - 30 * MIN }); }
  if(x === 'wake') return setNeeds({}, null);
});
paint();
setInterval(paint, 2000);
console.info('[Mito] panel de depuración de la Casa activo (?debug). Hora:', new Date().toLocaleTimeString(), '· 1 h =', HOUR, 'ms');
