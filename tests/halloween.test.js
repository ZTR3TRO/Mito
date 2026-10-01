import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { WARDROBE, isSeasonalOpen } from '../src/wardrobe.js';
import { HALLOWEEN_AFTER, HALLOWEEN_DEFS, HALLOWEEN_PETS } from '../src/halloweenArt.js';

const seasonal = WARDROBE.flatMap(cat=>cat.items.filter(item=>item.seasonal).map(item=>({cat:cat.id, ...item})));

test('ventana anual: abre el 30/9 y cierra a medianoche del 1/11, hora local', ()=>{
  for(const year of [2026, 2027, 2028, 2030]){
    for(const [month, day, hour, minute, second, expected] of [
      [8,29,23,59,59,false], [8,30,0,0,0,true], [9,1,0,0,0,true],
      [9,31,23,59,59,true], [10,1,0,0,0,false], [11,31,23,59,59,false], [0,1,0,0,0,false],
    ]){
      assert.equal(isSeasonalOpen(new Date(year,month,day,hour,minute,second)), expected);
    }
  }
});

test('nueve piezas únicas, todas a 500 chispas, sin modificar los básicos', ()=>{
  assert.equal(seasonal.length, 9);
  assert.ok(seasonal.every(item=>item.cost === 500));
  assert.equal(seasonal.filter(item=>item.cat === 'aura').length, 1);
  const ids = WARDROBE.flatMap(cat=>cat.items.map(item=>item.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(WARDROBE.every(cat=>cat.items[0].cost === 0 && !cat.items[0].seasonal));
});

// Extrae grupos SVG anidados sin alterar los atributos ni los trazos.
function groups(source, attr, key){
  const marker = `<g ${attr}="${key}"`;
  const out = [];
  let start = source.indexOf(marker);
  while(start !== -1){
    const tags = /<g\b[^>]*>|<\/g>/g;
    tags.lastIndex = start;
    let depth = 0;
    for(let match; (match = tags.exec(source));){
      depth += match[0] === '</g>' ? -1 : 1;
      if(!depth){ out.push(source.slice(start, tags.lastIndex)); break; }
    }
    start = source.indexOf(marker, tags.lastIndex);
  }
  return out;
}
const normalize = svg=>svg.replace(/>\s+</g, '><').trim();

test('trazos, colores, degradados y mascotas coinciden con mito-halloween.html', async ()=>{
  const reference = await readFile(new URL('../mito-halloween.html', import.meta.url), 'utf8');
  const segments = Object.values(HALLOWEEN_AFTER).flat();
  for(const key of new Set(segments.map(([key])=>key))){
    assert.deepEqual(segments.filter(([k])=>k === key).map(([,svg])=>normalize(svg)),
      groups(reference, 'data-k', key).map(normalize), key);
  }
  for(const [key, svg] of Object.entries(HALLOWEEN_PETS)){
    assert.equal(normalize(svg), normalize(groups(reference, 'data-p', key)[0]), key);
  }
  for(const gradient of HALLOWEEN_DEFS.matchAll(/<(radialGradient|linearGradient) id="([^"]+)"[\s\S]*?<\/\1>/g)){
    assert.ok(reference.includes(gradient[0]), gradient[2]);
  }
});

test('compra automática, cobro único, cierre, persistencia y regreso al año siguiente', async ()=>{
  const RealDate = Date;
  let now = new RealDate(2026,8,30,12).getTime();
  let saved = null, writes = 0;
  globalThis.Date = class extends RealDate {
    constructor(...args){ super(...(args.length ? args : [now])); }
    static now(){ return now; }
  };
  globalThis.localStorage = { getItem:()=>saved, setItem:(_, value)=>{ saved=value; writes++; } };
  try{
    const store = await import('../src/store.js?halloween-tests');
    assert.equal(store.buyAndEquip('ropa','r-pumpkin'), false);
    store.addChispas(499);
    assert.equal(store.buyAndEquip('ropa','r-pumpkin'), false);
    store.addChispas(4501);
    assert.equal(store.buyAndEquip('sombrero','r-pumpkin'), false);
    for(const item of seasonal){
      const before = writes, balance = store.getChispas();
      assert.equal(store.buyAndEquip(item.cat, item.id), true);
      assert.equal(store.getChispas(), balance - 500);
      assert.equal(writes, before + 1);
      assert.equal(store.getEquipped()[item.cat], item.id);
      assert.equal(store.buyAndEquip(item.cat, item.id), false);
      assert.equal(store.getChispas(), balance - 500);
    }
    const backup = store.exportSave();
    now = new RealDate(2026,10,1).getTime();
    const reloaded = await import('../src/store.js?halloween-reload');
    for(const item of seasonal){
      assert.equal(reloaded.owns(item.id), true);
      assert.equal(reloaded.equipCategory(item.cat,item.id), true);
    }
    store.resetAll();
    store.addChispas(5000);
    for(const item of seasonal){
      assert.equal(store.buyAndEquip(item.cat,item.id), false);
      assert.equal(store.equipCategory(item.cat,item.id), false);
    }
    assert.equal(store.getChispas(), 5000);
    assert.equal(store.buyAndEquip('color','c-sky'), true, 'el catálogo habitual sigue disponible');
    store.importSave(backup);
    assert.equal(store.equipCategory('ropa','r-pumpkin'), true);
    now = new RealDate(2027,8,30).getTime();
    assert.equal(store.buyAndEquip('ropa','r-pumpkin'), false, 'lo comprado no se cobra otra vez');
    store.resetAll();
    store.addChispas(500);
    assert.equal(store.buyAndEquip('ropa','r-pumpkin'), true);
  } finally {
    globalThis.Date = RealDate;
    delete globalThis.localStorage;
  }
});

test('la capa tiene ambas capas y referencias únicas para cada avatar', async ()=>{
  globalThis.document = { getElementById:()=>({}) };
  try{
    const { mascotMarkup } = await import('../src/avatar.js');
    const first = mascotMarkup(['vampcape','fangs','vamphair'], 'test1');
    const second = mascotMarkup(['vampcape'], 'test2');
    assert.equal((first.match(/data-k="vampcape"/g) || []).length, 2);
    assert.ok(first.includes('href="#vcol-test1"') && first.includes('id="vcol-test1"'));
    assert.ok(second.includes('href="#vcol-test2"') && !second.includes('vcol-test1'));
    assert.ok(first.indexOf('data-k="vampcape"') < first.indexOf('fill="url(#gBody-test1)"'));
    assert.ok(first.lastIndexOf('data-k="vampcape"') > first.indexOf('class="f f-normal"'));
  } finally {
    delete globalThis.document;
  }
});
